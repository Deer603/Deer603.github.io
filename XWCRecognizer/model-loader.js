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

function loadScript(path, available) {
  if (available()) return Promise.resolve();
  if (runtimeScripts.has(path)) return runtimeScripts.get(path);
  const task = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = new URL(path, import.meta.url).href;
    script.onload = () => {
      if (available()) resolve();
      else { script.remove(); reject(new Error('浏览器无法初始化运行库：' + path)); }
    };
    script.onerror = () => { script.remove(); reject(new Error('运行库下载失败：' + path + '。请检查网络后重试。')); };
    document.head.append(script);
  }).catch(error => { runtimeScripts.delete(path); throw error; });
  runtimeScripts.set(path, task);
  return task;
}

export async function loadRuntime(report) {
  if (!globalThis.WebAssembly) throw new Error('当前浏览器不支持WebAssembly，请使用较新的浏览器。');
  report(0, '正在下载识别运行库');
  await Promise.all([
    loadScript('./vendor/face-api.js', () => !!globalThis.faceapi),
    loadScript('./vendor/ort/ort.wasm.min.js', () => !!globalThis.ort),
  ]);
}

export async function loadModels(api, report) {
  const controller = new AbortController();
  const total = assets.reduce((sum, asset) => sum + asset[1], 0);
  let loaded = 0;
  let previousPercent = -1;
  const progress = () => {
    const percent = Math.min(89, 5 + Math.floor(loaded / total * 84));
    if (percent === previousPercent) return;
    previousPercent = percent;
    report(percent, `正在下载模型与WASM：${(loaded / 1e6).toFixed(1)}/${(total / 1e6).toFixed(1)}MB`);
  };
  progress();
  try {
    const contents = await Promise.all(assets.map(async ([path]) => {
      let response;
      try { response = await fetch(new URL('./' + path, import.meta.url), { signal: controller.signal }); }
      catch (error) {
        if (error.name === 'AbortError') throw error;
        throw new Error('下载失败：' + path + '。请检查网络后重试。');
      }
      if (!response.ok) throw new Error(`文件加载失败（HTTP${response.status}）：${path}`);
      const reader = response.body?.getReader();
      if (!reader) {
        const bytes = new Uint8Array(await response.arrayBuffer());
        loaded += bytes.length;
        progress();
        return [path, bytes];
      }
      const chunks = [];
      let length = 0;
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        length += value.length;
        loaded += value.length;
        progress();
      }
      const bytes = new Uint8Array(length);
      let offset = 0;
      for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
      return [path, bytes];
    }));
    const buffers = new Map(contents);
    report(90, '下载完成，正在初始化人脸识别模型');
    for (const [name, net] of [['ssd_mobilenetv1', api.nets.ssdMobilenetv1], ['face_landmark_68', api.nets.faceLandmark68Net], ['face_recognition', api.nets.faceRecognitionNet]]) {
      const manifest = JSON.parse(new TextDecoder().decode(buffers.get('models/' + name + '_model-weights_manifest.json')));
      const weights = api.tf.io.decodeWeights(buffers.get('models/' + name + '_model.bin').buffer, manifest.flatMap(group => group.weights));
      if (net.isLoaded) net.dispose();
      net.loadFromWeightMap(weights);
    }
    report(93, 'WASM下载完成，正在初始化第二模型');
    try {
      await loadSFace(buffers.get('models/face_recognition_sface_2021dec.onnx'), buffers.get('vendor/ort/ort-wasm-simd-threaded.wasm'));
    } catch (error) {
      throw new Error('第二模型初始化失败，请使用支持WebAssembly SIMD的较新浏览器。详情：' + error.message);
    }
    report(96, '正在读取人物资料');
  } catch (error) { controller.abort(); throw error; }
}
