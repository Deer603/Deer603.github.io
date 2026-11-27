<p align="center"><img src="favicon.svg" width="88" alt="你是个鹿嘞网页图标"></p>

# 你是个鹿嘞

选一张照片，或开启摄像头，看看画面里的人最像预设库里的哪位鹿群成员。网页用face-api和SFace计算相似度，按综合分数显示排行。照片和摄像头画面在浏览器内处理。

[![网页入口](https://img.shields.io/badge/打开网页-urdeer-0071e3?style=flat-square)](https://deer603.github.io/urdeer/)
[![运行环境](https://img.shields.io/badge/运行-浏览器本地-555555?style=flat-square)](#运行要求)
[![识别模型](https://img.shields.io/badge/模型-face--api%20%2B%20SFace-0071e3?style=flat-square)](#相似度如何计算)
[![第三方组件](https://img.shields.io/badge/许可-第三方组件-555555?style=flat-square)](THIRD_PARTY_NOTICES.md)

[打开网页](https://deer603.github.io/urdeer/) · [本地预览](#本地预览) · [维护说明](#维护说明) · [站点导航](../README.md#站点导航)

## 快速开始

1. 打开网页，点击“开始使用”，等待右上角显示“已就绪”。首次从线上访问时，浏览器需要下载约65.4MB的模型和WebAssembly文件，另有运行库与参考数据。
2. 点击“对比照片”选择浏览器支持的图片，单张上限为20MiB。也可以点击“开启摄像头”并授权，按需切换设备或镜像。
3. 在“匹配结果”查看相似度排行。实时画面首次采集至少3帧才显示结果，点击“停止”结束摄像头。页面在后台持续30秒后会自动关闭摄像头，可返回手动恢复。

## 运行要求

使用支持ES Modules和WebAssembly SIMD的现代浏览器。开启摄像头需要HTTPS或`http://127.0.0.1`等安全上下文，并须授权摄像头访问。网页优先使用WebGL加速face-api，无法启用时切换到CPU。

### 本地预览

使用Node.js18或更高版本，在`urdeer/`目录运行以下命令。

```sh
node serve.mjs
```

打开[本地网页](http://127.0.0.1:8765/)。如需改端口，运行`node serve.mjs 8766`后访问对应端口。也可按[根README](../README.md#本地预览)从仓库根目录启动Python静态服务器，再打开`/urdeer/`。

## 相似度如何计算

- 当前参考库包含13人、76张参考图，两套模型使用同一批样本。输入画面里有多张人脸时，可分别计算。
- 对每个人物，两套模型各取最接近的两张参考图来计算分数。只有一张时使用现有样本。face-api使用平均欧氏距离`d`计算`clamp(1-d/1.2,0,1)×100`，SFace使用平均余弦相似度`c`计算`clamp(c,0,1)×100`。
- 取两个模型分数的平均值作为综合相似度。静态照片计算一次，摄像头按人脸位置关联画面，汇总最近5帧以减小波动。

界面百分比表示画面与参考库中人物的接近程度。光线、角度和画面清晰度均会影响分数，结果仅供趣味比较。

## 诊断日志

点“导出日志”可下载本次运行的JSON，包括加载和错误事件、检测到的人脸数量与处理耗时。日志仅存于当前页面内存，最多保留最近1000条事件与5000次处理记录，刷新页面或点击“清空日志”即可清除。导出字段范围见[diagnostics.js](diagnostics.js)。

## 维护说明

|维护内容|位置|
|---|---|
|页面结构、样式和使用提示|[index.html](index.html)、[styles.css](styles.css)|
|照片、摄像头与排行|[app.js](app.js)、[results-view.js](results-view.js)|
|评分、多帧关联和SFace推理|[core.js](core.js)、[ensemble.js](ensemble.js)、[sface.js](sface.js)|
|模型加载与进度|[model-loader.js](model-loader.js)、[models/](models/)、[vendor/](vendor/)|
|人物样本和来源|[face-api库](presets/library.json)、[SFace库](presets/sface-library.json)、[来源记录](presets/source.json)、[参考图片](presets/images/)|

维护参考库时，同步两套特征库和来源记录，保持人物ID、姓名、样本数量一致。每人最多16张参考图。当前网页的照片和摄像头输入仅用于当次对比，参考库由维护者更新。更换模型时，同步`model-loader.js`中的资源大小，以便准确计算下载进度。

部署时保留完整目录层级，包括`models/`、`vendor/`和`presets/`，路径为`/urdeer/`。预设姓名、参考图和特征会作为网站静态文件发布，可从对应地址读取。发布方式见[根README](../README.md#发布到github-pages)，第三方模型来源与许可见[第三方组件说明](THIRD_PARTY_NOTICES.md)。
