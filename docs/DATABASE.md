# 数据库说明

## 数据库职责

PostgreSQL 是本项目的主数据库，也是业务数据的唯一真实来源（Source of Truth）。
Redis 只负责缓存，Elasticsearch 只负责全文搜索；即使缓存或搜索索引被清空，也必须
能够根据 PostgreSQL 中的数据重新生成。

当前 V5 已建立院校、课程、筛选字典、搜索别名和可重试同步任务的数据结构。
仓库不包含老板尚未提供的正式 Excel 数据，测试数据只存在于临时测试容器中。

## 数据库版本管理

数据库结构由 Flyway 管理，迁移文件位于：

`backend/src/main/resources/db/migration/`

当前迁移版本：

- `V1__create_universities_table.sql`：创建最初的院校表。
- `V2__create_catalog_tables.sql`：创建国家表和专业分类表。
- `V3__extend_universities_and_create_programmes.sql`：扩展院校资料，并创建课程、课程字典、授课语言关系和入学时间表。
- `V4__create_search_support.sql`：补充课程总学费字段，并创建搜索别名和索引同步任务表。
- `V5__add_search_sync_job_lock_token.sql`：为每次同步任务领取增加独立 UUID lease token，防止过期 worker 修改已被新 worker 重新领取的任务。

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
`FAILED`；过期 `PROCESSING` 任务可重新领取。

## Java 数据访问层

主要代码位置：

- `catalog/`：国家、专业分类、学历层次、课程模式和语言字典。
- `university/`：院校实体与 Repository。
- `programme/`：课程、课程语言关系、入学时间及其 Repository。
- `search/v4/`：搜索投影、Elasticsearch 查询、索引重建、别名解析和增量同步任务。

标准的数据访问顺序是：

`Controller → Service → Repository → PostgreSQL`

实体类负责数据库映射。REST API 应使用独立 DTO 返回数据，避免数据库结构直接绑定
前端页面。当前已提供筛选字典和院校课程搜索 API，但正式数据导入仍需等待老板提供资料。

## 测试与本地数据安全

数据库结构和 Repository 集成测试使用 Testcontainers 创建临时 PostgreSQL。测试不
连接开发人员自己的数据库，执行结束后临时容器和数据会自动清理。

真实数据库密码只保存在每位开发人员自己的 `.env` 中，不能提交到 GitHub，也不要在
群聊中共享。仓库中的 `.env.example` 只提供变量名称和安全示例。
