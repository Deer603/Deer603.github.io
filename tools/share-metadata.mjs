import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const origin = 'https://deer603.github.io';
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);

function update(file, {title, description, url, site, image, thumbnail, type = 'website', next = false}) {
  let html = fs.readFileSync(file, 'utf8');
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escape(title)}</title>`)
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
    ['property','og:image',image], ['property','og:image:secure_url',image],
    ['property','og:image:type','image/jpeg'], ['property','og:image:width','1200'],
    ['property','og:image:height','630'], ['property','og:image:alt',`${site}分享封面`],
    ['name','twitter:card','summary_large_image'], ['name','twitter:title',title],
    ['name','twitter:description',description], ['name','twitter:image',image],
    ['name','twitter:image:alt',`${site}分享封面`], ['name','image',thumbnail],
    ['name','thumbnail',thumbnail], ['itemprop','name',title],
    ['itemprop','description',description], ['itemprop','image',thumbnail]
  ];
  const block = `\n    <!-- share-metadata:start -->\n${tags.map(([attr,key,value]) => `    <meta ${attr}="${key}" content="${escape(value)}">`).join('\n')}\n    <link rel="canonical" href="${escape(url)}">\n    <link rel="image_src" href="${escape(thumbnail)}">\n    <!-- share-metadata:end -->\n`;
  html = html.replace(/\s*<\/head>/i, `${block}</head>`);
  // A real, early JPEG image gives non-OG crawlers a fallback without changing layout.
  const localThumbnail = path.relative(path.dirname(file), path.join(root,new URL(thumbnail).pathname)).replaceAll('\\','/');
  if (!next) html = html.replace(/(<body\b[^>]*>)/i, `$1\n    <!-- share-thumbnail:start -->\n    <img src="${escape(localThumbnail)}" width="400" height="400" alt="" aria-hidden="true" fetchpriority="low" style="position:absolute;left:-10000px;top:0;width:400px;height:400px;pointer-events:none">\n    <!-- share-thumbnail:end -->`);
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
    for(const name of fs.readdirSync(path.dirname(file)).filter(name=>name.endsWith('.txt'))){
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
    ['XWCRecognizer', 'XWC检测器｜照片与摄像头匹配', '通过照片或摄像头查看双模型匹配度排行，在浏览器本地处理。', 'XWC检测器', 'XWCRecognizer'],
    ['xiaweicheng', '夏炜城｜智能硬件与AI产品作品集', '连接智能硬件、机器人、AI产品与真实场景，了解项目案例、个人摄影与经历。', '夏炜城作品集', 'xiaweicheng/assets']
  ];
  for (const [directory,title,description,site,assets] of sites) {
    update(path.join(root,directory,'index.html'), {title,description,site,url:`${origin}/${directory ? directory+'/' : ''}`,image:`${origin}/${assets}/share-cover.jpg`,thumbnail:`${origin}/${assets}/share-thumb.jpg`,next:directory==='xiaweicheng'});
  }
  for(const [slug,title,description] of [
    ['robomaster-power-control','RoboMaster功率控制板｜夏炜城作品集','从机器人功率管理需求到控制板设计，了解方案、工程实现与项目复盘。'],
    ['smart-tea-machine','智能泡茶机｜夏炜城作品集','了解智能泡茶机的电路、硬件原型与产品交互设计。'],
    ['ai-photography-assistant','LensPilot AI摄影助手｜夏炜城作品集','面向摄影新手的多模态拍摄指导与照片复盘方案，展示概念界面与设计思路。']
  ]) update(path.join(root,'xiaweicheng/projects',slug,'index.html'),{title,description,site:'夏炜城作品集',url:`${origin}/xiaweicheng/projects/${slug}/`,image:`${origin}/xiaweicheng/assets/${slug}-share-cover.jpg`,thumbnail:`${origin}/xiaweicheng/assets/${slug}-share-thumb.jpg`,next:true});
  const context = { history:{}, URL, URLSearchParams, window:{location:{pathname:'/weijiba/',search:'',href:`${origin}/weijiba/`},scrollTo(){},addEventListener(){},setTimeout(){}},document:{querySelectorAll:()=>[],querySelector:()=>null} };
  vm.createContext(context);
  for (const name of ['entry-routes.js','entry-writing.js','entry-data.js']) vm.runInContext(fs.readFileSync(path.join(root,'weijiba',name),'utf8'),context);
  const routes = context.window.WEIJIBA_ENTRY_PATHS;
  const catalog = context.window.WEIJIBA_ENTRY_CATALOG;
  const routeKeys = new Map(Object.entries(routes).map(([key,title])=>[title,key]));
  let articles = 0;
  for (const item of fs.readdirSync(path.join(root,'weijiba'),{withFileTypes:true})) {
    if (!item.isDirectory()) continue;
    const file = path.join(root,'weijiba',item.name,'index.html');
    if (!fs.existsSync(file)) continue;
    const key = routeKeys.get(item.name);
    const entry = catalog[key];
    const description = `${item.name}—${entry?.description || '此旧词条暂不可用，原地址保留，可返回魏鸡百科首页查找现有词条。'}`.replace(/\s+/g,' ').slice(0,180);
    update(file,{title:`${item.name}｜魏鸡百科`,description,site:'魏鸡百科',type:'article',url:`${origin}/weijiba/${encodeURIComponent(item.name)}/`,image:`${origin}/weijiba/assets/share-cover.jpg`,thumbnail:`${origin}/weijiba/assets/share-thumb.jpg`});
    articles++;
  }
  update(path.join(root,'weijiba/article.html'),{title:'困困｜魏鸡百科',description:`困困—${catalog.kunkun.description}`,site:'魏鸡百科',type:'article',url:`${origin}/weijiba/${encodeURIComponent('困困')}/`,image:`${origin}/weijiba/assets/share-cover.jpg`,thumbnail:`${origin}/weijiba/assets/share-thumb.jpg`});
  return {sites:sites.length,articles};
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) console.log(JSON.stringify(refreshShareMetadata()));
