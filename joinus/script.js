'use strict';
const words = {
  person: ['人物', '“人物”是鹿群对具有辨识度的成员或行为的一种非正式评价，具体含义取决于交流语境。', '传播视角：关注具体经历，呈现个体特色。'],
  meaning: ['何意味', '“何意味”常用于表达疑问、惊讶或对前文的回应。理解其含义，需要结合对话对象与上下文。', '传播视角：补充必要背景，降低理解门槛。'],
  steady: ['稳了', '“稳了”常用于对方案或进展表达积极判断，也具有确认与收束话题的作用。', '传播视角：区分积极预期与已经确认的结果。']
};
const tabs = [...document.querySelectorAll('[data-word]')];
function selectWord(tab) {
  tabs.forEach(item => { item.setAttribute('aria-selected', String(item === tab)); item.tabIndex = item === tab ? 0 : -1; });
  const entry = words[tab.dataset.word];
  document.getElementById('word-title').textContent = entry[0];
  document.getElementById('word-description').textContent = entry[1];
  document.getElementById('word-aside').textContent = entry[2];
  document.querySelector('.word-label').textContent = `鹿群用语/0${tabs.indexOf(tab) + 1}`;
  document.getElementById('word-panel').setAttribute('aria-labelledby', tab.id);
}
tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectWord(tab));
  tab.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length - 1;
    if (next !== undefined) { event.preventDefault(); selectWord(tabs[next]); tabs[next].focus(); }
  });
});
const form = document.getElementById('application-form');
const dialog = document.getElementById('mail-dialog');
const preview = document.getElementById('mail-preview');
const status = document.getElementById('mail-status');
let subject = '';
function updateMail() {
  document.getElementById('send-mail').href = `mailto:jijimaomao603@163.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(preview.value)}`;
}
form.addEventListener('submit', event => {
  event.preventDefault();
  const data = new FormData(form);
  const name = data.get('name').trim();
  const intro = data.get('intro').trim();
  if (!name || intro.length < 10) {
    const field = !name ? form.elements.name : form.elements.intro;
    field.setCustomValidity(!name ? '请填写姓名或常用称呼。' : '请填写至少10个字的个人介绍与申请说明。');
    field.reportValidity();
    return;
  }
  subject = `应聘鹿文化传播大使｜${name}`;
  preview.value = `Deer603招聘团队：\n您好！\n\n现申请鹿文化传播大使职位，个人信息如下。\n\n姓名或称呼：${name}\n联系邮箱：${data.get('email').trim()}\n申请方向：${data.get('direction')}\n\n个人介绍与申请说明：\n${intro}\n\n作品集或项目链接：${data.get('work').trim() || '暂未提供'}\n\n期待就岗位要求与合作安排进一步沟通。感谢审阅。`;
  updateMail();
  status.textContent = '打开邮件应用后，请确认内容并自行发送。若未唤起应用，可复制正文发送至上述邮箱。';
  dialog.showModal();
});
form.addEventListener('input', event => event.target.setCustomValidity?.(''));
preview.addEventListener('input', updateMail);
document.getElementById('close-dialog').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { if (event.target === dialog) { const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close(); } });
document.getElementById('copy-mail').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(preview.value); status.textContent = '正文已复制。请粘贴到邮件中，发送至jijimaomao603@163.com。'; }
  catch { preview.focus(); preview.select(); status.textContent = '未能自动复制，正文已选中。请使用系统复制操作。'; }
});
