/* 加密鹿 — 自然语言加密 / 解密核心逻辑（隐蔽版）
 *
 * 设计目标：密文看起来只是一串鹿主题符号，无法从外形判断哪些是数据、
 * 哪些是装饰，也不知道替换规则。没有相同密码则无法还原。
 *
 * 符号池 POOL（鹿/🦌 在内，其余为森林主题符号）：
 *   数据符号从 POOL 中按“密钥派生的替换表”选取；
 *   数据符号之间会插入若干“填充符号”，填充也取自 POOL，
 *   且偏向鹿/🦌，使密文整体以鹿/🦌 为主、杂以其它符号。
 *
 * 编码：明文 -> UTF-8 字节 -> 比特流（先写 32 位长度，再写字节）
 *   -> 按 4 比特一组（nibble）映射为数据符号；
 *   每个数据符号前插入 0..MAX_GAP 个填充符号（数量由密钥流决定）。
 * 解码：用相同密码重建替换表与密钥流，按相同节奏跳过填充、取数据符号还原。
 */
(function () {
  "use strict";

  // 符号池：鹿、🦌 以及其它森林/夜空主题符号
  var POOL = [
    "鹿", "🦌", "🌿", "🍃", "✨", "🌟", "💫", "🌈",
    "🍀", "🐾", "🌸", "💮", "🌺", "🌼", "⭐", "🌙"
  ];
  var K = POOL.length; // 16，每符号承载 4 比特
  var MAX_GAP = 3; // 每个数据符号前最多插入的填充符号数

  function fnv1a(bytes) {
    var h = 0x811c9dc5;
    for (var i = 0; i < bytes.length; i++) {
      h ^= bytes[i];
      h = Math.imul(h, 0x01000193);
    }
    return h >>> 0;
  }

  // xorshift32 密钥流
  function makePRNG(seed) {
    var s = seed >>> 0;
    return function () {
      s ^= s << 13; s >>>= 0;
      s ^= s >> 17;
      s ^= s << 5; s >>>= 0;
      return s >>> 0;
    };
  }

  // 由种子生成稳定的替换表（密钥相关洗牌）
  function keyedPerm(seed) {
    var prng = makePRNG(seed);
    var perm = [];
    for (var i = 0; i < K; i++) perm.push(i);
    for (var j = K - 1; j > 0; j--) {
      var r = prng() % (j + 1);
      var t = perm[j]; perm[j] = perm[r]; perm[r] = t;
    }
    return perm;
  }

  // 填充符号：约一半概率为 鹿/🦌，其余从池中均匀取
  function pickFiller(prng) {
    var x = prng();
    if (x % 2 === 0) return (x % 4 < 2) ? "鹿" : "🦌";
    return POOL[prng() % K];
  }

  function encrypt(text, password) {
    var seed = fnv1a(new TextEncoder().encode(password || ""));
    var perm = keyedPerm(seed);
    var gapPRNG = makePRNG((seed ^ 0x9e3779b9) >>> 0);
    var fillPRNG = makePRNG((seed ^ 0x85ebca6b) >>> 0);

    var bytes = new TextEncoder().encode(text);
    var nibbles = [];
    // 32 位明文长度（大端，拆成 8 个 4 比特组）
    var len = bytes.length;
    for (var i = 7; i >= 0; i--) nibbles.push((len >>> (i * 4)) & 0xf);
    for (var b = 0; b < bytes.length; b++) {
      nibbles.push((bytes[b] >>> 4) & 0xf, bytes[b] & 0xf);
    }

    var out = "";
    for (var n = 0; n < nibbles.length; n++) {
      var gap = gapPRNG() % (MAX_GAP + 1);
      for (var g = 0; g < gap; g++) out += pickFiller(fillPRNG);
      out += POOL[perm[nibbles[n]]];
    }
    return out;
  }

  function decrypt(cipher, password) {
    // 仅保留符号池内的字符，剔除复制粘贴带入的空格/换行等噪声
    var clean = Array.from(cipher).filter(function (ch) {
      return POOL.indexOf(ch) !== -1;
    }).join("");
    if (!clean) return "";

    var seed = fnv1a(new TextEncoder().encode(password || ""));
    var perm = keyedPerm(seed);
    var inv = new Array(K);
    for (var i = 0; i < K; i++) inv[perm[i]] = i;
    var gapPRNG = makePRNG((seed ^ 0x9e3779b9) >>> 0);

    var chars = Array.from(clean);
    var nibs = [];
    var pos = 0;
    while (pos < chars.length) {
      var gap = gapPRNG() % (MAX_GAP + 1);
      pos += gap;
      if (pos >= chars.length) break;
      var idx = POOL.indexOf(chars[pos]);
      pos++;
      if (idx === -1) continue; // 理论上不会发生（已过滤）
      nibs.push(inv[idx]);
    }

    if (nibs.length < 8) return "";
    var L = 0;
    for (var k = 0; k < 8; k++) L = (L << 4) | nibs[k];
    var payload = nibs.slice(8);
    if (payload.length < L * 2) return ""; // 密文不完整

    var bytes = new Uint8Array(L);
    for (var m = 0; m < L; m++) {
      bytes[m] = ((payload[m * 2] << 4) | payload[m * 2 + 1]) & 0xff;
    }
    return new TextDecoder().decode(bytes);
  }

  // 是否看起来像本工具的密文（符号池占比高）
  function looksLikeCipher(text) {
    var all = Array.from(text);
    if (all.length < 4) return false;
    var pool = all.filter(function (ch) { return POOL.indexOf(ch) !== -1; }).length;
    return pool / all.length > 0.6;
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { encrypt: encrypt, decrypt: decrypt, POOL: POOL, looksLikeCipher: looksLikeCipher };
  }

  if (typeof document !== "undefined") {
    document.addEventListener("DOMContentLoaded", function () {
      var $ = function (id) { return document.getElementById(id); };
      var input = $("input"), output = $("output"), pwd = $("pwd");
      var workspace = document.querySelector(".workspace");
      var busy = false, toastTimer = null;
      var controls = ["btnEncrypt", "btnDecrypt", "btnSmart", "btnSwap", "btnClear", "btnExample", "btnToggleKey"].map($);

      function updateCounts() {
        $("inCount").textContent = Array.from(input.value).length + "字";
        $("outCount").textContent = Array.from(output.value).length + "字符";
        $("btnCopy").disabled = busy || !output.value;
        $("btnSwap").disabled = busy || (!input.value && !output.value);
        $("btnClear").disabled = busy || (!input.value && !output.value);
      }
      function setStatus(text) {
        var dot = document.createElement("span");
        dot.className = "live-dot";
        $("workspaceStatus").replaceChildren(dot, document.createTextNode(text));
      }
      function setBusy(on) {
        busy = on;
        workspace.setAttribute("aria-busy", String(on));
        controls.forEach(function (button) { button.disabled = on; });
        input.readOnly = on;
        pwd.disabled = on;
        updateCounts();
      }
      function toast(message) {
        clearTimeout(toastTimer);
        $("toast").textContent = message;
        $("toast").classList.add("show");
        toastTimer = setTimeout(function () { $("toast").classList.remove("show"); }, 2400);
      }
      function resetResult() {
        output.value = "";
        $("resultLabel").textContent = "转换结果";
        $("resultHint").textContent = "等待转换";
        setStatus("准备就绪");
      }
      // 按Unicode字符推进，长结果按帧追加，输出预算小于两秒。
      function animateOutput(text, startedAt, onDone) {
        var characters = Array.from(text);
        var start = performance.now();
        var remaining = Math.max(0, 1850 - (start - startedAt));
        var duration = Math.min(remaining, Math.max(180, Math.min(1800, characters.length * 18)));
        var shown = 0, frameId = null, finished = false;
        function finish() {
          if (finished) return;
          finished = true;
          cancelAnimationFrame(frameId);
          clearTimeout(deadlineTimer);
          output.value = text;
          updateCounts();
          onDone();
        }
        function frame(now) {
          if (finished) return;
          var progress = duration === 0 ? 1 : Math.min(1, (now - start) / duration);
          var count = Math.floor(characters.length * progress);
          if (count > shown) {
            output.value += characters.slice(shown, count).join("");
            shown = count;
            updateCounts();
          }
          if (progress >= 1) finish();
          else frameId = requestAnimationFrame(frame);
        }
        var deadlineTimer = setTimeout(finish, remaining);
        frameId = requestAnimationFrame(frame);
      }
      function runEngine(mode) {
        if (busy) return;
        if (!input.value) { toast(mode === "encrypt" ? "先写一句想藏起来的话" : "先粘贴需要还原的鹿群密文"); input.focus(); return; }
        var source = input.value, password = pwd.value, startedAt = performance.now();
        resetResult();
        setBusy(true);
        setStatus(mode === "encrypt" ? "正在藏入鹿群" : "正在还原文字");
        requestAnimationFrame(function () {
          try {
            var result = mode === "encrypt" ? encrypt(source, password) : decrypt(source, password);
            if (!result) throw new Error("empty-result");
            $("resultLabel").textContent = mode === "encrypt" ? "鹿群密文" : "还原的文字";
            $("resultHint").textContent = "正在逐字输出…";
            animateOutput(result, startedAt, function () {
              $("resultHint").textContent = mode === "encrypt" ? "已加密，可复制分享" : "已还原";
              setStatus("转换完成");
              setBusy(false);
              toast(mode === "encrypt" ? "文字已藏进鹿群" : "文字已从森林里现身");
            });
          } catch (error) {
            $("resultHint").textContent = mode === "decrypt" ? "请确认密钥一致，并保留完整密文" : "请尝试缩短内容后重新转换";
            setStatus("需要重试");
            setBusy(false);
            toast(mode === "decrypt" ? "暂时无法还原，请检查密钥和密文" : "转换未完成，请重试");
          }
        });
      }
      function doSmart() { if (!busy) runEngine(looksLikeCipher(input.value) ? "decrypt" : "encrypt"); }
      function doSwap() {
        if (busy) return;
        var previous = input.value;
        input.value = output.value;
        output.value = previous;
        $("resultLabel").textContent = "交换后的内容";
        $("resultHint").textContent = "继续转换，或复制当前内容";
        setStatus("已交换");
        updateCounts();
        input.focus();
      }
      function doClear() {
        if (busy) return;
        input.value = "";
        resetResult();
        updateCounts();
        input.focus();
      }
      function fallbackCopy() {
        var active = document.activeElement;
        output.focus(); output.select();
        var copied = false;
        try { copied = document.execCommand("copy"); } catch (error) {}
        if (active && typeof active.focus === "function") active.focus();
        toast(copied ? "已复制，带着鹿群去传话吧" : "未能自动复制，请选中结果手动复制");
      }
      function doCopy() {
        if (busy || !output.value) return;
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(output.value).then(function () { toast("已复制，带着鹿群去传话吧"); }, fallbackCopy);
        } else { fallbackCopy(); }
      }
      $("btnEncrypt").addEventListener("click", function () { runEngine("encrypt"); });
      $("btnDecrypt").addEventListener("click", function () { runEngine("decrypt"); });
      $("btnSmart").addEventListener("click", doSmart);
      $("btnSwap").addEventListener("click", doSwap);
      $("btnClear").addEventListener("click", doClear);
      $("btnCopy").addEventListener("click", doCopy);
      $("btnExample").addEventListener("click", function () {
        if (busy) return;
        input.value = "今晚603见，记得带上你的好心情。";
        resetResult(); updateCounts(); input.focus();
        toast("示例已填入，试试鹿加密");
      });
      $("btnToggleKey").addEventListener("click", function () {
        var visible = pwd.type === "password";
        pwd.type = visible ? "text" : "password";
        this.textContent = visible ? "隐藏" : "显示";
        this.setAttribute("aria-label", visible ? "隐藏密钥" : "显示密钥");
        this.setAttribute("aria-pressed", String(visible));
      });
      input.addEventListener("input", updateCounts);
      input.addEventListener("keydown", function (event) {
        if ((event.ctrlKey || event.metaKey) && event.key === "Enter" && !event.isComposing) {
          event.preventDefault(); doSmart();
        }
      });
      updateCounts();
    });
  }
})();
