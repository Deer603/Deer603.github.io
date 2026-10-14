import { rankProfiles, matchDecision, validateProfiles, validDescriptor } from './core.js';

const $ = id => document.getElementById(id);
const state = { people: [], ready: false, models: false, loading: false, stream: null, opening: false, session: 0, timer: null, faces: [], mode: 'idle', toastTimer: null };
const inputCanvas = document.createElement('canvas');
const ctx = $('overlay').getContext('2d');
let detectionTail = Promise.resolve();

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
  $('start-camera').disabled = !state.ready || state.opening || !!state.stream || state.mode === 'processing';
  $('stop-camera').disabled = !state.stream && !state.opening && state.mode === 'idle';
  $('compare-photo').disabled = !state.ready || state.opening || state.mode === 'processing';
}

function detect(input) {
  const task = detectionTail.then(() => window.faceapi.detectAllFaces(input,
    new window.faceapi.SsdMobilenetv1Options({ minConfidence: 0.55, maxResults: 20 }))
    .withFaceLandmarks().withFaceDescriptors());
  detectionTail = task.catch(() => {});
  return task;
}

async function initialize() {
  if (state.loading || state.ready) return;
  state.loading = true;
  $('retry-model').disabled = true;
  $('model-status').textContent = '正在准备识别';
  $('model-detail').textContent = '加载本地模型与预设人物，照片无需上传。';
  controls();
  try {
    const api = window.faceapi;
    if (!api) throw new Error('识别脚本未加载，请刷新网页');
    if (!state.models) {
      let gpu = false;
      try { gpu = await api.tf.setBackend('webgl'); } catch {}
      if (!gpu) await api.tf.setBackend('cpu');
      await api.tf.ready();
      await Promise.all([
        api.nets.ssdMobilenetv1.loadFromUri('./models'),
        api.nets.faceLandmark68Net.loadFromUri('./models'),
        api.nets.faceRecognitionNet.loadFromUri('./models'),
      ]);
      const warm = document.createElement('canvas');
      warm.width = warm.height = 128;
      await detect(warm);
      state.models = true;
    }
    const response = await fetch('./presets/library.json');
    if (!response.ok) throw new Error('预设人物库无法加载');
    state.people = validateProfiles(await response.json());
    if (!state.people.length) throw new Error('预设人物库为空');
    state.ready = true;
    $('model-status').textContent = '识别已就绪';
    $('model-status').className = 'status-badge ready';
    $('model-detail').textContent = `已记住${state.people.length}位人物·本地${api.tf.getBackend() === 'webgl' ? 'GPU' : 'CPU'}推理`;
    $('retry-model').hidden = true;
    $('camera-message').textContent = '预设人物已就绪，开启摄像头即可比对。';
  } catch (error) {
    $('model-status').textContent = '加载失败';
    $('model-status').className = 'status-badge error';
    $('model-detail').textContent = `${error.message}。请通过localhost或HTTPS打开，确认模型与预设文件在同一网站目录。`;
  } finally { state.loading = false; $('retry-model').disabled = false; controls(); }
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
    SecurityError: '浏览器阻止了摄像头访问，请通过localhost或HTTPS打开。',
  })[error.name] || `摄像头启动失败：${error.message}`;
}

async function startCamera() {
  if (!state.ready || state.opening || state.stream || state.mode === 'processing') return;
  if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) { toast('摄像头需要HTTPS或localhost，请使用node serve.mjs启动网页。'); return; }
  stopCamera();
  const session = ++state.session;
  state.opening = true;
  $('camera-message').textContent = '正在请求摄像头权限…';
  controls();
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
    $('video').hidden = false;
    $('still-canvas').hidden = true;
    $('camera-placeholder').hidden = true;
    $('camera-message').textContent = '摄像头已开启，正在识别人脸。';
    acquired.getVideoTracks()[0].addEventListener('ended', () => { if (state.stream === acquired) { stopCamera(); toast('摄像头已断开，请重新开启。'); } });
    await enumerateCameras();
    if (session !== state.session) return;
    state.opening = false;
    controls();
    loop(session);
  } catch (error) {
    acquired?.getTracks().forEach(track => track.stop());
    if (session === state.session) { stopCamera(); toast(cameraError(error)); $('camera-message').textContent = cameraError(error); }
  } finally { if (session === state.session) { state.opening = false; controls(); } }
}

function stopCamera() {
  ++state.session;
  clearTimeout(state.timer);
  state.stream?.getTracks().forEach(track => track.stop());
  state.stream = null;
  state.opening = false;
  state.mode = 'idle';
  $('video').srcObject = null;
  $('still-canvas').hidden = true;
  $('camera-placeholder').hidden = false;
  $('camera-message').textContent = '等待开启摄像头或对比照片。';
  $('face-count').textContent = '0';
  $('inference-time').textContent = '—';
  resetMatches();
  controls();
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
      const frame = snapshot($('video'), inputCanvas, 640);
      const started = performance.now();
      const faces = await detect(frame);
      if (session !== state.session || !state.stream) return;
      showResults(faces, frame, performance.now() - started);
    } catch (error) {
      if (session !== state.session) return;
      stopCamera();
      toast(`识别中断：${error.message}。可重新开启摄像头。`);
      return;
    }
  }
  if (session === state.session) state.timer = setTimeout(() => loop(session), 180);
}

function resetMatches() {
  state.faces = [];
  $('match-list').replaceChildren(element('div', '开启摄像头或选择照片，即可显示与预设人物的匹配度。', 'empty-state plain-empty'));
  $('match-summary').textContent = '等待画面';
  ctx.clearRect(0, 0, $('overlay').width, $('overlay').height);
}

function showResults(faces, frame, elapsed) {
  state.faces = faces;
  $('overlay').width = frame.width;
  $('overlay').height = frame.height;
  $('face-count').textContent = String(faces.length);
  $('inference-time').textContent = String(Math.round(elapsed));
  renderMatches();
  $('camera-message').textContent = faces.length ? `检测到${faces.length}张人脸` : '未检测到人脸，请正对镜头并保持光线充足。';
}

function renderMatches() {
  const faces = state.faces;
  ctx.clearRect(0, 0, $('overlay').width, $('overlay').height);
  $('match-list').replaceChildren();
  const threshold = Number($('threshold').value);
  $('match-summary').textContent = faces.length ? `${faces.length}张人脸` : '未检测到人脸';
  if (!faces.length) { $('match-list').append(element('div', '请将面部移入镜头，已离开画面的结果会自动清除。', 'empty-state plain-empty')); return; }
  faces.forEach((face, index) => {
    const ranking = validDescriptor(face.descriptor) ? rankProfiles(face.descriptor, state.people) : [];
    const decision = matchDecision(ranking, threshold);
    const group = element('section', undefined, 'face-result');
    const heading = element('div', undefined, 'result-heading');
    heading.append(element('span', `人脸${index + 1}`, 'face-number'), element('span', decision.label, `decision ${decision.type}`));
    group.append(heading);
    ranking.forEach((person, position) => {
      const row = element('div', undefined, `match-row${position === 0 ? ' best' : ''}`);
      const top = element('div', undefined, 'match-top');
      top.append(element('span', person.name, 'match-name'), element('span', `${person.score.toFixed(1)}%`, 'match-score'));
      const bar = element('div', undefined, 'score-track');
      const fill = element('span');
      fill.style.width = `${person.score}%`;
      bar.append(fill);
      row.append(top, bar);
      group.append(row);
    });
    $('match-list').append(group);
    drawFace(face, index, decision, ranking[0]?.score);
  });
}

function drawFace(face, index, decision, score) {
  const box = face.detection.box;
  const x = state.mode === 'camera' && $('mirror').checked ? $('overlay').width - box.x - box.width : box.x;
  const color = decision.type === 'match' ? '#65daa9' : decision.type === 'ambiguous' ? '#e9b43c' : '#9f7ae1';
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.strokeRect(x, box.y, box.width, box.height);
  const text = `人脸${index + 1} · ${decision.label}${score !== undefined ? ` ${score.toFixed(1)}%` : ''}`;
  ctx.font = '14px sans-serif';
  const width = Math.min($('overlay').width, ctx.measureText(text).width + 16);
  const left = Math.max(0, Math.min(x, $('overlay').width - width));
  const top = box.y >= 27 ? box.y - 27 : box.y + 2;
  ctx.fillStyle = '#151521e8';
  ctx.fillRect(left, top, width, 25);
  ctx.fillStyle = color;
  ctx.fillText(text, left + 8, top + 17, width - 16);
}

async function comparePhoto(event) {
  const file = event.target.files[0];
  event.target.value = '';
  if (!file || !state.ready) return;
  stopCamera();
  const session = state.session;
  state.mode = 'processing';
  controls();
  $('camera-message').textContent = '正在对比照片…';
  let bitmap;
  try {
    if (!file.type.startsWith('image/') || file.size > 20 * 1024 * 1024) throw new Error('请选择20MB以内的图片');
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
    if (session !== state.session) return;
    const frame = snapshot(bitmap);
    const started = performance.now();
    const faces = await detect(frame);
    if (session !== state.session) return;
    snapshot(frame, $('still-canvas'));
    state.mode = 'photo';
    $('video').hidden = true;
    $('still-canvas').hidden = false;
    $('camera-placeholder').hidden = true;
    showResults(faces, frame, performance.now() - started);
  } catch (error) { if (session === state.session) { stopCamera(); toast(`照片对比失败：${error.message}`); } }
  finally { bitmap?.close(); if (session === state.session) controls(); }
}

$('retry-model').addEventListener('click', initialize);
$('start-camera').addEventListener('click', startCamera);
$('stop-camera').addEventListener('click', stopCamera);
$('compare-photo').addEventListener('click', () => $('compare-file').click());
$('compare-file').addEventListener('change', comparePhoto);
$('camera-select').addEventListener('change', async () => { if (state.stream) { stopCamera(); await startCamera(); } });
$('mirror').addEventListener('change', () => { $('video').style.transform = $('mirror').checked ? 'scaleX(-1)' : ''; if (state.faces.length) renderMatches(); });
$('video').style.transform = $('mirror').checked ? 'scaleX(-1)' : '';
$('threshold').addEventListener('input', () => {
  $('threshold-value').textContent = `${$('threshold').value}%`;
  $('threshold').style.background = `linear-gradient(to right,#a28bcf 0%,#a28bcf ${(($('threshold').value - 40) / 45) * 100}%,#eee9f5 ${(($('threshold').value - 40) / 45) * 100}%,#eee9f5 100%)`;
  if (state.faces.length) renderMatches();
});
document.addEventListener('visibilitychange', () => { if (document.hidden && state.stream) resetMatches(); });
window.addEventListener('pagehide', stopCamera);
navigator.mediaDevices?.addEventListener('devicechange', enumerateCameras);
controls();
enumerateCameras();
initialize();
