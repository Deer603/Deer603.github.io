import '../vendor/howler.min.js';

// 沿用其他音效的合成参数，纸张摩擦与临时翻页声使用本地 CC0 素材。
const OfflineContext = window.OfflineAudioContext || window.webkitOfflineAudioContext;
const sampleRate = 48000;
const recordedSources = {
  'paper-gather': new URL('../characters/frog/assets/paper-gather.mp3', import.meta.url).href,
  'page-turn': new URL('../characters/frog/assets/page-turn.mp3', import.meta.url).href,
};

function envelope(gain, start, duration, level, attack = 0.012) {
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.linearRampToValueAtTime(level, start + Math.min(attack, duration * 0.25));
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
}

function wav(samples) {
  const buffer = new ArrayBuffer(44 + samples.length * 2),
    view = new DataView(buffer);
  const text = (offset, value) =>
    [...value].forEach((letter, index) => view.setUint8(offset + index, letter.charCodeAt(0)));
  text(0, 'RIFF');
  view.setUint32(4, buffer.byteLength - 8, true);
  text(8, 'WAVE');
  text(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  text(36, 'data');
  view.setUint32(40, samples.length * 2, true);
  samples.forEach((value, index) => view.setInt16(44 + index * 2, Math.max(-1, Math.min(1, value)) * 32767, true));
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let offset = 0; offset < bytes.length; offset += 32768)
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 32768));
  return `data:audio/wav;base64,${btoa(binary)}`;
}

async function synthesize() {
  const definitions = [
    ['shutter', 0.138],
    ['printer', 2],
    ...Array.from({ length: 5 }, (_, index) => [`paper-release-${index}`, 0.212, index]),
    ...Array.from({ length: 5 }, (_, index) => [`paper-land-${index}`, 0.219, index]),
    ['inspect', 0.202],
    ['close', 0.152],
  ];
  const duration = definitions.reduce((sum, [, length]) => sum + length + 0.06, 0);
  const context = new OfflineContext(1, Math.ceil(duration * sampleRate), sampleRate);
  const whiteNoise = context.createBuffer(1, sampleRate * 2, sampleRate);
  const rollingNoise = context.createBuffer(1, sampleRate * 2, sampleRate);
  const white = whiteNoise.getChannelData(0),
    roll = rollingNoise.getChannelData(0);
  let softened = 0;
  for (let index = 0; index < white.length; index++) {
    const sample = Math.random() * 2 - 1;
    white[index] = sample;
    softened = softened * 0.92 + sample * 0.08;
    const pulse = Math.pow(Math.max(0, Math.sin((index / sampleRate) * Math.PI * 22)), 7);
    roll[index] = softened * 1.7 + sample * (0.035 + pulse * 0.055);
  }
  function tone(at, duration, from, to, level, type = 'sine') {
    const oscillator = context.createOscillator(),
      gain = context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(from, at);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(10, to), at + duration);
    envelope(gain, at, duration, level, 0.004);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(at);
    oscillator.stop(at + duration + 0.012);
  }
  function rustle(at, duration, frequency, level, rate = 1, type = 'bandpass') {
    const source = context.createBufferSource();
    source.buffer = whiteNoise;
    source.playbackRate.value = rate;
    const filter = context.createBiquadFilter(),
      gain = context.createGain();
    filter.type = type;
    filter.frequency.setValueAtTime(frequency, at);
    filter.Q.value = 0.65;
    filter.frequency.exponentialRampToValueAtTime(Math.max(160, frequency * 0.58), at + duration);
    envelope(gain, at, duration, level, 0.017);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(context.destination);
    source.start(at);
    source.stop(at + duration + 0.012);
  }
  const sprites = {};
  let at = 0;
  for (const [name, duration, index = 0] of definitions) {
    sprites[name] = [at * 1000, duration * 1000, name === 'printer'];
    const variation = 1 + (index - 2) * 0.035;
    if (name.startsWith('paper-release-')) {
      rustle(at, 0.2, 2800 * variation, 0.12, variation);
      tone(at + 0.024, 0.045, 170 * variation, 110, 0.035);
    } else if (name.startsWith('paper-land-')) {
      rustle(at, 0.12, 1700 * variation, 0.2, variation);
      tone(at + 0.008, 0.074, 160 * variation, 65, 0.105);
      rustle(at + 0.047, 0.16, 1100 * variation, 0.065, 0.93);
    } else
      switch (name) {
        case 'shutter':
          rustle(at, 0.038, 4300, 0.32);
          tone(at, 0.045, 240, 92, 0.2, 'triangle');
          rustle(at + 0.061, 0.065, 2400, 0.19);
          tone(at + 0.066, 0.047, 360, 150, 0.09, 'triangle');
          break;
        case 'printer': {
          const source = context.createBufferSource();
          source.buffer = rollingNoise;
          source.loop = true;
          const filter = context.createBiquadFilter();
          filter.type = 'bandpass';
          filter.frequency.value = 640;
          filter.Q.value = 0.48;
          const gain = context.createGain();
          gain.gain.setValueAtTime(0.0001, at);
          gain.gain.linearRampToValueAtTime(0.074, at + 0.09);
          source.connect(filter);
          filter.connect(gain);
          gain.connect(context.destination);
          source.start(at);
          source.stop(at + duration);
          const motor = context.createOscillator(),
            motorGain = context.createGain();
          motor.type = 'triangle';
          motor.frequency.value = 113;
          motorGain.gain.value = 0.018;
          motor.connect(motorGain);
          motorGain.connect(context.destination);
          motor.start(at);
          motor.stop(at + duration);
          const wobble = context.createOscillator(),
            depth = context.createGain();
          wobble.frequency.value = 9.5;
          depth.gain.value = 0.013;
          wobble.connect(depth);
          depth.connect(gain.gain);
          wobble.start(at);
          wobble.stop(at + duration);
          break;
        }
        case 'inspect':
          rustle(at, 0.19, 2100, 0.135, 0.95);
          tone(at + 0.016, 0.09, 310, 390, 0.034);
          break;
        case 'close':
          rustle(at, 0.14, 1600, 0.125, 0.9);
          tone(at + 0.016, 0.068, 175, 92, 0.04);
          break;
      }
    at += duration + 0.06;
  }
  const buffer = await context.startRendering();
  return { src: wav(buffer.getChannelData(0)), sprites };
}

export function createAudio(storageKey, onChange = () => {}) {
  const state = {
    supported: Boolean(OfflineContext && window.Howl),
    muted: false,
    unlocked: false,
    volume: 0.8,
    phase: 'idle',
    lastPlayed: null,
    playCounts: {},
  };
  try {
    state.muted = localStorage.getItem(storageKey) === 'true';
  } catch (_) {}
  let loaded = false,
    disposed = false,
    revision = 0;
  const sounds = new Map();
  const active = new Map(),
    pending = new Set(),
    lastTimes = new Map();
  const getState = () => ({
    ...state,
    playCounts: { ...state.playCounts },
    contextState: window.Howler.ctx?.state || 'locked',
    enabled: state.supported && !state.muted,
    printerRunning: [...active.values()].includes('printer'),
    activeVoices: active.size,
    pendingSounds: pending.size,
    assetsLoaded: loaded,
    uiVisible: state.supported,
    disposed,
  });
  const changed = () => onChange(getState());
  const soundFor = (name) => sounds.get(recordedSources[name] ? name : 'synth');
  function loadSound(name, options) {
    return new Promise((resolve) => {
      if (disposed) {
        resolve();
        return;
      }
      const sound = new window.Howl({
        ...options,
        volume: state.volume * 0.44,
        mute: state.muted,
        onload() {
          resolve();
        },
        onloaderror(_id, error) {
          state.supported = false;
          console.warn('音效加载失败：', error);
          changed();
          resolve();
        },
        onend(id) {
          if (active.get(id) !== 'printer') active.delete(id);
          changed();
        },
        onstop(id) {
          active.delete(id);
          changed();
        },
        onplayerror(id) {
          active.delete(id);
          changed();
        },
      });
      sounds.set(name, sound);
    });
  }
  const ready = state.supported
    ? Promise.all([
        synthesize().then(({ src, sprites }) =>
          loadSound('synth', {
            src: [src],
            format: ['wav'],
            sprite: sprites,
          })
        ),
        ...Object.entries(recordedSources).map(([name, src]) =>
          loadSound(name, {
            src: [src],
            format: ['mp3'],
          })
        ),
      ])
        .then(() => {
          loaded = state.supported && !disposed;
          changed();
        })
        .catch((error) => {
          state.supported = false;
          console.warn('音效生成失败：', error);
          changed();
        })
    : Promise.resolve();

  function unlock() {
    if (disposed || state.muted || !state.supported) return;
    state.unlocked = true;
    changed();
  }
  function play(name, options = {}) {
    name = { release: 'paper-release', land: 'paper-land' }[name] || name;
    if (
      !['shutter', 'printer', 'paper-release', 'paper-land', 'inspect', 'close', 'page-turn', 'paper-gather'].includes(
        name
      ) ||
      disposed ||
      state.muted ||
      !state.unlocked ||
      !state.supported ||
      document.hidden
    )
      return false;
    if (name === 'printer' && (state.phase !== 'printing' || [...active.values()].includes('printer'))) return false;
    const index = Math.max(0, Math.min(4, Number(options.index) || 0)),
      key = `${name}:${options.index ?? ''}`;
    if (!loaded) {
      if (pending.has(key)) return false;
      pending.add(key);
      const token = revision;
      ready.then(() => {
        pending.delete(key);
        if (loaded && token === revision) play(name, options);
      });
      return true;
    }
    const now = performance.now(),
      cooldown =
        name === 'shutter' ? 260 :
        name === 'page-turn' ? (options.cooldown ?? 180) :
        name === 'paper-gather' ? 450 : 65;
    if (name !== 'printer' && now - (lastTimes.get(key) ?? -Infinity) < cooldown) return false;
    if (active.size >= 12) {
      const oldest = [...active.entries()].find(([, name]) => name !== 'printer');
      if (oldest) soundFor(oldest[1]).stop(oldest[0]);
    }
    const sprite = name === 'paper-release' || name === 'paper-land' ? `${name}-${index}` : name;
    const sound = soundFor(name);
    const id = recordedSources[name] ? sound.play() : sound.play(sprite);
    if (name === 'page-turn' && options.volume !== undefined) {
      sound.volume(state.volume * Math.max(0, Math.min(0.75, options.volume)), id);
      sound.rate(0.94 + Math.random() * 0.12, id);
    }
    active.set(id, name);
    lastTimes.set(key, now);
    state.lastPlayed = name;
    state.playCounts[name] = (state.playCounts[name] || 0) + 1;
    changed();
    return true;
  }
  function stop(name) {
    revision++;
    pending.clear();
    for (const [id, soundName] of [...active])
      if (!name || name === soundName) {
        soundFor(soundName)?.stop(id);
        active.delete(id);
      }
    changed();
  }
  function setPhase(phase) {
    state.phase = phase;
    if (phase === 'idle') stop();
    else if (phase !== 'printing') stop('printer');
    changed();
  }
  function setMuted(next) {
    state.muted = Boolean(next);
    try {
      localStorage.setItem(storageKey, String(state.muted));
    } catch (_) {}
    for (const sound of sounds.values()) sound.mute(state.muted);
    if (state.muted) stop();
    else unlock();
    changed();
    return state.muted;
  }
  function visibility() {
    if (document.hidden) stop();
  }
  function keydown(event) {
    if (!event.repeat) unlock();
  }
  document.addEventListener('visibilitychange', visibility);
  window.addEventListener('pointerdown', unlock, { capture: true, passive: true });
  window.addEventListener('keydown', keydown, true);
  function dispose() {
    if (disposed) return;
    disposed = true;
    stop();
    for (const sound of sounds.values()) sound.unload();
    document.removeEventListener('visibilitychange', visibility);
    window.removeEventListener('pointerdown', unlock, true);
    window.removeEventListener('keydown', keydown, true);
  }
  return { unlock, play, stop, setPhase, setMuted, getState, dispose };
}
