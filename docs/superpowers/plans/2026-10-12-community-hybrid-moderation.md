# U圈混合内容审核实施计划

> **执行要求：** 使用 `executing-plans` 按任务逐项实施；每项遵循 `test-driven-development`，先看到新增测试失败，再写最小实现。完成声明前使用 `verification-before-completion`。

**目标：** 在不重建现有社区模块的前提下，为 U圈帖子和评论接入“本地规则 + 微信内容安全 + 顾问人工审核”的发布闭环，并补齐 12/24 小时审核 SLA、用户提示、指标、灰度和回滚文档。

**架构：** 保留现有 Spring Boot 模块化单体、PostgreSQL 业务真相源、Redis 限流和现有 `ADVISER` 审核边界。新增 provider-neutral 内容安全网关和微信实现；本地规则先判定，微信异常或风险结果统一转人工审核。外部 HTTP 调用不得发生在持有数据库行锁的事务中；写事务仍负责账户锁、限流、幂等回执和最终状态持久化。

**技术栈：** Java 21、Spring Boot 4、RestClient、PostgreSQL、Redis、Micrometer、Next.js/React/TypeScript、原生微信小程序 TypeScript。

**设计规范：** `docs/superpowers/specs/2026-10-12-community-hybrid-moderation-design.md`

## 基线与执行约束

- 小程序 `npm run check` 在 2026-10-12 基线通过。
- 后端基线执行 `./mvnw test` 时没有断言失败，但本机 Docker 不可用，Testcontainers 产生 470 个环境错误。开始需要数据库的任务前必须启动 Docker，再重跑相关测试；不得把当前结果描述为后端通过。
- 真实 `APP_MINIAPP_WECHAT_APP_SECRET` 只进入服务器机密配置，禁止写入代码、测试固定值、文档示例、日志、截图或提交记录。
- 保留现有 `PENDING_REVIEW / PUBLISHED / HIDDEN / DELETED / REJECTED` 状态、幂等回执和审核动作表；没有证据表明需要新迁移前，不新增重复表。
- 每个任务只提交列出的文件，不提交本地 `miniapp/project.config.json`、根目录临时 `package-lock.json`、环境文件或测试输出。

---

## Task 1：定义内容安全配置与 provider-neutral 契约

**文件：**

- 新建：`backend/src/main/java/com/yangdoujiao/website/community/CommunityContentSafetyGateway.java`
- 新建：`backend/src/main/java/com/yangdoujiao/website/community/CommunityContentSafetyProperties.java`
- 新建：`backend/src/test/java/com/yangdoujiao/website/community/CommunityContentSafetyPropertiesTest.java`
- 修改：`backend/src/main/resources/application.yml`
- 修改：`backend/src/main/resources/application-prod.yml`

### Step 1：先写失败测试

覆盖：

- 内容安全默认关闭、超时和重试次数使用保守默认值。
- 超时必须限制在短窗口内，重试次数不能无限增长。
- endpoint、超时和重试配置必须在受控范围内；AppID/AppSecret 的跨配置校验留给 Task 5 的生产守卫。
- 契约仅暴露 `PASS / REVIEW / UNAVAILABLE`，不把微信错误码和响应结构扩散到业务层。

建议契约：

```java
public interface CommunityContentSafetyGateway {
    enum Result { PASS, REVIEW, UNAVAILABLE }
    Result check(long actorId, String normalizedText);
}
```

### Step 2：运行目标测试，确认失败

```bash
cd backend
./mvnw -Dtest=CommunityContentSafetyPropertiesTest test
```

预期：因类和配置尚不存在而失败。

### Step 3：实现最小配置

在 `app.community.content-safety` 下配置：

- `enabled`
- `request-timeout`
- `maximum-attempts`
- 受测试覆盖的微信 token 与检测 endpoint 覆盖项，仅供测试注入；生产默认固定为 HTTPS 微信域名并由生产守卫校验。

不得在该配置中复制 AppSecret；复用 `MiniappAuthProperties`。

### Step 4：运行测试

```bash
./mvnw -Dtest=CommunityContentSafetyPropertiesTest test
```

预期：通过。

### Step 5：提交

```bash
git add backend/src/main/java/com/yangdoujiao/website/community/CommunityContentSafetyGateway.java \
  backend/src/main/java/com/yangdoujiao/website/community/CommunityContentSafetyProperties.java \
  backend/src/test/java/com/yangdoujiao/website/community/CommunityContentSafetyPropertiesTest.java \
  backend/src/main/resources/application.yml backend/src/main/resources/application-prod.yml
git commit -m "feat(community): define content safety contract"
```

---

## Task 2：实现微信访问令牌客户端

**文件：**

- 新建：`backend/src/main/java/com/yangdoujiao/website/community/WechatAccessTokenProvider.java`
- 新建：`backend/src/test/java/com/yangdoujiao/website/community/WechatAccessTokenProviderTest.java`
- 修改：`backend/src/main/java/com/yangdoujiao/website/auth/miniapp/MiniappAuthProperties.java`（仅在需要共享只读凭据时增加安全访问方式，不改变登录语义）

### Step 1：先写失败测试

使用 Spring `MockRestServiceServer` 或仓库现有 RestClient 测试模式覆盖：

- 成功响应返回 token，并按 `expires_in` 提前过期缓存。
- 并发请求共享同一次刷新，不向微信重复请求 token。
- 空响应、超大响应、非法 JSON、缺少 token、微信错误码和网络异常返回不可用。
- 日志只包含稳定失败类型/提供方错误码，不包含 AppSecret、token 或响应正文。
- 缓存失效后可以安全刷新；失败不能覆盖仍然有效的 token。

### Step 2：运行目标测试，确认失败

```bash
./mvnw -Dtest=WechatAccessTokenProviderTest test
```

### Step 3：实现最小客户端

- 使用 `RestClient` 调用微信 access token endpoint。
- 对响应体设置严格大小上限。
- 使用线程安全的进程内短期缓存；token 是可重建派生数据，不写入 PostgreSQL。
- 过期时间使用注入的 `Clock`，测试不得依赖睡眠。
- 任何异常统一返回受控的不可用结果，不向上抛出微信原始正文。

### Step 4：运行测试并提交

```bash
./mvnw -Dtest=WechatAccessTokenProviderTest test
git add backend/src/main/java/com/yangdoujiao/website/community/WechatAccessTokenProvider.java \
  backend/src/test/java/com/yangdoujiao/website/community/WechatAccessTokenProviderTest.java \
  backend/src/main/java/com/yangdoujiao/website/auth/miniapp/MiniappAuthProperties.java
git commit -m "feat(community): cache WeChat access tokens safely"
```

---

## Task 3：实现微信文本检测和混合判定

**文件：**

- 新建：`backend/src/main/java/com/yangdoujiao/website/community/WechatCommunityContentSafetyGateway.java`
- 新建：`backend/src/main/java/com/yangdoujiao/website/community/HybridCommunityRiskPolicy.java`
- 新建：`backend/src/test/java/com/yangdoujiao/website/community/WechatCommunityContentSafetyGatewayTest.java`
- 新建：`backend/src/test/java/com/yangdoujiao/website/community/HybridCommunityRiskPolicyTest.java`
- 修改：`backend/src/main/java/com/yangdoujiao/website/community/CommunityRiskPolicy.java`
- 修改：`backend/src/main/java/com/yangdoujiao/website/community/ConfiguredCommunityRiskPolicy.java`
- 修改：`backend/src/main/java/com/yangdoujiao/website/auth/external/UserExternalIdentityRepository.java`

### Step 1：先写失败测试

覆盖以下优先级：

1. 本地拒绝词命中时直接 `REJECT`，不调用微信。
2. 本地审核词命中时直接 `REVIEW`，不调用微信。
3. 本地通过后，微信 `PASS` 映射为 `PUBLISH`。
4. 微信风险结果、无法取得 openid、token 不可用、超时、非法响应和有限重试耗尽均映射为 `REVIEW`。
5. 检测必须使用当前账户对应 `WECHAT_MINI_PROGRAM` 身份的 provider subject，不能把数据库账户 ID 当 openid。
6. 请求和日志不得包含 AppSecret；错误日志不得包含用户正文或 openid。

将 `CommunityRiskPolicy` 改为接收 `actorId` 和规范化文本：

```java
RiskDecision classify(long actorId, String normalizedText);
```

### Step 2：确认测试失败

```bash
./mvnw -Dtest=WechatCommunityContentSafetyGatewayTest,HybridCommunityRiskPolicyTest test
```

### Step 3：实现最小混合策略

- `ConfiguredCommunityRiskPolicy` 只负责本地规则，不知道微信响应。
- `WechatCommunityContentSafetyGateway` 负责身份查找、token、HTTP 请求、严格响应解析、超时和有限重试。
- `HybridCommunityRiskPolicy` 负责决策优先级，成为写服务唯一依赖的 `CommunityRiskPolicy`。
- 微信返回风险时先转人工审核，不直接永久拒绝；明确拒绝只由经业务确认的本地高风险规则产生。

### Step 4：测试并提交

```bash
./mvnw -Dtest=WechatCommunityContentSafetyGatewayTest,HybridCommunityRiskPolicyTest test
git add backend/src/main/java/com/yangdoujiao/website/community \
  backend/src/main/java/com/yangdoujiao/website/auth/external/UserExternalIdentityRepository.java \
  backend/src/test/java/com/yangdoujiao/website/community/WechatCommunityContentSafetyGatewayTest.java \
  backend/src/test/java/com/yangdoujiao/website/community/HybridCommunityRiskPolicyTest.java
git commit -m "feat(community): add hybrid WeChat moderation policy"
```

提交前检查暂存列表，确认没有顺带提交无关 community 文件。

---

## Task 4：把外部检测移出数据库锁事务并接入发布流程

**文件：**

- 修改：`backend/src/main/java/com/yangdoujiao/website/community/CommunityWriteService.java`
- 新建或修改：`backend/src/main/java/com/yangdoujiao/website/community/CommunityWriteTransaction.java`
- 修改：`backend/src/test/java/com/yangdoujiao/website/community/CommunityWriteHttpIntegrationTest.java`
- 修改：`backend/src/test/java/com/yangdoujiao/website/community/CommunityWriteTransactionIntegrationTest.java`
- 新建：`backend/src/test/java/com/yangdoujiao/website/community/CommunityHybridModerationIntegrationTest.java`

### Step 1：先写失败测试

覆盖：

- 外部检测执行时没有持有账户、帖子或评论数据库行锁。
- 最终写事务仍按“账户 -> 帖子 -> 评论”的既有锁顺序执行。
- 同一个幂等键并发提交最多保存一条内容；第二次返回首次已提交的准确回执。
- 帖子标题和正文组合检测；评论只检测正文。
- `PUBLISH / REVIEW / REJECT` 分别得到 `PUBLISHED / PENDING_REVIEW / COMMUNITY_CONTENT_REJECTED`。
- 微信异常产生的 `PENDING_REVIEW` 内容可在“我的内容”看到，但公开 feed、详情和评论列表看不到。
- 待审评论通过审核后才增加公开评论计数并触发通知。

### Step 2：确认测试失败

```bash
./mvnw -Dtest=CommunityWriteHttpIntegrationTest,CommunityWriteTransactionIntegrationTest,CommunityHybridModerationIntegrationTest test
```

此命令需要 Docker/Testcontainers。Docker 不可用时停止，不得用跳过集成测试代替验证。

### Step 3：最小重构

- 将规范化、幂等快速回读、本地/微信检测放在非事务协调层。
- 将账户锁、幂等二次确认、限流、目标锁和保存放入明确的事务组件。
- 外部调用完成后，事务内必须重新验证账户和目标状态，防止检测期间状态变化。
- 保留现有删除、热榜失效、回执序列化和安全错误码。

### Step 4：运行目标测试并提交

```bash
./mvnw -Dtest=CommunityWriteHttpIntegrationTest,CommunityWriteTransactionIntegrationTest,CommunityHybridModerationIntegrationTest test
git add backend/src/main/java/com/yangdoujiao/website/community/CommunityWriteService.java \
  backend/src/main/java/com/yangdoujiao/website/community/CommunityWriteTransaction.java \
  backend/src/test/java/com/yangdoujiao/website/community/CommunityWriteHttpIntegrationTest.java \
  backend/src/test/java/com/yangdoujiao/website/community/CommunityWriteTransactionIntegrationTest.java \
  backend/src/test/java/com/yangdoujiao/website/community/CommunityHybridModerationIntegrationTest.java
git commit -m "feat(community): moderate writes before transaction locks"
```

---

## Task 5：增加安全指标和生产配置守卫

**文件：**

- 修改：`backend/src/main/java/com/yangdoujiao/website/community/CommunityMetrics.java`
- 修改：`backend/src/main/java/com/yangdoujiao/website/community/ConfiguredCommunityRiskPolicy.java`
- 修改：`backend/src/test/java/com/yangdoujiao/website/community/CommunityMetricsIntegrationTest.java`
- 修改：`backend/src/test/java/com/yangdoujiao/website/community/CommunityProductionConfigTest.java`

### Step 1：先写失败测试

- 记录 `pass / review / reject / unavailable` 四种稳定结果。
- 标签只包含内容类型、检测阶段和结果，不包含正文、用户 ID、内容 ID、openid 或地址。
- 生产环境启用社区写入时，必须同时存在本地审核规则和启用的微信内容安全配置。
- 示例词、空规则、缺少凭据或不安全 HTTP endpoint 必须阻止生产启动。

### Step 2：运行、实现、复测

```bash
./mvnw -Dtest=CommunityMetricsIntegrationTest,CommunityProductionConfigTest test
```

在 `CommunityMetrics` 增加封闭枚举计数器，生产守卫继续 fail closed。再次运行同一命令，预期通过。

### Step 3：提交

```bash
git add backend/src/main/java/com/yangdoujiao/website/community/CommunityMetrics.java \
  backend/src/main/java/com/yangdoujiao/website/community/ConfiguredCommunityRiskPolicy.java \
  backend/src/test/java/com/yangdoujiao/website/community/CommunityMetricsIntegrationTest.java \
  backend/src/test/java/com/yangdoujiao/website/community/CommunityProductionConfigTest.java
git commit -m "feat(community): guard and measure hybrid moderation"
```

---

## Task 6：按最老优先返回审核队列并标记 SLA

**文件：**

- 修改：`backend/src/main/java/com/yangdoujiao/website/community/CommunityModerationQueryRepository.java`
- 修改：`backend/src/main/java/com/yangdoujiao/website/community/CommunityModerationService.java`
- 修改：`backend/src/main/java/com/yangdoujiao/website/community/CommunityModerationPage.java`
- 修改：`backend/src/test/java/com/yangdoujiao/website/community/CommunityModerationHttpIntegrationTest.java`
- 修改：`frontend/src/lib/adviser-community-api.ts`
- 修改：`frontend/src/lib/adviser-community-api.test.ts`
- 修改：`frontend/src/lib/adviser-community-ui.ts`
- 修改：`frontend/src/lib/adviser-community-ui.test.ts`

### Step 1：先写失败测试

- `PENDING` 队列按最早创建时间稳定排序，跨页不重复、不遗漏。
- `PROCESSED/HIDDEN` 保持适合追查的最新优先排序。
- API 返回受控 `slaState: ON_TIME | WARNING | OVERDUE`；阈值固定为 12/24 小时并由注入 `Clock` 计算。
- 前端严格拒绝未知 SLA 值，不能自行根据本机错误时间猜测。
- UI 工具函数生成中英文等待提示和无障碍标签。

如现有降序游标无法安全支持待审升序分页，扩展游标 scope 绑定排序方向；禁止改用 offset 分页。

### Step 2：运行失败测试

```bash
cd backend
./mvnw -Dtest=CommunityModerationHttpIntegrationTest test
cd ../frontend
npm run test:adviser
```

### Step 3：实现并复测

- 后端负责 SLA 计算和稳定排序。
- 前端只渲染受验证的 `slaState`，不接收原始内部检测原因。

### Step 4：提交

```bash
git add backend/src/main/java/com/yangdoujiao/website/community/CommunityModerationQueryRepository.java \
  backend/src/main/java/com/yangdoujiao/website/community/CommunityModerationService.java \
  backend/src/main/java/com/yangdoujiao/website/community/CommunityModerationPage.java \
  backend/src/test/java/com/yangdoujiao/website/community/CommunityModerationHttpIntegrationTest.java \
  frontend/src/lib/adviser-community-api.ts frontend/src/lib/adviser-community-api.test.ts \
  frontend/src/lib/adviser-community-ui.ts frontend/src/lib/adviser-community-ui.test.ts
git commit -m "feat(adviser): prioritize overdue community reviews"
```

---

## Task 7：完善顾问审核界面的 12/24 小时提示

**文件：**

- 修改：`frontend/src/components/adviser-community-panel.tsx`
- 修改：`frontend/src/app/globals.css`
- 修改：`frontend/src/components/visual-polish.test.ts`

### Step 1：先写失败测试

覆盖：

- 待审核项目显示等待状态，警告和超时有文字而不只依赖颜色。
- 队列说明改为“最久待审优先”，不再错误显示“最新内容优先”。
- 列表项和详情保留键盘焦点、`aria-live`、忙碌状态和冲突刷新行为。
- `WARNING` 和 `OVERDUE` 使用现有品牌色体系，不新增刺眼的独立视觉风格。

### Step 2：运行前端目标测试，确认失败

```bash
cd frontend
npm run test:styles
```

### Step 3：实现、复测和静态检查

```bash
npm run test:styles
npm run test:adviser
npm run lint
npm run build
```

### Step 4：提交

```bash
git add frontend/src/components/adviser-community-panel.tsx frontend/src/components/visual-polish.test.ts frontend/src/app/globals.css
git commit -m "feat(adviser): surface community review SLA"
```

---

## Task 8：统一小程序发布、我的内容和消息提示

**文件：**

- 修改：`miniapp/miniprogram/pages/circle-compose/index.ts`
- 修改：`miniapp/miniprogram/pages/circle-compose/index.wxml`
- 修改：`miniapp/miniprogram/pages/circle-me/index.ts`
- 修改：`miniapp/miniprogram/pages/circle-me/index.wxml`
- 修改：`miniapp/miniprogram/utils/community-ui.ts`
- 修改：`miniapp/tests/community-page-lifecycle.test.ts`
- 修改：`miniapp/tests/community-pages.test.ts`
- 修改：`miniapp/tests/messages-page.test.ts`

### Step 1：先写失败测试

- `PUBLISHED` 显示发布成功并进入详情。
- `PENDING_REVIEW` 显示“内容已提交审核，预计 24 小时内完成”并进入“我的内容”。
- `COMMUNITY_CONTENT_REJECTED` 显示可修改提示，保留草稿，不伪装成网络错误。
- 微信不可用转待审时使用保存成功的回执，不要求用户重复提交。
- 真正的数据库/Redis/鉴权不可用显示暂时无法发布，并保留草稿和幂等键。
- “我的内容”清楚区分审核中、已发布、未通过；非公开内容不能进入公开详情。
- 审核结果系统消息使用泛化摘要，不显示帖子正文。

### Step 2：运行测试并确认失败

```bash
cd miniapp
npm test
```

### Step 3：实现与完整检查

```bash
npm run check
```

### Step 4：提交

```bash
git add miniapp/miniprogram/pages/circle-compose miniapp/miniprogram/pages/circle-me \
  miniapp/miniprogram/utils/community-ui.ts miniapp/tests/community-page-lifecycle.test.ts \
  miniapp/tests/community-pages.test.ts miniapp/tests/messages-page.test.ts
git commit -m "feat(miniapp): clarify community moderation states"
```

---

## Task 9：补齐部署、灰度、告警与回滚说明

**文件：**

- 修改：`.env.example`
- 修改：`compose.production.yaml`
- 修改：`docs/DEPLOYMENT.md`
- 新建：`docs/runbooks/community-hybrid-moderation.md`
- 修改：`.github/workflows/ci.yml` 或实际部署契约测试文件（仅在现有 CI 需要显式允许新变量时）

### Step 1：先写或更新部署契约测试

确认：

- Compose 只引用变量名，不包含真实密钥。
- 新内容安全开关、超时和重试配置有安全默认值。
- 生产启用顺序是先配置规则和微信凭据，再启动新镜像，最后开放社区写入。
- 回滚只关闭写入/回退镜像，不清表、不删除审核证据。

### Step 2：更新文档

Runbook 必须包含：

- 上线前 PostgreSQL 备份和可读性校验。
- 预览环境真实微信联调步骤。
- 内部账号灰度、观察窗口和验收条件。
- 审核积压、最老等待时长、微信不可用比例和发布错误率。
- 12/24 小时值班响应。
- 关闭 `APP_COMMUNITY_ENABLED` 的可恢复回滚步骤。
- 禁止把 AppSecret 粘贴到命令历史、日志和截图。

### Step 3：运行部署检查并提交

```bash
docker compose --env-file .env.example -f compose.production.yaml config >/dev/null
git diff --check
git add .env.example compose.production.yaml docs/DEPLOYMENT.md docs/runbooks/community-hybrid-moderation.md .github/workflows/ci.yml
git commit -m "docs: add community moderation rollout runbook"
```

若 `.github/workflows/ci.yml` 未改变，不要将它加入提交。

---

## Task 10：全量验证、代码审查与交付

### Step 1：启动本机 Docker 并运行后端完整测试

```bash
cd backend
./mvnw test
```

要求：`0 failures, 0 errors`。Testcontainers 不可用属于阻塞项，不能跳过。

### Step 2：运行前端和小程序完整检查

```bash
cd ../frontend
npm ci
npm test
npm run lint
npm run build

cd ../miniapp
npm ci
npm run check
```

### Step 3：运行部署合同与差异检查

```bash
cd ../
docker compose --env-file .env.example -f compose.production.yaml config >/dev/null
git diff --check
git status --short
git log --oneline --decorate -12
```

### Step 4：安全检查

```bash
rg -n "APP_MINIAPP_WECHAT_APP_SECRET=.+|access_token=.+|wx[a-zA-Z0-9]{10,}" \
  backend frontend miniapp docs .env.example compose.production.yaml
```

逐条确认命中仅为变量名、安全示例或测试占位值；发现真实凭据立即停止并轮换，不得提交。

### Step 5：请求代码审查

使用 `requesting-code-review` 检查：

- 外部调用是否完全位于数据库锁事务外。
- 微信响应是否严格解析和脱敏。
- 待审内容是否可能通过公开 API、消息摘要或缓存泄露。
- 幂等、限流、计数和通知是否保持原有事务语义。
- 顾问 SLA 排序和游标分页是否稳定。

### Step 6：真机验收

在微信开发者工具和至少一台真机验证：

- 正常内容直接发布。
- 测试审核词进入待审，并在“我的内容”显示 24 小时提示。
- 测试拒绝词保留草稿并允许修改。
- 顾问通过后公开并收到系统消息。
- 弱网/断网下不会重复发帖。

不使用真实违法内容做测试；预览环境使用经批准的合成测试词。

### Step 7：完成分支

所有检查通过后使用 `finishing-a-development-branch`，让用户选择合并、PR 或保留分支。不得自动部署生产。
