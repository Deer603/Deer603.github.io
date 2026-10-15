import { loadSFace } from './sface.js';

const assets = [
  ['models/ssd_mobilenetv1_model-weights_manifest.json', 28233],
  ['models/ssd_mobilenetv1_model.bin', 5616957],
  ['models/face_landmark_68_model-weights_manifest.json', 8485],
  ['models/face_landmark_68_model.bin', 356840],
  ['models/face_recognition_model-weights_manifest.json', 19615],
  ['models/face_recognition_model.bin', 6444032],
  ['models/face_recognition_sface_2021dec.onnx', 38696353],
  ['vendor/ort/ort-wasm-simd-threaded.wasm', 14239897],
];

const runtimeScripts = new Map();
const IDLE_TIMEOUT_MS = 60_000;

function loadingError(message, cause, detail) {
  const error = new Error(message);
  if (cause !== undefined) error.cause = cause;
  if (detail !== undefined) error.detail = detail;
  return error;
}

function cancelledError(cause) {
  const error = loadingError('加载已取消', cause);
  error.name = 'AbortError';
  return error;
}

function timeoutError(path) {
  const error = loadingError('加载超时，请检查网络后重试。', undefined, { path, timeoutMs: IDLE_TIMEOUT_MS });
  error.name = 'TimeoutError';
  return error;
}

function throwIfAborted(signal) {
  if (signal.aborted) throw signal.reason || cancelledError();
}

function linkedController(signal) {
  const controller = new AbortController();
  const abort = () => controller.abort(cancelledError(signal.reason));
  if (signal?.aborted) abort();
  else signal?.addEventListener('abort', abort, { once: true });
  return { controller, unlink: () => signal?.removeEventListener('abort', abort) };
}

function waitFor(task, signal) {
  return new Promise((resolve, reject) => {
    const cleanup = () => signal.removeEventListener('abort', abort);
    const abort = () => { cleanup(); reject(signal.reason || cancelledError()); };
    signal.addEventListener('abort', abort, { once: true });
    Promise.resolve(task).then(
      value => { cleanup(); resolve(value); },
      error => { cleanup(); reject(error); },
    );
    if (signal.aborted) abort();
  });
}

function loadScript(path, available, signal) {
  throwIfAborted(signal);
  if (available()) return Promise.resolve();
  let entry = runtimeScripts.get(path);
  if (!entry) {
    entry = { controller: new AbortController(), users: 0 };
    const task = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      const scriptSignal = entry.controller.signal;
      const finish = error => {
        clearTimeout(timer);
        scriptSignal.removeEventListener('abort', abort);
        script.onload = script.onerror = null;
        script.remove();
        if (error) reject(error);
        else resolve();
      };
      const abort = () => finish(scriptSignal.reason || cancelledError());
      const timer = setTimeout(() => finish(timeoutError(path)), IDLE_TIMEOUT_MS);
      script.src = new URL(path, import.meta.url).href;
      script.onload = () => finish(available() ? undefined : loadingError('识别准备失败，请更新浏览器后重试。', undefined, { path }));
      script.onerror = event => finish(loadingError('资源下载失败，请检查网络后重试。', event, { path }));
      scriptSignal.addEventListener('abort', abort, { once: true });
      try { document.head.append(script); }
      catch (error) { finish(loadingError('识别准备失败，请刷新后重试。', error, { path })); }
    });
    entry.task = task.finally(() => {
      if (runtimeScripts.get(path) === entry) runtimeScripts.delete(path);
    });
    runtimeScripts.set(path, entry);
  }
  // A shared script stays alive while another caller still needs it.
  entry.users++;
  return waitFor(entry.task, signal).finally(() => {
    if (--entry.users === 0) entry.controller.abort(cancelledError());
  });
}

export async function loadRuntime(report, { signal } = {}) {
  const { controller, unlink } = linkedController(signal);
  try {
    throwIfAborted(controller.signal);
    if (!globalThis.WebAssembly) throw new Error('当前浏览器暂不支持识别，请更新浏览器后重试。');
    report(null, '正在准备…');
    await Promise.all([
      loadScript('./vendor/face-api.js', () => !!globalThis.faceapi, controller.signal),
      loadScript('./vendor/ort/ort.wasm.min.js', () => !!globalThis.ort, controller.signal),
    ]);
    throwIfAborted(controller.signal);
  } catch (error) {
    controller.abort(error);
    throw error;
  } finally { unlink(); }
}

export async function loadModels(api, report, { signal } = {}) {
  const { controller, unlink } = linkedController(signal);
  const total = assets.reduce((sum, asset) => sum + asset[1], 0);
  let loaded = 0;
  let previousPercent = -1;
  const progress = () => {
    throwIfAborted(controller.signal);
    const percent = Math.min(89, 5 + Math.floor(loaded / total * 84));
    if (percent === previousPercent) return;
    previousPercent = percent;
    report(percent, `正在下载识别资源：${(loaded / 1e6).toFixed(1)}/${(total / 1e6).toFixed(1)}MB`);
  };
  try {
    progress();
    const contents = await Promise.all(assets.map(async ([path]) => {
      let timer, reader;
      const resetTimeout = () => {
        clearTimeout(timer);
        timer = setTimeout(() => controller.abort(timeoutError(path)), IDLE_TIMEOUT_MS);
      };
      try {
        throwIfAborted(controller.signal);
        resetTimeout();
        const response = await waitFor(fetch(new URL('./' + path, import.meta.url), { signal: controller.signal }), controller.signal);
        if (!response.ok) throw loadingError(`资源下载失败（HTTP${response.status}），请稍后重试。`, undefined, { path });
        resetTimeout();
        reader = response.body?.getReader();
        if (!reader) {
          const bytes = new Uint8Array(await waitFor(response.arrayBuffer(), controller.signal));
          loaded += bytes.length;
          progress();
          return [path, bytes];
        }
        const chunks = [];
        let length = 0;
        for (;;) {
          throwIfAborted(controller.signal);
          const { done, value } = await waitFor(reader.read(), controller.signal);
          if (done) break;
          chunks.push(value);
          length += value.length;
          loaded += value.length;
          if (value.length) resetTimeout();
          progress();
        }
        const bytes = new Uint8Array(length);
        let offset = 0;
        for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
        return [path, bytes];
      } catch (error) {
        throwIfAborted(controller.signal);
        throw loadingError('资源下载失败，请检查网络后重试。', error, { path });
      } finally {
        clearTimeout(timer);
        // The aborted request may still have a pending read in some browsers.
        try { reader?.releaseLock(); } catch { /* Keep the original loading error. */ }
      }
    }));
    throwIfAborted(controller.signal);
    const buffers = new Map(contents);
    report(90, '下载完成，正在准备识别');
    try {
      for (const [name, net] of [['ssd_mobilenetv1', api.nets.ssdMobilenetv1], ['face_landmark_68', api.nets.faceLandmark68Net], ['face_recognition', api.nets.faceRecognitionNet]]) {
        throwIfAborted(controller.signal);
        const manifest = JSON.parse(new TextDecoder().decode(buffers.get('models/' + name + '_model-weights_manifest.json')));
        const weights = api.tf.io.decodeWeights(buffers.get('models/' + name + '_model.bin').buffer, manifest.flatMap(group => group.weights));
        if (net.isLoaded) net.dispose();
        net.loadFromWeightMap(weights);
      }
      throwIfAborted(controller.signal);
      report(93, '即将完成，请稍候…');
      throwIfAborted(controller.signal);
      // Initialization cannot be interrupted; settle it before allowing a retry.
      await loadSFace(buffers.get('models/face_recognition_sface_2021dec.onnx'), buffers.get('vendor/ort/ort-wasm-simd-threaded.wasm'));
    } catch (error) {
      throwIfAborted(controller.signal);
      throw loadingError('识别初始化失败，请更新浏览器后重试。', error);
    }
    throwIfAborted(controller.signal);
    report(96, '正在读取人物资料');
  } catch (error) {
    controller.abort(error);
    throw error;
  } finally { unlink(); }
}
