<p align="center"><img src="assets/app-icon.png" width="104" alt="603AI应用图标"></p>

# 603AI官网

603AI的静态产品官网，介绍困困、朴AI、龟龟和探戈四个角色，展示角色语录，并提供Android应用下载入口。

[![网页入口](https://img.shields.io/badge/网页-603ai-d79b20?style=flat-square)](https://deer603.github.io/603ai/)
[![应用平台](https://img.shields.io/badge/应用-Android-555555?style=flat-square)](https://github.com/Deer603/603AI/releases)
[![静态网站](https://img.shields.io/badge/网站-HTML%20%2F%20CSS%20%2F%20JavaScript-d79b20?style=flat-square)](#本地预览)

[访问官网](https://deer603.github.io/603ai/) · [应用仓库](https://github.com/Deer603/603AI) · [本地预览](#本地预览) · [返回站点导航](../README.md#站点导航)

## 开始使用

网页提供角色切换、预设语录、应用介绍和下载区域。需要使用角色聊天时，前往[应用发行页](https://github.com/Deer603/603AI/releases)获取Android安装包。

网页上的对话是预设内容展示，不会调用聊天模型。页面当前配置的下载入口为`V1.0.0`下的`603AI-1.0.0.apk`；应用使用方式与发行说明由产品仓库维护。

## 本地预览

在仓库根目录运行：

```sh
python -m http.server 8000 --bind 127.0.0.1
```

访问[本地603AI官网](http://127.0.0.1:8000/603ai/)，无需安装前端依赖。

## 页面功能

- 四个角色的头像、简介、话题与语录切换。
- Android安装包、发行说明和问题反馈入口。
- 手机导航、滚动进度与响应式布局。
- 下载地址为空时禁用下载按钮，并显示安装包待提供状态。

## 维护说明

|文件|用途|
|---|---|
|[index.html](index.html)|页面文案、下载配置与分享元信息|
|[style.css](style.css)|配色、布局、动画与响应式样式|
|[script.js](script.js)|下载链接配置、手机导航与滚动进度|
|[persona.js](persona.js)|角色头像、简介、问题与预设语录|
|[assets/](assets/)|应用图标与角色图片|

发行信息在`index.html`的meta标签中配置：

|配置名|用途|
|---|---|
|`603ai-apk-url`|APK直链，仅接受HTTPS地址|
|`603ai-release-url`|发行说明地址|
|`603ai-release-date`|页面显示的发布日期|
|`603ai-apk-size`|页面显示的安装包大小|
|`603ai-repository`|产品仓库地址|

更新发行时同步HTML里的默认链接与下载文案。修改角色展示编辑`persona.js`；页面资源使用版本参数时，也同步调整对应引用。

## 发布与产品来源

本目录仅保存官网页面，使用`/603ai/`路径，随整个网站发布。发布步骤见[根README](../README.md#发布到github-pages)。应用源码、APK、问题反馈与应用许可见[Deer603/603AI](https://github.com/Deer603/603AI)。
