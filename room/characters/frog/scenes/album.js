import content, { clamp } from '../content.js';
import '../../../vendor/gsap.min.js';
import '../../../vendor/CustomEase.min.js';
import { mountPaperStage } from './paper-stage.js';
import { createGatherTimeline } from './gather.js';
import { openingPhotoId } from '../opening-photo.js';
import { createPageTurn } from './page-turn.js';

let dispose;
export default {
  id: 'album',
  mount(host, ctx) {
    const lifecycle = new AbortController(),
      signal = lifecycle.signal;
    const on = (target, type, listener, options = {}) =>
      target.addEventListener(type, listener, { ...options, signal });
    const { chapters, spreads } = content;
    const { gsap, CustomEase } = window;
    gsap.registerPlugin(CustomEase);
    const frameEase = CustomEase.create('album-frame-out', '.16,1,.3,1');
    const reduced = ctx.reducedMotion;
    let openingIndex = spreads.findIndex((spread) =>
      [spread.left, spread.right].some((page) => page.photoIds.includes(openingPhotoId))
    );
    const state = {
      active: false,
      phase: 'desk',
      gatherProgress: 0,
      readingProgress: openingIndex,
      spreadId: spreads[openingIndex].id,
      turnProgress: 0,
      jumpActive: false,
      inspectedPhotoId: null,
      openingPhotoId,
    };
    let pageWidth = 590,
      pageHeight = 760,
      lastAnnounced = '',
      animation = null;
    let lastGather = 0;
    let reversing = false;
    let gather = null;
    let destinations = {};
    let sources = [];
    let handReady = false;
    const pageCache = new Map();
    const paperStage = mountPaperStage(host, reduced);
    let touchY = null,
      returnFocus = null;
    const layer = document.createElement('section');
    layer.className = 'folio-layer';
    layer.hidden = true;
    layer.dataset.gatherProgress = '0';
    layer.inert = true;
    layer.setAttribute('aria-label', '魏子奇摄影艺术集');
    layer.innerHTML = `
    <div class="folio-perspective"><div class="folio-book">
      <div class="folio-ground-shadow" aria-hidden="true"></div>
      <div class="folio-cover folio-cover-right" aria-hidden="true"></div>
      <div class="folio-stack folio-stack-left" aria-hidden="true"></div>
      <div class="folio-stack folio-stack-right" aria-hidden="true"></div>
      <div class="folio-side folio-side-left" aria-hidden="true"></div>
      <div class="folio-side folio-side-right" aria-hidden="true"></div>
      <div class="folio-page folio-page-left" data-side="left"></div>
      <div class="folio-page folio-page-right" data-side="right"></div>
      <div class="folio-turn-shadow" aria-hidden="true"></div>
      <div class="folio-arrival-cover" aria-hidden="true">
        <div class="folio-arrival-cover-front"><b>光的<br>存档</b><small>魏子奇 · KEMA</small></div>
        <div class="folio-arrival-cover-back"></div>
      </div>
    </div></div>
    <canvas class="folio-turn-canvas" aria-hidden="true" hidden></canvas>
    <div class="folio-frame">
      <div class="frame tl"><b>${content.uiText.bookTitle.text}</b>${content.uiText.author.text}</div>
      <div class="frame bc">
        <span class="folio-chapter-current"></span><span class="bar" aria-hidden="true"><i></i></span>
        <span class="folio-counter" aria-label="相册页码"></span>
      </div>
      <button type="button" class="frame bl folio-return">${content.uiText.returnToDesk}</button>
    </div>
    <div hidden>
      <button type="button" class="folio-prev" aria-label="上一跨页"></button>
      <button type="button" class="folio-next" aria-label="下一跨页"></button>
    </div>
    <p class="sr-only folio-status" role="status" aria-live="polite"></p>`;
    paperStage.board.append(layer);
    const book = layer.querySelector('.folio-book');
    const chapterLeaves = document.createElement('div');
    chapterLeaves.className = 'folio-chapter-leaves';
    book.insertBefore(chapterLeaves, book.querySelector('.folio-page-left'));
    // 目录胶带属于章节第一页所在的实体纸叶，翻过之后出现在同一纸叶的背面。
    const chapterPaper = chapters.map((chapter, index) => ({
      chapter,
      index,
      leaf: spreads.findIndex((spread) => spread.id === chapter.entrySpreadId),
    }));
    const left = layer.querySelector('.folio-page-left'),
      right = layer.querySelector('.folio-page-right');
    const cover = layer.querySelector('.folio-arrival-cover');
    const shadow = layer.querySelector('.folio-turn-shadow');
    const prev = layer.querySelector('.folio-prev'),
      next = layer.querySelector('.folio-next');
    const status = layer.querySelector('.folio-status');
    const frame = layer.querySelector('.folio-frame');
    frame.hidden = true;
    paperStage.board.append(frame);
    const progressFill = frame.querySelector('.bar i');
    let frameSpreadId = '';
    const dialog = document.createElement('dialog');
    dialog.className = 'folio-inspection';
    dialog.setAttribute('aria-label', '作品原图');
    dialog.innerHTML =
      '<button type="button" data-close-inspection aria-label="关闭原图">关闭 ×</button>' +
      '<figure><img alt="" draggable="false"><figcaption></figcaption></figure>' +
      '<p class="folio-image-error" hidden>作品暂未加载，' +
      '<button type="button" data-retry-image>重新加载</button></p>';
    host.append(dialog);
    const hand = new Image();
    hand.src = new URL('../assets/hand.webp', import.meta.url).href;
    hand.alt = '';
    hand.draggable = false;
    hand.className = 'folio-gather-hand';
    hand.hidden = true;
    hand.setAttribute('aria-hidden', 'true');
    const handShadow = document.createElement('div');
    handShadow.className = 'folio-gather-hand-shadow limb';
    handShadow.setAttribute('aria-hidden', 'true');
    const limb = document.createElement('div');
    limb.className = 'limb';
    const arm = document.createElement('div');
    arm.className = 'arm';
    arm.innerHTML = '<div class="forearm"></div><div class="sleeve"></div>';
    limb.append(arm, hand);
    const shadowImage = hand.cloneNode();
    shadowImage.className = 'folio-gather-source';
    shadowImage.hidden = false;
    handShadow.append(arm.cloneNode(true), shadowImage);
    const handRig = document.createElement('div');
    handRig.className = 'folio-gather-rig';
    handRig.hidden = true;
    handRig.append(handShadow, limb);
    paperStage.board.append(handRig);
    Promise.all([hand.decode(), shadowImage.decode()])
      .then(() => {
        if (signal.aborted) return;
        handReady = true;
        refreshLayout();
      })
      .catch((error) => console.error('收片素材未能加载：', error));
    const image = dialog.querySelector('img');
    const restPages = document.createElement('div');
    restPages.className = 'folio-rest-pages';
    restPages.inert = true;
    book.prepend(restPages);
    const emit = () => {
      turn.setActive(state.phase === 'reading');
      if (state.active) paperStage.start();
      ctx.albumPhase({ ...state });
    };
    function requestDraw() {
      if (state.active) {
        if (state.phase === 'reading') drawReading();
        else drawGather();
      }
    }

    function cachedPage(page, side) {
      if (!pageCache.has(page.id)) {
        const surface = content.renderPage(page, side);
        pageCache.set(page.id, surface);
        restPages.append(surface);
      }
      return pageCache.get(page.id);
    }
    function setPage(node, page, side) {
      if (node.dataset.pageId === page.id) return;
      const old = node.querySelector('.folio-page-content');
      if (old) restPages.append(old);
      node.dataset.pageId = page.id;
      node.replaceChildren(cachedPage(page, side));
    }
    function chapterTab(item, side) {
      const tab = document.createElement('button');
      tab.type = 'button';
      tab.className = 'folio-chapter-tab';
      tab.dataset.spreadId = item.chapter.entrySpreadId;
      tab.dataset.paperLeaf = item.leaf;
      tab.dataset.side = side;
      tab.dataset.chapterId = item.chapter.id;
      tab.style.top = `${item.chapter.tabTop * 0.72}px`;
      tab.style.setProperty('--tab-color', item.chapter.tapeColor);
      tab.setAttribute('aria-label', `翻到${item.chapter.title}`);
      const title = item.chapter.shortTitle || item.chapter.title;
      tab.innerHTML =
        `<span class="folio-tab-number">0${item.index + 1}</span>` +
        `<span class="folio-tab-title">${title}</span>`;
      return tab;
    }
    const tabs = chapterPaper.map((item) => {
      const el = chapterTab(item, 'right');
      chapterLeaves.append(el);
      return { el, spread: item.leaf };
    });
    const turn = createPageTurn({
      canvas: layer.querySelector('.folio-turn-canvas'),
      book,
      shadow,
      tabs,
      setPages: (leftPage, rightPage) => {
        setPage(left, leftPage, 'left');
        setPage(right, rightPage, 'right');
      },
      onRender: updateReading,
      audio: ctx.audio,
      reduced,
    });
    function drawReading() {
      turn.setPosition(state.readingProgress);
    }
    function updateReading({ position, current: visibleIndex, turning, ts }) {
      state.readingProgress = position;
      state.turnProgress = ts.find((t) => t > 0 && t < 1) || 0;
      state.spreadId = spreads[visibleIndex].id;
      state.jumpActive = turn?.getState().jumping || false;
      left.inert = right.inert = turning;
      book.dataset.turning = String(turning);
      book.dataset.spreadId = state.spreadId;
      book.style.setProperty('--left-stack', `${4 + (12 * position) / (spreads.length - 1)}px`);
      book.style.setProperty('--right-stack', `${16 - (12 * position) / (spreads.length - 1)}px`);
      const chapter = chapters.find((item) => item.id === spreads[visibleIndex].chapterId);
      const spread = spreads[visibleIndex];
      if (frameSpreadId !== state.spreadId) {
        frameSpreadId = state.spreadId;
        frame.querySelector('.folio-chapter-current').textContent = chapter.title;
        frame.querySelector('.folio-counter').textContent =
          `${String(spread.left.number).padStart(2, '0')}—` +
          `${String(spread.right.number).padStart(2, '0')} / ${spreads.length * 2}`;
        gsap.to(progressFill, {
          width: `${(spread.right.number / (spreads.length * 2)) * 100}%`,
          duration: reduced.matches ? 0 : 0.28,
          ease: frameEase,
          overwrite: true,
        });
      }
      layer.querySelectorAll('[data-spread-id]').forEach((button) => {
        if (button.dataset.spreadId === chapter.entrySpreadId) button.setAttribute('aria-current', 'true');
        else button.removeAttribute('aria-current');
      });
      prev.disabled = position <= 0;
      next.disabled = position >= spreads.length - 1;
      if (!turning && lastAnnounced !== state.spreadId && state.phase === 'reading') {
        lastAnnounced = state.spreadId;
        status.textContent = `${chapter.title}，第 ${spread.left.number} 至 ${spread.right.number} 页。`;
      }
    }
    // 在书本最终状态下测量相纸中心、宽度和转角。
    function measure() {
      const box = paperStage.board.getBoundingClientRect();
      const scale = box.width / 1440;
      sources
        .filter((source) => source.onSpread)
        .forEach((source) => {
          const side = spreads[openingIndex].left.photoIds.includes(source.id) ? 'left' : 'right';
          const page = spreads[openingIndex][side];
          const surface = cachedPage(page, side);
          const slot = surface.querySelector(`button[data-photo-id="${source.id}"]`);
          const rect = slot.getBoundingClientRect();
          const center = {
            x: (rect.left + rect.width / 2 - box.left) / scale,
            y: (rect.top + rect.height / 2 - box.top) / scale,
          };
          destinations[source.id] = {
            source,
            slot,
            surface,
            center,
            width: slot.offsetWidth * 0.72,
            height: slot.offsetHeight * 0.72,
            padding: 7 * 0.72,
            rotation: parseFloat(slot.style.getPropertyValue('--rot')) || 0,
            stageParent: source.node.parentElement,
            stageStyle: source.node.style.cssText,
            stageClass: source.node.className,
            imageClass: source.image.className,
            imageStyle: source.image.style.cssText,
            captionStyle: source.caption.style.cssText,
            pageStyle: slot.style.cssText,
            attached: false,
          };
          slot.style.visibility = 'hidden';
        });
    }
    function restorePhoto(destination, restoreSlot = false) {
      const { source, slot, stageStyle, stageClass, imageClass } = destination;
      slot.style.cssText = destination.pageStyle;
      if (!restoreSlot) slot.style.visibility = 'hidden';
      if (source.node.parentElement !== destination.stageParent) {
        source.node.replaceWith(slot);
        destination.stageParent.append(source.node);
      }
      source.node.className = stageClass;
      source.node.style.cssText = stageStyle;
      source.image.className = imageClass;
      source.image.style.cssText = destination.imageStyle;
      source.caption.style.cssText = destination.captionStyle;
      source.caption.hidden = false;
      source.caption.style.opacity = '';
      delete source.node.dataset.openPhoto;
      destination.attached = false;
    }
    function attachPhoto(destination) {
      if (destination.attached) return;
      const { source, slot } = destination;
      source.node.className = slot.className;
      source.node.style.cssText = `${destination.pageStyle};display:block;height:auto;visibility:visible;opacity:1;`;
      source.node.dataset.openPhoto = source.id;
      source.node.disabled = false;
      source.image.className = '';
      source.image.style.cssText = '';
      const photo = content.findPhoto(source.id);
      source.image.width = photo.width;
      source.image.height = photo.height;
      source.image.dataset.photoId = photo.id;
      source.caption.style.cssText = '';
      source.caption.hidden = true;
      slot.replaceWith(source.node);
      destination.attached = true;
    }
    function buildGather() {
      const capture = ctx.capture()?.getState();
      if (!handReady || !capture?.settled) return false;
      gather?.timeline.progress(0, true);
      gather?.destroy();
      Object.values(destinations).forEach((destination) => restorePhoto(destination, true));
      ctx.capture().setGatherProgress(0);
      state.openingPhotoId = capture.openingPhotoId || openingPhotoId;
      openingIndex = spreads.findIndex((spread) =>
        [spread.left, spread.right].some((page) => page.photoIds.includes(state.openingPhotoId))
      );
      const reading = state.readingProgress;
      state.readingProgress = openingIndex;
      layer.hidden = false;
      layer.style.opacity = '1';
      book.style.transform = 'none';
      book.style.opacity = '1';
      book.style.setProperty('--page-reveal', '1');
      book.style.setProperty('--photo-reveal', '1');
      drawReading();
      sources = ctx.capture().getGatherSources();
      destinations = {};
      measure();
      const coverBack = cover.querySelector('.folio-arrival-cover-back');
      coverBack.replaceChildren(content.renderPage(spreads[openingIndex].left, 'left'));
      coverBack.querySelectorAll('.ph, .tape, .corners').forEach((node) => {
        node.style.visibility = 'hidden';
      });
      handRig.hidden = false;
      hand.hidden = false;
      handShadow.hidden = false;
      cover.hidden = false;
      gather = createGatherTimeline({
        book,
        cover,
        handRig,
        hand,
        handShadow,
        frame,
        captureHeading: host.querySelector('.capture-heading'),
        captureHint: host.querySelector('.capture-hint'),
        sources,
        destinations,
      });
      state.readingProgress = reading;
      return true;
    }
    function drawGather() {
      const p = state.gatherProgress;
      if (!gather && !buildGather()) return;
      const returning = p < lastGather;
      if (returning && !reversing) {
        ctx.audio?.stop('paper-gather');
        ctx.audio?.stop('page-turn');
      }
      reversing = returning;
      if (returning)
        Object.values(destinations)
          .filter((item) => item.attached)
          .forEach((destination) => restorePhoto(destination));
      if (returning) gather.timeline.progress(0, true);
      gather.timeline.progress(p, true);
      gather.render();
      handRig.hidden = p === 0 || p === 1;
      Object.values(destinations).forEach((destination) => {
        if (p + 1e-8 >= destination.flightEnd) attachPhoto(destination);
      });
      ctx.capture()?.setGatherProgress(p);
      hand.dataset.contact = handRig.dataset.contact;
      if (p > lastGather) {
        if (lastGather < 0.5 / 1.65 && p >= 0.5 / 1.65) ctx.audio?.play('paper-gather');
        if (lastGather < 0.55 / 1.65 && p >= 0.55 / 1.65) ctx.audio?.play('page-turn');
      }
      lastGather = p;
      layer.dataset.gatherProgress = String(p);
      layer.hidden = p <= 0;
      layer.inert = p < 1;
      frame.hidden = p <= 0;
      if (p === 0) {
        Object.values(destinations).forEach((destination) => restorePhoto(destination));
        ctx.capture()?.setGatherProgress(0);
      }
    }
    function refreshLayout() {
      // 单页始终使用设计稿的 590×760 坐标，整体等比适配视口。
      pageWidth = 590;
      pageHeight = 760;
      paperStage.refreshLayout();
      book.style.setProperty('--book-width', `${pageWidth * 2}px`);
      book.style.setProperty('--book-height', `${pageHeight}px`);
      book.style.setProperty('--page-width', `${pageWidth}px`);
      book.style.setProperty('--page-height', `${pageHeight}px`);
      turn.resize(paperStage.fit.scale);
      if (ctx.capture()?.getState().settled) {
        buildGather();
        drawGather();
      }
      if (state.phase === 'reading') drawReading();
    }
    function cancelJump() {
      turn.stop();
      animation?.kill();
      animation = null;
      state.jumpActive = false;
    }
    function activate() {
      if (state.active) return true;
      const capture = ctx.capture()?.getState();
      if (!handReady || !capture?.settled || capture.inspectedPhotoId || !ctx.requestScene('album'))
        return false;
      openingIndex = spreads.findIndex((spread) =>
        [spread.left, spread.right].some((page) => page.photoIds.includes(capture.openingPhotoId || openingPhotoId))
      );
      void turn.load();
      state.active = true;
      state.phase = 'gathering';
      state.gatherProgress = 0;
      state.readingProgress = openingIndex;
      refreshLayout();
      emit();
      return true;
    }
    function finishGather() {
      state.gatherProgress = 1;
      state.phase = 'reading';
      turn.setActive(true);
      layer.inert = false;
      layer.style.setProperty('--folio-reveal', '1');
      book.style.setProperty('--page-reveal', '1');
      cover.hidden = true;
      document.getElementById('capture-layer').inert = true;
      drawGather();
      drawReading();
      emit();
    }
    function applyGather(value) {
      state.gatherProgress = value < 0.00001 ? 0 : value > 0.99999 ? 1 : clamp(value);
      if (state.gatherProgress >= 1) finishGather();
      else if (state.gatherProgress <= 0) {
        drawGather();
        state.active = false;
        state.phase = 'desk';
        layer.hidden = true;
        layer.inert = true;
        document.getElementById('capture-layer').inert = false;
        emit();
      } else requestDraw();
    }
    function wheelDelta(event) {
      const reading = state.phase === 'reading';
      const scale = event.deltaMode === 1 ? (reading ? 20 : 18) :
        event.deltaMode === 2 ? (reading ? 800 : innerHeight) : 1;
      const limit = state.phase === 'reading' ? 600 : 280;
      return clamp(event.deltaY * scale, -limit, limit);
    }
    function input(delta) {
      if (state.inspectedPhotoId) return;
      if (!state.active && delta <= 0) return;
      if (!activate()) return;
      if (state.phase === 'gathering') cancelJump();
      if (state.phase === 'gathering') applyGather(state.gatherProgress + delta / 1600);
      else {
        if (state.readingProgress < 0.00001 && turn.getState().target < 0.00001 && delta < 0) {
          // 首跨页之后继续上滚，原路收书回桌；不倒放快门、不重新抽片。
          cancelJump();
          state.phase = 'gathering';
          document.getElementById('capture-layer').inert = false;
          emit();
          applyGather(1 + delta / 1600);
        } else {
          turn.input(delta / 600);
        }
      }
    }
    on(
      window,
      'wheel',
      (event) => {
        if (event.ctrlKey) return;
        if (dialog.open) {
          event.preventDefault();
          return;
        }
        const capture = ctx.capture()?.getState();
        if (!capture?.settled || capture.inspectedPhotoId) return;
        event.preventDefault();
        input(wheelDelta(event));
      },
      { passive: false }
    );
    on(
      host,
      'touchstart',
      (event) => {
        touchY = event.touches[0]?.clientY ?? null;
      },
      { passive: true }
    );
    on(
      host,
      'touchmove',
      (event) => {
        const y = event.touches[0]?.clientY;
        if (y === undefined || touchY === null || dialog.open || !ctx.capture()?.getState().settled) return;
        if (ctx.capture().getState().inspectedPhotoId) return;
        event.preventDefault();
        const rate = state.phase === 'reading' ? 1.6 : 2;
        input(clamp((touchY - y) * rate, -280, 280));
        touchY = y;
      },
      { passive: false }
    );

    function animateTo(target, complete) {
      cancelJump();
      turn.riffle(target, complete);
    }
    function goToSpread(id) {
      if (state.phase !== 'reading' || dialog.open) return false;
      const target = spreads.findIndex((spread) => spread.id === id);
      if (target < 0) return false;
      animateTo(target);
      return true;
    }
    function returnToDesk() {
      if (!state.active || dialog.open) return;
      const close = () => {
        cancelJump();
        state.readingProgress = openingIndex;
        drawReading();
        state.phase = 'gathering';
        document.getElementById('capture-layer').inert = false;
        emit();
        animation = gsap.to(state, {
          gatherProgress: 0,
          duration: reduced.matches ? 0.001 : 1 / 1.4,
          ease: 'none',
          onUpdate: () => applyGather(state.gatherProgress),
          onComplete() {
            animation = null;
            document
              .querySelector('.capture-paper[data-paper-role="new-print"]')
              ?.focus({ preventScroll: true });
          },
        });
      };
      if (Math.abs(state.readingProgress - openingIndex) > 0.02 && state.phase === 'reading')
        animateTo(openingIndex, close);
      else close();
    }
    function closeInspection() {
      if (!dialog.open) return;
      const id = state.inspectedPhotoId;
      dialog.close();
      state.inspectedPhotoId = null;
      ctx.audio?.play('close');
      const liveFocus = [...layer.querySelectorAll('[data-open-photo]')].find(
        (button) => button.dataset.openPhoto === id && button.closest('.folio-page')
      );
      (liveFocus || returnFocus || layer.querySelector('[data-spread-id]'))?.focus({ preventScroll: true });
    }
    on(layer, 'click', (event) => {
      const chapter = event.target.closest('.folio-chapter-tab');
      if (chapter) {
        goToSpread(chapter.dataset.spreadId);
        return;
      }
      const target = event.target.closest('[data-open-photo]');
      if (!target || (state.turnProgress > 0 && state.turnProgress < 1) || state.phase !== 'reading') return;
      const photo = content.findPhoto(target.dataset.openPhoto);
      if (!photo) return;
      cancelJump();
      returnFocus = target;
      state.inspectedPhotoId = photo.id || photo.photoId;
      image.src = photo.fullSrc;
      image.alt = photo.title;
      image.width = photo.width;
      image.height = photo.height;
      dialog.querySelector('figcaption').textContent = photo.title + ' · 魏子奇摄影';
      dialog.querySelector('.folio-image-error').hidden = true;
      dialog.showModal();
      ctx.audio?.play('inspect');
    });
    on(image, 'error', () => {
      dialog.querySelector('.folio-image-error').hidden = false;
    });
    on(image, 'load', () => {
      dialog.querySelector('.folio-image-error').hidden = true;
    });
    on(dialog.querySelector('[data-retry-image]'), 'click', () => {
      image.src = image.src.split('?')[0] + `?retry=${Date.now()}`;
    });
    on(dialog.querySelector('[data-close-inspection]'), 'click', closeInspection);
    on(dialog, 'click', (event) => {
      if (event.target === dialog) closeInspection();
    });
    on(dialog, 'cancel', (event) => {
      event.preventDefault();
      closeInspection();
    });
    on(frame.querySelector('.folio-return'), 'click', returnToDesk);
    on(prev, 'click', () => turn.step(-1));
    on(next, 'click', () => turn.step(1));
    on(
      document,
      'keydown',
      (event) => {
        if (dialog.open) return;
        if (!state.active) {
          const forward =
            ['ArrowDown', 'PageDown'].includes(event.key) ||
            (event.key === ' ' && !event.target.closest('button'));
          const capture = ctx.capture()?.getState();
          if (forward && capture?.settled && !capture.inspectedPhotoId) {
            event.preventDefault();
            input(180);
          }
          return;
        }
        if (event.key === 'Escape') {
          event.preventDefault();
          event.stopImmediatePropagation();
          returnToDesk();
        } else if (
          state.phase === 'reading' &&
          ['ArrowRight', 'PageDown', 'ArrowLeft', 'PageUp', ' '].includes(event.key)
        ) {
          event.preventDefault();
          turn.step(['ArrowLeft', 'PageUp'].includes(event.key) ? -1 : 1);
        } else if (['ArrowDown', 'PageDown', 'ArrowUp', 'PageUp', ' '].includes(event.key)) {
          if (event.target.closest('button')) return;
          event.preventDefault();
          input(['ArrowUp', 'PageUp'].includes(event.key) ? -180 : 180);
        }
      },
      { capture: true }
    );
    function reset() {
      if (signal.aborted) return;
      cancelJump();
      if (dialog.open) dialog.close();
      gsap.killTweensOf(progressFill);
      state.active = false;
      state.phase = 'desk';
      state.gatherProgress = 0;
      state.readingProgress = openingIndex;
      state.inspectedPhotoId = null;
      state.turnProgress = 0;
      layer.hidden = true;
      layer.inert = true;
      gather?.timeline.progress(0, true);
      Object.values(destinations).forEach((destination) => restorePhoto(destination, true));
      gather?.destroy();
      gather = null;
      destinations = {};
      sources = [];
      frame.hidden = true;
      layer.dataset.gatherProgress = '0';
      handRig.hidden = true;
      hand.hidden = true;
      handShadow.hidden = true;
      lastGather = 0;
      reversing = false;
      ctx.capture()?.setGatherProgress(0);
      emit();
    }
    on(reduced, 'change', () => {
      if (state.active && state.phase === 'reading') {
        cancelJump();
        state.readingProgress = Math.round(state.readingProgress);
        drawReading();
      }
    });
    const api = {
      getState: () => ({
        ...state,
        photoIds: [
          ...new Set(
            spreads.flatMap((spread) => [spread.left, spread.right].flatMap((page) => page.photoIds))
          ),
        ],
        pageCount: spreads.length * 2,
        handLoaded: hand.complete && hand.naturalWidth > 0,
        handContact: !hand.hidden && hand.dataset.contact === 'true',
        textureCount: turn.getState().textureCount,
        renderer: turn.getState().renderer,
      }),
      goToSpread,
      returnToDesk,
      refreshLayout,
      reset,
      preload: () => Promise.all([hand.decode(), shadowImage.decode(), turn.load()]),
    };
    dispose = () => {
      reset();
      turn.destroy();
      lifecycle.abort();
      gsap.killTweensOf(progressFill);
      layer.remove();
      dialog.remove();
      handRig.remove();
      frame.remove();
      pageCache.clear();
    };
    refreshLayout();
    return api;
  },
  unmount() {
    dispose?.();
    dispose = null;
  },
};
