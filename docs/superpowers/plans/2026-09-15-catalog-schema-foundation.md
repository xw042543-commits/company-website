# 国家与专业分类基础表实施计划

> 本计划只建立目录型基础数据，不导入老板尚未提供的正式学校和专业数据。

## 目标

通过 Flyway 创建 `countries` 和 `subject_categories`，再建立对应的 JPA
实体与 Repository。PostgreSQL 仍是唯一正式数据源，Redis 和 Elasticsearch
不参与本阶段。

## 本阶段边界

包含：

- 国家代码、双语名称、洲别和审计时间；
- 可分层的专业分类、排序、发布状态和审计时间；
- JPA 映射与只读查询 Repository；
- 使用 Testcontainers 的真实 PostgreSQL 集成测试；
- 中文数据库说明文档。

不包含：

- 学校表扩展、专业表、语言、入学时间和学费；
- 老板 Excel 导入；
- 搜索接口、Elasticsearch 索引和 Redis 缓存；
- 后台管理页面和正式业务数据。

## 数据库设计

### countries

| 字段 | 用途 |
| --- | --- |
| `id` | 内部自增主键 |
| `code` | ISO 3166-1 两位大写国家代码，唯一 |
| `name_zh` | 中文名称，可空 |
| `name_en` | 英文名称，可空 |
| `continent_code` | 稳定洲别代码，例如 `ASIA`、`EUROPE` |
| `created_at` | 创建时间 |
| `updated_at` | 更新时间 |

约束：国家代码必须是两个大写英文字母；中英文名称至少有一个非空。

### subject_categories

| 字段 | 用途 |
| --- | --- |
| `id` | 内部自增主键 |
| `code` | 稳定分类代码，唯一，不使用显示名称作为关联键 |
| `name_zh` | 中文名称，可空 |
| `name_en` | 英文名称，可空 |
| `parent_id` | 上级分类，可空，引用本表 |
| `sort_order` | 同级显示顺序，默认 0 |
| `status` | `DRAFT`、`PUBLISHED` 或 `ARCHIVED` |
| `created_at` | 创建时间 |
| `updated_at` | 更新时间 |

约束：中英文名称至少有一个非空；分类不能把自己设为直接父级；排序值不能为负数。

## 实施顺序

### 任务 1：先编写数据库结构测试

新增：

- `backend/src/test/java/com/yangdoujiao/website/catalog/CatalogSchemaIntegrationTest.java`

测试使用 Testcontainers PostgreSQL，并检查：

- 两张表由 Flyway 创建；
- 国家代码唯一且格式受约束；
- 专业分类父子关系有效；
- 非法发布状态和负数排序被拒绝；
- 中英文名称不能同时为空。

审核点：测试必须准确验证预期数据库规则，不连接开发数据库。

### 任务 2：新增不可变的 V2 Flyway 迁移

新增：

- `backend/src/main/resources/db/migration/V2__create_catalog_tables.sql`

要求：

- 使用明确的主键、外键、唯一约束、检查约束和索引；
- 不修改已经执行的 `V1__create_universities_table.sql`；
- 不插入猜测的正式业务数据；
- 删除父分类时采用限制策略，避免误删整棵分类树。

审核点：`./mvnw -Dtest=CatalogSchemaIntegrationTest test` 通过。

### 任务 3：建立 JPA 实体和 Repository

新增：

- `catalog/Country.java`
- `catalog/CountryRepository.java`
- `catalog/SubjectCategory.java`
- `catalog/SubjectCategoryRepository.java`
- `catalog/CategoryStatus.java`

规则：

- 实体不直接作为 API JSON 返回；
- 枚举使用字符串存储；
- 父分类使用懒加载关系；
- 不使用 Lombok `@Data`，避免自动生成危险的实体相等比较和可写 setter；
- Repository 只负责数据访问，不放业务判断。

审核点：Hibernate `ddl-auto=validate` 能验证实体与 V2 表结构一致。

### 任务 4：验证 Repository 与约束

扩展集成测试，通过 Repository 保存和读取测试国家、父分类、子分类，并验证：

- 可按稳定代码查询；
- 父子关系读取正确；
- 测试数据只存在于临时 PostgreSQL；
- 测试结束后 Testcontainers 自动清理。

审核点：后端完整测试全部通过，且开发数据库中的现有三所演示学校不变。

### 任务 5：更新中文文档并提交 PR

更新：

- `docs/DATABASE.md`
- 如有必要，补充 `docs/ARCHITECTURE.md`

最终验证：

```bash
./mvnw clean test
git diff --check
git status --short
```

提交按“迁移与测试”“JPA 映射”“中文文档”分开，组员审核后才能合并到 `main`。

## 完成标准

- V2 迁移可在空数据库和已有 V1 数据库上顺利执行；
- Hibernate 成功校验表结构；
- PostgreSQL 约束能阻止明显无效数据；
- 国家和专业分类可通过 Repository 按稳定代码读取；
- 没有正式业务数据、密码或老板原始文件进入 Git；
- 后端完整测试和 CI 全部通过。
