import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const origin = 'https://deer603.github.io';
const wikiGlobe = `${origin}/weijiba/assets/share-globe.jpg?v=wei`;
const wikiShareArtwork = {
  image: wikiGlobe, thumbnail: wikiGlobe, imageAlt: '魏鸡百科地球Logo', twitterCard: 'summary'
};
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);

function update(file, {title, description, url, site, image, thumbnail, type = 'website', next = false, flightFiles = true, imageType = 'image/jpeg', imageWidth = 400, imageHeight = 400, imageAlt = `${site}分享封面`, twitterCard = 'summary_large_image'}) {
  let html = fs.readFileSync(file, 'utf8');
  html = html.replace(/<title>[\s\S]*?<\/title>/i, () => `<title>${escape(title)}</title>`)
    .replace(/\s*<meta\b[^>]*(?:name|property)=["'](?:description|og:[^"']+|twitter:[^"']+|image|thumbnail|title)["'][^>]*>/gi, '')
    .replace(/\s*<meta\b[^>]*itemprop=["'](?:name|description|image)["'][^>]*>/gi, '')
    .replace(/\s*<link\b[^>]*rel=["'](?:canonical|image_src)["'][^>]*>/gi, '')
    .replace(/\s*<!-- share-metadata:start -->[\s\S]*?<!-- share-metadata:end -->/g, '')
    .replace(/\s*<!-- share-thumbnail:start -->[\s\S]*?<!-- share-thumbnail:end -->/g, '');
  const tags = [
    ['name','description',description], ['name','title',title],
    ['property','og:type',type], ['property','og:locale','zh_CN'],
    ['property','og:site_name',site], ['property','og:title',title],
    ['property','og:description',description], ['property','og:url',url],
    ['property','og:image',thumbnail], ['property','og:image:secure_url',thumbnail],
    ['property','og:image:type',imageType], ['property','og:image:width',String(imageWidth)],
    ['property','og:image:height',String(imageHeight)], ['property','og:image:alt',imageAlt],
    ['name','twitter:card',twitterCard], ['name','twitter:title',title],
    ['name','twitter:description',description], ['name','twitter:image',image],
    ['name','twitter:image:alt',imageAlt], ['name','image',thumbnail],
    ['name','thumbnail',thumbnail], ['itemprop','name',title],
    ['itemprop','description',description], ['itemprop','image',thumbnail]
  ];
  const block = `\n    <!-- share-metadata:start -->\n${tags.map(([attr,key,value]) => `    <meta ${attr}="${key}" content="${escape(value)}">`).join('\n')}\n    <link rel="canonical" href="${escape(url)}">\n    <link rel="image_src" href="${escape(thumbnail)}">\n    <!-- share-metadata:end -->\n`;
  html = html.replace(/\s*<\/head>/i, () => `${block}</head>`);
  // An early image is also available to crawlers that only inspect HTML images.
  const thumbnailUrl = new URL(thumbnail);
  const localThumbnail = path.relative(path.dirname(file), path.join(root,decodeURIComponent(thumbnailUrl.pathname))).replaceAll('\\','/').split('/').map(encodeURIComponent).join('/') + thumbnailUrl.search;
  if (!next) html = html.replace(/(<body\b[^>]*>)/i, (_, body) => `${body}\n    <!-- share-thumbnail:start -->\n    <img src="${escape(localThumbnail)}" width="${imageWidth}" height="${imageHeight}" alt="" aria-hidden="true" fetchpriority="low" style="position:absolute;left:-10000px;top:0;pointer-events:none">\n    <!-- share-thumbnail:end -->`);
  if (next) {
    // Keep Next's exported metadata in sync, including client-side navigation.
    const entries=[['$','title','share-title',{children:title}],...tags.map(([attr,key,value],i)=>['$','meta',`share-${i}`,{[attr]:key,content:value}]),['$','link','share-canonical',{rel:'canonical',href:url}],['$','link','share-image',{rel:'image_src',href:thumbnail}]];
    function patchFlight(text) {
      return text.replace(/^([\da-f]+:)([\[{].*)$/gm,(line,prefix,json)=>{
        let payload; try {payload=JSON.parse(json);} catch {return line;}
        let changed=false;
        function visit(node){
          if(Array.isArray(node)){
            if(node.some(el=>Array.isArray(el) && el[1]==='title')){
              changed=true;
              const kept=node.filter(el=>{
                if(!Array.isArray(el)) return true;
                const attrs=el[3] || {};
                return el[1]!=='title' && !(el[1]==='meta' && tags.some(([attr,key])=>attrs[attr]===key)) && !(el[1]==='link' && ['canonical','image_src'].includes(attrs.rel));
              });
              return [...entries,...kept];
            }
            return node.map(visit);
          }
          if(node && typeof node==='object') return Object.fromEntries(Object.entries(node).map(([key,value])=>[key,visit(value)]));
          return node;
        }
        const patched=visit(payload);
        return changed ? prefix+JSON.stringify(patched) : line;
      });
    }
    html=html.replace(/self\.__next_f\.push\((\[1,"(?:\\.|[^"\\])*"\])\)/g,(match,json)=>{
      const payload=JSON.parse(json);payload[1]=patchFlight(payload[1]);
      return 'self.__next_f.push('+JSON.stringify(payload).replaceAll('<','\\u003c')+')';
    });
    for(const name of flightFiles ? fs.readdirSync(path.dirname(file)).filter(name=>name.endsWith('.txt')) : []){
      const target=path.join(path.dirname(file),name),source=fs.readFileSync(target,'utf8'),patched=patchFlight(source);
      if(patched!==source) fs.writeFileSync(target,patched);
    }
    if (!html.includes('src="/xiaweicheng/lightbox-accessibility.js"')) html=html.replace('</head>','<script src="/xiaweicheng/lightbox-accessibility.js" defer></script>\n</head>');
  }
  if (html !== fs.readFileSync(file, 'utf8')) fs.writeFileSync(file, html);
}

export function refreshShareMetadata() {
  const sites = [
    ['', '603web｜603，我们的家', '寝室概况、论坛、小卖部与查寝通报。走进603，发现室友故事与鹿群小站。', '603web', 'assets'],
    ['codec', '加密鹿｜把文字藏进鹿群里', '将文字转换为鹿与森林符号，使用相同密钥还原。支持智能转换、逐字输出和一键复制。', '加密鹿', 'codec'],
    ['weijiba', '魏鸡百科｜困困的百科全书', '记录鹿群人物、趣事、术语与科技话题。检索词条，阅读故事，发现群内共同记忆。', '魏鸡百科', 'weijiba/assets'],
    ['kuncode', 'KunCode｜开源开发工作台与困困AI', '认识KunCode与困困AI，了解中文开发工作台、水豚主题和Windows、macOS安装入口。', 'KunCode', 'kuncode'],
    ['room', '青蛙的角落｜寝室故事与摄影相册', '从六人寝室走进舍友的个人空间，翻阅青蛙的摄影作品与故事。', '青蛙的角落', 'room'],
    ['urdeer', '你是个鹿嘞｜检测你是哪一只鹿', '检测你是哪一只鹿。通过照片或摄像头查看相似度排行，画面在本机处理。', '你是个鹿嘞', 'urdeer'],
    ['xiaweicheng', '夏炜城｜拓竹全栈工程师', '夏炜城，拓竹全栈工程师。以全栈工程视角连接软件、硬件与AI，展示项目案例、个人摄影与经历。', '夏炜城作品集', 'xiaweicheng/assets'],
    ['joinus', '加入Deer603｜人才招聘', '鹿文化传播大使招聘中。参与文化研究、内容创作与社区建设。', 'Deer603人才招聘', 'joinus']
  ];
  for (const [directory,title,description,site,assets] of sites) {
    const portrait = directory==='xiaweicheng' ? {image:`${origin}/${assets}/xia-weicheng-portrait.png`,thumbnail:`${origin}/${assets}/xia-weicheng-portrait.png`,imageType:'image/png',imageWidth:517,imageHeight:607,imageAlt:'夏炜城个人照',twitterCard:'summary'} : {};
    update(path.join(root,directory,'index.html'), {title,description,site,url:`${origin}/${directory ? directory+'/' : ''}`,image:`${origin}/${assets}/share-cover.jpg`,thumbnail:`${origin}/${assets}/share-thumb.jpg`,next:directory==='xiaweicheng',...portrait,...(directory==='weijiba' ? wikiShareArtwork : {})});
  }
  const icon603 = `${origin}/603ai/assets/share-thumb.png`;
  update(path.join(root,'603ai/index.html'),{
    title:'603AI｜把603装进口袋',description:'四个角色，一间寝室。把聊天、语录和日常灵感一起带走。',
    url:`${origin}/603ai/`,site:'603AI',image:icon603,thumbnail:icon603,imageType:'image/png',
    imageAlt:'603AI黑鹿应用图标',twitterCard:'summary'
  });
  for(const [slug,title,description] of [
    ['robomaster-power-control','RoboMaster功率控制板｜夏炜城·拓竹全栈工程师','拓竹全栈工程师夏炜城的个人项目案例：从机器人功率管理需求到控制板设计，了解工程实现与项目复盘。'],
    ['smart-tea-machine','智能泡茶机｜夏炜城·拓竹全栈工程师','拓竹全栈工程师夏炜城的个人项目案例：智能泡茶机的电路、硬件原型与产品交互设计。'],
    ['ai-photography-assistant','LensPilot AI摄影助手｜夏炜城·拓竹全栈工程师','拓竹全栈工程师夏炜城的个人项目案例：面向摄影新手的多模态拍摄指导与照片复盘方案。']
  ]) update(path.join(root,'xiaweicheng/projects',slug,'index.html'),{title,description,site:'夏炜城作品集',url:`${origin}/xiaweicheng/projects/${slug}/`,image:`${origin}/xiaweicheng/assets/${slug}-share-cover.jpg`,thumbnail:`${origin}/xiaweicheng/assets/${slug}-share-thumb.jpg`,next:true});
  const portfolioPortrait = `${origin}/xiaweicheng/assets/xia-weicheng-portrait.png`;
  for(const file of ['404.html','404/index.html','_not-found/index.html']){
    update(path.join(root,'xiaweicheng',file),{
      title:'页面未找到｜夏炜城作品集',description:'返回夏炜城作品集首页，浏览项目案例、个人摄影和经历。',
      url:`${origin}/xiaweicheng/404.html`,site:'夏炜城作品集',image:portfolioPortrait,thumbnail:portfolioPortrait,
      next:true,flightFiles:file!=='404.html',imageType:'image/png',imageWidth:517,imageHeight:607,
      imageAlt:'夏炜城个人照',twitterCard:'summary'
    });
  }
  const context = { history:{}, URL, URLSearchParams, window:{location:{pathname:'/weijiba/',search:'',href:`${origin}/weijiba/`},scrollTo(){},addEventListener(){},setTimeout(){}},document:{querySelectorAll:()=>[],querySelector:()=>null} };
  vm.createContext(context);
  for (const name of ['entry-routes.js','entry-writing.js','entry-data.js']) vm.runInContext(fs.readFileSync(path.join(root,'weijiba',name),'utf8'),context);
  const routes = context.window.WEIJIBA_ENTRY_PATHS;
  const catalog = context.window.WEIJIBA_ENTRY_CATALOG;
  let articles = 0;
  for (const [slug, directory] of Object.entries(routes)) {
    const entry = catalog[slug];
    const file = path.join(root, 'weijiba', directory, 'index.html');
    if (!entry || !fs.existsSync(file)) continue;
    const name = entry.title;
    const description = `${name}—${entry.description}`.replace(/\s+/g, ' ').slice(0, 180);
    const url = `${origin}/weijiba/${encodeURIComponent(directory)}/`;
    update(file,{title:`${name}｜魏鸡百科`,description,site:'魏鸡百科',type:'article',url,...wikiShareArtwork});
    articles++;
  }
  update(path.join(root,'weijiba/article.html'),{title:'词条入口｜魏鸡百科',description:'旧版魏鸡百科词条入口。打开页面后将跳转到对应词条。',site:'魏鸡百科',url:`${origin}/weijiba/`,...wikiShareArtwork});
  return {sites:sites.length+1,articles};
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) console.log(JSON.stringify(refreshShareMetadata()));
