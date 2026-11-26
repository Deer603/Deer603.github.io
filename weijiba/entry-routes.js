(() => {
  "use strict";

  const entryPaths = Object.freeze({
    "kunkun": "困困",
    "luchun": "鹿群",
    "history": "群内编年史与群史",
    "gonglu": "共🦌主义",
    "high-cognition": "高认知",
    "short-messages": "短句连发",
    "tech": "鹿群科技话题",
    "he-meaning": "何意味",
    "jacobian-rapid": "雅可比速问速答",
    "robot-basics": "机器人基础",
    "603-vision": "603视界",
    "kuncode": "KunCode",
    "603-tech-light": "科技之光｜603寝室成员在招新宣讲会后展示创新成果",
    "603-ai-android": "603视界AI安卓端应用程序",
    "desk-park": "Desk Park乐队",
    "603-yueyang-trip": "岳阳楼，望浙江",
    "603-lost-cake": "雨夜失糕",
    "portrait-generator": "人物群像生成器",
    "deerphotos": "DeerPhotos",
    "luo-yulun": "罗宇伦",
    "peng-peng": "彭鹏",
    "wei-ziqi": "魏子奇",
    "xia-weicheng": "夏炜城",
    "li-jianyu": "黎健毓",
    "li-yanzhen": "李彦臻",
    "61": "61",
    "tang-yinxin": "唐胤鑫",
    "wu-zixuan": "吴子轩",
    "chen-zuhan": "陈祖涵",
    "deng-yuhang": "邓宇航",
    "tang-bofu": "唐博釜",
    "wang-pengtao": "王鹏涛",
    "tu-tenghui": "涂腾辉",
    "dai-er": "戴而",
    "kun-coach": "困教练",
    "particle": "对齐一下颗粒度",
    "frame-study": "逐帧学习",
    "check-in-kids": "打卡了孩子们",
    "steady": "稳了",
    "six-six-six": "666",
    "nb-context": "nb",
    "deer-taste-test": "鹿味测试",
    "base-0017": "603寝室"
  });

  const baseEntryRecords = Object.entries(entryPaths).map(([slug, title]) => ({ slug, title }));

  const slugByPath = Object.fromEntries(Object.entries(entryPaths).map(([slug, path]) => [path, slug]));

  function getSiteRoot() {
    const marker = "/weijiba/";
    const pathname = window.location.pathname;
    const markerIndex = pathname.indexOf(marker);
    if (markerIndex >= 0) return pathname.slice(0, markerIndex + marker.length);
    return "/";
  }

  function getEntryUrl(slug) {
    const path = entryPaths[slug];
    return typeof path === "string" ? `${getSiteRoot()}${encodeURIComponent(path)}/` : "";
  }

  function getEntryFromPath(pathname) {
    let path = pathname.replace(/\/index\.html$/, "/").split("/").filter(Boolean).pop() || "";
    try {
      path = decodeURIComponent(path);
    } catch (_) {}
    return slugByPath[path] || "";
  }

  function normalizeEntryLinks(root = document) {
    root.querySelectorAll?.('a[href*="article.html?entry="]').forEach((link) => {
      const rawHref = link.getAttribute("href") || "";
      const slug = new URL(rawHref, window.location.href).searchParams.get("entry");
      const href = getEntryUrl(slug);
      if (!href) return;
      link.setAttribute("href", href);
      link.setAttribute("target", "_blank");
      link.setAttribute("rel", "noopener");
    });
  }

  window.WEIJIBA_ENTRY_PATHS = entryPaths;
  window.WEIJIBA_BASE_ENTRY_RECORDS = baseEntryRecords;
  window.WEIJIBA_ENTRY_URL = getEntryUrl;
  window.WEIJIBA_ENTRY_FROM_PATH = getEntryFromPath;
  window.WEIJIBA_NORMALIZE_ENTRY_LINKS = normalizeEntryLinks;
})();
