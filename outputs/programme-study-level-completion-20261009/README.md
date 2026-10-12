# 专业学历层级补全说明

处理日期：2026-10-09

## 已补全

本次只根据专业名称中的正式学位名称、通用学位缩写或官网 URL 中明确的本科/研究生路径进行判断，共补全 660 条：

| 学历层级 | 数量 |
| --- | ---: |
| 本科 BACHELOR | 529 |
| 硕士 MASTER | 101 |
| 博士 DOCTOR | 13 |
| 文凭 DIPLOMA | 16 |
| 预科 FOUNDATION | 1 |

更新脚本为 `postgres-import/fill_inferred_programme_study_levels.sql`。脚本可重复执行，并为受影响学校创建 Elasticsearch 同步任务。

## 暂不强制归类的 74 条

这些记录没有足够证据对应系统现有的五个学历层级，因此继续保持为空：

| 学校 | 数量 | 主要原因 |
| --- | ---: | --- |
| Adelaide University | 32 | 教师培训、动物伦理模块、中学项目等非学历短期课程 |
| The University of Western Australia | 21 | 页面表示专业方向或 Major，未单独说明授予的具体学位 |
| The University of Queensland | 10 | Graduate Certificate，系统当前没有研究生证书层级 |
| Kaplan Singapore | 7 | 英语证书、IGCSE 或职业资格预备课程，不等同于大学预科或学位 |
| Singapore Institute of Management | 2 | 预备证书或职业发展课程 |
| University of Technology Sydney | 2 | Graduate Certificate，系统当前没有研究生证书层级 |

如果产品需要展示这些项目，应先决定新增“证书/短期课程/专业方向”等层级或项目类型；不能为了消除空值而错误归入本科或硕士。
