# 网站分享信息

统一分享脚本覆盖7个首页、夏炜城作品集的3个项目页及魏鸡百科词条。夏炜城作品集首页使用个人大头照作为分享图，其他首页和项目页使用各自封面与缩略图；百科词条共用百科图片，标题、简介和规范地址按词条分别生成。603AI保留自身已有的分享元信息，由该子站单独维护。

| 站点 | 分享封面 | 分享缩略图 |
| --- | --- | --- |
| 603web | [share-cover.jpg](../assets/share-cover.jpg) | [share-thumb.jpg](../assets/share-thumb.jpg) |
| 加密鹿 | [share-cover.jpg](../codec/share-cover.jpg) | [share-thumb.jpg](../codec/share-thumb.jpg) |
| 魏鸡百科 | [share-cover.jpg](../weijiba/assets/share-cover.jpg) | [share-thumb.jpg](../weijiba/assets/share-thumb.jpg) |
| KunCode | [share-cover.jpg](../kuncode/share-cover.jpg) | [share-thumb.jpg](../kuncode/share-thumb.jpg) |
| 青蛙的角落 | [share-cover.jpg](../room/share-cover.jpg) | [share-thumb.jpg](../room/share-thumb.jpg) |
| 你是个鹿嘞 | [share-cover.jpg](../urdeer/share-cover.jpg) | [share-thumb.jpg](../urdeer/share-thumb.jpg) |
| 夏炜城作品集 | [个人大头照](../xiaweicheng/assets/xia-weicheng-portrait.png) | [个人大头照](../xiaweicheng/assets/xia-weicheng-portrait.png) |
| RoboMaster功率控制板 | [横版封面](../xiaweicheng/assets/robomaster-power-control-share-cover.jpg) | [方形缩略图](../xiaweicheng/assets/robomaster-power-control-share-thumb.jpg) |
| 智能泡茶机 | [横版封面](../xiaweicheng/assets/smart-tea-machine-share-cover.jpg) | [方形缩略图](../xiaweicheng/assets/smart-tea-machine-share-thumb.jpg) |
| LensPilot AI摄影助手 | [横版封面](../xiaweicheng/assets/ai-photography-assistant-share-cover.jpg) | [方形缩略图](../xiaweicheng/assets/ai-photography-assistant-share-thumb.jpg) |

夏炜城作品集首页直接使用517×607的PNG个人照，Open Graph、Twitter Card和缩略图字段均指向该照片。其余横版图片为1200×630，方形图片为400×400，均采用JPEG。页面在静态HTML中提供标题、简介、规范地址与图片入口，不依赖浏览器执行脚本。

普通HTML页面的正文开头另提供不影响布局的缩略图，作为图片抓取的候选，是否采用由客户端规则决定。作品集属于Next.js静态导出，保持正文结构不变，通过头部元信息提供图片，不插入额外的隐藏首图。

## 修改标题与图片

在仓库根目录执行：

```sh
node tools/share-metadata.mjs
```

首页和项目页的分享文案集中维护在[tools/share-metadata.mjs](../tools/share-metadata.mjs)中。百科词条从`entry-routes.js`、`entry-writing.js`和`entry-data.js`读取当前数据，写入各自的静态HTML。该命令仅同步分享信息；修改词条正文后，应运行`node weijiba/tools/refresh-entry-pages.mjs`，一次完成正文、目录、共享资源和分享信息同步。

作品集的分享信息同时存在于静态HTML、页面内联的Flight数据和同目录的`.txt`导航数据中。统一脚本会同步这些位置，使直接打开和站内跳转使用同一套文案。重新导出作品集后，应再运行分享脚本。

分享图片的绘制源为[tools/create-share-images.py](../tools/create-share-images.py)，需要Python与Pillow，默认使用Windows微软雅黑字体。在仓库根目录执行：

```sh
python tools/create-share-images.py
node tools/share-metadata.mjs
```

只重建青蛙的角落、你是个鹿嘞及三个项目页的五套图片时，可使用`python tools/create-share-images.py --new-only`。仅更新“你是个鹿嘞”的分享图时，使用`python tools/create-share-images.py --site urdeer`。两个首页使用对应站点风格，项目页从现有项目封面生成横版与方形版本。作品集首页直接引用个人照，不经过图片生成器。

更新图片后可更换文件名，并同步元信息生成脚本中的地址，以便后续分享使用新的图片URL。站内WebP展示图由另一份[图片优化脚本](../tools/optimize-site-images.py)维护，不与分享JPEG共用生成流程。

## 微信分享

发布后应分享`https://deer603.github.io/`及各子站、词条的正式地址。本地的`127.0.0.1`地址无法供微信服务器访问。网页信息和图片更新后，微信可能继续使用已缓存的卡片。

静态元信息为微信及其他平台提供抓取素材，不能保证微信每次都展示指定标题、简介与图片。需要在微信内稳定自定义分享内容时，应通过公众号JS-SDK配置分享接口，并在服务端生成签名、配置JS接口安全域名。当前GitHub Pages站点没有这套公众号与服务端配置；公众号密钥不应写入公开仓库或前端脚本。

百科旧式`article.html?entry=...`地址由浏览器脚本规范到词条路径；分享时优先使用独立词条目录地址，便于不执行JavaScript的抓取程序读取对应词条信息。
