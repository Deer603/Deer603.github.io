<p align="center"><img src="app-icon.png" width="104" alt="KunCode水豚图标" /></p>

# KunCode官网

KunCode的静态产品官网，集中介绍开发工作台、困困AI与各平台安装入口。采用暗绿色玻璃界面，随`Deer603/Deer603.github.io`发布，访问地址为[deer603.github.io/kuncode/](https://deer603.github.io/kuncode/)。

<p>
  <a href="https://deer603.github.io/kuncode/"><img src="https://img.shields.io/badge/website-GitHub_Pages-527565?style=flat-square" alt="GitHub Pages官网入口" /></a>
  <a href="#本地预览"><img src="https://img.shields.io/badge/site-HTML%20%2F%20CSS%20%2F%20JavaScript-527565?style=flat-square" alt="原生HTML、CSS与JavaScript静态网站" /></a>
  <a href="index.html"><img src="https://img.shields.io/badge/product_version-2.0.0-65a87d?style=flat-square" alt="页面展示的KunCode版本2.0.0" /></a>
  <a href="https://github.com/Roylyl/KunCode/releases"><img src="https://img.shields.io/badge/download-Windows%20%7C%20macOS-527565?style=flat-square" alt="KunCode应用下载" /></a>
</p>

[官网入口](https://deer603.github.io/kuncode/) · [本地预览](#本地预览) · [下载KunCode](https://github.com/Roylyl/KunCode/releases/tag/V2.0.0) · [应用源码](https://github.com/Roylyl/KunCode) · [返回站点导航](../README.md#站点导航)

官网页面由本仓库维护；KunCode应用的源码、Release与问题反馈仍在[Roylyl/KunCode](https://github.com/Roylyl/KunCode)。迁移官网托管账号时，保留这些应用链接。

## 快速开始

### 下载应用

官网展示KunCode2.0.0的安装入口。按系统和处理器选择，也可直接前往[对应发行页](https://github.com/Roylyl/KunCode/releases/tag/V2.0.0)：

| 平台 | 安装包 | 使用要求 |
| --- | --- | --- |
| Windows | `KunCode-Windows-x64-2.0.0.exe` | Windows10及以上、x64 |
| Mac Apple Silicon | `KunCode-macOS-arm64-2.0.0.pkg` | macOS12及以上、M系列芯片 |
| Mac Intel | `KunCode-macOS-x64-2.0.0.pkg` | macOS12及以上、Intel处理器 |

Mac用户可在“关于本机”查看芯片或处理器。两个PKG分别适配各自架构，页面也提供首次安装与升级说明；安装信息以应用发行页为准。

### 本地预览

页面使用原生HTML、CSS与JavaScript，无需安装前端依赖或执行构建。安装Python3后，在`Deer603.github.io`仓库根目录执行：

```bash
python -m http.server 8000 --bind 127.0.0.1
```

打开[本地KunCode官网](http://127.0.0.1:8000/kuncode/)。若系统的Python3命令为`python3`，将命令中的`python`替换为`python3`。也可直接打开[index.html](index.html)浏览页面。

## 页面内容

- 产品介绍：展示基于Code-OSS构建的代码编辑、文件管理、终端、调试、Git与扩展能力，以及中文界面和水豚主题。
- 困困AI介绍：围绕理解问题、形成判断、验证结果的理念，提供“安装报错”“论文选题”“小组协作”三个可切换的静态对话示例与思考练习。
- 下载入口：列出Windows x64、Mac Apple Silicon与Mac Intel安装包，展示系统要求、文件名和大小，并提供发行说明与反馈入口。
- 平台提示：根据浏览器识别的系统突出下载入口；Mac用户自行确认处理器并选择对应安装包。
- 页面体验：半透明玻璃面板、柔和绿光和SVG功能图标，适配电脑与手机；支持键盘操作与减少动态效果偏好，禁用JavaScript时仍可阅读基础内容并使用默认下载链接。

首页编辑器画面是工作台示意。网页中的困困AI对话用于展示产品理念，实际聊天功能在KunCode应用内使用。

## 修改与维护

### 文件入口

| 文件 | 用途 |
| --- | --- |
| [index.html](index.html) | 页面文案、默认下载链接、发行配置与分享元信息 |
| [style.css](style.css) | 暗绿色主题、布局、图标样式与响应式适配 |
| [script.js](script.js) | 生成发行链接、识别系统、切换静态对话示例 |
| [app-icon.png](app-icon.png) | KunCode水豚品牌图标 |
| `favicon.png`、`favicon-32.png`、`apple-touch-icon.png` | 浏览器与移动设备图标 |
| [share-cover.jpg](share-cover.jpg)、[share-thumb.jpg](share-thumb.jpg) | 页面当前使用的横版分享封面与方形缩略图 |

功能图标集中使用`index.html`中的SVG符号与`.icon`样式。新增图标沿用同一套尺寸和对齐规则；水豚品牌图继续使用原有图片素材。

### 更新发行信息

在`index.html`头部维护发行标签、产品版本与各平台安装包文件名。GitHub标签与文件版本分别配置，例如标签`V2.0.0`对应文件版本`2.0.0`：

```html
<meta name="kuncode-release" content="V2.0.0" />
<meta name="kuncode-version" content="2.0.0" />
<meta name="kuncode-windows-asset" content="KunCode-Windows-x64-{version}.exe" />
<meta name="kuncode-mac-arm64-asset" content="KunCode-macOS-arm64-{version}.pkg" />
<meta name="kuncode-mac-x64-asset" content="KunCode-macOS-x64-{version}.pkg" />
```

`script.js`据此生成`releases/download/{tag}/{asset}`链接。更新时同步HTML中的默认下载链接、文件名、版本与包大小，保持禁用JavaScript时的下载入口可用。文件名以应用Release附件为准。分享标题与简介集中维护在根目录的`tools/share-metadata.mjs`中，修改后运行`node tools/share-metadata.mjs`同步页面信息。

若应用仓库或发行渠道另行迁移，再更新`script.js`中的`RELEASE_BASE`与HTML内的应用链接。仅迁移官网时，无需更改`Roylyl/KunCode`。

## GitHub Pages迁移

保持`kuncode/`位于`Deer603.github.io`仓库根目录，与其他站点共用仓库的Pages发布设置。发布流程见[仓库首页的GitHub Pages说明](../README.md#发布到github-pages)，此目录对应的访问路径为`/kuncode/`。

`index.html`中的`canonical`、`og:url`使用`https://deer603.github.io/kuncode/`，`og:image`、`twitter:image`使用`https://deer603.github.io/kuncode/share-cover.jpg`。[部署说明.txt](部署说明.txt)也使用当前托管账号与地址。这些官网地址与应用源码、下载地址分别维护。分享文案与图片维护见[网站分享信息](../docs/sharing.md)。

## 产品来源

KunCode由603维护，基于Code-OSS定制。应用许可与上游声明见[KunCode许可证](https://github.com/Roylyl/KunCode/blob/main/LICENSE.txt)及[应用仓库](https://github.com/Roylyl/KunCode)。
