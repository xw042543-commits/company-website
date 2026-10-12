# 专业采集数据数据库审核包

生成日期：2026-10-07T06:41:55.018Z

## 结论

- 本包包含 474 条专业候选，全部保持 DRAFT。
- 当前 **不允许直接导入数据库**：474 条均缺少至少一个数据库必填映射。
- 缺失字段保持为空，没有自动翻译、猜测分类、生成业务代码或填 0。
- 证据文件保留 source URL、抓取日期、原文和 SHA-256 证据哈希。

## 主要阻断项

1. collection-progress 显示仅完成 79/80 所，programmes.json 明确标记 collectionComplete=false。
2. 逐校状态累计 579 条，但主文件只有 474 条，需由采集程序确认差异。
3. programme_code、subject_category_code、slug 尚未提供；前两者涉及数据库必填关系。
4. 所有语言只有原文 en-SG，正式 language code 仍为空。
5. 384 条详情均为 OVERVIEW；已提交数据库（V1-V9）没有详情表，本地未提交 V10 草案也不允许 OVERVIEW。
6. 专业费用、媒体、证据、方向和就业关系尚无已提交的正式数据库表结构。

## 文件说明

- staging/programmes_draft.csv：专业主数据暂存表，不可直接导入。
- staging/programme_*.csv：关系数据暂存表；空值保持空白。
- evidence/programme_evidence.*：完整来源证据。
- review/source_registry.csv：80 所学校的逐校采集状态。
- review/validation_summary.csv：汇总校验结果。
- review/programme_blocking_issues.csv：逐条阻断原因。
- 专业采集数据导入审核.xlsx：供人工查看与筛选。

## 数据流

官网采集结果 → 本审核包（DRAFT 暂存）→ 人工确认代码与分类 → 后端导入服务 → PostgreSQL → Elasticsearch 重建索引。

本阶段未修改 Entity、Flyway、API 或数据库，也未生成导入 SQL。
