# 数据字段检查清单

## 适用范围

本清单用于检查老板提供的 Excel、维护“老板字段 → 整理工作簿字段 → 系统字段”的映射，并为后续导入 DTO、Validation 和测试提供依据。Excel 由老板提供，项目组不另行制作正式数据模板。

正式数据以 PostgreSQL 为唯一真实来源。Redis 只用于缓存，Elasticsearch 只用于搜索和筛选，且索引必须可以从 PostgreSQL 重建。正式业务状态只使用 `DRAFT`、`PUBLISHED`、`ARCHIVED`；未完成业务确认的数据保持 `DRAFT`。

系统术语统一如下：

| 系统名称 | 中文含义 | 数据关系 |
| --- | --- | --- |
| `University` | 学校 | 一所学校可以开设多个 Programme |
| `Programme` | 某所学校开设的具体专业，简称“学校专业” | 属于一所 University，并关联一个公共 SubjectCategory |
| `SubjectCategory` | 公共专业分类 | 不保存某所学校特有的学费、学制或入学时间 |

本清单已与当前仓库代码核对。Flyway V1～V3、University、Programme、ProgrammeIntake、筛选字典 Entity 和 Repository 已存在；Excel 导入 DTO、Validation、Service、Controller、`/api/v1/universities/search` 和 `/api/v1/catalog/filter-options` 尚未实现。本阶段不修改已经执行的 Flyway，也不自行增加接口或数据库字段。

## 通用检查规则

| 检查项 | 规则 | 不合格示例 | 处理方式 |
| --- | --- | --- | --- |
| 中英文名称 | 中文名和英文名至少填写一个 | 两列都为空 | 阻止该行导入并记录原因 |
| 缺少英文名 | 保留已有的中文或原语言名称 | 数据人员自行翻译英文名 | 不翻译、不编造 |
| 空白值 | 去除首尾空格；空字符串按空值处理 | 名称仅包含空格 | 按缺失字段处理 |
| 正式状态 | 只允许 `DRAFT`、`PUBLISHED`、`ARCHIVED` | `CONFIRMED`、`TEST_ONLY` | 标记为错误枚举 |
| 正式数据来源 | 必须能追溯到老板文件或确认记录 | 通过网络猜测补齐 | 保持 `DRAFT` 并记录来源缺口 |
| 自动化测试数据 | 使用明显虚构名称和 `.invalid` 域名，只进入测试环境 | 测试学校写入正式库 | 阻止正式导入 |
| 老板数据导入演练 | 可以从老板文件选取少量记录放入隔离测试环境 | 未审核数据直接发布 | 保持 `DRAFT`，不得进入生产发布流程 |
| 重复值 | 先报告，不自动覆盖或删除 | 同一稳定代码出现两次 | 交由负责人判断保留哪条 |

## 当前数据库关系和导入顺序

```text
countries
subject_categories（父分类先于子分类）
study_levels
course_modes
languages
    ↓
universities
    ↓
programmes
    ├── programme_languages
    └── programme_intakes
```

导入文件使用稳定业务代码表达关联；写入 PostgreSQL 前，由导入 Service 通过 Repository 查询数据库 `id`。Excel 中不得直接维护数据库自增主键。

建议事务顺序：先校验整批数据，再按上图顺序写入；任一必需引用不存在时整批失败，不允许产生孤立 Programme。具体覆盖、跳过或更新策略必须在导入功能设计时由组长确认。

## University 学校

当前 V3 已为 `universities` 增加稳定代码、双语名称、城市、描述、国家外键和发布状态。为兼容现有接口，V1 的 `name` 和自由文本 `country` 仍为非空字段，导入时暂时也必须赋值。

| 整理工作簿字段 | 当前系统字段 | 必填规则 | 格式或允许值 | 导入处理 |
| --- | --- | --- | --- | --- |
| `university_code` | `universities.university_code` | 测试导入必填 | `^[A-Z][A-Z0-9_]{0,63}$`，非空时唯一 | 直接写入；用于重复识别 |
| `slug` | `universities.slug` | 是 | 1–200 字符，全表唯一 | 直接写入 |
| `name` | `universities.name` | 兼容期必填 | 1–200 字符 | 使用已审核显示名称；不能直接使用含版本日期的工作表标题 |
| `name_zh` | `universities.name_zh` | 条件必填 | 不超过 200 字符 | 与 `name_en` 至少填写一个 |
| `name_en` | `universities.name_en` | 条件必填 | 不超过 200 字符 | 缺少时保留原语言，不自行翻译 |
| `country` | `universities.country` | 兼容期必填 | 不超过 100 字符 | 保留兼容显示值，不作为正式关联依据 |
| `country_code` | `universities.country_id` | 测试导入必填 | 两位大写国家代码 | 查询 `countries.code`，写入对应 `id` |
| `city_zh` / `city_en` | 同名字段 | 否 | 各不超过 200 字符 | 未确认时留空 |
| `description_zh` / `description_en` | 同名字段 | 否 | 文本 | 禁止复制第三方文案 |
| `popular` | `universities.popular` | 是 | 布尔值 | 直接写入，缺少时不得擅自标记热门 |
| `status` | `universities.status` | 是 | `DRAFT` / `PUBLISHED` / `ARCHIVED` | 未审核数据使用 `DRAFT` |
| 无 | `id`、审计时间、`published_at` | 系统维护 | 数据库生成 | Excel 不填写 |

`source_sheet`、`validation_status` 和 `validation_message` 是整理与审计字段，不写入当前 `universities` 表。

## Country 国家

| 整理工作簿字段 | 当前系统字段 | 必填规则 | 格式或允许值 | 已实现检查 |
| --- | --- | --- | --- | --- |
| `code` | `countries.code` | 是 | 两位大写字母，如 `MY` | 唯一；数据库正则校验 |
| `name_zh` / `name_en` | 同名字段 | 至少一个 | 各不超过 200 字符 | 数据库阻止两者同时为空或空白 |
| `continent_code` | 同名字段 | 是 | 大写字母开头，最长 32 位，可含数字和下划线 | 数据库正则校验 |
| 无 | `id`、`created_at`、`updated_at` | 系统维护 | 数据库生成 | Excel 不填写 |

## SubjectCategory 公共专业分类

| 整理工作簿字段 | 当前系统字段 | 必填规则 | 格式或允许值 | 导入处理 |
| --- | --- | --- | --- | --- |
| `code` | `subject_categories.code` | 是 | 大写字母开头，最长 64 位，可含数字和下划线 | 直接写入；全表唯一 |
| `name_zh` / `name_en` | 同名字段 | 至少一个 | 各不超过 200 字符 | 禁止自行翻译 |
| `parent_code` | `subject_categories.parent_id` | 否 | 必须引用已存在的分类代码 | 父分类先导入，再把代码解析为 `id` |
| `sort_order` | 同名字段 | 是 | 大于等于 0 | 直接写入 |
| `status` | 同名字段 | 是 | `DRAFT` / `PUBLISHED` / `ARCHIVED` | 未确认分类使用 `DRAFT` |

SubjectCategory 只表达公共分类。学费、学制、课程模式、授课语言和入学时间属于具体 Programme，不写入公共分类。

## StudyLevel、CourseMode 和 Language

`study_levels`、`course_modes`、`languages` 已由 V3 建立。三类字典都使用 `code`、`name_zh`、`name_en`、`sort_order` 和 `status`；名称至少一个，排序不得为负数，状态只允许三个正式值。

课程模式允许值由正式字典控制。当前业务已确定的代码是 `ON_CAMPUS`、`ONLINE`、`HYBRID`；`TAUGHT`、`RESEARCH` 不属于课程模式。授课语言必须来自 `languages`，不能把英语入学要求推断为英语授课。

## Programme 学校专业

Programme Entity、Repository 和 V3 表结构已经实现。`study_level_id` 与 `course_mode_id` 在草稿阶段允许为空；`university_id` 和 `subject_category_id` 不能为空。

| 整理工作簿字段 | 当前系统字段 | 必填规则 | 格式或允许值 | 导入处理 |
| --- | --- | --- | --- | --- |
| `programme_code` | `programmes.programme_code` | 是 | `^[A-Z][A-Z0-9_]{0,63}$`，全表唯一 | 直接写入；用于重复识别 |
| `university_code` | `programmes.university_id` | 是 | 必须引用已导入 University | 查询稳定代码后写入 `id` |
| `subject_category_code` | `programmes.subject_category_id` | 是 | 必须引用已导入 SubjectCategory | 查询分类代码后写入 `id` |
| `study_level_code` | `programmes.study_level_id` | 草稿可空 | 必须引用 `study_levels.code` | 查询代码后写入 `id` |
| `course_mode_code` | `programmes.course_mode_id` | 草稿可空 | `ON_CAMPUS` / `ONLINE` / `HYBRID` 或正式字典值 | 查询代码后写入 `id`；不得猜测 |
| `slug` | `programmes.slug` | 是 | 1–200 字符，同一学校内唯一 | 直接写入 |
| `name_zh` / `name_en` | 同名字段 | 至少一个 | 各不超过 200 字符 | 保留老板原文，不自行翻译 |
| `description_zh` / `description_en` | 同名字段 | 否 | 文本 | 未提供时留空 |
| `duration_months` | 同名字段 | 否 | 正整数 | 只有能可靠换算为月时才填写 |
| `duration_display` | 同名字段 | 否 | 不超过 100 字符 | 保留老板原始学制文字 |
| `tuition_min` / `tuition_max` | 同名字段 | 否 | 大于等于 0，最多两位小数 | 两者都存在时最低值不得大于最高值 |
| `tuition_currency` | 同名字段 | 有原币金额时必填 | 三位大写币种代码 | 业务资料中的 `currency_code` 映射到当前 V3 字段 `tuition_currency` |
| `tuition_display` | 同名字段 | 否 | 不超过 200 字符 | 业务资料中的 `tuition_text` 映射到当前 V3 字段 `tuition_display` |
| `tuition_rmb_min` / `tuition_rmb_max` | 同名字段 | 否 | 大于等于 0，最多两位小数 | 用于统一学费筛选 |
| `exchange_rate` | 同名字段 | 有人民币金额时必填 | 大于 0，最多 8 位小数 | 必须与人民币金额一起校验 |
| `exchange_rate_date` | 同名字段 | 有人民币金额时必填 | `YYYY-MM-DD` | 必须与汇率一起保存 |
| `status` | 同名字段 | 是 | `DRAFT` / `PUBLISHED` / `ARCHIVED` | 未审核 Programme 使用 `DRAFT` |
| 无 | `id`、审计时间、`published_at` | 系统维护 | 数据库生成 | Excel 不填写 |

以下整理字段目前没有 V3 业务列：`faculty_text`、`source_cgpa_requirement`、`source_english_requirement`、`source_registration_fee`、`source_interview`、`source_campus`、`source_career`、`source_note`、`validation_status`、`validation_message`。它们用于来源追踪和复核，不得丢失，也不能在未批准新结构前强行写入其他字段。

### 学费组合校验

1. `tuition_min` 和 `tuition_max` 可以单边为空；两者都存在时最低值不得大于最高值。
2. 只要存在任一原币金额，`tuition_currency` 就必须填写。
3. 只要存在任一人民币金额，`exchange_rate` 和 `exchange_rate_date` 就必须同时填写。
4. 没有学费资料时，所有学费数值、币种、汇率和换算日期保持为空，不填 `0`，页面显示“请咨询”。
5. 启用学费筛选时，人民币筛选值为空的 Programme 不算匹配。
6. 数据人员不得自行选择汇率；换算来源和日期需要得到项目负责人确认。

## ProgrammeLanguages 专业授课语言

一个 Programme 可以有多种授课语言，不能把多个值拼接进 Programme 单列。

| 整理工作簿字段 | 当前系统字段 | 必填规则 | 导入处理 |
| --- | --- | --- | --- |
| `programme_code` | `programme_languages.programme_id` | 是 | 查询 Programme 稳定代码后写入 `id` |
| `language_code` | `programme_languages.language_id` | 是 | 查询 `languages.code` 后写入 `id` |
| Programme + 语言 | 联合主键 | 是 | 同一 Programme 不能重复关联同一种语言 |

没有明确授课语言依据时不生成关系记录。入学英语要求不是授课语言。

## ProgrammeIntakes 专业入学时间

| 整理工作簿字段 | 当前系统字段 | 必填规则 | 格式 | 导入处理 |
| --- | --- | --- | --- | --- |
| `programme_code` | `programme_intakes.programme_id` | 是 | 稳定代码 | 查询 Programme 后写入 `id` |
| `intake_date` | 同名字段 | 否 | `YYYY-MM-DD` | 只有日期完整且可靠时填写 |
| `display_text` | 同名字段 | 是 | 1–100 字符 | 保留老板原始月份或日期文字 |

V3 没有为入学时间建立业务唯一约束。导入 Validation 仍应检查同一 Programme 下完全重复的日期或展示文字并报告，不能依赖数据库自动去重。

## SearchAliases 搜索别名

`search_aliases` 尚未出现在当前 Flyway 或 Entity 中。已确认的业务规则是别名使用独立数据结构，不在 Excel 单元格中使用 `|` 拼接；未获得老板确认的别名不能作为正式数据。

确认示例：`UK → COUNTRY → GB`。在组长确定实体、唯一键和目标类型枚举前，不创建迁移或导入逻辑。

## 老板工作簿到当前 V3 的工作表映射

| 整理工作表 | 目标表 | 当前处理状态 |
| --- | --- | --- |
| `draft_countries` | `countries` | 建议数据，保持 `DRAFT` 语义，先审核再导入 |
| `draft_subject_categories` | `subject_categories` | 建议分类树，父分类先于子分类导入 |
| `draft_study_levels` | `study_levels` | `BACHELOR` 为当前批次建议值，待审核 |
| `draft_course_modes` | `course_modes` | 可作为候选字典；当前 Programme 未分配 |
| `draft_languages` | `languages` | 可作为候选字典；当前 Programme 未分配 |
| `test_universities` | `universities` | 5 所老板来源学校的隔离测试范围，不能直接发布 |
| `test_programmes` | `programmes` | 357 条有效 Programme，全部保持 `DRAFT` |
| `test_intakes` | `programme_intakes` | 272 条原始入学月份；标准日期暂为空 |
| `programme_languages` | `programme_languages` | 当前无可靠关系记录，不导入 |

## 首批五所学校核对结果

当前测试范围为 UM、UKM、UTM、UPM、USM：

- 5 条 University 的稳定代码、slug、国家代码和状态格式通过，但校名仍含“本科、国际生、更新时间”等工作表标题信息，不能作为正式校名发布。
- 357 条 Programme 的代码、学校关联、分类关联、学历关联、slug 和名称结构检查通过；所有记录仍为 `BLOCKED/DRAFT`。
- 357 条 Programme 的课程模式全部为空。
- 262 条 Programme 已有可解析的原币金额和币种；76 条只有学费原文；19 条没有学费金额或原文。
- 人民币学费、汇率和汇率日期尚未填写，人民币学费筛选暂不可用。
- 290 条 Programme 只有学制原文而没有可靠的标准月数。
- 272 条入学时间都有 `display_text`，但 `intake_date` 全为空，因此只能展示，暂不能进行可靠日期筛选。
- 当前没有 Programme 授课语言关系；不得根据英语入学要求推断。

“数据库约束通过”只表示格式和关联可以保存，不代表数据已获得业务确认或可以发布。

## 导入 Validation 最低覆盖范围

正式实现导入前，至少覆盖：

1. 必填值、空白字符串、长度、代码格式和状态枚举。
2. University、Programme 和分类稳定代码重复。
3. Programme 的学校、分类、学历、课程模式和语言引用。
4. 中英文名称至少一个。
5. 学制正整数和原始展示文字保留。
6. 学费范围、币种、人民币金额、汇率及汇率日期组合。
7. 一个 Programme 多种语言、多个入学时间和重复关系。
8. 有效数据、空值、错误格式、未知枚举、重复项和整批回滚。
9. 日志和错误报告不得包含真实个人资料、密钥或完整工作簿内容。

## 当前代码能力和实现缺口

| 范围 | 当前实现 | 导入阶段结论 |
| --- | --- | --- |
| Flyway | V1～V3 已实现完整数据层结构 | 已执行迁移不得修改；本次导入不需要新增迁移 |
| 字典 Entity / Repository | Country、SubjectCategory、StudyLevel、CourseMode、Language 已实现 | 五个 Repository 都可以按 `code` 查询，用于解析字典外键 |
| University Repository | 已实现基础 JPA Repository | 尚无 `findByUniversityCode`，导入 Service 不能直接按稳定代码解析学校 |
| Entity 写入能力 | University、Programme、ProgrammeIntake 已映射 V3 | University 没有业务构造方法；Programme 的构造方法不包含学制、学费等字段，需由后端负责人确定安全写入方式 |
| Programme languages | Entity 多对多关系和关系表已实现 | 需要导入 Service 根据语言代码建立关系 |
| 导入 DTO / Validation | 尚未实现 | 不能直接接收 Excel 行或生成逐行错误报告 |
| 导入 Service / Controller | 尚未实现 | 当前没有安全的批量导入入口 |
| 筛选选项接口 | 尚未实现 `/api/v1/catalog/filter-options` | 前端不能把建议字典硬编码为正式数据 |
| 搜索接口 | 当前仍是兼容接口 `/api/search` | 目标 `/api/v1/universities/search` 尚不能执行测试矩阵 |
| Elasticsearch | 当前索引只有旧 University 字段 | 尚未索引 Programme，也未实现多条件筛选 |
| SearchAliases | 尚未实现 | 等组长确认结构后再处理 |

后续开始导入代码前，组长还需要确定导入入口形式、重复代码的更新策略、整批失败或部分成功策略，以及建议字典如何完成审核。未经确认，不通过直接 SQL 绕过 Service、Validation 和审计流程。
