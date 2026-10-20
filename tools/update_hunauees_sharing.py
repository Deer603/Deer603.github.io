#!/usr/bin/env python3
"""Write static sharing metadata; rerun after adding or renaming academy pages."""

import html
import re
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import quote

ROOT = Path(__file__).resolve().parents[1] / "hunauees"
BASE = "https://deer603.github.io/hunauees/"
SITE = "湖南鹿业大学卓越鹿员学院"
IMAGE = BASE + "images/603-academy-share.png"
START = "<!-- Deer Academy sharing metadata -->"
END = "<!-- /Deer Academy sharing metadata -->"
REDIRECT_TITLES = {
    "xygk/index.html": "学院概况",
    "dqgz/index.html": "党群工作",
    "cjrh/index.html": "产教融合",
    "cjrh/xmpt/index.html": "项目平台",
}
HOME_DESCRIPTION = "湖南鹿业大学卓越鹿员学院：记录鹿群日常，分享音乐、创作与工程实践。学科交叉、鹿工结合、基础支撑，让好奇心变成作品。"


class Fragment(HTMLParser):
    def __init__(self):
        super().__init__()
        self.tags = []
        self.text = []

    def handle_starttag(self, tag, attrs):
        self.tags.append((tag, dict(attrs)))

    def handle_data(self, data):
        self.text.append(data)


def plain(value):
    parser = Fragment()
    parser.feed(value)
    text = " ".join(parser.text)
    return re.sub(r"\s+", " ", text).strip()


def attrs(tag):
    parser = Fragment()
    parser.feed(tag)
    return parser.tags[0][1] if parser.tags else {}


def metadata(head):
    parser = Fragment()
    parser.feed(head)
    return {
        a.get("name", "").lower(): a.get("content", "")
        for tag, a in parser.tags if tag == "meta" and a.get("name")
    }


def description_for(source, title, existing, relative):
    if existing.strip():
        return plain(existing)[:160]
    if relative in ("index.html", "index.original.html"):
        return HOME_DESCRIPTION
    # Prefer an actual introductory paragraph to navigation or footer text.
    intro = re.search(
        r'<p\b[^>]*class=["\'][^"\']*(?:dc-lead|dm-intro|deer-profile-lead)[^"\']*["\'][^>]*>(.*?)</p>',
        source, re.I | re.S,
    )
    if intro and plain(intro.group(1)):
        return plain(intro.group(1))[:160]
    label = title.replace(SITE, "").strip(" -—|")
    return f"{SITE}｜{label}。了解相关介绍、鹿员故事与学院动态。"


def keep_unmanaged_tag(match):
    tag = match.group(0)
    a = attrs(tag)
    if tag.lower().startswith("<meta"):
        name = a.get("name", "").lower()
        prop = a.get("property", "").lower()
        item = a.get("itemprop", "").lower()
        if name == "description" or name.startswith("twitter:") or prop.startswith("og:"):
            return ""
        if item in ("name", "description", "image"):
            return ""
    elif a.get("rel", "").lower() in ("canonical", "image_src"):
        return ""
    return tag


def update_page(path):
    source = path.read_text(encoding="utf-8")
    relative = path.relative_to(ROOT).as_posix()
    if not re.search(r"<head\b", source, re.I):
        # Some mirrored category pages contain only a meta refresh.
        source = (
            '<!DOCTYPE html>\n<html lang="zh-CN">\n<head>\n'
            '<meta charset="UTF-8">\n'
            '<meta name="viewport" content="width=device-width, initial-scale=1.0">\n'
            f'<title>{REDIRECT_TITLES.get(relative, SITE)}-{SITE}</title>\n'
            f"{source.strip()}\n</head>\n<body></body>\n</html>\n"
        )
    elif not re.search(r"</head\s*>", source, re.I):
        source = re.sub(r"(?=<body\b)", "</head>\n", source, count=1, flags=re.I)

    match = re.search(r"(<head\b[^>]*>)(.*?)(</head\s*>)", source, re.I | re.S)
    if not match:
        raise ValueError(f"Missing head: {relative}")
    head = match.group(2)
    title_match = re.search(r"<title\b[^>]*>(.*?)</title>", head, re.I | re.S)
    title = plain(title_match.group(1)) if title_match else SITE
    # Keep article titles intact while updating the old site-name prefix.
    for old in ("湖南农业大学湘江卓越工程师学院", "湖南农业大学湘江卓越工程学院"):
        title = re.sub(rf"^{old}(?=[-—|]|$)", SITE, title)
    description = description_for(source, title, metadata(head).get("description", ""), relative)
    head = re.sub(re.escape(START) + r".*?" + re.escape(END), "", head, flags=re.S)
    head = re.sub(r"<(?:meta|link)\b[^>]*>", keep_unmanaged_tag, head, flags=re.I)
    head = re.sub(r"<title\b[^>]*>.*?</title>", "", head, flags=re.I | re.S)
    url_path = "index.html" if relative == "index.original.html" else relative
    url = BASE + quote(url_path, safe="/")
    kind = "article" if (relative.startswith("campus/") or
                         relative.startswith("articles/") and path.name != "index.html" or
                         re.search(r"/\d{6}/", relative)) else "website"
    values = [
        ("name", "description", description),
        ("property", "og:site_name", SITE),
        ("property", "og:title", title),
        ("property", "og:description", description),
        ("property", "og:type", kind),
        ("property", "og:url", url),
        ("property", "og:locale", "zh_CN"),
        ("property", "og:image", IMAGE),
        ("property", "og:image:secure_url", IMAGE),
        ("property", "og:image:type", "image/png"),
        ("property", "og:image:width", "400"),
        ("property", "og:image:height", "400"),
        ("property", "og:image:alt", SITE + "校徽"),
        ("name", "twitter:card", "summary"),
        ("name", "twitter:title", title),
        ("name", "twitter:description", description),
        ("name", "twitter:image", IMAGE),
        ("name", "twitter:image:alt", SITE + "校徽"),
        ("itemprop", "name", title),
        ("itemprop", "description", description),
        ("itemprop", "image", IMAGE),
    ]
    block = [START, f"    <title>{html.escape(title)}</title>"]
    block += [
        f'    <meta {attribute}="{name}" content="{html.escape(value, quote=True)}">'
        for attribute, name, value in values
    ]
    block += [
        f'    <link rel="canonical" href="{url}">',
        f'    <link rel="image_src" href="{IMAGE}">',
        END,
    ]
    # Keep metadata in the initial HTML, ahead of scripts and style sheets.
    head = re.sub(r"\n[ \t]*\n+", "\n", head).strip()
    charset = re.search(r"<meta\b[^>]*charset[^>]*>", head, re.I)
    insert_at = charset.end() if charset else 0
    head = head[:insert_at] + "\n    " + "\n".join(block) + "\n" + head[insert_at:].lstrip()
    updated = source[:match.start(2)] + "\n" + head.rstrip() + "\n" + source[match.end(2):]
    if updated != path.read_text(encoding="utf-8"):
        path.write_text(updated, encoding="utf-8")
        return True
    return False


def main():
    pages = sorted(ROOT.rglob("*.html"))
    changed = sum(update_page(page) for page in pages)
    print(f"Updated sharing metadata: {changed}/{len(pages)} pages")


if __name__ == "__main__":
    main()
