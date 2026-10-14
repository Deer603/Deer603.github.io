<p align="center"><img src="app-icon.png" width="104" alt="KunCode水豚图标"></p>

# KunCode官网

KunCode开发工作台的静态产品官网，提供功能介绍、困困AI展示和Windows、macOS安装入口。官网页面由本仓库维护，应用源码与发行包位于[Roylyl/KunCode](https://github.com/Roylyl/KunCode)。

[![网页入口](https://img.shields.io/badge/网页-kuncode-527565?style=flat-square)](https://deer603.github.io/kuncode/)
[![页面版本](https://img.shields.io/badge/页面展示版本-2.0.0-527565?style=flat-square)](index.html)
[![应用下载](https://img.shields.io/badge/下载-Windows%20%7C%20macOS-555555?style=flat-square)](https://github.com/Roylyl/KunCode/releases)

[访问官网](https://deer603.github.io/kuncode/) · [应用发行页](https://github.com/Roylyl/KunCode/releases) · [本地预览](#本地预览) · [返回站点导航](../README.md#站点导航)

## 下载应用

页面当前配置的版本为2.0.0，发行标签为`V2.0.0`。安装包按平台和处理器区分：

|平台|页面配置的安装包|
|---|---|
|Windows x64|`KunCode-Windows-x64-2.0.0.exe`|
|Mac Apple Silicon|`KunCode-macOS-arm64-2.0.0.pkg`|
|Mac Intel|`KunCode-macOS-x64-2.0.0.pkg`|

通过[对应发行页](https://github.com/Roylyl/KunCode/releases/tag/V2.0.0)查看安装包和发行说明。Mac用户可在“关于本机”确认处理器，安装要求以应用发行说明为准。

## 本地预览

在仓库根目录运行：

```sh
python -m http.server 8000 --bind 127.0.0.1
```

访问[本地官网](http://127.0.0.1:8000/kuncode/)。页面为原生HTML、CSS与JavaScript，无需安装依赖或执行构建，也可直接打开[index.html](index.html)。

## 页面内容

- 开发工作台介绍：代码编辑、文件管理、终端、调试、Git、扩展与中文界面。
- 困困AI展示：可切换的静态对话示例与思考练习。
- 下载区域：平台入口、安装说明、发行页和问题反馈。
- 自动突出浏览器所在系统的下载入口，并保留Mac架构选择。
- 暗绿色玻璃界面、响应式布局及减少动态效果偏好适配。

页面中的编辑器是工作台示意，AI对话用于产品展示；实际应用功能由KunCode客户端提供。

## 维护说明

|文件|用途|
|---|---|
|[index.html](index.html)|文案、发行配置、默认下载链接与分享信息|
|[style.css](style.css)|主题、布局与响应式样式|
|[script.js](script.js)|发行链接生成、系统判断与对话示例切换|
|[app-icon.png](app-icon.png)|水豚品牌图标|
|[share-cover.jpg](share-cover.jpg)、[share-thumb.jpg](share-thumb.jpg)|分享封面与缩略图|

### 更新版本

在`index.html`头部维护以下配置：

```html
<meta name="kuncode-release" content="V2.0.0" />
<meta name="kuncode-version" content="2.0.0" />
<meta name="kuncode-windows-asset" content="KunCode-Windows-x64-{version}.exe" />
<meta name="kuncode-mac-arm64-asset" content="KunCode-macOS-arm64-{version}.pkg" />
<meta name="kuncode-mac-x64-asset" content="KunCode-macOS-x64-{version}.pkg" />
```

脚本据此生成下载链接。更新时同时调整HTML中的默认链接、文件名、包大小和版本文案，保持未启用JavaScript时仍可下载。文件名应与应用Release附件一致。

分享文案由根目录`tools/share-metadata.mjs`统一维护，详见[分享信息说明](../docs/sharing.md)。只迁移官网托管位置时，保留应用源码、发行与反馈链接；产品仓库迁移时再同步`script.js`的`RELEASE_BASE`。

## 发布与产品来源

网站使用`/kuncode/`路径，发布方式见[根README](../README.md#发布到github-pages)。KunCode基于Code-OSS定制，应用许可与上游说明见[产品仓库](https://github.com/Roylyl/KunCode)及[许可证](https://github.com/Roylyl/KunCode/blob/main/LICENSE.txt)。
