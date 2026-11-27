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
const simplified = new URL("zh-cn/", origin).href;
const expression = encodeURIComponent("你是个鹿嘞") + "/";
const editions = {
  "zh-CN": { dir: "zh-cn", locale: "zh_CN", title: "你是个鹿嘞｜魏鸡百科" },
  "zh-TW": { dir: "zh-tw", locale: "zh_TW", title: "你是個鹿嘞｜魏雞百科" },
  en: { dir: "en", locale: "en_US", title: "You're a Deer | Weiji Encyclopedia" }
};
let pages = 0, anchors = 0;

async function checkShareCard(page, lang) {
  const { dir, locale, title } = editions[lang];
  const route = dir + "/" + expression;
  const official = new URL(route, "https://deer603.github.io/weijiba/").href;
  assert.equal(await page.title(), title);
  assert.equal(await page.locator("#share-entry").getAttribute("href"), official);
  const source = await page.request.get(new URL(route, origin).href);
  assert.equal(source.status(), 200);
  // A crawler sees the HTML response before scripts run.
  const card = await page.evaluate(html => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    const meta = key => doc.querySelector(`meta[property="og:${key}"]`).content;
    return {
      locale: meta("locale"), title: meta("title"), url: meta("url"), image: meta("image"),
      twitter: doc.querySelector('meta[name="twitter:title"]').content,
      canonical: doc.querySelector('link[rel="canonical"]').getAttribute("href"),
      description: meta("description")
    };
  }, await source.text());
  assert.equal(card.title, title);
  assert.equal(card.twitter, title);
  assert.equal(card.locale, locale);
  assert.equal(card.url, official);
  assert.equal(card.canonical, official);
  assert.equal(new URL(card.image).origin + new URL(card.image).pathname, "https://deer603.github.io/weijiba/assets/share-globe.jpg");
  assert(card.description.trim(), lang + ": missing share description");
  await page.evaluate(() => Object.defineProperty(navigator, "share", {
    configurable: true, value: async data => { window.sharedArticle = data; }
  }));
  await page.locator("#share-entry").click();
  assert.deepEqual(await page.evaluate(() => window.sharedArticle), { title, url: official, text: card.description });
  return card.description;
}

async function checkLanguages() {
  for (const [system, lang] of [["en-US", "en"], ["zh-HK", "zh-TW"]]) {
    const context = await browser.newContext({ locale: system, viewport: { width: 1440, height: 950 } });
    try {
      const page = await context.newPage();
      page.on("pageerror", error => errors.push(system + ": " + error.message));
      const fragment = "#related";
      const bare = new URL(expression + fragment, origin).href;
      const localized = choice => new URL(editions[choice].dir + "/" + expression + fragment, origin).href;
      await page.goto(bare);
      await page.waitForURL(localized(lang));
      assert.equal(await page.locator("html").getAttribute("lang"), lang);
      if (system === "zh-HK") continue;
      const descriptions = new Set();
      for (const choice of ["en", "zh-TW", "zh-CN", "en"]) {
        if (page.url() !== localized(choice)) {
          if (choice === "zh-CN") await page.locator("#article-variant").selectOption(choice);
          else {
            await page.locator("#article-language-button").click();
            await page.locator(`#article-language-menu [data-language="${choice}"]`).click();
          }
          await page.waitForURL(localized(choice));
        }
        assert.equal(await page.locator("html").getAttribute("lang"), choice);
        assert.equal(await page.locator('#article-language-menu [aria-current="true"]').getAttribute("data-language"), choice);
        const title = await page.title();
        assert(title.includes(await page.locator("h1").innerText()));
        if (choice === "en" && descriptions.size) break;
        descriptions.add(await checkShareCard(page, choice));
        if (output && choice !== "zh-CN") {
          if (choice === "zh-TW") await page.locator('input[name="color-mode"][value="dark"]').check();
          const preview = await context.newPage();
          await preview.goto(new URL(editions[choice].dir + "/" + expression, origin).href);
          await preview.evaluate(() => document.fonts.ready);
          await preview.screenshot({ path: path.join(output, "article-" + choice + ".png"), animations: "disabled" });
          await preview.close();
        }
      }
      assert.equal(descriptions.size, 3, "Expected a distinct share description for each language");
      await page.goto(bare);
      await page.waitForURL(localized("en"));
      await page.goto(new URL("en/article.html?entry=constructor", origin).href);
      assert.equal(await page.locator("h1").innerText(), "Article not found");
    } finally { await context.close(); }
  }
}

try {
  await checkLanguages();
  for (const [device, width, height] of [["desktop", 1440, 1000], ["ipad", 820, 1180], ["mobile", 390, 844]]) {
    const context = await browser.newContext({ locale: "zh-CN", viewport: { width, height }, deviceScaleFactor: 1 });
    const page = await context.newPage();
    page.setDefaultTimeout(8000);
    page.on("pageerror", e => errors.push(`${device}: ${e.message}`));
    page.on("response", response => {
      if (device === "desktop" && response.status() === 404 && response.url() === unknownUrl) return;
      if (response.url().startsWith(origin) && response.status() >= 400) {
        errors.push(`${response.status()}: ${response.url()}`);
      }
    });
    await page.goto(simplified);
    assert(await page.locator("#mega-entry-list a").count() > 0, `${device}: empty index`);
    const homeBrand = page.locator(".logo-link img:visible, .topbar-brand img:visible").first();
    assert(await homeBrand.isVisible(), `${device}: missing home logo`);
    assert(await homeBrand.evaluate(img => img.complete && img.naturalWidth > 0), `${device}: failed home logo`);
    const brand = page.locator(".brand .brand-wordmark");
    if (output && device === "mobile") await page.screenshot({ path: path.join(output, "home-mobile.png") });
    if (device === "desktop") {
      const search = page.locator("#search-input");
      const results = page.locator("#search-results a");
      for (const query of ["DeerPhotos", "鹿图"]) {
        await search.fill(query);
        await search.press("Enter");
        assert.equal(await results.first().innerText(), "DeerPhotos", `${query}: project search`);
        assert.equal(new URL(await results.first().getAttribute("href"), page.url()).href, `${simplified}DeerPhotos/`);
      }
      await search.fill(unknownTitle);
      await search.press("Enter");
      assert.equal(await results.count(), 0, "Unknown article appeared in search");
      assert.equal((await page.goto(unknownUrl))?.status(), 404, "Unknown article path should return 404");
      await page.goto(`${simplified}article.html?entry=unknown-entry-check`);
      assert.equal(await page.locator("h1").innerText(), "未找到词条");
    }
    for (const title of device === "desktop" ? samples : ["困困", "DeerPhotos"]) {
      await page.goto(`${simplified}${encodeURIComponent(title)}/`);
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
      await page.goto(`${simplified}${encodeURIComponent("困困")}/`);
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
