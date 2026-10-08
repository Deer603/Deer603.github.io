import '../../../vendor/gsap.min.js';
import deskScene from './desk.js';

let mounted;

function mount(root, ctx) {
  if (mounted) return mounted.api;
  const stage = deskScene.mount(root, ctx);
  const { layer, desk, paperStage, paperLayer, heading, hint, controls, returnButton, announcement, state } = stage;
  const { gsap } = window;
  const profile = root.querySelector('.profile-scene');
  const viewfinder = profile.querySelector('.profile-vf');
  const shutter = profile.querySelector('#shutter');
  const motion = ctx.reducedMotion;
  const lifecycle = new AbortController();
  let timeline;
  let resolveRun;
  let resolveReverse;
  let activePromise;
  let backwards = false;
  let assetsReady = false;
  let film;
  let sheen;
  const N = 7;
  const I = { r: 1250, a: 0, cx: 0, cy: 0 };
  let openRadius = 1150;
  let irisViewport = [[0, 0], [1440, 0], [0, 900], [1440, 900]];
  const transitionStage = document.createElement('div');
  transitionStage.className = 'capture-transition-stage';
  transitionStage.setAttribute('aria-hidden', 'true');
  transitionStage.innerHTML = `
    <div class="capture-lift"></div>
    <svg class="capture-iris" viewBox="0 0 1440 900" width="1440" height="900">
      <defs>
        <radialGradient id="capture-blade-fill" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="400">
          <stop class="capture-bf0" offset="0" stop-color="#3a423c"/>
          <stop class="capture-bf1" offset=".1" stop-color="#1c211d"/>
          <stop offset="1" stop-color="#0b0d0b"/>
        </radialGradient>
        ${Array.from({ length: N }, (_, k) => `<filter id="capture-blade-shadow-${k}" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="8" stdDeviation="7" flood-color="#000" flood-opacity=".55"/>
        </filter>`).join('')}
      </defs>
      <g class="capture-blades"></g>
    </svg>`;
  root.append(transitionStage);
  const iris = transitionStage.querySelector('.capture-iris');
  const lift = transitionStage.querySelector('.capture-lift');
  const gradient = iris.querySelector('#capture-blade-fill');
  const bf0 = iris.querySelector('.capture-bf0');
  const bf1 = iris.querySelector('.capture-bf1');
  const bladesG = iris.querySelector('.capture-blades');
  bladesG.innerHTML = Array.from({ length: N }, (_, k) => `
    <g class="capture-blade" filter="url(#capture-blade-shadow-${k})">
      <path fill="url(#capture-blade-fill)"/>
      <line stroke="rgba(215,225,205,.32)" stroke-width="1.3"/>
    </g>`).join('');
  const blades = [...bladesG.children];
  const bladeFilters = blades.map((_, index) => iris.querySelector('#capture-blade-shadow-' + index));

  // 七叶光圈采用 12% 叠压、径向渐变与高光边缘。
  function drawIris() {
    const r = Math.max(I.r, 0.01);
    const x0 = -r * Math.tan(Math.PI / N);
    const L = 2600;
    const R = r + 320;
    gradient.setAttribute('r', R.toFixed(1));
    bf0.setAttribute('offset', (r / R).toFixed(4));
    bf1.setAttribute('offset', ((r + 50) / R).toFixed(4));
    // objectBoundingBox 基于实际写入 SVG 的一位小数路径，保持 104% 原裁剪。
    const roiX1 = -x0;
    const roiSector = (360 / N) * 1.12 * Math.PI / 180;
    const roiPoints = [
      [x0, -r], [x0 + L, -r],
      [roiX1 + L * Math.cos(roiSector), -r + L * Math.sin(roiSector)], [roiX1, -r],
    ].map(point => point.map(value => Number(value.toFixed(1))));
    const minX = Math.min(...roiPoints.map(point => point[0]));
    const maxX = Math.max(...roiPoints.map(point => point[0]));
    const minY = Math.min(...roiPoints.map(point => point[1]));
    const maxY = Math.max(...roiPoints.map(point => point[1]));
    const original = {
      left: minX - (maxX - minX) * 0.02,
      right: maxX + (maxX - minX) * 0.02,
      top: minY - (maxY - minY) * 0.02,
      bottom: maxY + (maxY - minY) * 0.02,
    };
    blades.forEach((g, k) => {
      const th = I.a + k * 360 / N;
      g.setAttribute('transform', `translate(${I.cx} ${I.cy}) rotate(${th.toFixed(2)})`);
      // 投影在叶片局部坐标中计算，先逆变换可视四角；3σ + dy = 29px。
      const angle = Number(th.toFixed(2)) * Math.PI / 180;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const visible = irisViewport.map(([x, y]) => [
        cos * (x - I.cx) + sin * (y - I.cy),
        -sin * (x - I.cx) + cos * (y - I.cy),
      ]);
      const margin = 3 * 7 + 8;
      const x = Math.max(original.left, Math.min(...visible.map(point => point[0])) - margin);
      const y = Math.max(original.top, Math.min(...visible.map(point => point[1])) - margin);
      const right = Math.min(original.right, Math.max(...visible.map(point => point[0])) + margin);
      const bottom = Math.min(original.bottom, Math.max(...visible.map(point => point[1])) + margin);
      const attributes = { x, y, width: Math.max(0, right - x), height: Math.max(0, bottom - y) };
      const filter = bladeFilters[k];
      for (const [name, value] of Object.entries(attributes)) {
        const text = String(value);
        if (filter.getAttribute(name) !== text) filter.setAttribute(name, text);
      }
      const x1 = -x0;
      const st = (360 / N) * 1.12 * Math.PI / 180;
      g.firstElementChild.setAttribute('d', [
        `M${x0.toFixed(1)} ${(-r).toFixed(1)}`,
        `L${(x0 + L).toFixed(1)} ${(-r).toFixed(1)}`,
        `L${(x1 + L * Math.cos(st)).toFixed(1)} ${(-r + L * Math.sin(st)).toFixed(1)}`,
        `L${x1.toFixed(1)} ${(-r).toFixed(1)} Z`,
      ].join(' '));
      g.lastElementChild.setAttribute('x1', x0.toFixed(1));
      g.lastElementChild.setAttribute('y1', (-r).toFixed(1));
      g.lastElementChild.setAttribute('x2', (x0 + L).toFixed(1));
      g.lastElementChild.setAttribute('y2', (-r).toFixed(1));
    });
  }

  function fitIris() {
    const fit = paperStage.fit;
    transitionStage.style.width = `${fit.width / fit.scale}px`;
    transitionStage.style.height = `${fit.height / fit.scale}px`;
    transitionStage.style.transform = `scale(${fit.scale})`;
    iris.style.left = `${fit.left / fit.scale}px`;
    iris.style.top = `${fit.top / fit.scale}px`;
    Object.assign(lift.style, {
      left: '0px',
      top: '0px',
      width: `${fit.width / fit.scale}px`,
      height: `${fit.height / fit.scale}px`,
    });
    const lens = profile.querySelector('.camera-lens-glint').getBoundingClientRect();
    const host = root.getBoundingClientRect();
    I.cx = (lens.left + lens.width / 2 - host.left - fit.left) / fit.scale;
    I.cy = (lens.top + lens.height / 2 - host.top - fit.top) / fit.scale;
    const corners = [
      [-fit.left / fit.scale, -fit.top / fit.scale],
      [(fit.width - fit.left) / fit.scale, -fit.top / fit.scale],
      [-fit.left / fit.scale, (fit.height - fit.top) / fit.scale],
      [(fit.width - fit.left) / fit.scale, (fit.height - fit.top) / fit.scale],
    ];
    irisViewport = corners;
    const farthest = Math.max(...corners.map(([x, y]) => Math.hypot(x - I.cx, y - I.cy))) + 1;
    I.r = Math.max(1250, farthest);
    openRadius = Math.max(1150, farthest);
    I.a = 0;
    drawIris();
  }

  function sound(name) {
    if (backwards || timeline?.reversed() || motion.matches) return;
    if (name === 'printer') ctx.audio.setPhase('printing');
    ctx.audio.play(name, { runId: state.runId, index: 0 });
  }

  function finish() {
    state.phase = 'settled';
    state.running = false;
    state.settled = true;
    state.elapsed = timeline.duration() * 1000;
    layer.dataset.phase = 'settled';
    layer.classList.add('is-settled');
    layer.inert = false;
    controls.inert = false;
    stage.records.forEach(record => {
      record.released = record.touchedDown = record.landed = true;
      record.node.disabled = false;
      record.node.classList.add('is-landed');
      record.position = { ...record.target, scale: 1, tilt: 0 };
      record.node.style.transition = '';
    });
    transitionStage.hidden = true;
    gsap.set(paperLayer, { clearProps: 'transform' });
    gsap.set([heading, hint], { clearProps: 'opacity,visibility' });
    gsap.set(controls, { clearProps: 'opacity,visibility,transform' });
    heading.style.transition = hint.style.transition = controls.style.transition = '';
    returnButton.style.transition = '';
    ctx.audio.setPhase('settled');
    const chapterId = stage.getState().chapterId;
    ctx.phase({ phase: 'settled', chapterId, photoIds: stage.records.map(record => record.id) });
    resolveRun?.({ cancelled: false, chapterId, elapsed: state.elapsed });
    resolveRun = null;
  }

  function reset() {
    ctx.resetAlbum();
    ctx.audio.setPhase('idle');
    timeline?.kill();
    timeline = null;
    resolveRun?.({ cancelled: true });
    resolveRun = null;
    resolveReverse?.({ cancelled: true });
    resolveReverse = null;
    activePromise = null;
    backwards = false;
    assetsReady = false;
    state.runId++;
    stage.reset();
    transitionStage.hidden = true;
    gsap.set(profile, { clearProps: 'opacity,visibility' });
  }

  function finishReverse() {
    state.running = false;
    state.phase = 'idle';
    layer.hidden = true;
    layer.inert = true;
    paperLayer.style.visibility = 'hidden';
    paperStage.stop();
    transitionStage.hidden = true;
    resolveReverse?.({ cancelled: false });
    resolveReverse = null;
  }

  function buildTimeline() {
    const focus = stage.records[0];
    const others = [2, 1, 3, 4].map(index => stage.records[index].node);
    const photo = document.createElement('div');
    photo.className = 'capture-photo';
    focus.image.before(photo);
    photo.append(focus.image);
    film = document.createElement('i');
    film.className = 'capture-film';
    sheen = document.createElement('b');
    sheen.className = 'capture-sheen';
    photo.append(film, sheen);
    stage.records.forEach(record => {
      record.node.style.transition = 'none';
      record.node.style.opacity = '1';
      record.node.style.visibility = 'visible';
      stage.place(record, record.target.x, record.target.y, record.target.angle, 1, 0);
    });
    returnButton.style.transition = 'none';
    gsap.set([desk, heading, controls, paperLayer], { opacity: 1, visibility: 'visible' });
    gsap.set(paperLayer, { scale: 1 });
    gsap.set(controls, { y: 0 });
    gsap.set(returnButton, { opacity: 0 });
    heading.style.transition = hint.style.transition = controls.style.transition = 'none';
    timeline = gsap.timeline({
      paused: true,
      defaults: { lazy: false },
      onUpdate() {
        state.elapsed = timeline.time() * 1000;
      },
      onComplete: finish,
      onReverseComplete: finishReverse,
    });
    // 快门、出片、显影共用一条时间线，相纸落到桌面节点。
    timeline
      .to(viewfinder, { scale: 0.86, duration: 0.045, ease: 'power2.in', yoyo: true, repeat: 1 }, 0)
      .to([shutter, viewfinder], { opacity: 0, duration: 0.15 }, 0.03)
      .to(I, { r: 0, a: 48, duration: 0.35, ease: 'power2.in', onUpdate: drawIris }, 0.05)
      .set(profile, { autoAlpha: 0 }, 0.4)
      .call(() => {
        if (!backwards && !timeline.reversed()) ctx.preloadAlbum();
      }, [], 0.4)
      .addPause(0.44, () => {
        if (backwards || timeline.reversed() || assetsReady) timeline.resume();
      })
      .to(I, { r: openRadius, a: 100, duration: 0.55, ease: 'expo.out', onUpdate: drawIris }, 0.44)
      .fromTo(lift, { opacity: 0.42 }, {
        opacity: 0, duration: 0.7, ease: 'power2.out', immediateRender: false,
      }, 0.44)
      .fromTo(focus.node, { y: focus.target.y - 700, rotation: -1, scale: 1.05 }, {
        y: focus.target.y - 360, rotation: -2, duration: 0.7, ease: 'sine.inOut',
      }, 0.62)
      .to(focus.node, { y: focus.target.y, rotation: -4, scale: 1, duration: 0.5, ease: 'power2.in' }, 1.36)
      .fromTo(focus.node, { boxShadow: '0 30px 60px rgba(60,50,30,.10)' }, {
        boxShadow: '0 2px 3px rgba(60,50,30,.22),0 10px 18px rgba(60,50,30,.16)',
        duration: 0.5, ease: 'power2.in',
      }, 1.36)
      .fromTo([desk, paperLayer], { scale: 1.014 }, {
        scale: 1, duration: 0.6, ease: 'expo.out', immediateRender: false,
      }, 1.86)
      .to(focus.node, { rotation: -4.7, y: focus.target.y - 3, duration: 0.09, ease: 'power1.out' }, 1.86)
      .to(focus.node, { rotation: -4, y: focus.target.y, duration: 0.22, ease: 'power2.inOut' }, 1.95)
      .to(others, { y: '-=3', duration: 0.08, ease: 'power1.out', stagger: 0.02, yoyo: true, repeat: 1 }, 1.87)
      .fromTo(film, { opacity: 1 }, { opacity: 0, duration: 1, ease: 'sine.inOut' }, 1.92)
      .fromTo(sheen, { opacity: 1, backgroundPosition: '120% 0' }, {
        backgroundPosition: '-20% 0', duration: 0.65, ease: 'power2.inOut', immediateRender: false,
      }, 2.75)
      .to(sheen, { opacity: 0, duration: 0.2 }, 3.25)
      .fromTo(heading, { opacity: 1, clipPath: 'inset(0 100% 0 0)' }, {
        clipPath: 'inset(0 0% 0 0)', duration: 0.6, ease: 'expo.out',
      }, 2.9)
      .fromTo([hint, returnButton], { opacity: 0 }, { opacity: 1, duration: 0.5, stagger: 0.1 }, 3.05)
      .call(() => sound('shutter'), [], 0.4)
      .call(() => sound('printer'), [], 0.62)
      .call(() => {
        if (!backwards && !timeline.reversed()) ctx.audio.stop('printer');
      }, [], 1.36)
      .call(() => sound('paper-land'), [], 1.86);
    timeline.progress(0);
    return timeline;
  }

  function reduceMotion() {
    if (!motion.matches || !state.running || !timeline) return;
    ctx.audio.stop();
    if (backwards) {
      timeline.pause(0, true);
      finishReverse();
    } else if (assetsReady) timeline.progress(1);
  }

  async function start() {
    if (state.running && activePromise) return activePromise;
    reset();
    state.running = true;
    state.cancelled = false;
    state.phase = 'shutter';
    layer.hidden = false;
    layer.inert = true;
    controls.inert = true;
    stage.makePapers();
    const runId = state.runId;
    const decodePromises = [
      ctx.preloadCapture(),
      ...[...stage.records.map(record => record.image), paperStage.gobo].map(image => image.decode()),
    ];
    desk.style.opacity = '1';
    desk.style.transform = 'none';
    document.body.style.setProperty('--capture-desk-progress', '1');
    transitionStage.hidden = false;
    fitIris();
    buildTimeline();
    activePromise = new Promise(resolve => {
      resolveRun = resolve;
    });
    ctx.phase({ phase: 'shutter', printedPhotoId: stage.records[0].id });
    if (!motion.matches) timeline.timeScale(1).play();
    await Promise.all(decodePromises);
    if (runId !== state.runId || lifecycle.signal.aborted) return { cancelled: true };
    assetsReady = true;
    if (motion.matches) reduceMotion();
    else if (!backwards && timeline.paused() && timeline.time() === 0.44) timeline.resume();
    return activePromise;
  }

  function reverse() {
    if (!timeline) {
      if (state.running) reset();
      return Promise.resolve({ cancelled: false });
    }
    backwards = true;
    ctx.audio.stop();
    state.settled = false;
    state.running = true;
    layer.classList.remove('is-settled');
    heading.style.transition = hint.style.transition = controls.style.transition = 'none';
    returnButton.style.transition = 'none';
    gsap.set([heading, hint, controls], { opacity: 1, visibility: 'visible' });
    gsap.set(controls, { y: 0 });
    layer.inert = true;
    controls.inert = true;
    transitionStage.hidden = false;
    stage.records.forEach(record => {
      record.node.disabled = true;
      record.node.style.transition = 'none';
    });
    resolveRun?.({ cancelled: true });
    resolveRun = null;
    const promise = new Promise(resolve => {
      resolveReverse = resolve;
    });
    if (motion.matches || timeline.time() === 0) {
      timeline.pause(0, true);
      finishReverse();
    } else timeline.timeScale(1.4).reverse();
    return promise;
  }

  motion.addEventListener('change', reduceMotion, { signal: lifecycle.signal });
  const api = {
    enter: start,
    start,
    reverse,
    reset,
    setGatherProgress: stage.setGatherProgress,
    getGatherSources: stage.getGatherSources,
    getState: stage.getState,
    get timeline() {
      return timeline;
    },
    iris,
  };
  mounted = { api, lifecycle, transitionStage };
  return api;
}

function unmount() {
  if (!mounted) return;
  mounted.api.reset();
  mounted.lifecycle.abort();
  mounted.transitionStage.remove();
  mounted = null;
}

export default { id: 'capture', mount, unmount };
