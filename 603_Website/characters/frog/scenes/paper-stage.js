import '../../../vendor/gsap.min.js';

const mountedStages = new WeakMap();

export function mountPaperStage(host, reduced) {
  const mounted = mountedStages.get(host);
  if (mounted) return mounted;

  const scene = document.createElement('div');
  scene.className = 'paper-stage capture-desk';
  scene.setAttribute('aria-hidden', 'true');

  const board = document.createElement('div');
  board.className = 'paper-board';
  const viewport = document.createElement('div');
  viewport.className = 'paper-viewport';
  viewport.append(board);

  const gobo = new Image();
  gobo.className = 'paper-gobo';
  gobo.src = new URL('../assets/gobo.webp', import.meta.url).href;
  gobo.alt = '';
  gobo.draggable = false;
  gobo.hidden = true;
  gobo.setAttribute('aria-hidden', 'true');
  host.append(scene, viewport, gobo);

  let fit;
  function refreshLayout() {
    const rect = host.getBoundingClientRect();
    const width = rect.width || innerWidth;
    const height = rect.height || innerHeight;
    const scale = Math.min(width / 1440, height / 900);
    fit = {
      width,
      height,
      scale,
      left: (width - 1440 * scale) / 2,
      top: (height - 900 * scale) / 2,
    };
    board.style.transform = `translate(${fit.left}px,${fit.top}px) scale(${scale})`;
    return fit;
  }
  refreshLayout();

  // 树影单程漂移 12 秒，往返合计 24 秒。
  const drift = window.gsap.to(gobo, {
    x: 14,
    duration: 12,
    ease: 'sine.inOut',
    yoyo: true,
    repeat: -1,
    paused: true,
  });
  let active = false;
  let disposed = false;

  function updateMotion() {
    if (active && !reduced.matches) drift.play();
    else drift.pause(0);
  }

  function start() {
    if (disposed) return;
    active = true;
    scene.hidden = false;
    gobo.hidden = false;
    updateMotion();
  }

  function stop() {
    active = false;
    scene.hidden = true;
    gobo.hidden = true;
    drift.pause(0);
  }

  function dispose() {
    if (disposed) return;
    disposed = true;
    stop();
    reduced.removeEventListener('change', updateMotion);
    drift.kill();
    scene.remove();
    viewport.remove();
    gobo.remove();
    mountedStages.delete(host);
  }

  reduced.addEventListener('change', updateMotion);
  const api = {
    scene,
    board,
    gobo,
    start,
    stop,
    dispose,
    refreshLayout,
    get fit() {
      return fit;
    },
  };
  mountedStages.set(host, api);
  stop();
  return api;
}
