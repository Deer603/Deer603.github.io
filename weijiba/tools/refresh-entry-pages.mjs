// Mechanical update of shared script tags in the existing static route shells.
// Does not create/delete routes or touch files outside weijiba.
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const version = "20260923-21";
const check = process.argv.includes("--check");
let pages = 0, changed = 0, missing = 0;

// Restore missing physical pages from the same article shell. Existing pages are
// never overwritten with the template: they only receive the script-tag update.
const context = {
  history: {},
  window: { location: { pathname: "/weijiba/", search: "" }, scrollTo() {}, addEventListener() {}, setTimeout() {} },
  document: { querySelectorAll: () => [] }
};
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root, "entry-routes.js"), "utf8"), context);
const template = fs.readFileSync(path.join(root, "article.html"), "utf8");
const escape = value => value.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
for (const title of Object.values(context.window.WEIJIBA_ENTRY_PATHS)) {
  const directory = path.resolve(root, title);
  if (path.dirname(directory) !== root) throw new Error(`Unexpected route path: ${title}`);
  const file = path.join(directory, "index.html");
  if (fs.existsSync(file)) continue;
  missing++;
  if (!check) {
    const page = template.replace(/(src|href)="(?![a-z][a-z\d+.-]*:|\/|#)([^\"]+)"/gi, '$1="../$2"')
      .replace(/<title>[^<]*<\/title>/, `<title>${escape(title)}—魏鸡百科，困困的百科全书</title>`)
      .replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${escape(title)}—魏鸡百科词条。">`);
    fs.mkdirSync(directory);
    fs.writeFileSync(file, page);
  }
}
function visit(directory) {
  for (const item of fs.readdirSync(directory, { withFileTypes: true })) {
    if (item.name.startsWith(".") || ["node_modules", "tools"].includes(item.name)) continue;
    const file = path.join(directory, item.name);
    if (item.isDirectory()) visit(file);
    else if (item.name.endsWith(".html")) {
      const source = fs.readFileSync(file, "utf8");
      if (!source.includes("entry-data.js")) continue;
      pages++;
      let next = source.replace(/^\s*<script src="[^"]*entry-writing\.js[^"]*"><\/script>\r?\n/gm, "");
      next = next.replace(/([ \t]*)<script src="([^"\n]*?)entry-data\.js(?:\?[^"\n]*)?"><\/script>/g,
        (_, indent, prefix) => `${indent}<script src="${prefix}entry-writing.js?v=${version}"></script>\n${indent}<script src="${prefix}entry-data.js?v=${version}"></script>`);
      next = next.replace(/((?:entry-routes|article|script)\.js)\?v=[\w-]+/g, `$1?v=${version}`);
      next = next.replace(/(article\.css)\?v=[\w-]+/g, `$1?v=${version}`);
      if (next !== source) {
        changed++;
        if (!check) fs.writeFileSync(file, next);
      }
    }
  }
}
visit(root);
console.log(JSON.stringify({ pages, changed, missing, check, version }));
if (check && (changed || missing)) process.exitCode = 1;
