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
      var input = $("input");
      var output = $("output");
      var pwd = $("pwd");
      var inCount = $("inCount");
      var outCount = $("outCount");
      var engine = $("engine");
      var engineTitle = $("engineTitle");
      var engineLog = $("engineLog");
      var engineBar = $("engineBar");
      var btns = ["btnEncrypt", "btnDecrypt", "btnSmart", "btnSwap", "btnClear", "btnCopy"]
        .map($);

      var busy = false;        // 引擎运行中，禁止重复触发
      var rafId = null;        // 当前逐字流式的动画句柄

      function updateCounts() {
        inCount.textContent = Array.from(input.value).length + " 字";
        outCount.textContent = Array.from(output.value).length + " 符号";
      }

      function setBusy(on) {
        busy = on;
        btns.forEach(function (b) { b.disabled = on; });
        if (on) output.classList.add("typing");
        else output.classList.remove("typing");
      }

      function toast(msg) {
        var t = document.createElement("div");
        t.className = "toast";
        t.textContent = msg;
        document.body.appendChild(t);
        requestAnimationFrame(function () { t.classList.add("show"); });
        setTimeout(function () {
          t.classList.remove("show");
          setTimeout(function () { document.body.removeChild(t); }, 250);
        }, 1600);
      }

      // 逐字速度：短文本每只慢一点（更有仪式感），长文本加快以免拖沓。
      // 返回一个符号的间隔毫秒，并兜底总时长不超过 ~3.5s。
      function pickSpeed(len) {
        var slow = 42, fast = 6;          // 单字符间隔上限 / 下限
        var t = Math.min(Math.max((len - 16) / (360 - 16), 0), 1);
        var ms = slow - t * (slow - fast);
        var maxTotal = 3500;
        if (len * ms > maxTotal) ms = Math.max(2, maxTotal / len);
        return ms;
      }

      // 基于时间的逐字流式输出：按经过时间补字符，长短文本都顺滑。
      function typewrite(text, onDone) {
        var perMs = pickSpeed(text.length);
        var i = 0, last = performance.now();
        output.value = "";
        updateCounts();
        function step(now) {
          if (!busy) return;             // 被新动作打断则停止
          var elapsed = now - last;
          var add = Math.max(1, Math.floor(elapsed / perMs));
          if (add > 0) {
            i = Math.min(text.length, i + add);
            output.value = text.slice(0, i);
            updateCounts();
            last = now;
          }
          if (i < text.length) {
            rafId = requestAnimationFrame(step);
          } else if (onDone) {
            onDone();
          }
        }
        rafId = requestAnimationFrame(step);
      }

      // 展示“加密引擎”运行过程，返回多久后开始逐字输出（毫秒）。
      function showEngine(mode, meta) {
        engine.hidden = false;
        engineTitle.textContent = mode === "encrypt" ? "🦌 鹿加密引擎" : "🔍 鹿解密引擎";
        engineLog.innerHTML = "";
        engineBar.style.width = "0%";
        var lines = mode === "encrypt"
          ? [
              "密钥派生完成 · FNV-1a 32-bit",
              "替换表已生成 · 16 符号洗牌",
              "正在把比特流编织进鹿群…"
            ]
          : [
              "识别密文符号 " + (meta || "若干") + " 个",
              "重建密钥流 · xorshift32",
              "逐字还原原文…"
            ];
        requestAnimationFrame(function () { engineBar.style.width = "100%"; });
        lines.forEach(function (txt, idx) {
          setTimeout(function () {
            var d = document.createElement("div");
            d.className = "engine-line";
            d.textContent = "· " + txt;
            engineLog.appendChild(d);
          }, 160 + idx * 210);
        });
        return 160 + lines.length * 210 + 220;
      }

      function runEngine(mode, compute, failMsg, okMsg) {
        if (busy) return;
        if (!input.value) { toast(mode === "encrypt" ? "先输入要隐藏的文字" : "先粘贴密文"); return; }
        setBusy(true);
        var meta = mode === "decrypt"
          ? Array.from(input.value).filter(function (c) { return POOL.indexOf(c) !== -1; }).length
          : null;
        var wait = showEngine(mode, meta);
        setTimeout(function () {
          var res = compute();
          if (res === "" || res == null) {
            setBusy(false);
            toast(failMsg);
            return;
          }
          typewrite(res, function () {
            setBusy(false);
            toast(okMsg);
          });
        }, wait);
      }

      function doEncrypt() {
        runEngine("encrypt",
          function () { return encrypt(input.value, pwd.value); },
          "加密失败，请重试",
          "已藏入鹿群 🦌");
      }

      function doDecrypt() {
        runEngine("decrypt",
          function () { return decrypt(input.value, pwd.value); },
          "无法还原：密码不符或密文受损",
          "已现出原形 🌿");
      }

      function doSmart() {
        if (busy) return;
        if (!input.value) { toast("先输入内容"); return; }
        if (looksLikeCipher(input.value)) doDecrypt();
        else doEncrypt();
      }

      function doSwap() {
        if (busy) return;
        var tmp = input.value; input.value = output.value; output.value = tmp;
        updateCounts();
      }
      function doClear() {
        if (busy) return;
        input.value = ""; output.value = ""; engine.hidden = true; updateCounts();
      }

      function doCopy() {
        if (busy) return;
        if (!output.value) { toast("没有可复制的结果"); return; }
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(output.value).then(
            function () { toast("已复制 📋"); },
            function () { fallbackCopy(); }
          );
        } else { fallbackCopy(); }
        function fallbackCopy() {
          output.removeAttribute("readonly");
          output.select();
          try { document.execCommand("copy"); toast("已复制 📋"); }
          catch (e) { toast("复制失败，请手动选择"); }
          output.setAttribute("readonly", "readonly");
          if (window.getSelection) window.getSelection().removeAllRanges();
        }
      }

      $("btnEncrypt").addEventListener("click", doEncrypt);
      $("btnDecrypt").addEventListener("click", doDecrypt);
      $("btnSmart").addEventListener("click", doSmart);
      $("btnSwap").addEventListener("click", doSwap);
      $("btnClear").addEventListener("click", doClear);
      $("btnCopy").addEventListener("click", doCopy);
      input.addEventListener("input", updateCounts);
      updateCounts();
    });
  }
})();
