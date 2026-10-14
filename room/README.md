# 青蛙的角落

以六人寝室为入口的摄影与故事博客。切换床位、走进角色空间，再翻阅相册；当前开放青蛙的内容，其他角色保留未解锁状态。

[![网页入口](https://img.shields.io/badge/网页-room-527565?style=flat-square)](https://deer603.github.io/room/)
[![模块](https://img.shields.io/badge/脚本-ES_Modules-555555?style=flat-square)](#本地预览)
[![静态网站](https://img.shields.io/badge/运行-静态网站-527565?style=flat-square)](index.html)

[站点入口](https://deer603.github.io/room/) · [本地预览](#本地预览) · [内容维护](#内容维护) · [返回站点导航](../README.md#站点导航)

## 本地预览

安装Python3后，在仓库根目录运行：

```sh
python -m http.server 8000 --bind 127.0.0.1
```

访问[本地寝室博客](http://127.0.0.1:8000/room/)。页面使用ES Modules，需要HTTP服务，无需安装前端依赖。

只预览此子站时，可从仓库根目录运行：

```sh
python room/serve.py
```

然后访问[独立预览地址](http://127.0.0.1:8765/)。该脚本始终从`room/`提供文件，端口固定为8765。

## 主要功能

- 固定视角的六人寝室场景，可切换床位并查看角色入口。
- 青蛙角色空间与返回寝室的场景过渡。
- 12张摄影作品，按章节组织，配有翻页效果与作品信息。
- 场景音效、翻页声音与声音开关。
- 电脑与手机布局；浏览器不支持WebGL2时，相册使用直接换页方式。

使用支持ES Modules的现代浏览器。桌面视野更适合查看寝室场景与相册细节。

## 内容维护

|文件或目录|用途|
|---|---|
|[index.html](index.html)|页面入口与模块加载|
|[shell/](shell/)|寝室布局、床位切换、音频与场景过渡|
|[characters/registry.js](characters/registry.js)|角色登记、床位位置与开放状态|
|[characters/frog/content.js](characters/frog/content.js)|摄影标题、章节、作品信息与外部链接|
|[characters/frog/scenes/](characters/frog/scenes/)|青蛙空间与相册逻辑|
|[characters/frog/assets/](characters/frog/assets/)|摄影、相册页、音效与字体|
|[characters/penguin/](characters/penguin/)|未开放角色的内容与素材|
|[vendor/](vendor/)|本地第三方库|

修改作品文字编辑`content.js`；修改房间与切换方式编辑`shell/`。摄影原图和相册展示页分别存放，替换作品时同步对应资源。增加角色时，在`registry.js`登记模块、床位与素材。

## 发布与素材

子站使用`/room/`路径，随仓库根目录发布，步骤见[根README](../README.md#发布到github-pages)。运行所需第三方库和字体位于本目录，摄影作品集链接保留原作者的外部地址。

## 素材与授权

- 摄影作品归魏子奇（KEMA）所有。
- 音效来源与许可见[素材来源](characters/frog/assets/CREDITS.md)。
- GSAP、Howler等库的许可保存在[vendor/](vendor/)。
- 字体及许可文件见[字体目录](characters/frog/assets/fonts/)，包括Noto Sans SC、Noto Serif SC与霞鹜文楷。
