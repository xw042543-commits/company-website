# U圈图片发布与私有存储

## 本次实现

最多9张JPEG/PNG；小程序压缩、双并发上传、移除/重试、原生预览和按账号持久草稿。列表、详情、我的内容和顾问审核页显示真实附件。标题60字、正文2000字与纯文字接口保持兼容。

数据库迁移V26–V28保存私有图片、顺序、文本审核门槛、持久任务与回调收件箱，保留主分支V25院校资料迁移。服务端每进程最多2个上传处理，单文件5MiB、请求6MiB、2000万像素；重新编码JPEG、移除EXIF、生成1600长边展示图与480缩略图。每用户UTC日90张、总容量配置及2GiB磁盘余量保护。

上传成功仅返回PENDING和图片ID，不代表公开。只有文本通过且全部图片回调PASS，未被人工处理的待审帖子才自动发布并生成一条通知。最多3次任务提交，35分钟收不到有效回调转人工；回调早到、重复、迟到不会重复发布或复活隐藏/删除内容。风险图片也留人工决定，不自动放行。

## 默认关闭与部署

本次提交不修改生产配置、不部署。命名卷community-images仅挂载后端的/var/lib/udajo/community-images，应用用户可写，禁止静态服务器直接暴露。

上线前在服务器私有环境文件配置（不要把值发聊天或提交Git）：

- APP_COMMUNITY_IMAGES_ENABLED：默认false；全部验收后才设true。
- APP_COMMUNITY_IMAGES_MAX_BYTES：明确的正整数总字节容量，依据磁盘资源制定。
- APP_COMMUNITY_IMAGES_REVIEW_ENABLED：默认false；先配置回调并验证，再开放上传。
- APP_COMMUNITY_IMAGES_PUBLIC_ORIGIN：与PUBLIC_SITE_URL一致的HTTPS站点。
- APP_COMMUNITY_IMAGES_REVIEW_SECRET：独立随机密钥，至少32字节。
- APP_COMMUNITY_IMAGES_CALLBACK_TOKEN：微信消息推送Token，3–32位URL安全字符。
- APP_COMMUNITY_IMAGES_CALLBACK_AES_KEY：微信提供的43字符EncodingAESKey，不是AppSecret。

沿用小程序AppID/Secret和已启用的内容安全服务。微信消息推送选“安全模式＋JSON”，地址为站点下/api/v1/community/image-review/callback。先确认是否已有其他业务使用消息推送，不覆盖现有配置。专用审核下载URL签名1小时有效；Token、openid、图片字节和签名URL不得写日志。

Caddy分别限制上传6MB、回调100KB；Next代理流式转发multipart与二进制，保持no-store。小程序合法uploadFile、downloadFile域名均需包含站点HTTPS域名。

关闭上传开关不会撤销已有图片读取；读取仍逐次核对帖子可见性，未公开仅本人/顾问能读取，删除后拒绝。所有图片响应no-store。已被用户保存或截屏的图片无法远程收回。

## 清理与恢复

启用上传时每10分钟清理最多100个超过24小时且未绑定的附件，使用与绑定相同的容量行锁，回收磁盘和容量。7天前回调收件箱记录同时回收。已绑定图片不自动删除，保留审核依据。

尚未实现进程崩溃遗留、但数据库完全无记录的目录自动清理。发生存储/回滚清理错误时必须人工对账；不要直接递归删除整个图片卷。仅在暂停后端写入、完成备份后核对数据库storage_key与目录，并隔离无引用文件。磁盘余量检查会阻止继续耗尽磁盘。

备份必须同时保留PostgreSQL与community-images卷：
1. 安排维护窗口并停止后端（避免上传、审核、清理并发），保留数据库服务运行。
2. 导出数据库，归档图片卷，记录同一备份批次、镜像版本、迁移版本和校验和。
3. 恢复到隔离环境：还原数据库与同批图片卷，确认app用户权限，先保持上传/审核开关关闭。
4. 核对数据库字节统计与文件存在性，验证公开、私有和已删除图片的访问控制，再恢复服务。

未经演练不宣称备份可恢复。不要使用docker compose down -v，避免删除持久数据。

## 官方协议依据

已核对[多媒体内容安全识别](https://developers.weixin.qq.com/miniprogram/dev/server/API/sec-center/sec-check/api_mediacheckasync.html)与[消息推送](https://developers.weixin.qq.com/miniprogram/dev/framework/server-ability/message-push)（2026-10-12），并使用官方加密示例固定向量测试。

media_check_async：media_type=2、version=2、scene=3及用户openid；用户须近两小时访问小程序。提交errcode=0仅代表受理，必须等待wxa_media_check回调。回调验msg_signature、AES-CBC/32字节PKCS7填充及内层AppID；仅errcode=0且suggest=pass自动通过，其他结果保留人工审核。

## 验证与启用门槛

本地验证：后端920项测试0失败；小程序310项测试、类型检查和lint通过；网页构建通过（已有remote-image.tsx的img性能警告）；部署59项测试通过。发布编辑器已在微信开发工具中检查，用户确认界面可用。以上不等于真实微信回调或生产代理上传验收。

生产启用前仍需：真实账号回调握手/签名事件联调，真机0/1/9张发布与相册权限/草稿恢复，私有图片鉴权、隐藏后撤销读取，代理大小限制，容器重建及数据库+卷恢复演练，实际资源压力检查。生产开关保持关闭直到这些通过。
