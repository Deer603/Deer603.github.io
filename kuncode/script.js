(() => {
  const RELEASE_BASE = "https://github.com/Roylyl/KunCode/releases";
  const meta = name => document.querySelector(`meta[name="${name}"]`)?.content || "";
  // The release tag includes V; the installer filenames use the product version.
  const tag = meta("kuncode-release");
  const version = meta("kuncode-version");
  const releaseUrl = tag ? `${RELEASE_BASE}/tag/${encodeURIComponent(tag)}` : RELEASE_BASE;
  const downloadLinks = new Map();

  document.querySelectorAll("[data-release-version]").forEach(element => {
    if (version) element.textContent = version;
  });
  document.querySelectorAll("[data-release-link]").forEach(link => {
    link.href = releaseUrl;
  });
  document.querySelectorAll("[data-download]").forEach(link => {
    const platform = link.dataset.download;
    const template = meta(`kuncode-${platform}-asset`);
    if (!tag || !version || !template) return;
    const filename = template.replaceAll("{version}", version);
    link.href = `${RELEASE_BASE}/download/${encodeURIComponent(tag)}/${encodeURIComponent(filename)}`;
    downloadLinks.set(platform, link.href);
    const label = document.querySelector(`[data-filename="${platform}"]`);
    if (label) label.textContent = filename;
  });

  const primary = document.getElementById("primaryDownload");
  const hint = document.getElementById("primaryHint");
  const text = document.getElementById("primaryText");
  const platform = navigator.userAgentData?.platform || navigator.platform || "";
  const ua = navigator.userAgent || "";
  const isMobile = Boolean(navigator.userAgentData?.mobile) || /iPhone|iPad|iPod|Android/i.test(ua) || (/Mac/i.test(platform) && navigator.maxTouchPoints > 1);
  const isMac = !isMobile && (/Mac/i.test(platform) || /Macintosh|Mac OS X/i.test(ua));
  const isWindows = !isMobile && (/Win/i.test(platform) || /Windows/i.test(ua));

  if (primary && hint && text) {
    if (isMac) {
      // Browsers do not reliably distinguish Apple Silicon from Intel Macs.
      primary.href = "#download";
      hint.textContent = "检测到macOS，请确认处理器";
      text.textContent = "选择Mac安装包";
      document.querySelectorAll('[data-platform^="mac-"]').forEach(card => {
        card.classList.add("detected");
      });
    } else if (isWindows && downloadLinks.has("windows")) {
      primary.href = downloadLinks.get("windows");
      hint.textContent = "适用于Windows10及以上 · x64";
      text.textContent = `下载KunCode${version}`;
      const card = document.querySelector('[data-platform="windows"]');
      card?.classList.add("detected");
      const badge = card?.querySelector("[data-platform-badge]");
      if (badge) badge.textContent = "Windows x64";
    } else {
      hint.textContent = "Windows与macOS安装版";
      text.textContent = `获取KunCode${version}`;
    }
  }

  // Static conversation examples displayed by the website.
  const scenes = {
    npm: {
      question: "npm安装失败，应该先看哪里？",
      answer: "先看第一条真正的错误\n网络、权限和依赖冲突分别排\n只看最后一行安装失败还不够",
      reflection: "第一条错误支持哪一种判断？你准备怎样验证？"
    },
    paper: {
      question: "论文题目太大，选题范围收不住。",
      answer: "把对象缩到一个场景\n先问手里的材料撑不撑得住",
      reflection: "现有材料能回答哪个具体问题？你会怎样缩小研究范围？"
    },
    team: {
      question: "小组任务全压给我，最后都要我收尾。",
      answer: "这分工失衡了\n把原分工和剩余工作摆出来\n谁接哪块现在说清",
      reflection: "哪些事实能说明分工失衡？下一次沟通要明确什么？"
    }
  };
  const question = document.getElementById("demoQuestion");
  const answer = document.getElementById("demoAnswer");
  const reflection = document.getElementById("demoReflection");
  document.querySelectorAll("[data-scene]").forEach(button => {
    button.addEventListener("click", () => {
      const scene = scenes[button.dataset.scene];
      if (!scene || !question || !answer) return;
      document.querySelectorAll("[data-scene]").forEach(control => {
        control.setAttribute("aria-pressed", String(control === button));
      });
      question.textContent = scene.question;
      answer.textContent = scene.answer;
      if (reflection) reflection.textContent = scene.reflection;
    });
  });
})();
