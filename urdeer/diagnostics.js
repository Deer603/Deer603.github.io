// This marker identifies the diagnostic format, not a product release.
export const APP_VERSION = 'urdeer-diagnostics-1';

const EVENT_TYPES = new Set([
  'page_open', 'loading_start', 'loading_progress', 'loading_ready', 'loading_cancel_requested', 'loading_cancelled', 'loading_error',
  'camera_request', 'camera_started', 'camera_stopped', 'camera_error', 'camera_disconnected', 'camera_selected',
  'photo_open', 'photo_rejected', 'photo_processing', 'photo_done', 'photo_cancelled', 'photo_error',
  'visibility', 'network_change', 'mirror_change', 'uncaught_error', 'export_requested', 'cleared'
]);
const ENUM_FIELDS = {
  level: new Set(['info', 'warn', 'error']),
  mode: new Set(['idle', 'camera', 'photo']),
  phase: new Set(['runtime', 'backend', 'models', 'data', 'decode', 'processing']),
  reason: new Set(['user', 'switch_to_camera', 'switch_to_photo', 'switch_device', 'background', 'pagehide',
    'disconnected', 'error', 'cancelled', 'invalid_type', 'invalid_size']),
  backend: new Set(['webgl', 'cpu'])
};
const ERROR_NAMES = new Set([
  'Error', 'TypeError', 'RangeError', 'ReferenceError', 'SyntaxError', 'URIError', 'EvalError',
  'AbortError', 'NotAllowedError', 'PermissionDeniedError', 'NotFoundError', 'DevicesNotFoundError',
  'NotReadableError', 'TrackStartError', 'OverconstrainedError', 'ConstraintNotSatisfiedError',
  'SecurityError', 'InvalidStateError', 'NotSupportedError', 'NetworkError', 'TimeoutError',
  'EncodingError', 'DataError', 'OperationError', 'QuotaExceededError', 'UnknownError'
]);
const ERROR_SOURCES = new Set([
  'app.js', 'model-loader.js', 'diagnostics.js', 'results-view.js', 'core.js', 'ensemble.js', 'sface.js', 'unknown'
]);
const BROWSERS = new Set(['Chrome', 'Firefox', 'Safari', 'Edge', 'Opera', 'SamsungInternet', 'Other', 'Unknown']);
const BOOLEAN_FIELDS = ['hidden', 'online', 'mirror'];
const NUMBER_FIELDS = {
  percent: [0, 100, false],
  durationMs: [0, 86400000, false],
  processingMs: [0, 86400000, false],
  faceCount: [0, 10000, true],
  width: [1, 100000, true],
  height: [1, 100000, true],
  line: [0, 10000000, true],
  column: [0, 10000000, true]
};
const FIELD_DESCRIPTIONS = {
  appVersion: '诊断实现与格式标记，不代表产品发行版本。',
  startedAt: '当前日志会话开始的本地系统时间，以ISO格式导出。',
  exportedAt: '导出时的本地系统时间，以ISO格式导出。',
  seq: '当前日志会话中事件和采样共享的递增序号，清空后重新计数。',
  timestamp: '记录发生时的本地系统时间，以ISO格式导出；系统时钟可能变化。',
  elapsedMs: '从当前日志会话开始计算的相对毫秒数，保证不会倒退。',
  type: '白名单中的运行事件类型，不包含任意错误文本。',
  mode: 'camera表示摄像头，photo表示照片，idle表示空闲。',
  phase: '加载或处理阶段，仅保留固定枚举值。',
  reason: '停止、取消或拒绝的原因，仅保留固定枚举值。',
  level: 'info、warn或error。错误事件类型始终计入错误次数。',
  errorName: '常见异常类别，未列入白名单的异常名统一为UnknownError。',
  source: '异常所在的已知应用脚本名称，其他来源统一为unknown。',
  line: '异常在脚本中的行号，不包含脚本路径。',
  column: '异常在脚本中的列号。',
  backend: '选用的计算后端，仅包含webgl或cpu。',
  percent: '加载进度，范围为0到100；null表示进度未知。',
  durationMs: '对应操作的耗时，单位为毫秒。',
  processingMs: '一次采样处理的耗时，单位为毫秒，不表示识别准确率。',
  faceCount: '本次检测到的人脸数量，不包含位置、身份或匹配结果。',
  width: '处理输入的像素宽度，不包含图像内容。',
  height: '处理输入的像素高度，不包含图像内容。',
  hidden: '记录时页面是否处于隐藏状态。',
  online: '浏览器报告的联网状态，不代表服务一定可用。',
  mirror: '摄像头预览是否开启镜像。',
  environment: '仅保留浏览器名称与主版本、语言、视口尺寸和基本运行能力。',
  events: '环形缓冲区中仍保留的事件，按发生顺序排列。',
  samples: '环形缓冲区中仍保留的性能采样，按发生顺序排列。',
  timeline: '按seq合并的轻量时间线索引。kind为event时，index指向events数组；kind为sample时，index指向samples数组。index从0开始，记录内容不重复存储。',
  dropped: '超出缓冲区容量后淘汰的事件数和采样数。',
  summary: '性能统计仅基于保留采样；errorCount统计当前会话全部错误，retainedErrorCount仅统计保留事件。',
  sampleRange: '保留采样的首尾相对时间，单位为毫秒；没有采样时为null。',
  faceCountRange: '保留采样中的人脸数量范围；没有采样时为null。'
};
const ANALYSIS_HINTS = [
  '请根据时间线、运行阶段、异常类别和处理耗时分析加载、摄像头、照片处理及性能问题。',
  '日志不包含姓名、身份ID、照片、特征、匹配分数、排名、人脸框、文件名、摄像头标签或设备ID。不得推断人物身份或计算识别准确率。',
  '错误消息、调用栈和完整浏览器标识未被收集；相同异常类别可能有多种原因，请区分证据与推测。',
  '先检查dropped和采样时间范围。缓冲区淘汰的记录无法恢复，日志缺少事件不代表事件没有发生。',
  '单次耗时会受设备负载和页面可见性影响；请结合多次采样与运行事件分析，不把人脸数量视为身份记录。'
];

// Read only explicitly allowed own data properties, without executing getters.
function ownValue(value, key) {
  try {
    if (!value || (typeof value !== 'object' && typeof value !== 'function')) return undefined;
    const property = Object.getOwnPropertyDescriptor(value, key);
    return property && Object.hasOwn(property, 'value') ? property.value : undefined;
  } catch { return undefined; }
}

function validNumber(value, min, max, integer = false) {
  return typeof value === 'number' && Number.isFinite(value)
    && value >= min && value <= max && (!integer || Number.isInteger(value));
}

function capacity(value, fallback, max) {
  return validNumber(value, 1, max, true) ? value : fallback;
}

function createRing(limit) {
  let items = new Array(limit), start = 0, length = 0, dropped = 0;
  return {
    push(item) {
      if (length < limit) {
        items[(start + length) % limit] = item;
        length += 1;
      } else {
        items[start] = item;
        start = (start + 1) % limit;
        dropped += 1;
      }
    },
    snapshot() {
      return Array.from({ length }, (_, index) => ({ ...items[(start + index) % limit] }));
    },
    clear() { items = new Array(limit); start = 0; length = 0; dropped = 0; },
    get dropped() { return dropped; }
  };
}

function eventFields(input, type) {
  const output = {};
  for (const [key, values] of Object.entries(ENUM_FIELDS)) {
    const value = ownValue(input, key);
    if (values.has(value)) output[key] = value;
  }
  output.level ??= type.endsWith('_error') ? 'error' : 'info';
  for (const key of BOOLEAN_FIELDS) {
    const value = ownValue(input, key);
    if (typeof value === 'boolean') output[key] = value;
  }
  for (const [key, range] of Object.entries(NUMBER_FIELDS)) {
    const value = ownValue(input, key);
    if (validNumber(value, ...range)) output[key] = value;
    else if (key === 'percent' && value === null) output.percent = null;
  }
  const errorName = ownValue(input, 'errorName');
  if (errorName !== undefined) output.errorName = ERROR_NAMES.has(errorName) ? errorName : 'UnknownError';
  const source = ownValue(input, 'source');
  if (source !== undefined) output.source = ERROR_SOURCES.has(source) ? source : 'unknown';
  return output;
}

function environmentFields(input) {
  const output = { appVersion: APP_VERSION };
  const language = ownValue(input, 'language');
  if (typeof language === 'string' && language.length <= 32 && /^[a-z]{2,8}(?:-[a-z0-9]{1,8})*$/i.test(language)) {
    output.language = language;
  }
  const browserName = ownValue(input, 'browserName');
  if (browserName !== undefined) output.browserName = BROWSERS.has(browserName) ? browserName : 'Unknown';
  const major = ownValue(input, 'browserMajorVersion');
  if (validNumber(major, 0, 9999, true)) output.browserMajorVersion = major;
  for (const key of ['viewportWidth', 'viewportHeight']) {
    const value = ownValue(input, key);
    if (validNumber(value, 0, 100000, true)) output[key] = value;
  }
  for (const key of ['secureContext', 'online', 'wasmSupported', 'webglSupported']) {
    const value = ownValue(input, key);
    if (typeof value === 'boolean') output[key] = value;
  }
  return output;
}

function isErrorEvent(event) { return event.level === 'error' || event.type.endsWith('_error'); }

export function createDiagnostics(options = {}) {
  const nowOption = ownValue(options, 'now');
  const wallNowOption = ownValue(options, 'wallNow');
  const now = typeof nowOption === 'function' ? nowOption : () => globalThis.performance?.now() ?? Date.now();
  const wallNow = typeof wallNowOption === 'function' ? wallNowOption : Date.now;
  const maxEvents = capacity(ownValue(options, 'maxEvents'), 1000, 10000);
  const maxSamples = capacity(ownValue(options, 'maxSamples'), 5000, 50000);
  const events = createRing(maxEvents), samples = createRing(maxSamples);
  let startMs = 0, startedAt, lastElapsedMs = 0, seq = 0, totalEventCount = 0, totalSampleCount = 0, errorCount = 0;

  function monotonicTime(fallback) {
    try { const value = now(); return validNumber(value, 0, Number.MAX_SAFE_INTEGER) ? value : fallback; }
    catch { return fallback; }
  }

  function isoTime() {
    try {
      const value = wallNow();
      if (validNumber(value, -8640000000000000, 8640000000000000)) return new Date(value).toISOString();
    } catch { /* An invalid clock must not interrupt application behavior. */ }
    return new Date().toISOString();
  }

  function elapsedTime() {
    lastElapsedMs = Math.max(lastElapsedMs, monotonicTime(startMs + lastElapsedMs) - startMs);
    return lastElapsedMs;
  }

  function stamp() { return { seq: ++seq, timestamp: isoTime(), elapsedMs: elapsedTime() }; }

  function reset() {
    events.clear(); samples.clear();
    startMs = monotonicTime(0); startedAt = isoTime(); lastElapsedMs = 0;
    seq = 0; totalEventCount = 0; totalSampleCount = 0; errorCount = 0;
  }

  function event(type, fields = {}) {
    try {
      if (!EVENT_TYPES.has(type)) return false;
      const entry = { ...stamp(), type, ...eventFields(fields, type) };
      events.push(entry);
      totalEventCount += 1;
      if (isErrorEvent(entry)) errorCount += 1;
      return true;
    } catch { return false; }
  }

  function sample(fields = {}) {
    try {
      const mode = ownValue(fields, 'mode'), faceCount = ownValue(fields, 'faceCount');
      const processingMs = ownValue(fields, 'processingMs');
      if (!['camera', 'photo'].includes(mode) || !validNumber(faceCount, ...NUMBER_FIELDS.faceCount)
        || !validNumber(processingMs, ...NUMBER_FIELDS.processingMs)) return false;
      const entry = { ...stamp(), mode, faceCount, processingMs };
      for (const key of ['width', 'height']) {
        const value = ownValue(fields, key);
        if (validNumber(value, ...NUMBER_FIELDS[key])) entry[key] = value;
      }
      samples.push(entry);
      totalSampleCount += 1;
      return true;
    } catch { return false; }
  }

  function exportData(exportOptions = {}) {
    const retainedEvents = events.snapshot(), retainedSamples = samples.snapshot();
    const timeline = [];
    let eventIndex = 0, sampleIndex = 0, processingTotal = 0, maxProcessingMs = null, minFaces = null, maxFaces = null;
    while (eventIndex < retainedEvents.length || sampleIndex < retainedSamples.length) {
      if (sampleIndex >= retainedSamples.length || (eventIndex < retainedEvents.length
        && retainedEvents[eventIndex].seq < retainedSamples[sampleIndex].seq)) {
        timeline.push({ seq: retainedEvents[eventIndex].seq, kind: 'event', index: eventIndex++ });
      } else timeline.push({ seq: retainedSamples[sampleIndex].seq, kind: 'sample', index: sampleIndex++ });
    }
    const modeCounts = { camera: 0, photo: 0 };
    for (const entry of retainedSamples) {
      processingTotal += entry.processingMs;
      maxProcessingMs = maxProcessingMs === null ? entry.processingMs : Math.max(maxProcessingMs, entry.processingMs);
      minFaces = minFaces === null ? entry.faceCount : Math.min(minFaces, entry.faceCount);
      maxFaces = maxFaces === null ? entry.faceCount : Math.max(maxFaces, entry.faceCount);
      modeCounts[entry.mode] += 1;
    }
    return {
      schemaVersion: 1, appVersion: APP_VERSION, startedAt, exportedAt: isoTime(),
      environment: environmentFields(ownValue(exportOptions, 'environment')),
      limits: { maxEvents, maxSamples }, dropped: { events: events.dropped, samples: samples.dropped },
      summary: {
        durationMs: elapsedTime(), totalEventCount, totalSampleCount,
        retainedEventCount: retainedEvents.length, retainedSampleCount: retainedSamples.length,
        errorCount, retainedErrorCount: retainedEvents.filter(isErrorEvent).length,
        sampleRange: retainedSamples.length
          ? { fromMs: retainedSamples[0].elapsedMs, toMs: retainedSamples[retainedSamples.length - 1].elapsedMs } : null,
        meanProcessingMs: retainedSamples.length ? processingTotal / retainedSamples.length : null,
        maxProcessingMs, faceCountRange: retainedSamples.length ? { min: minFaces, max: maxFaces } : null, modeCounts
      },
      events: retainedEvents, samples: retainedSamples, timeline,
      fieldDescriptions: { ...FIELD_DESCRIPTIONS }, analysisHints: [...ANALYSIS_HINTS]
    };
  }

  function clear() {
    try { reset(); return event('cleared'); }
    catch { return false; }
  }

  reset();
  return { event, sample, exportData, clear };
}
