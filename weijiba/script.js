(() => {
  "use strict";

  const { t, lang, routeEntry, setLanguage } = window.WEIJIBA_I18N;
  const languages = document.querySelector(".home-languages");
  for (const link of languages.querySelectorAll("[data-language]")) {
    const choice = link.dataset.language;
    if (choice === lang) link.setAttribute("aria-current", "true");
    link.addEventListener("click", event => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
      event.preventDefault();
      setLanguage(choice);
    });
  }
  document.addEventListener("click", event => {
    if (languages.open && !languages.contains(event.target)) languages.open = false;
  });

  const sidebar = document.querySelector("#sidebar");
  const sidebarBackdrop = document.querySelector("#sidebar-backdrop");
  const openSidebarButton = document.querySelector("[data-open-sidebar]");
  const closeSidebarButton = sidebar.querySelector("[data-close-sidebar]");
  const mobileSearch = matchMedia("(max-width: 690px)");
  const searchPanel = document.querySelector("#search");
  const focusSearchButton = document.querySelector("[data-focus-search]");
  const searchForm = document.querySelector("#search-form");
  const searchInput = document.querySelector("#search-input");
  const searchStatus = document.querySelector("#search-status");
  const searchResults = document.querySelector("#search-results");

  const aliases = window.WEIJIBA_HOME_ALIASES;
  const paths = window.WEIJIBA_ENTRY_PATHS || {};
  const normalize = value => value.normalize("NFKC").toLowerCase().replace(/[\s’'‐‑–—-]+/g, "");
  const catalogue = Object.entries(paths).map(([slug, title]) => {
    const names = [title, ...(aliases[slug] || [])];
    const variants = names.flatMap(name => [name, t(name, "zh-TW"), t(name, "en")]);
    return { slug, title: t(title), names: [...new Set([slug, ...variants].map(normalize))] };
  });

  function showResults(query, updateUrl = false) {
    const value = query.trim();
    const term = normalize(value);
    const exact = [];
    const prefix = [];
    const partial = [];
    if (term) {
      for (const entry of catalogue) {
        if (entry.names.includes(term)) exact.push(entry);
        else if (entry.names.some(name => name.startsWith(term))) prefix.push(entry);
        else if (entry.names.some(name => name.includes(term))) partial.push(entry);
      }
    }

    const entries = [...exact, ...prefix, ...partial];
    const links = document.createDocumentFragment();
    for (const { slug, title } of entries) {
      const listItem = document.createElement("li");
      const link = document.createElement("a");
      link.href = routeEntry(slug);
      link.textContent = title;
      listItem.append(link);
      links.append(listItem);
    }
    searchResults.replaceChildren(links);
    searchResults.hidden = entries.length === 0;
    let status = "";
    if (value) {
      if (!entries.length) status = t("未找到“{query}”。").replace("{query}", () => value);
      else if (entries.length === 1) status = t("找到1个匹配词条");
      else status = t("找到{count}个匹配词条").replace("{count}", entries.length);
    }
    searchStatus.textContent = status;

    if (updateUrl) {
      const url = new URL(location.href);
      if (value) url.searchParams.set("q", value);
      else url.searchParams.delete("q");
      if (url.href !== location.href) history.replaceState(history.state, "", url);
    }
  }

  searchForm.addEventListener("submit", event => {
    event.preventDefault();
    showResults(searchInput.value, true);
  });
  searchInput.addEventListener("input", () => {
    if (!searchInput.value) showResults("", true);
  });
  function setSearchOpen(open, moveFocus = false) {
    searchPanel.toggleAttribute("data-expanded", open);
    focusSearchButton.setAttribute("aria-expanded", String(open));
    if (moveFocus) (open ? searchInput : focusSearchButton).focus();
  }

  focusSearchButton.addEventListener("click", () => setSearchOpen(!searchPanel.hasAttribute("data-expanded"), true));
  window.addEventListener("hashchange", () => {
    if (mobileSearch.matches && location.hash === "#search") setSearchOpen(true);
  });
  const initialQuery = new URLSearchParams(location.search).get("q");
  if (initialQuery || location.hash === "#search") setSearchOpen(true);
  if (initialQuery) {
    searchInput.value = initialQuery;
    showResults(initialQuery);
  }

  let releaseSidebarFocus;
  function setSidebar(open, restoreFocus = true) {
    const wasOpen = document.body.classList.contains("sidebar-open");
    if (wasOpen === open) return;
    releaseSidebarFocus?.();
    document.body.classList.toggle("sidebar-open", open);
    sidebarBackdrop.hidden = !open;
    openSidebarButton.setAttribute("aria-expanded", String(open));
    if (open) {
      releaseSidebarFocus = window.WEIJIBA_FOCUS_SCOPE?.(sidebar, [sidebarBackdrop]);
      closeSidebarButton.focus();
    } else if (restoreFocus) {
      openSidebarButton.focus();
    }
  }

  openSidebarButton.addEventListener("click", () => setSidebar(true));
  closeSidebarButton.addEventListener("click", () => setSidebar(false));
  sidebarBackdrop.addEventListener("click", () => setSidebar(false));
  sidebar.querySelectorAll("a").forEach(link => link.addEventListener("click", () => setSidebar(false, false)));

  const root = document.documentElement;
  const appearanceRail = document.querySelector("#appearance-rail");
  const appearanceBackdrop = document.querySelector("#appearance-backdrop");
  const openAppearanceButton = document.querySelector("[data-open-appearance]");
  const closeAppearanceButton = document.querySelector("[data-close-appearance]");
  const appearanceViewport = matchMedia("(max-width: 1100px)");
  const systemColors = matchMedia("(prefers-color-scheme: dark)");
  const storageKey = "weijiba-appearance";
  const appearanceKeys = { "text-size": "textSize", "page-width": "pageWidth", "color-mode": "colorMode" };
  let releaseAppearanceFocus;
  let appearanceOpen = false;

  function saveAppearance(changes) {
    try {
      const stored = JSON.parse(localStorage.getItem(storageKey) || "{}") || {};
      localStorage.setItem(storageKey, JSON.stringify({ ...stored, ...changes }));
    } catch (_) {}
  }

  function applySystemColor() {
    root.dataset.systemColor = systemColors.matches ? "dark" : "light";
  }

  systemColors.addEventListener("change", applySystemColor);
  applySystemColor();

  appearanceRail.querySelectorAll('input[type="radio"]').forEach(input => {
    const key = appearanceKeys[input.name];
    input.checked = root.dataset[key] === input.value;
    input.addEventListener("change", () => {
      if (!input.checked) return;
      root.dataset[key] = input.value;
      saveAppearance({ [key]: input.value });
    });
  });

  function syncAppearance() {
    const narrow = appearanceViewport.matches;
    const expanded = narrow ? appearanceOpen : !root.classList.contains("home-appearance-hidden");
    appearanceRail.hidden = !expanded;
    appearanceBackdrop.hidden = !(narrow && appearanceOpen);
    closeAppearanceButton.textContent = t(narrow ? "关闭" : "隐藏");
    openAppearanceButton.setAttribute("aria-expanded", String(expanded));
  }

  function setAppearance(open) {
    if (appearanceViewport.matches) {
      appearanceOpen = open;
      if (open) {
        setSidebar(false, false);
        document.body.classList.add("appearance-open");
        appearanceRail.setAttribute("role", "dialog");
        appearanceRail.setAttribute("aria-modal", "true");
      }
    } else {
      root.classList.toggle("home-appearance-hidden", !open);
      saveAppearance({ homeAppearanceHidden: !open });
    }

    if (!open) closeAppearanceDrawer();
    syncAppearance();

    if (open) {
      if (appearanceViewport.matches) {
        releaseAppearanceFocus = window.WEIJIBA_FOCUS_SCOPE?.(appearanceRail, [appearanceBackdrop]);
      }
      closeAppearanceButton.focus();
    } else {
      openAppearanceButton.focus();
    }
  }

  function closeAppearanceDrawer() {
    appearanceOpen = false;
    releaseAppearanceFocus?.();
    releaseAppearanceFocus = undefined;
    document.body.classList.remove("appearance-open");
    appearanceRail.removeAttribute("role");
    appearanceRail.removeAttribute("aria-modal");
  }

  openAppearanceButton.addEventListener("click", () => setAppearance(true));
  closeAppearanceButton.addEventListener("click", () => setAppearance(false));
  appearanceBackdrop.addEventListener("click", () => setAppearance(false));
  appearanceViewport.addEventListener("change", () => {
    const wasOpen = appearanceOpen;
    closeAppearanceDrawer();
    syncAppearance();
    if (wasOpen && !appearanceRail.hidden) closeAppearanceButton.focus();
    else if (wasOpen) openAppearanceButton.focus();
  });
  syncAppearance();

  document.addEventListener("keydown", event => {
    if (event.key !== "Escape") return;
    if (languages.open) {
      languages.open = false;
      languages.querySelector("summary").focus();
    } else if (appearanceOpen) setAppearance(false);
    else if (document.body.classList.contains("sidebar-open")) setSidebar(false);
    else if (mobileSearch.matches && searchPanel.hasAttribute("data-expanded")) setSearchOpen(false, true);
  });

  const featuredLink = document.querySelector("#featured-title-link");
  const featuredSummary = document.querySelector("#featured-summary");
  const featuredDetail = document.querySelector("#featured-detail");
  const featuredFigure = document.querySelector("#featured-figure");
  const featuredImage = document.querySelector("#featured-image");
  const featuredCaption = featuredFigure.querySelector("figcaption");
  const albumImage = featuredImage.getAttribute("src");
  const albumAlt = featuredImage.alt;
  const featured = [
    ["frog-corner", featuredSummary.textContent, featuredDetail.textContent],
    ["kuncode", "是由603维护的开源集成开发环境，基于Code - OSS，提供代码编辑、项目管理、终端、调试及扩展管理。扩展画廊使用Open VSX，内置离线助手困困AI。", "V2.0.0于2026年10月3日发布，提供Windows x64、macOS arm64及macOS x64安装包。10月12日，KunCode项目页面链接出现在鹿群聊天记录中。"],
    ["deerphotos", "又称鹿图，是以鹿群角色资料为参考的AI图像生成技能。它将姓名和别名映射到固定角色，由宿主工具根据参考图和场景描述生成图像。", "3.0.0版的项目说明列出11位角色和83个别名。2026年10月27日，项目仓库与发行页分别在鹿群分享。"],
    ["luchun", "是以校园熟人为主的微信群，讨论涉及课程、工程项目、数码设备、游戏、音乐及日常生活。", "2026年11月版聊天导出的49,393条消息分布于557天，导出清单将群名记为“Zetacognition🦌”。"],
    ["603-vision", "是以603寝室及周边校园生活为主要题材的微信公众号，内容包括校园活动报道、工程项目介绍、寝室纪事、游记和人物特写。", "公开内容包括招新宣讲会后的工程项目展示、Desk Park乐队的首次排练，以及KunCode与603AI项目。"],
    ["desk-park", "是603视界报道的一支校园乐队。乐队于2025年11月23日首次排练，为元旦晚会作准备。", "报道所列曲目为《热河》和《春风十里》。"],
    ["he-meaning", "是鹿群用来询问含义的简短问语，也可单独作为表达困惑或调侃的回应。", "2025年10月23日8:01至8:02，罗宇伦、陈祖涵和彭鹏相继发送这句话。"],
    ["jacobian-rapid", "记录了2026年6月23日鹿群关于机器人运动学的一段对话。", "詹绍源提出雅可比矩阵的奇异性判定问题，夏炜城随后询问矩阵的含义。"]
  ];
  let featuredIndex = 0;
  document.querySelector('[data-action="random"]').addEventListener("click", () => {
    featuredIndex = (featuredIndex + 1 + Math.floor(Math.random() * (featured.length - 1))) % featured.length;
    const [slug, summary, detail] = featured[featuredIndex];
    featuredLink.textContent = t(paths[slug]);
    featuredLink.href = routeEntry(slug);
    featuredSummary.textContent = t(summary);
    featuredDetail.textContent = t(detail);
    const isAlbum = slug === "frog-corner";
    featuredFigure.hidden = !(isAlbum || slug === "kuncode");
    if (!featuredFigure.hidden) {
      featuredImage.src = isAlbum ? albumImage : "/kuncode/app-icon-400.webp";
      featuredImage.alt = isAlbum ? albumAlt : t("KunCode应用图标");
      featuredImage.width = isAlbum ? 1364 : 400;
      featuredImage.height = isAlbum ? 1024 : 400;
      featuredCaption.hidden = !isAlbum;
    }
  });
})();
