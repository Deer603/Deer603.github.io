<p align="center"><img src="assets/weijiba-globe-320.webp" width="112" alt="魏鸡百科拼图地球"></p>

# 魏鸡百科

困困的百科全书。收录鹿群的人物、用语、事件和科技项目，给相关说法和故事保留可查的出处。

[![网页入口](https://img.shields.io/badge/网页-魏鸡百科-2563eb?style=flat-square)](https://deer603.github.io/weijiba/)
[![语言版本](https://img.shields.io/badge/语言-简体中文%20%7C%20繁體中文%20%7C%20English-555555?style=flat-square)](#阅读与分享)
[![运行方式](https://img.shields.io/badge/运行-静态网站-555555?style=flat-square)](#本地预览)

[访问百科](https://deer603.github.io/weijiba/) · [阅读与分享](#阅读与分享) · [本地预览](#本地预览) · [内容维护](#内容维护) · [返回站点导航](../README.md#站点导航)

## 阅读与分享

- 从首页的特色条目、群史纪要或分类索引开始，也可以按人名、用语和别名搜索。
- 首页和词条提供简体中文、繁体中文和英文。首次打开无语言前缀的网址时，网站跟随浏览器语言。手动切换后会记住选择，词条保留当前章节。
- 阅读页可调文字大小、页面宽度和配色。深色、浅色与自动配色都保存在当前浏览器。
- 词条标题下方的“分享词条”会使用当前语言的正式网址。每个语言版本的静态HTML提供对应的标题、简介和带“魏”字的地球缩略图。[分享信息与微信卡片](../docs/sharing.md#微信分享)

三个固定语言版本分别以`/weijiba/zh-cn/`、`/weijiba/zh-tw/`和`/weijiba/en/`开头。例如发布后的KunCode英文词条使用`/weijiba/en/KunCode/`。无语言前缀的词条地址和`article.html?entry=...`入口仍可用。

页面上的登录、讨论、编辑、历史和工具为界面演示。词条编辑通过下方的仓库维护流程完成。

## 本地预览

安装Python3，在仓库根目录启动静态服务。

```sh
python -m http.server 8000 --bind 127.0.0.1
```

打开[本地百科](http://127.0.0.1:8000/weijiba/)，也可以直接查看[繁体首页](http://127.0.0.1:8000/weijiba/zh-tw/)和[英文首页](http://127.0.0.1:8000/weijiba/en/)。阅读已有页面只需要静态服务，重新生成内容时需要Node.js和pnpm。

## 内容维护

| 想修改的内容 | 对应文件 |
| --- | --- |
| 简体正文、事实表与来源 | [entry-data.js](entry-data.js)和[entry-writing.js](entry-writing.js) |
| 英文标题、正文、来源名称与外链文案 | [entry-en.js](entry-en.js) |
| 词条唯一键与目录 | [entry-routes.js](entry-routes.js) |
| 首页文字、布局和交互 | [index.html](index.html)、[style.css](style.css)和[script.js](script.js) |
| 词条模板、样式和交互 | [article.html](article.html)、[article.css](article.css)和[article.js](article.js) |
| 英文界面文案 | [home-i18n.js](home-i18n.js)和[article-ui-en.js](article-ui-en.js) |

首次生成前，在仓库根目录安装工具依赖。

```sh
pnpm --dir weijiba/tools install --frozen-lockfile
```

修改词条时同步维护简体原文和英文译文。繁体版由OpenCC生成。新增词条时另在`entry-routes.js`登记目录，需要进入首页索引的词条也要添加首页链接。然后运行生成器，同步三个语言版本、目录和分享信息。

```sh
node weijiba/tools/refresh-entry-pages.mjs
```

生成页的正文由词条数据维护，模板变动也通过生成器同步。删除词条时清理数据、对应译文、路由和首页引用，并移除原词条目录和三个语言目录中的对应页面。

## 内容约定

- 以群聊档案、公开报道和项目资料为出处。区分记录、转述、玩笑和虚构内容。
- 引用聊天原话时标注日期，引用公众号文章时标注标题和发布方。公开项目优先链接原项目资料。
- 在相关段落标注参考资料编号。原始聊天导出留在资料归档处。
- 同一事件的资料集中在一篇词条。常见别名和写法可以放进对应词条，并接入首页搜索。

发布步骤见[根README](../README.md#发布到github-pages)。站点以鹿群资料为主题，外观参考中文维基百科。
