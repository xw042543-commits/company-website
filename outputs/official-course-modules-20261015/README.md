# 官网课程全量核验：2026-10-15

## 执行范围与真实状态

线上只读快照包含马来西亚 20 所院校、2,232 个已发布专业，已对全部编号建立独立采集/失败记录，未抽样。当前线上院校目录未发现其他国家的已发布院校。

**生产 V53 已完成更新。** [发布运行 38674337469](https://github.com/xw042543-commits/company-website/actions/runs/38674337469) 成功，部署版本为 `644d25e90980f647ef70513675063fe7c36c8428`。重新读取全部 2,232 个专业后，确认 220 个正式课程板块、7,477 条中英文课程关联已真实返回，2,012 个待核实旧课程板块已隐藏；API 校验失败 0。V64 后续校正尚未合并部署，不将测试库 7,480 条结果冒充生产现状。

可导入的官网确认结果：220 个专业、7,480 条专业—课程关联，全部有中文译名、官网原文、来源及采集时间。其中 4,936 条标题未在旧列表中出现，2,544 条重新确认已有标题。计数是关联条数，不是跨专业去重后的课程数。

仍有 2,012 个专业的课程表待核实；V53 已备份并隐藏对应的 2,012 条课程详情板块；V64 保持待核实状态，不重复统计新增隐藏。旧板块的 13,118 行是候选内容计数，不能冒称独立真实课程数。已确认板块中另有 2,280 行旧内容被新列表替换，原文同样备份。

不能算作完成全部官网人工确认：969 个专业尚未确认唯一归属，599 个遇到访问/robots 限制，374 个已取得官方 PDF 但尚未从多专业文件唯一核实课程表，70 个未解析出可核实列表。每个失败编号及尝试 URL 见 pending-programmes.csv。

## 来源与翻译边界

- 正式课程只来自学校官网；中文是平台译名，不冒充学校官方中文。保留 `nameEn`（历史字段名，个别官网原文为马来语）、原文证据、课程代码和翻译时间/方式。
- 全部译名经过机器翻译和格式/术语规则校验，术语表中的条目另行校对；尚未逐项完成专业译者人工审校。
- 本轮未取得可核实的逐课程介绍，介绍留空，不生成描述。学分、适用版本均未取得可靠值，留空；只有官网明确列出的代码、必选修字段会保存。
- 独立校区字段未从专业页核实；仅从与专业主标题唯一匹配的页面取课程，不合并不同来源或校区的列表。存在歧义的页面不发布。

|院校|检查专业|官网确认专业|可导入课程关联|待核实|
|---|---:|---:|---:|---:|
|apu|71|28|1116|43|
|city|43|2|81|41|
|help|46|0|0|46|
|inti|38|0|0|38|
|mahsa|4|0|0|4|
|monash|53|0|0|53|
|nilai|41|33|929|8|
|nottingham|86|0|0|86|
|segi|3|0|0|3|
|southampton|13|0|0|13|
|sunway|135|83|2648|52|
|taylor|45|11|307|34|
|ucsi|63|0|0|63|
|ukm|228|0|0|228|
|um|234|63|2399|171|
|upm|390|0|0|390|
|usm|445|0|0|445|
|utar|79|0|0|79|
|utm|180|0|0|180|
|uum|35|0|0|35|

## 代表性官方来源

- [Bachelor of Science (Honours) in Information Technology](https://www.apu.edu.my/course/bachelor-information-technology)：44 门；编号 `APU_BACHELOR_PDF_001`。
- [Bachelor of Arts (Honours) Digital Film Production](https://sunwayuniversity.edu.my/faculty-of-arts-and-social-sciences/courses/bachelor-of-arts-honours-digital-film-production)：33 门；编号 `SUNWAY_BACHELOR_001`。
- [BACHELOR OF SHARIAH](https://study.um.edu.my/bachelor-of-shariah)：36 门；编号 `UM_BACHELOR_001`。
- [Bachelor of Business Administration (Honours)](https://nilai.edu.my/programme/bachelor-of-business-administration-honours)：31 门；编号 `NILAI_BACHELOR_PDF_001`。
- [Bachelor of Software Engineering (Hons)](https://university.taylors.edu.my/en/study/explore-all-programmes/computer-science/undergraduate/bachelor-of-software-engineering.html)：29 门；编号 `TAYLOR_BACHELOR_009`。
- [Bachelor of Communication (Hons) Journalism](https://city.edu.my/bachelor-of-communication-journalism/)：40 门；编号 `CITY_BACHELOR_006`。

完整逐课程来源在 official-modules.csv 与 reviewed-audit.json 中；没有用代表性链接代替其他专业的核验记录。

## 根因和修复

旧页面以“存在 sourceType 或来源 URL”作为课程可展示条件，AI 内容也能通过，且混用旧 bodyZh/bodyEn。新页面只接受 `official + VERIFIED + 结构化课程 + 有效中文译名`。官网解析只允许专业主标题建立归属，不允许“相关推荐”卡片建立归属；排除灵活教育/辅修推荐、选课说明、类别、百分比、入学要求、单独先修代码；以课程代码和原文名称去重。缓存记录输入指纹、抓取时间，支持到期刷新和手动刷新；旧快照不会被新来源悄悄冒用。

## 文件与执行

- reviewed-audit.json：全部编号的课程、归属、来源、失败原因、翻译记录。
- original-curricula.json / .sha256：线上原始课程板块备份及校验和，不含用户资料。
- official-modules.csv：可核验的中英文课程表；pending-programmes.csv：逐专业失败记录。
- source-targets.json：官网采集目标。
- `backend/src/main/resources/db/migration/V64__refine_verified_course_modules.sql`：最终 PostgreSQL 导入迁移。

生产执行应随审核后的后端发布，由 Flyway 自动执行 V64（依赖已合并的 V53）；先备份数据库，检查当前迁移版本和分支，不能跳过代码审查。V52 已被同事的目录 Excel 草稿功能使用，本任务不包含旧的未合并分类修复提案。不要重复手动执行已成功的迁移。

迁移在同一事务中先备份所有旧 CURRICULUM 板块，确认马来西亚/学校归属，再只更新课程字段；不删除专业，不修改名称、分类、学费、申请或收藏。未确认板块设 ARCHIVED/PENDING，原文保留；正式板块 PUBLISHED/VERIFIED。其他国家和不在快照中的编号保持不变。

发布网站与后端后检查：课程板块使用新结构；网站 API 请求 no-store，小程序专业详情缓存最长 2 分钟，重启小程序即可清除内存旧缓存。新版前端不会用旧 AI 课程或静态课程回填。小程序还需重新编译、上传和发布，不能将网站部署等同于小程序已上线。

## 可重复运行的流程

```powershell
node scripts/backup-live-course-modules.mjs .data/new-course-review
python -m pip install -r crawler/tools/requirements.txt
python crawler/tools/official_modules.py --input .data/new-course-review/source-targets.json --output .data/new-course-review/official --workers 4 --refresh
node scripts/normalize-official-modules.mjs .data/new-course-review/official/report.json .data/new-course-review/course-backup .data/new-course-review/normalized.json
node scripts/translate-official-course-titles.mjs .data/new-course-review/normalized.json .data/new-course-review/translations.json
node scripts/localize-official-modules.mjs .data/new-course-review/normalized.json .data/new-course-review/translations.json .data/new-course-review/translated.json
node scripts/finalize-official-modules-audit.mjs .data/new-course-review/translated.json .data/new-course-review/source-targets.json .data/new-course-review/course-backup .data/new-course-review/reviewed
node scripts/build-official-modules-import.mjs .data/new-course-review/reviewed/reviewed-audit.json .data/reviewed-next-migration.sql
```

原始专业 API 备份和原始网页快照在本地 `.data` 目录；增量复跑前重新建立发布范围与备份，不能只复用旧编号。译名缓存只接收公共课程标题，缺少译名时隐藏该项；新抓取数据须校对后生成新迁移，禁止修改已执行的迁移。使用 `--offline` 可按保存的官网快照复核，不重新访问网站。

## 验证

验证结果会随本分支最终 CI 更新；生产只读审计历史运行：[38665675206](https://github.com/xw042543-commits/company-website/actions/runs/38665675206)。该旧审计按板块非空计数，不能证明课程真实性。

选课说明中的“或”只表示备选关系，不是课程名。已拆分可唯一核验的实际课程并保留备选关系；无具体名称的外语课/选修类别仍不发布。

## 防止旧数据再次覆盖

V64 的正式课程只读取经过核验的结构化 JSON，旧正文不替代官方模块。学校、学历、英文名或校区变化时，先备份并停用旧课程；仅修改学费不影响课程。工作人员维护的内容在批量导入前被识别并要求单独对账，不覆盖人工编辑和回收站决定。

## 已执行验证

- PostgreSQL 17.11：对全部 2,232 个专业建立测试数据，实际执行 V1–V64，逐条比较全部已确认课程 JSON，验证备份、归档和其他字段不变；再验证旧正文不会替代正式 JSON、校区变化会停用旧关联、学费修改不会误伤，并检查既有课程管理编号保留。
- `local-database-verification.json`：测试自动生成的数据库回读结果。测试库包含合成的其他字段对照值，不是生产整库副本。
- `live-scope-recheck.json`：再次读取线上全部目录，仍为 20 所院校、2,232 个专业，与初始快照无新增或遗漏；生产写入为 0。
- 官网解析回归 8 项、导入/译名及快照回归 10 项通过；网站和小程序新增对全部编号及课程的展示遍历测试。
- 本机脚本套件原始执行 79/83；4 项因测试写死不存在的 Bash 路径而未启动。使用本机 Git Bash 执行同一套 12 项部署测试全部通过，未修改无关部署逻辑。GitHub Linux 部署检查通过。
- 网站 lint 仅有原有 RemoteImage 的 img 警告，0 错误；两端测试、类型检查与网站构建通过。最终 CI 和完整修改文件以 [PR #158](https://github.com/xw042543-commits/company-website/pull/158) 为准。

修改文件列表见 [changed-files.txt](changed-files.txt)。V64 后续校正仍需按仓库流程审阅合并后发布；V53 的生产写入与 API 回读已经执行。

迁移不可变性：首轮 PR #158 在继续校对期间已由外部合并，因此本轮恢复 V53 SQL、原 V53 测试及其原始 fixture 的主分支版本，所有后续课程修订和保护均由 V64 增量执行；V64 另存一批备份，不覆盖 V53 备份。

## 生产回读与限制

- `production-v53-verification.json`：全部 2,232 个专业逐条回读，正式课程 JSON 与已合并 V53 fixture 一一对应，缺失中文/来源为 0，API 失败为 0。
- 职业板块 2,232 个均未改变；专业基础字段核对 2,232 个，发现 UM_BACHELOR_046 的中文名称/更新时间在核验期间被其他操作更新，本次 SQL 不更新专业主表，保留新值而不回滚。
- `production-v53-website-check.json`：官网详情要求登录，匿名访问正确跳转并保留返回地址。没有取得登录会话，不能声称已完成线上登录后的视觉验收；两端课程映射已对所有编号和课程运行回归检查。
- 小程序 API 数据已经更新；V64 小程序代码仍需编译、上传和发布，不能把网站发布等同于微信小程序新代码已发布。
- 旧数据库审计曾把 AI 占位课程计为完整覆盖。V64 同步调整只读审计：正式课程必须 official/VERIFIED，有明确待核实并已归档的板块不再被要求补写 AI 内容；另输出真实待核实数量和备份数量。
- V64 导入前还检查采集时的原始专业名与学历；若并发修改归属则整个导入回滚。没有英文名的既有条目保留中文身份快照，并逐项对照其官网英文主标题，不根据名称编造课程。

2026-10-16 再次全量回读：见 `production-current-verification.json`。仍有 220 个正式板块、7,477 条课程关联，2,012 个待核实板块未公开，失败 0；与已发布 V53 原课程字段逐项一致，后台维护标记为 0。V54–V63 已由其他任务占用并保留原样，本次最终增量版本为 V64。

原文与中文译名采用机器翻译、术语表及全量异常校验；不能声称所有课程完成专业译者人工审校。正式字段的描述、学分和版本没有可核实来源时仍留空。

本轮最终 PR：[#185](https://github.com/xw042543-commits/company-website/pull/185)。正式课程版本缺失时显示“待核实”，不把解析未取得的信息表述为学校没有提供。
