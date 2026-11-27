<p align="center"><img src="app-icon-400.webp" width="104" alt="KunCode水豚图标"></p>

# KunCode官网

KunCode是基于Code-OSS定制的中文开发工作台。官网介绍代码编辑、终端、调试、Git与扩展，展示困困AI的预设对话，并提供Windows和macOS安装入口。

[![网页入口](https://img.shields.io/badge/官网-KunCode-527565?style=flat-square)](https://deer603.github.io/kuncode/)
[![版本与下载](https://img.shields.io/badge/下载-2.0.0-527565?style=flat-square)](https://github.com/Roylyl/KunCode/releases/tag/V2.0.0)
[![应用平台](https://img.shields.io/badge/平台-Windows%20%7C%20macOS-555555?style=flat-square)](#下载与使用)
[![应用许可](https://img.shields.io/badge/应用许可-MIT-555555?style=flat-square)](https://github.com/Roylyl/KunCode/blob/main/LICENSE.txt)

[访问官网](https://deer603.github.io/kuncode/) · [应用源码](https://github.com/Roylyl/KunCode) · [问题反馈](https://github.com/Roylyl/KunCode/issues) · [站点导航](../README.md#站点导航)

## 下载与使用

打开[官网下载区](https://deer603.github.io/kuncode/#download)或[2.0.0发行页](https://github.com/Roylyl/KunCode/releases/tag/V2.0.0)，按设备选择安装包。Mac用户可在“关于本机”查看芯片或处理器类型。

|系统要求|安装包|
|---|---|
|Windows10及以上，x64|`KunCode-Windows-x64-2.0.0.exe`|
|macOS12及以上，Apple Silicon|`KunCode-macOS-arm64-2.0.0.pkg`|
|macOS12及以上，Intel|`KunCode-macOS-x64-2.0.0.pkg`|

安装后打开项目文件夹，即可使用编辑器、集成终端和Git。可通过Open VSX安装开发语言或SDK所需的扩展。在应用聊天面板选择`Kunkun AI`或输入`@kunkun`开始交流，输入`/about`查看使用说明。

官网的困困AI区提供安装报错、论文选题和小组协作三组预设对话与思考练习。

## 本地预览

在仓库根目录用Python3启动静态服务器。

```sh
python -m http.server 8000 --bind 127.0.0.1
```

浏览[本地KunCode官网](http://127.0.0.1:8000/kuncode/)。官网由原生HTML、CSS和JavaScript组成，可直接预览。

## 维护官网

|维护内容|位置|
|---|---|
|功能介绍、版本配置、默认下载链接|[index.html](index.html)|
|系统识别、下载链接生成、对话示例|[script.js](script.js)|
|主题与响应式布局|[style.css](style.css)|
|水豚原图与网页展示图|[app-icon.png](app-icon.png)、[96px](app-icon-96.webp)、[400px](app-icon-400.webp)|
|分享图与缩略图|[share-cover.jpg](share-cover.jpg)、[share-thumb.jpg](share-thumb.jpg)|

1. 将`index.html`里的`kuncode-release`更新为发行标签（例如`V2.0.0`），`kuncode-version`更新为产品版本（例如`2.0.0`）。
2. 对照发行附件更新`kuncode-windows-asset`、`kuncode-mac-arm64-asset`和`kuncode-mac-x64-asset`。模板中的`{version}`会替换为不带`V`的产品版本。
3. 同步HTML里的默认下载链接、文件名、大小和版本文案，保留浏览器关闭JavaScript时的下载入口。

更换水豚原图后，可在安装Pillow的Python环境下从仓库根目录运行`python tools/optimize-site-images.py`，更新展示图。官网使用`/kuncode/`路径。发布方式和分享设置见[根README](../README.md#发布到github-pages)与[网站分享信息](../docs/sharing.md)。
