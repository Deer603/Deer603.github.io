import { stabilizeMatches, validateProfiles, validDescriptor } from './core.js';
import { rankDualProfiles, dualDecision, validateSFaceLibrary } from './ensemble.js';
import { extractSFace } from './sface.js';
import { loadModels, loadRuntime } from './model-loader.js';
import { createResultsView } from './results-view.js';
import { createDiagnostics } from './diagnostics.js';

const $ = id => document.getElementById(id);
const state = { people: [], ready: false, models: false, loading: false, loadController: null, stream: null, opening: false, session: 0, timer: null, faces: [], mode: 'idle', toastTimer: null, photoJob: null, backgroundSince: 0, backgroundTimer: null };
const BACKGROUND_GRACE_MS = 30000;
const inputCanvas = document.createElement('canvas');
let results = [];
let sfacePeople = [];
const ctx = $('overlay').getContext('2d');
let detectionTail = Promise.resolve();
const resultsView = createResultsView($('match-list'), $('match-announcement'));
const diagnostics = createDiagnostics();
diagnostics.event('page_open', { online: navigator.onLine, hidden: document.hidden });

function diagnosticEnvironment() {
  const agent = navigator.userAgent;
  const browsers = [['Edge', /Edg(?:e|A|iOS)?\/(\d+)/], ['Firefox', /(?:Firefox|FxiOS)\/(\d+)/], ['Chrome', /(?:Chrome|CriOS)\/(\d+)/], ['Safari', /Version\/(\d+).*Safari/]];
  const browser = browsers.map(([name, pattern]) => ({ name, match: agent.match(pattern) })).find(item => item.match);
  return {
    browserName: browser?.name || 'Other', browserMajorVersion: browser ? Number(browser.match[1]) : null,
    language: navigator.language, viewportWidth: window.innerWidth, viewportHeight: window.innerHeight,
    secureContext: window.isSecureContext, online: navigator.onLine,
    wasmSupported: typeof WebAssembly !== 'undefined', webglSupported: typeof WebGLRenderingContext !== 'undefined',
  };
}

function exportLogs() {
  const button = $('export-logs');
  button.disabled = true;
  let url, link;
  try {
    diagnostics.event('export_requested');
    const data = diagnostics.exportData({ environment: diagnosticEnvironment() });
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' });
    url = URL.createObjectURL(blob);
    link = document.createElement('a');
    link.href = url;
    link.download = `urdeer-diagnostics-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    document.body.append(link);
    link.click();
    toast('日志已生成，请查看浏览器下载列表。');
  } catch (error) {
    console.error('Diagnostic export failed:', error);
    toast('日志暂时无法导出，请稍后重试。');
  } finally {
    link?.remove();
    if (url) setTimeout(() => URL.revokeObjectURL(url), 30000);
    button.disabled = false;
  }
}

function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}

function toast(message) {
  $('toast').textContent = message;
  $('toast').hidden = false;
  clearTimeout(state.toastTimer);
  state.toastTimer = setTimeout(() => { $('toast').hidden = true; }, 6500);
}

function controls() {
  $('start-camera').disabled = !state.ready || state.opening || !!state.stream || !!state.photoJob;
  $('stop-camera').disabled = !state.stream && !state.opening && !state.photoJob && state.mode === 'idle';
  $('compare-photo').disabled = !state.ready || state.opening || !!state.photoJob;
  $('camera-select').disabled = !state.ready || state.opening || !!state.photoJob;
  $('mirror').disabled = !state.ready || !!state.photoJob || state.mode === 'photo';
  $('load-models').disabled = state.loading;
}

function cameraNotice(message = '', resume = false) {
  $('camera-notice').hidden = !message;
  $('camera-notice-message').textContent = message;
  $('resume-camera').hidden = !resume;
}

function detect(input) {
  const task = detectionTail.then(async () => {
    const faces = await window.faceapi.detectAllFaces(input,
    new window.faceapi.SsdMobilenetv1Options({ minConfidence: 0.55, maxResults: 20 }))
    .withFaceLandmarks().withFaceDescriptors();
    for (const face of faces) face.sfaceDescriptor = await extractSFace(input, face.landmarks);
    return faces;
  });
  detectionTail = task.catch(() => {});
  return task;
}

function loadingProgress(percent, message, phase) {
  diagnostics.event('loading_progress', { percent, phase });
  const preparing = percent === null;
  $('loading-percent').textContent = preparing ? '准备中' : `${percent}%`;
  $('loading-percent').classList.toggle('is-preparing', preparing);
  $('loading-progress').classList.toggle('is-indeterminate', preparing);
  if (preparing) $('loading-progress').removeAttribute('aria-valuenow');
  else {
    $('loading-fill').style.width = `${percent}%`;
    $('loading-progress').setAttribute('aria-valuenow', String(percent));
  }
  $('loading-message').textContent = message;
}

async function readLibrary(path, signal) {
  const request = new AbortController();
  const abort = () => request.abort(signal.reason);
  signal.addEventListener('abort', abort, { once: true });
  const timeout = setTimeout(() => request.abort(new DOMException('资料请求超时', 'TimeoutError')), 30000);
  try {
    signal.throwIfAborted();
    const response = await fetch(path, { signal: request.signal });
    if (!response.ok) throw new Error(`Reference data HTTP${response.status}`);
    return await response.json();
  } finally {
    clearTimeout(timeout);
    signal.removeEventListener('abort', abort);
  }
}

async function initialize() {
  if (state.loading || state.ready) return;
  const started = performance.now();
  let phase = 'runtime';
  diagnostics.event('loading_start');
  state.loading = true;
  const controller = new AbortController();
  const { signal } = controller;
  state.loadController = controller;
  const report = (percent, message) => { if (!signal.aborted) loadingProgress(percent, message, phase); };
  $('model-line').hidden = true;
  $('loading-panel').hidden = false;
  $('idle-placeholder').hidden = true;
  $('loading-title').textContent = '正在加载模型';
  $('load-models').hidden = true;
  $('loading-percent').hidden = false;
  $('loading-progress').hidden = false;
  $('loading-retry').hidden = true;
  $('loading-cancel').hidden = false;
  $('loading-cancel').disabled = false;
  loadingProgress(null, '首次准备可能需要一点时间。');
  $('retry-model').disabled = true;
  $('model-status').textContent = '正在加载模型…';
  $('model-detail').textContent = '正在准备';
  controls();
  try {
    await loadRuntime(report, { signal });
    signal.throwIfAborted();
    const api = window.faceapi;
    if (!api) throw new Error('识别脚本未加载，请刷新网页');
    if (!state.models) {
      phase = 'backend';
      let gpu = false;
      try { gpu = await api.tf.setBackend('webgl'); }
      catch (error) { diagnostics.event('loading_progress', { level: 'warn', phase, errorName: error?.name }); }
      signal.throwIfAborted();
      if (!gpu) await api.tf.setBackend('cpu');
      signal.throwIfAborted();
      await api.tf.ready();
      signal.throwIfAborted();
      diagnostics.event('loading_progress', { phase, backend: gpu ? 'webgl' : 'cpu' });
      phase = 'models';
      await loadModels(api, report, { signal });
      signal.throwIfAborted();
      const warm = document.createElement('canvas');
      warm.width = warm.height = 128;
      await detect(warm);
      signal.throwIfAborted();
      state.models = true;
    }
    phase = 'data';
    const library = await readLibrary('./presets/library.json', signal);
    state.people = validateProfiles(library);
    if (!state.people.length) throw new Error('预设人物库为空');
    const second = await readLibrary('./presets/sface-library.json', signal);
    sfacePeople = validateSFaceLibrary(second, state.people);
    signal.throwIfAborted();
    loadingProgress(100, '加载完成');
    state.ready = true;
    $('loading-panel').hidden = true;
    $('idle-placeholder').hidden = false;
    $('model-line').hidden = false;
    $('model-status').textContent = '已就绪';
    $('model-status').className = 'status-badge ready';
    $('model-detail').textContent = '本机运行';
    $('retry-model').hidden = true;
    $('camera-message').textContent = '摄像头未开启';
    diagnostics.event('loading_ready', { durationMs: performance.now() - started });
  } catch (error) {
    const cancelled = signal.aborted;
    diagnostics.event(cancelled ? 'loading_cancelled' : 'loading_error', { level: cancelled ? 'info' : 'error', phase, errorName: error?.name, durationMs: performance.now() - started });
    if (!cancelled) console.error('Preparation failed:', error);
    $('loading-title').textContent = cancelled ? '已取消加载' : '暂时无法完成加载';
    $('loading-message').textContent = cancelled ? '准备好后，随时可以重新开始。'
      : !navigator.onLine ? '网络已断开。连接网络后，请重新加载。'
      : error.name === 'TimeoutError' ? '网络响应时间过长，请检查连接后重试。'
      : '请检查网络后重新加载。如仍无法完成，请更新浏览器或稍后再试。';
    $('loading-percent').hidden = true;
    $('loading-progress').hidden = true;
    $('loading-retry').hidden = false;
    $('loading-retry').textContent = cancelled ? '重新开始' : '重新加载';
    $('model-status').textContent = cancelled ? '待开始' : '加载失败';
    $('model-status').className = 'status-badge error';
    $('model-detail').textContent = '请重新加载';
    $('loading-retry').focus({ preventScroll: true });
  } finally {
    state.loading = false;
    state.loadController = null;
    $('loading-cancel').hidden = true;
    $('retry-model').disabled = false;
    controls();
    if (state.ready) $('start-camera').focus({ preventScroll: true });
  }
}

function cancelLoading(reason = 'user') {
  if (!state.loadController || state.loadController.signal.aborted) return;
  diagnostics.event('loading_cancel_requested', { reason });
  state.loadController.abort();
  $('loading-cancel').disabled = true;
  $('loading-message').textContent = '正在取消，请稍候。';
}

async function enumerateCameras() {
  if (!navigator.mediaDevices?.enumerateDevices) return;
  try {
    const cameras = (await navigator.mediaDevices.enumerateDevices()).filter(device => device.kind === 'videoinput');
    const previous = state.stream?.getVideoTracks()[0]?.getSettings().deviceId || $('camera-select').value;
    const first = element('option', '默认摄像头');
    first.value = '';
    $('camera-select').replaceChildren(first);
    cameras.forEach((device, index) => {
      const option = element('option', device.label || `摄像头${index + 1}`);
      option.value = device.deviceId;
      $('camera-select').append(option);
    });
    if (Array.from($('camera-select').options).some(option => option.value === previous)) $('camera-select').value = previous;
  } catch {}
}

function cameraError(error) {
  return ({
    NotAllowedError: '摄像头权限被拒绝，请在浏览器地址栏允许摄像头后重试。',
    NotFoundError: '没有找到摄像头，请连接摄像头后重试。',
    NotReadableError: '摄像头无法读取，可能正被其他应用占用。',
    OverconstrainedError: '所选摄像头不可用，请切换到默认摄像头。',
    SecurityError: '浏览器阻止了摄像头访问，请使用安全连接打开页面后重试。',
    AbortError: '摄像头连接已中断，请重新开启。',
  })[error.name] || '摄像头暂时无法启动，请重新开启或选择其他摄像头。';
}

async function startCamera() {
  if (!state.ready || state.opening || state.stream || state.photoJob) return;
  diagnostics.event('camera_request');
  if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
    diagnostics.event('camera_error', { level: 'error', errorName: 'SecurityError' });
    cameraNotice('当前环境无法使用摄像头，请通过HTTPS地址或本地预览打开。'); return;
  }
  stopCamera('switch_to_camera');
  const session = ++state.session;
  state.opening = true;
  $('camera-message').textContent = '正在请求摄像头权限…';
  controls();
  if (document.hidden) handleVisibility();
  let acquired;
  try {
    const selected = $('camera-select').value;
    acquired = await navigator.mediaDevices.getUserMedia({ audio: false, video: {
      width: { ideal: 960 }, height: { ideal: 720 },
      ...(selected ? { deviceId: { exact: selected } } : { facingMode: 'user' }),
    } });
    if (session !== state.session) { acquired.getTracks().forEach(track => track.stop()); return; }
    state.stream = acquired;
    $('video').srcObject = acquired;
    await $('video').play();
    if (session !== state.session) return;
    state.mode = 'camera';
    diagnostics.event('camera_started', { width: $('video').videoWidth, height: $('video').videoHeight, mirror: $('mirror').checked });
    $('video').hidden = false;
    $('still-canvas').hidden = true;
    $('camera-placeholder').hidden = true;
    $('camera-message').textContent = '正在检测人脸…';
    acquired.getVideoTracks()[0].addEventListener('ended', () => {
      if (state.stream === acquired) {
        diagnostics.event('camera_disconnected', { level: 'warn' });
        stopCamera('disconnected'); toast('摄像头已断开，请重新开启。');
      }
    });
    await enumerateCameras();
    if (session !== state.session) return;
    state.opening = false;
    if (document.hidden) handleVisibility();
    controls();
    loop(session);
  } catch (error) {
    acquired?.getTracks().forEach(track => track.stop());
    if (session === state.session) {
      diagnostics.event('camera_error', { level: 'error', errorName: error?.name });
      console.error('Camera failed:', error); stopCamera('error'); cameraNotice(cameraError(error)); $('camera-message').textContent = '摄像头未开启';
    }
  } finally { if (session === state.session) { state.opening = false; controls(); } }
}

function stopCamera(reason = 'user') {
  if (state.stream || state.opening) diagnostics.event('camera_stopped', { reason });
  if (state.photoJob && reason !== 'error') diagnostics.event('photo_cancelled', { reason, phase: state.photoJob.phase });
  ++state.session;
  clearTimeout(state.timer);
  clearTimeout(state.backgroundTimer);
  state.backgroundSince = 0;
  if (state.photoJob) state.photoJob.cancelled = true;
  state.photoJob = null;
  $('photo-processing').hidden = true;
  $('compare-photo').removeAttribute('aria-busy');
  state.stream?.getTracks().forEach(track => track.stop());
  state.stream = null;
  state.opening = false;
  state.mode = 'idle';
  $('video').srcObject = null;
  $('still-canvas').hidden = true;
  $('camera-placeholder').hidden = false;
  $('camera-message').textContent = '摄像头未开启';
  $('idle-message').textContent = '摄像头未开启';
  cameraNotice();
  $('face-count').textContent = '0';
  $('inference-time').textContent = '—';
  resetMatches();
  controls();
}

function suspendCamera() {
  if (!state.stream && !state.opening) return;
  stopCamera('background');
  $('idle-message').textContent = '摄像头已暂停';
  $('camera-message').textContent = '摄像头已暂停';
  cameraNotice('离开页面一段时间，摄像头已自动关闭。', true);
}

function handleVisibility() {
  diagnostics.event('visibility', { hidden: document.hidden });
  clearTimeout(state.backgroundTimer);
  if (document.hidden) {
    if (!state.stream && !state.opening) return;
    if (!state.backgroundSince) state.backgroundSince = Date.now();
    resetMatches();
    state.backgroundTimer = setTimeout(suspendCamera, Math.max(0, BACKGROUND_GRACE_MS - (Date.now() - state.backgroundSince)));
  } else {
    if (state.backgroundSince && Date.now() - state.backgroundSince >= BACKGROUND_GRACE_MS) suspendCamera();
    state.backgroundSince = 0;
  }
}

function snapshot(source, canvas = document.createElement('canvas'), maxWidth = 1280) {
  const width = source.videoWidth || source.naturalWidth || source.width;
  const height = source.videoHeight || source.naturalHeight || source.height;
  if (!width || !height) throw new Error('尚未获得可用画面');
  const ratio = Math.min(1, maxWidth / width, maxWidth / height);
  canvas.width = Math.round(width * ratio);
  canvas.height = Math.round(height * ratio);
  canvas.getContext('2d').drawImage(source, 0, 0, canvas.width, canvas.height);
  return canvas;
}

async function loop(session) {
  if (session !== state.session || !state.stream) return;
  if (!document.hidden && $('video').readyState >= 2) {
    try {
      const frame = snapshot($('video'), inputCanvas, 960);
      const started = performance.now();
      const faces = await detect(frame);
      if (session !== state.session || !state.stream) return;
      if (!document.hidden) showResults(faces, frame, performance.now() - started);
    } catch (error) {
      if (session !== state.session) return;
      diagnostics.event('camera_error', { level: 'error', phase: 'processing', errorName: error?.name });
      stopCamera('error');
      console.error('Camera processing failed:', error);
      cameraNotice('画面处理已中断，请重新开启摄像头。', true);
      return;
    }
  }
  if (session === state.session) state.timer = setTimeout(() => loop(session), 180);
}

function resetMatches() {
  state.faces = [];
  results = [];
  resultsView.reset();
  $('match-summary').textContent = '等待画面';
  ctx.clearRect(0, 0, $('overlay').width, $('overlay').height);
}

function showResults(faces, frame, elapsed) {
  diagnostics.sample({ mode: state.mode, faceCount: faces.length, processingMs: elapsed, width: frame.width, height: frame.height });
  state.faces = faces;
  $('overlay').width = frame.width;
  $('overlay').height = frame.height;
  $('face-count').textContent = String(faces.length);
  $('inference-time').textContent = String(Math.round(elapsed));
  evaluateMatches();
  renderMatches();
  const message = faces.length ? `检测到${faces.length}张人脸` : '未检测到人脸';
  if ($('camera-message').textContent !== message) $('camera-message').textContent = message;
}

function evaluateMatches() {
  const threshold = 65;
  const current = state.faces.map(face => {
    const ranking = validDescriptor(face.descriptor) && face.sfaceDescriptor ? rankDualProfiles(face.descriptor, face.sfaceDescriptor, state.people, sfacePeople) : [];
    const box = face.detection.box;
    const qualityBlocked = Math.min(box.width, box.height) < 80;
    const decision = qualityBlocked
      ? { type: 'uncertain', label: '请靠近镜头' } : dualDecision(ranking, threshold);
    return { ranking, qualityBlocked, id: ranking[0]?.id, box: { x: box.x, y: box.y, width: box.width, height: box.height }, decision };
  });
  results = state.mode === 'camera' ? stabilizeMatches(current, results, threshold, dualDecision) : current;
}

function renderMatches() {
  const faces = state.faces;
  ctx.clearRect(0, 0, $('overlay').width, $('overlay').height);
  const summary = faces.length ? `${faces.length}张人脸` : '未检测到人脸';
  if ($('match-summary').textContent !== summary) $('match-summary').textContent = summary;
  resultsView.render(results, state.mode);
  faces.forEach((face, index) => {
    const { ranking, decision } = results[index];
    drawFace(face, index, decision.type === 'pending' || currentQualityBlocked(face) ? null : ranking[0]);
  });
}

function currentQualityBlocked(face) { return Math.min(face.detection.box.width, face.detection.box.height) < 80; }

function drawFace(face, index, person) {
  const box = face.detection.box;
  const x = state.mode === 'camera' && $('mirror').checked ? $('overlay').width - box.x - box.width : box.x;
  const color = '#c9c9c9';
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.strokeRect(x, box.y, box.width, box.height);
  const text = person ? `${person.name} ${person.score.toFixed(1)}%` : `人脸${index + 1}`;
  ctx.font = '14px sans-serif';
  const width = Math.min($('overlay').width, ctx.measureText(text).width + 16);
  const left = Math.max(0, Math.min(x, $('overlay').width - width));
  const top = box.y >= 27 ? box.y - 27 : box.y + 2;
  ctx.fillStyle = '#171717e8';
  ctx.fillRect(left, top, width, 25);
  ctx.fillStyle = color;
  ctx.fillText(text, left + 8, top + 17, width - 16);
}

async function comparePhoto(event) {
  const file = event.target.files[0];
  event.target.value = '';
  if (!file || !state.ready || state.photoJob || state.opening) return;
  if (!file.type.startsWith('image/')) { diagnostics.event('photo_rejected', { level: 'warn', reason: 'invalid_type' }); toast('请选择JPG、PNG或浏览器支持的图片。'); return; }
  if (!file.size || file.size > 20 * 1024 * 1024) { diagnostics.event('photo_rejected', { level: 'warn', reason: 'invalid_size' }); toast('请选择20MB以内的有效图片。'); return; }
  diagnostics.event('photo_open');
  const job = { phase: 'decode', session: state.session, cancelled: false };
  state.photoJob = job;
  $('photo-processing').hidden = false;
  $('photo-processing-message').textContent = '正在打开照片';
  $('compare-photo').setAttribute('aria-busy', 'true');
  controls();
  let bitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
    if (job.cancelled || job !== state.photoJob || job.session !== state.session) return;
    const frame = snapshot(bitmap);
    // Commit the mode change only after the new image can be displayed.
    state.photoJob = null;
    stopCamera('switch_to_photo');
    job.phase = 'processing';
    job.session = state.session;
    state.photoJob = job;
    state.mode = 'processing';
    diagnostics.event('photo_processing', { width: frame.width, height: frame.height });
    $('photo-processing').hidden = false;
    $('photo-processing-message').textContent = '正在处理照片';
    $('compare-photo').setAttribute('aria-busy', 'true');
    $('camera-message').textContent = '正在处理照片…';
    controls();
    const started = performance.now();
    const faces = await detect(frame);
    if (job.cancelled || job !== state.photoJob || job.session !== state.session) return;
    snapshot(frame, $('still-canvas'));
    state.mode = 'photo';
    $('video').hidden = true;
    $('still-canvas').hidden = false;
    $('camera-placeholder').hidden = true;
    showResults(faces, frame, performance.now() - started);
    diagnostics.event('photo_done', { durationMs: performance.now() - started });
  } catch (error) {
    if (!job.cancelled && job === state.photoJob && job.session === state.session) {
      diagnostics.event('photo_error', { level: 'error', phase: job.phase, errorName: error?.name });
      console.error('Photo processing failed:', error);
      if (job.phase === 'processing') stopCamera('error');
      toast(job.phase === 'decode' ? '无法打开这张照片，请选择有效的JPG或PNG图片。' : '照片处理未完成，请重试或选择其他照片。');
    }
  } finally {
    bitmap?.close();
    if (state.photoJob === job) {
      state.photoJob = null;
      $('photo-processing').hidden = true;
      $('compare-photo').removeAttribute('aria-busy');
      controls();
    }
  }
}

function cancelPhoto() {
  const job = state.photoJob;
  if (!job) return;
  diagnostics.event('photo_cancelled', { reason: 'user', phase: job.phase });
  job.cancelled = true;
  state.photoJob = null;
  $('photo-processing').hidden = true;
  $('compare-photo').removeAttribute('aria-busy');
  if (job.phase === 'processing') stopCamera();
  else controls();
  $('compare-photo').focus({ preventScroll: true });
}

$('retry-model').addEventListener('click', initialize);
$('load-models').addEventListener('click', initialize);
$('loading-retry').addEventListener('click', initialize);
$('loading-cancel').addEventListener('click', () => cancelLoading('user'));
$('start-camera').addEventListener('click', startCamera);
$('resume-camera').addEventListener('click', startCamera);
$('stop-camera').addEventListener('click', () => stopCamera('user'));
$('cancel-photo').addEventListener('click', cancelPhoto);
$('compare-photo').addEventListener('click', () => $('compare-file').click());
$('compare-file').addEventListener('change', comparePhoto);
$('camera-select').addEventListener('change', async () => { diagnostics.event('camera_selected'); if (state.stream) { stopCamera('switch_device'); await startCamera(); } });
$('mirror').addEventListener('change', () => { diagnostics.event('mirror_change', { mirror: $('mirror').checked }); $('video').style.transform = $('mirror').checked ? 'scaleX(-1)' : ''; if (state.faces.length) renderMatches(); });
$('export-logs').addEventListener('click', exportLogs);
$('clear-logs').addEventListener('click', () => { diagnostics.clear(); toast('本次诊断记录已清空，开始记录新的运行过程。'); });
$('export-logs').disabled = false;
$('clear-logs').disabled = false;
$('video').style.transform = $('mirror').checked ? 'scaleX(-1)' : '';
document.addEventListener('visibilitychange', handleVisibility);
window.addEventListener('pagehide', () => { cancelLoading('pagehide'); stopCamera('pagehide'); });
window.addEventListener('online', () => diagnostics.event('network_change', { online: true }));
window.addEventListener('offline', () => diagnostics.event('network_change', { online: false }));
window.addEventListener('error', event => diagnostics.event('uncaught_error', { level: 'error', errorName: event.error?.name, source: (event.filename || '').split('/').pop(), line: event.lineno, column: event.colno }));
window.addEventListener('unhandledrejection', event => diagnostics.event('uncaught_error', { level: 'error', errorName: event.reason?.name }));
navigator.mediaDevices?.addEventListener('devicechange', enumerateCameras);
controls();
enumerateCameras();
