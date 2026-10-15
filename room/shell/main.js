import registry from '../characters/registry.js';
import { createDorm } from './dorm.js';
import { createUI, shellText } from './ui.js';
import { createAudio } from './audio.js';
import { createTransition } from './transition.js';

const characters = registry;
const home = characters.find(entry => !entry.locked);
let current = null;
let dorm;
let revision = 0;
let introReady;

function preloadIntro() {
  if (!introReady) {
    introReady = home.load().then(async module => {
      await module.default.preloadIntro();
      return module.default;
    }).catch(error => {
      introReady = null;
      throw error;
    });
  }
  return introReady;
}

function finishReturn(event) {
  revision++;
  current?.exit?.();
  current = null;
  transition.cancel();
  audio.setPhase('idle');
  audio.stop();
  dorm?.return(event);
}

function backToDorm(event) {
  event?.preventDefault();
  if (current && transition.reverse(() => finishReturn(event))) return;
  finishReturn(event);
}

const ui = createUI(backToDorm);
const audio = createAudio(shellText.audioStorageKey, state => ui.audioState(state));
ui.audioState(audio.getState());
ui.onAudio(() => {
  audio.setMuted(!audio.getState().muted);
  audio.unlock();
});
const transition = createTransition();
dorm = await createDorm(characters, ui, async entry => {
  const token = ++revision;
  ui.announce('正在打开角色空间。');
  try {
    const character = await preloadIntro();
    if (token !== revision) return;
    current = character;
    current.enter({ audio, ui, transition, backToDorm });
  } catch (_) {
    if (token !== revision) return;
    dorm.return();
    ui.announce('角色素材暂未加载成功，请再次点击重试。');
  }
});
const characterButton = document.getElementById('character');
for (const event of ['pointerenter', 'focus']) {
  characterButton?.addEventListener(event, () => { void preloadIntro().catch(() => {}); }, { once: true });
}
requestAnimationFrame(() => requestAnimationFrame(() => {
  // 寝室只准备相邻床位；角色与摄影资源在交互时分阶段加载。
  void dorm.preloadLocked().catch(() => {});
}));
