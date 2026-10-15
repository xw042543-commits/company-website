# API 接口说明

## 基本约定

新公开接口统一使用 `/api/v1` 前缀。旧的 `/api/search` 和 `/api/universities`
暂时保留，供前端迁移期间兼容；新页面应使用 V1 接口。

所有响应都带有 `X-Trace-Id`。客户端可传入由 1～64 个字母、数字、点、
下划线或短横线组成的 `X-Trace-Id`；未传或格式不合法时，后端自动生成 UUID。

## 用户注册与登录

认证使用 PostgreSQL 会话和 `JSESSIONID` Cookie，不使用前端保存的 JWT。浏览器
请求必须带 `credentials: "include"`。所有会改变数据的请求必须先取得 CSRF
Token，再将返回的 `headerName` 和 `token` 加入请求头。

### 公开认证接口

| 方法 | 路径 | 用途 |
| --- | --- | --- |
| `GET` | `/api/v1/auth/csrf` | 获取 CSRF 请求头名称和 Token |
| `GET` | `/api/v1/auth/session` | 查询当前是否已登录 |
| `POST` | `/api/v1/auth/register` | 使用邮箱或手机号注册 |
| `POST` | `/api/v1/auth/resend-verification` | 重发验证信息 |
| `POST` | `/api/v1/auth/verify-email` | 使用邮件 Token 完成验证 |
| `POST` | `/api/v1/auth/verify-phone` | 使用手机号和验证码完成验证 |
| `POST` | `/api/v1/auth/login` | 邮箱/手机号与密码登录 |
| `POST` | `/api/v1/auth/logout` | 退出并作废当前会话 |
| `POST` | `/api/v1/auth/forgot-password` | 申请重置密码，响应不暴露账号是否存在 |
| `POST` | `/api/v1/auth/reset-password` | 使用一次性 Token 重置密码 |

各写接口的 JSON 字段：

| 路径 | 请求字段 |
| --- | --- |
| `/register` | `fullName`、`email`、`phone`、`password`、`agreementAccepted`、`privacyAccepted`、`locale` |
| `/resend-verification` | `identifier`、`locale` |
| `/verify-email` | `token` |
| `/verify-phone` | `phone`、`code` |
| `/login` | `identifier`、`password`、`rememberMe` |
| `/forgot-password` | `identifier`、`locale` |
| `/reset-password` | `token`、`newPassword` |

注册请求示例：

```json
{
  "fullName": "Example User",
  "email": "user@example.com",
  "phone": null,
  "password": "example-password",
  "agreementAccepted": true,
  "privacyAccepted": true,
  "locale": "zh"
}
```

邮箱和手机号二选一。注册和找回密码返回通用结果，避免被用来批量探测已注册
账号。完成验证后才能登录。`rememberMe=false` 时会话默认有效 24 小时，
`rememberMe=true` 时默认有效 30 天。

下面示例使用临时 Cookie 文件演示 CSRF 与登录顺序，请不要在命令或文档中填写真实密码：

```bash
curl -c /tmp/udajo-cookie.txt http://localhost:8080/api/v1/auth/csrf
curl -b /tmp/udajo-cookie.txt -c /tmp/udajo-cookie.txt \
  -H 'Content-Type: application/json' \
  -H 'X-XSRF-TOKEN: <value-from-csrf-response>' \
  -d '{"identifier":"student@example.com","password":"local-test-password","rememberMe":false}' \
  http://localhost:8080/api/v1/auth/login
```

### 需要登录的账号接口

| 方法 | 路径 | 用途 |
| --- | --- | --- |
| `GET` | `/api/v1/account` | 查询脱敏后的账号资料 |
| `PUT` | `/api/v1/account/password` | 校验旧密码后修改密码，并作废已有会话 |
| `DELETE` | `/api/v1/account` | 校验密码和确认字段后软删除账号 |

`PUT /password` 的 JSON 为 `currentPassword` 和 `newPassword`；`DELETE /account` 的 JSON
为 `currentPassword` 和 `confirmation`，其中 `confirmation` 必须精确填写 `DELETE`。

### 本地联调

在 `dev` 或 `test` Profile 中，只有从本机回环地址访问时才能读取最新的一次性
验证通知：
本地开放注册还需要在本人 `.env` 中设置
`APP_AUTH_REGISTRATION_ENABLED=true`，并为 `APP_AUTH_AGREEMENT_VERSION` 和
`APP_AUTH_PRIVACY_VERSION` 填写非空的本地版本号。

```text
GET /api/dev/auth/notifications/latest?identifier=user@example.com
```

读取成功后该条通知立即消费。此接口在 `prod` Profile 不存在，不能作为正式邮件
或短信服务的替代。

正式环境启用注册前，必须同时确认 HTTPS、官网域名、CORS 来源、Secure Cookie、
正式协议版本和真实邮件/短信通道。默认配置会保持生产注册关闭。

## 筛选字典

### `GET /api/v1/catalog/filter-options`

返回前端筛选控件所需的国家、专业分类、学历层次、课程模式和授课语言。
国家按 `code` 排序；其他字典只返回 `PUBLISHED` 数据，按显示顺序和代码排序。

```json
{
  "countries": [{ "code": "GB", "nameZh": "英国", "nameEn": "United Kingdom" }],
  "subjectCategories": [{ "code": "COMPUTING", "nameZh": "计算机", "nameEn": "Computing" }],
  "studyLevels": [{ "code": "MASTER", "nameZh": "硕士", "nameEn": "Master" }],
  "courseModes": [{ "code": "ON_CAMPUS", "nameZh": "线下", "nameEn": "On campus" }],
  "languages": [{ "code": "EN", "nameZh": "英语", "nameEn": "English" }]
}
```

## 院校和课程搜索

### `GET /api/v1/universities/search`

搜索结果按院校分页，一所院校只出现一次。每所院校最多返回 3 个实际
匹配的课程，`matchedProgrammeCount` 保留完整匹配数，供前端显示“查看全部”。

### 查询参数

| 参数 | 说明 | 规则 |
| --- | --- | --- |
| `q` | 专业关键词或已发布别名 | 可选，最长 100 字符 |
| `category` | 专业分类代码 | 可重复 |
| `level` | 学历层次代码 | 可重复 |
| `country` | 国家代码 | 可重复 |
| `mode` | 课程模式代码 | 可重复 |
| `language` | 授课语言代码 | 可重复 |
| `duration` | 学制月数 | 正整数 |
| `intake` | 入学年月 | `YYYY-MM` |
| `tuitionMin` | 用户可接受的最低人民币总学费 | 非负数 |
| `tuitionMax` | 用户可接受的最高人民币总学费 | 非负数，不得小于 `tuitionMin` |
| `page` | 页码 | 从 1 开始，默认 1 |
| `size` | 每页院校数 | 默认 12，最大 48 |
| `sort` | 排序 | 当前只接受 `relevance` |

同一维度内的多个值是 **OR**，不同维度之间是 **AND**。院校下必须有同一个
Programme 同时满足所有课程维度，不会把不同专业的条件拼成一次命中。
每个维度最多接受 20 个原始参数值。

学费采用“区间相交”判定，边界值包含在内。课程总学费区间与请求区间有交集
即算匹配；开启学费筛选时，总学费上下界不完整的课程不匹配。

### 200 成功响应

```json
{
  "items": [{
    "id": 1,
    "slug": "example-university",
    "nameZh": "示例大学",
    "nameEn": "Example University",
    "countryCode": "GB",
    "countryNameZh": "英国",
    "countryNameEn": "United Kingdom",
    "cityZh": null,
    "cityEn": "London",
    "popular": true,
    "matchedProgrammeCount": 1,
    "matchedProgrammes": [{
      "id": 11,
      "programmeCode": "EXAMPLE-MSC-CS",
      "nameZh": "计算机科学",
      "nameEn": "Computer Science",
      "categoryCode": "COMPUTING",
      "studyLevelCode": "MASTER",
      "courseModeCode": "ON_CAMPUS",
      "languageCodes": ["EN"],
      "durationMonths": 12,
      "intakeMonths": ["2027-09"],
      "tuitionTotalRmbMin": 200000,
      "tuitionTotalRmbMax": 236000,
      "durationDisplay": "1 year",
      "intakeDisplayTexts": ["September 2027"],
      "tuitionDisplay": "GBP 22,000–26,000"
    }]
  }],
  "page": 1,
  "pageSize": 12,
  "totalItems": 1,
  "totalPages": 1
}
```

### `GET /api/v1/universities/{universitySlug}/programmes/{programmeSlug}`

Returns one published programme for its published university. The final path value accepts the
stable slug returned by programme-list responses or the numeric programme ID returned by university
search. A missing university or programme returns the standard 404 response.

### `GET /api/v1/universities/{universitySlug}/programme-categories`

返回该院校已发布专业实际使用的已发布学科分类，按分类字典的 `sortOrder` 和代码排序。
空分类不会返回；`programmeCount` 是该院校在该分类下的已发布专业数量。分类名称直接来自
`SubjectCategory` 字典，供院校详情页生成动态筛选标签。

```json
[{ "code": "COMPUTING_IT", "nameZh": "计算机与信息技术", "nameEn": "Computing and Information Technology", "programmeCount": 12 }]
```

中文或英文字段在源数据未提供时可为 `null`，后端不自动翻译。没有匹配院校时仍
返回 200：

```json
{
  "items": [],
  "page": 1,
  "pageSize": 12,
  "totalItems": 0,
  "totalPages": 0
}
```

## 错误响应

错误体统一包含 `code`、`message`、`fieldErrors` 和 `traceId`，不返回 Java 堆栈、
密码、联系方式、备注或完整请求内容。

### 400 参数校验失败

```json
{
  "code": "VALIDATION_ERROR",
  "message": "Request validation failed",
  "fieldErrors": {
    "tuitionMax": "must be greater than or equal to tuitionMin"
  },
  "traceId": "frontend-123"
}
```

### 503 搜索服务暂时不可用

```json
{
  "code": "SEARCH_SERVICE_UNAVAILABLE",
  "message": "Search service is temporarily unavailable",
  "fieldErrors": {},
  "traceId": "frontend-123"
}
```

503 只用于已知的 Elasticsearch 连接或可用性故障。编程错误和未知异常不会被
伪装成 503。

## 公开文章

语言、奖学金、留学项目和新闻共用文章接口。栏目代码分别为 `language`、
`scholarships`、`programmes`、`news`。这里的 `programmes` 指留学项目文章，
不等于院校下的学位课程。

### `GET /api/v1/articles/{section}`

返回指定栏目的文章摘要，参数 `page` 从 1 开始、默认 1；`size` 默认 12、最大 48。
按发布时间倒序排列，同一发布时间按文章 ID 倒序。列表只返回已发布且发布时间
已到的内容，不含正文。没有文章时返回 200 和空分页。

```json
{
  "items": [{
    "section": "news",
    "slug": "example-update",
    "titleZh": "示例标题",
    "titleEn": null,
    "summaryZh": "示例摘要",
    "summaryEn": null,
    "coverPath": null,
    "publishedAt": "2026-09-22T08:00:00Z"
  }],
  "page": 1,
  "pageSize": 12,
  "totalItems": 1,
  "totalPages": 1
}
```

上面仅说明响应格式，不代表数据库已有这篇文章。非法分页参数返回 400；未知栏目返回 404。

### `GET /api/v1/articles/{section}/{slug}`

详情在摘要字段之外返回 `bodyMarkdownZh`、`bodyMarkdownEn`、`sourceName`、
`sourceUrl` 和 `authorName`。缺失语言返回 `null`，后端不自动翻译，也不把
Markdown 转换为 HTML。不存在、草稿、归档和未到发布时间的文章都返回 404。
当前只提供公开读取，不提供文章创建、编辑、上传或审核接口。

## 留学咨询

### `POST /api/v1/consultations`

接收官网留学咨询表单。接口默认关闭，并且必须同时配置正式隐私声明版本后才会
保存数据。当前前端仍保持“暂未开放”，避免在隐私声明确认前收集真实个人资料。

请求示例：

```json
{
  "name": "王欣",
  "contact": "wx-example",
  "intendedSchool": "University of Malaya",
  "intendedCourse": "Computer Science",
  "qualification": "bachelor",
  "notes": null,
  "locale": "zh",
  "privacyConsent": true
}
```

`name`、`contact`、`locale` 和 `privacyConsent` 必填。姓名和联系方式最长 100 字符，
意向学校和专业最长 200 字符，备注最长 2000 字符。学历层次只接受
`foundation`、`bachelor`、`master`、`doctorate`。输入会先去除首尾空白，可选字段
去除空白后为空时按 `null` 保存。成功时返回 201、公开查询编号和提交时间，不返回
数据库主键或用户填写的联系方式。

接口关闭或未配置隐私声明版本时返回 503，错误代码为
`CONSULTATION_SUBMISSION_UNAVAILABLE`，并且不会保存任何数据。启用时需同时设置：

```properties
APP_CONSULTATION_SUBMISSION_ENABLED=true
APP_CONSULTATION_PRIVACY_NOTICE_VERSION=正式声明版本号
```

隐私声明版本号去除首尾空白后必须为 1～50 个字符。接口只接受不超过 16 KB 的请求体，
超出时返回 413，错误代码为 `CONSULTATION_PAYLOAD_TOO_LARGE`。同一客户端地址在
10 分钟内最多发起 5 次提交尝试，包括 JSON 错误或字段校验失败的请求；第 6 次起
返回 429，错误代码为
`CONSULTATION_RATE_LIMITED`；窗口到期后自动恢复。限流计数保存在 Redis，只保存客户端
地址的 SHA-256 摘要，不保存原始地址。Redis 不可用时接口返回 503，不会绕过限制继续
收集资料。

可通过以下环境变量调整默认安全参数：

```properties
APP_CONSULTATION_MAXIMUM_BODY_SIZE=16KB
APP_CONSULTATION_RATE_LIMIT_MAXIMUM_SUBMISSIONS=5
APP_CONSULTATION_RATE_LIMIT_WINDOW=10m
APP_TRUSTED_PROXIES=
```

本地直连后端时，`APP_TRUSTED_PROXIES` 保持为空。正式部署在 Nginx
等反向代理后方时，该配置只填写能够直接连接后端的代理 IP，多个 IP 用逗号
分隔，只接受完整 IPv4 或 IPv6 字面量，不接受主机名。后端只会接受这些可信代理
提供的 `X-Forwarded-For`，普通访客自行伪造的
转发头会被忽略。代理必须追加它实际看到的客户端地址，并在防火墙中禁止用户绕过代理
直接访问后端。未配置可信代理时，后端始终使用直连地址进行限流。
咨询、认证和生产 HTTPS 转发判断共用此名单。旧 `APP_CONSULTATION_TRUSTED_PROXIES`
与 `APP_AUTH_TRUSTED_PROXIES` 可暂时回退；若多个名单不一致，应用启动失败。

## 微信网站扫码登录

微信登录默认关闭。`GET /api/v1/auth/providers` 只返回可用性，例如
`{"wechat":false}`，不会返回 AppID、AppSecret 或回调地址。关闭时，二维码配置接口返回服务不可用，账号密码登录不受影响。

启用后的流程如下：

1. 登录页通过 `GET /api/v1/auth/wechat/qr-config?locale=zh&returnTo=/zh/account` 获取与当前浏览器会话绑定的公开二维码参数；响应禁止缓存，且绝不包含 AppSecret；
2. 页面使用微信官方 `WxLogin` 组件展示二维码；无法嵌入时可回退到 `GET /api/v1/auth/wechat/start?locale=zh&returnTo=/zh/account` 发起授权；
3. 微信开放平台回调 `GET /api/v1/auth/wechat/callback`；
4. 已绑定的有效账号直接建立现有服务端 Session；
5. 未绑定身份跳回登录页，通过 `POST /api/v1/auth/wechat/bind` 验证已有邮箱或手机号账号后绑定。

绑定请求格式为：

```json
{"identifier":"member@example.com","password":"账户密码","rememberMe":false}
```

授权 `state`、待绑定微信身份和登录 Session 都只保存在服务端。接口不会根据微信身份自动
创建未验证账号，也不会把授权 code、Token、Session ID 或微信原始标识写入公开响应。


## 官网课程字段（V53 配套客户端）

网站专业详情与小程序专业详情的 sections 追加 `courseModules`、`curriculumReviewStatus`（VERIFIED/PENDING/null）、`curriculumVersion`。课程对象包含 `nameZh`、`nameEn`、`descriptionZh/En`、`courseCode`、`credits`、`requirement`、`sourceUrl`、`sourceCheckedAt`、`curriculumVersion`、`evidence`、`translationMethod`、`translationCheckedAt`。旧 body 字段保留兼容；新版页面只展示 official 且 VERIFIED 的结构化中文课程，未知字段留空，归档板块不从公开 API 返回。中文是平台译名，原文可核验；不根据专业名称生成课程。


## 管理员 Excel 批量导入

管理员页面：`/[locale]/admin/imports`。所有 `/api/v1/admin/imports/**` 接口沿用服务端
`ROLE_ADMIN` 校验和登录会话；所有写请求必须携带 CSRF Token。解析、字典校验及查重在后端完成。

| 方法 | 路径 | 用途 |
| --- | --- | --- |
| GET | `/api/v1/admin/imports/templates/{type}` | 下载固定 .xlsx 模板与当前字典，type 为 UNIVERSITY 或 PROGRAMME |
| POST | `/api/v1/admin/imports` | multipart：type、file，校验后生成独立导入批次与行级草稿 |
| GET | `/api/v1/admin/imports?page=1&size=20` | 按时间分页查看批次；size 最大100 |
| GET | `/api/v1/admin/imports/{id}` | 查看批次统计、上传人、时间及失败原因 |
| GET | `/api/v1/admin/imports/{id}/rows` | 返回该批次全部行，最多500条 |
| PUT | `/api/v1/admin/imports/{id}/rows/{rowId}` | JSON `{payload: {...模板字段}}`，编辑并重新校验；已发布/移除行不可改 |
| POST | `/api/v1/admin/imports/{id}/remove` | JSON `{rowIds: [1,2]}`，软移除有效草稿 |
| POST | `/api/v1/admin/imports/{id}/reprocess` | 对未发布、未移除行重新校验和查重；原始公式等解析错误保留，需显式编辑修正 |
| POST | `/api/v1/admin/imports/{id}/publish` | JSON `{rowIds: [1,2]}`，再查重后事务发布；返回 batch、publishedCount |
| GET | `/api/v1/admin/imports/{id}/duplicates.xlsx` | 三个Sheet：完全重复、疑似重复、字段冲突；含导入数据、已有数据、原因及ID |

固定模板从服务端动态生成，第一张表必须为“导入数据”，表头及顺序不得更改。
模板附“填写说明”和“字典”，关联使用稳定代码，不按中文显示名称绑定。
每次最多500行，压缩文件最大5MB、展开内容最大30MB；不接受公式、宏、外部工作簿链接、
额外列或非法格式。数字为非负学费（最多两位小数）及正整数学制月数。
名称至少中文或英文一个；院校、国家、学科、学历、授课方式必须使用存在的有效字典。

结果分类：NEW（有效草稿）、EXACT_DUPLICATE、POSSIBLE_DUPLICATE、CONFLICT、INVALID。
查重使用Unicode NFKC、大小写/空白/标点归一、中文/英文名称、明确提供的别名，以及国家、
所属院校、学历、校区。不会猜测未知中英文译名。名称近似或校区信息不足时进入疑似重复区。
不同明确校区、不同学历不自动合并；同编码或网址冲突均阻止导入。
数据库及本次Excel内部都参与查重，重复数据默认不创建草稿、不覆盖正式记录。

发布在同一事务中先锁定批次，再锁定院校/专业写入，重新读取正式记录查重；这也阻止其他
后台写入在查重与插入间穿插。同一选择若发现任意重复/冲突，则本次发布0条并返回更新后的
分类，管理员重新选择；数据库异常则整批回滚。重复提交已发布的选择返回0条，不重复新增。
发布复用现有管理服务写入正式表、详情章节及搜索同步队列；原有有效数据不修改。
结构错误的文件保留失败批次与原因，须修正文件并重新上传；行级错误可在界面编辑和重新处理。

## 管理后台国家筛选

`GET /api/v1/admin/catalog/universities` 与 `GET /api/v1/admin/catalog/programmes`
均接受可选 `country`（两位国家代码，如 `MY`）。空值或省略表示全部国家；服务端去除首尾
空白并转为大写，格式不合法返回400，字典中不存在的合法代码返回空结果。
国家下拉框动态使用 `/api/v1/admin/catalog/options` 的 `countries`，不硬编码国家。

国家筛选通过 `universities.country_id → countries.id` 在 PostgreSQL 执行，和搜索 `q`、
状态 `status`、专业的所属院校 `universityId`、学科 `categoryId`、学历 `studyLevelId` 使用AND组合。
专业列表同步提供学科和学历字典下拉框；后两个参数为可选的正整数ID，省略表示全部。列表与COUNT使用相同条件，
筛选先于LIMIT/OFFSET；省略country保持已有请求兼容。不改变字典、数据结构或公开搜索接口。
切换国家重置到第1页，翻页、编辑保存和取消编辑保留当前国家及其他筛选；编辑后当前页
超出剩余页数时自动回到最后有效页。前端忽略过期请求，避免快速切换国家时旧响应覆盖新结果。

## 工作人员导入与删除管理（V54）

导入模板支持 UNIVERSITY、PROGRAMME、COURSE。国家、关联院校、学历、分类可使用已有中文/英文名称或编码；内部编码和页面地址可留空，上传预览会显示固定生成结果。重复记录复用已有编码并保持不导入、不覆盖。课程 programmeCode 指向所属专业，courseCode 是内部编码，officialCode 是学校课程代码。

管理员 `/api/v1/admin/catalog/courses` 支持 GET（q/programmeId/status/page/size）、POST、PUT /{id}、PATCH /{id}/status；GET /programmes 返回可关联专业。POST/PUT 字段为 courseCode（选填）、programmeId、nameZh、nameEn、officialCode、descriptionZh、sourceUrl、sourceType（official/third_party/ai_generated）、sortOrder。已有课程的编码及所属专业不可变。

院校、专业及课程列表 status=TRASH 表示回收站，其他列表默认排除回收站。所有写请求仍需管理员登录与 CSRF。

`/api/v1/admin/catalog/lifecycle`：GET /capabilities 返回 permanentDelete；GET /audit?page=1&size=20 返回操作记录；POST /preview 预览关联影响；POST 根路径执行。请求为 {type: UNIVERSITY|PROGRAMME|COURSE, ids: [正整数，1至100条], action: TRASH|RESTORE|PURGE, confirmation: 确认或永久删除}。预览不需要 confirmation。PURGE 每次检查当前数据库高级管理员授权，只可清理回收站中无关联数据。任一记录不符合条件则整批回滚；停用和回收站均不破坏原申请。详见 [操作与授权指南](ADMIN_STAFF_IMPORT_GUIDE.md)。
