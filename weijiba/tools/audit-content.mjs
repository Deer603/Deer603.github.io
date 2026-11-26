import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const scripts = ["entry-routes.js", "entry-writing.js", "entry-data.js"];
export function loadCatalogue(route = "/weijiba/", render = false) {
  const article = { innerHTML: "" }, toc = { innerHTML: "" };
  const context = {
    URLSearchParams, history: {},
    window: { location: { pathname: route, search: "" }, scrollTo() {}, addEventListener() {}, setTimeout() {} },
    document: {
      querySelectorAll: () => [],
      querySelector: selector => render ? ({ ".article-main article": article, "#toc": toc }[selector] || null) : null
    }
  };
  context.window.history = context.history;
  vm.createContext(context);
  for (const script of scripts) vm.runInContext(fs.readFileSync(path.join(root, script), "utf8"), context, { filename: script });
  return { ...context, article, toc };
}

const context = loadCatalogue();
const site = context.window;
const catalog = site.WEIJIBA_ENTRY_CATALOG;
const all = Object.entries(catalog);
const paths = site.WEIJIBA_ENTRY_PATHS;
assert.deepEqual(Object.keys(catalog).sort(), Object.keys(paths).sort(), "Catalogue and routes differ");
const routeDirectories = new Set(Object.values(paths));
assert.equal(routeDirectories.size, all.length, "Duplicate article path");
for (const directory of fs.readdirSync(root, { withFileTypes: true })) {
  if (directory.isDirectory() && !["assets", "tools"].includes(directory.name)) {
    assert(routeDirectories.has(directory.name), `Unexpected article directory: ${directory.name}`);
  }
}
assert(!all.some(([slug]) => slug.startsWith("odd-")), "Template variants returned to the catalogue");
for (const { slug, title } of site.WEIJIBA_BASE_ENTRY_RECORDS) {
  assert.equal(paths[slug], title, `Invalid index record: ${title}`);
}

const paragraphs = new Map();
const introductions = new Set();
let totalCharacters = 0, internalLinks = 0;
for (const [slug, entry] of all) {
  assert(entry.title && entry.description && entry.overview.length, `${slug}: missing introduction`);
  const prose = [...entry.overview, ...entry.sections.flatMap(({ paragraphs, items = [], table }) => [
    ...paragraphs, ...items, ...(table ? [table.caption, ...table.headers, ...table.rows.flat()] : [])
  ])];
  const serialized = JSON.stringify(entry);
  for (const banned of ["伪基百科", "本索引为", "魏鸡百科自动扩写的鹿群派生条目", "道具同样会被角色化", "先让词语站稳", "Undefined", "undefined", "[object Object]"]) {
    assert(!serialized.includes(banned), `${slug}: stale filler or placeholder: ${banned}`);
  }
  assert.equal(new Set(entry.sections.map(s => s.id)).size, entry.sections.length, `${slug}: duplicate anchors`);
  if (entry.extensions?.length) assert(!entry.sections.some(s => s.id === "extensions"), `${slug}: duplicate extension anchor`);
  for (const target of [...entry.related, ...(entry.extensions || []).map(e => e.slug)]) {
    internalLinks++;
    assert(catalog[target], `${slug}: missing target ${target}`);
  }
  for (const [, href] of entry.externalLinks || []) assert(/^https?:\/\//.test(href), `${slug}: invalid external URL`);
  const page = path.join(root, paths[slug], "index.html");
  assert(fs.existsSync(page), `${slug}: missing physical route`);
  const html = fs.readFileSync(page, "utf8").replaceAll("\r\n", "\n");
  const scripts = Array.from(html.matchAll(/<script src="\.\.\/([^"?]+)\?v=[^"]+"/g), match => match[1]);
  assert.deepEqual(scripts, ["entry-routes.js", "focus-scope.js", "article.js"], `${slug}: unexpected article scripts`);
  assert(html.includes("weijiba-favicon-64.webp"), `${slug}: missing favicon`);
  const rendered = site.WEIJIBA_RENDER_ENTRY(slug);
  assert(html.includes(`<article id="top">${rendered.articleHtml}\n        </article>`), `${slug}: stale static body`);
  assert(html.includes(`<nav class="toc" id="toc" aria-label="本页目录">${rendered.tocHtml}</nav>`), `${slug}: stale table of contents`);
  introductions.add(entry.overview[0]);
  for (const paragraph of prose) {
    for (const [, reference] of paragraph.matchAll(/\[(\d+)\]/g)) {
      assert(entry.references[Number(reference) - 1], slug + ": citation has no source");
    }
    assert.equal(typeof paragraph, "string", `${slug}: paragraph is not text`);
    totalCharacters += paragraph.length;
    paragraphs.set(paragraph, (paragraphs.get(paragraph) || 0) + 1);
  }
}

const maxRepeat = Math.max(...paragraphs.values());
assert(maxRepeat <= 30, `Shared body paragraph repeated ${maxRepeat} times`);
assert(introductions.size >= all.length - 3, "Introductions should be entry-specific");

const samples = ["鹿群", "困困", "罗宇伦", "何意味", "鹿群科技话题", "雅可比速问速答", "603视界", "KunCode", "DeerPhotos"];
for (const title of samples) {
  const match = all.find(([, entry]) => entry.title === title);
  assert(match, `Sample ${title} not in catalogue`);
  const [slug, entry] = match;
  const rendered = site.WEIJIBA_RENDER_ENTRY(slug);
  assert(rendered.articleHtml.includes(`<h1>${entry.title}</h1>`), `${title}: wrong rendered heading`);
  assert(entry.references.length, `${title}: missing sources`);
  assert(rendered.tocHtml.includes('href="#references"'), `${title}: missing sources in TOC`);
}
assert(catalog.kunkun.overview.join("").includes("詹绍源"));
assert(catalog["luo-yulun"].overview.join("").includes("Roylyl"));
const deerPhotosSlug = all.find(([, entry]) => entry.title === "DeerPhotos")[0];
assert.match(site.WEIJIBA_RENDER_ENTRY(deerPhotosSlug).articleHtml,
  /href="https:\/\/github\.com\/Roylyl\/DeerPhotos(?:\/)?"/i);

console.log(JSON.stringify({
  entries: all.length, indexedEntries: site.WEIJIBA_BASE_ENTRY_RECORDS.length,
  internalLinks, distinctIntroductions: introductions.size, maximumRepeatedParagraph: maxRepeat,
  totalBodyCharacters: totalCharacters, renderedSamples: samples.length,
  status: "PASS"
}, null, 2));
