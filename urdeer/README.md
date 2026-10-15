# 你是个鹿嘞

检测你是哪一只鹿。

“你是个鹿嘞”是一款在浏览器中运行的摄像头与照片匹配工具。face-api与SFace两个识别模型共同计算综合分数，摄像头结合连续多帧结果显示人物百分比排行。当前预设库包含13人、76张参考图，两套模型分别保存对应特征。

[![网页入口](https://img.shields.io/badge/网页-urdeer-0071e3?style=flat-square)](https://deer603.github.io/urdeer/)
[![运行方式](https://img.shields.io/badge/运行-浏览器本地-555555?style=flat-square)](#运行要求)
[![双模型](https://img.shields.io/badge/识别-face--api%20%2B%20SFace-0071e3?style=flat-square)](#匹配方式)
[![静态部署](https://img.shields.io/badge/部署-静态网站-555555?style=flat-square)](#部署与资料范围)

[快速开始](#快速开始) · [主要功能](#主要功能) · [匹配方式](#匹配方式) · [维护说明](#维护说明) · [返回站点导航](../README.md#站点导航)

## 快速开始

安装Node.js18或更高版本，在本目录运行：

```sh
node serve.mjs
```

打开[本地网页](http://localhost:8765/)。如需更换端口，运行`node serve.mjs 8766`并使用对应地址。也可按[根README](../README.md#本地预览)从仓库根目录启动Python静态服务器。

1. 点击预览框中央的“开始使用”，等待模型进度加载完成，右上角出现“已就绪”。
2. 点击“开启摄像头”，允许浏览器访问摄像头。
3. 保持人脸进入画面，等待人物排行出现；需要时切换摄像头或镜像。
4. 点击“对比照片”可处理静态图片，点击“停止”结束当前画面。

页面打开后先展示使用入口，点击“开始使用”才下载模型与运行库。首次准备需加载约65.4MB模型与WASM文件，并加载识别运行库；等待时间取决于网络和设备性能。加载期间可取消，网络中断或超时会显示重试入口。页面给出简明的操作提示，具体技术错误保留在浏览器控制台。

## 主要功能

- 实时摄像头与静态照片输入，支持画面中多张人脸。
- face-api与SFace分别提取特征，按综合分数显示人物排行。
- 摄像头保留最近5帧，首次采集满3帧后显示结果，减少单帧波动。
- 预览框内的大号加载百分比和进度条，加载完成后收起；准备阶段使用动态提示，下载阶段显示实际字节进度。
- 页面处于后台超过30秒时自动关闭摄像头，返回后可手动恢复。点击“停止”立即结束当前画面。
- 照片先检查文件大小并尝试打开，再切换画面；无效文件不会打断当前摄像头。照片处理期间可取消，已取消的任务不会覆盖后续画面。
- 排行更新复用已有条目；屏幕阅读器在最高匹配人物稳定变化时播报，避免每帧百分比变化重复打断。
- 浅灰背景、圆角预览区域、简洁按钮与手机布局，交互区域至少44px，支持键盘焦点、语义化排行和减少动态效果偏好。
- 界面只展示人物和综合百分比，不显示模型分歧、分差、帧数或调试面板。

## 运行要求

使用支持摄像头、ES Modules、WebGL和WebAssembly SIMD的现代浏览器。摄像头需要HTTPS或localhost等安全上下文，应通过HTTP服务或正式HTTPS网址访问。

脚本、模型与预设库均从当前站点加载，摄像头画面和临时选取的对比照片在浏览器中处理，不上传到识别服务器。SFace模型约38.7MB，WebAssembly运行文件约14.2MB。

## 匹配方式

每个模型分别选取该人物最接近的两张参考图。face-api使用平均欧氏距离d，SFace使用平均余弦相似度c：

```text
face-api分数=clamp(1-d/1.2,0,1)×100
SFace分数=clamp(c,0,1)×100
综合匹配度=(face-api分数+SFace分数)/2
```

仅有一张参考图的人物使用现有样本参与排行。综合百分比是相似度换算分数，不代表身份正确概率。

摄像头按人脸框位置关联连续画面，分别汇总最近5帧的两套分数后再排序。单帧第一名变化不会清空窗口，分差小也不会否定第一名。人脸离开画面或过小时重新采集；分析画面最长边为960像素，人脸框短边至少80像素。静态照片只计算一次。

两个识别网络共用SSD检测与68点关键点定位，SFace另做112×112的5点对齐。内部记录两模型各自的候选与一致性，参考阈值分别为face-api65分和SFace余弦0.363；这些信息不替代界面的综合排行。模型可能同时出错，共用定位误差也可能影响两者。本项目不提供活体检测。

## 维护说明

|文件或目录|用途|
|---|---|
|[index.html](index.html)、[styles.css](styles.css)|页面结构、加载界面和外观|
|[app.js](app.js)|摄像头、照片输入与结果展示|
|[results-view.js](results-view.js)|排行节点复用、分数更新与稳定结果播报|
|[core.js](core.js)|基础特征距离、参考库格式与多帧窗口|
|[ensemble.js](ensemble.js)|双模型评分与一致性记录|
|[sface.js](sface.js)|人脸对齐、SFace推理与特征归一化|
|[model-loader.js](model-loader.js)|按需加载运行库、模型与WASM，汇总下载进度|
|[presets/library.json](presets/library.json)|face-api参考特征、人物与缩略图|
|[presets/sface-library.json](presets/sface-library.json)|相同人物与样本的SFace特征|
|[presets/source.json](presets/source.json)|参考图标签、文件路径与来源记录|
|[presets/images/](presets/images/)|参考图片|
|[models/](models/)、[vendor/](vendor/)|模型、浏览器运行库与许可|
|[serve.mjs](serve.mjs)|仅绑定127.0.0.1的本地静态服务|

新增或删除人物时，同步两套参考库及来源记录，保持人物ID、姓名和样本数量一致。每人最多16张参考图。参考库是用于比对的特征集合，不会因为运行网页而自动训练模型；摄像头画面与对比照片也不会自动加入预设库。

加载开始时先显示“准备中”，5%～89%按实际收到的模型与WASM字节推进；随后初始化两套模型、读取人物资料，全部就绪后才达到100%。更新模型文件时同步`model-loader.js`中的资源大小，保持字节进度与实际文件一致。运行库脚本60秒内未完成加载，或模型下载连续60秒没有进展时，会中止并允许重试；初始化期间取消会等待当前步骤结束，再回到可重新开始的状态。

分享封面、缩略图与页面文案由根目录维护脚本统一生成，见[网站分享信息](../docs/sharing.md)。

## 部署与资料范围

将完整目录作为静态站点部署，保留`models/`、`vendor/`和`presets/`的相对位置。仓库使用区分大小写的`/urdeer/`路径，发布方式见[根README](../README.md#发布到github-pages)。

预设姓名、照片和特征保存在静态文件中，会随网站发布并可被访问。公开部署前确认资料的发布范围；需要限制访问时，使用本地环境或具备访问控制的托管方式。

## 开源组件

|组件|版本或模型|用途|
|---|---|---|
|[@vladmandic/face-api](https://github.com/vladmandic/face-api)|1.7.15|SSD检测、68点关键点及128维识别特征|
|[OpenCV Zoo SFace](https://github.com/opencv/opencv_zoo/tree/main/models/face_recognition_sface)|face_recognition_sface_2021dec.onnx|第二套识别特征|
|[ONNX Runtime Web](https://onnxruntime.ai/docs/get-started/with-javascript/web.html)|1.30.0|浏览器WebAssembly推理|

许可全文、模型来源与版权声明见[第三方组件说明](THIRD_PARTY_NOTICES.md)。
