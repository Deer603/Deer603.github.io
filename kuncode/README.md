<p align="center"><img src="app-icon.png" width="104" alt="KunCode水豚图标" /></p>

# KunCode官网

KunCode是603维护的开源开发工作台，基于Code - OSS定制，内置绿色水豚主题、中文资源和困困AI。本目录是产品官网，介绍功能与2.0.0更新，提供Windows、Mac Apple Silicon及Mac Intel安装包下载。

<p>
  <a href="https://github.com/Roylyl/KunCode/releases/tag/V2.0.0"><img src="https://img.shields.io/badge/release-V2.0.0-65a87d?style=flat-square" alt="V2.0.0发行" /></a>
  <a href="https://roylyl.github.io/kuncode/"><img src="https://img.shields.io/badge/website-GitHub_Pages-527565?style=flat-square" alt="GitHub Pages官网" /></a>
  <a href="https://github.com/Roylyl/KunCode/releases"><img src="https://img.shields.io/badge/platform-Windows%20%7C%20macOS-527565?style=flat-square" alt="Windows与macOS" /></a>
  <a href="https://github.com/Roylyl/KunCode/blob/main/LICENSE.txt"><img src="https://img.shields.io/badge/KunCode_license-MIT-527565?style=flat-square" alt="KunCode主体MIT许可证" /></a>
  <a href="https://github.com/Roylyl/KunCode/issues"><img src="https://img.shields.io/github/issues/Roylyl/KunCode?style=flat-square&amp;color=527565" alt="项目反馈" /></a>
</p>

[访问官网](https://roylyl.github.io/kuncode/) · [下载KunCode](https://github.com/Roylyl/KunCode/releases/tag/V2.0.0) · [产品源码](https://github.com/Roylyl/KunCode)

## 快速开始

浏览官网，按系统和处理器下载安装包：

| 平台 | 安装包 | 使用要求 |
| --- | --- | --- |
| Windows | `KunCode-Windows-x64-2.0.0.exe` | Windows10及以上、x64 |
| Mac Apple Silicon | `KunCode-macOS-arm64-2.0.0.pkg` | macOS12及以上、M系列芯片 |
| Mac Intel | `KunCode-macOS-x64-2.0.0.pkg` | macOS12及以上、Intel处理器 |

Mac用户在“关于本机”中查看处理器，两个PKG是独立架构安装包。当前Mac发行包未使用Developer ID发行签名，也未经Apple公证；若系统拦截，请确认下载来源后按“隐私与安全性”提示处理。

维护官网时，在仓库根目录运行静态服务器：

```bash
python3 -m http.server 8000
```

访问[本地预览](http://localhost:8000/kuncode/)。页面使用原生HTML、CSS和JavaScript，无需安装依赖或执行构建，也可直接打开`index.html`。

## 页面内容

- 展示2.0.0更新、开发工作台、扩展与中文水豚品牌。
- 基于线上原版布局更新，保留暗绿色氛围、大标题、编辑器透视、悬浮卡片与错落的功能区。
- 以“新时代高认知AI模型”为困困AI的产品定位，强调引导思考、解决问题、拒绝AI依赖。
- 提供三个可切换的对话示例与对应的思考练习，鼓励主动判断和验证。
- 在困困AI区域展示“理解问题、形成判断、验证结果”的产品理念，提供安装和使用常见问题。
- 提供三个安装包的直接下载链接、系统要求、大小及处理器选择说明。
- 根据系统突出下载入口，Mac始终保留两种处理器选择。
- 支持移动端、键盘操作、减少动态效果偏好，以及禁用JavaScript时的基础阅读和下载。

## 更新发行信息

在`index.html`的头部维护发行标签、产品版本和各平台文件名。标签与文件版本分开：GitHub标签是`V2.0.0`，当前安装包文件名使用`2.0.0`。

```html
<meta name="kuncode-release" content="V2.0.0" />
<meta name="kuncode-version" content="2.0.0" />
<meta name="kuncode-windows-asset" content="KunCode-Windows-x64-{version}.exe" />
<meta name="kuncode-mac-arm64-asset" content="KunCode-macOS-arm64-{version}.pkg" />
<meta name="kuncode-mac-x64-asset" content="KunCode-macOS-x64-{version}.pkg" />
```

`script.js`据此生成`releases/download/{tag}/{asset}`。更新时也同步HTML中的默认下载链接、文件名、版本、包大小、页面标题与分享说明，使禁用JavaScript时仍能正确下载。文件名以实际Release附件为准，不根据标签猜测。

页面统一使用“困困AI”称呼助手。“新时代高认知AI模型”用于产品定位，侧重独立思考的使用理念。产品能力和安装信息以当前应用及发行说明为准。更新版本时，同步对话示例和功能介绍。

## 文件与素材

| 文件 | 用途 |
| --- | --- |
| `index.html` | 页面内容、默认链接与发行配置 |
| `style.css` | 暗绿色主题、布局、SVG图标尺寸和响应式样式 |
| `script.js` | 发行链接、平台识别与对话示例切换 |
| `app-icon.png` | 当前应用水豚图标，来自产品品牌资源 |
| `favicon.png`、`favicon-32.png`、`apple-touch-icon.png` | 浏览器与移动设备图标 |
| `og-image-v2.jpg` | 当前社交分享图 |
| `部署说明.txt` | GitHub Pages部署提示 |

首页编辑器画面标明为工作台示意，不作为真实产品截图。品牌素材本地加载，不依赖远程图片。

## 部署

保持`kuncode/`位于`roylyl.github.io`仓库根目录，沿用已有GitHub Pages发布方式。提交、推送后访问[官网](https://roylyl.github.io/kuncode/)。日常修改仅编辑文件，不自动提交、推送或上传发行附件。

KunCode由603独立维护，主体采用MIT许可证，保留上游版权与第三方声明，与Microsoft没有隶属、赞助或官方合作关系。
