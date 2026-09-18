# API 接口说明

## 基本约定

新公开接口统一使用 `/api/v1` 前缀。旧的 `/api/search` 和 `/api/universities`
暂时保留，供前端迁移期间兼容；新页面应使用 V1 接口。

所有响应都带有 `X-Trace-Id`。客户端可传入由 1～64 个字母、数字、点、
下划线或短横线组成的 `X-Trace-Id`；未传或格式不合法时，后端自动生成 UUID。

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
