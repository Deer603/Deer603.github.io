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
  const character = await preloadIntro();
  if (token !== revision) return;
  current = character;
  current.enter({ audio, ui, transition, backToDorm });
});
requestAnimationFrame(() => requestAnimationFrame(() => {
  void preloadIntro().then(async character => {
    await dorm.preloadLocked();
    await character.preloadAlbum();
  }).catch(() => {});
}));
