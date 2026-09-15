# 数据字段检查清单

## 适用范围

本清单用于收到老板提供的 Excel 后检查数据质量，并辅助建立“老板字段 → 系统字段”的映射。现阶段不制作 Excel 模板，不创建或修改 SQL、Flyway、Entity、Repository、Service、Controller、DTO 或 API。

正式数据以 PostgreSQL 为准，Elasticsearch 负责搜索和筛选。正式业务状态只使用 `DRAFT`、`PUBLISHED`、`ARCHIVED`。老板尚未确认的数据保持 `DRAFT`；虚构测试数据只进入测试环境，不在正式业务表中增加测试状态。

系统术语统一如下：

| 系统名称 | 中文含义 | 数据关系 |
| --- | --- | --- |
| `University` | 学校 | 一所学校可以开设多个 Programme |
| `Programme` | 某所学校开设的具体专业，简称“学校专业” | 属于一所 University，并关联一个公共 SubjectCategory |
| `SubjectCategory` | 公共专业分类 | 不保存某所学校特有的学费、学制或入学时间 |

本清单已经与当前 `main` 基线代码核对。当前已实现 `University`、`Country`、`SubjectCategory`、Repository、基础搜索和 Flyway V1/V2；Programme、多个语言、多个入学时间、搜索别名及完整费用字段已经写入批准的系统设计，但尚未出现在 Entity 或 Flyway 中。本阶段只记录现状和目标字段，不创建迁移或修改接口。

## 通用检查规则

| 检查项 | 规则 | 不合格示例 | 处理方式 |
| --- | --- | --- | --- |
| 中英文名称 | 中文名和英文名至少填写一个 | 两列都为空 | 拒绝该行并记录缺失原因 |
| 缺少英文名 | 保留已有的中文或原语言名称 | 数据人员自行翻译英文名 | 不翻译、不编造，等待老板补充 |
| 空白值 | 去除首尾空格；空字符串按空值处理 | 名称仅包含空格 | 按缺失字段处理 |
| 正式状态 | 只允许 `DRAFT`、`PUBLISHED`、`ARCHIVED` | `CONFIRMED`、`TEST_ONLY` | 标记为错误枚举 |
| 测试数据 | 只进入测试环境，使用明显虚构名称和 `.invalid` 域名 | 测试学校进入正式库 | 阻止正式导入 |
| 来源 | 正式记录必须能追溯到老板文件或确认记录 | 通过网络猜测补齐 | 保持 `DRAFT` 并等待确认 |
| 重复值 | 先报告，不自动覆盖或删除 | 同一唯一标识出现两次 | 交由负责人判断保留哪条 |

## University 学校

当前 `University` Entity 和 V1 只有 `id`、`name`、`slug`、`country`、`popular`、`created_at`。批准的目标设计将增加稳定的 `university_code`、中英文名称、城市、描述、`country_id`、发布状态及审计字段，并安全迁移旧的 `name` 和 `country`；这些变化尚未实施。

| 业务内容 | 目标系统字段 | 必填规则 | 格式或允许值 | 检查重点 |
| --- | --- | --- | --- | --- |
| 数据库主键 | `id` | 系统生成 | `BIGINT` | 只用于系统内部关联 |
| 导入稳定代码 | `university_code` | 是 | 批准格式待 Programme 阶段实现 | 老板 Excel 映射使用稳定业务代码，不使用名称或数据库主键 |
| 公开网址标识 | `slug` | 是 | 唯一字符串 | 当前 V1 已有且唯一 |
| 中文名 | `name_zh` | 条件必填 | 1–200 字符 | 与英文名至少有一个 |
| 英文名 | `name_en` | 条件必填 | 1–200 字符 | 缺少时保留原语言，不自行翻译 |
| 国家 | `country_id`，导入值使用 `Country.code` 解析 | 是 | 两位大写国家代码 | 必须先匹配 `countries.code`，不能继续保存自由文本国家名 |
| 城市 | 批准设计中的中英文城市字段 | 否 | 实际列名待目标迁移实现 | 未确认时留空，不猜测 |
| 描述 | 批准设计中的中英文描述字段 | 否 | 实际列名待目标迁移实现 | 禁止复制第三方文案 |
| 热门标志 | `popular` | 是 | 布尔值 | 当前 V1 已实现 |
| 发布状态 | `status` | 是 | `DRAFT` / `PUBLISHED` / `ARCHIVED` | 未确认数据使用 `DRAFT` |
| 发布时间 | `published_at` | 条件必填 | 带时区时间 | 与现有发布逻辑对齐后验证 |

## Country 国家

当前 `Country` Entity 与 V2 已实现以下字段和数据库约束。

| 系统字段 | 必填规则 | 格式或允许值 | 已实现检查 |
| --- | --- | --- | --- |
| `id` | 系统生成 | `BIGINT` | 主键 |
| `code` | 是 | 两位大写字母，如 `GB` | 唯一；数据库正则校验 |
| `name_zh` / `name_en` | 至少一个 | 各不超过 200 字符 | 数据库阻止两者同时为空或空白 |
| `continent_code` | 是 | 大写字母开头，最长 32 位，可含数字和下划线 | 数据库正则校验 |
| `created_at` / `updated_at` | 系统维护 | 带时区时间 | Entity 自动维护 |

## SubjectCategory 公共专业分类

| 业务内容 | 已实现系统字段 | 必填规则 | 格式或允许值 | 检查重点 |
| --- | --- | --- | --- | --- |
| 分类标识 | `id` | 系统生成 | `BIGINT` | 数据库主键 |
| 分类代码 | `code` | 是 | 大写字母开头，最长 64 位，可含数字和下划线 | 数据库唯一并执行正则校验 |
| 中文名 | `name_zh` | 条件必填 | 1–100 字符 | 与英文名至少有一个 |
| 英文名 | `name_en` | 条件必填 | 1–100 字符 | 禁止自行翻译 |
| 上级分类 | `parent_id` | 否 | 关联 `subject_categories.id` | 不可引用自身；删除父分类受限制 |
| 同级排序 | `sort_order` | 是 | 大于等于 0 | 当前默认值为 0 |
| 发布状态 | `status` | 是 | `DRAFT` / `PUBLISHED` / `ARCHIVED` | 未确认数据使用 `DRAFT` |

SubjectCategory 只表达公共分类。学费、学制、授课模式、授课语言和入学时间属于具体 Programme，不应写入公共分类。

## Programme 学校专业

Programme 属于批准的目标结构，当前基线尚无对应 Entity、Repository 或迁移。以下字段来自已批准设计，用于以后检查老板 Excel，不表示现在已经可以导入。

| 业务内容 | 目标系统字段 | 必填规则 | 格式或允许值 | 检查重点 |
| --- | --- | --- | --- | --- |
| 数据库主键 | `id` | 系统生成 | `BIGINT` | 只用于系统内部关联 |
| 导入稳定代码 | `programme_code` | 是 | 全局唯一 | 老板 Excel 与后续重复导入使用此代码 |
| 公开网址标识 | `slug` | 是 | 同一 University 内唯一 | 不能用显示名称代替 |
| 所属学校 | `university_id` | 是 | 必须关联已存在的 University | 不允许孤立 Programme |
| 公共专业分类 | `subject_category_id` | 是 | 必须关联已存在的 SubjectCategory | 学校特有字段不写入分类 |
| 中文名 | `name_zh` | 条件必填 | 1–200 字符 | 与英文名至少有一个 |
| 英文名 | `name_en` | 条件必填 | 1–200 字符 | 禁止自行翻译或编造 |
| 学历层次 | `degree_level` 或现有字段 | 是 | 使用后端已定义枚举 | 不自行增加 MBA、医学等值 |
| 课程模式 | `course_mode` 或现有字段 | 是 | `ON_CAMPUS` / `ONLINE` / `HYBRID` | `TAUGHT`、`RESEARCH` 不属于此字段 |
| 学制月数 | `duration_months` | 否 | 正整数 | 统一数值用于筛选 |
| 学制原文 | `duration_text` | 否 | 文本 | 保留老板提供的原始表述 |
| 最低原币学费 | `tuition_min` | 条件必填 | 大于等于 0，最多两位小数 | 与最高值、币种保持一致 |
| 最高原币学费 | `tuition_max` | 条件必填 | 大于等于 0，最多两位小数 | 不得小于最低值 |
| 原币币种 | `currency_code` | 条件必填 | ISO 4217 三位代码 | 有原币学费时必须填写 |
| 最低人民币学费 | `tuition_rmb_min` | 条件必填 | 大于等于 0，最多两位小数 | 用于学费筛选 |
| 最高人民币学费 | `tuition_rmb_max` | 条件必填 | 大于等于 0，最多两位小数 | 不得小于人民币最低值 |
| 汇率 | `exchange_rate` | 条件必填 | 大于 0；精度以后端规则为准 | 有人民币换算值时必须填写 |
| 汇率日期 | `exchange_rate_date` | 条件必填 | `YYYY-MM-DD` | 与汇率、人民币换算值同时存在 |
| 学费原文 | `tuition_text` | 否 | 文本 | 保留老板提供的原始表述，不替代数值筛选字段 |
| 发布状态 | `status` | 是 | `DRAFT` / `PUBLISHED` / `ARCHIVED` | 未确认数据使用 `DRAFT` |

### 学费组合校验

1. `tuition_min` 不得大于 `tuition_max`；`tuition_rmb_min` 不得大于 `tuition_rmb_max`。
2. 存在原币学费范围时，`currency_code` 必填。
3. 存在人民币换算范围时，`exchange_rate` 和 `exchange_rate_date` 必填。
4. 没有学费资料时，所有学费数值、币种、汇率和换算日期保持为空，不填 `0`，页面显示“请咨询”。
5. 启用学费筛选时，学费为空的 Programme 不算匹配。
6. 只有单一价格时是否允许最低值等于最高值，以及只给一个边界时如何处理，要在 Programme Validation 实现前由已批准 API 约定明确；当前代码尚无该 Validation。

## ProgrammeLanguages 专业授课语言

一个 Programme 可以有多种授课语言，不能将多个值拼接到 Programme 的一个字段中。后端使用 `programme_languages` 数据结构。

| 业务内容 | 建议系统字段 | 必填规则 | 检查重点 |
| --- | --- | --- | --- |
| 专业关联 | `programme_id` | 是 | 必须关联已存在的 Programme |
| 语言 | `language_code` 或现有字段 | 是 | 必须使用系统语言允许值 |
| 唯一性 | Programme + 语言 | 是 | 同一专业不可重复关联同一语言 |

## ProgrammeIntakes 专业入学时间

一个 Programme 可以有多个入学时间，不能只放在 Programme 的一列中。后端使用 `programme_intakes` 数据结构。

| 业务内容 | 建议系统字段 | 必填规则 | 格式 | 检查重点 |
| --- | --- | --- | --- | --- |
| 专业关联 | `programme_id` | 是 | 以后端类型为准 | 必须关联已存在的 Programme |
| 入学时间 | `intake_date` 或现有字段 | 是 | `YYYY-MM-DD` | 日期必须有效 |
| 入学时间原文 | `intake_text` 或现有字段 | 否 | 文本 | 保留老板原始表述，规范化日期用于筛选 |
| 唯一性 | Programme + 入学时间 | 是 | 同一专业不可重复同一日期 |

## SearchAliases 搜索别名

搜索别名使用独立的 `search_aliases` 数据结构，不在 Excel 单元格内使用 `|` 拼接。

| 业务内容 | 建议系统字段 | 必填规则 | 示例 | 检查重点 |
| --- | --- | --- | --- | --- |
| 别名 | `alias` | 是 | `UK` | 去除首尾空格；规范化规则以后端为准 |
| 目标类型 | `target_type` | 是 | `COUNTRY` | 必须是后端已允许的目标类型 |
| 目标代码或标识 | `target_code` 或现有关联字段 | 是 | `GB` | 必须指向存在的目标 |
| 老板确认依据 | 现有审计或来源字段 | 是 | 老板确认记录编号 | 未确认别名不进入正式数据 |

确认示例：`UK → COUNTRY → GB`。

## 收到老板 Excel 后的检查顺序

1. 只读检查实际工作表名称、表头、合并单元格、日期、数字、币种和空值形式。
2. 输出“老板工作表 + 老板列名 → 系统实体 + 系统字段”的逐列映射，未知项单独列出，不擅自决定。
3. 按本清单检查中英文名称、枚举、重复、关联、多个语言、多个入学时间及学费范围。
4. 将错误分为“阻止导入”和“允许保持 DRAFT 后待确认”，并给出行号和原因。
5. 先在测试环境使用明显虚构数据验证，再讨论批量导入；不得把测试记录写入正式 PostgreSQL。

## 代码核对结果和实现缺口

| 范围 | 当前实现 | 与批准目标的关系 |
| --- | --- | --- |
| Flyway | V1 `universities`；V2 `countries`、`subject_categories` | 已执行文件不得修改；Programme 等结构应由后续迁移实现，本阶段不创建 |
| 目录 Entity | `Country`、`SubjectCategory` | 字段与 V2 一致；名称至少一个由数据库约束保证 |
| University | 仍是单一 `name` 和自由文本 `country` 的旧结构 | 批准设计要求后续安全迁移到双语名称和 `country_id` |
| Programme 及关联 | 尚未实现 | 已批准设计包含 Programme、`programme_languages`、`programme_intakes` |
| SearchAliases | 尚未实现 | 已批准为独立业务数据结构 |
| 分页 DTO | `PageResponse(items, page, pageSize, totalItems, totalPages)` 已实现 | 页码从 1 开始；搜索默认 12、最大 48 已记录在 API 文档 |
| 搜索索引 | 当前只有 University 的 `name`、`slug`、`country`、`popular` | 尚未实现 University 文档内嵌 nested Programme 的目标结构 |
| 搜索同步 | 当前应用启动时删除并重建整个索引 | 批准目标是 PostgreSQL outbox 式增量同步和可验证的命令行全量重建 |

后续仍需在相应功能实现时核对：Programme 的最终 Java/数据库字段名、学费单边值规则、别名规范化与唯一键、Elasticsearch mapping，以及导入 DTO 和 Validation。它们是实现核对项，不应通过修改本阶段文档替代代码评审。
