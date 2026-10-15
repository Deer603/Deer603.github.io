/* 界面只负责状态与逐字显示，转换在Worker中执行。 */
(function () {
  "use strict";
  if (typeof module !== "undefined" && module.exports) {
    module.exports = require("./codec-core.js");
    return;
  }
  var workerUrl = new URL("worker.js?v=1", document.currentScript.src);
  document.addEventListener("DOMContentLoaded", function () {
    var $ = function (id) { return document.getElementById(id); };
    var input = $("input"), output = $("output"), pwd = $("pwd");
    var workspace = document.querySelector(".workspace");
    var busy = false, toastTimer = null, worker = null, activeJob = null, jobId = 0;
    var inputCount = 0, outputCount = 0, resultReady = false;
    var controls = ["btnEncrypt", "btnDecrypt", "btnSmart", "btnSwap", "btnClear", "btnExample", "btnToggleKey"].map($);

    function countCharacters(text) { var count = 0; for (var character of text) count++; return count; }
    function updateCounts() {
      $("inCount").textContent = inputCount + "字";
      $("outCount").textContent = outputCount + "字符";
      $("btnCopy").disabled = busy || !resultReady || !output.value;
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
      output.value = ""; outputCount = 0; resultReady = false;
      $("resultLabel").textContent = "转换结果";
      $("resultHint").textContent = "等待转换";
      setStatus("准备就绪");
      updateCounts();
    }
    function finishJob() {
      if (!activeJob) return;
      clearTimeout(activeJob.timer);
      cancelAnimationFrame(activeJob.frame);
      activeJob = null;
    }
    function failJob(code) {
      finishJob();
      resetResult();
      var messages = {
        "text-limit": "原文最多4000字，请分段转换",
        "cipher-limit": "密文过长，请分段还原",
        "key-limit": "密钥最多256字符，请缩短后重试",
        "invalid-text": "原文含不完整字符，请重新粘贴",
        "invalid-cipher": "密文不完整、已损坏或密钥不一致",
        "timeout": "处理超时，请缩短内容后重试",
        "worker-unavailable": "当前环境无法转换，请通过HTTP预览或打开在线网页"
      };
      var message = messages[code] || "转换未完成，请重新尝试";
      $("resultHint").textContent = message;
      setStatus("需要重试");
      setBusy(false);
      toast(message);
    }
    function discardWorker() {
      if (worker) worker.terminate();
      worker = null;
    }
    function animateOutput(result, job) {
      clearTimeout(job.timer);
      var start = performance.now(), remaining = Math.max(0, 1850 - (start - job.startedAt));
      var duration = Math.min(remaining, Math.max(180, Math.min(1500, result.ends.length * 18)));
      var shown = 0, lastPaint = 0;
      function finish() {
        if (activeJob !== job) return;
        output.value = result.text; outputCount = result.ends.length; resultReady = true;
        finishJob();
        $("resultHint").textContent = result.mode === "encrypt" ? "已加密，可复制分享" : result.format === "legacy" ? "已还原旧版密文，旧版不含内容校验" : "已还原，内容校验通过";
        setStatus("转换完成");
        setBusy(false);
        toast(result.mode === "encrypt" ? "文字已藏进鹿群" : "文字已从森林里现身");
      }
      function frame(now) {
        if (activeJob !== job) return;
        var progress = duration === 0 ? 1 : Math.min(1, (now - start) / duration);
        if (progress >= 1) { finish(); return; }
        var count = Math.floor(result.ends.length * progress);
        // 字符边界由Worker一次计算；最多每40ms刷新，避免长结果逐帧重新扫描。
        if (count > shown && now - lastPaint >= 40) {
          output.value = result.text.slice(0, result.ends[count - 1]);
          shown = count; lastPaint = now; outputCount = count;
          $("outCount").textContent = outputCount + "字符";
        }
        job.frame = requestAnimationFrame(frame);
      }
      job.timer = setTimeout(finish, remaining);
      job.frame = requestAnimationFrame(frame);
    }
    function ensureWorker() {
      if (worker) return;
      worker = new Worker(workerUrl);
      worker.onmessage = function (event) {
        var job = activeJob, data = event.data;
        if (!job || data.id !== job.id) return;
        if (data.error) { failJob(data.error); return; }
        var result = data.result;
        $("resultLabel").textContent = result.mode === "encrypt" ? "鹿群密文" : "还原的文字";
        $("resultHint").textContent = "正在逐字输出…";
        animateOutput(result, job);
      };
      worker.onerror = function (event) {
        event.preventDefault();
        discardWorker();
        if (activeJob) failJob("worker-unavailable");
      };
      worker.onmessageerror = function () {
        discardWorker();
        if (activeJob) failJob("conversion-failed");
      };
    }
    function runEngine(mode) {
      if (busy) return;
      if (!input.value) { toast(mode === "decrypt" ? "先粘贴需要还原的鹿群密文" : "先写一句想藏起来的话"); input.focus(); return; }
      resetResult();
      if (input.value.length > 300000 || inputCount > 150000) { failJob("cipher-limit"); return; }
      if (mode === "encrypt" && inputCount > 4000) { failJob("text-limit"); return; }
      if (pwd.value.length > 256) { failJob("key-limit"); return; }
      setBusy(true);
      setStatus(mode === "encrypt" ? "正在藏入鹿群" : mode === "decrypt" ? "正在还原文字" : "正在识别并转换");
      var job = { id: ++jobId, startedAt: performance.now(), frame: null, timer: null };
      activeJob = job;
      // 为逐字显示留出时间；超时终止Worker，避免后台仍继续计算。
      job.timer = setTimeout(function () {
        if (activeJob !== job) return;
        discardWorker(); failJob("timeout");
      }, 1000);
      try {
        ensureWorker();
        worker.postMessage({ id: job.id, mode: mode, text: input.value, password: pwd.value });
      } catch (error) { discardWorker(); failJob("worker-unavailable"); }
    }
    function doSwap() {
      if (busy) return;
      var previous = input.value, previousCount = inputCount;
      input.value = output.value; inputCount = outputCount;
      output.value = previous; outputCount = previousCount; resultReady = true;
      $("resultLabel").textContent = "交换后的内容";
      $("resultHint").textContent = "继续转换，或复制当前内容";
      setStatus("已交换"); updateCounts(); input.focus();
    }
    function doClear() {
      if (busy) return;
      input.value = ""; inputCount = 0;
      resetResult(); input.focus();
    }
    function fallbackCopy(value) {
      var active = document.activeElement, temporary = document.createElement("textarea");
      temporary.value = value;
      temporary.setAttribute("aria-hidden", "true");
      temporary.style.cssText = "position:fixed;left:0;top:0;opacity:0;pointer-events:none";
      document.body.appendChild(temporary);
      temporary.focus(); temporary.select();
      var copied = false;
      try { copied = document.execCommand("copy"); } catch (error) {}
      temporary.remove();
      if (active && active.isConnected && typeof active.focus === "function") active.focus();
      toast(copied ? "已复制，带着鹿群去传话吧" : "未能自动复制，请选中结果手动复制");
    }
    function doCopy() {
      if (busy || !resultReady || !output.value) return;
      var value = output.value;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(value).then(function () { toast("已复制，带着鹿群去传话吧"); }, function () { fallbackCopy(value); });
      } else { fallbackCopy(value); }
    }
    function markChanged() {
      if (output.value) {
        resultReady = false;
        $("resultHint").textContent = "输入或密钥已修改，请重新转换";
        setStatus("等待重新转换");
      }
      updateCounts();
    }
    $("btnEncrypt").addEventListener("click", function () { runEngine("encrypt"); });
    $("btnDecrypt").addEventListener("click", function () { runEngine("decrypt"); });
    $("btnSmart").addEventListener("click", function () { runEngine("smart"); });
    $("btnSwap").addEventListener("click", doSwap);
    $("btnClear").addEventListener("click", doClear);
    $("btnCopy").addEventListener("click", doCopy);
    $("btnExample").addEventListener("click", function () {
      if (busy) return;
      input.value = "今晚603见，记得带上你的好心情。"; inputCount = countCharacters(input.value);
      resetResult(); input.focus();
      toast("示例已填入，试试鹿加密");
    });
    $("btnToggleKey").addEventListener("click", function () {
      var visible = pwd.type === "password";
      pwd.type = visible ? "text" : "password";
      this.textContent = visible ? "隐藏" : "显示";
      this.setAttribute("aria-label", visible ? "隐藏密钥" : "显示密钥");
      this.setAttribute("aria-pressed", String(visible));
    });
    input.addEventListener("input", function () { inputCount = countCharacters(input.value); markChanged(); });
    pwd.addEventListener("input", markChanged);
    input.addEventListener("keydown", function (event) {
      if ((event.ctrlKey || event.metaKey) && event.key === "Enter" && !event.isComposing) {
        event.preventDefault(); runEngine("smart");
      }
    });
    inputCount = countCharacters(input.value);
    updateCounts();
    try { ensureWorker(); } catch (error) { discardWorker(); }
    window.addEventListener("pagehide", function () {
      if (activeJob) {
        finishJob(); resetResult();
        $("resultHint").textContent = "转换已中断，请重新转换";
      }
      discardWorker(); setBusy(false);
    });
  });
})();
