import content, { clamp, create as element } from '../content.js';
import { openingPhotoId } from '../opening-photo.js';
import { mountPaperStage } from './paper-stage.js';

let mounted;
const PAPER = { width: 230, padding: 14, caption: 48, aspect: 1279 / 1706 };
const DESK = {
  focus: [720, 451, -4],
  slots: [
    [900, 301, 11],
    [520, 381, -9],
    [1060, 561, 8],
    [470, 636, -14],
  ],
};

function mount(root, ctx) {
  if (mounted) return mounted.api;
  const signalController = new AbortController(),
    signal = signalController.signal;
  const state = {
    phase: 'idle',
    running: false,
    settled: false,
    cancelled: false,
    inspectedPhotoId: null,
    focusPhotoId: openingPhotoId,
    elapsed: 0,
    runId: 0,
  };
  let records = [];
  let works = [];
  const viewport = { width: 1440, height: 900 };
  let screenViewport = { width: innerWidth, height: innerHeight };
  let inspectionReturnFocus = null;
  const layer = element('section', 'capture-layer');
  layer.id = 'capture-layer';
  layer.hidden = true;
  layer.inert = true;
  layer.setAttribute('aria-label', '古建摄影作品散片桌面');
  const paperStage = mountPaperStage(root, ctx.reducedMotion);
  const desk = paperStage.scene;
  const paperLayer = element('div', 'capture-papers');
  const heading = element('div', 'capture-heading folio-frame');
  const frame = element('div', 'frame tl');
  frame.append(
    element('b', '', content.uiText.bookTitle.text),
    element(
      'span',
      '',
      content.chapters.find((chapter) => chapter.id === content.findPhoto(state.focusPhotoId).chapterId).title
    )
  );
  heading.append(frame);
  const hint = element('p', 'capture-hint', '点击相纸细看 · 向下滚动，收成一本摄影集');
  const controls = element('div', 'capture-controls');
  const returnButton = element('button', 'capture-return', '↙ 返回人物介绍');
  returnButton.type = 'button';
  controls.append(returnButton);
  const inspectionClose = element('button', 'capture-inspection-close', '收回桌面 ↙');
  inspectionClose.type = 'button';
  inspectionClose.hidden = true;
  const inspectionBackdrop = element('button', 'capture-inspection-close capture-inspection-backdrop');
  inspectionBackdrop.type = 'button';
  inspectionBackdrop.hidden = true;
  inspectionBackdrop.tabIndex = -1;
  inspectionBackdrop.setAttribute('aria-label', '点击空白处，将照片收回桌面');
  const inspectionTitle = element('p', 'capture-inspection-title');
  inspectionTitle.hidden = true;
  const announcement = element('p', 'capture-announcement');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', 'polite');
  layer.append(heading, hint, controls, inspectionTitle, inspectionClose, announcement);
  paperStage.board.append(paperLayer, layer);

  function layout() {
    const fit = paperStage.refreshLayout();
    screenViewport = { width: fit.width, height: fit.height };
    records.forEach((record) => {
      record.width = PAPER.width;
      record.height = (PAPER.width - 2 * PAPER.padding) / PAPER.aspect + PAPER.padding + PAPER.caption;
      const [x, y, angle] = record.desk;
      record.target = { x: x - record.width / 2, y: y - record.height / 2, angle };
      if (layer.classList.contains('is-gathering')) return;
      record.node.style.width = `${record.width}px`;
      record.node.style.height = `${record.height}px`;
      record.node.style.setProperty('--paper-width', `${record.width}px`);
      if (!state.running && (state.settled || record.index > 0) && !state.inspectedPhotoId) {
        place(record, record.target.x, record.target.y, angle, 1, 0);
      }
    });
  }

  function place(record, x, y, angle, scale, tilt) {
    record.node.style.transform = [
      `translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0)`,
      `rotate(${angle.toFixed(2)}deg)`,
      `rotateX(${tilt.toFixed(2)}deg)`,
      `scale(${scale.toFixed(4)})`,
    ].join(' ');
    record.position = { x, y, angle, scale, tilt };
  }

  function makePapers(focusPhotoId = openingPhotoId) {
    const focus = content.findPhoto(focusPhotoId);
    if (!focus) throw new Error(`相纸作品不存在：${focusPhotoId}`);
    if (!works.length || focusPhotoId !== state.focusPhotoId) {
      const spread = content.spreads.find((spread) => spread.id === focus.spreadId);
      const spreadIds = [...spread.left.photoIds, ...spread.right.photoIds];
      const mates = spreadIds.filter((id) => id !== focusPhotoId);
      const pool = content.photos
        .map((photo) => photo.id)
        .filter((id) => !spreadIds.includes(id))
        .sort(() => Math.random() - 0.5);
      const others = pool.slice(0, 4 - mates.length);
      const stackOrder = [...others, ...mates, focusPhotoId];
      works = [focusPhotoId, ...mates, ...others].map((id, index) => {
        const photo = content.findPhoto(id);
        return {
          ...photo,
          title: photo.shortTitle,
          chapter: photo.chapterId,
          desk: index === 0 ? DESK.focus : DESK.slots[index - 1],
          stackIndex: stackOrder.indexOf(id),
          isFocus: id === focusPhotoId,
          onSpread: spreadIds.includes(id),
        };
      });
    }
    state.focusPhotoId = focusPhotoId;
    const chapter = content.chapters.find((chapter) => chapter.id === focus.chapterId);
    frame.lastElementChild.textContent = chapter.title;
    layer.setAttribute('aria-label', `${chapter.shortTitle}摄影作品散片桌面`);
    paperStage.start();
    paperLayer.replaceChildren();
    records = works.map((work, index) => {
      const node = element('button', 'capture-paper');
      node.type = 'button';
      node.disabled = true;
      node.dataset.photoId = work.id;
      node.dataset.chapterId = work.chapter;
      node.dataset.paperRole = index === 0 ? 'new-print' : 'preplaced';
      node.setAttribute('aria-label', `${work.title}，点击完整查看摄影作品`);
      node.style.zIndex = String((work.onSpread ? 40 : 10) + work.stackIndex);
      const image = element('img', 'capture-paper-image');
      image.src = work.src;
      image.alt = `${work.title}，魏子奇摄影作品`;
      image.draggable = false;
      image.decoding = 'async';
      const caption = element('span', 'capture-paper-caption');
      caption.append(
        element('span', 'capture-paper-name', work.title),
        element('span', 'capture-paper-number', String(work.readingIndex + 1).padStart(2, '0'))
      );
      node.append(image, caption);
      paperLayer.append(node);
      const record = {
        ...work,
        index,
        node,
        image,
        caption,
        released: index > 0,
        touchedDown: index > 0,
        landed: index > 0,
        release: null,
        position: null,
      };
      if (index > 0) node.classList.add('is-landed');
      return record;
    });
    layout();
  }

  function inspect(id) {
    if (!state.settled || layer.classList.contains('is-gathering')) return false;
    const selected = records.find((record) => record.id === id);
    if (!selected) return false;
    const entering = state.inspectedPhotoId !== id;
    selected.image.src = selected.fullSrc;
    state.inspectedPhotoId = id;
    layer.classList.add('is-inspecting');
    paperLayer.classList.add('is-inspecting');
    controls.inert = true;
    if (inspectionBackdrop.parentElement !== paperLayer) paperLayer.append(inspectionBackdrop);
    inspectionBackdrop.hidden = false;
    inspectionReturnFocus = selected.node;
    records.forEach((record) => {
      record.node.disabled = record !== selected;
      record.node.classList.toggle('is-inspected', record === selected);
      record.node.style.zIndex = String(
        record === selected ? 90 : (record.onSpread ? 40 : 10) + record.stackIndex
      );
    });
    const height = (selected.width - 2 * PAPER.padding) / selected.aspect + PAPER.padding + PAPER.caption;
    selected.node.style.height = `${height}px`;
    selected.image.style.aspectRatio = String(selected.aspect);
    selected.image.style.objectFit = 'contain';
    const scale = Math.min(
      (screenViewport.width * 0.82) / (selected.width * paperStage.fit.scale),
      (screenViewport.height * 0.77) / (height * paperStage.fit.scale),
      3.8
    );
    place(
      selected,
      (viewport.width - selected.width) / 2,
      (viewport.height - height) / 2 - 12 / paperStage.fit.scale,
      0,
      scale,
      0
    );
    inspectionTitle.textContent = selected.title + ' · 完整原作';
    inspectionTitle.hidden = false;
    inspectionClose.hidden = false;
    if (entering) {
      inspectionClose.focus({ preventScroll: true });
      ctx.audio.play('inspect');
    }
    return true;
  }

  function closeInspection() {
    const selected = records.find((record) => record.id === state.inspectedPhotoId);
    if (!selected) return;
    state.inspectedPhotoId = null;
    selected.image.src = selected.src;
    layer.classList.remove('is-inspecting');
    paperLayer.classList.remove('is-inspecting');
    inspectionBackdrop.hidden = true;
    controls.inert = false;
    records.forEach((record) => {
      record.node.disabled = false;
      record.node.classList.remove('is-inspected');
      record.node.style.zIndex = String((record.onSpread ? 40 : 10) + record.stackIndex);
    });
    selected.node.style.height = `${selected.height}px`;
    selected.image.style.aspectRatio = '';
    selected.image.style.objectFit = '';
    place(selected, selected.target.x, selected.target.y, selected.target.angle, 1, 0);
    inspectionClose.hidden = true;
    inspectionTitle.hidden = true;
    inspectionReturnFocus?.focus({ preventScroll: true });
    ctx.audio.play('close');
  }
  function setGatherProgress(progress) {
    if (!state.settled || state.inspectedPhotoId) return;
    const p = clamp(progress);
    layer.classList.toggle('is-gathering', p > 0);
    layer.style.setProperty('--gather-progress', String(p));
    layer.inert = p > 0;
    controls.inert = p > 0;
    records.forEach((record) => {
      record.node.disabled = p > 0 && record.node.parentElement === paperLayer;
      record.node.style.transition = p > 0 ? 'none' : '';
      if (p > 0) return;
      if (record.node.parentElement !== paperLayer) paperLayer.append(record.node);
      record.node.style.width = `${record.width}px`;
      record.node.style.height = `${record.height}px`;
      record.node.style.setProperty('--paper-width', `${record.width}px`);
      record.node.style.setProperty('--paper-border-scale', '1');
      record.node.style.opacity = '1';
      record.node.style.visibility = '';
      record.node.style.padding = '';
      record.node.style.boxShadow = '';
      record.image.style.height = '';
      record.caption.style.height = '';
      record.caption.style.opacity = '';
      record.caption.style.fontSize = '';
      place(record, record.target.x, record.target.y, record.target.angle, 1, 0);
    });
  }
  function reset() {
    Object.assign(state, {
      phase: 'idle',
      running: false,
      settled: false,
      cancelled: true,
      inspectedPhotoId: null,
      elapsed: 0,
      });
    paperStage.stop();
    layer.hidden = true;
    layer.inert = true;
    layer.classList.remove('is-settled', 'is-inspecting', 'is-gathering');
    paperLayer.classList.remove('is-inspecting');
    layer.dataset.phase = 'idle';
    paperLayer.replaceChildren();
    records = [];
    inspectionClose.hidden = true;
    inspectionTitle.hidden = true;
    inspectionBackdrop.hidden = true;
    inspectionReturnFocus = null;
    controls.inert = true;
    desk.style.opacity = '0';
  }
  returnButton.addEventListener('click', () => ctx.returnToProfile(), { signal });
  paperLayer.addEventListener(
    'click',
    (event) => {
      const paper = event.target.closest('.capture-paper');
      if (paper) inspect(paper.dataset.photoId);
    },
    { signal }
  );
  inspectionClose.addEventListener('click', closeInspection, { signal });
  inspectionBackdrop.addEventListener('click', closeInspection, { signal });
  document.addEventListener(
    'keydown',
    (event) => {
      if (layer.hidden || event.key !== 'Escape' || ctx.album()?.getState().active) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      if (state.inspectedPhotoId) closeInspection();
      else ctx.returnToProfile();
    },
    { capture: true, signal }
  );
  const observer = new ResizeObserver(() => {
    layout();
    if (state.inspectedPhotoId) inspect(state.inspectedPhotoId);
    ctx.album()?.refreshLayout();
  });
  observer.observe(root);
  const api = {
    enter: () => {
      ctx.readyDesk();
      ctx.album()?.refreshLayout();
    },
    layer,
    desk,
    paperStage,
    paperLayer,
    heading,
    hint,
    controls,
    returnButton,
    announcement,
    state,
    get records() {
      return records;
    },
    get viewport() {
      return viewport;
    },
    get screenViewport() {
      return screenViewport;
    },
    makePapers,
    place,
    reset,
    inspect,
    closeInspection,
    setGatherProgress,
    getGatherSources: () =>
      records.map((record) => ({
        id: record.id,
        index: record.index,
        stackIndex: record.stackIndex,
        isFocus: record.isFocus,
        onSpread: record.onSpread,
        aspect: record.aspect,
        imageAspect: record.aspect,
        center: { x: record.desk[0], y: record.desk[1] },
        desk: { x: record.desk[0], y: record.desk[1], angle: record.desk[2] },
        width: record.width,
        height: record.height,
        node: record.node,
        image: record.image,
        caption: record.caption,
        target: { ...record.target },
      })),
    getState: () => ({
      ...state,
      openingPhotoId: state.focusPhotoId,
      chapterId: content.findPhoto(state.focusPhotoId).chapterId,
      photos: records.map((record) => ({
        id: record.id,
        title: record.title,
        chapterId: record.chapter,
        stackIndex: record.stackIndex,
        isFocus: record.isFocus,
        onSpread: record.onSpread,
        released: record.released,
        touchedDown: record.touchedDown,
        landed: record.landed,
        loaded: record.image.complete && record.image.naturalWidth > 0,
        position: record.position ? { ...record.position } : null,
      })),
      deskLoaded: true,
      deskAsset: null,
      deskRendering: 'graphic-stage',
    }),
  };
  mounted = { api, signalController, observer };
  reset();
  return api;
}
function unmount() {
  if (!mounted) return;
  mounted.signalController.abort();
  mounted.observer.disconnect();
  mounted.api.paperStage.dispose();
  mounted.api.layer.remove();
  mounted = null;
}
export default { id: 'desk', mount, unmount };
