# 社区图片存储基础（尚未开放上传）

当前包含编解码、私有文件存储和默认关闭的上传端点及数据库记录。没有图片读取端点、小程序选图入口或附件发布能力，不影响现有纯文字发帖。

## 私有上传阶段

`POST /api/v1/community/images`接收multipart字段file，沿用社区USER鉴权与CSRF策略，所有者从登录身份获取，忽略客户端文件名。201响应仅含id、width、height、status=PENDING，不含存储路径或公开URL。

只有显式配置 `app.community.images.enabled=true` 才注册上传服务和路由；此外需明确提供绝对路径 `app.community.images.root` 和正数 `app.community.images.max-bytes`。目前不要在生产环境开启；审核、清理与客户端尚未集成。总字节配置统计重新编码后的展示图及缩略图，不是原始输入字节。

V25迁移增加私有元数据和容量计数。账户锁与全局容量行锁避免并发超额；按UTC日计算每用户90张上限。剩余空间扣除本次写入后至少2GiB。数据库事务回滚会删除本次文件；进程中途崩溃的孤儿目录仍需后续一致性清理任务处理。

启用时multipart限制为单文件5MiB、请求6MiB；经代码搜索当前没有其他MultipartFile端点。反向代理限额与真正HTTP上传联调仍需在部署阶段验证。服务测试中的控制器调用不等同于真机/代理端到端测试。

## 本地验证

在backend目录执行：

```sh
./mvnw -Djava.awt.headless=true -Dtest=CommunityImageCodecTest,LocalCommunityImageStorageTest test
./mvnw -Djava.awt.headless=true test
```

完整测试需要本地Docker和测试端口访问权限。macOS沙箱中默认图形初始化可能导致JVM异常退出；图片转码无需图形桌面，测试显式使用headless模式。

## 当前边界

- 输入只允许5MiB以内JPEG/PNG，读取尺寸后限制2000万像素；拒绝GIF及APNG动画控制块。
- 展示图最长边1600，缩略图480，小图不放大；透明背景合成为白色，重新编码JPEG，不复制源文件元数据。
- 存储键由服务端生成；新建私有临时子目录，两个文件完整写入后原子移动。文件系统不支持原子移动时失败，不返回成功key。
- 配置根目录必须由应用独占，不能授予不可信本地进程写权限。路径校验不是针对同权限恶意进程的文件系统隔离机制。
- 配置根目录本身、图片目录和文件不能是符号链接。macOS `/var` 等系统父目录别名在构造时解析为真实路径。
- 不可将存储根目录直接映射到Caddy或其他静态服务器。此模块不负责判断用户是否有权限，不能直接向客户端暴露read方法。

## 开启生产上传前必须完成

1. 现有元数据增加附件绑定顺序、审核任务与防重复绑定；补充上传并发控制和配额竞争测试。当前已有所有者、每日限额、总容量与磁盘余量保护。
2. 容器持久卷挂载；反向代理上传限制；开启前核实服务器资源。
3. 审核供应商权限、签名/加密回调、幂等、乱序和删除竞态验证；所有附件允许公开后才能发布。
4. 私有/公开读取的逐请求可见性校验、24小时未绑定附件清理和并发绑定保护。
5. 数据库与文件卷一致性备份及恢复演练；不能仅备份数据库。
6. 小程序选图、压缩、失败重试、用户隔离的持久草稿及展示；真机联调。

2026-10-12已通过直接读取官方网页核实异步检测与消息推送协议，见下方记录。尚未核实实际账号配置及完成回调联调，当前不得启用生产图片发布。

## 图片审核官方协议核对

来源：[多媒体内容安全识别](https://developers.weixin.qq.com/miniprogram/dev/server/API/sec-center/sec-check/api_mediacheckasync.html)、[消息推送](https://developers.weixin.qq.com/miniprogram/dev/framework/server-ability/message-push)，核实日期2026-10-12。

- 提交到 `/wxa/media_check_async`，服务端提供access_token；参数为 `media_url`、`media_type=2`、`version=2`、`scene=3`（论坛）及用户openid。用户须在近两小时访问过小程序。
- 提交成功返回 `trace_id`，不代表通过。异步事件 `wxa_media_check` 用trace_id关联，官方说明30分钟内推送；仅errcode为0时读取result.suggest，pass/review/risky分别处理，下载失败不能放行。
- 部署选择消息推送“安全模式＋JSON”。GET验证使用token/timestamp/nonce生成签名并回传echostr。POST使用包含Encrypt的msg_signature验签，不使用普通signature替代；解密后校验内层应用身份。
- EncodingAESKey与消息Token是回调配置，不是AppSecret，不存入Git，不让用户贴到聊天。后台已有消息接收配置时须先核对用途，不能覆盖其他业务。
- 数据库需先持久化上传和任务，再提交供应商；回调可能早于任务绑定，未知trace_id必须安全暂存以便稍后关联，不能直接丢弃或任意放行。

尚待完成：凭真实账号在微信后台配置回调并联调；持久任务、超时与重试、人工状态保护、图片可见性端点及部署配置。
