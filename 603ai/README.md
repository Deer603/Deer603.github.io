<p align="center"><img src="assets/app-icon.png" width="104" alt="603AI应用图标"></p>

# 603AI官网

在网页上认识困困、朴AI、龟龟和探戈，切换头像、话题与预设语录。安装603AI后，可以和四位角色聊天、收藏语录，或从3D寝室场景进入对话。

[![网页入口](https://img.shields.io/badge/官网-603AI-d79b20?style=flat-square)](https://deer603.github.io/603ai/)
[![系统要求](https://img.shields.io/badge/平台-Android%208.0%2B-555555?style=flat-square)](#下载与使用)
[![应用下载](https://img.shields.io/badge/下载-APK-d79b20?style=flat-square)](https://github.com/Deer603/603AI/releases)
[![问题反馈](https://img.shields.io/badge/GitHub-Issues-555555?style=flat-square)](https://github.com/Deer603/603AI/issues)

[访问官网](https://deer603.github.io/603ai/) · [应用源码](https://github.com/Deer603/603AI) · [本地预览](#本地预览) · [站点导航](../README.md#站点导航)

## 下载与使用

1. 使用Android8.0及以上设备，打开[官网下载区](https://deer603.github.io/603ai/#download)或[应用发行页](https://github.com/Deer603/603AI/releases)获取APK。当前官网指向[1.0.0发行版](https://github.com/Deer603/603AI/releases/tag/V1.0.0)。
2. 打开APK，按系统提示安装。若系统询问安装权限，按提示为打开APK的应用授权。
3. 在应用里选择角色开始对话。应用使用内置语料、关键词匹配与角色话术回复，安装后即可使用，无需注册或配置API密钥。

网页版提供角色介绍和预设语录。Android应用另外提供语录搜索、收藏、复制和分享，以及今日一句和使用统计。对话、收藏与统计保存在设备本地，清除应用数据前可复制或分享想保留的内容。

## 本地预览

在仓库根目录用Python3启动静态服务器。

```sh
python -m http.server 8000 --bind 127.0.0.1
```

浏览[本地603AI官网](http://127.0.0.1:8000/603ai/)。官网使用原生HTML、CSS和JavaScript，可直接预览。

## 维护官网

|维护内容|位置|
|---|---|
|产品文案、下载配置、默认下载链接|[index.html](index.html)|
|角色头像、话题、问题和语录|[persona.js](persona.js)、[assets/](assets/)|
|下载按钮、移动端导航和滚动进度|[script.js](script.js)|
|配色和响应式布局|[style.css](style.css)|

应用发布新版后，更新`index.html`头部元信息中的`603ai-apk-url`、`603ai-release-url`、`603ai-release-date`和`603ai-apk-size`，再同步下载区的默认链接、版本号和文案。下载脚本只接受HTTPS链接，留空APK地址会禁用下载按钮。若产品仓库迁移，同步`603ai-repository`和页面中的仓库及反馈链接。

官网随根站点发布在`/603ai/`。发布步骤和分享设置见[根README](../README.md#发布到github-pages)与[网站分享信息](../docs/sharing.md)。
