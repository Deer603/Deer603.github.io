// 同步现行条目的正文、目录与分享信息。
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import { refreshShareMetadata } from "../../tools/share-metadata.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const version = "20261126-editorial";
const homeVersion = "20261126-home-settings";
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
let pages = 0, missing = 0;

function updateArtwork(source) {
  return source
    .replace(/assets\/(?:wikipedia-logo-v2\.svg\.webp|weijiba-favicon-64\.webp)(?:\?v=[\w-]+)?(?=")/g, "assets/weijiba-favicon-64.webp?v=wei")
    .replace(/assets\/(?:weijiba-logo\.png|weijiba-logo-520\.webp)(?:\?v=[\w-]+)?(?=")/g, "assets/weijiba-logo-520.webp?v=wei")
    .replace(/assets\/(?:weijiba-project\.png|weijiba-project-144\.webp)(?:\?v=[\w-]+)?(?=")/g, "assets/weijiba-project-144.webp?v=wei");
}

function updateShell(source, prefix, legacy = false) {
  let next = updateArtwork(source).replace(/^[ \t]*<script src="[^"]*(?:entry-routes|entry-writing|entry-data|focus-scope|article)\.js(?:\?[^"]*)?"><\/script>\r?\n/gm, "");
  const scripts = ["entry-routes", ...(legacy ? ["entry-writing", "entry-data"] : []), "focus-scope", "article"];
  next = next.replace(/<\/body>/, scripts.map(name => `    <script src="${prefix}${name}.js?v=${version}"></script>`).join("\n") + "\n  </body>");
  next = next.replace(/article\.css\?v=[\w-]+/g, `article.css?v=${version}`);
  next = next.replace(/<form\b(?=[^>]*\bid="article-search")[^>]*>/, tag =>
    `${tag.slice(0, -1).replace(/\saction="[^"]*"/, "")} action="${prefix}index.html#search">`);
  next = next.replace(/<input\b(?=[^>]*\bid="article-search-input")[^>]*>/, tag =>
    `${tag.slice(0, -1).replace(/\sname="[^"]*"/, "")} name="q">`);
  next = next.replace(/(<main class="article-main" id="article-content")(?: tabindex="-1")?>/, '$1 tabindex="-1">');
  next = next.replace(/(<nav class="toc" id="toc")(?: aria-label="[^"]*")?>/, '$1 aria-label="本页目录">');
  next = next.replace(/(<aside class="main-menu"[^>]*)(>)/, (_, attributes) => attributes.includes(" inert") ? `${attributes}>` : `${attributes} inert>`);
  next = next.replace(/(aria-label="更多个人工具">)•••/, '$1<svg class="ui-icon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/></svg>');
  return next;
}

function generate(source, slug, prefix, legacy = false) {
  const rendered = context.window.WEIJIBA_RENDER_ENTRY(slug);
  if (!rendered) throw new Error(`词条缺少正文：${slug}`);
  if (!/<article id="top">[\s\S]*?<\/article>/.test(source) || !/<nav class="toc" id="toc"[^>]*>[\s\S]*?<\/nav>/.test(source)) {
    throw new Error(`词条结构无法定位：${slug}`);
  }
  let next = source.replace(/(<article id="top">)[\s\S]*?(<\/article>)/, () => `<article id="top">${rendered.articleHtml}\n        </article>`);
  next = next.replace(/(<nav class="toc" id="toc"[^>]*>)[\s\S]*?(<\/nav>)/, (_, start, end) => `${start}${rendered.tocHtml}${end}`);
  if (!next.includes("<!-- share-metadata:start -->")) {
    next = next.replace(/<title>[^<]*<\/title>/, () => `<title>${escape(rendered.title)}｜魏鸡百科</title>`);
    next = next.replace(/<meta name="description" content="[^"]*">/, () => `<meta name="description" content="${escape(rendered.description)}">`);
  }
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
const legacy = generate(template, "kunkun", "", true);
if (legacy !== template) plans.push({ file: path.join(root, "article.html"), next: legacy });
const homeFile = path.join(root, "index.html");
const home = fs.readFileSync(homeFile, "utf8");
let nextHome = updateArtwork(home).replace(/^[ \t]*<script src="(?:entry-writing|entry-data|focus-scope)\.js(?:\?[^"]*)?"><\/script>\r?\n/gm, "");
nextHome = nextHome.replace(/((?:entry-routes|script)\.js|style\.css)\?v=[\w-]+/g, `$1?v=${homeVersion}`);
nextHome = nextHome.replace(/([ \t]*)<script src="script\.js/, `$1<script src="focus-scope.js?v=${homeVersion}"></script>\n$1<script src="script.js`);
if (nextHome !== home) plans.push({ file: homeFile, next: nextHome });

if (!check) {
  for (const { file, next } of plans) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, next);
  }
  if (!skipShare) refreshShareMetadata();
}
console.log(JSON.stringify({ pages, changed: plans.length, missing, check, version, shareUpdated: !check && !skipShare }));
if (check && plans.length) process.exitCode = 1;
