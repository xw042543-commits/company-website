# 筛选测试矩阵

## 目标接口和当前实现

- 批准的 API 前缀：`/api/v1`
- 搜索接口：`GET /api/v1/universities/search`
- 筛选字典接口：`GET /api/v1/catalog/filter-options`
- 分页响应：`items`、`page`、`pageSize`、`totalItems`、`totalPages`，默认每页 12 所学校，最大 48
- 正式数据源：PostgreSQL
- 目标搜索与筛选：Elasticsearch 中以 University 为一条文档，Programme 使用 nested 对象

当前代码已实现上述两个 V1 接口。新搜索索引以 University 为根文档，嵌套已发布
Programme；支持版本化重建、读写别名切换和 PostgreSQL 可重试增量同步。旧的
`GET /api/search?q=...` 仍作为迁移期兼容接口，不代表 V4 的完整筛选能力。

当前请求链路为：Browser → Next.js → `UniversitySearchV1Controller` →
`UniversitySearchV1Service` → Elasticsearch。正式业务数据由 Service/Repository 写入
PostgreSQL，提交后再入队，由 worker 同步为可重建的 Elasticsearch 投影。

## 核心判定规则

1. 同一筛选维度内使用 OR，例如国家选择 `GB` 和 `AU` 时，Programme 属于任一国家即可满足国家维度。
2. 不同筛选维度之间使用 AND，例如国家、学历、课程模式和语言必须同时满足。
3. 所有专业条件必须由同一个 Programme 同时满足，不能把同一学校的不同 Programme 条件拼成一次命中。
4. 一所 University 在结果中只出现一次。
5. 每所 University 最多显示 3 个匹配 Programme。
6. 每页最多返回 12 所 University，分页对象使用系统统一格式。
7. 有关键词时默认按相关度排序；没有关键词时按后端规定的默认顺序返回，具体顺序后续从代码确认。
8. 学费为空的 Programme 可以展示“请咨询”，但启用学费筛选时不得算作匹配。

## 虚构测试数据

下列数据只用于测试环境。学校和专业名称均为虚构，网址使用 `.invalid` 域名，不包含真实院校或个人资料。

### University

| 学校标识 | 中文名 | 英文名 | 国家 | 网址 | 状态 |
| --- | --- | --- | --- | --- | --- |
| `U-FAKE-GB-01` | 北辰虚构大学 | Northstar Fictional University | `GB` | `https://northstar.invalid` | `PUBLISHED` |
| `U-FAKE-AU-02` |  | Harbor Example Institute | `AU` | `https://harbor.invalid` | `PUBLISHED` |
| `U-FAKE-CA-03` | 枫叶示例大学 |  | `CA` | `https://maple-example.invalid` | `PUBLISHED` |
| `U-FAKE-SG-04` | 晨曦虚构学院 | Sunrise Fictional College | `SG` | `https://sunrise.invalid` | `PUBLISHED` |
| `U-FAKE-NZ-05` | 南风测试学院 | Southern Wind Test College | `NZ` | `https://southern-wind.invalid` | `DRAFT` |

以上数据同时用于验证“中英文名称至少填写一个”：澳大利亚学校只有英文名，加拿大学校只有中文名，均不得由数据人员自行补译。

### Programme

| 专业标识 | 学校 | 中文名 | 英文名 | 分类 | 学历 | 课程模式 | 学制月数 | 原币学费范围 | 人民币学费范围 | 状态 |
| --- | --- | --- | --- | --- | --- | --- | ---: | --- | --- | --- |
| `P-GB-DS-01` | `U-FAKE-GB-01` | 数据科学 | Data Science | `COMPUTING` | `MASTER` | `ON_CAMPUS` | 12 | 22000–26000 GBP | 200000–236000 | `PUBLISHED` |
| `P-GB-AI-02` | `U-FAKE-GB-01` | 人工智能 | Artificial Intelligence | `COMPUTING` | `MASTER` | `ONLINE` | 18 | 18000–21000 GBP | 164000–191000 | `PUBLISHED` |
| `P-GB-BUS-03` | `U-FAKE-GB-01` | 商业分析 | Business Analytics | `BUSINESS` | `MASTER` | `ON_CAMPUS` | 12 | 21000–25000 GBP | 191000–228000 | `PUBLISHED` |
| `P-AU-BA-01` | `U-FAKE-AU-02` | 商业分析 | Business Analytics | `BUSINESS` | `BACHELOR` | `HYBRID` | 36 | 85000–95000 AUD | 391000–437000 | `PUBLISHED` |
| `P-CA-CS-01` | `U-FAKE-CA-03` | 计算机科学 |  | `COMPUTING` | `BACHELOR` | `ON_CAMPUS` | 48 | 110000–125000 CAD | 572000–650000 | `PUBLISHED` |
| `P-SG-IT-01` | `U-FAKE-SG-04` | 信息技术预科 | Foundation in IT | `COMPUTING` | `FOUNDATION` | `ON_CAMPUS` | 10 | 空 | 空 | `PUBLISHED` |
| `P-NZ-DEMO-01` | `U-FAKE-NZ-05` | 待发布示例专业 | Draft Example Programme | `COMPUTING` | `BACHELOR` | `ON_CAMPUS` | 36 | 60000–70000 NZD | 258000–301000 | `DRAFT` |

每条有人民币学费的 Programme 测试记录还必须带正数 `exchange_rate` 和有效 `exchange_rate_date`；具体换算数值仅用于结构测试，不作为真实汇率或正式业务数据。

### ProgrammeLanguages

| Programme | 语言 |
| --- | --- |
| `P-GB-DS-01` | `EN` |
| `P-GB-DS-01` | `ZH` |
| `P-GB-AI-02` | `EN` |
| `P-GB-BUS-03` | `EN` |
| `P-AU-BA-01` | `EN` |
| `P-CA-CS-01` | `EN` |
| `P-CA-CS-01` | `FR` |
| `P-SG-IT-01` | `EN` |
| `P-NZ-DEMO-01` | `EN` |

### ProgrammeIntakes

| Programme | 入学时间 |
| --- | --- |
| `P-GB-DS-01` | `2027-01-15` |
| `P-GB-DS-01` | `2027-09-01` |
| `P-GB-AI-02` | `2027-03-01` |
| `P-GB-BUS-03` | `2027-09-01` |
| `P-AU-BA-01` | `2027-02-20` |
| `P-CA-CS-01` | `2027-01-10` |
| `P-CA-CS-01` | `2027-09-05` |
| `P-SG-IT-01` | `2027-08-15` |
| `P-NZ-DEMO-01` | `2027-02-01` |

### SearchAliases

| 别名 | 目标类型 | 目标代码 | 说明 |
| --- | --- | --- | --- |
| `UK` | `COUNTRY` | `GB` | 测试老板已确认的国家别名 |

## 接口测试矩阵

除特别说明外，请求均调用 `GET /api/v1/universities/search`，并按统一分页响应断言结果。实际查询参数名需以现有 API 代码为准。

| 编号 | 场景 | 输入条件 | 预期结果 | 重点断言 |
| --- | --- | --- | --- | --- |
| F01 | 无关键词、无筛选 | 空查询 | 按后端规定的默认顺序返回 | 不断言相关度；每页最多 12 所学校 |
| F02 | 专业关键词 | 关键词 `data` | 返回北辰虚构大学 | 卡片包含 `P-GB-DS-01`；按关键词相关度排序 |
| F03 | 公共专业分类 | 分类 `COMPUTING` | 返回具有匹配 Programme 的学校 | SubjectCategory 与 Programme 关联正确 |
| F04 | 国家别名 | 国家输入 `UK` | 与国家代码 `GB` 的结果相同 | 独立 search_aliases 将 `UK` 解析为 `COUNTRY → GB` |
| F05 | 单维度筛选 | 学历 `BACHELOR` | 返回澳大利亚和加拿大两所虚构学校 | 同一维度值匹配正确 |
| F06 | 多维度 AND 命中 | `GB` + `MASTER` + `ON_CAMPUS` + `ZH` + 12 个月 + 2027-09 | 仅返回北辰虚构大学 | 所有条件由 `P-GB-DS-01` 同时满足 |
| F07 | 禁止跨 Programme 拼接 | `GB` + `ONLINE` + `ZH` | 不返回北辰虚构大学 | `ONLINE` 在 `P-GB-AI-02`，`ZH` 在 `P-GB-DS-01`，不能跨专业合并命中 |
| F08 | 同维度 OR、跨维度 AND | 国家 `GB`、`AU` + 模式 `ON_CAMPUS` | 仅返回北辰虚构大学 | 国家维度内部 OR；澳大利亚 Programme 为 `HYBRID`，不得匹配 |
| F09 | 一个 Programme 多语言 | `GB` + `ZH`；再测 `GB` + `EN` | 两次都返回北辰虚构大学的 `P-GB-DS-01` | 多语言关联均可检索，不重复返回学校或 Programme |
| F10 | 一个 Programme 多入学时间 | `GB` + 2027-01；再测 `GB` + 2027-09 | 两次都匹配 `P-GB-DS-01` | 多个入学时间均可筛选，不产生重复学校卡片 |
| F11 | 学费筛选命中 | 人民币费用范围与 200000–236000 有效匹配 | 按区间相交规则返回北辰虚构大学及 `P-GB-DS-01` | 区间边界包含；只提供一侧边界时也可筛选 |
| F12 | 学费为空 | 启用任意人民币学费范围并包含新加坡数据 | `P-SG-IT-01` 不算匹配 | 空值不能被当作 0 或无限范围 |
| F13 | 一校一卡 | 条件同时匹配北辰虚构大学多个 Programme | 北辰虚构大学只出现一次 | University 去重；匹配 Programme 聚合在同一卡片 |
| F14 | 每校最多 3 个匹配专业 | 为北辰虚构大学在测试环境补足 4 个匹配 Programme | 卡片只显示 3 个 | 3 个应是匹配专业，不是任意专业；具体专业排序按后端规则 |
| F15 | 分页 | 构造 13 所满足条件的虚构 University，页大小 12 | 第 1 页 12 所，第 2 页 1 所 | 总数、页码、页大小正确，无重复或遗漏 |
| F16 | 非法课程模式 | 模式 `REMOTE_ONLY`；另测 `UNKNOWN_MODE` | 返回 400 统一校验错误 | `ONLINE` 必须被接受为已发布合法值 |
| F17 | 非法日期或数字 | 无效入学日期、负学费、最低值大于最高值 | 数据校验失败并指出字段原因 | 不写入 PostgreSQL、不进入 Elasticsearch |
| F18 | 名称至少一个 | University 或 Programme 的中英文名都为空 | 数据校验失败 | 只有中文或只有英文时通过，不自动翻译 |
| F19 | 重复语言 | 同一 Programme 重复关联相同语言 | 校验或唯一约束拒绝重复 | `programme_languages` 不产生重复项 |
| F20 | 重复入学时间 | 同一 Programme 重复关联相同日期 | 校验或唯一约束拒绝重复 | `programme_intakes` 不产生重复项 |
| F21 | 状态枚举 | `DRAFT`、`PUBLISHED`、`ARCHIVED`；再测 `TEST_ONLY` | 前三者合法，`TEST_ONLY` 非法 | 测试环境标识不能污染正式状态枚举 |
| F22 | 咨询展示 | Programme 学费全部为空 | 页面显示“请咨询” | 与学费筛选中的“不匹配”规则同时成立 |
| F23 | 公开索引状态 | 重建或同步公开搜索索引 | 新西兰 DRAFT 学校和 Programme 不可被搜索 | 公开索引只包含 PUBLISHED University 及其 PUBLISHED Programme |

## 当前验证状态

- F01～F15、F22、F23：已由真实 Elasticsearch/PostgreSQL 集成测试或查询映射测试验证。
- F16～F21：已由请求校验、数据库约束和 Repository 集成测试验证后端规则。
- 别名冲突、非法别名目标、索引无中断切换、增量同步并发领取、失败重试和 stale lease 恢复：已通过自动化测试验证。
- 2026-09-18 本地冒烟：筛选字典接口返回 200（开发库尚无目录数据）；新搜索返回 200 空分页；颠倒学费范围返回 400 且包含 `traceId`；旧 `/api/search` 返回 200。
- 未验证：老板正式 Excel 数据、正式数据导入、前端浏览器整体流程、真实联系咨询跳转和生产环境。

无关键词时默认按热门状态、中文名称和院校 ID 稳定排序；有关键词时先按相关度，
再按热门状态和 ID 排序。卡片内匹配 Programme 按 nested 相关度和 Programme ID 排序。
