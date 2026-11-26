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

访问[本地百科](http://127.0.0.1:8000/weijiba/)。词条通过独立中文目录访问，例如`/weijiba/困困/`和`/weijiba/鹿群/`。页面无需后端和构建过程。

## 主要功能

- 首页分类、特色条目、动态与词条索引。
- 中文词条路径，旧的`article.html?entry=...`入口规范到对应目录。
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
|[focus-scope.js](focus-scope.js)|抽屉与弹窗的焦点范围管理|
|各中文词条目录|可直接访问的静态词条页面|
|[tools/refresh-entry-pages.mjs](tools/refresh-entry-pages.mjs)|生成正文和目录、同步共享资源与分享信息|

新增或修改词条时，先维护数据。新增词条另需登记路由，然后从仓库根目录运行：

```sh
node weijiba/tools/refresh-entry-pages.mjs
```

脚本根据当前词库同步每个有效词条的正文、目录、共享样式与脚本引用，并补充缺失入口，最后更新分享信息。正文应在数据文件中维护，直接编辑生成页的正文会在下次同步时被覆盖。移除词条时同步删除数据、路由和首页引用，并删除该词条的目录及专属分享图。

普通词条页只加载路由与阅读交互，不加载完整词库；旧式`article.html?entry=...`兼容入口仍保留动态渲染所需数据。修改外围模板时，按需同步已有页面的外围结构。

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
