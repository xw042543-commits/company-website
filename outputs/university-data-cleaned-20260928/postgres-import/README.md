# PostgreSQL 导入包

本目录保存已清洗的马来西亚院校与 Programme 数据。PostgreSQL 是正式数据源；导入完成后应通过后端搜索同步任务更新 Elasticsearch。

## 内容

- 20 所学校
- 2,403 条导入 Programme
- Programme 授课语言和入学时间关系
- 筛选字典与发布清单
- 中文名称补全和明确异常修正 SQL

## 执行顺序

先进入本目录，再通过 `psql` 执行脚本。连接信息应从本地环境变量读取，不要把密码写入命令历史或提交到 Git。

1. 备份目标数据库。
2. 执行 `import.sql` 导入基础数据。
3. 执行 `fill_missing_chinese_names.sql` 补全缺失中文名。
4. 执行 `correct_programme_anomalies.sql` 修正已确认的数据异常。
5. 执行 `reconcile_removed_programmes.sql` 归档已移除记录。
6. 执行 `publish_safe_data.sql` 应用发布清单并校验数量。
7. 通过后端 `search_sync_jobs` 机制同步 Elasticsearch。

`import.sql` 中的 CSV 路径相对于当前工作目录，因此运行命令前必须进入本目录。脚本使用事务和数量断言；任一断言失败时不得继续发布。

数据库备份、原始老板文件、爬虫原文和真实密钥不属于本导入包，不得提交到 Git。
