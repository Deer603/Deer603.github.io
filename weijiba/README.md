<p align="center">
  <img src="assets/weijiba-logo.png" width="160" alt="魏鸡百科，困困的百科全书">
</p>

# 魏鸡百科

困困的百科全书：以鹿群资料为素材，记录群内人物、趣事、术语和科技话题的静态戏仿百科。

[![GitHub Pages](https://img.shields.io/badge/GitHub_Pages-weijiba-2563eb?style=flat-square)](https://deer603.github.io/weijiba/)
[![运行方式](https://img.shields.io/badge/platform-browser-555555?style=flat-square)](#快速开始)
[![GitHub Stars](https://img.shields.io/github/stars/Deer603/Deer603.github.io?style=flat-square)](https://github.com/Deer603/Deer603.github.io/stargazers)

[站点入口](https://deer603.github.io/weijiba/) · [快速开始](#快速开始) · [主要功能](#主要功能) · [内容维护](#内容维护) · [返回站点导航](../README.md#站点导航)

## 快速开始

子站位于`weijiba/`，词条入口放在其下的独立中文目录。日常浏览使用现代浏览器即可；本地预览需要Python，无需安装前端依赖或执行构建。

在`Deer603.github.io`仓库根目录执行：

```sh
python -m http.server 8000 --bind 127.0.0.1
```

打开[本地首页](http://127.0.0.1:8000/weijiba/)。词条使用独立中文目录，例如`/weijiba/困困/`和`/weijiba/鹿群/`；通过HTTP服务浏览可保留与线上一致的路径。

## 主要功能

- 百科首页：侧栏导航、分类索引、特色条目、新闻动态和基础词条索引，外观参考中文维基百科的页面层级。
- 中文词条路径：人物、群体、术语、科技话题和群史可直接通过各自目录访问；旧的`article.html?entry=...`地址自动规范到对应词条路径。
- 词条阅读：目录、正文、外观三栏布局，正文中的人物与概念会补充站内链接，便于继续阅读相关条目。
- 个性化外观：支持小/标准/大文本、标准/宽页面和自动/浅色/深色模式，设置保存在浏览器本地。
- 轻量交互：本地搜索、随机条目、导航抽屉和信息弹窗，无需百科后台。
- 响应式页面：首页和词条页适配桌面、平板与手机；窄屏使用导航抽屉，菜单、搜索等功能图标采用SVG，保持尺寸与对齐一致。

账号、登录、编辑、查看源代码和页面历史入口为本地演示，不会提交内容。补充词条需要修改仓库中的文件。

## GitHub Pages发布

按照[仓库首页的发布说明](../README.md#发布到github-pages)，从`main`分支的仓库根目录发布。`weijiba/`是站点子目录，首页为`weijiba/index.html`，无需单独创建Pages仓库或选择子目录作为发布源。

保留`weijiba/`目录名。词条路由通过`/weijiba/`定位站点根路径；若以后重命名目录，应同时调整`entry-routes.js`中的路径逻辑。

## 内容维护

首页内容与词条正文分开维护，共用页面样式和脚本：

| 文件或目录 | 用途 |
| --- | --- |
| [index.html](index.html) | 首页模块、导航和特色内容 |
| [style.css](style.css)、[script.js](script.js) | 首页样式与交互 |
| [article.html](article.html)、[article.css](article.css)、[article.js](article.js) | 词条页面模板、样式和渲染逻辑 |
| [entry-routes.js](entry-routes.js) | 词条数据键与中文路径的映射 |
| [entry-data.js](entry-data.js) | 人物、专题和词条数据 |
| [entry-writing.js](entry-writing.js) | 概念释义、主题补充、拓展体裁和聊天摘录 |
| 各中文词条目录 | 可直接访问的静态词条页面 |
| `assets/` | 站点品牌图、项目标识与图标 |
| [tools/refresh-entry-pages.mjs](tools/refresh-entry-pages.mjs) | 同步词条页面的共享资源引用，并补充缺失的已登记页面 |

维护脚本需要Node.js。在仓库根目录执行：

```sh
node weijiba/tools/refresh-entry-pages.mjs
```

该脚本依据`entry-routes.js`中的登记补充缺失页面，并同步共享样式与脚本引用；不会删除旧路径或覆盖已有正文。修改词条路径或调整共享资源版本时使用，普通文字修改无需每次运行。

新增词条时，先补充词条数据与路由登记，再运行维护脚本生成入口。新页面使用`article.html`模板；调整模板结构或SVG图标后，已有词条页面需要同步相应结构，维护脚本不会自动替换已有正文。

各词条的分享标题、简介和规范地址会写入静态HTML，共用百科分享封面与方形缩略图。只需同步分享信息时，在仓库根目录运行`node tools/share-metadata.mjs`，详见[网站分享信息](../docs/sharing.md)。

### 资料与编写约定

内容根据鹿群聊天导出、人物语言风格报告、群聊话题报告和科技话题报告二次编写。人物条目围绕群聊中可观察的称呼、表达与互动语境展开，群内玩笑和设定不作为现实身份判断。

- 聊天原话标注日期；虚构机构、拟人对白与说明性例子不归给真实人物。
- 公众号资料按阅读笔记和发布方自述标注，保留内容的来源语境。
- 原始聊天导出不复制进仓库；技术概念需要出处时，在词条的外部入口补充原始资料链接。
- 基础名词与手册、档案、问答等趣味拓展分别编写，拓展入口保留在对应基础词条末尾。

魏鸡百科是非官方的群内戏仿知识站，界面参考中文维基百科，内容与其百科后台独立。
