# 马来西亚院校第一批采集范围

核对日期：2026-09-21

## 结论

第一批采集 20 所院校，与当前前端院校目录保持一致。此清单用于确定爬虫来源范围，不代表老板已经确认正式学校代码、中文名称、热门状态、合作关系或发布状态。

国家正式代码仍等待业务确认。爬虫配置只把官网原文国家名 `Malaysia` 放入 `countryRaw`，`countryCode` 保持空值。

## 院校清单

| 分组 | 英文名称 | 当前展示中文名（待老板确认） | 官网课程入口状态 |
| --- | --- | --- | --- |
| 公立大学 | Universiti Malaya | 马来亚大学 | 已核对 |
| 公立大学 | Universiti Kebangsaan Malaysia | 马来西亚国民大学 | 已核对 |
| 公立大学 | Universiti Teknologi Malaysia | 马来西亚理工大学 | 已核对 |
| 公立大学 | Universiti Putra Malaysia | 马来西亚博特拉大学 | 已核对 |
| 公立大学 | Universiti Sains Malaysia | 马来西亚理科大学 | 已核对 |
| 公立大学 | Universiti Utara Malaysia | 马来西亚北方大学 | 已核对；当前入口偏本地本科，后续补国际生入口 |
| 马来西亚私立大学 | Taylor's University | 泰莱大学 | 已核对 |
| 马来西亚私立大学 | UCSI University | 思特雅大学 | 已核对 |
| 马来西亚私立大学 | INTI International University | 英迪国际大学 | 已核对 |
| 马来西亚私立大学 | Sunway University | 双威大学 | 已核对 |
| 马来西亚私立大学 | Asia Pacific University of Technology & Innovation | 亚太科技大学 | 已核对 |
| 马来西亚私立大学 | SEGi University | 世纪大学 | 已核对；网站偶发超时 |
| 马来西亚私立大学 | Universiti Tunku Abdul Rahman | 拉曼大学 | 已核对 |
| 马来西亚私立大学 | Tunku Abdul Rahman University of Management and Technology | 拉曼理工大学 | 官网会跨到旧 `tarc.edu.my` 子站，需单独适配 |
| 外国大学马来西亚校区 | Monash University Malaysia | 莫纳什大学马来西亚分校 | 已核对 |
| 外国大学马来西亚校区 | University of Nottingham Malaysia | 诺丁汉大学马来西亚分校 | 已核对 |
| 外国大学马来西亚校区 | University of Southampton Malaysia | 南安普顿大学马来西亚分校 | 已核对；以 `southampton.ac.uk/my` 为主入口 |
| 外国大学马来西亚校区 | Heriot-Watt University Malaysia | 赫瑞-瓦特大学马来西亚分校 | 已核对 |
| 外国大学马来西亚校区 | Curtin University Malaysia | 科廷大学马来西亚分校 | 已核对 |
| 外国大学马来西亚校区 | University of Reading Malaysia | 雷丁大学马来西亚分校 | 已核对 |

## 核验层级

1. 马来西亚高等教育部（MOHE/JPT）用于确认公立大学身份及官网。
2. Malaysian Qualifications Register（MQR/MQA）用于逐专业核对院校名称、专业名称和认证信息。
3. Education Malaysia/EMGS 用作国际学生相关院校存在性和名称的辅助核对。
4. 院校官网是专业名称、学制、学费、授课模式和入学时间的主要采集来源。
5. 第三方排名站、留学中介和聚合网站不能作为正式字段的唯一来源。

## 执行规则

- 先按 20 所学校分别生成审核包，不合并同名专业。
- 公立、私立、外国分校分别抽取一所做适配器试跑，再批量扩展。
- 官网数据与 MQA 不一致时不自动覆盖，记录冲突并交人工审核。
- 学费必须同时保留适用人群（本地或国际学生）和原始计费文字；当前模型不能表达时先保留在审核包。
- 外国大学只采集马来西亚校区实际开设的专业，不能把英国或澳大利亚主校区课程混入。
- TAR UMT 的 `tarumt.edu.my` 与 `tarc.edu.my`、UPM 的多个官方子域需要建立明确的跨域来源规则。
- 首轮不抓取需要登录、验证码或申请账号才能看到的页面。

## 配置文件

可执行来源配置位于 `crawler/config/sources.malaysia.phase1.json`。运行前必须把 `userAgent` 中的 `REPLACE_BEFORE_RUN` 替换为真实、可联系的爬虫说明地址或邮箱。
