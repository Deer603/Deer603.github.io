"""Render code-drawn share artwork; no remote assets or build dependencies beyond Pillow."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
FONT = 'C:/Windows/Fonts/msyh.ttc'
BOLD = 'C:/Windows/Fonts/msyhbd.ttc'
SITES = [
    ('assets', '603', '603web', '603，我们的家', '寝室故事与鹿群小站', (12, 23, 43), (106, 168, 255)),
    ('codec', 'deer', '加密鹿', '把文字藏进鹿群里', '文字转换 · 鹿群暗号', (7, 24, 17), (185, 242, 204)),
    ('weijiba/assets', 'book', '魏鸡百科', '困困的百科全书', '人物 · 故事 · 术语 · 科技', (237, 242, 237), (43, 85, 66)),
    ('kuncode', 'code', 'KunCode', '让写代码变得更轻松', '开发工作台与困困AI', (10, 27, 23), (177, 228, 199)),
]

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
    else:
        s=size*.3
        draw.line([(x-s*.7,y-s*.2),(x-s,y-s*1.3),(x-s*1.5,y-s*1.65)],fill=color,width=7)
        draw.line([(x+s*.7,y-s*.2),(x+s,y-s*1.3),(x+s*1.5,y-s*1.65)],fill=color,width=7)
        draw.line([(x-s,y-s*1.3),(x-s*.5,y-s*1.6)],fill=color,width=6)
        draw.line([(x+s,y-s*1.3),(x+s*.5,y-s*1.6)],fill=color,width=6)
        draw.polygon([(x-s*.75,y-s*.25),(x+s*.75,y-s*.25),(x+s*.65,y+s*.65),(x,y+s*1.3),(x-s*.65,y+s*.65)],outline=color,width=7)
        for dx in [-.3,.3]: draw.ellipse((x+s*dx-4,y+s*.25-4,x+s*dx+4,y+s*.25+4),fill=color)

for directory,kind,title,subtitle,detail,bg,accent in SITES:
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
            d.text((76,92),'DEER603 / '+('603WEB' if kind=='603' else {'deer':'CODEC','book':'WEIJIBA','code':'KUNCODE'}[kind]),font=font(22),fill=accent)
            d.text((76,225),title,font=font(76,True),fill=accent)
            d.text((80,343),subtitle,font=font(37),fill=accent)
            d.text((80,420),detail,font=font(23),fill=accent)
            d.line((80,512,620,512),fill=border,width=2)
            d.text((80,540),'deer603.github.io',font=font(21),fill=accent)
            d.rounded_rectangle((840,185,1110,455),radius=55,outline=border,width=3)
            icon(d,kind,(975,320),210,accent)
        im.save(out/('share-thumb.jpg' if square else 'share-cover.jpg'),quality=90,optimize=True)
print('Created 4 covers and 4 square thumbnails.')
