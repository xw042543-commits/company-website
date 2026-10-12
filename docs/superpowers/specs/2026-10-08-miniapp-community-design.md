# UDAJO 微信小程序 U圈设计规格

**日期：** 2026-10-08  
**负责人：** A（基础架构与接口）  
**状态：** 已确认  
**目标分支：** `feat/miniapp-community-foundation`

## 1. 目标与容量

U圈为洋豆角留学生社区的第一版。它必须使用真实账号和真实数据库，不使用静态帖子、演示评论或仅存在于客户端的数据。

首版容量目标：

- 至少 5,000 名注册用户。
- 500 名同时在线用户。
- 峰值每秒 100 次读取、20 次写入。
- 帖子与评论列表在数据增长后仍使用稳定游标分页，不使用深页码。
- PostgreSQL 是唯一业务数据真源；Redis 丢失后不得造成帖子、互动、举报或审核结果丢失。

首版功能范围：

- 最新与热门帖子列表。
- 帖子详情、发帖、评论和点赞。
- 用户举报帖子或评论。
- 现有网站管理员后台中的 U圈审核工作区。
- 用户查看并删除自己的帖子和评论。
- 限流、敏感词、风险拦截、禁言、封禁和审核审计。

首版不实现：

- 私信、群聊、音视频、直播和普通文件上传。
- 匿名发帖。
- 推荐算法、关注关系、热榜竞价或积分激励。
- 独立微服务、消息队列或新的管理员系统。
- 图片上传。数据模型可预留后续附件扩展，但本阶段不引入尚不存在的对象存储。

## 2. 架构选择

U圈继续位于现有 Spring Boot 模块化单体中，新增 `community` 业务模块。小程序通过现有 HTTPS API 访问；管理员继续使用网站的 `ROLE_ADVISER` 会话和 `/api/v1/adviser/**` 权限边界。

```text
微信小程序 ──HTTPS──> Spring Boot community 模块 ──> PostgreSQL
                                      │
                                      └──> Redis（限流、短缓存、幂等保护）

管理员网站 ──Cookie Session──> /api/v1/adviser/community/**
```

选择该方案的原因：

- 复用现有部署、账号、权限、审计、数据库和 Redis 基础设施。
- 5,000 用户与 500 同时在线不需要拆分微服务。
- 避免消息队列、跨服务事务和额外运维成本。
- `community` 模块保持清晰边界，未来容量真的超过单体承载时仍可按接口拆分。

## 3. 模块边界

后端新增 `com.yangdoujiao.website.community`，内部遵循现有 `Controller → Service → Repository → PostgreSQL` 流程。

- `CommunityPostController`：公开帖子列表、详情和登录用户的发布、删除。
- `CommunityCommentController`：评论列表、发布和删除。
- `CommunityReactionController`：帖子与评论点赞、取消点赞。
- `CommunityReportController`：登录用户提交举报。
- `AdviserCommunityModerationController`：审核队列与审核操作，仅 `ROLE_ADVISER` 可访问。
- `CommunityService`：帖子、评论、归属校验、计数与状态规则。
- `CommunityModerationService`：风险检查、举报聚合、隐藏、恢复、禁言和封禁。
- `CommunityRateLimiter`：账号与 IP 双重限流；沿用项目已有 Redis 限流模式。
- `CommunityAuditLogger`：只记录业务标识、操作者标识、动作、原因代码和结果，不记录帖子或评论全文。

小程序继续使用现有 `services/http.ts` 和登录令牌生命周期。页面不得自行创建第二套请求层或把访问令牌写入持久存储。

## 4. 身份与展示

- 所有帖子、评论、点赞和举报都绑定真实 `user_accounts.id`。
- 前台只展示用户主动保存的昵称和头像；未设置时展示品牌默认头像和“微信用户”。
- `openid`、邮箱、手机号、账号 ID 和封禁原因不得出现在公开 DTO 中。
- 首版不允许匿名发帖或匿名评论。
- 普通用户只能删除自己的内容；首版不提供编辑接口，也不能查看举报人或管理员信息。
- 管理员能力不通过小程序令牌开放；审核只在现有网站后台使用 Adviser 会话。

## 5. 数据模型

### 5.1 `community_posts`

- `id BIGINT` 主键。
- `author_account_id BIGINT`，外键指向 `user_accounts`。
- `body TEXT`，存纯文本，不存 HTML。
- `status`：`PENDING_REVIEW`、`PUBLISHED`、`HIDDEN`、`DELETED`、`REJECTED`。
- `risk_reason_code`，仅内部使用。
- `comment_count`、`like_count`，非负计数。
- `published_at`、`created_at`、`updated_at`。
- `version BIGINT`，用于乐观锁与审核并发保护。

索引：

- `(status, published_at DESC, id DESC)` 支持最新列表游标。
- `(author_account_id, created_at DESC, id DESC)` 支持个人内容。
- 热门排序使用可解释的时间衰减分数；首版由数据库查询产生并短时缓存，不把缓存值作为事实来源。

### 5.2 `community_comments`

- `id BIGINT` 主键。
- `post_id BIGINT`、`author_account_id BIGINT`。
- `parent_comment_id BIGINT NULL`、`reply_to_account_id BIGINT NULL`。
- `body TEXT`、`status`、`like_count`、时间字段和 `version`。
- 数据库校验回复目标属于同一帖子。

首版 API 只呈现两层：顶层评论与回复列表。回复不能继续形成无限嵌套树。

索引：

- `(post_id, status, created_at, id)`。
- `(parent_comment_id, status, created_at, id)`。
- `(author_account_id, created_at DESC, id DESC)`。

### 5.3 `community_reactions`

- `account_id BIGINT`。
- `target_type`：`POST` 或 `COMMENT`。
- `target_id BIGINT`。
- `created_at`。
- 唯一约束 `(account_id, target_type, target_id)`，保证重复点赞幂等。

点赞与取消点赞在同一数据库事务中更新关系和对应计数。计数出现异常时可以从关系表重建。

### 5.4 `community_reports`

- 举报人、目标类型、目标 ID、原因代码、可选补充说明。
- 状态：`OPEN`、`RESOLVED_ACTIONED`、`RESOLVED_REJECTED`。
- `handled_by_account_id`、`handled_at`、`resolution_reason_code`。
- 同一账号对同一目标只能存在一条 `OPEN` 举报。

### 5.5 `community_moderation_actions`

保存管理员、目标、动作、原因代码、操作前后状态和时间。该表只追加，不更新或删除，用于追溯隐藏、恢复、驳回举报、禁言和封禁。

### 5.6 `community_user_restrictions`

保存账号、限制类型、原因、开始时间、可选到期时间、创建管理员和解除信息。限制类型首版为 `MUTED` 与 `BANNED`。

## 6. HTTP API

### 6.1 小程序接口

| 方法 | 路径 | 认证 | 用途 |
| --- | --- | --- | --- |
| `GET` | `/api/v1/community/posts` | 可选 | 最新或热门帖子游标列表 |
| `POST` | `/api/v1/community/posts` | Bearer | 发布纯文字帖子 |
| `GET` | `/api/v1/community/posts/{id}` | 可选 | 帖子详情与当前用户互动状态 |
| `DELETE` | `/api/v1/community/posts/{id}` | Bearer | 作者删除自己的帖子 |
| `GET` | `/api/v1/community/posts/{id}/comments` | 可选 | 评论游标列表 |
| `GET` | `/api/v1/community/posts/{id}/comments/{parentId}/replies` | 可选 | 指定顶层评论的回复游标列表 |
| `POST` | `/api/v1/community/posts/{id}/comments` | Bearer | 发布评论或回复 |
| `DELETE` | `/api/v1/community/comments/{id}` | Bearer | 作者删除自己的评论 |
| `PUT` | `/api/v1/community/posts/{id}/like` | Bearer | 点赞帖子 |
| `DELETE` | `/api/v1/community/posts/{id}/like` | Bearer | 取消帖子点赞 |
| `PUT` | `/api/v1/community/comments/{id}/like` | Bearer | 点赞评论 |
| `DELETE` | `/api/v1/community/comments/{id}/like` | Bearer | 取消评论点赞 |
| `POST` | `/api/v1/community/reports` | Bearer | 举报帖子或评论 |
| `GET` | `/api/v1/community/me/posts` | Bearer | 当前用户的帖子 |
| `GET` | `/api/v1/community/me/comments` | Bearer | 当前用户的评论 |

创建帖子、评论和提交举报的请求必须携带 `Idempotency-Key`。服务端按账号、操作类型和幂等键去重，不允许客户端通过重试创建重复帖子、评论或举报。点赞与取消点赞的 `PUT`／`DELETE` 请求本身幂等，不要求 `Idempotency-Key`。

游标由服务端生成并签名或编码为不透明字符串。客户端不得拼装时间和 ID。默认每页 20 条，最大 50 条；无效或过期游标返回稳定的校验错误。

任务 2 审查补充：热门排序使用 PostgreSQL 生成实际排名、Redis 保存唯一共享的 45 秒派生快照，游标绑定快照版本及下一位置，期间点赞或评论计数变化不得改变同一快照的顺序。快照过期或丢失返回 `409 COMMUNITY_HOT_SNAPSHOT_EXPIRED`，客户端从首屏重启；Redis 不可用返回 `503 COMMUNITY_HOT_SNAPSHOT_UNAVAILABLE`，不得改用新的排名继续旧游标。生产必须配置至少 32 字节、所有实例一致的 `APP_COMMUNITY_CURSOR_SECRET`。

快照发布在同一 Redis 原子操作内校验构建者仍拥有创建锁，失去锁的旧构建者不得覆盖新的 current 版本。旧构建者最多读取一次获胜快照；获胜快照尚未就绪或已消失时返回上述暂时不可用错误。热门快照最多保存 100,000 个排名 ID，超过边界返回 `503 COMMUNITY_HOT_SNAPSHOT_TOO_LARGE`，不得静默截断；上线容量验收需评估此边界。

评论页默认 20 个、最多 50 个顶层评论，每个评论只内嵌首批最多 3 条回复，并返回 `repliesNextCursor`（没有更多回复时为 null）。后续回复使用上表的 replies 路由与该游标加载，默认 20 条、最多 50 条，按创建时间及 ID 升序；游标绑定帖子及顶层评论，所有 ID 为十进制字符串。回复返回空的 replies 与 null 的 repliesNextCursor，保持两层结构。

任务 6 跨层契约补充：

- 所有游标页只包含 `{items,nextCursor}`，`nextCursor` 必须为服务端签名的不透明字符串或 null。个人接口仅返回当前认证作者，默认 20、最大 50；按 `(createdAt,id)` 降序，游标同时绑定作者和 posts／comments 路由，24 小时有效。作者绑定采用独立用途前缀的 HMAC，不把账号 ID 放入可解码游标。缺失、额外字段、错误类型、篡改、错误路由／作者和过期游标返回 `400 INVALID_COMMUNITY_CURSOR`。
- 个人帖子条目精确字段为 `{id,body,status,statusMessage,createdAt,publishedAt,commentCount,likeCount}`。个人评论条目为 `{id,postId,parentCommentId,body,status,statusMessage,createdAt,likeCount}`。所有 ID 为正整数、64 位范围内的规范十进制字符串；评论 `parentCommentId` 可为 null，帖子 `publishedAt` 可为 null，其他字段不可空。个人评论读取不依赖帖子或顶层评论公开状态，保留自己的回复与删除内容。
- 个人 `status` 保留实体的 `PUBLISHED`、`PENDING_REVIEW`、`HIDDEN`、`DELETED`、`REJECTED`；固定 `statusMessage` 依次为“已发布”“审核中”“内容暂不可公开展示”“已删除”“内容未通过审核”。个人 DTO 不返回账号、回复对象账号、联系方式、内部风险原因或审核操作者。
- 公开帖子摘要字段为 `{id,authorName,authorAvatarUrl,bodyPreview,commentCount,likeCount,publishedAt,likedByMe}`；详情以 `body` 替换 `bodyPreview`，并额外返回安全布尔值 `ownedByMe`。评论字段为 `{id,authorName,authorAvatarUrl,body,createdAt,likeCount,likedByMe,ownedByMe,replies,repliesNextCursor}`，预览回复与回复分页同样返回 `ownedByMe`。`ownedByMe` 仅由服务端根据可选认证 viewer 与作者账号计算，匿名读取固定为 false，不返回作者账号 ID，也不允许客户端根据昵称推断归属。已发布时间不可空，头像仅为安全 HTTPS URL 或 null（使用现有品牌默认展示）。不存在已批准的本地头像 URL 契约。
- 创建响应精确为 `{id,postId,parentCommentId,body,status,createdAt,publishedAt}`；状态仅为 `PUBLISHED`／`PENDING_REVIEW` 的原始回执。帖子坐标 `postId`／`parentCommentId` 均为 null，已发布帖子有发布时间，审核中帖子发布时间为 null；评论 `postId` 为字符串、顶层评论 `parentCommentId` 为 null、回复为字符串，评论的 `publishedAt` 始终为 null。重复请求保留最初响应。
- 新的发帖、评论、点赞、举报受社区限制时返回 403，稳定代码 `COMMUNITY_USER_RESTRICTED`，在既有安全错误外层附加 `details:{restrictionKind:"MUTE"|"BAN",endsAt:ISO时间|null}`。MUTE 采用实际到期时间（历史无到期记录为 null），BAN 为永久限制，endsAt 为 null；多条生效限制优先 BAN，否则选择最晚 MUTE 到期，永久 MUTE 优先。已过期、未开始或已解除的限制不生效。不返回原因、操作者、账号 ID。一般账号不可写时仍可返回没有 details 的同名安全错误；已有幂等回执与取消点赞的既有清理语义保持不变。
- 小程序错误只保留允许的稳定代码和经严格校验的上述 details；错误详情缺字段、多字段、错误枚举、无效 ISO 时间或 BAN 非空到期时间时降级为无详情的安全错误，不显示后端原始 message／fieldErrors／traceId。热门 409 的完整代码 `COMMUNITY_HOT_SNAPSHOT_EXPIRED` 保持可区分；`REQUEST_SUPERSEDED` 原样传递。
- 客户端 `createSubmissionKey()` 每次新提交只调用一次，三个 POST 服务必须由调用方提供并复用 `idempotencyKey`，包括网络或刷新登录后的重试。取消点赞、点赞和删除不要求该键。公开读取随共享会话附加 Bearer，匿名读取可用；访问令牌仍只保留于共享会话内存。
- 任务 6 审查修正：公开社区 GET／HEAD 未提供 Bearer 时允许匿名读取；提供无效或过期 Bearer 时返回既有安全 `401 UNAUTHORIZED`，不得降级为匿名成功。有效 Bearer 返回个人点赞状态，Cookie 会话的既有读取行为保持。小程序通过共享 HTTP 层刷新一次后使用新的内存令牌重试；再次 401 必须终止。个人状态说明必须与上述状态精确配对，任意说明或错配均拒绝。游标负载和签名均须为规范无填充 Base64URL，包括末尾未用位为零；客户端只检查形状，不解析负载或验证签名。

### 6.2 管理员接口

| 方法 | 路径 | 用途 |
| --- | --- | --- |
| `GET` | `/api/v1/adviser/community/moderation` | 待审核、已处理或已隐藏列表 |
| `GET` | `/api/v1/adviser/community/moderation/{targetType}/{targetId}` | 内容、举报上下文和历史动作 |
| `POST` | `/api/v1/adviser/community/moderation/{targetType}/{targetId}/actions` | 隐藏、恢复、驳回、禁言或封禁 |

管理员操作请求包含目标 `version` 和必填原因代码。版本冲突返回 `409`，不得覆盖另一名管理员刚完成的决定。

任务 5 实施契约：

- 举报请求为 `{targetType, targetId, reasonCode, note?}`，`targetType` 为 `POST`／`COMMENT`，`targetId` 为正整数十进制字符串；`note` 为可选纯文本。举报原因固定为 `SPAM`、`HARASSMENT`、`SCAM`、`INAPPROPRIATE_CONTENT`、`OTHER`。响应仅含字符串 `id`、`targetId`、`targetType`、`status` 和 `createdAt`，不含举报人或说明。
- 首次举报返回 201；同一账号／目标已有 OPEN 举报时返回 200，不增加举报行。每个新幂等键仍需消耗举报预算并持久化回执，Redis 不可用返回 503；原键相同规范化请求返回保存的原响应，原键不同请求返回 409。说明只规范化 CRLF／CR 为 LF，按 Unicode code point 校验 500 上限；无法存储的 NUL 或非法代理码返回 400。
- `APP_COMMUNITY_AUTO_HIDE_REPORT_THRESHOLD` 默认 5，允许 2–100，后端和部署预检均校验。达到不同账号的 OPEN 举报阈值时，保护性隐藏仅执行一次，追加 `AUTO_HIDE`／`REPORT_THRESHOLD` 动作，举报保持 OPEN 等待人工审核。
- 审核队列查询参数为 `status=PENDING|HIDDEN|PROCESSED`（默认 PENDING）、可选 `targetType`、举报 `reasonCode`、ISO 时间 `from`／`to`、`cursor`、`size`（默认 20，1–50）。PENDING 包含待审核内容或有 OPEN 举报的内容，PROCESSED 包含已有动作的目标。返回 `{items,nextCursor}`；游标绑定过滤条件，按 `(createdAt,targetId,targetType)` 降序稳定分页。条目字段为 `targetType,targetId,status,bodyPreview,version,openReportCount,createdAt`；正文预览上限 160 code points。
- 详情字段为 `targetType,targetId,status,body,postId,parentCommentId,version,openReportCount,reports,actions,actionsNextCursor`。`reports` 仅汇总 `reasonCode,status,count`，不返回说明和举报人。动作仅含字符串 `id`、`command,reasonCode,previousStatus,nextStatus,createdAt`，不返回操作者身份；每页最多 20 项，用 `actionsCursor` 续页。
- 决策请求为 `{command,reasonCode,version,restrictionEndsAt?}`。HIDE／MUTE／BAN 使用 `SPAM`、`HARASSMENT`、`SCAM`、`INAPPROPRIATE_CONTENT`、`POLICY_VIOLATION`；RESTORE 使用 `APPEAL_ACCEPTED` 或 `REVIEW_APPROVED`；REJECT_REPORT 使用 `REPORT_UNFOUNDED`。所有决策推进目标版本，在同一事务追加动作并处理目标的所有 OPEN 举报。REJECT_REPORT 结为 RESOLVED_REJECTED，其他人工决策结为 RESOLVED_ACTIONED。
- HIDE 允许 PUBLISHED／PENDING_REVIEW 转 HIDDEN；RESTORE 允许 HIDDEN／PENDING_REVIEW 转 PUBLISHED，评论恢复还要求帖子及回复根可见。DELETED／REJECTED 不可恢复或再隐藏、禁言、封禁；REJECT_REPORT 可处理其保留的 OPEN 举报。MUTE／BAN 保持内容状态，限制施加于目标作者账号。MUTE 必须提供未来且不超过 30 天的到期时间；BAN 为永久社区限制，到期字段必须为空。限制到期后立即按现有限制查询恢复新写入权限；与任务 4 一致，仍为 ACTIVE 的受限账号可取消自己的点赞。
- 正常回复 200 并返回最新详情；无效原因／时长／过滤器为 400，版本冲突为 `409 COMMUNITY_VERSION_CONFLICT`，无效状态转换为 `409 COMMUNITY_MODERATION_TRANSITION`。审核继续使用 Cookie Adviser 会话及 CSRF；小程序 Bearer 不能取得审核能力。
- 举报 targetType／reasonCode 与审核 command／reasonCode 仅接受大小写及空白完全一致的枚举字符串；拒绝数字、字符串序号及其他 JSON 类型。审核 version 必须为非负、64 位范围内的 JSON 整数字面量；小数、指数写法、字符串、布尔值和 null 均返回 400。这些规则仅在本模块的枚举及请求属性生效，不修改全局 Jackson 配置。
- 新举报可以针对 HIDDEN 帖子；HIDDEN 顶层评论还要求帖子为 PUBLISHED，HIDDEN 回复还要求帖子和顶层根评论均为 PUBLISHED。原键回执重放及已有 OPEN 举报的重复提交保留既有行为。MUTE 取得作者／帖子／评论锁后再次以同一个时间基准校验到期时间，并将该时间保存为 startsAt，避免等待锁期间跨过到期或 30 天边界。
- 隐藏／恢复在提交后只删除热门 current 指针，保留已发行快照；可见评论数按已发布帖子／根评论规则重建，保留各目标的点赞证据。审计仅在事务提交后输出结构化 trace、数字 ID、动作、原因代码及结果；回滚不输出成功。
- 审计关联值为带独立用途前缀的 SHA-256 固定长度摘要，绝不写入调用方原始 X-Trace-Id／MDC 文本。日志事件的 MDC 只保留该摘要关联值；输出后恢复请求上下文，防止日志格式或 appender 泄露其他 MDC 中的正文、说明或联系方式。

## 7. 发布与审核流程

1. 校验 Bearer 登录、账号状态、正文长度、字符规范和幂等键。
2. 按账号与 IP 执行频率限制。
3. 对纯文本执行敏感词与风险规则检查。
4. 正常内容立即写入 `PUBLISHED`。
5. 明确禁止内容直接拒绝；需要人工判断的高风险内容写入 `PENDING_REVIEW`，不进入公开列表。
6. 举报累计达到配置阈值或命中严重规则时，将内容转为 `HIDDEN` 并进入审核队列。
7. Adviser 在网站后台执行隐藏、恢复、驳回举报、限时禁言或封禁；操作在事务提交成功后写审计事件。

删除采用业务状态 `DELETED`，不物理删除举报与审核证据。公开接口只返回 `PUBLISHED` 内容；作者查看自己的内容时可看到审核中、隐藏或已删除状态及不泄露内部规则的用户提示。

文本边界按 Unicode code point 计算：帖子正文 1–2,000 字，评论正文 1–1,000 字，举报补充说明 0–500 字。后端执行最终校验，客户端计数只用于即时提示。

## 8. 限流与风险控制

首版默认限制：

- 发帖：每账号每分钟 2 条、每天 30 条。
- 评论：每账号每分钟 10 条、每天 300 条。
- 举报：同一账号对同一目标只能有一条未结举报，并设置每日总量限制。
- 登录用户按账号与可信客户端地址双重限制；地址仅用于短期限流键，不写业务表或审计正文。

限制值必须通过带边界校验的配置项提供。生产环境拒绝非正数或危险的大值。Redis 短暂不可用时：

- 最新列表、帖子详情、评论与回复读取继续使用 PostgreSQL。
- 热门快照构建与续页返回 `503 COMMUNITY_HOT_SNAPSHOT_UNAVAILABLE`；不得在 Redis 故障时重新计算排名后继续旧游标。Redis 恢复后可从热门首屏重启，业务帖子、互动和审核数据仍以 PostgreSQL 为真源。
- 发帖、评论和举报失败关闭，返回明确的暂时不可用错误，不能绕过限流无保护放行。
- 点赞依赖唯一约束保持正确，可在 Redis 恢复前不使用缓存。

## 9. 小程序体验

### 9.1 帖子列表

- `最新` 与 `热门` 两个标签。
- 下拉刷新、游标加载更多、骨架加载、空状态、失败状态、离线状态和重试。
- 快速切换标签时取消旧请求，只允许最新请求更新页面。
- 每个小程序 Page 实例创建一个仅用于请求协调的非敏感 `requestScope`；同一实例、同一资源的刷新可取消旧读取，不同 Page 实例即使读取同一帖子或同一 feed 也不得互相取消。`requestScope` 只进入本地请求键，不发送给服务端。
- 帖子、顶层评论分页和每个根评论的回复分页分别维护请求代次。顶层追加不得使正在加载的回复失效；刷新与卸载会统一失效回复请求并清除回复加载态。
- 卡片展示昵称、头像、时间、正文摘要、评论数和点赞数。
- 同一头像 URL 的详情刷新保留图片失败回退；只有 URL 实际变化时才允许重新尝试远程头像。

### 9.2 帖子详情

- 展示完整正文、作者、发布时间、点赞、举报和两层评论。
- 评论分页独立于帖子详情加载。
- 已隐藏、已删除或不存在使用不同状态，不把所有错误统一显示为“没有内容”。

### 9.3 发布与举报

- 发布页为纯文字输入，展示字数、社区规范、提交中和结果状态。
- 重复点击由客户端按钮状态和服务端幂等共同防护。
- 举报弹层使用固定原因代码，并允许有限长度补充说明。

### 9.4 个人内容

- 用户可查看自己的帖子和评论，包括审核中或被隐藏的状态。
- 用户可删除自己的内容，但不能修改审核状态或删除举报记录。
- 被禁言或封禁时展示明确原因类别和到期时间，不展示内部检测规则。

## 10. 管理员体验

在现有 Adviser 后台增加 `U圈审核` 导航项，复用现有登录和页面框架。

- 队列标签：待审核、已处理、已隐藏。
- 列表支持状态、目标类型、原因与时间筛选。
- 详情同时展示内容、必要上下文、举报汇总和历史审核动作。
- 隐藏、恢复、驳回举报、禁言和封禁都必须填写原因。
- UI 使用乐观锁版本；遇到 `409` 时刷新最新状态并提示已由其他管理员处理。
- 审核页面不得在浏览器日志、URL 或分析事件中包含帖子全文、举报补充说明或用户联系方式。

## 11. 缓存与性能

- 最新列表直接使用覆盖索引和游标查询。
- 热门列表可缓存 30–60 秒，缓存键包含排序版本与页游标。
- 删除、隐藏或恢复后主动失效受影响的热门缓存；即使失效失败，短 TTL 也保证最终恢复。
- 当前页的点赞状态批量查询，禁止每条帖子额外发起一次请求。
- 评论数和点赞数保存在 PostgreSQL，并提供从关系表校正的维护查询。
- 数据库连接池、HTTP 线程池和 Redis 超时必须有生产边界；请求不得无限等待。

第一版不引入 Elasticsearch。只有在真实需求需要社区全文检索且 PostgreSQL 查询无法满足时，才增加可从 PostgreSQL 重建的搜索索引。

## 12. 错误、隐私与日志

- 复用现有稳定错误契约：校验、未登录、无权限、限流、冲突、暂时不可用和意外错误必须可区分。
- 原始数据库异常、敏感词规则、用户标识和内部堆栈不得返回客户端。
- 日志只记录 trace ID、目标 ID 的安全标识、动作和结果，不记录正文、举报说明、令牌或微信身份数据。
- 所有公开文本按纯文本输出；前端不得使用不受控 HTML 渲染。
- 账号注销与数据保留按平台隐私政策执行，审核证据的保留周期在上线前由业务与合规共同确认。

## 13. 可观测性与容量验收

指标至少包括：

- 帖子列表、详情、发布和评论的 P50、P95、P99 延迟。
- HTTP 错误率、限流次数和幂等命中次数。
- 待审核数量、最老待审核时长、举报处理时长。
- PostgreSQL 连接池、慢查询、锁等待和表/索引增长。
- Redis 命中率、超时和不可用次数。

容量验收场景：

- 5,000 个测试账号数据集。
- 500 个同时在线虚拟用户。
- 稳态 100 次/秒读取、20 次/秒写入。
- 最新列表、热门列表、详情、评论、点赞和发布按真实比例混合。
- Redis 暂时不可用、单个慢查询、重复写请求和管理员并发审核故障注入。

通过条件：无数据重复或丢失，错误率和延迟在实施计划确定的生产阈值内，数据库连接池不耗尽，恢复 Redis 后无需人工修复业务数据。

## 14. 测试策略

自动测试覆盖：

- 数据库约束、索引、状态枚举和迁移回滚安全。
- 公开列表只出现 `PUBLISHED` 内容。
- 作者归属、Adviser 权限、越权删除和管理员接口隔离。
- 游标稳定性、相同时间记录、删除后的下一页和最大页大小。
- 重复点赞、重复取消、幂等发布、幂等评论与重复举报。
- 敏感词、风险状态、自动隐藏、恢复、禁言、封禁和审计。
- Redis 正常、超时和不可用三种情况。
- 小程序最新请求覆盖保护、断网、重试、空状态和账号限制提示。
- 管理员并发审核的 `409` 行为与隐私安全日志。

人工验收覆盖：

- 微信开发者工具与至少一台真机上的列表、详情、发布、评论、点赞、举报、个人内容和登录失效。
- 小屏、安全区、大字体、断网、弱网和重复点击。
- Adviser 后台的完整审核与并发冲突流程。
- 达到本规格容量模型的自动化压测报告。

## 15. 发布顺序

1. 合并数据库迁移、领域模型和只读接口，功能开关默认关闭。
2. 合并发布、评论、点赞、举报、限流和审核接口。
3. 合并 Adviser 审核页面并用测试账号完成全流程。
4. 合并小程序 U圈页面，在体验版完成真机验收。
5. 执行容量压测、隐私检查和生产预检。
6. 生产部署后先向内部体验成员开放，再逐步打开功能开关。

回滚时先关闭 U圈写入功能，保留只读或维护状态；不得通过删除数据库表或清空 Redis 回滚。

## 16. 已确认决策

- 容量按 5,000 注册用户、500 同时在线设计。
- 正常内容先发布后审核，高风险内容自动拦截或进入人工审核。
- 不允许匿名发帖，前台使用昵称头像，后台关联真实账号。
- 采用模块化单体、PostgreSQL 与 Redis，不引入微服务或消息队列。
- 首版包含帖子、评论、点赞、举报和管理员审核，不包含私信、群聊或文件上传。
