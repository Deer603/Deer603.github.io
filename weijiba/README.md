<p align="center"><img src="assets/weijiba-logo.png" width="160" alt="魏鸡百科图标"></p>

# 魏鸡百科

以鹿群资料为素材的静态戏仿百科，收录群内人物、趣事、术语和科技话题。通过分类、搜索与词条链接，把零散内容组织成可以连续阅读的知识站。

[![网页入口](https://img.shields.io/badge/网页-weijiba-2563eb?style=flat-square)](https://deer603.github.io/weijiba/)
[![运行方式](https://img.shields.io/badge/运行-静态网站-555555?style=flat-square)](#本地预览)
[![GitHub Stars](https://img.shields.io/github/stars/Deer603/Deer603.github.io?style=flat-square)](https://github.com/Deer603/Deer603.github.io/stargazers)

[访问百科](https://deer603.github.io/weijiba/) · [本地预览](#本地预览) · [内容维护](#内容维护) · [返回站点导航](../README.md#站点导航)

## 本地预览

在仓库根目录运行：

```sh
python -m http.server 8000 --bind 127.0.0.1
```

访问[本地百科](http://127.0.0.1:8000/weijiba/)即可浏览仓库中的静态页面。首次访问无语言前缀的首页或词条时，网站按浏览器的首选语言选择版本。读者也可以用“语言”菜单切换，网站会记住选择。

三个语言版本各有固定网址。例如困困词条可以从[简体中文](https://deer603.github.io/weijiba/zh-cn/困困/)、[繁體中文](https://deer603.github.io/weijiba/zh-tw/困困/)或[English](https://deer603.github.io/weijiba/en/困困/)进入。

## 主要功能

- 首页分类、特色条目、动态与词条索引。
- 三语首页和词条，旧的`article.html?entry=...`入口跳转至对应词条。
- “分享词条”提供当前语言的正式网址。分享平台可从静态HTML读取该语言的标题、简介和带“魏”字的地球缩略图。
- 词条正文和目录直接写入静态HTML，普通词条页无需下载完整词库即可阅读。
- 目录、正文与外观设置的阅读布局，正文可链接到相关人物和概念。
- 本地搜索、随机条目、手机导航抽屉与信息弹窗。
- 抽屉和弹窗打开时限制键盘焦点范围，关闭后恢复原来的操作位置。
- 文本大小、页面宽度以及自动/浅色/深色外观，设置保存在浏览器本地。

登录、编辑、查看源代码和页面历史等入口属于演示，不会向百科后台提交内容。新增或修改词条需要编辑仓库文件。

词条索引收录有聊天档案、公开报道或项目资料可查的鹿群人物、用语、事件与项目。

## 内容维护

|文件或目录|用途|
|---|---|
|[index.html](index.html)|首页内容与导航|
|[style.css](style.css)、[script.js](script.js)|首页样式和交互|
|[article.html](article.html)、[article.css](article.css)、[article.js](article.js)|词条模板、样式和渲染|
|[entry-routes.js](entry-routes.js)|数据键与中文路径映射|
|[entry-data.js](entry-data.js)|人物、专题、项目与群史数据|
|[entry-writing.js](entry-writing.js)|鹿群人物与出处|
|[entry-en.js](entry-en.js)|词条标题、正文、参考资料及外链名称的英文译文|
|[home-i18n.js](home-i18n.js)、[article-ui-en.js](article-ui-en.js)|首页、搜索与词条界面的英文文案|
|[focus-scope.js](focus-scope.js)|抽屉与弹窗的焦点范围管理|
|各词条目录、`zh-cn/`、`zh-tw/`和`en/`|自动选择语言的入口和三个固定语言版本|
|[tools/refresh-entry-pages.mjs](tools/refresh-entry-pages.mjs)|生成正文和目录、同步共享资源与分享信息|

首次构建时，从仓库根目录安装工具依赖。

```sh
pnpm --dir weijiba/tools install --frozen-lockfile
```

新增或修改词条时，先维护简体正文和对应英文译文。繁体版由OpenCC转换。新增词条还需登记路由。完成后在仓库根目录运行以下命令，同步三语首页、词条和分享信息。

```sh
node weijiba/tools/refresh-entry-pages.mjs
```

脚本根据当前词库重新生成每篇词条的正文、目录和分享信息。请在源数据中维护正文，直接编辑生成页的改动会在下次同步时被覆盖。移除词条时，删除源数据、对应译文、路由和首页引用，同时删除原词条目录及三个语言目录下的对应页面。

普通词条页直接提供所选语言的正文。修改模板后，重新运行上述生成命令即可同步各版本。

只更新分享标题、简介和规范地址时，在根目录运行`node tools/share-metadata.mjs`。相关说明见[网站分享信息](../docs/sharing.md)。

## 内容约定

资料来自群聊及相关整理，保留原有语境，区分记录、转述、玩笑和虚构设定。

- 引用聊天原话时标注日期；虚构对白与说明性例子不归给真实人物。
- 公众号资料注明发布方与阅读笔记性质。
- 不将原始聊天导出复制进公开仓库。
- 新词条应对应可说明的主题。别名可指向现有条目，同一事件的材料集中在一处。
- 在相关段落标出参考资料编号。公开项目可链接项目文档、发行页与许可证。

## 发布与路径

使用仓库根目录作为Pages发布源，步骤见[根README](../README.md#发布到github-pages)。词条路由依赖`/weijiba/`路径；若更名，需要同步`entry-routes.js`和页面入口。

本站是群内戏仿知识站，外观参考中文维基百科，与维基百科的内容及后台独立。
