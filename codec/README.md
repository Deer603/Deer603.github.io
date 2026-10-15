<p align="center"><img src="favicon.svg" width="96" alt="加密鹿图标"></p>

# 加密鹿

把文字转换成鹿、森林和夜空主题符号的小工具。输入原文和可选密钥生成符号串，再使用相同密钥还原；全部转换在浏览器内完成。

[![网页入口](https://img.shields.io/badge/网页-codec-527565?style=flat-square)](https://deer603.github.io/codec/)
[![运行方式](https://img.shields.io/badge/运行-浏览器-555555?style=flat-square)](#本地预览)
[![原生JavaScript](https://img.shields.io/badge/技术-JavaScript-527565?style=flat-square)](script.js)

[开始使用](#开始使用) · [本地预览](#本地预览) · [维护说明](#维护说明) · [返回站点导航](../README.md#站点导航)

## 开始使用

打开[加密鹿](https://deer603.github.io/codec/)。例如原文填写`今晚603见`，密钥填写`鹿群`：

1. 点击“鹿加密”，等待结果逐字输出。
2. 点击“复制结果”，复制完整符号串。
3. 将符号串粘贴回输入区，保持密钥不变，点击“鹿出来”还原原文。

密钥可以留空；解码时必须与编码时一致，包括空格和大小写。工具采用自定义符号编码，适合趣味消息与群内暗号，不适合保存密码等机密内容。

## 主要功能

- 支持中文、英文与表情等UTF-8文本，以及带密钥或空密钥的转换。
- 根据主题符号比例选择转换方向，也可手动指定编码或解码。
- 支持示例填入、密钥显隐、交换输入与结果、清空、复制和字符计数。
- 输出逐字显示，动画在约两秒内完成；输出期间暂停重复操作。
- 新生成的密文带版本与损坏校验，支持还原旧版密文；密钥不符或内容损坏时显示重试提示。
- 转换在后台Worker中完成，每次原文最多4000字，密钥最多256字符；长内容可分段处理。
- 输入区支持Ctrl/⌘+Enter执行智能转换；桌面双栏，手机纵向排列。

解码会过滤符号池之外的字符。旧版密文不含内容校验，页面会在还原后注明。遇到智能转换方向不符时，直接选择“鹿加密”或“鹿出来”。

## 本地预览

本地预览需要通过HTTP加载后台转换脚本，在仓库根目录运行：

```sh
python -m http.server 8000 --bind 127.0.0.1
```

访问[本地加密鹿](http://127.0.0.1:8000/codec/)，无需安装前端依赖。

## 维护说明

|文件|用途|
|---|---|
|[index.html](index.html)|页面结构、按钮、资源版本与分享元信息|
|[style.css](style.css)|暗绿色玻璃界面、布局与动画|
|[script.js](script.js)|界面状态、Worker任务、字符计数与逐字输出|
|[codec-core.js](codec-core.js)|符号编码、版本与损坏校验、旧版密文读取|
|[worker.js](worker.js)|后台转换与字符边界计算|
|[favicon.svg](favicon.svg)|鹿头像图标|
|[share-cover.jpg](share-cover.jpg)、[share-thumb.jpg](share-thumb.jpg)|横版分享封面与方形缩略图|

改变脚本或样式后，同步HTML中的资源版本参数。分享文案由根目录的`tools/share-metadata.mjs`维护，使用方式见[分享信息说明](../docs/sharing.md)。

## 路径与发布

目录和访问地址统一使用小写`codec/`，不要建立另一个`Codec/`目录。发布方式见[根README](../README.md#发布到github-pages)。
