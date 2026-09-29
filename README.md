# UDAJO 官网

留学院校与课程搜索官网。前端使用 Next.js、React 和 TypeScript，后端使用 Java 21 与
Spring Boot。PostgreSQL 是业务数据的唯一真实来源，Redis 用于缓存与限流，
Elasticsearch 用于搜索。

## 目录

- `frontend/`：官网页面与认证界面。
- `backend/`：REST API、数据库迁移和自动化测试。
- `docs/`：API、数据库和开发说明。
- `compose.yaml`：本地 PostgreSQL、Redis 和 Elasticsearch。

## 本地运行

1. 从 `.env.example` 复制一份 `.env`，只在自己电脑上填写密码。不要把 `.env`
   提交到 GitHub，也不要在群里共享真实密码。
2. 启动依赖服务：`docker compose up -d --wait`。
3. 启动后端：`cd backend && ./mvnw spring-boot:run`。
4. 另开终端启动前端：`npm --prefix frontend ci && npm --prefix frontend run dev`。
5. 访问 `http://localhost:3000/zh`。

## 用户注册与登录

当前已接入邮箱/手机号注册、验证、登录、退出、忘记密码、修改密码和注销账号。
会话保存在 PostgreSQL，浏览器只保存 `HttpOnly` 会话 Cookie。开发环境可以使用本地通知
接口完成验证；正式上线前必须接入真实邮件/短信服务，通过安全验收后才能打开注册。

本地需要演示注册时，在自己的 `.env` 中设置（下面是本地版本号，不是正式协议）：

```properties
APP_AUTH_REGISTRATION_ENABLED=true
APP_AUTH_AGREEMENT_VERSION=local-terms-v1
APP_AUTH_PRIVACY_VERSION=local-privacy-v1
```

修改后重启后端。生产环境不得使用这组本地版本号。

详细请查看 [API 说明](docs/API.md) 和 [数据库说明](docs/DATABASE.md)。

## 验收命令

```bash
cd backend && ./mvnw clean test
npm --prefix frontend ci
npm --prefix frontend test
npm --prefix frontend run lint
npm --prefix frontend run build
```

正式院校和课程数据仍以老板最终确认的 Excel 为准，不应将演示数据当作正式资料发布。
