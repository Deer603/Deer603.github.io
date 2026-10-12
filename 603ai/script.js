(() => {
  "use strict";

  const meta = name => document.querySelector(`meta[name="${name}"]`)?.content.trim() || "";
  const httpsUrl = value => {
    if (!value) return "";
    try {
      const url = new URL(value);
      return url.protocol === "https:" && !url.username && !url.password ? url.href : "";
    } catch {
      return "";
    }
  };

  // The installation package and release page are configured independently.
  // An empty package URL keeps the page ready without implying a published APK.
  const apkUrl = httpsUrl(meta("603ai-apk-url"));
  const releaseUrl = httpsUrl(meta("603ai-release-url"));
  document.querySelectorAll("[data-apk-download]").forEach(link => {
    const label = link.querySelector("[data-download-label]");
    if (apkUrl) {
      link.href = apkUrl;
      link.removeAttribute("aria-disabled");
      link.removeAttribute("tabindex");
      link.removeAttribute("role");
      if (label) label.textContent = "下载Android安装包";
    } else {
      link.removeAttribute("href");
      link.setAttribute("role", "link");
      link.setAttribute("aria-disabled", "true");
      link.setAttribute("tabindex", "-1");
      if (label) label.textContent = "安装包即将提供";
      link.addEventListener("click", event => event.preventDefault());
    }
  });
  document.querySelectorAll("[data-release-link]").forEach(link => {
    link.hidden = !releaseUrl;
    if (releaseUrl) link.href = releaseUrl;
    else link.removeAttribute("href");
  });

  const releaseDate = meta("603ai-release-date");
  const apkSize = meta("603ai-apk-size");
  const dateLabel = document.getElementById("release-date");
  const sizeLabel = document.getElementById("release-size");
  if (releaseDate && dateLabel) dateLabel.textContent = releaseDate;
  if (apkSize && sizeLabel) sizeLabel.textContent = apkSize;
  const note = document.getElementById("release-note");
  if (apkUrl && note) note.textContent = "下载APK后，按照系统提示完成安装，即可选择角色开始对话。";

  const navToggle = document.querySelector("[data-nav-toggle]");
  const navMenu = document.querySelector("[data-nav-menu]");
  if (navToggle && navMenu) {
    const setMenuOpen = open => {
      navToggle.setAttribute("aria-expanded", String(open));
      navToggle.setAttribute("aria-label", open ? "关闭导航" : "打开导航");
      navToggle.classList.toggle("is-open", open);
      navMenu.classList.toggle("is-open", open);
    };
    setMenuOpen(false);
    navToggle.addEventListener("click", () => {
      setMenuOpen(navToggle.getAttribute("aria-expanded") !== "true");
    });
    navMenu.addEventListener("click", event => {
      if (event.target.closest("a")) setMenuOpen(false);
    });
    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && navToggle.getAttribute("aria-expanded") === "true") {
        setMenuOpen(false);
        navToggle.focus();
      }
    });
  }

  const progress = document.getElementById("scroll-progress");
  if (progress) {
    let framePending = false;
    const updateProgress = () => {
      const distance = document.documentElement.scrollHeight - window.innerHeight;
      const amount = distance > 0 ? Math.min(1, Math.max(0, window.scrollY / distance)) : 0;
      progress.style.transform = `scaleX(${amount})`;
      framePending = false;
    };
    const scheduleProgress = () => {
      if (framePending) return;
      framePending = true;
      window.requestAnimationFrame(updateProgress);
    };
    window.addEventListener("scroll", scheduleProgress, { passive: true });
    window.addEventListener("resize", scheduleProgress, { passive: true });
    updateProgress();
  }

})();
