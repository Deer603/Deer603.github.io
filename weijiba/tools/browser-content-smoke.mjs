import assert from "node:assert/strict";
import path from "node:path";
import fs from "node:fs";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.WEIJIBA_PLAYWRIGHT_PATH || "playwright");
const origin = process.env.WEIJIBA_QA_ORIGIN || "http://127.0.0.1:4193/weijiba/";
const output = process.env.WEIJIBA_QA_DIR;
if (output) fs.mkdirSync(output, { recursive: true });
const browser = await chromium.launch({ headless: true, ...(process.env.WEIJIBA_BROWSER_CHANNEL ? { channel: process.env.WEIJIBA_BROWSER_CHANNEL } : {}) });
const errors = [];
const samples = ["困困", "罗宇伦", "Roylyl", "MacBook", "MacBook操作手册", "MacBook委员会", "MacBook档案", "ChatGPT拟人化", "雅可比", "太阳", "贝斯", "USB-C", "603视界", "KunCode", "夏炜城的寻根之旅", "技术原理", "公众号主页", "IDE"];
let pages = 0, anchors = 0;
try {
  for (const [device, width, height] of [["desktop", 1440, 1000], ["ipad", 820, 1180], ["mobile", 390, 844]]) {
    const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1 });
    const page = await context.newPage();
    page.on("pageerror", e => errors.push(`${device}: ${e.message}`));
    page.on("response", r => { if (r.url().startsWith(origin) && r.status() >= 400) errors.push(`${r.status()}: ${r.url()}`); });
    await page.goto(origin, { waitUntil: "networkidle" });
    assert.equal(await page.locator("#mega-entry-list a").count(), 1000, `${device}: base index`);
    const homeBrand = page.locator(".logo-link img:visible, .topbar-brand img:visible").first();
    assert(await homeBrand.isVisible(), `${device}: missing home logo`);
    assert(await homeBrand.evaluate(img => img.complete && img.naturalWidth > 0), `${device}: failed home logo`);
    const brand = page.locator(".brand img");
    if (output && device === "mobile") await page.screenshot({ path: path.join(output, "home-mobile.png") });
    for (const title of device === "desktop" ? samples : ["困困", "MacBook操作手册", "603视界", "IDE"]) {
      await page.goto(`${origin}${encodeURIComponent(title)}/`, { waitUntil: "networkidle" });
      await page.waitForFunction(() => window.WEIJIBA_ENTRY_CATALOG && document.querySelector("h1"));
      assert.equal(await page.locator("h1").innerText(), title);
      assert(!(await page.locator("article").innerText()).includes("本索引为"));
      assert(await brand.isVisible(), `${device}/${title}: missing article logo`);
      const integrity = await page.evaluate(() => {
        const hashLinks = [...document.querySelectorAll('#toc a[href^="#"]')];
        return {
          missingAnchors: hashLinks.filter(a => !document.getElementById(decodeURIComponent(a.hash.slice(1)))).map(a => a.hash),
          overflow: document.documentElement.scrollWidth - innerWidth,
          badImages: [...document.images].filter(i => !i.complete || !i.naturalWidth).map(i => i.src),
          entryLinks: [...document.querySelectorAll("article a")].filter(a => a.origin === location.origin && !a.hash)
            .map(a => ({ target: a.target, href: a.href }))
        };
      });
      assert.deepEqual(integrity.missingAnchors, [], `${device}/${title}: TOC`);
      assert.deepEqual(integrity.badImages, [], `${device}/${title}: images`);
      assert(integrity.overflow <= 2, `${device}/${title}: overflow ${integrity.overflow}`);
      assert(integrity.entryLinks.every(a => a.target === "_blank"), `${device}/${title}: article target`);
      anchors += integrity.entryLinks.length;
      pages++;
      if (output && ((device === "desktop" && ["困困", "MacBook操作手册", "MacBook委员会"].includes(title)) || (device !== "desktop" && title === "困困"))) {
        await page.screenshot({ path: path.join(output, `${device}-${title}.png`), fullPage: device === "desktop" });
      }
    }
    if (device === "desktop") {
      await page.goto(`${origin}${encodeURIComponent("困困")}/`, { waitUntil: "networkidle" });
      await page.locator('input[name="text-size"][value="large"]').check();
      await page.locator('input[name="color-mode"][value="dark"]').check();
      assert.equal(await page.locator("html").getAttribute("data-text-size"), "large");
      assert.equal(await page.locator("html").getAttribute("data-color-mode"), "dark");
      await page.evaluate(() => scrollTo(0, 1200));
      await page.reload({ waitUntil: "networkidle" });
      await page.waitForFunction(() => scrollY === 0);
      assert.equal(await page.locator("html").getAttribute("data-text-size"), "large");
      const jump = page.locator("#extensions a").first();
      const expected = await jump.getAttribute("href");
      const popupReady = context.waitForEvent("page");
      await jump.click();
      const popup = await popupReady;
      await popup.waitForLoadState("networkidle");
      assert.equal(new URL(popup.url()).pathname, new URL(expected, page.url()).pathname);
      assert.equal(await popup.locator("h1").innerText(), "困困研究所");
      await popup.close();
    }
    await context.close();
  }
  assert.deepEqual(errors, [], "Browser runtime/resource errors");
  console.log(JSON.stringify({ status: "PASS", articleViews: pages, checkedRenderedLinks: anchors, homeViews: 3, errors, screenshots: output }, null, 2));
} finally { await browser.close(); }
