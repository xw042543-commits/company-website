# 院校资料采集器

这是与正式业务库隔离的资料采集工具。它只访问配置中明确允许的学校官网，遵守 `robots.txt` 和请求间隔，保存网页快照，并生成待人工审核的 JSON 数据包。它不会连接 PostgreSQL，也不会发布数据。

## 数据边界

- 学校代码、专业代码、国家代码、公共专业分类、学历层次、课程模式和语言代码一律不猜，输出为 `null`。
- 网页明确标注的分类、学历、模式和语言只进入对应的 `*Raw`/`rawText` 字段。
- 学制保留原文，`durationMonths` 不自动换算。
- 学费缺失时保持 `null`，绝不写 `0`；计费周期固定为 `UNKNOWN`，人民币换算及汇率全部留空。
- 所有候选记录都是 `DRAFT`，并携带字段级来源网址、抓取时间和原文。
- 英语申请要求不会被识别为英语授课；仅接收页面结构化数据中明确的 `inLanguage`。
- 校区、授权、合作关系和审核人等当前没有正式表字段的内容保留在审核数据包中，不塞入学校介绍。

## 使用方法

1. 复制 `config/sources.example.json` 到一个不含密钥的新配置文件。
2. 将 `userAgent` 中的地址改为真实的爬虫说明或联系方式。
3. 每所学校只配置官方种子网址和允许访问的官方域名。
4. 在本目录运行：

```powershell
npm run crawl -- --config config/sources.json
```

马来西亚第一批 20 所院校的已核对入口见 `config/sources.malaysia.phase1.json`；运行前同样必须替换其中的联系方式占位文本。范围和核验规则见 `../docs/data/malaysia-crawl-scope.md`。

结果写入 `.data/runs/<时间>/<来源>/`：

- `raw/*.html`：当次网页快照，便于复核网站改版前的原文；该目录已被 Git 忽略。
- `review-bundle.json`：学校与专业候选数据、字段级证据、警告和快照索引。
- `manifest.json`：本次运行汇总。

运行检查：

```powershell
npm run check
```

## 当前识别范围

第一版优先读取学校官网的 JSON-LD 标记：`CollegeOrUniversity`、`EducationalOrganization`、`Course` 和 `EducationalOccupationalProgram`。普通页面仍会保存快照，但不会靠关键词猜测专业、语言、分类、入学时间或计费周期。后续应为目标学校增加独立适配器，并用真实页面快照编写回归检查。

抓取前应确认网站条款、版权和当地适用规则。遇到禁止抓取的 `robots.txt`、无法读取的 `robots.txt`、登录墙或验证码时，本工具不会绕过。
