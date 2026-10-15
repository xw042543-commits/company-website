# 数据库说明

## 数据库职责

PostgreSQL 是本项目的主数据库，也是业务数据的唯一真实来源（Source of Truth）。
Redis 用于缓存、社区热门快照和社区写入限流，Elasticsearch 用于全文搜索；
业务记录必须保存在 PostgreSQL 中，搜索投影和缓存可根据主数据库重建。
Redis 不可用时，社区写入和热门快照按接口契约返回不可用状态，不能绕过限流写入。

当前迁移已到 V48，包含院校、课程、媒体、用户认证、咨询处理、小程序收藏与规划、
社区、钱包、消息、申请进度和头像的数据结构。
仓库内的数据整理及导入资料包不等于正式发布批准；发布仍须依据业务负责人确认的资料。
数据库集成测试使用临时测试容器，不连接真实业务数据库。

## 数据库版本管理

数据库结构由 Flyway 管理，迁移文件位于：

`backend/src/main/resources/db/migration/`

当前迁移版本：

- `V1__create_universities_table.sql`：创建最初的院校表。
- `V2__create_catalog_tables.sql`：创建国家表和专业分类表。
- `V3__extend_universities_and_create_programmes.sql`：扩展院校资料，并创建课程、课程字典、授课语言关系和入学时间表。
- `V4__create_search_support.sql`：补充课程总学费字段，并创建搜索别名和索引同步任务表。
- `V5__add_search_sync_job_lock_token.sql`：为每次同步任务领取增加独立 UUID lease token，防止过期 worker 修改已被新 worker 重新领取的任务。
- `V6__create_content_articles.sql`：创建公开文章表。
- `V7__create_consultation_enquiries.sql`：创建默认关闭的留学咨询数据表。
- `V8__create_user_authentication.sql`：创建用户账号、验证与重置 Token、认证限流和 Spring Session 表。
- `V9__create_user_external_identities.sql`：创建账号与微信外部身份的关联。
- `V10__allow_external_only_user_accounts.sql`：支持没有邮箱、手机号和密码的外部身份账号。
- `V11__add_external_identity_profile.sql`：为外部身份增加昵称和头像地址。
- `V12__add_adviser_consultation_management.sql`：增加顾问角色、咨询处理状态和乐观锁版本。
- `V13__add_miniapp_authentication.sql`：增加小程序身份提供方和访问/刷新令牌表。
- `V14__extend_programme_details.sql`：补充课程来源、申请截止时间及详情章节。
- `V15__create_university_and_programme_media.sql`：创建院校和课程媒体表。
- `V16__create_miniapp_user_data.sql`：关联咨询所属账号，创建课程收藏和留学规划表。
- `V17__create_community.sql`：创建社区帖子、评论、点赞、举报、审核、限制和幂等记录表。
- `V18__persist_community_write_receipts.sql`：持久化社区写入回执以支持幂等重放。
- `V19__create_miniapp_wallet.sql`：创建小程序钱包账户和流水表。
- `V20__inbox_notifications.sql`：创建收件箱通知表。
- `V21__create_student_applications.sql`：创建学生申请、文档、费用和进度事件表。
- `V22__create_miniapp_account_avatars.sql`：创建小程序账号头像存储表。
- `V23__community_boards.sql`：为帖子增加标题、分类和所属院校。
- `V24__community_feed_scope_indexes.sql`：增加按院校和分类读取社区列表的索引。
- `V39` 至 `V43`：记录专业前景与课程章节的来源类型，并完成分片审计。
- `V44` 至 `V47`：按院校分组增量核对马来西亚已发布专业的基本信息，保留无法确认的客观字段为待核实。
- `V50__add_basic_info_source_provenance.sql`：为专业、入学时间和入学条件补充来源类型与来源说明；来源类型仅允许 `official`、`third_party` 或 `ai_generated`。

已经在任何环境执行过的迁移文件不能直接修改。后续需要调整结构时，应新增
新的顺序版本迁移，确保三名开发人员、CI 和服务器按相同顺序升级数据库。

## 表之间的关系

```text
countries ──────────────── universities
                                 │
subject_categories ──────────────┤
study_levels ────────────────────┤
course_modes ────────────────────┤
                                 ▼
                             programmes
                              │       │
                              │       └── programme_intakes
                              │
languages ── programme_languages
```

一所院校可以开设多门课程。一门课程属于一个专业分类，可以关联学历层次、课程模式、
多种授课语言和多个入学时间。

## 基础目录表

### countries

保存国家信息，用于院校资料和国家筛选。

- `code`：两位大写国家代码，例如 `MY`、`SG`，不可重复。
- `name_zh`、`name_en`：中英文名称，至少填写一个。
- `continent_code`：洲别代码，例如 `ASIA`、`EUROPE`。
- `created_at`、`updated_at`：创建和更新时间。

### subject_categories

保存专业分类，不代表某所学校实际开设的课程。例如“商业与管理”可以是父分类，
“会计”可以是它的子分类。

- `code`：稳定且唯一的分类代码，例如 `BUSINESS`。
- `name_zh`、`name_en`：中英文名称，至少填写一个。
- `parent_id`：上级分类；顶级分类可以为空。
- `sort_order`：同级显示顺序，不能小于 0。
- `status`：`DRAFT`、`PUBLISHED` 或 `ARCHIVED`。
- `created_at`、`updated_at`：创建和更新时间。

删除父分类时不会自动删除子分类，避免误删整棵分类树。

### study_levels、course_modes、languages

这三张表保存课程筛选使用的字典数据：

- `study_levels`：学历层次，例如本科、硕士。
- `course_modes`：课程模式，例如线下授课、线上授课。
- `languages`：授课语言，例如英语、中文。

三张表都使用稳定且唯一的 `code`，包含中英文名称、显示顺序、发布状态以及创建和
更新时间。代码不会随页面文案变化，前后端和数据导入应使用代码进行关联。

## 业务数据表

### universities

`universities` 保存院校资料。V3 保留了 V1 已有的 `name`、`country`、`popular` 等
字段，因此旧数据和现有院校接口仍可使用；新资料可以逐步写入以下字段：

- `university_code`：院校稳定业务代码，可为空，但填写后必须唯一。
- `name_zh`、`name_en`：中英文院校名称。
- `city_zh`、`city_en`：中英文城市名称。
- `description_zh`、`description_en`：中英文院校简介。
- `country_id`：关联 `countries`；过渡期间可以为空。
- `status`：发布状态，旧记录升级后默认为 `DRAFT`。
- `updated_at`、`published_at`：更新时间和发布时间。

现阶段不能删除旧 `country` 字符串字段。等正式数据完成导入、接口全部改用 DTO，且
旧数据已验证无误后，才能在新的迁移中讨论清理兼容字段。

### programmes

`programmes` 保存学校实际开设的课程或专业项目，是后续专业筛选的主要业务表。

主要字段：

- `programme_code`：课程稳定业务代码，全表唯一且创建后不可修改。
- `university_id`：所属院校，不能为空。
- `subject_category_id`：所属专业分类，不能为空。
- `study_level_id`：学历层次，可以为空。
- `course_mode_id`：课程模式，可以为空。
- `slug`：院校详情页内使用的网址标识；同一院校内不能重复。
- `name_zh`、`name_en`：中英文名称，至少填写一个。
- `description_zh`、`description_en`：中英文课程介绍。
- `duration_months`、`duration_display`：标准化学制和原始展示文字。
- `tuition_min`、`tuition_max`、`tuition_currency`、`tuition_display`：原币学费范围、三位币种代码和展示文字。
- `tuition_rmb_min`、`tuition_rmb_max`、`exchange_rate`、`exchange_rate_date`：人民币参考值及其换算依据。
- `tuition_fee_period`：原学费的计费周期，可为每年、每学期、全课程或未知。
- `tuition_total_rmb_min`、`tuition_total_rmb_max`：可直接用于搜索筛选的全课程人民币总学费区间。
- `official_url`、`source_checked_at`、`source_type`、`source_reference`：基本信息来源、核对时间、来源类型及来源说明；历史记录没有保留具体出处时必须明确标为待核实，不得伪装成官网资料。
- `status`、`created_at`、`updated_at`、`published_at`：发布和审计信息。

数据库会阻止负数学费、最小值大于最大值、无币种的学费金额、无汇率依据的人民币
参考值，以及不符合格式的课程代码或币种代码。

### programme_languages

保存课程和授课语言的多对多关系。联合主键由 `programme_id` 和 `language_id` 组成，
同一门课程不能重复关联同一种语言。删除课程时会清理关系记录，但不会删除语言字典。

### programme_intakes

保存课程的入学时间。一门课程可以有多条记录：

- `programme_id`：所属课程，不能为空。
- `intake_date`：可用于排序和筛选的标准日期，可以为空。
- `display_text`：老板原始资料中的展示文字，例如 `February 2027`，不能为空。
- `created_at`：记录创建时间。

同时保留标准日期和原始文字，是为了既能进行可靠筛选，又不擅自改变老板提供的内容。

## 搜索支持表

### search_aliases

保存用户可能输入的搜索别名，例如把 `UK` 解析为国家代码 `GB`。别名可指向
国家、专业分类或具体课程。只有 `PUBLISHED` 别名参与公开搜索；相同规范化别名
同时指向不同目标时，服务会拒绝模糊解析。

### search_sync_jobs

保存 PostgreSQL 业务数据到 Elasticsearch 投影的可重试同步任务。重要字段包括：

- `university_id`：需要重建搜索文档的院校。
- `status`：`PENDING`、`PROCESSING` 或 `FAILED`。
- `attempt_count`、`available_at`：重试次数和下次可领取时间。
- `locked_at`、`lock_token`：当前 lease 时间和唯一所有权标识。
- `last_error`：只保存不含业务正文或 Elasticsearch 完整响应的安全错误摘要。

入队必须和未来的院校或课程写入处于同一 PostgreSQL 事务中。当前还没有后台写入
或 Excel 导入入口；后续新增这些入口时，必须在业务事务内调用 `SearchSyncEnqueuer`。

worker 用 PostgreSQL `FOR UPDATE SKIP LOCKED` 安全领取有限批次，提交领取事务后才访问
Elasticsearch。公开院校会把完整投影写入 `universities-v4-write`；未发布、不存在或
没有已发布课程的院校会从索引删除。失败任务按确定性延迟重试，超过上限后标记为
`FAILED`；过期 `PROCESSING` 任务可重新领取。如果 worker 在 Elasticsearch 写入期间丢失
lease，完成时会新建 `PENDING` 补偿任务，以 PostgreSQL 的最新状态再次覆盖索引。
全量重建在原子切换读写别名后，也会对重建前后涉及的院校批量创建补偿任务，
避免重建期间的新增、更新、归档或删除被新索引覆盖。

## Java 数据访问层

主要代码位置：

- `catalog/`：国家、专业分类、学历层次、课程模式和语言字典。
- `university/`：院校实体与 Repository。
- `programme/`：课程、课程语言关系、入学时间及其 Repository。
- `search/v4/`：搜索投影、Elasticsearch 查询、索引重建、别名解析和增量同步任务。
- `auth/`：账号、验证、登录会话、密码恢复、限流和生产安全门控。

标准的数据访问顺序是：

`Controller → Service → Repository → PostgreSQL`

实体类负责数据库映射。REST API 应使用独立 DTO 返回数据，避免数据库结构直接绑定
前端页面。当前已提供筛选字典和院校课程搜索 API；导入与发布应核对已审核资料包和业务批准状态。

## 测试与本地数据安全

数据库结构和 Repository 集成测试使用 Testcontainers 创建临时 PostgreSQL。测试不
连接开发人员自己的数据库，执行结束后临时容器和数据会自动清理。

真实数据库密码只保存在每位开发人员自己的 `.env` 中，不能提交到 GitHub，也不要在
群聊中共享。仓库中的 `.env.example` 只提供变量名称和安全示例。

## 内容文章表

`content_articles` 保存语言、奖学金、留学项目和新闻四个栏目的文章。`section` 与
`slug` 组成唯一网址标识；同一栏目不能重复，跨栏目可使用相同 slug。

每篇文章可以只提供中文或英文，但所提供语言必须同时有非空标题和 Markdown 正文。
摘要、封面、来源和作者可以为空，不会自动生成或翻译。`status` 为 `DRAFT`、
`PUBLISHED`、`ARCHIVED`；发布内容必须填写 `published_at`。公开接口仍会
核对发布时间，未来时间的文章不会提前展示。

数据库仅允许站内 `/content/` 封面路径和 HTTPS 来源网址；正式内容须先由项目组
按老板资料整理并审核，再通过后续受控导入流程进入数据库。本次迁移不插入示例文章。

## 留学咨询表

`consultation_enquiries` 保存用户主动提交的留学咨询资料，包括姓名、联系方式、意向
学校、意向专业、计划申请的学历层次、备注和页面语言。每条记录使用随机
`reference_code` 作为对外查询编号，数据库自增 ID 不对外返回。

为减少个人资料收集，数据库不保存 IP、浏览器信息或请求正文日志。只有明确勾选隐私
同意且服务端已配置正式隐私声明版本时才能写入；数据库也会拒绝未同意、空姓名、空
联系方式、非法学历层次和未知状态。V12 支持 `NEW`、`IN_PROGRESS`、`COMPLETED`，
并记录处理人员、状态更新时间和乐观锁版本；V16 关联提交者账号。

咨询提交开关默认关闭。正式隐私声明、必填规则和处理人员确认前，前端不会开放提交，
后端收到请求也不会保存数据。接口限流只在 Redis 中保存客户端地址的 SHA-256 摘要和
短期计数，10 分钟窗口到期后自动删除，不写入 PostgreSQL。

## 用户认证表

### user_accounts

保存用户姓名、规范化后的邮箱/手机号、密码摘要、验证时间、协议版本和账号
状态。邮箱和手机号分别唯一；密码账号必须填写至少一种联系方式，V10 支持没有联系方式
和密码的外部身份账号。V12 增加 `USER`、`ADVISER` 角色。删除账号采用软删除：状态改为
`DELETED` 并记录 `deleted_at`，不在接口中暴露密码摘要或未脱敏联系方式。

### user_verification_tokens 和 password_reset_tokens

分别保存注册验证和密码重置的一次性 Token。数据库只保存 SHA-256 摘要，不保存可直接
使用的原始 Token。`expires_at` 和 `used_at` 用于限定有效期和阻止重放；短信验证码
还使用 `attempts` 限制单个凭证的猜测次数。邮件验证和密码重置由限流表限制尝试。
使用成功后会在事务内标记已使用。

### auth_rate_limit_buckets

保存认证相关操作的短期限流计数。`subject_hash` 是客户地址或账号标识的 SHA-256
摘要，不保存原始值。认证限流不依赖前端，绕过页面直接请求 API 仍会受到限制。

### spring_session 和 spring_session_attributes

保存 Spring Security 会话及其属性。会话 Cookie 只携带随机会话标识，不包含账号资料。
登录会更换匿名会话 ID，修改/重置密码和删除账号时会作废相关会话。正式环境的
Cookie 必须同时使用 `HttpOnly`、`SameSite=Lax` 和 `Secure`。

## 小程序与后续业务表

- `user_external_identities`：关联网站微信和小程序身份，保存身份展示资料。
- `miniapp_auth_tokens`：保存访问/刷新令牌摘要、过期时间、撤销状态和令牌族关系。
- `university_media`、`programme_media`、`programme_detail_sections`：保存经过审核的媒体和课程详情。
- `miniapp_programme_favorites`、`miniapp_study_plans`：保存账号所属的课程收藏和规划。
- `community_posts`、`community_comments`、`community_reactions`、`community_reports`：
  保存帖子、评论、点赞和举报；帖子支持标题、分类和院校范围。
- `community_moderation_actions`、`community_user_restrictions`、
  `community_idempotency_records`：保存审核证据、用户限制和写入回执。
- `miniapp_wallet_accounts`、`miniapp_wallet_entries`：保存钱包账户和流水；
  页面及记录存在不代表已接通支付渠道。
- `inbox_notifications`：保存账号所属的通知及阅读状态。
- `student_applications`、`application_documents`、`application_fees`、
  `application_events`：保存申请、私有文档、费用记录和进度历史；
  访问限于所属学生及被分配的顾问，见 [申请说明](miniapp-applications.md)。
- `miniapp_account_avatars`：保存用户主动选择上传的头像。

详细字段、约束和索引以对应迁移文件为准；文档中的迁移清单不表示服务器已经执行这些迁移。


## 官网课程结构（V53，发布状态见课程核验报告）

`programme_detail_sections` 新增 JSONB `course_modules`、`curriculum_review_status` 和 `curriculum_version`。课程对象保存中文平台译名、官网原名/原文、可核实的代码/学分/必选修、来源和采集时间、翻译方式与时间。`programme_curriculum_backups` 在替换/隐藏前保存完整旧板块；未核实数据归档而非删除。只处理明确审核范围内马来西亚专业的 CURRICULUM，不更新专业主表。详见 [全量核验报告](../outputs/official-course-modules-20261015/README.md)。


## Excel 导入暂存（V52）

`V52__create_catalog_excel_imports.sql` 新增以下表，并为 programmes 增加可空 campus 字段。
迁移不修改任何已执行迁移，也不变更现有记录的状态或关联。

- `catalog_import_batches`：上传人FK、文件名、类型、时间、分类计数、发布结果与失败摘要。
- `catalog_import_rows`：原始Excel行号、JSONB字段数据、校验/重复分类、解析错误、匹配ID、发布ID。
  有效新数据仅以 DRAFT 保存于此，未确认发布前不写 universities/programmes。
  REMOVED 为软移除，PUBLISHED 行禁止编辑；解析错误重处理时继续保留，显式修正才清除。
- `catalog_entity_aliases`：导入时人工提供的已知别名，按类型/实体ID/规范化别名唯一。
  现有 programme search_aliases 同时参与查重；新增别名用于后续导入识别，不改现有公开搜索逻辑。

发布采用 PostgreSQL 事务与 SHARE ROW EXCLUSIVE 表锁，和其他管理员 INSERT/UPDATE 互斥，
在锁内重新查重后仅 INSERT 新记录，搜索同步入队与发布状态同事务提交。没有永久删除正式数据的路径。
新增校区与别名为空时兼容历史记录；历史校区未知的同名专业按疑似重复交给管理员核对。

已核验课程的正文/来源或专业归属发生变化时，V54 触发器先保存旧证据并改为待核实；仅修改学费不影响课程。后台旧文本编辑器不能保留过期 VERIFIED 列表，也不能把保存时间冒充官网采集时间。
