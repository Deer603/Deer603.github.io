import '../vendor/gsap.min.js';

export function createTransition() {
  const root = document.getElementById('experience');
  const band = root.querySelector('.transition-cut');
  const oldRoom = root.querySelector('.room-layer');
  const hint = root.querySelector('.interaction-hint');
  const hints = [hint, ...root.querySelectorAll('.character-marker')];
  band.innerHTML = '<i class="glow"></i><i class="line"></i><i class="core"></i>'
    + '<i class="line"></i><i class="glow r"></i>';
  let timeline;
  let profile;
  let reducedMotion;

  function fit() {
    const scale = Math.min(innerWidth / 1440, innerHeight / 900);
    root.style.setProperty('--wipe-scale', scale);
    root.style.setProperty('--wipe-left', `${(innerWidth - 1440 * scale) / 2}px`);
    root.style.setProperty('--wipe-edge', `${innerHeight * 130 / 900}px`);
  }
  window.addEventListener('resize', fit);
  fit();

  function enter(options, complete) {
    timeline?.kill();
    profile = options.profile;
    reducedMotion = options.reducedMotion;
    const baseline = innerWidth <= 760 ? 1.06 : 1.13;
    root.style.setProperty('--x', '-520px');
    profile.classList.add('transition-world');
    document.body.dataset.stage = 'entering';
    timeline = window.gsap.timeline({
      paused: true,
      defaults: { lazy: false },
      onComplete: complete,
    });
    timeline.to(hints, { opacity: 0, duration: .12 }, 0)
      .to(root, { '--x': '2150px', duration: .85, ease: 'power2.inOut' }, .06)
      .fromTo(oldRoom, { scale: baseline }, {
        scale: baseline * 1.16 / 1.13,
        duration: 1.1,
        ease: 'power2.inOut',
      }, .05)
      .fromTo(options.room, { scale: 1.2 }, {
        scale: 1.17,
        duration: 1.3,
        ease: 'expo.out',
      }, .1);
    options.addToTimeline(timeline);
    if (reducedMotion.matches) timeline.progress(1);
    else timeline.timeScale(1).play(0);
  }

  function reverse(complete) {
    if (!timeline || !profile) return false;
    if (document.body.dataset.stage === 'returning') return true;
    profile.inert = true;
    document.body.dataset.stage = 'returning';
    timeline.eventCallback('onReverseComplete', complete);
    if (reducedMotion.matches) {
      timeline.pause(0);
      complete();
    } else {
      timeline.timeScale(1.4).reverse();
    }
    return true;
  }

  function cancel() {
    timeline?.kill();
    timeline = null;
    profile?.classList.remove('transition-world');
    profile = null;
    oldRoom.style.transform = '';
    hints.forEach(node => node.style.opacity = '');
    root.style.removeProperty('--x');
  }

  function finish() {
    if (!timeline) return;
    if (document.body.dataset.stage === 'returning') timeline.pause(0);
    else timeline.progress(1);
  }

  return { enter, reverse, cancel, finish };
}
