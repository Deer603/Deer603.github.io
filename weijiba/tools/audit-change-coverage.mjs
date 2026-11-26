// Report substantive edits, new articles and removed routes against a Git baseline.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = path.resolve(root, "..");
const baseline = process.argv.find(arg => arg.startsWith("--base="))?.slice("--base=".length) || "HEAD";
const scripts = ["entry-routes.js", "entry-writing.js", "entry-data.js"];
const catalogue = committed => {
  const context = {
    URLSearchParams,
    history: {},
    window: { location: { pathname: "/weijiba/", search: "" }, scrollTo() {}, addEventListener() {}, setTimeout() {} },
    document: { querySelectorAll: () => [], querySelector: () => null }
  };
  context.window.history = context.history;
  vm.createContext(context);
  for (const file of scripts) {
    const source = committed
      ? execFileSync("git", ["show", `${baseline}:weijiba/${file}`], { cwd: repoRoot, encoding: "utf8" })
      : fs.readFileSync(path.join(root, file), "utf8");
    vm.runInContext(source, context, { filename: file });
  }
  return { articles: context.window.WEIJIBA_ENTRY_CATALOG, paths: context.window.WEIJIBA_ENTRY_PATHS };
};

const before = catalogue(true);
const after = catalogue(false);
const previous = Object.entries(before.articles);
const retired = previous.filter(([slug]) => !after.articles[slug]);
const kept = previous.filter(([slug]) => after.articles[slug]);
const added = Object.keys(after.articles).filter(slug => !before.articles[slug]);
const prose = entry => [...entry.overview, ...entry.sections.flatMap(({ paragraphs, items = [], table }) => [
  ...paragraphs, ...items, ...(table ? [table.caption, ...table.headers, ...table.rows.flat()] : [])
])].join("\u0000");
const unchanged = kept.filter(([slug, entry]) => prose(entry) === prose(after.articles[slug]));
const renamedPaths = kept.filter(([slug]) => before.paths[slug] !== after.paths[slug]);
const activePaths = new Set(Object.values(after.paths));
const removedPaths = new Set(retired.map(([slug]) => before.paths[slug]).filter(title => !activePaths.has(title)));
const report = {
  baseline,
  before: previous.length,
  after: Object.keys(after.articles).length,
  added: added.length,
  retired: retired.length,
  changed: kept.length - unchanged.length,
  unchanged: unchanged.length,
  retiredPaths: removedPaths.size,
  renamedPaths: renamedPaths.map(([slug]) => ({ slug, before: before.paths[slug], after: after.paths[slug] })),
  ...(process.argv.includes("--list") ? { unchangedCore: unchanged.filter(([slug]) => !/^(odd|base)-/.test(slug)).map(([slug, entry]) => `${entry.title} (${slug})`) } : {}),
  ...(process.argv.includes("--inspect") ? { details: unchanged.map(([slug, entry]) => ({ slug, title: entry.title, opening: entry.overview[0], sections: entry.sections.map(s => s.title) })) } : {})
};
console.log(JSON.stringify(report, null, 2));
if (process.argv.includes("--check")) {
  assert.equal(renamedPaths.length, 0, "A retained article changed its canonical path");
  for (const title of removedPaths) {
    assert(!fs.existsSync(path.join(root, title)), title + ': removed article directory still exists');
  }
}
