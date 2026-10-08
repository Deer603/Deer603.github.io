# 青蛙的角落

以六人寝室为入口的沉浸式创意博客。切换床位，进入舍友的个人空间，翻阅摄影与故事；当前开放魏子奇（青蛙）的内容，其他角色保留未解锁状态。网站使用原生HTML、CSS与JavaScript，无需后端或构建。

[![GitHub Pages](https://img.shields.io/badge/hosting-GitHub%20Pages-527565?style=flat-square)](https://deer603.github.io/room/)
[![ES Modules](https://img.shields.io/badge/runtime-ES%20Modules-555555?style=flat-square)](#本地预览)
[![静态网站](https://img.shields.io/badge/site-HTML%20%2F%20CSS%20%2F%20JavaScript-527565?style=flat-square)](index.html)

[站点入口](https://deer603.github.io/room/) · [本地预览](#本地预览) · [主要功能](#主要功能) · [内容维护](#内容维护) · [返回站点导航](../README.md#站点导航)

## 本地预览

安装Python3后，在仓库根目录运行：

```sh
python -m http.server 8000 --bind 127.0.0.1
```

打开[本地寝室博客](http://127.0.0.1:8000/room/)。网站使用ES Modules，需要通过HTTP访问，不能直接双击`index.html`预览。

只预览此子站时，也可在仓库根目录运行：

```sh
python room/serve.py
```

然后打开[独立预览](http://127.0.0.1:8765/)。该脚本固定从自身所在目录提供文件；若本机使用`python3`命令，将`python`替换为`python3`即可。

## 主要功能

- 寝室入口：固定视角的上床下桌场景，支持床位切换与角色入口。
- 青蛙空间：从寝室进入魏子奇的个人内容，并可返回寝室。
- 摄影相册：展示12张摄影作品，包含翻页过渡与分章节内容。
- 声音体验：提供音效与声音开关，配合场景切换和相册阅读。
- 多端浏览：适配电脑与手机；桌面更适合欣赏场景和相册细节。

## 浏览器要求

使用支持ES Modules的新版Chrome、Edge、Safari或Firefox。浏览器不支持WebGL2时，相册使用直接换页方式。

## 内容维护

| 文件或目录 | 用途 |
| --- | --- |
| [index.html](index.html) | 页面入口、寝室基础结构与模块加载 |
| [shell/](shell/) | 寝室场景、床位切换、通用界面、音频与过渡 |
| [characters/registry.js](characters/registry.js) | 角色登记与开放状态 |
| [characters/frog/content.js](characters/frog/content.js) | 青蛙相册内容、作品信息与外部作品集链接 |
| [characters/frog/scenes/](characters/frog/scenes/) | 青蛙空间与相册场景逻辑 |
| [characters/frog/assets/](characters/frog/assets/) | 摄影、相册页面、音效与字体 |
| [characters/penguin/](characters/penguin/) | 尚未开放的企鹅角色素材与内容 |
| [vendor/](vendor/) | 本地第三方库 |
| [serve.py](serve.py) | 端口8765的独立预览服务 |

修改作品标题和章节时编辑`characters/frog/content.js`；修改寝室布局与场景表现时编辑`shell/`。摄影原图与相册页分开存放，替换作品时注意同步相应展示资源。

## Pages发布

此目录随`Deer603/Deer603.github.io`发布，访问路径为`/room/`。按照[根README的Pages发布说明](../README.md#发布到github-pages)，使用`main`分支的`/(root)`作为发布源。

站内资源使用相对路径，可将整个目录部署到其他静态托管服务。首页文件为`index.html`，运行所需字体与第三方库已放在目录内；作者作品集链接继续指向其实际来源。

## 素材与授权

- 12张摄影作品版权归作者魏子奇（KEMA）所有。
- 音效来源见[素材来源说明](characters/frog/assets/CREDITS.md)。
- GSAP、Howler等第三方库的许可见`vendor/`中的各自文件。
- Noto Sans SC、Noto Serif SC与霞鹜文楷使用SIL Open Font License1.1，许可文件位于[字体目录](characters/frog/assets/fonts/)。
