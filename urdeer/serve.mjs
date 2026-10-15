import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { realpath, stat } from 'node:fs/promises';
import { dirname, extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const host = '127.0.0.1';
const portText = process.argv[2] ?? '8765';
const port = Number(portText);

if (process.argv.length > 3 || !/^\d+$/.test(portText) || !Number.isInteger(port) || port < 1 || port > 65535) {
  console.error('端口必须是1～65535之间的整数。用法：node serve.mjs [端口]');
  process.exit(1);
}

let root;
try {
  root = await realpath(dirname(fileURLToPath(import.meta.url)));
} catch (error) {
  console.error(`无法读取网页目录：${error.message}`);
  process.exit(1);
}

const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.bin': 'application/octet-stream',
  '.onnx': 'application/octet-stream',
  '.wasm': 'application/wasm',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/plain; charset=utf-8',
};

function withinRoot(path) {
  return path === root || path.startsWith(`${root}${sep}`);
}

function reply(request, response, status, message, headers = {}) {
  const body = `${message}\n`;
  response.writeHead(status, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Cache-Control': 'no-cache',
    'X-Content-Type-Options': 'nosniff',
    ...headers,
  });
  response.end(request.method === 'HEAD' ? undefined : body);
}

const server = createServer(async (request, response) => {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    reply(request, response, 405, '本地静态服务器只支持GET与HEAD请求。', { Allow: 'GET, HEAD' });
    return;
  }

  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url ?? '/', `http://${host}`).pathname);
  } catch {
    reply(request, response, 400, '请求地址格式不正确。');
    return;
  }

  if (pathname.includes('\0') || pathname.includes('\\')) {
    reply(request, response, 400, '请求地址包含不允许的字符。');
    return;
  }

  const parts = pathname.split('/').filter(Boolean);
  if (parts.some((part) => part.startsWith('.'))) {
    reply(request, response, 403, '不允许访问隐藏文件或上级目录。');
    return;
  }

  let target = resolve(root, `.${pathname}`);
  if (!withinRoot(target)) {
    reply(request, response, 403, '请求文件必须位于网页目录内。');
    return;
  }

  try {
    const initialStats = await stat(target);
    if (initialStats.isDirectory()) target = resolve(target, 'index.html');
    target = await realpath(target);
    if (!withinRoot(target)) {
      reply(request, response, 403, '不允许通过链接访问网页目录外的文件。');
      return;
    }
    const fileStats = await stat(target);
    if (!fileStats.isFile()) {
      reply(request, response, 404, '未找到可访问的文件。');
      return;
    }
    response.writeHead(200, {
      'Content-Type': contentTypes[extname(target).toLowerCase()] ?? 'application/octet-stream',
      'Content-Length': fileStats.size,
      'Cache-Control': 'no-cache',
      'X-Content-Type-Options': 'nosniff',
    });
    if (request.method === 'HEAD') {
      response.end();
      return;
    }
    const stream = createReadStream(target);
    stream.on('error', (error) => {
      console.error(`读取静态文件失败：${error.message}`);
      response.destroy();
    });
    response.on('close', () => stream.destroy());
    stream.pipe(response);
  } catch (error) {
    if (error.code === 'ENOENT' || error.code === 'ENOTDIR') {
      reply(request, response, 404, '文件不存在。请确认网页、vendor和models目录已完整放在同一目录中。');
    } else if (error.code === 'EACCES' || error.code === 'EPERM') {
      reply(request, response, 403, '没有读取该文件的权限。');
    } else {
      console.error(`处理静态文件请求失败：${error.message}`);
      reply(request, response, 500, '读取文件失败，请查看运行服务器的终端。');
    }
  }
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`端口${port}已被占用。可改用其他端口，例如：node serve.mjs ${port === 65535 ? 8765 : port + 1}`);
  } else if (error.code === 'EACCES') {
    console.error(`没有权限监听${host}:${port}，请改用其他端口。`);
  } else {
    console.error(`本地服务器无法启动：${error.message}`);
  }
  process.exitCode = 1;
});

server.listen(port, host, () => {
  console.log(`urdeer已启动：http://localhost:${port}`);
  console.log(`备用地址：http://${host}:${port}`);
  console.log('仅允许当前电脑访问。按Ctrl+C停止服务器。');
});
