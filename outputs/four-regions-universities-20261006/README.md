# 四地大学待审核数据包

- 更新日期：2026-10-06
- 学校记录：80（每地 20 所）
- 官网成功读取：55
- 权威第三方补充：25
- 仍需人工复查：0
- 媒体候选：111（Logo 28、校徽 5、学校图片 78）
- Wikimedia Commons 已读取许可元数据：42
- 所有业务状态：DRAFT

## 文件

- `universities.json`：完整学校、官网证据、第三方来源、媒体与警告。
- `universities.csv`：人工审核清单。
- `media.csv`：Logo 与学校图片候选。
- `crawl-review.csv`：官网抓取及第三方补充状态。

## 来源规则

官网无法读取时，使用 Wikidata/Wikipedia 结构化实体补充简介与媒体，并保存实体页、页面标题、抓取时间和内容哈希。Logo 优先使用 Wikidata 的 logo image（P154），校徽使用 coat of arms image（P94），其他图片标记为学校图片，不冒充 Logo。已尽量读取 Wikimedia Commons 文件许可；正式发布前仍需人工复核文件说明页，未核准时 `licence_raw` 保持为空。找不到可核验 Logo/校徽的学校保持为空，并在 `warnings` 中标明。

英国、美国、澳大利亚采用 QS World University Rankings 2027 的本国顺序。新加坡采用 MOE/ICA/CPE 与机构官网支持的高可信度高等教育机构清单，不冒充 QS 本国前 20。
