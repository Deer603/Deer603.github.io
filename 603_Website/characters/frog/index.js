import intro from './scenes/intro.js';
import capture from './scenes/capture.js';
import desk from './scenes/desk.js';
import album from './scenes/album.js';
import { drawOpeningPhotoId } from './opening-photo.js';
import content from './content.js';
import { decodeImages } from './preload.js';

const stylesheet = document.createElement('link');
stylesheet.rel = 'stylesheet';
stylesheet.href = new URL('./frog.css', import.meta.url).href;
await new Promise((resolve, reject) => {
  stylesheet.onload = resolve;
  stylesheet.onerror = reject;
  document.head.append(stylesheet);
});
const editorial = document.createElement('link');
editorial.rel = 'stylesheet';
editorial.href = new URL('./album-editorial.css', import.meta.url).href;
await new Promise((resolve, reject) => {
  editorial.onload = resolve;
  editorial.onerror = reject;
  document.head.append(editorial);
});
const scenes = [intro, capture, desk, album];
const preloadIntro = () => decodeImages([
  new URL('./assets/portrait.webp', import.meta.url).href,
  new URL('./assets/dorm-silhouette-close-v5.webp', import.meta.url).href,
]);
const preloadCapture = () => decodeImages([
  ...content.photos.map(photo => photo.src),
  new URL('./assets/gobo.webp', import.meta.url).href,
]);
const preloadAlbum = () => preloadCapture().then(() => decodeImages([
  new URL('./assets/hand.webp', import.meta.url).href,
  ...content.spreads.flatMap(spread => [spread.left, spread.right].map(page =>
    new URL(`./assets/pages/${page.id}.webp`, import.meta.url).href
  )),
]));

let active;
function enter(shell) {
  if (active) return;
  const root = document.getElementById('experience');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const lifecycle = new AbortController();
  const signal = lifecycle.signal;
  const apis = new Map();
  let sceneIndex = 0;
  let ready = false;
  let revision = 0;
  const api = id => apis.get(id);
  const show = id => {
    sceneIndex = scenes.findIndex(scene => scene.id === id);
  };
  async function returnToProfile() {
    if (document.body.dataset.stage === 'capture-returning') return;
    const token = ++revision;
    ready = false;
    document.body.dataset.stage = 'capture-returning';
    api('desk').controls.inert = true;
    await api('capture').reverse();
    if (token !== revision) return;
    show('intro');
    ready = true;
    api('intro').returnTo();
  }
  async function next() {
    if (!ready || sceneIndex >= scenes.length - 1) return;
    sceneIndex++;
    const target = api(scenes[sceneIndex].id);
    if (!target.start) {
      target.enter?.();
      return;
    }
    drawOpeningPhotoId();
    ready = false;
    const token = ++revision;
    const introduction = api('intro');
    document.body.dataset.stage = 'capturing';
    introduction.profile.inert = true;
    introduction.shutter.disabled = introduction.camera.disabled = introduction.viewfinder.disabled = true;
    shell.ui.announce('快门按下，一张新相纸正在出片，背景转为已摆好其他照片的展示桌面。');
    try {
      await target.start();
    } catch (error) {
      if (token !== revision) return;
      returnToProfile();
      shell.ui.announce('相纸未能加载，请再次按下快门重试。');
      console.error('出片演出未完成：', error);
    }
  }
  const ctx = {
    ...shell,
    reducedMotion,
    next,
    readyIntro() {
      for (const scene of scenes.filter(scene => !['intro', 'album'].includes(scene.id))) {
        if (!apis.has(scene.id)) apis.set(scene.id, scene.mount(root, ctx));
      }
      ready = true;
    },
    returnToProfile,
    capture: () => api('capture'),
    album: () => api('album'),
    resetAlbum: () => api('album')?.reset(),
    preloadCapture,
    preloadAlbum() {
      void preloadAlbum().catch(() => {});
    },
    phase(detail) {
      if (detail.phase === 'settled') {
        ready = true;
        next();
      }
    },
    async readyDesk() {
      const token = revision;
      ready = false;
      api('desk').controls.inert = true;
      try {
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        if (signal.aborted || token !== revision) return;
        if (!api('album')) apis.set('album', album.mount(root, ctx));
        await api('album').preload();
        if (signal.aborted || token !== revision) return;
        document.body.dataset.stage = 'scatter';
        ready = true;
        api('desk').controls.inert = false;
        shell.ui.announce('新相纸已落到预先摆好四张作品的桌面。点击相纸完整查看作品。');
      } catch (error) {
        if (signal.aborted || token !== revision) return;
        void returnToProfile();
        console.error('出片演出未完成：', error);
      }
    },
    requestScene(id) {
      if (scenes[sceneIndex].id === id) return true;
      if (scenes[sceneIndex].id === 'desk') next();
      return scenes[sceneIndex].id === id;
    },
    albumPhase(state) {
      if (!['scatter', 'album'].includes(document.body.dataset.stage)) return;
      const reading = state.phase === 'reading';
      document.body.dataset.stage = reading ? 'album' : 'scatter';
      show(state.active ? 'album' : 'desk');
    },
  };
  apis.set('intro', intro.mount(root, ctx));
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || api('album')?.getState().active) return;
    if (document.body.dataset.stage === 'capture-returning') return;
    if (['capturing', 'scatter'].includes(document.body.dataset.stage)) {
      if (!api('capture').getState().inspectedPhotoId) returnToProfile();
    } else {
      shell.backToDorm();
    }
  }, { signal });
  active = {
    lifecycle,
    clear() {
      revision++;
    },
  };
  api(scenes[sceneIndex].id).enter();
}
function exit() {
  if (!active) return;
  active.clear();
  active.lifecycle.abort();
  for (const scene of [...scenes].reverse()) scene.unmount();
  active = null;
}
export default {
  id: 'frog',
  preloadIntro,
  preloadCapture,
  preloadAlbum,
  enter,
  exit,
};
