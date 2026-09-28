(() => {
  "use strict";

  const STORAGE_KEY = "weijiba-appearance";
  const root = document.documentElement;
  const body = document.body;
  const appearanceRail = document.querySelector("#appearance-rail");
  const hideAppearanceButton = document.querySelector("#hide-appearance");
  const restoreAppearanceButton = document.querySelector("#appearance-restore");
  const mainMenu = document.querySelector("#main-menu");
  const menuTrigger = document.querySelector(".menu-trigger");
  const drawerBackdrop = document.querySelector(".drawer-backdrop");
  const languageButton = document.querySelector("#article-language-button");
  const languageMenu = document.querySelector("#article-language-menu");
  const searchForm = document.querySelector("#article-search");
  const searchToggle = document.querySelector(".search-icon");
  const searchInput = document.querySelector("#article-search-input");
  const toast = document.querySelector("#article-toast");
  const tocLinks = [...document.querySelectorAll(".toc a")];
  const sections = [...document.querySelectorAll("#top, .article-section")];
  let toastTimer;

  function setSearchExpanded(expanded) {
    if (!searchForm) return;
    searchForm.classList.toggle("is-expanded", expanded);
    searchToggle?.setAttribute("aria-expanded", String(expanded));
    if (expanded) searchInput?.focus();
  }

  const defaults = {
    textSize: "standard",
    pageWidth: "standard",
    colorMode: "light",
    appearanceHidden: false
  };

  const entryTerms = [
    ["人物群像生成器", "portrait-generator"],
    ["雅可比速问速答", "jacobian-rapid"],
    ["打卡了孩子们", "check-in-kids"],
    ["高认知宇宙", "cognition-universe"],
    ["666量子态", "six-six-six"],
    ["问号瀑布", "question-rain"],
    ["逐帧学习", "frame-study"],
    ["机器人基础", "robot-basics"],
    ["七个机器人", "seven-robots"],
    ["603视界", "603-vision"],
    ["全员广播", "all-broadcast"],
    ["戴尔问号", "dell-question"],
    ["困困是谁", "kunkun-who"],
    ["强三连", "strong-chain"],
    ["静音不开", "silence-open"],
    ["何意味", "he-meaning"],
    ["吃什么", "eat-what"],
    ["稳了", "steady"],
    ["人物", "person"],
    ["6号反应", "six-reaction"],
    ["666", "six-six-six"],
    ["戴尔", "dell-question"],
    ["机器人", "robot-basics"],
    ["高认知", "cognition-universe"],
    ["全员", "all-broadcast"],
    ["彭鹏", "peng-peng"],
    ["魏子奇", "wei-ziqi"],
    ["唐胤鑫", "tang-yinxin"],
    ["吴子轩", "wu-zixuan"],
    ["夏炜城", "xia-weicheng"],
    ["陈祖涵", "chen-zuhan"],
    ["邓宇航", "deng-yuhang"],
    ["黎健毓", "li-jianyu"],
    ["唐博釜", "tang-bofu"],
    ["李彦臻", "li-yanzhen"],
    ["王鹏涛", "wang-pengtao"],
    ["涂腾辉", "tu-tenghui"],
    ["詹绍源（困困）", "kunkun"],
    ["群内编年史", "history"],
    ["群史", "history"],
    ["集体高认知化", "high-cognition"],
    ["对齐一下颗粒度", "particle"],
    ["鹿群科技话题", "tech"],
    ["数字平台与产品", "platforms"],
    ["项目与竞赛", "projects"],
    ["AI 与大模型", "ai-tools"],
    ["安全与数据", "security"],
    ["编码与开发", "coding"],
    ["学习与课程", "learning"],
    ["硬件与数码", "hardware"],
    ["鹿群群聊回路", "chat-cycle"],
    ["共🦌主义", "gonglu"],
    ["高认知", "high-cognition"],
    ["困困大王", "kunkun"],
    ["困教练", "kun-coach"],
    ["短句连发", "short-messages"],
    ["数字平台", "platforms"],
    ["数据安全", "security"],
    ["工程设计", "projects"],
    ["工程项目", "projects"],
    ["科技话题", "tech"],
    ["群聊回路", "chat-cycle"],
    ["AI 工具", "ai-tools"],
    ["ChatGPT", "ai-tools"],
    ["DeepSeek", "ai-tools"],
    ["Codex", "ai-tools"],
    ["云电脑", "platforms"],
    ["豆包", "ai-tools"],
    ["雅可比矩阵", "projects"],
    ["詹绍源", "kunkun"],
    ["困困", "kunkun"],
    ["困教", "kun-coach"],
    ["鹿群", "luchun"],
    ["颗粒度", "particle"],
    ["徐哥", "xu-ge"],
    ["书记", "secretary"],
    ["硬件", "hardware"],
    ["编程", "coding"],
    ["课程", "learning"],
    ["项目", "projects"],
    ["稳了", "short-messages"],
    ["61", "61"],
    ["nb", "nb-context"],
    ...(window.WEIJIBA_ENTRY_TERMS || [])
  ].sort((a, b) => b[0].length - a[0].length);

  function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function enrichArticleLinks() {
    const article = document.querySelector(".article-main article");
    if (!article || typeof NodeFilter === "undefined") return;
    const currentSlug = new URLSearchParams(window.location.search).get("entry")
      || window.WEIJIBA_ENTRY_FROM_PATH?.(window.location.pathname)
      || "kunkun";
    const termLookup = new Map(entryTerms.map(([term, slug]) => [term.toLocaleLowerCase(), { term, slug }]));
    const matcher = new RegExp(entryTerms.map(([term]) => escapeRegExp(term)).join("|"), "gi");
    const linkedBySection = new WeakMap();
    const walker = document.createTreeWalker(article, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!parent || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        if (parent.closest("a, button, code, sup, h1, h2, h3, .article-toolbar, .language-menu, .categories, .references, .last-edited, .extension-section")) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);

    textNodes.forEach((node) => {
      const section = node.parentElement.closest(".article-section") || article;
      if (!linkedBySection.has(section)) linkedBySection.set(section, new Set());
      const linkedTargets = linkedBySection.get(section);
      const text = node.nodeValue;
      const fragment = document.createDocumentFragment();
      let lastIndex = 0;
      let changed = false;
      matcher.lastIndex = 0;
      let match;

      while ((match = matcher.exec(text))) {
        const target = termLookup.get(match[0].toLocaleLowerCase());
        if (!target || target.slug === currentSlug || linkedTargets.has(target.slug)) continue;
        fragment.append(document.createTextNode(text.slice(lastIndex, match.index)));
        const link = document.createElement("a");
        link.href = window.WEIJIBA_ENTRY_URL?.(target.slug)
          || `article.html?entry=${encodeURIComponent(target.slug)}`;
        link.className = "auto-entry-link";
        link.target = "_blank";
        link.rel = "noopener";
        link.title = `查看词条：${target.term}`;
        link.textContent = match[0];
        fragment.append(link);
        lastIndex = match.index + match[0].length;
        linkedTargets.add(target.slug);
        changed = true;
      }

      if (!changed) return;
      fragment.append(document.createTextNode(text.slice(lastIndex)));
      node.replaceWith(fragment);
    });
  }

  function loadPreferences() {
    try {
      return { ...defaults, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") };
    } catch (_) {
      return { ...defaults };
    }
  }

  let preferences = loadPreferences();

  function savePreferences() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    } catch (_) {}
  }

  function showToast(message) {
    if (!toast) return;
    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add("visible");
    toastTimer = window.setTimeout(() => toast.classList.remove("visible"), 2300);
  }

  function setChecked(name, value) {
    const input = document.querySelector(`input[name="${name}"][value="${value}"]`);
    if (input) input.checked = true;
  }

  function applyPreferences({ announce = false } = {}) {
    root.dataset.textSize = preferences.textSize;
    root.dataset.pageWidth = preferences.pageWidth;
    root.dataset.colorMode = preferences.colorMode;
    body.classList.toggle("appearance-hidden", Boolean(preferences.appearanceHidden));
    if (appearanceRail) appearanceRail.setAttribute("aria-hidden", String(Boolean(preferences.appearanceHidden)));
    if (restoreAppearanceButton) restoreAppearanceButton.setAttribute("aria-expanded", String(!preferences.appearanceHidden));
    setChecked("text-size", preferences.textSize);
    setChecked("page-width", preferences.pageWidth);
    setChecked("color-mode", preferences.colorMode);
    if (announce) showToast("外观设置已保存");
  }

  function isNarrowScreen() {
    return window.matchMedia("(max-width: 820px)").matches;
  }

  function setBackdrop(visible) {
    if (drawerBackdrop) drawerBackdrop.hidden = !visible;
    body.classList.toggle("drawer-open", visible);
  }

  function closeDrawers() {
    const menuWasOpen = body.classList.contains("menu-open");
    const appearanceWasOpen = body.classList.contains("appearance-open");
    body.classList.remove("menu-open", "appearance-open");
    mainMenu?.setAttribute("aria-hidden", "true");
    menuTrigger?.setAttribute("aria-expanded", "false");
    setBackdrop(false);
    if (menuWasOpen) menuTrigger?.focus();
    if (appearanceWasOpen) restoreAppearanceButton?.focus();
  }

  menuTrigger?.addEventListener("click", () => {
    body.classList.remove("appearance-open");
    body.classList.add("menu-open");
    mainMenu?.setAttribute("aria-hidden", "false");
    menuTrigger.setAttribute("aria-expanded", "true");
    setBackdrop(true);
    mainMenu?.querySelector("a")?.focus();
  });

  document.querySelectorAll("[data-close-drawers]").forEach((element) => element.addEventListener("click", closeDrawers));
  mainMenu?.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeDrawers));

  const closeBanner = document.querySelector("[data-close-banner]");
  closeBanner?.addEventListener("click", () => {
    document.querySelector("#site-banner")?.remove();
  });

  hideAppearanceButton?.addEventListener("click", () => {
    if (isNarrowScreen()) {
      closeDrawers();
      return;
    }
    preferences.appearanceHidden = true;
    savePreferences();
    applyPreferences();
    restoreAppearanceButton?.focus();
  });

  restoreAppearanceButton?.addEventListener("click", () => {
    if (isNarrowScreen()) {
      body.classList.remove("menu-open");
      body.classList.add("appearance-open");
      appearanceRail?.setAttribute("aria-hidden", "false");
      setBackdrop(true);
      hideAppearanceButton?.focus();
      return;
    }
    preferences.appearanceHidden = false;
    savePreferences();
    applyPreferences();
    hideAppearanceButton?.focus();
  });

  document.querySelectorAll('input[name="text-size"]').forEach((input) => {
    input.addEventListener("change", () => {
      preferences.textSize = input.value;
      savePreferences();
      applyPreferences({ announce: true });
    });
  });

  document.querySelectorAll('input[name="page-width"]').forEach((input) => {
    input.addEventListener("change", () => {
      preferences.pageWidth = input.value;
      savePreferences();
      applyPreferences({ announce: true });
    });
  });

  document.querySelectorAll('input[name="color-mode"]').forEach((input) => {
    input.addEventListener("change", () => {
      preferences.colorMode = input.value;
      savePreferences();
      applyPreferences({ announce: true });
    });
  });

  languageButton?.addEventListener("click", () => {
    const open = languageMenu?.hidden;
    if (languageMenu) languageMenu.hidden = !open;
    languageButton.setAttribute("aria-expanded", String(open));
  });

  document.querySelectorAll("[data-language]").forEach((button) => {
    button.addEventListener("click", () => {
      if (languageMenu) languageMenu.hidden = true;
      languageButton?.setAttribute("aria-expanded", "false");
      showToast(`已选择${button.dataset.language}（演示）`);
    });
  });

  enrichArticleLinks();

  document.querySelectorAll("[data-demo]").forEach((button) => {
    button.addEventListener("click", () => showToast(`${button.dataset.demo}为本地演示功能`));
  });

  searchToggle?.addEventListener("click", () => {
    setSearchExpanded(!searchForm?.classList.contains("is-expanded"));
  });

  searchForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const query = searchInput?.value.trim().toLocaleLowerCase() || "";
    if (!query) {
      showToast("请输入搜索内容");
      return;
    }
    const match = sections.find((section) => section.textContent.toLocaleLowerCase().includes(query));
    if (!match) {
      showToast(`没有找到“${searchInput.value.trim()}”`);
      return;
    }
    match.scrollIntoView({ behavior: "smooth", block: "start" });
    match.classList.add("search-flash");
    window.setTimeout(() => match.classList.remove("search-flash"), 1500);
    if (isNarrowScreen()) setSearchExpanded(false);
    showToast(`已定位“${searchInput.value.trim()}”`);
  });

  document.querySelector("[data-collapse-toc]")?.addEventListener("click", (event) => {
    const toc = document.querySelector("#toc");
    if (!toc) return;
    const collapsed = toc.hidden;
    toc.hidden = !collapsed;
    event.currentTarget.textContent = collapsed ? "隐藏" : "显示";
  });

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (!visible) return;
      tocLinks.forEach((link) => link.classList.toggle("is-active", link.getAttribute("href") === `#${visible.target.id}`));
    }, { rootMargin: "-12% 0px -74%", threshold: 0 });
    sections.forEach((section) => observer.observe(section));
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      if (languageMenu) languageMenu.hidden = true;
      languageButton?.setAttribute("aria-expanded", "false");
      closeDrawers();
    }
  });

  window.addEventListener("resize", () => {
    if (!isNarrowScreen()) {
      body.classList.remove("appearance-open");
      setBackdrop(body.classList.contains("menu-open"));
      applyPreferences();
    }
  });

  applyPreferences();
})();
