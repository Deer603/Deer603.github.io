"""Render code-drawn share artwork; no remote assets or build dependencies beyond Pillow."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageOps
import argparse

ROOT = Path(__file__).resolve().parent.parent
FONT = 'C:/Windows/Fonts/msyh.ttc'
BOLD = 'C:/Windows/Fonts/msyhbd.ttc'
SITES = [
    ('assets', '603', '603web', '603，我们的家', '寝室故事与鹿群小站', (12, 23, 43), (106, 168, 255)),
    ('codec', 'deer', '加密鹿', '把文字藏进鹿群里', '文字转换 · 鹿群暗号', (7, 24, 17), (185, 242, 204)),
    ('weijiba/assets', 'book', '魏鸡百科', '困困的百科全书', '人物 · 故事 · 术语 · 科技', (237, 242, 237), (43, 85, 66)),
    ('kuncode', 'code', 'KunCode', '让写代码变得更轻松', '开发工作台与困困AI', (10, 27, 23), (177, 228, 199)),
    ('room', 'room', '青蛙的角落', '从寝室走进个人世界', '寝室场景 · 摄影相册', (20, 30, 23), (212, 222, 181)),
    ('urdeer', 'face', '你是个鹿嘞', '检测你是哪一只鹿', '照片与摄像头 · 本地处理', (242, 242, 238), (45, 66, 53)),
]

parser = argparse.ArgumentParser(description='Generate website share artwork.')
parser.add_argument('--new-only', action='store_true')
parser.add_argument('--site', choices=[site[0] for site in SITES])
args = parser.parse_args()

def font(size, bold=False):
    return ImageFont.truetype(BOLD if bold else FONT, size)

def icon(draw, kind, center, size, color):
    x,y = center
    if kind == '603':
        draw.text((x,y), '603', font=font(int(size*.55),True),fill=color,anchor='mm')
    elif kind == 'book':
        s=size*.34
        draw.line([(x-s,y+s),(x-s,y-s),(x,y-s*.7),(x+s,y-s),(x+s,y+s),(x,y+s*.7),(x-s,y+s)],fill=color,width=8)
        draw.line([(x,y-s*.7),(x,y+s*.7)],fill=color,width=6)
    elif kind == 'code':
        s=size*.3
        draw.line([(x-s*.5,y-s),(x-s*1.3,y),(x-s*.5,y+s)],fill=color,width=9)
        draw.line([(x+s*.5,y-s),(x+s*1.3,y),(x+s*.5,y+s)],fill=color,width=9)
        draw.line([(x+s*.2,y-s),(x-s*.2,y+s)],fill=color,width=7)
    elif kind == 'room':
        s=size*.34
        draw.line([(x-s,y+s),(x-s,y-s*.2),(x,y-s),(x+s,y-s*.2),(x+s,y+s),(x-s,y+s)],fill=color,width=7)
        draw.rectangle((x-s*.25,y+s*.2,x+s*.25,y+s),outline=color,width=6)
    elif kind == 'face':
        s=size*.4
        for dx in (-1,1):
            for dy in (-1,1):
                draw.line([(x+dx*s*.6,y+dy*s),(x+dx*s,y+dy*s),(x+dx*s,y+dy*s*.6)],fill=color,width=7)
        draw.ellipse((x-s*.4,y-s*.5,x+s*.4,y+s*.4),outline=color,width=6)
    else:
        s=size*.3
        draw.line([(x-s*.7,y-s*.2),(x-s,y-s*1.3),(x-s*1.5,y-s*1.65)],fill=color,width=7)
        draw.line([(x+s*.7,y-s*.2),(x+s,y-s*1.3),(x+s*1.5,y-s*1.65)],fill=color,width=7)
        draw.line([(x-s,y-s*1.3),(x-s*.5,y-s*1.6)],fill=color,width=6)
        draw.line([(x+s,y-s*1.3),(x+s*.5,y-s*1.6)],fill=color,width=6)
        draw.polygon([(x-s*.75,y-s*.25),(x+s*.75,y-s*.25),(x+s*.65,y+s*.65),(x,y+s*1.3),(x-s*.65,y+s*.65)],outline=color,width=7)
        for dx in [-.3,.3]: draw.ellipse((x+s*dx-4,y+s*.25-4,x+s*dx+4,y+s*.25+4),fill=color)

for directory,kind,title,subtitle,detail,bg,accent in SITES:
    if args.site and directory != args.site: continue
    if args.new_only and directory not in ('room','urdeer'): continue
    out=ROOT/directory
    for square in [False,True]:
        w,h=(400,400) if square else (1200,630)
        im=Image.new('RGB',(w,h),bg)
        d=ImageDraw.Draw(im)
        border=tuple(int(bg[i]*.82+accent[i]*.18) for i in range(3))
        d.rounded_rectangle((18,18,w-19,h-19),radius=24,outline=border,width=2)
        if square:
            icon(d,kind,(200,158),170,accent)
            d.text((200,302),title,font=font(45 if len(title)<7 else 40,True),fill=accent,anchor='mm')
        else:
            label={'assets':'603WEB','codec':'CODEC','weijiba/assets':'WEIJIBA','kuncode':'KUNCODE','room':'ROOM','urdeer':'URDEER','xiaweicheng/assets':'PORTFOLIO'}[directory]
            d.text((76,92),'DEER603 / '+label,font=font(22),fill=accent)
            d.text((76,225),title,font=font(66 if len(title)>5 else 76,True),fill=accent)
            d.text((80,343),subtitle,font=font(37),fill=accent)
            d.text((80,420),detail,font=font(23),fill=accent)
            d.line((80,512,620,512),fill=border,width=2)
            d.text((80,540),'deer603.github.io',font=font(21),fill=accent)
            d.rounded_rectangle((840,185,1110,455),radius=55,outline=border,width=3)
            icon(d,kind,(975,320),210,accent)
        im.save(out/('share-thumb.jpg' if square else 'share-cover.jpg'),quality=90,optimize=True)
if args.site:
    print(f'Share artwork created for {args.site}.')
    raise SystemExit(0)
for slug,source in [('robomaster-power-control','rm-power-controller-cover.webp'),('smart-tea-machine','tea-machine-pcb-powered.webp'),('ai-photography-assistant','ai-photography-cover.webp')]:
    original=Image.open(ROOT/'xiaweicheng/assets'/source).convert('RGB')
    for square in (False,True):
        canvas=Image.new('RGB',(400,400) if square else (1200,630),(239,242,246))
        fitted=ImageOps.contain(original,canvas.size,Image.Resampling.LANCZOS)
        canvas.paste(fitted,((canvas.width-fitted.width)//2,(canvas.height-fitted.height)//2))
        canvas.save(ROOT/'xiaweicheng/assets'/f'{slug}-share-{"thumb" if square else "cover"}.jpg',quality=88,optimize=True)
print('Share artwork and project image derivatives created.')
