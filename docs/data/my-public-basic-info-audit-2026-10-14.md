# 马来西亚公立院校专业基本信息审计（任务 A）

核验日期：2026-10-14。范围仅限 `um`、`ukm`、`utm`、`upm`、`usm`。完整的逐专业、逐字段机器可读结果见 [my-public-basic-info-audit-2026-10-14.json](my-public-basic-info-audit-2026-10-14.json)。

## 实际检查结果

| 院校 | 已发布专业 | 官网唯一匹配 | 待核实 |
|---|---:|---:|---:|
| UM | 234 | 72 | 162 |
| UKM | 228 | 0 | 228 |
| UTM | 180 | 0 | 180 |
| UPM | 390 | 0 | 390 |
| USM | 445 | 0 | 445 |
| 合计 | 1,477 | 72 | 1,405 |

V39 对 72 个 UM 官网唯一匹配项目执行逐字段增量更新：

- 把 51 个缺少单位的纯数字学制替换为按月计的简体中文展示。
- 更新 72 个经官网确认的国际学生学费，展示中明确 `MYR`、国际学生以及“计费周期以官网为准”。官网页面没有明确计费周期，所以 `tuition_fee_period` 保持 `UNKNOWN`。
- 把已唯一匹配项目的旧 `9月` 展示修正为官网所列 `10月（第一学期）`，并增量补入 63 条 `3月（第二学期）` 来源记录。
- 保存每个项目的官网 URL 和核验时间；只给已有官方入学要求板块补中文标题“入学要求”。

迁移不更新专业名称、专业介绍、就业前景或课程内容，也不删除任何记录。

## 官网来源与失败记录

- UM：<https://study.um.edu.my/programmes>。72 个本科项目的详情页可唯一匹配到现有 `programme_code`。
- UKM：<https://www.ukm.my/portal/undergraduate-programmes/>。实际获取 30 个 HTML 页面，现有通用解析器没有产生可唯一匹配的专业记录。
- UTM：<https://admission.utm.my/e-brochure/>。实际获取 30 个 HTML 页面；主要专业资料以 PDF 链接提供，现有 HTML 采集器按规则跳过了 PDF。
- UPM：<https://webupmwww.upm.edu.my/admission/programmes/undergraduate-75800>。官网请求超时，未获得页面。
- USM：<https://admission.usm.my/undergraduate/undergraduate-international>。`robots.txt` 返回 HTTP 500，无法确认采集规则，采集器按项目政策停止。

对于未唯一匹配的 1,405 个专业，不使用 AI 生成学费、学制、开学时间、语言要求或入学门槛，审计结果标记为待核实。

## 来源结构限制

现有数据库已有 `official_url`、`source_url` 和 `source_checked_at`，但没有独立的 `source_type` 字段。本任务没有新建重复的来源结构；机器可读审计报告以 `official` 或 `unverified` 记录来源类型，数据库只写入官网 URL 和核验时间。

## 执行与验证边界

V39 会在合并后由 Flyway 执行，并向 `search_sync_jobs` 增加 UM 重建任务。当前工作区没有生产数据库凭据、`psql` 或 Docker，且任务明确禁止部署，因此本分支没有声称已更新生产库。已完成的验证：

- 公开生产 API 五所院校 1,477 个已发布专业全量遍历。
- 采集器 13 个测试全部通过。
- V39 范围保护测试 2 个全部通过。
- Flyway 迁移版本唯一性测试通过。
- 无可用 PostgreSQL/Docker，未执行数据库集成迁移测试。
