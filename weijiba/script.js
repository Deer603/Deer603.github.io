(() => {
  "use strict";

  const sidebar = document.querySelector("#sidebar");
  const sidebarBackdrop = document.querySelector("#sidebar-backdrop");
  const openSidebarButton = document.querySelector("[data-open-sidebar]");
  const closeSidebarButton = sidebar.querySelector("[data-close-sidebar]");
  const mobileNavigation = matchMedia("(max-width: 850px)");
  const focusSearchButton = document.querySelector("[data-focus-search]");
  const searchForm = document.querySelector("#search-form");
  const searchInput = document.querySelector("#search-input");
  const searchStatus = document.querySelector("#search-status");
  const searchResults = document.querySelector("#search-results");

  const aliases = {
    deerphotos: ["鹿图"],
    "luo-yulun": ["Roylyl"],
    history: ["鹿群编年史"],
    "603-ai-android": ["603AI"],
    "jacobian-rapid": ["雅可比"],
    "603-tech-light": ["科技之光"]
  };
  const paths = window.WEIJIBA_ENTRY_PATHS || {};
  const normalize = value => value.normalize("NFKC").toLocaleLowerCase("zh-CN").replace(/\s+/g, "");
  const catalogue = Object.entries(paths).map(([slug, title]) => ({
    slug, title, names: [title, ...(aliases[slug] || [])].map(normalize)
  }));

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
      link.href = window.WEIJIBA_ENTRY_URL(slug);
      link.textContent = title;
      listItem.append(link);
      links.append(listItem);
    }
    searchResults.replaceChildren(links);
    searchResults.hidden = entries.length === 0;
    searchStatus.textContent = value ? (entries.length
      ? "找到" + entries.length + "个匹配词条"
      : "未找到“" + value + "”。") : "";

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
  focusSearchButton.addEventListener("click", () => searchInput.focus());
  const initialQuery = new URLSearchParams(location.search).get("q");
  if (initialQuery) {
    searchInput.value = initialQuery;
    showResults(initialQuery);
  }

  let releaseSidebarFocus;
  function setSidebar(open, restoreFocus = true) {
    const wasOpen = document.body.classList.contains("sidebar-open");
    open = open && mobileNavigation.matches;
    if (wasOpen === open) return;
    releaseSidebarFocus?.();
    document.body.classList.toggle("sidebar-open", open);
    sidebarBackdrop.hidden = !open;
    openSidebarButton.setAttribute("aria-expanded", String(open));
    if (open) {
      releaseSidebarFocus = window.WEIJIBA_FOCUS_SCOPE?.(sidebar, [sidebarBackdrop]);
      closeSidebarButton.focus();
    } else if (restoreFocus && mobileNavigation.matches) {
      openSidebarButton.focus();
    }
  }

  openSidebarButton.addEventListener("click", () => setSidebar(true));
  closeSidebarButton.addEventListener("click", () => setSidebar(false));
  sidebarBackdrop.addEventListener("click", () => setSidebar(false));
  sidebar.querySelectorAll("a").forEach(link => link.addEventListener("click", () => setSidebar(false, false)));
  mobileNavigation.addEventListener("change", () => setSidebar(false));

  const modal = document.querySelector("#modal");
  const appearanceButton = document.querySelector('[data-action="appearance"]');
  const contrast = document.querySelector("#high-contrast");
  let releaseModalFocus;

  appearanceButton.addEventListener("click", () => {
    modal.hidden = false;
    document.body.classList.add("modal-open");
    releaseModalFocus = window.WEIJIBA_FOCUS_SCOPE?.(modal.querySelector(".modal-card"), [modal.querySelector(".modal-backdrop")]);
    modal.querySelector(".modal-close").focus();
  });

  function closeModal() {
    releaseModalFocus?.();
    modal.hidden = true;
    document.body.classList.remove("modal-open");
    appearanceButton.focus();
  }

  modal.querySelectorAll("[data-close-modal]").forEach(element => element.addEventListener("click", closeModal));
  contrast.addEventListener("change", () => document.body.classList.toggle("high-contrast", contrast.checked));
  document.addEventListener("keydown", event => {
    if (event.key !== "Escape") return;
    if (!modal.hidden) closeModal();
    else if (document.body.classList.contains("sidebar-open")) setSidebar(false);
  });

  const featured = [
    ["deerphotos", "DeerPhotos又称鹿图，是以鹿群角色资料为参考的AI图像生成技能。"],
    ["luchun", "鹿群是以校园熟人为主的微信群，讨论涉及课程、工程项目、数码设备、游戏、音乐及日常生活。"],
    ["603-vision", "603视界是以603寝室及周边校园生活为主要题材的微信公众号。"],
    ["desk-park", "Desk Park乐队是603视界报道的一支校园乐队，2025年11月23日首次排练。"],
    ["he-meaning", "何意味是鹿群聊天中的问语，也可表示困惑或调侃。"],
    ["jacobian-rapid", "雅可比速问速答记录了2026年6月23日群内关于雅可比矩阵的问答。"],
    ["kuncode", "KunCode是603发布的集成开发环境，基于Code - OSS。"]
  ];
  const featuredLink = document.querySelector("#featured-title-link");
  const featuredSummary = document.querySelector("#featured-summary");
  let featuredIndex = 0;
  document.querySelector('[data-action="random"]').addEventListener("click", () => {
    featuredIndex = (featuredIndex + 1 + Math.floor(Math.random() * (featured.length - 1))) % featured.length;
    const [slug, summary] = featured[featuredIndex];
    featuredLink.textContent = paths[slug];
    featuredLink.href = window.WEIJIBA_ENTRY_URL(slug);
    featuredSummary.textContent = summary;
  });
})();
