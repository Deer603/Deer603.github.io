import { shellText } from './ui.js';
import { createDormSwitch } from './dorm-switch.js';

export async function createDorm(characters, ui, enter) {
  const host = document.getElementById('room-layer');
  const world = host.closest('.room-world');
  const scene = world.closest('.room-scene');
  const body = document.body;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const home = characters.find(entry => !entry.locked);
  const buttons = new Map();
  const image = host.querySelector('.room-backdrop');
  const records = [];
  let hovered = null;
  let focused = null;
  let pointer = null;
  let pan = 0;
  let targetPan = 0;
  let frame = 0;
  let lastTime = 0;
  let roomScale = 1;
  let switching;

  const track = document.createElement('div');
  track.className = 'dorm-track';
  scene.prepend(track);

  function createPanel(entry) {
    const panel = document.createElement('div');
    panel.className = `dorm-panel ${entry.locked ? 'locked' : 'home'}`;
    panel.dataset.character = entry.id;
    if (entry.locked) panel.style.visibility = 'hidden';
    const wall = document.createElement('div');
    wall.className = 'dorm-wall';
    const backgroundWorld = entry === home ? world : document.createElement('div');
    backgroundWorld.className = 'room-world';
    if (entry !== home) {
      backgroundWorld.innerHTML = '<div class="room-layer"><img class="room-backdrop" alt="" '
        + 'draggable="false"></div>';
    }
    wall.append(backgroundWorld);
    const depth = document.createElement('div');
    depth.className = 'dorm-depth';
    const actorWorld = document.createElement('div');
    actorWorld.className = 'room-actor-world';
    if (entry === home) {
      actorWorld.append(...world.querySelectorAll('.room-light, .ground-shadow'));
    }
    depth.append(actorWorld);
    panel.append(wall, depth);
    track.append(panel);
    const data = entry.dorm;
    const node = document.createElement(entry.locked ? 'div' : 'button');
    node.className = 'room-character';
    node.dataset.slot = entry.slot;
    node.dataset.home = String(entry === home);
    if (entry === home) node.id = 'character';
    node.innerHTML = '<span class="character-images" aria-hidden="true"><img class="idle-character" '
      + 'alt="" draggable="false">'
      + (entry.locked ? '' : '<img class="awake-character" alt="" draggable="false">')
      + `</span>${data.text?.marker || ''}`;
    actorWorld.append(node);
    if (entry.locked) {
      const label = document.createElement('div');
      label.innerHTML = `<div class="mark">${shellText.lockedMark}</div>`
        + `<div class="lockText"><b>${shellText.lockedLabel}</b>`
        + `<small>${shellText.lockedNumber(entry.slot)}</small></div>`;
      actorWorld.append(...label.children);
    }
    const record = {
      entry,
      panel,
      wall,
      backgroundWorld,
      actorWorld,
      node,
      text: data.text,
      mask: null,
      visibleTop: 0,
      data,
    };
    records.push(record);
    if (!entry.locked) buttons.set(entry.slot, record);
    return record;
  }
  characters.forEach(createPanel);

  async function loadCharacter(record) {
    const idle = record.node.querySelector('.idle-character');
    const awake = record.node.querySelector('.awake-character');
    idle.src = record.data.idle;
    if (awake) awake.src = record.data.awake || record.data.idle;
    const images = awake ? [idle, awake] : [idle];
    await Promise.all(images.map(item => item.decode()));
    const canvas = document.createElement('canvas');
    canvas.width = idle.naturalWidth;
    canvas.height = idle.naturalHeight;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    const bounds = images.map(item => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(item, 0, 0, canvas.width, canvas.height);
      const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
      if (item === idle && !record.entry.locked) {
        record.mask = { pixels, width: canvas.width, height: canvas.height };
      }
      const first = pixels.findIndex((alpha, index) => index % 4 === 3 && alpha > 16);
      return Math.max(0, Math.floor(first / 4 / canvas.width) / canvas.height);
    });
    record.visibleTop = Math.min(...bounds);
  }

  function renderPan(now = performance.now()) {
    frame = 0;
    if (document.hidden || !image) return;
    const dt = lastTime ? Math.min((now - lastTime) / 1000, 0.05) : 1 / 60;
    lastTime = now;
    const damping = reducedMotion.matches ? 1 : 1 - Math.exp(-dt * 6.5);
    pan += (targetPan - pan) * damping;
    if (Math.abs(pan - targetPan) < 0.001) pan = targetPan;
    // 整体平移和人物层的少量相对位移使用同一时钟、同一归一化输入。
    body.style.setProperty('--scene-shift', `${(pan * Math.min(64, innerWidth * 0.05)).toFixed(3)}px`);
    body.style.setProperty(
      '--actor-depth',
      `${((pan * Math.min(12, innerWidth * 0.01)) / roomScale).toFixed(3)}px`
    );
    refreshHover();
    if (pan !== targetPan) frame = requestAnimationFrame(renderPan);
    else lastTime = 0;
  }

  function fitRoom() {
    const cover = Math.max(innerWidth / 1440, innerHeight / 900);
    roomScale = cover;
    for (const record of records) {
      const style = getComputedStyle(record.node);
      const headTop = Number.parseFloat(style.top) + Number.parseFloat(style.height) * record.visibleTop;
      roomScale = Math.min(roomScale, (innerHeight * 0.97) / (900 - headTop));
    }
    const introBounds = home.dorm.introBounds;
    if (innerWidth > 760 && introBounds) {
      const margin = 24;
      const horizontalExtent = Math.max(1440 - 2 * introBounds.left, 2 * introBounds.right - 1440);
      roomScale = Math.min(roomScale, (innerWidth - 2 * margin) / horizontalExtent,
        (innerHeight - margin) / (900 - introBounds.top));
    }
    const left = `${(innerWidth - 1440 * roomScale) / 2}px`;
    const top = `${innerHeight - 900 * roomScale}px`;
    for (const record of records) {
      record.backgroundWorld.dataset.limited = String(roomScale < cover);
      for (const canvas of [record.backgroundWorld, record.actorWorld]) {
        canvas.style.setProperty('--room-scale', roomScale);
        canvas.style.left = left;
        canvas.style.top = canvas === record.backgroundWorld
          ? `${innerHeight - 900 * roomScale + innerHeight * .3}px` : top;
      }
    }
    const stage = document.getElementById('experience');
    stage.style.setProperty('--dorm-scale', roomScale);
    stage.style.setProperty('--dorm-left', left);
    stage.style.setProperty('--dorm-top', top);
    stage.style.setProperty('--dorm-room-scale', innerWidth <= 760 ? 1.06 : 1.13);
    switching?.fit();
  }

  function schedule() {
    if (!frame && !document.hidden) {
      lastTime = 0;
      frame = requestAnimationFrame(renderPan);
    }
  }

  function setPan(amount) {
    targetPan = body.dataset.stage !== 'room' || reducedMotion.matches || !switching?.atHome()
      ? 0 : Math.max(-1, Math.min(1, Number(amount) || 0));
    schedule();
  }

  function wake() {
    for (const record of buttons.values()) {
      const awake =
        body.dataset.stage === 'room' && !record.node.inert && (hovered === record || focused === record);
      record.node.dataset.awake = String(awake);
      record.node.setAttribute(
        'aria-label',
        record.text?.[awake ? 'awakeAria' : 'idleAria'] || record.entry.id
      );
      if (record.entry === home) body.dataset.awake = String(awake);
    }
  }
  function hits(record, x, y, tolerance = 0) {
    const rect = record.node.getBoundingClientRect();
    if (
      x < rect.left - tolerance ||
      x > rect.right + tolerance ||
      y < rect.top - tolerance ||
      y > rect.bottom + tolerance
    )
      return false;
    const u = (x - rect.left) / rect.width,
      v = (y - rect.top) / rect.height;
    if (!record.mask) return u > 0.21 && u < 0.85 && v > 0.06 && v < 0.97;
    const { pixels, width, height } = record.mask;
    const px = Math.floor(u * width),
      py = Math.floor(v * height),
      radius = Math.ceil((tolerance * width) / rect.width);
    return [
      [0, 0],
      [radius, 0],
      [-radius, 0],
      [0, radius],
      [0, -radius],
    ].some(([dx, dy]) => {
      const sx = px + dx,
        sy = py + dy;
      return sx >= 0 && sy >= 0 && sx < width && sy < height && pixels[(sy * width + sx) * 4 + 3] > 96;
    });
  }
  function refreshHover() {
    if (!pointer || body.dataset.stage !== 'room') return;
    hovered =
      [...buttons.values()].find(
        (record) => !record.node.inert && hits(record, pointer.x, pointer.y, hovered === record ? 7 : 0)
      ) || null;
    wake();
  }
  function enterCharacter(record, event) {
    if (body.dataset.stage !== 'room' || !switching.atHome() || record.node.inert
      || (event.detail > 0 && !hits(record, event.clientX, event.clientY))) return;
    setPan(0);
    record.node.disabled = true;
    record.node.inert = true;
    enter(record.entry, event);
  }

  for (const record of buttons.values()) {
    record.node.addEventListener('focus', () => {
      focused = record.node.matches(':focus-visible') ? record : null;
      wake();
    });
    record.node.addEventListener('blur', () => {
      focused = null;
      wake();
    });
    // 指针点击统一由拖动的松手判定处理；键盘点击仍用原入口。
    record.node.addEventListener('click', event => {
      if (event.detail === 0) enterCharacter(record, event);
    });
  }

  switching = createDormSwitch({ scene, track, records, home, ui, reducedMotion,
    changed() {
      const active = switching.atHome() && body.dataset.stage === 'room';
      for (const record of buttons.values()) record.node.inert = !active;
      hovered = focused = null;
      setPan(0);
      wake();
    },
    click(event) {
      const record = [...buttons.values()].find(item => hits(item, event.clientX, event.clientY));
      if (record) enterCharacter(record, event);
    },
  });

  window.addEventListener('pointermove', event => {
    if (event.pointerType === 'touch' || body.dataset.stage !== 'room') return;
    pointer = { x: event.clientX, y: event.clientY };
    const ratio = event.clientX / innerWidth;
    const edge = .24;
    const amount = ratio < edge ? (edge - ratio) / edge : ratio > 1 - edge ? -(ratio - 1 + edge) / edge : 0;
    const magnitude = Math.min(1, Math.abs(amount));
    setPan(Math.sign(amount) * magnitude * magnitude * (3 - 2 * magnitude));
    refreshHover();
  }, { passive: true });
  document.documentElement.addEventListener('pointerleave', () => {
    pointer = null;
    hovered = null;
    setPan(0);
    wake();
  });
  window.addEventListener('blur', () => {
    pointer = null;
    hovered = focused = null;
    setPan(0);
    wake();
  });
  window.addEventListener('resize', () => {
    fitRoom();
    setPan(0);
    schedule();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(frame);
      frame = 0;
      lastTime = 0;
    } else schedule();
  });
  new MutationObserver(() => {
    if (body.dataset.stage !== 'room') setPan(0);
    for (const record of buttons.values()) {
      record.node.inert = body.dataset.stage !== 'room' || !switching.atHome();
    }
  }).observe(body, { attributes: true, attributeFilter: ['data-stage'] });
  reducedMotion.addEventListener('change', () => setPan(0));

  fitRoom();
  await loadCharacter(records.find(record => record.entry === home));
  await image.decode();
  fitRoom();
  host.dataset.roomReady = 'true';
  host.dataset.roomRendering = '2d';
  switching.ready();
  schedule();
  return {
    async preloadLocked() {
      await Promise.all(records.filter(record => record.entry.locked).map(async record => {
        const background = record.backgroundWorld.querySelector('img');
        background.src = record.data.background;
        await Promise.all([background.decode(), loadCharacter(record)]);
      }));
      fitRoom();
      switching.assetsReady();
    },
    return(event) {
      body.dataset.stage = 'room';
      body.dataset.awake = 'false';
      hovered = focused = null;
      for (const record of buttons.values()) record.node.disabled = false;
      switching.home();
      setPan(0);
      wake();
      ui.announce(shellText.returnAnnouncement);
      if (event?.detail === 0 && event.type === 'click') buttons.get(home.slot).node.focus({ preventScroll: true });
    },
  };
}
