# 603web与鹿群小站

603寝室与鹿群的静态网站合集，包含互动首页、沉浸式寝室博客、群内百科、趣味编码工具和KunCode产品官网。所有站点由`Deer603/Deer603.github.io`统一托管，通过GitHub Pages发布。

[![GitHub Pages](https://img.shields.io/badge/hosting-GitHub%20Pages-2563eb?style=flat-square)](#发布到github-pages)
[![纯静态网站](https://img.shields.io/badge/site-HTML%20%2F%20CSS%20%2F%20JavaScript-555555?style=flat-square)](#本地预览)
[![最近更新](https://img.shields.io/github/last-commit/Deer603/Deer603.github.io?style=flat-square)](https://github.com/Deer603/Deer603.github.io/commits/main/)

[站点导航](#站点导航) · [本地预览](#本地预览) · [Pages发布](#发布到github-pages) · [目录与维护](#目录与维护)

## 站点导航

按下文启用Pages并完成发布后，首页和四个子站使用以下地址：

| 站点 | 内容 | 访问地址 | 说明 |
| --- | --- | --- | --- |
| 603web | 寝室概况、论坛、小卖部和查寝通报 | [deer603.github.io](https://deer603.github.io/) | [首页功能](#603web首页) |
| 青蛙的角落 | 六人寝室场景、青蛙角色与摄影相册 | [deer603.github.io/room/](https://deer603.github.io/room/) | [子站README](room/README.md) |
| 魏鸡百科 | 鹿群主题百科、词条检索与文章阅读 | [deer603.github.io/weijiba/](https://deer603.github.io/weijiba/) | [子站README](weijiba/README.md) |
| 加密鹿 | 将文字转换为鹿群符号，并使用相同密钥还原，两秒内逐字输出结果 | [deer603.github.io/codec/](https://deer603.github.io/codec/) | [子站README](codec/README.md) |
| KunCode | KunCode项目介绍与下载入口 | [deer603.github.io/kuncode/](https://deer603.github.io/kuncode/) | [子站README](kuncode/README.md) |

首页使用根路径，四个子站使用`room/`、`weijiba/`、`codec/`和`kuncode/`，共用仓库根目录的发布源。子站入口目录统一使用小写；魏鸡百科的词条继续使用各自的中文目录。

## 本地预览

所有页面都是静态文件，无需安装Node.js依赖或执行构建。安装Python3后，在仓库根目录运行：

```sh
python -m http.server 8000 --bind 127.0.0.1
```

如果本机使用`python3`命令，将上面的`python`替换为`python3`即可。

| 页面 | 本地地址 |
| --- | --- |
| 603web首页 | [打开首页](http://127.0.0.1:8000/) |
| 青蛙的角落 | [打开寝室博客](http://127.0.0.1:8000/room/) |
| 魏鸡百科 | [打开魏鸡百科](http://127.0.0.1:8000/weijiba/) |
| 加密鹿 | [打开加密鹿](http://127.0.0.1:8000/codec/) |
| KunCode官网 | [打开KunCode](http://127.0.0.1:8000/kuncode/) |

建议从根目录启动服务，便于同时预览首页、子站和文章链接。`room/`使用ES Modules，必须通过HTTP访问；也可单独运行`python room/serve.py`，打开`http://127.0.0.1:8765/`。

## 603web首页

- 寝室概况：查看室友资料、首页视觉和轮播标语。
- 寝室论坛：浏览预置帖子、发布帖子和回复，发布帖子消耗注意力点数。
- 603小卖部：领取每日生活费，使用鹿币购买物品，并受限购数量约束。
- 查寝通报：提交线索、查看档案和日志，推进解密进度；达到100%后可查看完整关系网。

点数、鹿币、帖子、购买记录和解密进度保存在当前浏览器的`localStorage`中，刷新后可以恢复。论坛和商店交互由前端在本地模拟；页脚的重置按钮会清除该浏览器保存的进度。

## 发布到GitHub Pages

本仓库使用账号站点仓库名`Deer603.github.io`，发布源应选仓库根目录。首页与四个子站一起发布，无需为子站分别配置Pages。

1. 将需要发布的文件提交并推送到`Deer603/Deer603.github.io`的`main`分支。
2. 打开仓库的`Settings`→`Pages`。
3. 在`Build and deployment`中，将`Source`设为`Deploy from a branch`。
4. 将分支设为`main`，目录设为`/(root)`，点击`Save`。
5. 等待Pages部署完成，再使用上方站点导航中的地址访问。

目录选择`/(root)`，才能同时发布根目录的`index.html`及`room/`、`weijiba/`、`codec/`、`kuncode/`。操作说明见[GitHub Pages官方文档](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)。

## 目录与维护

```text
.
├── index.html             # 603web首页与交互脚本
├── css/                   # 首页样式
├── assets/                # 首页图片
├── room/                  # 青蛙的角落与寝室博客
├── weijiba/               # 魏鸡百科与词条页面
├── codec/                 # 加密鹿
├── kuncode/               # KunCode静态官网
├── tools/                 # 分享元信息与图片维护工具
└── docs/                  # 分享与维护说明
```

| 修改内容 | 编辑位置 |
| --- | --- |
| 首页文字与交互 | [index.html](index.html) |
| 首页布局与配色 | [css/style.css](css/style.css)、[css/interactions.css](css/interactions.css) |
| 首页图片 | [assets/](assets/) |
| 寝室场景、角色与摄影相册 | [room/README.md](room/README.md)中的维护说明 |
| 魏鸡百科内容与导航 | [weijiba/README.md](weijiba/README.md)中的文件说明 |
| 加密鹿界面与转换逻辑 | [codec/README.md](codec/README.md)中的文件说明 |
| KunCode介绍、链接与下载入口 | [kuncode/README.md](kuncode/README.md)中的维护说明 |

维护时注意以下约定：

- 路径与目录名保持大小写一致，资源使用与所在子站匹配的相对路径。
- 菜单、箭头、搜索等界面图标优先使用SVG，并显式设置尺寸和对齐；品牌图片与内容插图保留原素材。
- 站点自身的`canonical`、`og:url`、`og:image`和`twitter:image`使用当前Pages地址及对应的小写子目录。
- 应用源码、发行下载和其他外部项目链接指向实际来源，官网迁移不代表应用仓库迁移。

603web、魏鸡百科、加密鹿和KunCode已提供横版分享封面、方形缩略图与静态分享元信息。修改这些站点的分享文案或百科词条数据后，在仓库根目录运行`node tools/share-metadata.mjs`。当前脚本不包含`room/`，图片位置与微信分享说明见[网站分享信息](docs/sharing.md)。

## 素材与许可

当前仓库未附统一的LICENSE文件。首页图片位于`assets/`，各子站素材保留在对应目录中。`room/`的摄影、音效、字体与第三方库授权见其[素材与授权](room/README.md#素材与授权)；KunCode应用许可见其[产品来源](kuncode/README.md#产品来源)。
