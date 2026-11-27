import { parse, serialize } from "parse5";
import { Converter } from "opencc-js/cn2t";

const toTraditional = Converter({ from: "cn", to: "tw" });
export const languages = { "zh-CN": "zh-cn", "zh-TW": "zh-tw", en: "en" };
export const origin = "https://deer603.github.io";
export const wiki = "/weijiba/";
export const homeTitle = "魏鸡百科｜困困的百科全书";
export const homeDescription = "记录鹿群人物、趣事、术语与科技话题。检索词条，阅读故事，发现群内共同记忆。";
export const iconAlt = "魏鸡百科拼图地球标志";
export const sharedEnglish = {
  [homeTitle]: "Weiji Encyclopedia | Kunkun's Encyclopedia",
  [homeDescription]: "Explore the people, expressions, events and technology projects documented by the Deer Group.",
  [iconAlt]: "Weiji Encyclopedia puzzle globe with the character 魏",
  "词条入口": "Article gateway",
  "旧版魏鸡百科词条入口。打开页面后将跳转到对应词条。": "This link opens the requested Weiji Encyclopedia article.",
  "这个词条暂时不存在。": "This article does not exist.",
  "返回百科首页": "Return to the main page",
  "魏鸡百科": "Weiji Encyclopedia",
  "困困的百科全书": "Kunkun's Encyclopedia"
};

export function translator(lang, words, missing) {
  if (lang === "zh-CN") return value => value;
  if (lang === "zh-TW") return toTraditional;
  function t(value) {
    if (Object.hasOwn(words, value)) return words[value];
    if (!/[\p{Script=Han}]/u.test(value)) return value;
    let match;
    if ((match = /^参考资料(\d+)$/.exec(value))) return "Reference " + match[1];
    if ((match = /^(.+)概要$/.exec(value))) return t(match[1]) + " overview";
    if ((match = /^(.+)的百科词条$/.exec(value))) return "Article about " + t(match[1]);
    if ((match = /^本页面修订于(.+)。$/.exec(value))) return "Last revised on " + t(match[1]) + ".";
    if ((match = /^访问(.+)$/.exec(value))) return "Visit " + t(match[1]);
    if ((match = /^(\d{4})年(\d{1,2})月(\d{1,2})日$/.exec(value))) {
      return new Intl.DateTimeFormat("en-US", { dateStyle: "long", timeZone: "UTC" })
        .format(new Date(Date.UTC(+match[1], +match[2] - 1, +match[3])));
    }
    missing?.add(value);
    return value;
  }
  return t;
}

const localAttributes = new Set(["alt", "aria-label", "aria-description", "title", "placeholder"]);
const urlAttributes = new Set(["href", "src", "action"]);
function rewriteUrl(raw, sourceUrl, lang) {
  if (!raw || raw.startsWith("#") || /^(?:mailto|tel|data):/i.test(raw)) return raw;
  const url = new URL(raw, sourceUrl);
  if (url.origin !== origin) return raw;
  const tail = url.pathname.slice(wiki.length);
  if (url.pathname.startsWith(wiki) && !/^(?:en|zh-cn|zh-tw)\//.test(tail) &&
      (url.pathname.endsWith("/") || /(?:^|\/)(?:index|article)\.html$/.test(tail))) {
    url.pathname = wiki + languages[lang] + "/" + tail.replace(/index\.html$/, "");
  }
  return raw.startsWith("https://") ? url.href : url.pathname + url.search + url.hash;
}

// Parse the HTML so that translation never changes script contents, identifiers,
// fragment targets, original language names, or external reference addresses.
export function localizePage(html, sourceUrl, lang, t, translatedValues) {
  const doc = parse(html);
  function textValue(raw) {
    const key = raw.trim();
    if (!key || translatedValues?.has(key)) return raw;
    return raw.replace(key, () => t(key));
  }
  function visit(node, keepText = false) {
    if (node.tagName === "script" || node.tagName === "style" || node.tagName === "title") {
      for (const attr of node.attrs) if (attr.name === "src") attr.value = rewriteUrl(attr.value, sourceUrl, lang);
      return;
    }
    if (node.nodeName === "#text" && !keepText) node.value = textValue(node.value);
    const attrs = node.attrs || [];
    const attr = name => attrs.find(item => item.name === name);
    if (node.tagName === "html") attr("lang").value = lang;
    if (attr("translate")?.value === "no" || attr("data-language")) keepText = true;
    for (const item of attrs) {
      if (localAttributes.has(item.name) && !keepText) item.value = textValue(item.value);
      if (urlAttributes.has(item.name)) item.value = rewriteUrl(item.value, sourceUrl, lang);
    }
    for (const child of node.childNodes || []) visit(child, keepText);
  }
  visit(doc);
  return serialize(doc);
}
