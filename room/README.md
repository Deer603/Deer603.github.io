<p align="center"><img src="favicon.svg" width="96" alt="青蛙的角落图标"></p>
<h1 align="center">青蛙的角落</h1>
<p align="center">从六人寝室走进青蛙的个人空间，翻阅魏子奇（KEMA）的摄影集《光的存档》。</p>

[![浏览网站](https://img.shields.io/badge/网页-青蛙的角落-527565?style=flat-square)](https://deer603.github.io/room/)
[![运行方式](https://img.shields.io/badge/运行-浏览器-555555?style=flat-square)](#本地预览)

[浏览指南](#浏览指南) · [本地预览](#本地预览) · [内容维护](#内容维护) · [返回站点导航](../README.md#站点导航)

## 浏览指南

1. 打开[青蛙的角落](https://deer603.github.io/room/)，点选青蛙进入人物介绍。也可以用场景里的箭头切换床位，查看另一个尚未开放的角色。
2. 点击相机或“按下快门”，进入散放相纸的桌面。点击相纸可查看单张作品，向下滚动会把相纸收成一本摄影集。
3. 翻页或点选章节标签浏览《光的存档》。左上角站名可返回寝室，页面提供音效开关。

摄影集有12张作品，分为“古建·香积寺”“双重曝光·书法”“人文·街拍”“展览·雕塑”四章。相册按当前位置准备相邻页面。浏览器缺少WebGL2时，相册可直接换页。[摄影师的作品集](https://kemakiko9566-design.github.io/photography-portfolio/)

## 本地预览

在仓库根目录使用Python3启动静态服务，然后打开[寝室博客预览](http://127.0.0.1:8000/room/)。页面通过HTTP加载ES模块，第三方库随仓库提供。

```sh
python -m http.server 8000 --bind 127.0.0.1
```

单独预览此子站时，可以改用`python room/serve.py`。脚本在本机的8765端口提供`room/`目录。[独立预览地址](http://127.0.0.1:8765/)

## 内容维护

| 文件或目录 | 用途 |
| --- | --- |
| [index.html](index.html)、[shell/](shell/) | 网页入口、寝室布局、床位切换、声音与过渡 |
| [characters/registry.js](characters/registry.js) | 角色模块、床位与开放状态 |
| [characters/frog/content.js](characters/frog/content.js) | 摄影作品、章节、跨页排布与图注链接 |
| [characters/frog/scenes/](characters/frog/scenes/)、[preload.js](characters/frog/preload.js) | 人物介绍、桌面、翻页及素材加载 |
| [characters/frog/assets/](characters/frog/assets/) | 摄影原图、展示图、相册页、音效与字体 |
| [characters/penguin/](characters/penguin/) | 企鹅床位的素材 |

更换作品时，在`content.js`中同步作品、章节和跨页排布，并更新对应的原图与展示资源。新增角色时，在`registry.js`登记床位、模块和开放状态。

子站随仓库发布至`/room/`。[发布到GitHub Pages](../README.md#发布到github-pages) · [分享信息维护](../docs/sharing.md)

## 素材与授权

- 摄影作品归魏子奇（KEMA）所有。[摄影作品集](https://kemakiko9566-design.github.io/photography-portfolio/)
- 纸张与翻页音效的来源及许可见[素材来源](characters/frog/assets/CREDITS.md)。
- Noto Sans SC、Noto Serif SC和霞鹜文楷的许可见[字体目录](characters/frog/assets/fonts/)。
- GSAP、Howler等第三方库的许可见[vendor/](vendor/)中各脚本的文件头。
