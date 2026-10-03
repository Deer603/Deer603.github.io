<p align="center">
  <img src="favicon.svg" width="96" alt="加密鹿图标">
</p>

# 加密鹿

把文字藏进鹿群符号的小工具。输入原文和可选密钥，生成由鹿、森林和夜空主题符号组成的密文，再使用相同密钥还原。界面采用暗绿色玻璃质感，适合电脑和手机使用。

[![GitHub Pages](https://img.shields.io/badge/hosting-GitHub%20Pages-2563eb?style=flat-square)](https://deer603.github.io/codec/)
[![浏览器运行](https://img.shields.io/badge/runtime-browser-555555?style=flat-square)](#本地预览)
[![JavaScript](https://img.shields.io/badge/language-JavaScript-f7df1e?style=flat-square)](script.js)

[开始使用](#开始使用) · [主要功能](#主要功能) · [本地预览](#本地预览) · [返回站点导航](../README.md#站点导航)

## 开始使用

本子站位于`Deer603/Deer603.github.io`仓库的`codec/`目录。仓库启用Pages并完成发布后，访问[加密鹿](https://deer603.github.io/codec/)即可使用。

1. 在“密钥”输入框中填写密钥，也可以留空。
2. 在“原文/密文”区域输入需要转换的文字。
3. 点击“鹿加密”，结果区会在两秒内逐字显示鹿群密文。
4. 点击“复制结果”，将密文分享给接收者。
5. 解密时粘贴密文，输入完全相同的密钥，再点击“鹿出来”，原文同样逐字输出。加密时未填写密钥，解密时也应留空。

输入示例：原文填写`今晚603见`，密钥填写`鹿群`。生成的符号串可以复制到输入区，再用同一密钥解密。密钥中的空格和大小写也需要一致。

## 主要功能

- 鹿群编码：支持中文、英文和表情等内容；使用密钥生成符号替换规则，也支持空密钥。
- 智能转换：根据输入中的主题符号比例，尝试判断加密或解密方向。
- 便捷操作：支持示例填入、密钥显隐、交换输入与结果、清空内容、一键复制和字符计数。
- 逐字输出：加密和解密结果按字符渐进显示，输出动画在两秒内完成；长结果自动加快，完整输出后即可复制。
- 玻璃界面：半透明面板、背景模糊与柔和绿光，功能图标采用SVG；桌面双栏，手机按输入、转换按钮、结果排列。
- 状态与快捷键：输出期间暂时禁用重复操作与复制；在输入框中按Ctrl/⌘+Enter执行智能转换。
- 浏览器处理：转换逻辑在本地执行，不依赖后端接口。

解密时会过滤符号池之外的字符，包括复制粘贴带入的空格和换行。智能转换按内容特征判断，遇到判断不符时可以直接选择“鹿加密”或“鹿出来”。

## 本地预览

直接打开[index.html](index.html)即可使用，也可以通过HTTP服务预览。

在仓库根目录`Deer603.github.io/`运行：

```sh
python -m http.server 8000 --bind 127.0.0.1
```

然后访问[本地加密鹿](http://127.0.0.1:8000/codec/)。如果本机使用`python3`命令，将`python`替换为`python3`即可。

## Pages发布

本子站随整个仓库发布，发布源选择`main`分支的`/(root)`。具体步骤见[根README的Pages发布说明](../README.md#发布到github-pages)。

子站目录与访问路径为`codec/`，线上地址为`https://deer603.github.io/codec/`，路径统一使用小写。页面提供静态分享标题、简介、横版封面和方形缩略图，维护方法见[网站分享信息](../docs/sharing.md)。

## 文件说明

| 文件 | 用途 |
| --- | --- |
| [index.html](index.html) | 页面结构、按钮与分享元信息 |
| [style.css](style.css) | 玻璃面板、响应式布局、配色和动画 |
| [script.js](script.js) | 编码、解码、智能转换、逐字输出与界面交互 |
| [favicon.svg](favicon.svg) | 矢量鹿头像图标 |
| [share-cover.jpg](share-cover.jpg)、[share-thumb.jpg](share-thumb.jpg) | 横版分享封面与方形缩略图 |

调整外观主要编辑`style.css`；修改转换逻辑或输出时序主要编辑`script.js`。更新资源时同步`index.html`中的版本参数，避免浏览器继续使用旧缓存。

## 编码原理

工具先将原文转换为UTF-8字节，再按密钥生成的替换表映射到主题符号，并插入填充符号。解码时使用相同密钥重建规则，跳过填充并还原文字。

它适合趣味消息和鹿群暗号，采用自定义编码规则，不具备专业密码学加密方案的安全保证。

