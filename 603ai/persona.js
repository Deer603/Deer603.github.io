(() => {
  'use strict';

  // Quotes are original passages from the app's bundled persona engines.
  // The PiaoAI and Tango passages are continuous excerpts, without new replies.
  const personas = {
    kunkun: {
      name: '困困',
      avatar: 'assets/kunkun.png?v=20261012-1',
      tag: '认知·成长·长期主义',
      description: '从认知、成长和长期主义出发，陪你换个角度看待眼前的问题。',
      question: '总和别人比较，该怎么办？',
      quote: '焦虑大多来自拿别人的结果，丈量自己的过程。每个人的时区不同，专注自己的刻度就好。',
    },
    piaoai: {
      name: '朴AI',
      avatar: 'assets/piaoai.png?v=20261012-1',
      tag: '装机·摇滚·夜宵',
      description: '卷毛企鹅，聊装机、音乐与深夜里的灵感，带着桌公园的热闹和直率。',
      question: '装机配置该怎么选？',
      quote: 'CPU、显卡、内存、电源，哪个不能缩、哪个不能省，一眼就能看出来。你配置单发来，本朴给你朴一朴。',
    },
    guigui: {
      name: '龟龟',
      avatar: 'assets/guigui.png?v=20261012-1',
      tag: '养龟·硬件·团队',
      description: '爱笑的黄喉小青龟，既关心电路与机器人，也记得照顾一起忙碌的伙伴。',
      question: '当队长最重要的是什么？',
      quote: '当RM队长不是会修车就行，还得会哄人、会排期、会在凌晨三点给大家点烧烤。队伍能走多远，技术和人心各占一半。',
    },
    tango: {
      name: '探戈',
      avatar: 'assets/tango.png?v=20261012-1',
      tag: 'Linux·C语言·魂系游戏',
      description: '圆滚滚的黄色狗熊，熟悉Linux与C语言，聊完代码总想再聊聊吃什么。',
      question: '学编程应该从哪里开始？',
      quote: '编程的本质是解决问题。语言只是工具，算法才是内功。别纠结学哪门语言——先学数据结构和算法，再选一门深入。',
    },
  };

  function initialize() {
    const selectors = Array.from(document.querySelectorAll('button[data-persona]'));
    const avatar = document.getElementById('demo-avatar');
    const screen = document.getElementById('demo-screen');

    function setText(id, text) {
      const element = document.getElementById(id);
      if (element) element.textContent = text;
    }

    function selectPersona(id) {
      const persona = personas[id];
      if (!persona) return;

      selectors.forEach((button) => {
        button.setAttribute('aria-pressed', String(button.dataset.persona === id));
      });

      if (avatar) {
        avatar.src = persona.avatar;
        avatar.alt = `${persona.name}头像`;
      }
      if (screen) screen.dataset.persona = id;

      setText('demo-name', persona.name);
      setText('demo-tag', persona.tag);
      setText('demo-question', persona.question);
      setText('demo-quote', persona.quote);
      setText('persona-name', persona.name);
      setText('persona-description', persona.description);
      setText('persona-quote', persona.quote);
    }

    selectors.forEach((button) => {
      button.addEventListener('click', () => selectPersona(button.dataset.persona));
    });

    selectPersona('kunkun');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize, { once: true });
  } else {
    initialize();
  }
})();
