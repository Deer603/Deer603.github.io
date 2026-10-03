# 网站分享信息

首页、加密鹿、魏鸡百科和KunCode各有一套分享图片。百科词条共用百科封面，标题、简介和规范地址按词条分别生成。

| 站点 | 横版封面 | 方形缩略图 |
| --- | --- | --- |
| 603web | [share-cover.jpg](../assets/share-cover.jpg) | [share-thumb.jpg](../assets/share-thumb.jpg) |
| 加密鹿 | [share-cover.jpg](../codec/share-cover.jpg) | [share-thumb.jpg](../codec/share-thumb.jpg) |
| 魏鸡百科 | [share-cover.jpg](../weijiba/assets/share-cover.jpg) | [share-thumb.jpg](../weijiba/assets/share-thumb.jpg) |
| KunCode | [share-cover.jpg](../kuncode/share-cover.jpg) | [share-thumb.jpg](../kuncode/share-thumb.jpg) |

横版图片为1200×630，方形图片为400×400，均采用JPEG。页面在静态HTML中提供标题、简介、Open Graph、Twitter Card、规范地址与图片入口，不依赖浏览器执行脚本。正文开头另提供不影响布局的缩略图，作为普通图片抓取的候选；客户端是否采用该候选由其抓取规则决定。

## 修改标题与图片

在仓库根目录执行：

```sh
node tools/share-metadata.mjs
```

四个首页的分享文案集中维护在该脚本中。百科词条从`entry-routes.js`、`entry-writing.js`和`entry-data.js`读取当前数据，写入各自的静态HTML；修改词条数据后运行脚本即可同步分享信息。原有词条维护脚本也会在更新页面后调用它。

分享图片的绘制源为[tools/create-share-images.py](../tools/create-share-images.py)，需要Python与Pillow，默认使用Windows微软雅黑字体。更新图片后可更换文件名，并同步元信息生成脚本中的地址，以便后续分享使用新的图片URL。

## 微信分享

发布后应分享`https://deer603.github.io/`及各子站、词条的正式地址。本地的`127.0.0.1`地址无法供微信服务器访问。网页信息和图片更新后，微信可能继续使用已缓存的卡片。

静态元信息为微信及其他平台提供抓取素材，不能保证微信每次都展示指定标题、简介与图片。需要在微信内稳定自定义分享内容时，应通过公众号JS-SDK配置分享接口，并在服务端生成签名、配置JS接口安全域名。当前GitHub Pages站点没有这套公众号与服务端配置；公众号密钥不应写入公开仓库或前端脚本。

百科旧式`article.html?entry=...`地址由浏览器脚本规范到词条路径；分享时优先使用独立词条目录地址，便于不执行JavaScript的抓取程序读取对应词条信息。
