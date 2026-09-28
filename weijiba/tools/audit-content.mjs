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
assert.equal(all.length, 3039, "Do not lose existing catalogue entries");
assert.equal(site.WEIJIBA_BASE_ENTRY_RECORDS.length, 1000);
assert.equal(site.WEIJIBA_GENERATED_ENTRY_RECORDS.length, 2000);
assert.equal(site.WEIJIBA_WRITING.cards.size, 100);
assert(site.WEIJIBA_WRITING.glossary.size > 500);
assert.equal(new Set([...site.WEIJIBA_WRITING.cards.values()].map(card => card.crooked)).size, 100,
  "Each recurring subject needs its own sideways observation");

const paragraphs = new Map();
const introductions = new Set();
let totalCharacters = 0, internalLinks = 0;
for (const [slug, entry] of all) {
  assert(entry.title && entry.description && entry.overview.length, `${slug}: missing introduction`);
  const prose = [...entry.overview, ...entry.sections.flatMap(s => s.paragraphs)];
  const serialized = JSON.stringify(entry);
  for (const banned of ["伪基百科", "本索引为", "魏鸡百科自动扩写的鹿群派生条目", "道具同样会被角色化", "先让词语站稳", "Undefined", "undefined", "[object Object]"]) {
    assert(!serialized.includes(banned), `${slug}: stale filler or placeholder: ${banned}`);
  }
  assert.equal(new Set(entry.sections.map(s => s.id)).size, entry.sections.length, `${slug}: duplicate anchors`);
  if (slug.startsWith("odd-")) assert(entry.sections.some(s => s.id === "crooked-observation"), `${slug}: missing genre-specific observation`);
  if (entry.extensions?.length) assert(!entry.sections.some(s => s.id === "extensions"), `${slug}: duplicate extension anchor`);
  for (const target of [...entry.related, ...(entry.extensions || []).map(e => e.slug)]) {
    internalLinks++;
    assert(catalog[target], `${slug}: missing target ${target}`);
  }
  for (const [, href] of entry.externalLinks || []) assert(/^https?:\/\//.test(href), `${slug}: invalid external URL`);
  const page = path.join(root, site.WEIJIBA_ENTRY_PATHS[slug], "index.html");
  assert(fs.existsSync(page), `${slug}: missing physical route`);
  const html = fs.readFileSync(page, "utf8");
  assert(html.indexOf("entry-routes.js") < html.indexOf("entry-writing.js"), `${slug}: route load order`);
  assert(html.indexOf("entry-writing.js") < html.indexOf("entry-data.js"), `${slug}: writing load order`);
  assert(/entry-data\.js\?v=20260923-21/.test(html), `${slug}: stale cache version`);
  assert(html.includes("wikipedia-logo-v2.svg.webp"), `${slug}: missing favicon`);
  introductions.add(entry.overview[0]);
  for (const paragraph of prose) {
    assert.equal(typeof paragraph, "string", `${slug}: paragraph is not text`);
    totalCharacters += paragraph.length;
    paragraphs.set(paragraph, (paragraphs.get(paragraph) || 0) + 1);
  }
}

const maxRepeat = Math.max(...paragraphs.values());
assert(maxRepeat <= 30, `Shared body paragraph repeated ${maxRepeat} times`);
assert(introductions.size >= all.length - 3, "Introductions should be entry-specific");

const samples = ["困困", "詹绍源", "罗宇伦", "Roylyl", "MacBook", "MacBook操作手册", "MacBook委员会", "MacBook档案", "ChatGPT拟人化", "雅可比", "太阳", "贝斯", "USB-C", "603视界", "KunCode", "夏炜城的寻根之旅", "技术原理", "IDE"];
for (const title of samples) {
  const match = all.find(([, entry]) => entry.title === title);
  assert(match, `Sample ${title} not in catalogue`);
  const [slug, entry] = match;
  const rendered = loadCatalogue(`/weijiba/${encodeURIComponent(site.WEIJIBA_ENTRY_PATHS[slug])}/`, true);
  assert(rendered.article.innerHTML.includes(`<h1>${entry.title}</h1>`), `${title}: wrong rendered heading`);
  assert(rendered.article.innerHTML.includes(entry.overview[0].slice(0, 20)), `${title}: stale static body`);
  assert(rendered.toc.innerHTML.includes("资料来源"), `${title}: missing TOC`);
}
assert(catalog.kunkun.overview.join("").includes("詹绍源"));
assert(catalog.kunkun.sections.some(s => s.id === "people-aside"));
assert(all.find(([, entry]) => entry.title === "吃什么")?.[1].sections.some(s => s.id === "crooked-observation"));
assert(catalog["luo-yulun"].overview.join("").includes("Roylyl"));

const formats = site.WEIJIBA_GENERATED_ENTRY_RECORDS.filter(r => r.topic === "MacBook");
assert.equal(new Set(formats.map(r => catalog[r.slug].sections.map(s => s.title).join("/"))).size, 20, "Derivative forms should have different structure");

console.log(JSON.stringify({
  entries: all.length, baseEntries: 1000, derivativeEntries: 2000,
  subjectCards: site.WEIJIBA_WRITING.cards.size, definitions: site.WEIJIBA_WRITING.glossary.size,
  internalLinks, distinctIntroductions: introductions.size, maximumRepeatedParagraph: maxRepeat,
  totalBodyCharacters: totalCharacters, renderedSamples: samples.length,
  status: "PASS"
}, null, 2));
