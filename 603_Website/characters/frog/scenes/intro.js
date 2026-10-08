import '../../../vendor/gsap.min.js';

let mounted;

function mount(root, ctx) {
  if (mounted) return mounted.api;
  const assets = new URL('../assets/', import.meta.url).href;
  const template = document.createElement('template');
  template.innerHTML = `
    <section class="profile-scene" id="profile" aria-labelledby="profile-name" inert>
      <div class="profile-dorm-stage">
        <div class="profile-background" aria-hidden="true">
          <div class="profile-room">
            <div class="intro-wall"></div>
            <div class="intro-door"><div class="intro-glass"></div><div class="intro-glass2"></div></div>
            <div class="intro-spill"></div>
            <img class="room-silhouette" src="${assets}dorm-silhouette-close-v5.webp" alt="" draggable="false">
            <div class="intro-beams">
              <i style="left:-40px;top:640px;width:1500px;height:70px;transform:rotate(9deg)"></i>
              <i style="left:-40px;top:742px;width:1600px;height:46px;transform:rotate(7deg)"></i>
              <i style="left:-40px;top:820px;width:1600px;height:30px;transform:rotate(5.5deg)"></i>
            </div>
          </div>
        </div>
        <div class="profile-portrait">
          <img src="${assets}portrait.webp" alt="" draggable="false">
          <div id="glint" class="camera-lens-glint" aria-hidden="true"><i></i></div>
          <button id="camera-shutter" class="camera-hotspot" aria-label="点击相机快门" type="button"
            tabindex="-1"></button>
        </div>
        <button class="profile-vf" aria-label="按下相机快门" type="button" tabindex="-1">
          <i></i><i></i><i></i><i></i>
        </button>
        <button id="shutter" class="shutter-button" type="button"><b>按下快门</b><small>SPACE</small></button>
      </div>
      <div class="profile-ui-stage">
        <div class="profile-copy">
          <p class="intro-quote">用镜头收集安静的瞬间。</p>
          <h1 class="intro-name" id="profile-name">魏子奇</h1>
          <div class="intro-tag"><span>青蛙</span><em>FROG · KEMA</em></div>
          <div class="intro-credits">
            <div><small>爱好</small><span>摄影</span></div>
            <div><small>求职意向</small><span>产品经理 / 原型设计</span></div>
          </div>
        </div>
        <div class="intro-index" aria-hidden="true"><b>01</b>ROOMMATE / 06</div>
      </div>
      <div class="intro-grain" aria-hidden="true"></div>
    </section>`;
  const profile = template.content.firstElementChild;
  root.append(profile);
  const portrait = profile.querySelector('.profile-portrait');
  const room = profile.querySelector('.profile-room');
  const uiStage = profile.querySelector('.profile-ui-stage');
  const shutter = profile.querySelector('#shutter');
  const camera = profile.querySelector('#camera-shutter');
  const viewfinder = profile.querySelector('.profile-vf');
  const lifecycle = new AbortController();
  const { signal } = lifecycle;
  const back = ctx.ui.back('← 返回寝室', ctx.backToDorm);
  back.classList.add('intro-back');

  // 悬停相机时播放镜片擦光。
  const glint = window.gsap.timeline({ paused: true })
    .fromTo(profile.querySelector('#glint i'), { x: 0, opacity: 0 }, {
      x: 110,
      opacity: 1,
      duration: 0.38,
      ease: 'power2.out',
    })
    .to(profile.querySelector('#glint i'), { opacity: 0, duration: 0.15 }, 0.25);

  function feedback() {
    if (document.body.dataset.stage === 'profile') glint.restart();
  }

  function shoot() {
    if (document.body.dataset.stage === 'profile') ctx.next();
  }

  for (const node of [camera, viewfinder]) node.addEventListener('pointerenter', feedback, { signal });
  shutter.addEventListener('focus', feedback, { signal });
  for (const node of [camera, viewfinder, shutter]) node.addEventListener('click', shoot, { signal });
  document.addEventListener('keydown', event => {
    if (event.code !== 'Space' || document.body.dataset.stage !== 'profile' || event.repeat) return;
    event.preventDefault();
    shoot();
  }, { signal });

  function refreshLayout() {
    const { width, height } = root.getBoundingClientRect();
    const scale = Math.min(width / 1440, height / 900);
    const left = (width - 1440 * scale) / 2;
    const top = (height - 900 * scale) / 2;
    uiStage.style.transform = `translate3d(${left}px, ${top}px, 0) scale(${scale})`;
    root.style.setProperty('--intro-ui-scale', scale);
    root.style.setProperty('--intro-ui-left', `${left}px`);
    root.style.setProperty('--intro-ui-top', `${top}px`);
  }

  const observer = new ResizeObserver(refreshLayout);
  observer.observe(root);
  refreshLayout();

  function addToTimeline(timeline) {
    timeline
      .fromTo(portrait, { y: 40 }, { y: 0, duration: 1.2, ease: 'expo.out' }, 0.25)
      .fromTo(profile.querySelector('.intro-name'), {
        opacity: 1,
        x: 50,
        clipPath: 'inset(0 100% 0 0)',
      }, {
        x: 0,
        clipPath: 'inset(0 0% 0 0)',
        duration: 0.6,
        ease: 'expo.out',
      }, 0.62)
      .fromTo([
        profile.querySelector('.intro-quote'),
        profile.querySelector('.intro-tag'),
        profile.querySelector('.intro-credits'),
      ], { opacity: 0, x: 40 }, {
        opacity: 1,
        x: 0,
        duration: 0.55,
        ease: 'expo.out',
        stagger: 0.06,
      }, 0.68)
      .fromTo(viewfinder, { opacity: 0, scale: 1.5 }, {
        opacity: 1,
        scale: 1,
        duration: 0.5,
        ease: 'expo.out',
      }, 0.6)
      .fromTo([shutter, back], { opacity: 0, x: 20 }, {
        opacity: 1,
        x: 0,
        duration: 0.45,
        ease: 'expo.out',
      }, 0.9);
  }

  function ready() {
    document.body.dataset.stage = 'profile';
    profile.inert = false;
    shutter.disabled = camera.disabled = viewfinder.disabled = false;
    ctx.readyIntro();
    ctx.ui.announce('魏子奇，青蛙。摄影与原型设计。点击相机或按下快门，观看一张新相纸飘落到已有照片的桌面。');
  }

  function enter() {
    profile.inert = true;
    shutter.disabled = camera.disabled = viewfinder.disabled = true;
    ctx.ui.announce('正在进入青蛙的人物介绍。');
    ctx.transition.enter({ profile, room, addToTimeline, reducedMotion: ctx.reducedMotion }, ready);
  }

  function returnTo() {
    ready();
    shutter.focus({ preventScroll: true });
    ctx.ui.announce('回到青蛙的人物介绍。可以再次按下快门。');
  }

  ctx.reducedMotion.addEventListener('change', () => {
    if (ctx.reducedMotion.matches && document.body.dataset.stage === 'entering') {
      ctx.transition.finish?.();
    }
  }, { signal });
  const api = { enter, returnTo, profile, room, portrait, shutter, camera, viewfinder, addToTimeline };
  mounted = { api, lifecycle, observer, glint, back };
  return api;
}

function unmount() {
  if (!mounted) return;
  mounted.lifecycle.abort();
  mounted.observer.disconnect();
  mounted.glint.kill();
  mounted.back.remove();
  mounted.api.profile.remove();
  mounted = null;
}

export default { id: 'intro', mount, unmount };
