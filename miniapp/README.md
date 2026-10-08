# 洋豆角留学小程序

该目录是独立的微信原生小程序工程，与 `frontend` 网站工程互不影响，共用 Spring Boot REST API。

## 本地运行

1. `utils/config.js` 默认连接正式站 `https://yangdoujiao.com`；联调测试环境时可改成对应 HTTPS 地址。
2. 用微信开发者工具导入本目录。
3. 将 API 域名加入小程序后台的 `request` 合法域名。
4. 在 `project.config.json` 中将测试 AppID 替换为正式 AppID。

专业详情入口参数：`/pages/programme-detail/index?university=<院校slug>&programme=<专业id或slug>`。

登录态、专业资料、收藏、规划和咨询记录均使用现有 Spring Boot / PostgreSQL 后端。小程序仅缓存最近一次同步结果，用于网络异常时展示；不同账户的数据由后端隔离。咨询提交成功后数据库中的 `consultation_enquiries` 会生成带用户归属的记录，顾问后台可沿用该数据源展示并更新状态。

后端接口：

- `GET /api/v1/miniapp/universities/{slug}/programmes/{idOrSlug}`：公开的专业详情。
- `/api/v1/miniapp/me/favorites`：登录用户的专业收藏。
- `/api/v1/miniapp/me/plans`：登录用户的多步骤规划。
- `GET /api/v1/miniapp/me/consultations`：登录用户的咨询记录与后台状态。

专业图片可能来自经审核的大学官方或授权媒体域名；发布前需把实际使用的图片域名加入微信公众平台的 downloadFile 合法域名。
