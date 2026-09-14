# Company Website

公司官网全栈项目。目前已完成本地开发基础、院校列表、院校搜索和热门院校缓存。

## 技术栈

- 前端：Next.js 16.3.5、React 19、TypeScript、Node.js 24 LTS
- 后端：Java 21 LTS、Spring Boot 4.1.1、Maven Wrapper
- 数据：PostgreSQL 17.11、Elasticsearch 9.4.5、Redis 8.2.9
- 开发环境：Docker Compose、Git、GitHub、VS Code

PostgreSQL 是业务数据的唯一 Source of Truth。Elasticsearch 只保存可重建的搜索索引，Redis 只保存可过期的缓存。

## 项目目录

```text
company-website/
├── frontend/       Next.js 前端
├── backend/        Spring Boot 后端
├── docs/           架构、API、数据库和协作文档
├── compose.yaml    本地数据服务
├── .env.example    环境变量模板
└── AGENTS.md       开发者与 AI 协作约束
```

## 首次启动

需要预先安装 Java 21、Node.js 24 LTS 和 Docker Desktop。

1. 创建本地环境变量文件，并把示例密码替换为自己的开发密码：

   ```bash
   cp .env.example .env
   ```

2. 启动 PostgreSQL、Redis 和 Elasticsearch：

   ```bash
   docker compose up -d
   docker compose ps
   ```

   三个服务的状态都应为 `healthy`。

3. 在一个终端启动后端：

   ```bash
   cd backend
   ./mvnw spring-boot:run
   ```

   正常情况下会看到 `Started BackendApplication`，API 地址为 `http://localhost:8080`。

4. 在另一个终端启动前端：

   ```bash
   npm --prefix frontend install
   npm --prefix frontend run dev
   ```

   浏览器打开 `http://localhost:3000`。

## 常用验证

```bash
curl http://localhost:8080/api/hello
curl http://localhost:8080/api/universities
curl 'http://localhost:8080/api/search?q=Malaysia'
curl http://localhost:8080/api/universities/popular
```

提交代码前运行：

```bash
(cd backend && ./mvnw test)
npm --prefix frontend run lint
```

## 文档入口

- [项目上下文](docs/PROJECT_CONTEXT.md)
- [系统架构](docs/ARCHITECTURE.md)
- [数据库](docs/DATABASE.md)
- [REST API](docs/API.md)
- [Git 协作流程](docs/GIT_WORKFLOW.md)

## 待确认资料

公司正式名称、品牌规范、页面文案、服务内容、咨询表单字段、后台角色和内容审批流程尚待负责人确认。详见项目上下文中的 TBD 清单。

生产部署尚未开始。本地环境稳定后再配置 ECS、Ubuntu、Nginx、HTTPS、备份和 CI/CD。
