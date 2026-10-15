# 已上线专业前景与课程审计：分片 3

范围：`MOD(programmes.id, 4) = 3`，仅检查 `CAREER_OPPORTUNITIES`、`CAREER_OUTLOOK`、`CURRICULUM` 和 `COURSE_STRUCTURE`。本分片不修改专业介绍、学费、入学要求、学历层次或其他 AI 任务字段。

## 数据来源与处理规则

- `official`：保留 V34、V35、V38 已核验并带官网链接的马来亚大学和泰莱大学资料；来源分类由 V39 按课程或学校官网域名核对。V38 已从官网课程中清除招生条件、选择规则等非课程行，并去除解析产生的无效内容。
- `third_party`：保留已有来源和正文，不自动提升为官网资料。
- `ai_generated`：沿用 V33 根据专业名称与学科分类生成的职业内容和双语参考学习领域。课程首行必须为“参考学习领域，非官方课程表”，不提供未经证实的课程代码、学分、必修/选修安排、就业率或薪资。
- V36 归档的 AI 参考课程会按 V33 的学科匹配规则重新生成并发布；来源明确为 `ai_generated`。已归档或正文为空的不可靠来源内容也会改用该备用内容，避免把无法核验的课程继续当作官网课程展示。
- 官网职业正文没有经过院校确认的中文职位译名时，中文展示保留官网英文职位名称并附中文来源及职业说明，避免错误翻译受监管职业。
- 官网课程没有经过院校确认的中文译名时，中文展示保留英文/原文名称和代码，并明确说明来源。不会用 AI 译名冒充官网名称。

## 官网获取失败记录

共用失败清单位于 `docs/data/malaysia-official-failures-2026-10-14.json`。其中 UCSI、SEGi、Monash Malaysia、MAHSA、USM、UUM、UTAR、City University Malaysia 与 APU 因 `robots.txt`、HTTP 403/500、请求失败或无法唯一匹配，没有自动标记为 `official`。这些院校继续使用明确标记的参考学习内容，等待可核验的官网页面或人工对照表。

## 上线验证查询

生产部署后按以下口径统计本分片，不在开发机伪造生产数量：

```sql
SELECT section.source_type, section.section_type, COUNT(*)
FROM programme_detail_sections section
JOIN programmes programme ON programme.id = section.programme_id
WHERE programme.status = 'PUBLISHED'
  AND MOD(programme.id, 4) = 3
  AND section.status = 'PUBLISHED'
  AND section.section_type IN ('CAREER_OPPORTUNITIES', 'CURRICULUM')
GROUP BY section.source_type, section.section_type
ORDER BY section.source_type, section.section_type;
```

迁移自身还会阻止以下情况上线：任何已发布专业缺少已发布职业内容或课程内容、中文职业正文为空，或来源标记不在 `official`、`third_party`、`ai_generated` 范围内。
