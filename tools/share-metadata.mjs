import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const origin = 'https://deer603.github.io';
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);

function update(file, {title, description, url, site, image, thumbnail, type = 'website'}) {
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
  ].map(([attr,key,value]) => `    <meta ${attr}="${key}" content="${escape(value)}">`);
  const block = `\n    <!-- share-metadata:start -->\n${tags.join('\n')}\n    <link rel="canonical" href="${escape(url)}">\n    <link rel="image_src" href="${escape(thumbnail)}">\n    <!-- share-metadata:end -->\n`;
  html = html.replace(/\s*<\/head>/i, `${block}</head>`);
  // A real, early JPEG image gives non-OG crawlers a fallback without changing layout.
  const localThumbnail = path.relative(path.dirname(file), path.join(root,new URL(thumbnail).pathname)).replaceAll('\\','/');
  html = html.replace(/(<body\b[^>]*>)/i, `$1\n    <!-- share-thumbnail:start -->\n    <img src="${escape(localThumbnail)}" width="400" height="400" alt="" aria-hidden="true" fetchpriority="low" style="position:absolute;left:-10000px;top:0;width:400px;height:400px;pointer-events:none">\n    <!-- share-thumbnail:end -->`);
  if (html !== fs.readFileSync(file, 'utf8')) fs.writeFileSync(file, html);
}

export function refreshShareMetadata() {
  const sites = [
    ['', '603web｜603，我们的家', '寝室概况、论坛、小卖部与查寝通报。走进603，发现室友故事与鹿群小站。', '603web', 'assets'],
    ['codec', '加密鹿｜把文字藏进鹿群里', '将文字转换为鹿与森林符号，使用相同密钥还原。支持智能转换、逐字输出和一键复制。', '加密鹿', 'codec'],
    ['weijiba', '魏鸡百科｜困困的百科全书', '记录鹿群人物、趣事、术语与科技话题。检索词条，阅读故事，发现群内共同记忆。', '魏鸡百科', 'weijiba/assets'],
    ['kuncode', 'KunCode｜开源开发工作台与困困AI', '认识KunCode与困困AI，了解中文开发工作台、水豚主题和Windows、macOS安装入口。', 'KunCode', 'kuncode']
  ];
  for (const [directory,title,description,site,assets] of sites) {
    update(path.join(root,directory,'index.html'), {title,description,site,url:`${origin}/${directory ? directory+'/' : ''}`,image:`${origin}/${assets}/share-cover.jpg`,thumbnail:`${origin}/${assets}/share-thumb.jpg`});
  }
  const context = { history:{}, URL, URLSearchParams, window:{location:{pathname:'/weijiba/',search:'',href:`${origin}/weijiba/`},scrollTo(){},addEventListener(){},setTimeout(){}},document:{querySelectorAll:()=>[],querySelector:()=>null} };
  vm.createContext(context);
  for (const name of ['entry-routes.js','entry-writing.js','entry-data.js']) vm.runInContext(fs.readFileSync(path.join(root,'weijiba',name),'utf8'),context);
  const routes = context.window.WEIJIBA_ENTRY_PATHS;
  const catalog = context.window.WEIJIBA_ENTRY_CATALOG;
  let articles = 0;
  for (const item of fs.readdirSync(path.join(root,'weijiba'),{withFileTypes:true})) {
    if (!item.isDirectory()) continue;
    const file = path.join(root,'weijiba',item.name,'index.html');
    if (!fs.existsSync(file)) continue;
    const key = Object.keys(routes).find(key => routes[key] === item.name);
    const entry = catalog[key];
    const description = `${item.name}—${entry?.description || '魏鸡百科词条，记录鹿群语境中的人物、故事与概念。'}`.replace(/\s+/g,' ').slice(0,180);
    update(file,{title:`${item.name}｜魏鸡百科`,description,site:'魏鸡百科',type:'article',url:`${origin}/weijiba/${encodeURIComponent(item.name)}/`,image:`${origin}/weijiba/assets/share-cover.jpg`,thumbnail:`${origin}/weijiba/assets/share-thumb.jpg`});
    articles++;
  }
  update(path.join(root,'weijiba/article.html'),{title:'困困｜魏鸡百科',description:`困困—${catalog.kunkun.description}`,site:'魏鸡百科',type:'article',url:`${origin}/weijiba/${encodeURIComponent('困困')}/`,image:`${origin}/weijiba/assets/share-cover.jpg`,thumbnail:`${origin}/weijiba/assets/share-thumb.jpg`});
  return {sites:sites.length,articles};
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) console.log(JSON.stringify(refreshShareMetadata()));
