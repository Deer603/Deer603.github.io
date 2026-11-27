<p align="center"><img src="favicon.svg" width="96" alt="加密鹿图标"></p>
<h1 align="center">加密鹿</h1>
<p align="center">把聊天文字变成鹿、树叶和星星，也可以把这些符号还原成原文。</p>

[![在线使用](https://img.shields.io/badge/网页-加密鹿-527565?style=flat-square)](https://deer603.github.io/codec/)
[![运行方式](https://img.shields.io/badge/运行-浏览器-555555?style=flat-square)](#本地预览)

[快速开始](#快速开始) · [本地预览](#本地预览) · [维护](#维护) · [返回站点导航](../README.md#站点导航)

## 快速开始

1. 打开[加密鹿](https://deer603.github.io/codec/)，在“原文/密文”中输入`今晚603见`，密钥填写`鹿群`。也可以点击“填入示例”。
2. 点击“鹿加密”，再点击“复制结果”，把符号串发给对方。
3. 对方把符号串粘贴进同一个输入框，填写相同的密钥，再点击“鹿出来”。

密钥可留空。还原时需用相同密钥，空格和大小写也要一致。原文、密钥与转换结果均在浏览器内处理，适合发送趣味文字和群内暗号。机密内容应使用专门的安全通信工具。

## 转换与还原

- 支持中文、英文、表情等UTF-8文本。每次可编码最多4000个Unicode码点，密钥上限为256个UTF-16代码单元。
- “智能转换”根据输入里的主题符号比例判断方向，也可用`Ctrl+Enter`或`⌘+Enter`启动。判断有误时，直接点击“鹿加密”或“鹿出来”。
- 支持交换输入与结果、清空、密钥显隐和字符计数。结果逐字显示，输出完成后可一键复制。
- 还原时会忽略符号表以外的字符。新版符号串会校验还原结果是否完整，也可读取旧版符号串。还原失败时，检查密钥并重新复制完整结果。

## 本地预览

安装Python3，在仓库根目录运行后打开[本地加密鹿](http://127.0.0.1:8000/codec/)。浏览器通过HTTP加载转换Worker，前端文件可直接运行。

```sh
python -m http.server 8000 --bind 127.0.0.1
```

## 维护

| 文件 | 用途 |
| --- | --- |
| [index.html](index.html)、[style.css](style.css) | 页面、布局和交互样式 |
| [script.js](script.js)、[worker.js](worker.js) | 工作区状态、逐字输出与后台转换 |
| [codec-core.js](codec-core.js) | 符号表、编码格式与旧版还原 |
| [share-cover.jpg](share-cover.jpg)、[share-thumb.jpg](share-thumb.jpg) | 横版分享封面和方形缩略图 |

更新脚本或样式时，同步页面中对应的资源版本参数。子站的发布路径为`/codec/`。[发布到GitHub Pages](../README.md#发布到github-pages) · [分享信息维护](../docs/sharing.md)
