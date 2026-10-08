import '../vendor/gsap.min.js';

// 床位视角转动、拖动惯性和横向滚动吸附。
export function createDormSwitch({ scene, track, records, home, ui, reducedMotion, changed, click }) {
  const state = { pos: 0 };
  const positions = records.map(record => record.entry.bedPosition);
  const minimum = Math.min(...positions);
  const maximum = Math.max(...positions);
  const clamp = value => Math.max(minimum, Math.min(maximum, value));
  const enabled = () => loaded && document.body.dataset.stage === 'room';
  let radius = 1247;
  let tween = null;
  let drag = null;
  let lastPos = null;
  let lastTime = 0;
  let wheelTimer = 0;
  let loaded = false;
  let assetsLoaded = false;

  function atHome() {
    return !drag?.moved && !tween && Math.abs(state.pos - home.bedPosition) < .001;
  }

  function render() {
    const now = performance.now();
    const speed = lastPos === null ? 0 : Math.abs(state.pos - lastPos) / Math.max(8, now - lastTime) * 1000;
    lastPos = state.pos;
    lastTime = now;
    scene.style.setProperty('--mb', `${Math.min(14, speed * 2.2).toFixed(2)}px`);
    track.style.transform = `translateZ(${radius}px) rotateY(${state.pos * 60}deg)`;
    const moving = Boolean(drag?.moved || tween || Math.abs(state.pos - Math.round(state.pos)) > .001);
    const atEndpoint = state.pos === Math.round(state.pos);
    records.forEach((record, index) => {
      const position = positions[index];
      record.panel.style.transform = `rotateY(${-position * 60}deg) translateZ(${-radius}px)`;
      const ready = record.entry === home || assetsLoaded;
      const visible = ready && Math.abs(position - state.pos) < 1.5;
      record.panel.style.visibility = visible ? 'visible' : 'hidden';
      record.wall.hidden = !visible || (!moving && atEndpoint && position !== state.pos);
    });
    document.body.dataset.roomView = moving ? 'moving' : atHome() ? 'active' : 'locked';
    scene.dataset.position = state.pos.toFixed(4);
    ui.bedState({ previous: !moving && state.pos > minimum, next: !moving && state.pos < maximum,
      home: atHome(), ready: loaded && assetsLoaded && !moving });
  }

  function settle() {
    lastPos = null;
    render();
    changed();
  }

  function goTo(target, duration = .85) {
    tween?.kill();
    const destination = clamp(target);
    if (reducedMotion.matches) {
      state.pos = destination;
      tween = null;
      settle();
      return;
    }
    tween = window.gsap.timeline({ onUpdate: render, onComplete: () => {
      tween = null;
      settle();
    } });
    tween.to(state, { pos: destination, duration, ease: 'power2.inOut' });
    render();
    changed();
  }

  function step(direction) {
    if (!enabled() || !assetsLoaded || drag || tween?.isActive()) return;
    goTo(Math.round(state.pos) + direction);
  }
  ui.onView(action => step(action === 'next' ? 1 : -1));
  window.addEventListener('keydown', event => {
    if (!enabled() || drag || tween?.isActive() || Math.abs(state.pos - Math.round(state.pos)) > .001) return;
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      step(event.key === 'ArrowRight' ? 1 : -1);
    }
  });

  scene.addEventListener('pointerdown', event => {
    if (!enabled() || event.button !== 0 || event.target.closest('.arrow')) return;
    tween?.kill();
    tween = null;
    const now = performance.now();
    drag = { x: event.clientX, pos: state.pos, moved: false, vx: 0, lx: event.clientX, lt: now };
    scene.setPointerCapture(event.pointerId);
  });
  scene.addEventListener('pointermove', event => {
    if (!drag) return;
    const scale = innerWidth / 1440;
    const dx = (event.clientX - drag.x) / scale;
    if (Math.abs(dx) > 6) {
      drag.moved = true;
      scene.classList.add('dragging');
    }
    const now = performance.now();
    drag.vx = (event.clientX - drag.lx) / scale / Math.max(8, now - drag.lt);
    drag.lx = event.clientX;
    drag.lt = now;
    if (drag.moved && assetsLoaded) {
      state.pos = clamp(drag.pos - dx / 1440);
      changed();
      render();
    }
  });
  function release(event, cancelled = false) {
    if (!drag) return;
    scene.classList.remove('dragging');
    const previous = drag;
    drag = null;
    if (scene.hasPointerCapture(event.pointerId)) scene.releasePointerCapture(event.pointerId);
    if (!previous.moved && !cancelled) {
      render();
      click(event);
      return;
    }
    if (!assetsLoaded) {
      settle();
      return;
    }
    const fling = !cancelled && Math.abs(previous.vx) > .5 ? -Math.sign(previous.vx) : 0;
    const start = Math.round(previous.pos);
    let target = fling > 0 ? Math.ceil(state.pos) : fling < 0 ? Math.floor(state.pos) : Math.round(state.pos);
    if (fling && target === start) target = start + fling;
    goTo(target, .55);
  }
  scene.addEventListener('pointerup', event => release(event));
  scene.addEventListener('pointercancel', event => release(event, true));

  window.addEventListener('wheel', event => {
    if (!enabled() || !assetsLoaded || Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
    event.preventDefault();
    tween?.kill();
    tween = null;
    state.pos = clamp(state.pos + event.deltaX / innerWidth * 1.2);
    changed();
    render();
    clearTimeout(wheelTimer);
    wheelTimer = setTimeout(() => goTo(Math.round(state.pos), .4), 160);
  }, { passive: false });

  function fit() {
    radius = innerWidth / (2 * Math.tan(Math.PI / 6));
    const depth = 160 * innerWidth / 1440;
    scene.style.perspective = `${radius}px`;
    scene.style.perspectiveOrigin = '50% 50%';
    scene.style.setProperty('--dorm-depth', `${depth}px`);
    scene.style.setProperty('--dorm-depth-scale', (radius - depth) / radius);
    lastPos = null;
    render();
  }
  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) goTo(Math.round(state.pos), 0);
  });
  return {
    atHome,
    fit,
    ready() {
      loaded = true;
      settle();
    },
    assetsReady() {
      assetsLoaded = true;
      settle();
    },
    home() {
      clearTimeout(wheelTimer);
      tween?.kill();
      tween = null;
      drag = null;
      state.pos = home.bedPosition;
      settle();
    },
  };
}
