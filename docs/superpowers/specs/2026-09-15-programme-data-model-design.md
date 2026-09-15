# 院校与课程数据模型设计

**状态：** 已确认  
**日期：** 2026-09-15  
**范围：** V3 数据库结构、JPA 数据访问层与集成测试

## 1. 目标

在不破坏现有院校演示接口和三条演示数据的前提下，为正式的院校与课程资料建立
可维护的数据结构。V3 完成后，PostgreSQL 能规范保存院校、具体课程、学历层次、
课程模式、授课语言和入学时间，为后续多条件筛选 API 提供基础。

PostgreSQL 仍是唯一正式数据源。本阶段不修改 Elasticsearch 索引，也不新增 Redis
缓存逻辑。

## 2. 已确认的原则

- 继续采用模块化单体，不增加微服务或消息中间件。
- 数据库变更只通过新的 Flyway V3 完成，V1 和 V2 保持不变。
- 学历层次、课程模式和语言使用 PostgreSQL 字典表，不使用 Java 枚举写死业务选项。
- 字典项使用稳定代码和中英文名称，供 Excel 导入、后台管理和前端筛选共同使用。
- V3 采用兼容式升级，暂时保留 `universities.name` 和 `universities.country`。
- 未知值使用 `NULL`，前端以后显示“请咨询”，不编造老板尚未提供的数据。
- JPA Entity 不直接作为 REST API 返回值，后续接口使用 DTO 和 Mapper。

## 3. 数据关系

```text
countries
    ↓
universities
    ↓
programmes
    ├── subject_categories
    ├── study_levels
    ├── course_modes
    ├── programme_languages ── languages
    └── programme_intakes
```

一所院校可以开设多个课程。一个课程属于一个最具体的专业分类，可以有多种授课
语言和多个入学时间。

## 4. 字典表

V3 新增 `study_levels`、`course_modes` 和 `languages`。

三张表的共同字段：

- `id`：数据库内部自增主键；
- `code`：稳定且唯一的业务代码；
- `name_zh`、`name_en`：中英文名称，至少填写一个；
- `sort_order`：前端显示顺序，不能小于 0；
- `status`：`DRAFT`、`PUBLISHED` 或 `ARCHIVED`；
- `created_at`、`updated_at`：审计时间。

`study_levels.code` 和 `course_modes.code` 使用大写应用代码，例如 `BACHELOR`、
`MASTER`、`ON_CAMPUS`。`languages.code` 使用稳定的大写语言代码，例如 `EN`、
`ZH`。具体字典数据要根据老板资料确认，本次迁移不插入正式选项。

字典项被课程引用时采用限制删除策略。业务上通过状态归档，不直接物理删除。

## 5. 院校表兼容升级

V3 为 `universities` 增加：

- `university_code`：稳定导入代码，可空但非空值必须唯一；
- `name_zh`、`name_en`：中英文院校名称；
- `city_zh`、`city_en`：中英文城市；
- `description_zh`、`description_en`：中英文介绍；
- `country_id`：关联 `countries`，兼容期允许为空；
- `status`：默认 `DRAFT`；
- `updated_at`：更新时间；
- `published_at`：发布时间，可空。

现有 `name`、`country`、`slug`、`popular` 和 `created_at` 暂时保留。V3 不删除或
改写现有三条演示院校数据，它们的新字段保持为空，状态为 `DRAFT`。现有演示接口
继续使用旧字段。

老板 Excel 到齐后，导入流程会补齐稳定代码、国家关联和双语字段。只有在映射和
数据完成审核后，才通过后续迁移收紧非空约束或移除旧字段。

## 6. 课程表

V3 新增 `programmes`，主要字段为：

- `id`：内部自增主键；
- `programme_code`：全局唯一的稳定导入代码；
- `university_id`：所属院校，不能为空；
- `subject_category_id`：最具体的专业分类，不能为空；
- `study_level_id`：学历层次，草稿阶段可空；
- `course_mode_id`：课程模式，草稿阶段可空；
- `slug`：网址标识，在同一院校内唯一；
- `name_zh`、`name_en`：中英文课程名称，至少填写一个；
- `description_zh`、`description_en`：中英文介绍；
- `duration_months`：用于筛选的标准月数；
- `duration_display`：保留老板提供的原始学制文字；
- `tuition_min`、`tuition_max`：原币最低和最高学费；
- `tuition_currency`：三位大写币种代码；
- `tuition_display`：保留原始学费文字；
- `tuition_rmb_min`、`tuition_rmb_max`：用于统一筛选的人民币金额；
- `exchange_rate`、`exchange_rate_date`：换算汇率及日期；
- `status`：`DRAFT`、`PUBLISHED` 或 `ARCHIVED`；
- `created_at`、`updated_at`、`published_at`：审计与发布时间。

草稿允许暂时缺少学历层次、课程模式、学制和学费。后续 Service 在发布前检查
展示所需字段，避免老板资料尚未齐全时被迫填入猜测值。

## 7. 多语言与入学时间

### programme_languages

使用 `programme_id` 和 `language_id` 作为联合唯一关系。一个课程可以关联多种
授课语言，同一语言不能重复关联。删除语言字典项时，如果仍被课程引用，数据库
会拒绝操作。

### programme_intakes

每条记录包含：

- `id`：内部自增主键；
- `programme_id`：所属课程；
- `intake_date`：可用于筛选的 ISO 日期，未知时可空；
- `display_text`：老板提供的原始入学时间文字，不能为空；
- `created_at`：创建时间。

一个课程可以有多个入学时间。物理删除课程时可清理其语言关系和入学时间，但公开
业务流程默认归档课程，不直接删除。

## 8. 数据库约束

V3 必须通过 PostgreSQL 约束阻止以下无效数据：

- 重复或格式错误的稳定代码；
- 中英文名称同时为空或只有空格；
- 负数排序值；
- 不支持的状态；
- 不存在的院校、专业分类或字典关联；
- 同一院校内重复的课程 `slug`；
- 小于或等于 0 的学制月数；
- 负数学费或人民币金额；
- 最低金额高于最高金额；
- 有原币学费但没有币种；
- 有人民币换算金额但缺少有效汇率或汇率日期；
- 同一课程重复关联同一授课语言；
- 没有任何可显示文字的入学时间。

外键应建立适合查询的索引。字典和被引用的主数据采用 `ON DELETE RESTRICT`，课程
的从属语言关系与入学时间可使用 `ON DELETE CASCADE`。

## 9. Java 模块

字典实体和 Repository 放在：

`com.yangdoujiao.website.catalog`

课程实体和 Repository 放在：

`com.yangdoujiao.website.programme`

院校实体在原有 `university` 模块内兼容扩展。实体使用保护级无参构造和明确的业务
构造方法，不使用 Lombok `@Data`，关联默认使用懒加载。Repository 只负责数据访问，
不包含发布判断、金额换算或导入规则。

后续 API 的标准数据流为：

```text
Next.js
  → Controller
  → Service
  → Repository
  → PostgreSQL
  → Mapper
  → DTO
  → Next.js
```

## 10. 测试策略

先编写 Testcontainers PostgreSQL 集成测试，再创建 V3 和 JPA 映射。测试至少覆盖：

- 空数据库按 `V1 → V2 → V3` 成功建立；
- 带有现有三条院校数据的 V2 数据库能升级到 V3，原数据保持不变；
- 三张字典表可以按稳定代码保存和查询；
- 课程能正确关联院校、专业分类、学历层次和课程模式；
- 一个课程可以读取多种语言和多个入学时间；
- 第 8 节列出的核心约束能拒绝无效数据；
- Hibernate `ddl-auto=validate` 能校验实体和 V3 表结构；
- 原有院校、搜索和热门院校测试继续通过；
- 所有测试只连接 Testcontainers 临时数据库，不接触开发数据库。

对重要约束测试进行变异验证：临时移除对应约束时测试必须失败，恢复约束后测试
必须通过。临时变更不得进入提交。

## 11. 本阶段边界

本阶段只包含 V3、JPA Entity、Repository、集成测试和中文数据库文档。

本阶段不包含：

- 老板 Excel 导入及正式业务数据；
- `/api/v1` 浏览、详情或筛选接口；
- Elasticsearch 文档和嵌套搜索；
- Redis 缓存调整；
- 前端页面和后台管理；
- 咨询表单、搜索同步任务和生产部署；
- 删除 V1 旧字段或让演示数据冒充正式数据。

## 12. 完成标准

- V3 可以安全升级空库和已有 V2 数据库；
- 现有三条演示院校数据及旧接口不受影响；
- 所有新表、外键、检查约束和索引通过真实 PostgreSQL 测试；
- JPA 映射通过 Hibernate 结构校验；
- 后端完整测试、格式检查和 CI 通过；
- 没有老板原始文件、正式数据、密码或 API Key 进入 Git；
- 组员完成 PR 审核后才能合并到 `main`。
