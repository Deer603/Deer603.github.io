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
const samples = ["鹿群", "困困", "罗宇伦", "鹿群科技话题", "雅可比速问速答", "603视界", "KunCode", "DeerPhotos"];
const unknownTitle = "未收录条目测试标题";
const unknownUrl = `${origin}${encodeURIComponent(unknownTitle)}/`;
let pages = 0, anchors = 0;
try {
  for (const [device, width, height] of [["desktop", 1440, 1000], ["ipad", 820, 1180], ["mobile", 390, 844]]) {
    const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1 });
    const page = await context.newPage();
    page.setDefaultTimeout(8000);
    page.on("pageerror", e => errors.push(`${device}: ${e.message}`));
    page.on("response", response => {
      if (device === "desktop" && response.status() === 404 && response.url() === unknownUrl) return;
      if (response.url().startsWith(origin) && response.status() >= 400) {
        errors.push(`${response.status()}: ${response.url()}`);
      }
    });
    await page.goto(origin);
    assert(await page.locator("#mega-entry-list a").count() > 0, `${device}: empty index`);
    const homeBrand = page.locator(".logo-link img:visible, .topbar-brand img:visible").first();
    assert(await homeBrand.isVisible(), `${device}: missing home logo`);
    assert(await homeBrand.evaluate(img => img.complete && img.naturalWidth > 0), `${device}: failed home logo`);
    const brand = page.locator(".brand img");
    if (output && device === "mobile") await page.screenshot({ path: path.join(output, "home-mobile.png") });
    if (device === "desktop") {
      const search = page.locator("#search-input");
      const results = page.locator("#search-results a");
      for (const query of ["DeerPhotos", "鹿图"]) {
        await search.fill(query);
        await search.press("Enter");
        assert.equal(await results.first().innerText(), "DeerPhotos", `${query}: project search`);
        assert.equal(new URL(await results.first().getAttribute("href"), origin).href, `${origin}DeerPhotos/`);
      }
      await search.fill(unknownTitle);
      await search.press("Enter");
      assert.equal(await results.count(), 0, "Unknown article appeared in search");
      assert.equal((await page.goto(unknownUrl))?.status(), 404, "Unknown article path should return 404");
      await page.goto(`${origin}article.html?entry=unknown-entry-check`);
      assert.equal(await page.locator("h1").innerText(), "未找到词条");
    }
    for (const title of device === "desktop" ? samples : ["困困", "DeerPhotos"]) {
      await page.goto(`${origin}${encodeURIComponent(title)}/`);
      assert.equal(await page.locator("h1").innerText(), title);
      assert(!(await page.locator("article").innerText()).includes("本索引为"));
      assert(await brand.isVisible(), `${device}/${title}: missing article logo`);
      const integrity = await page.evaluate(() => {
        const hashLinks = [...document.querySelectorAll('#toc a[href^="#"]')];
        return {
          missingAnchors: hashLinks.filter(a => !document.getElementById(decodeURIComponent(a.hash.slice(1)))).map(a => a.hash),
          overflow: document.documentElement.scrollWidth - innerWidth,
          badImages: [...document.images].filter(i => !i.complete || !i.naturalWidth).map(i => i.src),
          entryLinks: [...document.querySelectorAll("#related a")].filter(a => a.origin === location.origin && !a.hash)
            .map(a => ({ target: a.target, href: a.href }))
        };
      });
      assert.deepEqual(integrity.missingAnchors, [], `${device}/${title}: TOC`);
      assert.deepEqual(integrity.badImages, [], `${device}/${title}: images`);
      assert(integrity.overflow <= 2, `${device}/${title}: overflow ${integrity.overflow}`);
      assert(integrity.entryLinks.every(a => a.target === "_blank"), `${device}/${title}: article target`);
      anchors += integrity.entryLinks.length;
      pages++;
      if (output && title === "DeerPhotos") {
        await page.screenshot({ path: path.join(output, `${device}-${title}.png`), fullPage: device === "desktop" });
      }
    }
    if (device === "desktop") {
      await page.goto(`${origin}${encodeURIComponent("困困")}/`);
      await page.locator('input[name="text-size"][value="large"]').check();
      await page.locator('input[name="color-mode"][value="dark"]').check();
      assert.equal(await page.locator("html").getAttribute("data-text-size"), "large");
      assert.equal(await page.locator("html").getAttribute("data-color-mode"), "dark");
      await page.reload();
      assert.equal(await page.locator("html").getAttribute("data-text-size"), "large");
      assert.equal(await page.locator("html").getAttribute("data-color-mode"), "dark");
      const jump = page.locator("#related a[target='_blank']").first();
      const expected = await jump.getAttribute("href");
      const heading = await jump.innerText();
      const popupReady = context.waitForEvent("page");
      await jump.click();
      const popup = await popupReady;
      await popup.waitForLoadState("load");
      assert.equal(new URL(popup.url()).pathname, new URL(expected, page.url()).pathname);
      assert.equal(await popup.locator("h1").innerText(), heading);
      await popup.close();
    }
    await context.close();
  }
  assert.deepEqual(errors, [], "Browser runtime/resource errors");
  console.log(JSON.stringify({ status: "PASS", articleViews: pages, checkedRenderedLinks: anchors, homeViews: 3, errors, screenshots: output }, null, 2));
} catch (error) {
  if (errors.length) console.error(errors.join("\n"));
  throw error;
} finally { await browser.close(); }
