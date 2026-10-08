export default [
  {
    id: 'frog',
    slot: 1,
    bedPosition: 0,
    load: () => import('./frog/index.js'),
    dorm: {
      idle: new URL('./frog/assets/idle.webp', import.meta.url).href,
      awake: new URL('./frog/assets/awake.webp', import.meta.url).href,
      introBounds: {
        left: 30 + 780 * 129 / 1254,
        top: 96 + 780 * 22 / 1254,
        right: 30 + 780 * 1181 / 1254,
      },
      text: {
        slot: '青蛙 · 入口左侧',
        idleAria: '青蛙正在休息，点击查看人物介绍',
        awakeAria: '青蛙醒了，点击查看人物介绍',
        marker: '<span class="character-marker" aria-hidden="true"><i></i><span>青蛙</span><b>+</b></span>',
      },
    },
  },
  {
    id: 'penguin',
    slot: 5,
    bedPosition: -1,
    locked: true,
    dorm: {
      background: new URL('./penguin/assets/penguin-close.webp', import.meta.url).href,
      idle: new URL('./penguin/assets/penguin-silhouette.webp', import.meta.url).href,
    },
  },
];
