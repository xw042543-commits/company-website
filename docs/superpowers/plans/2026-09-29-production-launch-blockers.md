# 生产启动与公开索引修复实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 让生产 Compose 在保留 HTTPS 信任边界的前提下真正健康启动，并保证 sitemap 只包含匿名用户能访问的 200 页面。

**Architecture:** 为 frontend 和 backend 建立固定地址的专用 Docker 网络，后端只信任 frontend 和回环地址传入的 HTTPS 转发头。公开 sitemap 与现有登录访问策略保持一致；CI 在构建镜像后实际启动生产拓扑并经 frontend 访问后端 API。

**Tech Stack:** Docker Compose v2、GitHub Actions、Node.js 24 内置测试、Next.js 16、Spring Boot 4 / Java 21

**Spec:** `docs/superpowers/specs/2026-09-29-production-launch-blockers-design.md`

## Global Constraints

- 只有 frontend 可绑定宿主机端口，backend、PostgreSQL、Redis 和 Elasticsearch 不得发布端口。
- 保留 `ProductionHttpsFilter`，不得通过全局放行 HTTP 解决健康检查。
- frontend 内部地址为 `172.30.0.10`，backend 内部地址为 `172.30.0.20`，专用子网为 `172.30.0.0/24`。
- Compose 中 backend 的可信代理固定为 `127.0.0.1,172.30.0.10`。
- 院校、留学规划、语言、奖学金和资讯继续需要登录；sitemap 首发只收录中英文首页和“关于我们”。
- `PUBLIC_INDEXING_ENABLED=false`、注册、微信登录和咨询提交的默认关闭状态不变。

---

### Task 1: 修复生产 Compose 代理身份和健康检查

**Files:**
- Modify: `scripts/deployment-compose.test.mjs`
- Modify: `compose.production.yaml`
- Modify: `deploy/.env.production.example`

**Interfaces:**
- Consumes: `ProductionHttpsFilter` 现有的“可信直连 IP + 唯一 `X-Forwarded-Proto: https`”规则。
- Produces: `frontend-backend` 网络，frontend `172.30.0.10`，backend `172.30.0.20`，backend 可信代理 `127.0.0.1,172.30.0.10`。

- [ ] **Step 1: 写入失败的 Compose 契约测试**

在 `scripts/deployment-compose.test.mjs` 新增一个测试，明确断言：

```js
test("frontend has a stable trusted proxy identity and backend readiness reports HTTPS", () => {
  const frontend = serviceBlock("frontend");
  const backend = serviceBlock("backend");
  assert.match(frontend, /ipv4_address: 172\.30\.0\.10/);
  assert.match(backend, /ipv4_address: 172\.30\.0\.20/);
  assert.match(backend, /APP_TRUSTED_PROXIES: "127\.0\.0\.1,172\.30\.0\.10"/);
  assert.match(backend, /X-Forwarded-Proto: https/);
  assert.match(compose, /subnet: 172\.30\.0\.0\/24/);
});
```

- [ ] **Step 2: 运行定向测试并确认因配置缺失而失败**

Run: `node --test scripts/deployment-compose.test.mjs`

Expected: FAIL，报告找不到固定 IP、可信代理、HTTPS 健康头或子网。

- [ ] **Step 3: 在生产 Compose 实现专用网络**

修改 `compose.production.yaml`：

```yaml
backend:
  environment:
    APP_TRUSTED_PROXIES: "127.0.0.1,172.30.0.10"
  networks:
    frontend-backend:
      ipv4_address: 172.30.0.20
    data:

frontend:
  networks:
    frontend-backend:
      ipv4_address: 172.30.0.10

networks:
  frontend-backend:
    ipam:
      config:
        - subnet: 172.30.0.0/24
  data:
```

PostgreSQL、Redis 和 Elasticsearch 只加入 `data`。backend 的 healthcheck 改为：

```yaml
test: ["CMD", "curl", "--fail", "--silent", "--header", "X-Forwarded-Proto: https", "http://localhost:8080/actuator/health/readiness"]
```

从 `deploy/.env.production.example` 删除不再由部署者自由填写的 `APP_TRUSTED_PROXIES`。

- [ ] **Step 4: 验证 Compose 契约与解析结果**

Run:

```bash
node --test scripts/deployment-compose.test.mjs
docker compose --env-file deploy/.env.production.example -f compose.production.yaml config --quiet
```

Expected: Node 测试 PASS；Compose 只因示例密钥未用于预检而进行语法解析，`config --quiet` PASS。

- [ ] **Step 5: 提交生产网络修复**

```bash
git add scripts/deployment-compose.test.mjs compose.production.yaml deploy/.env.production.example
git commit -m "fix: 修复生产容器健康检查"
```

### Task 2: 对齐 sitemap 与匿名访问策略

**Files:**
- Modify: `frontend/src/lib/public-indexing.ts`
- Modify: `frontend/src/lib/public-indexing.test.ts`

**Interfaces:**
- Consumes: `isProtectedPath(pathname: string): boolean` from `frontend/src/lib/access-policy.ts`.
- Produces: `PUBLIC_INDEX_ROUTES: readonly string[]`，只包含 `/zh`、`/en`、`/zh/about`、`/en/about`。

- [ ] **Step 1: 写入失败的 sitemap 安全测试**

导入 `PUBLIC_INDEX_ROUTES` 和 `isProtectedPath`，替换现有对 `/en/universities` 的期望：

```ts
assert.deepEqual(PUBLIC_INDEX_ROUTES, ["/zh", "/en", "/zh/about", "/en/about"]);
assert.equal(PUBLIC_INDEX_ROUTES.some(isProtectedPath), false);
for (const route of PUBLIC_INDEX_ROUTES) {
  assert.match(sitemap, new RegExp(`<loc>https://yangdoujiao\\.com${route}</loc>`));
}
assert.doesNotMatch(sitemap, /universities|language|scholarships|news|programmes/);
```

- [ ] **Step 2: 运行定向测试并确认旧 sitemap 泄漏保护路由**

Run: `npm --prefix frontend exec -- node --test src/lib/public-indexing.test.ts`

Expected: FAIL，因为当前列表含院校、文章栏目和不存在的 programmes。

- [ ] **Step 3: 收紧公开索引路由**

在 `public-indexing.ts` 导出：

```ts
export const PUBLIC_INDEX_ROUTES = [
  "/zh",
  "/en",
  "/zh/about",
  "/en/about",
] as const;
```

`buildSitemapXml()` 只遍历 `PUBLIC_INDEX_ROUTES`。

- [ ] **Step 4: 运行前端定向测试**

Run:

```bash
npm --prefix frontend exec -- node --test src/lib/public-indexing.test.ts src/lib/access-policy.test.ts
```

Expected: PASS。

- [ ] **Step 5: 提交 sitemap 修复**

```bash
git add frontend/src/lib/public-indexing.ts frontend/src/lib/public-indexing.test.ts
git commit -m "fix: 对齐公开索引与访问权限"
```

### Task 3: 让 CI 真正启动生产拓扑

**Files:**
- Modify: `scripts/deployment-ci.test.mjs`
- Modify: `.github/workflows/ci.yml`
- Modify: `scripts/deployment-documentation.test.mjs`
- Modify: `docs/DEPLOYMENT.md`

**Interfaces:**
- Consumes: Task 1 的健康生产 Compose；Task 2 不改变私有预览 `noindex` 默认。
- Produces: GitHub Actions 生产拓扑启动门禁，并保证成功或失败后都清理容器与卷。

- [ ] **Step 1: 写入失败的 CI 行为契约测试**

在 `scripts/deployment-ci.test.mjs` 新增：

```js
test("CI starts and probes the production topology before cleanup", () => {
  assert.match(workflow, /FRONTEND_IMAGE=udajo\/frontend:ci/);
  assert.match(workflow, /BACKEND_IMAGE=udajo\/backend:ci/);
  assert.match(workflow, /compose\.production\.yaml[^\n]*up -d --no-build --wait/);
  assert.match(workflow, /X-Forwarded-Proto: https/);
  assert.match(workflow, /api\/v1\/auth\/providers/);
  assert.match(workflow, /if: always\(\)/);
  assert.match(workflow, /compose\.production\.yaml[^\n]*down --volumes/);
});
```

在 `scripts/deployment-documentation.test.mjs` 要求部署文档明确出现 `127.0.0.1:3000`、`X-Forwarded-Proto` 和“删除客户转发头”含义。

- [ ] **Step 2: 运行契约测试并确认 CI 尚未启动生产拓扑**

Run:

```bash
node --test scripts/deployment-ci.test.mjs scripts/deployment-documentation.test.mjs
```

Expected: FAIL，报告缺少生产 `up`、HTTPS 头 API 探测、always cleanup 或文档说明。

- [ ] **Step 3: 在 CI 环境中使用刚构建的不可变镜像**

向 `$RUNNER_TEMP/deployment.env` 增加：

```properties
FRONTEND_IMAGE=udajo/frontend:ci
BACKEND_IMAGE=udajo/backend:ci
```

镜像构建后增加：

```yaml
- name: Start and verify production topology
  run: |
    docker compose --env-file "$RUNNER_TEMP/deployment.env" -f compose.production.yaml up -d --no-build --wait --wait-timeout 300
    curl --fail --silent --header 'X-Forwarded-Proto: https' http://127.0.0.1:3000/zh >/dev/null
    curl --fail --silent --header 'X-Forwarded-Proto: https' http://127.0.0.1:3000/api/v1/auth/providers >/dev/null

- name: Stop production topology
  if: always()
  run: docker compose --env-file "$RUNNER_TEMP/deployment.env" -f compose.production.yaml down --volumes
```

- [ ] **Step 4: 更新部署边界说明**

在 `docs/DEPLOYMENT.md` 明确说明：

- 宿主机反向代理只连接 `127.0.0.1:3000`；
- 必须删除客户传来的 `Forwarded`/`X-Forwarded-*`，再写入自己看到的真实值；
- 必须将 `X-Forwarded-Proto` 覆盖为唯一小写 `https`；
- 不得代理或发布 backend 端口。

文档中手工 readiness 命令加上 `--header 'X-Forwarded-Proto: https'`。

- [ ] **Step 5: 运行全部部署契约测试**

Run:

```bash
node --test scripts/deployment-preflight.test.mjs scripts/deployment-artifacts.test.mjs scripts/deployment-compose.test.mjs scripts/deployment-ci.test.mjs scripts/deployment-documentation.test.mjs scripts/launch-smoke.test.mjs
docker compose --env-file deploy/.env.production.example -f compose.production.yaml config --quiet
git diff --check
```

Expected: 所有 Node 测试 PASS，Compose 配置 PASS，无空白错误。

- [ ] **Step 6: 本地实际启动生产拓扑**

使用一份未跟踪、已替换示例密钥的环境文件构建并执行与 CI 相同的 `up -d --no-build --wait`、首页/API 探测和 `down --volumes`。

Expected: 全部容器 healthy，首页和 `/api/v1/auth/providers` 都返回 2xx。

- [ ] **Step 7: 提交 CI 启动门禁与文档**

```bash
git add .github/workflows/ci.yml scripts/deployment-ci.test.mjs scripts/deployment-documentation.test.mjs docs/DEPLOYMENT.md
git commit -m "ci: 验证生产拓扑可启动"
```

### Task 4: 完整验证与代码审查

**Files:**
- Review: all files changed since `origin/main`

**Interfaces:**
- Consumes: Task 1–3 的已提交修复。
- Produces: 可提交 PR 的生产启动修复分支。

- [ ] **Step 1: 运行后端安全定向测试**

Run:

```bash
cd backend
./mvnw -Dtest=ProductionHttpsFilterTest,ProductionConfigurationTest test
```

Expected: PASS。

- [ ] **Step 2: 运行前端索引和权限定向测试**

Run:

```bash
npm --prefix frontend exec -- node --test src/lib/public-indexing.test.ts src/lib/access-policy.test.ts src/proxy.test.ts
```

Expected: PASS。

- [ ] **Step 3: 运行部署契约测试与格式检查**

Run:

```bash
node --test scripts/deployment-preflight.test.mjs scripts/deployment-artifacts.test.mjs scripts/deployment-compose.test.mjs scripts/deployment-ci.test.mjs scripts/deployment-documentation.test.mjs scripts/launch-smoke.test.mjs
docker compose --env-file deploy/.env.production.example -f compose.production.yaml config --quiet
git diff --check origin/main...HEAD
```

Expected: PASS。

- [ ] **Step 4: 请求独立代码审查**

审查者重点检查：HTTPS 头信任边界、Docker 网络隔离、真实客户端 IP、always cleanup、sitemap 与访问策略一致性。

- [ ] **Step 5: 修复所有 Critical/Important 反馈并重跑定向验证**

Expected: 无未解决的 Critical/Important 问题。

