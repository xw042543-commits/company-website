# 四地院校数据库导入准备包

- 生成日期：2026-10-06
- 学校：80（英国、美国、澳大利亚、新加坡各 20 所）
- 国家：4
- 英文简介已有：32
- 来源记录：230
- 媒体候选：111，其中 42 条具有许可元数据
- 校验警告：81
- 发布状态：全部 DRAFT

## 可导入文件

- `postgres-import/countries.csv`
- `postgres-import/universities.csv`
- `postgres-import/import.sql`

导入脚本只写入现有 `countries` 和 `universities` 表。它不会创建 Programme、不会发布学校，也不会写入当前数据库不存在的官网、排名、来源或媒体字段。

## 审核文件

- `四地院校数据库导入审核.xlsx`：中文审核表。
- `review/university_sources.csv`：官网、第三方证据和排名来源。
- `review/media_review.csv`：媒体候选及许可审核状态。
- `review/validation_report.csv`：格式、重复和缺失项检查。
- `normalized-universities.json`：保留数据库字段及暂不能入库的来源元数据。

## 数据处理规则

- 中文校名和城市名是本次整理译名，全部保持 DRAFT。
- 英文简介只保留来源文件已有内容；缺失时保持为空。
- 官网、排名和媒体信息没有硬塞进现有 `universities` 表。
- 媒体许可为空或仅有第三方页面时不得直接发布。
- 原始数据包 `four-regions-universities-20261006.zip` 未修改。
