export const shellText = {
  audioStorageKey: 'frog-audio-muted',
  title: '青蛙的角落',
  experienceAria: '青蛙的角落',
  lockedMark: '?',
  lockedLabel: '当前未解锁',
  lockedNumber: number => `ROOMMATE 0${number} / 06`,
  returnAnnouncement: '回到寝室。移到青蛙身上叫醒他，点击进入介绍。',
  header: `<a class="brand" href="#" id="brand" aria-label="返回寝室">
    <span class="brand-dot" aria-hidden="true"></span><span>青蛙的角落</span>
  </a>`,
  footer: `<div class="interaction-hint" id="interaction-hint">
    <span class="mouse-icon" aria-hidden="true"></span>
    <span>移到青蛙身上，叫醒他<span class="hint-separator">·</span>点击进入他的世界</span>
  </div>`,
  controls: `<button class="arrow" id="prev" data-view="prev" type="button"
      aria-label="上一个床位" disabled><i aria-hidden="true"></i></button>
    <button class="arrow" id="next" data-view="next" type="button"
      aria-label="下一个床位" disabled hidden><i aria-hidden="true"></i></button>`,
};

export function createUI(backToDorm) {
  const root = document.getElementById('experience');
  const header = root.querySelector('.site-header');
  header.innerHTML = shellText.header;
  root.querySelector('.scene-footer').innerHTML = shellText.footer;
  const controls = root.querySelector('.room-view-controls');
  controls.innerHTML = shellText.controls;
  document.title = shellText.title;
  root.setAttribute('aria-label', shellText.experienceAria);
  root.querySelector('#brand').addEventListener('click', backToDorm);
  const status = root.querySelector('#status');
  const previous = controls.querySelector('#prev');
  const next = controls.querySelector('#next');
  const bedButtons = [previous, next];
  const hint = root.querySelector('.interaction-hint');
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'audio-toggle';
  button.id = 'audio-toggle';
  button.innerHTML = '<svg viewBox="0 0 20 20" aria-hidden="true">'
    + '<path d="M3 8h3l4-3v10l-4-3H3z"/>'
    + '<path class="audio-waves" d="M13 7a4 4 0 0 1 0 6m2-8a7 7 0 0 1 0 10"/>'
    + '<path class="audio-cross" d="m13 7 5 6m0-6-5 6"/></svg>';
  document.body.append(button);
  return {
    announce(value) {
      status.textContent = value;
    },
    back(markup, action) {
      const node = document.createElement('button');
      node.type = 'button';
      node.className = 'back-button';
      node.id = 'back';
      node.innerHTML = markup;
      node.addEventListener('click', action);
      header.append(node);
      return node;
    },
    onView(action) {
      bedButtons.forEach(node => node.addEventListener('click', () => action(node.dataset.view)));
    },
    bedState(state) {
      previous.hidden = !state.previous;
      next.hidden = !state.next;
      bedButtons.forEach(node => node.disabled = state.ready === false);
      hint.hidden = !state.home;
    },
    audioState(state) {
      button.dataset.muted = String(state.muted);
      button.dataset.audioState = state.contextState || 'locked';
      button.dataset.printerRunning = String(state.printerRunning);
      button.dataset.lastSound = state.lastPlayed || '';
      button.setAttribute('aria-pressed', String(state.muted));
      button.title = state.muted ? '开启音效' : '静音音效';
      button.setAttribute('aria-label', button.title);
      button.hidden = !state.supported;
    },
    onAudio(action) {
      button.addEventListener('click', action);
    },
  };
}
