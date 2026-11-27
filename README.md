# 603web与鹿群小站

从603寝室主页进入鹿群的摄影相册、三语百科、趣味工具、应用官网和个人作品集。各站点共用这个GitHub Pages仓库。

[![站点入口](https://img.shields.io/badge/网站-deer603.github.io-0071e3?style=flat-square)](https://deer603.github.io/)
[![静态托管](https://img.shields.io/badge/托管-GitHub_Pages-555555?style=flat-square)](#发布到github-pages)
[![最近更新](https://img.shields.io/github/last-commit/Deer603/Deer603.github.io?style=flat-square)](https://github.com/Deer603/Deer603.github.io/commits/main/)
[![GitHub Stars](https://img.shields.io/github/stars/Deer603/Deer603.github.io?style=flat-square)](https://github.com/Deer603/Deer603.github.io/stargazers)

[站点导航](#站点导航) · [本地预览](#本地预览) · [维护入口](#目录与维护) · [发布说明](#发布到github-pages)

## 站点导航

| 站点 | 网页入口 | 可以做什么 | 使用与维护 |
| --- | --- | --- | --- |
| 603web | [站点首页](https://deer603.github.io/) | 认识室友、逛论坛和小卖部、查通报解谜 | [首页功能](#603web首页) |
| 青蛙的角落 | [/room/](https://deer603.github.io/room/) | 走进六人寝室，浏览角色空间和摄影相册 | [项目说明](room/README.md) |
| 魏鸡百科 | [/weijiba/](https://deer603.github.io/weijiba/) | 查阅鹿群人物、群内用语、事件和项目 | [项目说明](weijiba/README.md) |
| 加密鹿 | [/codec/](https://deer603.github.io/codec/) | 在文字与鹿群符号之间转换 | [项目说明](codec/README.md) |
| KunCode官网 | [/kuncode/](https://deer603.github.io/kuncode/) | 了解开源开发工作台和困困AI，获取桌面应用 | [项目说明](kuncode/README.md) |
| 603AI官网 | [/603ai/](https://deer603.github.io/603ai/) | 阅读角色介绍与语录，获取Android应用 | [项目说明](603ai/README.md) |
| 夏炜城作品集 | [/xiaweicheng/](https://deer603.github.io/xiaweicheng/) | 阅读智能硬件、机器人和AI项目案例，浏览摄影 | [项目说明](xiaweicheng/README.md) |
| 你是个鹿嘞 | [/urdeer/](https://deer603.github.io/urdeer/) | 用照片或摄像头查看两套模型的相似度排行 | [项目说明](urdeer/README.md) |
| 卓越鹿员学院 | [/hunauees/](https://deer603.github.io/hunauees/) | 浏览学院主题的鹿群文章、成员与创作 | [页面入口](hunauees/index.html) |
| 加入Deer603 | [/joinus/](https://deer603.github.io/joinus/) | 查看鹿文化传播大使的角色介绍和申请方式 | [页面入口](joinus/index.html) |

KunCode和603AI的应用源码、安装包及发行说明由各自的产品仓库维护，入口见对应子站README。

## 本地预览

安装Python3，在仓库根目录启动静态HTTP服务。

```sh
python -m http.server 8000 --bind 127.0.0.1
```

打开[本地首页](http://127.0.0.1:8000/)。预览子站时，在本地地址后加上表中的路径，例如[魏鸡百科](http://127.0.0.1:8000/weijiba/)或[加密鹿](http://127.0.0.1:8000/codec/)。使用`python3`命令的系统可将命令里的`python`替换为`python3`。

青蛙的角落和加密鹿分别使用ES Modules和Web Worker，通过HTTP打开。夏炜城作品集的静态资源以`/xiaweicheng/`为基准，预览时从仓库根目录启动服务。“你是个鹿嘞”的摄像头功能需要HTTPS或localhost等浏览器认可的安全地址。

## 603web首页

- 寝室概况展示室友资料、首页视觉和轮播标语。
- 寝室论坛提供预置帖子，可以回复，也可以消耗注意力点数发帖。
- 603小卖部可以领取生活费，用鹿币购买限量物品。
- 查寝通报通过提交线索、查看档案和日志推进解谜。

论坛、商店和解谜进度保存在当前浏览器。发帖和回复仅当前浏览器可见，页面的重置功能会清除本机进度。

## 目录与维护

| 要修改的内容 | 对应文件或说明 |
| --- | --- |
| 603web首页文字与交互 | [index.html](index.html) |
| 603web首页样式 | [css/style.css](css/style.css)与[css/interactions.css](css/interactions.css) |
| 子站页面和内容 | [站点导航](#站点导航)中的子站说明 |
| 魏鸡百科正文和语言版本 | [词条维护](weijiba/README.md#内容维护) |
| 作品集图片与素材署名 | [素材说明](xiaweicheng/assets/README.md) |
| 分享图片、标题与规范网址 | [网站分享信息](docs/sharing.md) |

603web的原图位于[assets/](assets/)，网页使用[assets/optimized/](assets/optimized/)中的WebP展示图。替换原图后，在安装Pillow的Python环境中运行`python tools/optimize-site-images.py`，可重建首页展示图及KunCode品牌图标。

更新分享信息时，先安装百科生成工具的依赖，再从根目录运行统一脚本。脚本同步各站分享信息、作品集导航数据和百科多语言页面。学院子站由独立脚本维护，具体入口见[网站分享信息](docs/sharing.md)。

```sh
pnpm --dir weijiba/tools install --frozen-lockfile
node tools/share-metadata.mjs
```

## 发布到GitHub Pages

仓库的各子站共用`main`分支的`/(root)`作为发布源。准备好内容后，提交并推送修改，等待Pages部署完成，再从站点导航打开相应网址。

保留根目录的`.nojekyll`和`index.html`，以及各子站的目录大小写和入口路径。`.nojekyll`让静态导出的`_next/`等目录能随网站发布。[GitHub Pages发布源设置](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)

## 素材与授权

- 寝室场景、摄影、音效与第三方库的说明见[青蛙的角落](room/README.md#素材与授权)。
- 人脸匹配模型与运行库的许可见[第三方组件说明](urdeer/THIRD_PARTY_NOTICES.md)。部署前确认预设照片与特征数据的公开范围。
- 作品集照片、渲染图和概念图的来源见[素材说明](xiaweicheng/assets/README.md)。
- KunCode和603AI应用的许可由各自产品仓库维护。
