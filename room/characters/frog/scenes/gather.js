import '../../../vendor/gsap.min.js';
import { clamp, mix } from '../content.js';

const MAX = 1.65;
const POL_W = 230;
const POL_PAD = 14;
const POL_CAP = 48;
const POL_ASPECT = 1279 / 1706;

export function createGatherTimeline({
  book,
  cover,
  handRig,
  hand,
  handShadow,
  frame,
  captureHeading,
  captureHint,
  sources,
  destinations,
}) {
  const { gsap } = window;
  const palm = { x: 672, y: 640 };
  const pivot = { x: 1145, y: 1132 };
  const motion = {
    reach: 0,
    release: 0,
    pressDown: 0,
    pressUp: 0,
    opening: 0,
    cover: 0,
    fade: 0,
    hint: 1,
    frame: 0,
    decorations: 0,
    shadowLift: 0,
  };
  const cards = [...sources].sort((a, b) => a.stackIndex - b.stackIndex);
  const spreadCards = cards.filter((source) => source.onSpread);
  const poses = cards.map((source) => ({ source, gather: 0, flight: 0, tuck: 0 }));
  const decorations = [...book.querySelectorAll('.folio-page .tape, .folio-page .corners')];
  const hintTransition = captureHint.style.transition;
  const headingTransition = captureHeading.style.transition;
  const bookOrigin = {
    x: book.offsetLeft + book.offsetWidth / 2,
    y: book.offsetTop + book.offsetHeight / 2,
  };
  handRig.style.transformOrigin = `${pivot.x}px ${pivot.y}px`;
  hand.style.width = handShadow.style.width = `${hand.naturalWidth}px`;
  handRig.dataset.contactGeometry = JSON.stringify({ palm, pivot, scale: 0.513, rotation: [28.5, 66.5] });

  // GSAP 驱动各段进度，同一条时间线支持暂停和倒放。
  const timeline = gsap.timeline({ paused: true });
  timeline.to(motion, { hint: 0, duration: 0.14, ease: 'none' }, 0.02);
  timeline.to(motion, { reach: 1, duration: 0.52, ease: 'none' }, 0);
  timeline.to(motion, { pressDown: 1, duration: 0.06, ease: 'none' }, 0.5);
  timeline.to(motion, { pressUp: 1, duration: 0.06, ease: 'none' }, 0.66);
  timeline.to(motion, { release: 1, duration: 0.52, ease: 'none' }, 0.68);
  timeline.to(motion, { fade: 1, duration: 0.3, ease: 'none' }, 0.34);
  timeline.to(motion, { opening: 1, duration: 1.05, ease: 'power1.inOut' }, 0.35);
  timeline.to(motion, { cover: 1, duration: 0.6, ease: 'power1.inOut' }, 0.55);
  timeline.to(motion, { shadowLift: 1, duration: 0.74, ease: 'none' }, 0.86);
  timeline.to(motion, { decorations: 1, frame: 1, duration: 0.12, ease: 'none' }, 1.5);
  poses.forEach((pose) => {
    const { source } = pose;
    timeline.to(pose, { gather: 1, duration: 0.48, ease: 'power1.inOut' }, 0.08 + source.stackIndex * 0.03);
    if (source.onSpread) {
      const j = spreadCards.indexOf(source);
      const start = 0.86 + (j * 0.22) / Math.max(1, spreadCards.length - 1);
      const destination = destinations[source.id];
      destination.flightStart = start / MAX;
      destination.flightEnd = (start + 0.5) / MAX;
      timeline.to(pose, { flight: 1, duration: 0.5, ease: 'power1.inOut' }, start);
    } else {
      timeline.to(pose, { tuck: 1, duration: 0.35, ease: 'power1.inOut' }, 0.6);
    }
  });
  timeline.set(motion, {}, MAX);

  // 同步相纸位置、大小、旋转和外观。
  function cardStyle(c, x, y, r, w, pad, cap, form) {
    const iw = w - 2 * pad;
    const ih = mix(iw / POL_ASPECT, iw / c.aspect, form);
    // 冲印上下各留 7px 白边，落定前逐步补齐下白边。
    const bottomPadding = pad * form;
    const h = ih + pad + cap + bottomPadding;
    c.node.style.width = `${w}px`;
    c.node.style.height = `${h}px`;
    c.node.style.padding = `${pad}px ${pad}px ${bottomPadding}px`;
    c.node.style.transformOrigin = '50% 50%';
    c.image.style.height = `${ih}px`;
    c.caption.style.height = `${cap}px`;
    c.caption.style.opacity = String(Math.max(0, 1 - form * 2));
    c.caption.style.fontSize = `${(12 * w) / POL_W}px`;
    c.node.style.transform =
      `translate3d(${(x - w / 2).toFixed(2)}px,${(y - h / 2).toFixed(2)}px,0) ` +
      `rotate(${r.toFixed(2)}deg)`;
    c.node.style.opacity = '1';
  }

  function render() {
    if (timeline.time() > 0) {
      captureHint.style.transition = 'none';
      captureHeading.style.transition = 'none';
    }
    const press = motion.pressDown - motion.pressUp;
    const px = mix(mix(1640, 600, motion.reach), 1700, motion.release);
    const py = mix(mix(1600, 863, motion.reach), 1500, motion.release);
    const rotation = mix(28.5, 66.5, motion.reach);
    const scale = 0.513 * mix(1.06, 1, press);
    handRig.style.transform =
      `translate3d(${(px - pivot.x).toFixed(2)}px,${(py - pivot.y).toFixed(2)}px,0) ` +
      `rotate(${rotation.toFixed(2)}deg) scale(${scale.toFixed(4)})`;
    handShadow.style.transform = `translate(${mix(95, 26, press)}px,${mix(140, 36, press)}px)`;
    handShadow.style.opacity = String(mix(0.14, 0.28, press));
    handRig.dataset.contact = String(press > 0);
    book.style.opacity = String(motion.fade);
    book.style.transform =
      `translate3d(${mix(-212, 0, motion.cover)}px,${mix(120, 0, motion.opening)}px,0) ` +
      `rotate(${mix(-9, 0, motion.opening)}deg) scale(${mix(0.7, 1, motion.opening)})`;
    book.style.setProperty('--page-reveal', motion.cover > 0.995 ? '1' : '0');
    book.style.setProperty('--left-cover-reveal', motion.cover > 0.5 ? '1' : '0');
    book.style.setProperty('--cover-clip', motion.cover > 0.5 ? 'none' : 'inset(0 0 0 50%)');
    cover.style.transform = `rotateY(${-180 * motion.cover}deg)`;
    cover.hidden = motion.cover > 0.995;
    captureHint.style.opacity = String(motion.hint);
    captureHeading.style.opacity = String(1 - motion.frame);
    frame.style.opacity = String(motion.frame);
    // 首张落定时书仍在升起：将已量出的终点映射到书的当前变换，衔接真实书页。
    const bookMatrix = new DOMMatrix(book.style.transform);
    const bookScale = mix(0.7, 1, motion.opening);
    const bookRotation = mix(-9, 0, motion.opening);

    poses.forEach(({ source, gather, flight, tuck }) => {
      const destination = destinations[source.id];
      if (destination?.attached) return;
      const i = source.stackIndex;
      const gx = 720 + (i - (cards.length - 1) / 2) * 4;
      const gy = 440 - i * 2.5;
      const gr = [-5, 4, -2, 6, -3][i % 5] * (source.isFocus ? 0.3 : 1);
      let x = mix(source.desk.x, gx, gather);
      let y = mix(source.desk.y, gy, gather) - 34 * Math.sin(gather * Math.PI);
      let rotation = mix(source.desk.angle, gr, gather);
      let width = mix(POL_W, POL_W * 0.72, gather);
      let padding = POL_PAD * mix(1, 0.72, gather);
      let caption = POL_CAP * mix(1, 0.72, gather);
      let form = 0;
      if (source.onSpread) {
        const target = bookMatrix.transformPoint({
          x: destination.center.x - bookOrigin.x,
          y: destination.center.y - bookOrigin.y,
        });
        x = mix(x, target.x + bookOrigin.x, flight);
        y = mix(y, target.y + bookOrigin.y, flight) - 46 * Math.sin(flight * Math.PI);
        rotation = mix(rotation, destination.rotation + bookRotation, flight);
        width = mix(width, destination.width * bookScale, flight);
        padding = mix(padding, destination.padding * bookScale, flight);
        caption = mix(caption, 0, flight);
        form = flight;
      } else {
        x = mix(x, 870, tuck);
        y = mix(y, 480, tuck);
        rotation = mix(rotation, -2, tuck);
        width = mix(width, POL_W * 0.5, tuck);
        padding = mix(padding, POL_PAD * 0.5, tuck);
        caption = mix(caption, POL_CAP * 0.5, tuck);
      }
      cardStyle(source, x, y, rotation, width, padding, caption, form);
      const lift = Math.sin(motion.shadowLift * Math.PI);
      source.node.style.boxShadow = `${mix(2, 7, lift)}px ${mix(5, 18, lift)}px ${mix(10, 22, lift)}px #2a2b1f33`;
    });
    decorations.forEach((decoration, index) => {
      decoration.style.opacity = String(clamp(motion.decorations * 1.6 - index * 0.15));
    });
  }

  render();
  return {
    timeline,
    render,
    destroy() {
      timeline.kill();
      captureHint.style.transition = hintTransition;
      captureHeading.style.transition = headingTransition;
    },
  };
}
