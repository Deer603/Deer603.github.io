
const HOME = 'https://kemakiko9566-design.github.io/photography-portfolio/';
const ABOUT = `${HOME}dist/about_me.html`;

// 作品标题、原始尺寸和章节归属；图注使用 title 或 shortTitle。
const originals = [
  { photoId: '01-xiangji-temple-poster', chapterId: 'temple', title: '香积寺 · Xiangji Temple', shortTitle: '香积寺', english: 'Xiangji Temple', width: 1279, height: 1706 },
  { photoId: '02-mahavira-hall', chapterId: 'temple', title: '大雄宝殿 · Mahavira Hall', shortTitle: '大雄宝殿', english: 'Mahavira Hall', width: 1279, height: 1706 },
  { photoId: '03-xiangji-entrance', chapterId: 'temple', title: '山门石狮', shortTitle: '山门石狮', english: '', width: 1279, height: 1706 },
  { photoId: '04-bamboo-grove', chapterId: 'temple', title: '竹径 · Bamboo Grove', shortTitle: '竹径', english: 'Bamboo Grove', width: 1279, height: 1706 },
  { photoId: '05-stone-lion', chapterId: 'temple', title: '石狮 · Stone Lion', shortTitle: '石狮', english: 'Stone Lion', width: 1279, height: 1706 },
  { photoId: '07-calligraphy-lions-dark', chapterId: 'double', title: '石狮与书法（暗调）', shortTitle: '石狮与书法 · 暗调', english: '', width: 1706, height: 1279 },
  { photoId: '08-calligraphy-lions-light', chapterId: 'double', title: '石狮与书法（亮调）', shortTitle: '石狮与书法 · 亮调', english: '', width: 1364, height: 1024 },
  { photoId: '09-orange-pavilion', chapterId: 'double', title: '楼阁与书法 · 双色', shortTitle: '楼阁与书法', english: '', width: 1280, height: 1920 },
  { photoId: '06-field-bw', chapterId: 'street', title: '旷野 · 黑白', shortTitle: '旷野', english: '', width: 1706, height: 1279 },
  { photoId: '12-coffee-shop', chapterId: 'street', title: '咖啡店 · 日常光影', shortTitle: '咖啡店', english: '', width: 1364, height: 1024 },
  { photoId: '10-houyi-statue', chapterId: 'sculpture', title: '塑 · 红蓝双色', shortTitle: '塑 · 红蓝双色', english: '', width: 1364, height: 1024 },
  { photoId: '11-red-sculptures', chapterId: 'sculpture', title: '展 · 红色雕塑', shortTitle: '展 · 红色雕塑', english: '', width: 1364, height: 1024 },
];

// 章节正文来自官网首页；color 用于桌面，tapeColor 用于章节侧签。
const chapters = [
  { id: 'temple', chapterId: 'temple', index: '01', title: '古建 · 香积寺', openingTitle: '古建\n香积寺', shortTitle: '古建', english: 'XIANGJI TEMPLE', color: '#5d6b48', tapeColor: 'rgba(150,164,118,.78)', tabTop: 70, entrySpreadId: 'temple-1', note: '西安 · 香积寺系列 —— 屋瓦、飞檐、匾额与石狮，在树影和光线里慢慢看它们。海报式排版是这个系列的一体两面。', source: `${HOME}#series-temple`, count: 5 },
  { id: 'double', chapterId: 'double', index: '02', title: '双重曝光 · 书法', shortTitle: '双重曝光', english: 'DOUBLE EXPOSURE', color: '#a56538', tapeColor: 'rgba(206,150,104,.78)', tabTop: 190, entrySpreadId: 'double-1', note: '让石狮和书法叠在一起，用色彩给熟悉的楼阁换一种情绪 —— 实验性的拍法。', source: `${HOME}#series-double`, count: 3 },
  { id: 'street', chapterId: 'street', index: '03', title: '人文 · 街拍', shortTitle: '人文', english: 'STREET & LIFE', color: '#686960', tapeColor: 'rgba(170,170,158,.78)', tabTop: 310, entrySpreadId: 'street-1', note: '旷野、咖啡馆 —— 取景框里的日常。', source: `${HOME}#series-street`, count: 2 },
  { id: 'sculpture', chapterId: 'sculpture', index: '04', title: '展览 · 雕塑', shortTitle: '展览', english: 'EXHIBITION', color: '#994d43', tapeColor: 'rgba(196,124,112,.78)', tabTop: 430, entrySpreadId: 'sculpture-1', note: '展厅里的红色，与被色彩重构的塑像。', source: `${HOME}#series-sculpture`, count: 2 },
];

// lines 控制正文换行，text 保持艺术家原文。
const quotes = {
  'about-poster-composition': { text: '你看到的几张学海报式构图，就是我拍摄与设计习惯的合流。', source: ABOUT },
  'about-temple-afternoons': { text: '像西安香积寺这个系列的那些下午。', source: ABOUT },
  'about-everyday-framing': { text: '街头、展厅、咖啡馆，都是取景框里的日常。', lines: ['街头、展厅、咖啡馆，', '都是取景框里的日常。'], source: ABOUT },
  'about-quiet-moments': { text: '我用镜头收集安静的瞬间。', source: ABOUT },
};

const paperText = {
  chapterCount: { text: '04' },
  signature: { text: '—— KEMA' },
  seal: { text: 'KE\nMA' },
  folios: Array.from({ length: 12 }, (_, index) => ({ text: String(index + 1).padStart(2, '0') })),
  plates: Array.from({ length: 12 }, (_, index) => ({ text: String(index + 1).padStart(2, '0') })),
};
const uiText = {
  returnToDesk: '← 返回桌面',
  bookTitle: { text: '光的存档' },
  author: { text: '魏子奇 · KEMA' },
};

// 相册线描图形与局部描边宽度。
const SK = {
  eave: { width: 130, height: 70, viewBox: '0 0 130 70', paths: [
    { d: 'M38 16 L92 16 M38 16 Q34 15 31 10 M92 16 Q96 15 99 10' },
    { d: 'M38 16 Q44 32 12 42 Q7 43 4 38 M92 16 Q86 32 118 42 Q123 43 126 38' },
    { d: 'M12 42 Q65 35 118 42' },
    { d: 'M48 20 L42 37 M58 20 L55 36 M65 20 L65 36 M72 20 L75 36 M82 20 L88 37', strokeWidth: 1 },
    { d: 'M42 42 L42 66 M88 42 L88 66 M38 48 L92 48' },
  ] },
  bamboo: { width: 90, height: 150, viewBox: '0 0 90 150', paths: [
    { d: 'M30 148 Q36 90 58 6' },
    { d: 'M33 112 L41 111 M42 68 L49 67 M52 30 L58 29', strokeWidth: 1 },
    { d: 'M41 111 Q62 104 84 112 Q62 118 41 111Z' },
    { d: 'M47 70 Q60 52 82 48 Q66 66 47 70Z' },
    { d: 'M38 92 Q18 84 4 90 Q20 98 38 92Z' },
    { d: 'M55 34 Q42 20 30 18 Q40 32 55 34Z' },
  ] },
  cup: { width: 90, height: 90, viewBox: '0 0 90 90', paths: [
    { d: 'M18 40 L22 74 Q24 80 32 80 L52 80 Q60 80 62 74 L66 40 Z' },
    { d: 'M65 48 Q78 48 77 58 Q76 67 63 66' },
    { d: 'M8 84 L80 84' },
    { d: 'M34 32 Q30 24 36 18 Q42 12 38 4 M48 32 Q44 25 49 19', strokeWidth: 1 },
  ] },
  plinth: { width: 90, height: 120, viewBox: '0 0 90 120', paths: [
    { d: 'M45 14 Q54 14 54 24 Q54 32 47 34 Q60 40 60 56 Q60 68 52 70 L38 70 Q30 68 30 56 Q30 40 43 34 Q36 32 36 24 Q36 14 45 14Z' },
    { d: 'M22 72 L68 72 L68 116 L22 116 Z' },
    { d: 'M68 72 L76 66 L76 110 L68 116', strokeWidth: 1 },
    { d: 'M22 72 L30 66 L76 66', strokeWidth: 1 },
  ] },
};

// x/y/w/rot 使用 590×760 单页坐标，元素按数组顺序叠放。
const spreads = [
  {
    id: 'temple-1', chapterId: 'temple',
    left: { id: 'p01', number: 1, layout: 'introduction', photoIds: [], chapterStart: true, elements: [
      { type: 'opener', x: 72, y: 96, right: 72, chapterId: 'temple', paragraph: false },
      { type: 'vertical-text', x: 372, y: 236, chapterId: 'temple', lines: ['西安 · 香积寺系列 ——', '屋瓦、飞檐、匾额与石狮，', '在树影和光线里慢慢看它们。', '海报式排版是这个系列的一体两面。'] },
      { type: 'sketch', name: 'eave', x: 80, y: 560 },
      { type: 'seal', x: 512, y: 606 },
      { type: 'folio', number: 1 },
    ] },
    right: { id: 'p02', number: 2, layout: 'hero', photoIds: ['01-xiangji-temple-poster'], composition: 'anchor', tilt: -1.4, elements: [
      { type: 'photo', photoId: '01-xiangji-temple-poster', x: 128, y: 70, w: 330, rot: -1.4 },
      { type: 'tape', x: 220, y: 52, w: 120, rot: -4 },
      { type: 'tape', x: 396, y: 486, w: 92, rot: 38 },
      { type: 'caption', photoId: '01-xiangji-temple-poster', x: 132, y: 532 },
      { type: 'note', x: 132, y: 588, w: 300, rot: -1.2, quoteId: 'about-poster-composition', signed: true },
      { type: 'folio', number: 2 },
    ] },
  },
  {
    id: 'temple-2', chapterId: 'temple',
    left: { id: 'p03', number: 3, layout: 'portrait', photoIds: ['02-mahavira-hall'], composition: 'high', tilt: 1, elements: [
      { type: 'photo', photoId: '02-mahavira-hall', x: 96, y: 74, w: 360, rot: 1 },
      { type: 'tape', x: 84, y: 62, w: 92, rot: -36 },
      { type: 'tape', x: 392, y: 58, w: 86, rot: 30 },
      { type: 'caption', photoId: '02-mahavira-hall', x: 100, y: 588 },
      { type: 'folio', number: 3 },
    ] },
    right: { id: 'p04', number: 4, layout: 'portrait', photoIds: ['03-xiangji-entrance'], composition: 'low', tilt: -2.2, elements: [
      { type: 'photo', photoId: '03-xiangji-entrance', x: 200, y: 190, w: 280, rot: -2.2 },
      { type: 'tape', x: 290, y: 172, w: 104, rot: -1 },
      { type: 'caption', photoId: '03-xiangji-entrance', x: 206, y: 588 },
      { type: 'folio', number: 4 },
    ] },
  },
  {
    id: 'temple-3', chapterId: 'temple',
    left: { id: 'p05', number: 5, layout: 'portrait', photoIds: ['04-bamboo-grove'], composition: 'air', tilt: -1.6, elements: [
      { type: 'photo', photoId: '04-bamboo-grove', x: 214, y: 92, w: 250, rot: -1.6 },
      { type: 'corners', x: 214, y: 92, w: 264, h: 347, rot: -1.6 },
      { type: 'caption', photoId: '04-bamboo-grove', x: 218, y: 446 },
      { type: 'sketch', name: 'bamboo', x: 96, y: 470 },
      { type: 'folio', number: 5 },
    ] },
    right: { id: 'p06', number: 6, layout: 'portrait', photoIds: ['05-stone-lion'], composition: 'anchor', tilt: 1.4, elements: [
      { type: 'photo', photoId: '05-stone-lion', x: 106, y: 84, w: 350, rot: 1.4 },
      { type: 'tape', x: 80, y: 96, w: 84, rot: -52 },
      { type: 'tape', x: 400, y: 520, w: 90, rot: -40 },
      { type: 'caption', photoId: '05-stone-lion', x: 110, y: 578 },
      { type: 'note', x: 110, y: 624, w: 330, rot: -1, quoteId: 'about-temple-afternoons', signed: true },
      { type: 'folio', number: 6 },
    ] },
  },
  {
    id: 'double-1', chapterId: 'double',
    left: { id: 'p07', number: 7, layout: 'pair', photoIds: ['07-calligraphy-lions-dark', '08-calligraphy-lions-light'], chapterStart: true, composition: 'compare', tilts: [1.2, -2], elements: [
      { type: 'header', x: 72, y: 78, right: 72, chapterId: 'double', paragraph: false },
      { type: 'photo', photoId: '07-calligraphy-lions-dark', x: 236, y: 196, w: 300, rot: 1.2 },
      { type: 'corners', x: 236, y: 196, w: 314, h: 239, rot: 1.2 },
      { type: 'caption', photoId: '07-calligraphy-lions-dark', x: 264, y: 447, titleField: 'shortTitle' },
      { type: 'photo', photoId: '08-calligraphy-lions-light', x: 84, y: 470, w: 270, rot: -2 },
      { type: 'tape', x: 70, y: 470, w: 80, rot: -40 },
      { type: 'caption', photoId: '08-calligraphy-lions-light', x: 90, y: 688, titleField: 'shortTitle' },
      { type: 'folio', number: 7 },
    ] },
    right: { id: 'p08', number: 8, layout: 'hero', photoIds: ['09-orange-pavilion'], composition: 'anchor', tilt: .8, elements: [
      { type: 'photo', photoId: '09-orange-pavilion', x: 96, y: 74, w: 290, rot: .8 },
      { type: 'tape', x: 196, y: 56, w: 110, rot: 2 },
      { type: 'caption', photoId: '09-orange-pavilion', x: 98, y: 530 },
      { type: 'vertical-text', x: 426, y: 96, chapterId: 'double', lines: ['让石狮和书法叠在一起，', '用色彩给熟悉的楼阁换一种情绪', '—— 实验性的拍法。'] },
      { type: 'folio', number: 8 },
    ] },
  },
  {
    id: 'street-1', chapterId: 'street',
    left: { id: 'p09', number: 9, layout: 'landscape', photoIds: ['06-field-bw'], chapterStart: true, composition: 'high', tilt: -1, elements: [
      { type: 'header', x: 72, y: 78, right: 72, chapterId: 'street', paragraph: false },
      { type: 'vertical-text', x: 470, y: 84, chapterId: 'street', lines: ['旷野、咖啡馆 ——', '取景框里的日常。'] },
      { type: 'photo', photoId: '06-field-bw', x: 104, y: 318, w: 400, rot: -1 },
      { type: 'tape', x: 250, y: 300, w: 110, rot: 1.5, color: 'rgba(170,170,158,.6)' },
      { type: 'caption', photoId: '06-field-bw', x: 108, y: 640 },
      { type: 'folio', number: 9 },
    ] },
    right: { id: 'p10', number: 10, layout: 'landscape', photoIds: ['12-coffee-shop'], composition: 'low', tilt: 1.6, elements: [
      { type: 'photo', photoId: '12-coffee-shop', x: 130, y: 140, w: 340, rot: 1.6 },
      { type: 'tape', x: 110, y: 150, w: 84, rot: -48 },
      { type: 'tape', x: 420, y: 370, w: 80, rot: -36 },
      { type: 'caption', photoId: '12-coffee-shop', x: 134, y: 420 },
      { type: 'note', x: 134, y: 474, w: 280, rot: -1.6, quoteId: 'about-everyday-framing', signed: true },
      { type: 'sketch', name: 'cup', x: 380, y: 600 },
      { type: 'folio', number: 10 },
    ] },
  },
  {
    id: 'sculpture-1', chapterId: 'sculpture',
    left: { id: 'p11', number: 11, layout: 'sculpture', photoIds: ['10-houyi-statue'], chapterStart: true, composition: 'high', tilt: 1.2, elements: [
      { type: 'header', x: 72, y: 78, right: 72, chapterId: 'sculpture', paragraph: false },
      { type: 'vertical-text', x: 470, y: 84, chapterId: 'sculpture', lines: ['展厅里的红色，', '与被色彩重构的塑像。'] },
      { type: 'photo', photoId: '10-houyi-statue', x: 100, y: 330, w: 380, rot: 1.2 },
      { type: 'tape', x: 210, y: 314, w: 110, rot: -2, color: 'rgba(196,124,112,.6)' },
      { type: 'caption', photoId: '10-houyi-statue', x: 104, y: 646 },
      { type: 'folio', number: 11 },
    ] },
    right: { id: 'p12', number: 12, layout: 'sculpture', photoIds: ['11-red-sculptures'], composition: 'low', tilt: -1.4, elements: [
      { type: 'photo', photoId: '11-red-sculptures', x: 90, y: 110, w: 400, rot: -1.4 },
      { type: 'corners', x: 90, y: 110, w: 414, h: 314, rot: -1.4 },
      { type: 'caption', photoId: '11-red-sculptures', x: 94, y: 442 },
      { type: 'sketch', name: 'plinth', x: 400, y: 470 },
      { type: 'note', x: 94, y: 600, w: 300, rot: -1.2, quoteId: 'about-quiet-moments', signed: true },
      { type: 'seal', x: 420, y: 640 },
      { type: 'folio', number: 12 },
    ] },
  },
];

const pages = spreads.flatMap(spread => [spread.left, spread.right].map(page => ({
  ...page,
  chapterId: spread.chapterId,
  spreadId: spread.id,
})));
const photos = originals.map((original, readingIndex) => {
  const page = pages.find(item => item.photoIds.includes(original.photoId));
  if (!page || page.chapterId !== original.chapterId) throw new Error(`相册照片编排无效：${original.photoId}`);
  const filename = `${original.photoId}.jpg`;
  const src = new URL(`./assets/display/${original.photoId}.webp`, import.meta.url).href;
  const fullSrc = new URL(`./assets/photos/${filename}`, import.meta.url).href;
  return {
    ...original,
    id: original.photoId,
    filename,
    src,
    fullSrc,
    url: src,
    source: `${HOME}dist/assets/photos/${filename}`,
    titleSource: findChapterSource(original.chapterId),
    pageId: page.id,
    spreadId: page.spreadId,
    plate: paperText.plates[readingIndex].text,
    aspect: original.width / original.height,
    readingIndex,
  };
});

function findChapterSource(id) {
  return chapters.find(chapter => chapter.id === id).source;
}

const findPhoto = id => photos.find(photo => photo.id === id) || null;
const findSpread = id => spreads.find(spread => spread.id === id) || null;
const findChapter = id => chapters.find(chapter => chapter.id === id) || null;

export function create(tag, className, text, source) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  if (source) element.dataset.sourceUrl = source;
  return element;
}

function appendLines(element, lines) {
  lines.forEach((line, index) => {
    if (index) element.append(document.createElement('br'));
    element.append(document.createTextNode(line));
  });
}

function position(element, data) {
  if (data.x !== undefined) element.style.left = `${data.x}px`;
  if (data.y !== undefined) element.style.top = `${data.y}px`;
  if (data.w !== undefined) element.style.width = `${data.w}px`;
  if (data.h !== undefined) element.style.height = `${data.h}px`;
  if (data.right !== undefined) element.style.right = `${data.right}px`;
  return element;
}

function renderElement(data) {
  let element;
  if (data.type === 'photo') {
    const photo = findPhoto(data.photoId);
    element = create('button', 'ph print folio-photo folio-photo-button');
    element.type = 'button';
    element.dataset.photoId = photo.id;
    element.dataset.openPhoto = photo.id;
    element.style.setProperty('--rot', `${data.rot}deg`);
    element.setAttribute('aria-label', photo.title);
    const image = create('img');
    image.src = photo.src;
    image.alt = photo.title;
    image.width = photo.width;
    image.height = photo.height;
    image.decoding = 'async';
    image.draggable = false;
    image.dataset.photoId = photo.id;
    element.append(image);
  } else if (data.type === 'tape') {
    element = create('div', 'tape');
    element.style.transform = `rotate(${data.rot}deg)`;
    if (data.color) element.style.background = data.color;
    element.setAttribute('aria-hidden', 'true');
  } else if (data.type === 'caption') {
    const photo = findPhoto(data.photoId);
    element = create('div', 'cap', photo.plate);
    element.append(create('b', '', photo[data.titleField || 'title'], photo.titleSource));
  } else if (data.type === 'opener' || data.type === 'header') {
    const chapter = findChapter(data.chapterId);
    const opener = data.type === 'opener';
    element = create('div', opener ? 'opener' : 'hdr');
    element.append(create('div', 'idx', `${chapter.index} / ${paperText.chapterCount.text}`));
    const title = create('h2', '', undefined, chapter.source);
    appendLines(title, (opener ? chapter.openingTitle : chapter.title).split('\n'));
    element.append(title, create('div', 'en', chapter.english, chapter.source));
    if (opener) element.append(create('div', 'rule'));
    if (data.paragraph) element.append(create('p', '', chapter.note, chapter.source));
  } else if (data.type === 'vertical-text') {
    const chapter = findChapter(data.chapterId);
    element = create('div', 'vt', undefined, chapter.source);
    appendLines(element, data.lines);
  } else if (data.type === 'corners') {
    element = create('div', 'corners');
    element.style.position = 'absolute';
    element.style.transform = `rotate(${data.rot}deg)`;
    element.style.zIndex = '3';
    element.style.pointerEvents = 'none';
    element.setAttribute('aria-hidden', 'true');
    for (const [horizontal, vertical, clipPath] of [
      ['left', 'top', 'polygon(0 0,100% 0,0 100%)'],
      ['right', 'top', 'polygon(0 0,100% 0,100% 100%)'],
      ['left', 'bottom', 'polygon(0 0,0 100%,100% 100%)'],
      ['right', 'bottom', 'polygon(100% 0,100% 100%,0 100%)'],
    ]) {
      const corner = create('div', 'corner');
      corner.style[horizontal] = '-4px';
      corner.style[vertical] = '-4px';
      corner.style.clipPath = clipPath;
      element.append(corner);
    }
  } else if (data.type === 'note') {
    const quote = quotes[data.quoteId];
    element = create('div', 'note', undefined, quote.source);
    element.dataset.quoteId = data.quoteId;
    element.style.setProperty('--rot', `${data.rot}deg`);
    appendLines(element, quote.lines || [quote.text]);
    if (data.signed) element.append(create('span', 'by', paperText.signature.text));
  } else if (data.type === 'sketch') {
    const sketch = SK[data.name];
    const namespace = 'http://www.w3.org/2000/svg';
    element = document.createElementNS(namespace, 'svg');
    element.setAttribute('class', 'sk');
    element.setAttribute('width', sketch.width);
    element.setAttribute('height', sketch.height);
    element.setAttribute('viewBox', sketch.viewBox);
    element.setAttribute('aria-hidden', 'true');
    element.dataset.sketch = data.name;
    for (const dataPath of sketch.paths) {
      const path = document.createElementNS(namespace, 'path');
      path.setAttribute('d', dataPath.d);
      if (dataPath.strokeWidth) path.setAttribute('stroke-width', dataPath.strokeWidth);
      element.append(path);
    }
  } else if (data.type === 'seal') {
    element = create('div', 'seal', undefined);
    appendLines(element, paperText.seal.text.split('\n'));
  } else if (data.type === 'folio') {
    const folio = paperText.folios[data.number - 1];
    element = create('div', 'folio', folio.text);
  } else {
    throw new Error(`相册元素类型无效：${data.type}`);
  }
  return position(element, data);
}

function renderPage(pageOrId, requestedSide) {
  const page = pages.find(item => item.id === (typeof pageOrId === 'string' ? pageOrId : pageOrId?.id));
  if (!page) return null;
  const owner = findSpread(page.spreadId);
  const chapter = findChapter(page.chapterId);
  const side = requestedSide === 'left' || requestedSide === 'right'
    ? requestedSide : owner.left.id === page.id ? 'left' : 'right';
  const element = create('div', 'folio-page-content');
  element.dataset.layout = page.layout;
  element.dataset.pageId = page.id;
  element.dataset.chapterId = chapter.id;
  element.dataset.side = side;
  element.style.setProperty('--chapter-color', chapter.color);
  element.append(create('div', 'grain'));
  for (const data of page.elements) element.append(renderElement(data));
  element.append(create('div', 'light'));
  return element;
}

export default { chapters, spreads, photos, uiText, renderPage, findPhoto };

export const clamp = (value, low = 0, high = 1) => Math.max(low, Math.min(high, value));
export const smooth = value => {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
};
export const mix = (a, b, t) => a + (b - a) * t;
