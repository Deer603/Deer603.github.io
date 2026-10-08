# 青蛙的角落

六人寝室的创意博客，当前完成第一位舍友魏子奇（青蛙）；纯静态网站，不需要服务器端，也不需要构建。

## 本地预览

在 `603_Website/` 目录下运行 `python3 serve.py`，然后打开 <http://127.0.0.1:8765/>。
直接双击 `index.html` 无法打开网站，ES Modules 需要通过 HTTP 访问。

## 部署

本网站放在仓库的 `603_Website/` 目录下，随主站一起由 GitHub Pages 发布，推送到 `main` 后几分钟生效：
<https://Deer603.github.io/603_Website/>（网址区分大小写）。
网站内部全部使用相对路径，整个目录可以原样搬到任意子路径或独立域名下。

## 国内访问

github.io 在中国大陆可能很慢，甚至打不开。如果访客主要在国内，建议把本目录的全部文件原样上传到国内的静态网站托管，
例如腾讯云 COS 或阿里云 OSS 的静态网站功能，再配 CDN；首页设为 `index.html`。
网站运行时不请求任何境外资源，字体和库都已经打包在里面。

## 浏览器要求

使用新版 Chrome、Edge、Safari 或 Firefox。电脑优先，手机可以走完流程。
浏览器不支持 WebGL2 时，相册会直接换页，没有翻页动画。

## 目录概览

- `shell/`：寝室和通用框架。
- `characters/frog/`：青蛙。
- `characters/penguin/`：企鹅，未解锁。
- `vendor/`：第三方库。

## 素材与授权

12 张摄影作品版权归作者魏子奇（KEMA）所有。
音效来源见 `characters/frog/assets/CREDITS.md`。
第三方库 GSAP、Howler 的许可见各自文件。
字体 Noto Sans SC、Noto Serif SC、霞鹜文楷，使用 SIL Open Font License 1.1。
