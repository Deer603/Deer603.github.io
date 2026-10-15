// 从现有词库生成正文与目录，保留各页外围结构，不删除任何词条。
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import { refreshShareMetadata } from "../../tools/share-metadata.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const version = "20261015-pages";
const check = process.argv.includes("--check");
const skipShare = process.argv.includes("--skip-share");
const context = {
  history: {}, URL, URLSearchParams,
  window: { location: { pathname: "/weijiba/", search: "", hash: "", href: "https://deer603.github.io/weijiba/" } },
  document: { querySelectorAll: () => [], querySelector: () => null }
};
vm.createContext(context);
for (const name of ["entry-routes.js", "entry-writing.js", "entry-data.js"]) {
  vm.runInContext(fs.readFileSync(path.join(root, name), "utf8"), context, { filename: name });
}
const template = fs.readFileSync(path.join(root, "article.html"), "utf8");
const escape = value => String(value).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const plans = [];
let pages = 0, missing = 0, archived = 0;
const registeredPaths = new Set(Object.values(context.window.WEIJIBA_ENTRY_PATHS));

function updateShell(source, prefix, legacy = false) {
  let next = source.replace(/^[ \t]*<script src="[^"]*(?:entry-routes|entry-writing|entry-data|focus-scope|article)\.js(?:\?[^"]*)?"><\/script>\r?\n/gm, "");
  const scripts = ["entry-routes", ...(legacy ? ["entry-writing", "entry-data"] : []), "focus-scope", "article"];
  next = next.replace(/<\/body>/, scripts.map(name => `    <script src="${prefix}${name}.js?v=${version}"></script>`).join("\n") + "\n  </body>");
  next = next.replace(/article\.css\?v=[\w-]+/g, `article.css?v=${version}`);
  next = next.replace(/(<aside class="main-menu"[^>]*)(>)/, (_, attributes) => attributes.includes(" inert") ? `${attributes}>` : `${attributes} inert>`);
  next = next.replace(/(aria-label="更多个人工具">)•••/, '$1<svg class="ui-icon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/></svg>');
  return next;
}

function generate(source, slug, prefix, legacy = false) {
  const rendered = context.window.WEIJIBA_RENDER_ENTRY(slug);
  if (!rendered) throw new Error(`词条缺少正文：${slug}`);
  if (!/<article id="top">[\s\S]*?<\/article>/.test(source) || !/<nav class="toc" id="toc">[\s\S]*?<\/nav>/.test(source)) {
    throw new Error(`词条结构无法定位：${slug}`);
  }
  let next = source.replace(/(<article id="top">)[\s\S]*?(<\/article>)/, () => `<article id="top">${rendered.articleHtml}\n        </article>`);
  next = next.replace(/(<nav class="toc" id="toc">)[\s\S]*?(<\/nav>)/, () => `<nav class="toc" id="toc">${rendered.tocHtml}</nav>`);
  next = next.replace(/<title>[^<]*<\/title>/, `<title>${escape(rendered.title)}｜魏鸡百科</title>`);
  next = next.replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${escape(rendered.description)}">`);
  return updateShell(next, prefix, legacy);
}

// 先完成全部内存生成与内容检查，再开始写入，避免中途发现坏词条造成部分更新。
for (const [slug, title] of Object.entries(context.window.WEIJIBA_ENTRY_PATHS)) {
  const directory = path.resolve(root, title);
  if (path.dirname(directory) !== root) throw new Error(`Unexpected route path: ${title}`);
  const file = path.join(directory, "index.html");
  const exists = fs.existsSync(file);
  const previous = exists ? fs.readFileSync(file, "utf8") : null;
  const source = previous ?? template.replace(/(src|href)="(?![a-z][a-z\d+.-]*:|\/|#)([^\"]+)"/gi, '$1="../$2"');
  const next = generate(source, slug, "../");
  pages++;
  if (!exists) missing++;
  if (next !== previous) plans.push({ file, next });
}
// 旧版本留下的物理地址继续可访问，避免把未登记词条显示成默认人物。
for (const item of fs.readdirSync(root, { withFileTypes: true })) {
  if (!item.isDirectory() || registeredPaths.has(item.name)) continue;
  const file = path.join(root, item.name, "index.html");
  if (!fs.existsSync(file)) continue;
  const source = fs.readFileSync(file, "utf8");
  if (!source.includes('class="article-main"')) continue;
  const matching = Object.entries(context.window.WEIJIBA_ENTRY_CATALOG).find(([, entry]) => entry.title === item.name);
  let next;
  if (matching) {
    next = generate(source, matching[0], "../");
  } else {
    const title = escape(item.name);
    const description = escape(`${item.name}是旧版词条，当前词库暂未收录其正文。可返回魏鸡百科索引查找相关内容。`);
    next = source.replace(/<article id="top">[\s\S]*?<\/article>/, `<article id="top"><header class="article-heading"><h1>${title}</h1></header><p class="article-tagline">魏鸡百科旧词条</p><section class="article-section" id="unavailable"><h2>正文暂不可用</h2><p>这个地址来自旧版词条，当前词库暂未收录对应正文。我们保留原地址，方便你继续查找。</p><p><a href="../index.html#mega-index">浏览基础词条索引</a> · <a href="../index.html">返回魏鸡百科首页</a></p></section></article>`);
    next = next.replace(/<nav class="toc" id="toc">[\s\S]*?<\/nav>/, '<nav class="toc" id="toc"><a href="#unavailable">正文暂不可用</a></nav>');
    next = next.replace(/<title>[^<]*<\/title>/, `<title>${title}｜魏鸡百科旧词条</title>`);
    next = next.replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${description}">`);
    next = updateShell(next, "../");
    archived++;
  }
  if (next !== source) plans.push({ file, next });
}
const legacy = generate(template, "kunkun", "", true);
if (legacy !== template) plans.push({ file: path.join(root, "article.html"), next: legacy });
const homeFile = path.join(root, "index.html");
const home = fs.readFileSync(homeFile, "utf8");
let nextHome = home.replace(/^[ \t]*<script src="(?:entry-writing|entry-data|focus-scope)\.js(?:\?[^"]*)?"><\/script>\r?\n/gm, "");
nextHome = nextHome.replace(/((?:entry-routes|script)\.js|style\.css)\?v=[\w-]+/g, `$1?v=${version}`);
nextHome = nextHome.replace(/([ \t]*)<script src="script\.js/, `$1<script src="focus-scope.js?v=${version}"></script>\n$1<script src="script.js`);
if (nextHome !== home) plans.push({ file: homeFile, next: nextHome });

if (!check) {
  for (const { file, next } of plans) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, next);
  }
  if (!skipShare) refreshShareMetadata();
}
console.log(JSON.stringify({ pages, archived, changed: plans.length, missing, check, version, shareUpdated: !check && !skipShare }));
if (check && plans.length) process.exitCode = 1;
