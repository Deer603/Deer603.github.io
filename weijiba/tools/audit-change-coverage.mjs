// Compare each existing entry's rendered prose with the editorial baseline.
// This checks article content, not cache-busting changes in route HTML.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = path.resolve(root, "..");
const baseline = process.argv.find(arg => arg.startsWith("--base="))?.slice("--base=".length) || "b6ca120";
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
  return context.window.WEIJIBA_ENTRY_CATALOG;
};

const before = catalogue(true);
const after = catalogue(false);
assert.deepEqual(Object.keys(before).filter(slug => !after[slug]), [], "A baseline route disappeared");
const prose = entry => [...entry.overview, ...entry.sections.flatMap(section => section.paragraphs)].join("\u0000");
const unchanged = Object.entries(before).filter(([slug, entry]) => prose(entry) === prose(after[slug]));
const byKind = kind => unchanged.filter(([slug]) => kind === "拓展" ? slug.startsWith("odd-") : kind === "基础" ? slug.startsWith("base-") : !/^(odd|base)-/.test(slug));
const report = {
  baseline,
  total: Object.keys(before).length,
  added: Object.keys(after).length - Object.keys(before).length,
  changed: Object.keys(before).length - unchanged.length,
  unchanged: unchanged.length,
  unchangedByKind: Object.fromEntries(["基础", "拓展", "核心"].map(kind => [kind, byKind(kind).length])),
  samples: unchanged.slice(0, 60).map(([slug, entry]) => `${entry.title} (${slug})`),
  ...(process.argv.includes("--list") ? { unchangedCore: byKind("核心").map(([slug, entry]) => `${entry.title} (${slug})`) } : {}),
  ...(process.argv.includes("--inspect") ? { details: unchanged.map(([slug, entry]) => ({ slug, title: entry.title, opening: entry.overview[0], sections: entry.sections.map(s => s.title) })) } : {})
};
console.log(JSON.stringify(report, null, 2));
if (process.argv.includes("--check")) assert.equal(unchanged.length, 0, "Every article needs a substantive prose change");
