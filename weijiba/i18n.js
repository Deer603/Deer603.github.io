(() => {
  const paths = { "zh-CN": "zh-cn", "zh-TW": "zh-tw", en: "en" };
  const location = window.location;
  const root = "/weijiba/";
  const key = "weijiba-language";
  const explicit = Object.keys(paths).find(lang => location.pathname.split("/")[2] === paths[lang]);

  function systemLanguage(languages) {
    for (const locale of languages) {
      const tag = String(locale).toLowerCase().split("-");
      if (tag[0] === "en") return "en";
      if (tag[0] === "zh") {
        if (tag.includes("hant")) return "zh-TW";
        if (tag.includes("hans")) return "zh-CN";
        return tag.some(part => ["tw", "hk", "mo"].includes(part)) ? "zh-TW" : "zh-CN";
      }
    }
    return "zh-CN";
  }

  let saved;
  try { saved = window.localStorage.getItem(key); } catch (_) {}
  const lang = explicit || (Object.hasOwn(paths, saved) ? saved : systemLanguage(
    window.navigator?.languages?.length ? window.navigator.languages : [window.navigator?.language]
  ));

  function localizedUrl(input, selected = lang) {
    const url = new URL(input, location.href);
    if (!Object.hasOwn(paths, selected) || !url.pathname.startsWith(root)) return url.href;
    if (url.origin !== new URL(location.href).origin && url.origin !== "https://deer603.github.io") return url.href;
    const tail = url.pathname.slice(root.length).replace(/^(?:zh-cn|zh-tw|en)(?:\/|$)/, "");
    if (tail.startsWith("assets/") || /\.[^/]+$/.test(tail) && !/(?:^|\/)(?:index|article)\.html$/.test(tail)) return url.href;
    url.pathname = root + paths[selected] + "/" + tail.replace(/(?:^|\/)index\.html$/, match => match.startsWith("/") ? "/" : "");
    return url.href;
  }

  function t(source, selected = lang) {
    if (typeof source !== "string") return source;
    if (selected === "zh-TW") return window.WEIJIBA_TW_UI?.[source] ?? source;
    if (selected === "en") return window.WEIJIBA_UI_EN?.[source] ?? window.WEIJIBA_HOME_EN?.[source] ?? window.WEIJIBA_TITLE_EN?.[source] ?? source;
    return source;
  }

  function setLanguage(selected) {
    if (!Object.hasOwn(paths, selected)) return;
    try { window.localStorage.setItem(key, selected); } catch (_) {}
    const next = localizedUrl(location.href, selected);
    if (location.href !== next) location.assign(next);
  }

  window.WEIJIBA_I18N = {
    lang, t, localizedUrl, setLanguage,
    routeEntry: slug => window.WEIJIBA_ENTRY_URL?.(slug) || ""
  };
  if (!explicit && location.pathname.startsWith(root)) {
    location.replace(localizedUrl(location.href));
  }
})();
