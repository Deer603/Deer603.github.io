"""Draw square JPEG thumbnails from the titles in the generated wiki pages."""
from functools import lru_cache
from html import unescape
from pathlib import Path
import argparse
import re

from PIL import Image, ImageDraw, ImageFont


WIKI = Path(__file__).resolve().parents[1] / "weijiba"
FONT = Path("C:/Windows/Fonts/msyhbd.ttc")
EMOJI_FONT = FONT.with_name("seguiemj.ttf")
TITLE = re.compile(r"<h1>([^<]+)</h1>")
MAX_WIDTH = 304


@lru_cache
def font(size, emoji=False):
    return ImageFont.truetype(str(EMOJI_FONT if emoji else FONT), size)


def title_runs(text, size):
    for part in re.findall(r"[\x00-\uffff]+|[\U00010000-\U0010ffff]+", text):
        yield part, font(size, ord(part[0]) > 0xffff)


def title_width(draw, text, size):
    return sum(draw.textlength(part, font=face) for part, face in title_runs(text, size))


def wrap_title(draw, title, size):
    lines = [""]
    for char in title:
        if lines[-1] and title_width(draw, lines[-1] + char, size) > MAX_WIDTH:
            lines.append("")
        lines[-1] += char
    return lines


def draw_card(title, archived):
    canvas = Image.new("RGB", (400, 400), "#edf2ed")
    draw = ImageDraw.Draw(canvas)
    ink = "#163e32"
    draw.rounded_rectangle((18, 18, 381, 381), radius=20, outline="#a8bcb0", width=2)
    draw.line((48, 101, 352, 101), fill="#a8bcb0", width=2)
    draw.text((48, 56), "魏鸡百科", font=font(25), fill=ink)
    draw.text((352, 56), "旧词条" if archived else "词条", font=font(18), fill=ink, anchor="ra")
    for size in (52, 46, 40, 34, 28, 23, 18):
        lines = wrap_title(draw, title, size)
        if len(lines) <= 4:
            break
    if len(lines) > 4:
        lines = lines[:4]
        while title_width(draw, lines[-1] + "…", size) > MAX_WIDTH:
            lines[-1] = lines[-1][:-1]
        lines[-1] += "…"
    spacing = round(size * 1.3)
    start = 217 - (len(lines) - 1) * spacing / 2
    for index, line in enumerate(lines):
        x = 48
        for part, face in title_runs(line, size):
            draw.text((x, start + index * spacing), part, font=face, fill=ink, anchor="lm")
            x += draw.textlength(part, font=face)
    draw.text((48, 342), "deer603.github.io/weijiba", font=font(16), fill=ink)
    return canvas


parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("entries", nargs="*", help="Optional directory names to regenerate.")
entries = set(parser.parse_args().entries)
count = 0
for page in WIKI.glob("*/index.html"):
    if entries and page.parent.name not in entries:
        continue
    html = page.read_text(encoding="utf-8")
    if 'class="article-main"' not in html:
        continue
    match = TITLE.search(html)
    if not match:
        raise ValueError(f"Missing article title in {page}")
    draw_card(unescape(match[1]), 'id="unavailable"' in html).save(
        page.with_name("share.jpg"), quality=84, optimize=True
    )
    count += 1

print(f"Generated {count} wiki sharing images.")
