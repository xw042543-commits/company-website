# 数据库说明

## 数据库职责

PostgreSQL 是本项目的主数据库，也是业务数据的唯一真实来源（Source of Truth）。
Redis 只负责缓存，Elasticsearch 只负责全文搜索；两者的数据都必须能够根据
PostgreSQL 重新生成。

当前阶段只建立基础目录结构，没有导入老板尚未确认的正式学校和专业数据。

## 数据库版本管理

数据库结构由 Flyway 按顺序管理，迁移文件位于：

`backend/src/main/resources/db/migration/`

已经建立的迁移：

- `V1__create_universities_table.sql`：创建院校表。
- `V2__create_catalog_tables.sql`：创建国家表和专业分类表。

已经执行过的迁移文件不能直接修改。需要调整结构时，应新增下一个版本的迁移，
例如 `V3__...sql`。这样三名开发人员和后续服务器才能得到一致的数据库结构。

## 当前数据表

### universities

保存院校基础信息。目前包含院校名称、唯一网址标识 `slug`、国家、热门状态和创建时间。
后续接入老板的正式资料时，再通过新的迁移逐步补充城市、院校详情等字段。

### countries

保存国家基础信息，供筛选条件和院校资料关联使用。

主要字段：

- `code`：两位大写国家代码，例如 `MY`、`SG`，作为稳定业务代码。
- `name_zh`、`name_en`：中英文名称，至少填写一个。
- `continent_code`：洲别代码，例如 `ASIA`、`EUROPE`。
- `created_at`、`updated_at`：创建和更新时间。

数据库会阻止重复或格式错误的国家代码。

### subject_categories

保存专业分类，而不是具体学校开设的课程。例如“商业与管理”可以作为父分类，
“会计”可以作为它的子分类。

主要字段：

- `code`：稳定且唯一的分类代码，例如 `BUSINESS`。
- `name_zh`、`name_en`：中英文名称，至少填写一个。
- `parent_id`：上级分类；顶级分类可以为空。
- `sort_order`：同级显示顺序，不能小于 0。
- `status`：`DRAFT`、`PUBLISHED` 或 `ARCHIVED`。
- `created_at`、`updated_at`：创建和更新时间。

删除父分类时不会自动删除整棵分类树，以降低误删数据的风险。

## Java 数据访问层

对应代码位于：

`backend/src/main/java/com/yangdoujiao/website/catalog/`

- `Country`、`SubjectCategory`：把 Java 对象映射到 PostgreSQL 数据表。
- `CountryRepository`、`SubjectCategoryRepository`：负责保存和查询数据。
- `CategoryStatus`：限定专业分类可使用的状态。

后续请求的标准处理顺序是：

`Controller → Service → Repository → PostgreSQL`

实体类只负责数据库映射，不直接作为 REST API 的返回结果。API 会使用独立 DTO，
避免数据库结构与前端页面过度绑定。

## 测试与本地数据安全

数据库结构和 Repository 集成测试使用 Testcontainers 创建临时 PostgreSQL。
测试不会连接开发人员自己的数据库，执行结束后临时容器和测试数据会自动清理。

真实数据库密码只保存在每位开发人员自己的 `.env` 中，不能提交到 GitHub，
也不要在群聊中共享。仓库中的 `.env.example` 只提供变量名称和安全示例。
