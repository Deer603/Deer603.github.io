# 603web与鹿群小站

603寝室与鹿群的网页合集：从寝室故事、摄影相册和群内百科，到趣味工具、应用官网与个人作品集。这个仓库保存网站页面和静态资源，由GitHub Pages统一托管。

[![站点入口](https://img.shields.io/badge/网站-deer603.github.io-0071e3?style=flat-square)](https://deer603.github.io/)
[![静态托管](https://img.shields.io/badge/托管-GitHub_Pages-555555?style=flat-square)](#发布到github-pages)
[![最近更新](https://img.shields.io/github/last-commit/Deer603/Deer603.github.io?style=flat-square)](https://github.com/Deer603/Deer603.github.io/commits/main/)
[![GitHub Stars](https://img.shields.io/github/stars/Deer603/Deer603.github.io?style=flat-square)](https://github.com/Deer603/Deer603.github.io/stargazers)

[站点导航](#站点导航) · [本地预览](#本地预览) · [目录与维护](#目录与维护) · [发布说明](#发布到github-pages)

## 站点导航

|站点|主要内容|网页入口|项目说明|
|---|---|---|---|
|603web|寝室概况、论坛、小卖部与查寝通报|[首页](https://deer603.github.io/)|[首页功能](#603web首页)|
|青蛙的角落|六人寝室场景、角色空间与摄影相册|[/room/](https://deer603.github.io/room/)|[README](room/README.md)|
|魏鸡百科|鹿群人物、趣事与术语的戏仿百科|[/weijiba/](https://deer603.github.io/weijiba/)|[README](weijiba/README.md)|
|加密鹿|文字与鹿群符号之间的趣味转换|[/codec/](https://deer603.github.io/codec/)|[README](codec/README.md)|
|KunCode官网|开发工作台介绍、困困AI展示与应用下载|[/kuncode/](https://deer603.github.io/kuncode/)|[README](kuncode/README.md)|
|603AI官网|角色介绍、语录展示与Android应用下载|[/603ai/](https://deer603.github.io/603ai/)|[README](603ai/README.md)|
|夏炜城作品集|智能硬件、机器人、AI产品与个人摄影|[/xiaweicheng/](https://deer603.github.io/xiaweicheng/)|[README](xiaweicheng/README.md)|
|XWC检测器|摄像头与照片的双模型匹配度排行|[/XWCRecognizer/](https://deer603.github.io/XWCRecognizer/)|[README](XWCRecognizer/README.md)|

上表对应仓库发布后的页面路径。应用源码与安装包由各自的产品仓库维护，入口见对应子站README。

## 本地预览

仓库内的页面可以直接由静态HTTP服务器提供，无需在仓库根目录安装前端依赖。安装Python3后，在根目录运行：

```sh
python -m http.server 8000 --bind 127.0.0.1
```

打开[本地首页](http://127.0.0.1:8000/)，在地址后添加上表中的子目录即可访问对应页面，例如[加密鹿](http://127.0.0.1:8000/codec/)和[XWC检测器](http://127.0.0.1:8000/XWCRecognizer/)。使用`python3`命令的系统可相应替换。

|项目|预览时需要注意|
|---|---|
|青蛙的角落|使用ES Modules，需要HTTP服务；也可从根目录运行`python room/serve.py`，使用端口8765。|
|夏炜城作品集|当前目录是Next.js静态导出文件，资源路径以`/xiaweicheng/`开头，应从仓库根目录启动服务。|
|XWC检测器|摄像头需要HTTPS或localhost等安全上下文；也可运行`node XWCRecognizer/serve.mjs 8766`单独预览。|

独立预览服务可能使用相同端口，同时启动时需选择不同端口。浏览器处理的数据与交互方式见各子站说明。

## 603web首页

- 寝室概况：室友资料、首页视觉和轮播标语。
- 寝室论坛：预置帖子、本地发帖与回复，发帖消耗注意力点数。
- 603小卖部：领取生活费、使用鹿币购买物品，并记录限购数量。
- 查寝通报：提交线索、查看档案与日志，推进解密进度。

点数、鹿币、帖子、购买记录和解密进度保存在当前浏览器的`localStorage`中。论坛与商店由前端模拟，不会把本地发帖同步给其他访问者；页面重置操作会清除当前浏览器保存的进度。

## 目录与维护

```text
.
├── index.html       # 603web首页与交互
├── css/             # 首页样式
├── assets/          # 首页图片与分享素材
├── room/            # 寝室场景与摄影博客
├── weijiba/         # 百科首页与中文词条
├── codec/           # 加密鹿
├── kuncode/         # KunCode官网
├── 603ai/           # 603AI官网
├── xiaweicheng/     # 个人作品集静态导出文件
├── XWCRecognizer/   # 双模型匹配工具、模型与预设库
├── tools/           # 站点维护脚本
└── docs/            # 分享信息等维护说明
```

首页文字和交互编辑[index.html](index.html)，配色与布局编辑[css/style.css](css/style.css)及[css/interactions.css](css/interactions.css)。子站的文件入口、内容配置和素材说明放在各自README中。

维护时保持目录大小写与链接完全一致：加密鹿使用`codec/`，XWC检测器使用`XWCRecognizer/`。不要创建仅大小写不同的重复目录。保留根目录的`.nojekyll`，避免静态导出中的`_next/`等目录被Jekyll规则忽略。

### 分享信息

根首页、加密鹿、魏鸡百科和KunCode的分享元信息由同一个脚本维护。在根目录运行：

```sh
node tools/share-metadata.mjs
```

该命令更新这四个站点及百科词条的分享信息，不覆盖其他子站。分享图片、文案配置与微信卡片说明见[网站分享信息](docs/sharing.md)。百科词条入口的维护命令另见[魏鸡百科README](weijiba/README.md#内容维护)。

## 发布到GitHub Pages

所有子站共用仓库根目录作为发布源，无需分别创建Pages仓库。

1. 将准备发布的修改提交并推送到`Deer603/Deer603.github.io`。
2. 在仓库Pages设置中使用`main`分支的`/(root)`作为发布源。
3. 等待部署完成后，使用站点导航中的地址访问。

根目录保留首页`index.html`，各子站保留自己的入口与相对路径。配置方法见[GitHub Pages官方文档](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)。

## 素材与许可

仓库未提供统一的项目LICENSE。第三方代码的许可不自动覆盖人物照片、摄影作品、品牌素材或整个网站。

- 寝室博客的摄影、字体、音效与第三方库见[素材与授权](room/README.md#素材与授权)。
- XWC检测器的模型与运行库见[第三方组件说明](XWCRecognizer/THIRD_PARTY_NOTICES.md)。其预设照片和特征随静态文件提供，公开部署前应确认这部分资料的发布范围。
- 作品集素材中的实物图、渲染图和概念图见[素材说明](xiaweicheng/assets/README.md)。
- KunCode和603AI应用的源码、发行信息与许可由各自产品仓库维护。
