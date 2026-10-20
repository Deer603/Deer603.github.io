"""Generate web-sized assets without modifying the original images or fonts."""
from pathlib import Path
from urllib.parse import urlsplit,unquote
from PIL import Image,ImageOps
from fontTools import subset
import re,os,json
ROOT=Path(__file__).resolve().parents[1]/'hunauees'
pages=list(ROOT.rglob('*.html'));styles=list((ROOT/'images').glob('*.css'))
cache={};totals={'image_original_bytes':0,'image_web_bytes':0,'images':0,'font_original_bytes':0,'font_web_bytes':0}
def optimize(owner,url):
 u=urlsplit(url)
 if u.scheme or u.netloc or not u.path:return url,None
 source=(owner.parent/unquote(u.path)).resolve()
 if not source.is_file() or source.suffix.lower() not in ['.png','.jpg','.jpeg'] or ROOT not in source.parents:return url,None
 if source not in cache:
  with Image.open(source) as raw:
   im=ImageOps.exif_transpose(raw);size=im.size
   if source.stat().st_size<100000:cache[source]=(source,size)
   else:
    limit=400 if source.name=='603-academy-emblem.png' else 1920
    if 'members' in source.parts:limit=600
    im.thumbnail((limit,limit),Image.Resampling.LANCZOS)
    target=ROOT/'assets/optimized'/source.relative_to(ROOT).with_suffix('.webp');target.parent.mkdir(parents=True,exist_ok=True)
    im.save(target,'WEBP',quality=85,method=5)
    if target.stat().st_size<source.stat().st_size:
     cache[source]=(target,size);totals['images']+=1;totals['image_original_bytes']+=source.stat().st_size;totals['image_web_bytes']+=target.stat().st_size
    else:target.unlink();cache[source]=(source,size)
 target,size=cache[source]
 return os.path.relpath(target,owner.parent),size
for page in pages:
 text=page.read_text();count=0;hero_seen=False
 def image(m):
  global count,hero_seen
  tag=m[0];src=re.search(r'\bsrc=["\']([^"\']+)',tag)
  if not src:return tag
  original=src[1];new,size=optimize(page,original);tag=tag[:src.start(1)]+new+tag[src.end(1):]
  is_hero=any(k in original for k in ['campus-v1','listqt_banner','list_banner']) and not hero_seen
  if is_hero:hero_seen=True
  count+=1
  def attr(name,value):
   nonlocal tag
   if re.search(r'\s'+name+r'=',tag):tag=re.sub(r'\s'+name+r'=["\'][^"\']*["\']',' '+name+'="'+str(value)+'"',tag)
   else:tag=re.sub(r'\s*/?>$',lambda m:' '+name+'="'+str(value)+'">',tag)
  attr('decoding','async')
  attr('loading','eager' if is_hero or count<=2 else 'lazy')
  if is_hero:attr('fetchpriority','high')
  return tag
 text=re.sub(r'<img\b[^>]*>',image,text,flags=re.I)
 def video(m):
  tag=m[0];tag=re.sub(r'preload=["\'][^"\']*["\']','preload="none"',tag)
  poster=re.search(r'poster="([^"]+)"',tag)
  if poster:
   new,_=optimize(page,poster[1]);tag=tag[:poster.start(1)]+new+tag[poster.end(1):]
  return tag
 text=re.sub(r'<video\b[^>]*>',video,text,flags=re.I)
 page.write_text(text)
for css in styles:
 text=css.read_text()
 def asset(m):
  new,_=optimize(css,m[2]);return 'url('+m[1]+new+m[1]+')'
 text=re.sub(r'url\(\s*(["\']?)([^\s)"\']+)\1\s*\)',asset,text)
 css.write_text(text)
# Include all current site text and printable ASCII. Unseen future glyphs use system fallback.
chars=set(''.join(p.read_text() for p in pages));chars.update(chr(i) for i in range(32,127))
css=ROOT/'images/2024zygc_index.css';text=css.read_text()
for source in (ROOT/'images').glob('syht*.ttf'):
 options=subset.Options();options.flavor='woff2';options.desubroutinize=True
 font=subset.load_font(str(source),options);subsetter=subset.Subsetter(options=options);subsetter.populate(unicodes=[ord(c) for c in chars]);subsetter.subset(font)
 target=source.with_suffix('.subset.woff2');subset.save_font(font,str(target),options)
 totals['font_original_bytes']+=source.stat().st_size;totals['font_web_bytes']+=target.stat().st_size
 text=text.replace("url('"+source.name+"') format('truetype')","url('"+target.name+"') format('woff2')")
text=re.sub(r'(@font-face\s*\{)(.*?)(\})',lambda m:m[1]+m[2]+('' if 'font-display' in m[2] else '\n    font-display: swap;\n')+m[3],text,flags=re.S);css.write_text(text)
# Non-blocking display for the decorative heading font as well.
for css in styles:
 if css.name=='layui.css':continue
 text=css.read_text();text=re.sub(r'(@font-face\s*\{)(.*?)(\})',lambda m:m[1]+m[2]+('' if 'font-display' in m[2] else '\nfont-display:swap;\n')+m[3],text,flags=re.S)
 text=text.replace("format('woff')","format('woff2')") if 'fzzdhjw.woff2' in text else text
 css.write_text(text)
for page in pages:
 text=page.read_text();text=re.sub(r'(href=["\'][^"\']+\.css)(?:\?[^"\']*)?(["\'])',r'\1?v=20261020-speed1\2',text);page.write_text(text)
(ROOT/'assets/optimized/report.json').write_text(json.dumps(totals,indent=2));print(json.dumps(totals,indent=2))
