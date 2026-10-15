# 夏炜城作品集

拓竹全栈工程师夏炜城的个人作品集，展示软件、智能硬件、机器人与AI方向的项目案例，以及个人摄影、生活兴趣与经历。当前目录是Next.js生成的静态导出内容，可直接用于静态托管。

[![网页入口](https://img.shields.io/badge/网页-xiaweicheng-1d1d1f?style=flat-square)](https://deer603.github.io/xiaweicheng/)
[![导出方式](https://img.shields.io/badge/页面-Next.js静态导出-555555?style=flat-square)](#维护方式)
[![素材说明](https://img.shields.io/badge/内容-项目与摄影-1d1d1f?style=flat-square)](assets/README.md)

[查看作品集](https://deer603.github.io/xiaweicheng/) · [本地预览](#本地预览) · [维护方式](#维护方式) · [返回站点导航](../README.md#站点导航)

## 本地预览

在仓库根目录运行：

```sh
python -m http.server 8000 --bind 127.0.0.1
```

访问[本地作品集](http://127.0.0.1:8000/xiaweicheng/)。页面资源使用`/xiaweicheng/`开头的路径，应从仓库根目录提供服务，而不是把此目录直接作为服务器根目录。

当前目录不包含Next.js源工程与构建配置，预览现有导出文件无需运行`npm install`或构建命令。

## 页面内容

- 个人介绍、能力方向与联系方式，首屏配有大幅个人照；桌面左右分栏，手机按标题、照片和简介排列。
- 旅行、摄影、生活兴趣和校园经历。
- RoboMaster功率控制板、智能泡茶机与LensPilot AI三个项目案例。
- 项目背景、职责、方案、原型与复盘内容。

|项目|本地页面|
|---|---|
|RoboMaster功率控制板|[查看案例](projects/robomaster-power-control/index.html)|
|智能泡茶机|[查看案例](projects/smart-tea-machine/index.html)|
|LensPilot AI摄影助手|[查看案例](projects/ai-photography-assistant/index.html)|

项目页混合使用实物照片、工程图、渲染图和概念图。素材类型与替换入口见[素材说明](assets/README.md)。概念界面用于介绍方案，不代表对应产品功能已经上线。

## 维护方式

|文件或目录|用途|
|---|---|
|[index.html](index.html)|首页导出文件|
|[hero-portrait.css](hero-portrait.css)|首页人物照、两栏布局与手机适配，由共享CSS引入|
|[assets/xia-weicheng-portrait.png](assets/xia-weicheng-portrait.png)|首页个人照原图，保留原始比例|
|[lightbox-accessibility.js](lightbox-accessibility.js)|图片预览的Esc关闭、焦点限制与关闭后焦点恢复|
|[projects/](projects/)|三个项目的案例页面|
|`_next/`|导出页面使用的JavaScript与CSS|
|[assets/](assets/)|项目图片、摄影与下载素材|
|`index.txt`、`__next.*.txt`|导出生成的路由与页面数据|
|`404.html`、`404/`、`_not-found/`|导出的未找到页面资源|

日常替换图片可沿用已有文件名和尺寸。修改页面结构、交互或项目正文时，应在原始Next.js工程完成后重新导出，并同步HTML、`_next/`和路由数据，避免只改HTML后被客户端内容覆盖。

首页个人照已同步到HTML、内联页面数据和独立路由数据。重新导出时，应将照片布局纳入源工程，保留头像样式引用，并在首页和三个项目页保留`lightbox-accessibility.js`入口。该脚本增强现有图片预览，不替换React维护的页面内容。

重新导出后，在仓库根目录运行以下命令，同步首页与项目页的分享标题、简介、封面和规范地址：

```sh
node tools/share-metadata.mjs
```

分享文案与封面的维护入口见[网站分享信息](../docs/sharing.md)。

保留`/xiaweicheng/`路径与`.nojekyll`。如果迁移到其他目录，需要在原始工程中修改对应路径配置并重新导出。

## 待替换入口

简历下载当前指向[resume-pdf-placeholder.txt](assets/resume-pdf-placeholder.txt)，微信二维码仍为页面占位区域。补充真实简历、二维码和个人链接后，应同时更新入口与展示文案。

## 发布与素材

按[根README](../README.md#发布到github-pages)从整个仓库发布。摄影、个人资料与项目素材按其各自来源维护，不沿用框架许可作为素材授权。
