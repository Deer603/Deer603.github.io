<p align="center">
  <img src="favicon.svg" width="96" alt="夏炜城作品集图标">
</p>

# 夏炜城作品集

拓竹全栈工程师夏炜城的个人网站，展示机器人、智能硬件与AI项目，也收录摄影、兴趣与校园经历。

[![在线作品集](https://img.shields.io/badge/网站-在线作品集-1d1d1f?style=flat-square)](https://deer603.github.io/xiaweicheng/)
[![Next.js静态导出](https://img.shields.io/badge/Next.js-静态导出-555555?style=flat-square)](#维护方式)

[在线浏览](https://deer603.github.io/xiaweicheng/) · [本地预览](#本地预览) · [素材说明](assets/README.md) · [返回站点导航](../README.md#站点导航)

## 精选项目

|项目|案例内容|
|---|---|
|[RoboMaster步兵机器人电源与功率控制](https://deer603.github.io/xiaweicheng/projects/robomaster-power-control/)|机器人供电需求、功率路径、采样保护与控制板迭代|
|[智能泡茶机](https://deer603.github.io/xiaweicheng/projects/smart-tea-machine/)|用STM32连接传感器、执行器和联网模块，展示设备状态、控制流程和上电原型|
|[LensPilot AI摄影助手](https://deer603.github.io/xiaweicheng/projects/ai-photography-assistant/)|围绕照片、EXIF与拍摄目标设计分析、复盘和练习功能|

首页还提供[兴趣与摄影](https://deer603.github.io/xiaweicheng/#interests)、[校园实践](https://deer603.github.io/xiaweicheng/#campus)、[个人经历](https://deer603.github.io/xiaweicheng/#experience)和[联系方式](https://deer603.github.io/xiaweicheng/#contact)。项目中使用的实物照、工程图和概念图可在素材清单中查找。[项目素材清单](assets/README.md#项目素材)

## 本地预览

使用Python3在仓库根目录启动静态服务。仓库保存的是可直接浏览的Next.js导出文件，页面的绝对资源路径以`/xiaweicheng/`开头。

```sh
python -m http.server 8000 --bind 127.0.0.1
```

打开[本地作品集](http://127.0.0.1:8000/xiaweicheng/)或[本地精选项目](http://127.0.0.1:8000/xiaweicheng/#work)。

## 维护方式

1. 更新项目正文、布局或交互时，在原始Next.js工程修改并重新导出。将首页、项目页、`_next/`资源、`index.txt`、`__next.*.txt`路由数据和404页面作为同一批导出文件同步。
2. 更新图片时，按[素材说明](assets/README.md)维护文件名和图注。若更名，在原始工程中同步更新引用后重新导出。
3. 重新导出后，保留首页的个人照布局补充样式及首页、三个项目页的图片预览脚本。脚本支持Esc关闭预览、弹层内键盘导航和关闭后的焦点恢复。[人物照样式](hero-portrait.css) · [图片预览脚本](lightbox-accessibility.js)
4. 在仓库根目录运行分享信息脚本。首次运行先安装生成依赖。脚本会同步首页和项目页的静态元信息、内联数据与导航数据，首页的分享图使用[个人照](assets/xia-weicheng-portrait.png)。

```sh
pnpm --dir weijiba/tools install --frozen-lockfile
node tools/share-metadata.mjs
```

发布时保留`/xiaweicheng/`路径与仓库根目录的`.nojekyll`。迁移路径时在原始工程中更新路径配置，再重新导出。[GitHub Pages发布](../README.md#发布到github-pages) · [网站分享信息](../docs/sharing.md)

## 简历与联系入口

简历下载目前指向[占位文件](assets/resume-pdf-placeholder.txt)，微信二维码也保留占位区域。正式简历和二维码准备好后，在原始工程中同步更新下载地址、二维码图片及其说明。素材的使用授权以各资源来源为准。
