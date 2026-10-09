# Private Preview Deployment

This runbook targets a single Linux host with Docker Engine and Docker Compose v2. Caddy is the only public service. The frontend, backend, PostgreSQL, Redis, and Elasticsearch remain on Compose networks.

## U圈发布、监控与隔离容量验收

PostgreSQL 是帖子、评论、点赞、举报、回执、限制与审核动作的唯一业务真源；Redis 只保存可丢失的限流预算与热门派生快照。先执行现有部署预检、备份和健康检查，再完成审核值班、合规保留期限、DevTools/真机、并发审核和容量验收，最后按批准的发布流程启用写入。本任务的自动检查不代表这些人工或容量步骤已通过。

实际开关与生产 Compose 已传递的配置如下；`deploy/.env.production.example` 保持安全默认值，真实值只写未跟踪的服务器环境文件。

| 变量 | 默认值与边界/行为 |
| --- | --- |
| `APP_COMMUNITY_ENABLED` | `false`；控制新发布、评论、举报、点赞/取消、作者删除；读取和 Adviser 审核继续可用 |
| `APP_MINIAPP_AUTH_ENABLED` | `false`；独立控制小程序认证，不能代替社区写入开关 |
| `APP_COMMUNITY_CURSOR_SECRET` | 共享随机密钥，至少 32 UTF-8 字节；生产始终必填，所有副本相同 |
| `APP_COMMUNITY_POST_PER_MINUTE` / `APP_COMMUNITY_POST_PER_DAY` | `2` / `30`；分钟 1–100，天不少于分钟且最多 1,000 |
| `APP_COMMUNITY_COMMENT_PER_MINUTE` / `APP_COMMUNITY_COMMENT_PER_DAY` | `10` / `300`；分钟 1–300，天不少于分钟且最多 10,000 |
| `APP_COMMUNITY_REPORT_PER_DAY` | `30`；1–300 |
| `APP_COMMUNITY_AUTO_HIDE_REPORT_THRESHOLD` | `5`；2–100 个不同账号的 OPEN 举报触发保护性隐藏 |
| `APP_COMMUNITY_REVIEW_TERMS` / `APP_COMMUNITY_REJECT_TERMS` | 默认空；生产开启社区前两类至少一类包含批准的规则，最多各 1,000 条，每条最多 200 字符 |

分钟与日预算同时按账号和可信客户端地址检查。生产沿用 Caddy→frontend→backend 的可信代理边界，客户端不能伪造限流地址。禁止通过提高生产限额或信任任意代理来迎合压测。

新发布、评论、举报需要 Redis 限流；连接失败、超时或无有效执行结果时失败关闭，返回 `503 COMMUNITY_WRITE_UNAVAILABLE`，事务不会保存业务成功或幂等成功行。相同规范化请求的已存回执可直接重放，不消耗新预算；同键不同请求为 409。最新、详情、评论、回复由 PostgreSQL 提供；热门 Redis 故障返回 `503 COMMUNITY_HOT_SNAPSHOT_UNAVAILABLE`，不可重新排名后拼接旧游标。点赞依靠 PostgreSQL 唯一约束，可在 Redis 故障期间保持正确。

热门排名以 45 秒 TTL 共享快照冻结，初次读取仅构建一个完整排名。删除、隐藏、恢复在事务提交后仅删除 `community:hot:v1:current` 指针；已发行快照保留至到期，读取每页仍重新检查 PostgreSQL 可见状态。失效失败不回滚已提交业务决定，TTL 提供最终更新。首版新发布/点赞/评论的排序最多延迟 45 秒。不要手动清空 Redis、业务表或证据以处理缓存问题；游标过期应从首屏重启。

`CommunityMetrics` 在真实 MVC 请求完成后记录 `community.feed`、`community.detail`、`community.publish`、`community.comment` 计时器和 `community.results` 结果计数；另记录评论/回复读取、互动、举报、个人内容、删除和审核端点。计时覆盖 Controller→事务 Service→Repository 以及 MVC 序列化；安全过滤器提前拒绝的请求由现有 HTTP/安全监控观察。应用标签只允许固定 `endpoint`、`sort`、`command`、`outcome`，排序非法值统一 `invalid`，结果固定为 success/validation/unauthorized/forbidden/not_found/conflict/rate_limited/unavailable/error。禁止加账号、目标、地址、正文、说明、游标、回执键或微信身份标签。

`community.rate.limited` 来自实际限流拒绝；`community.idempotency.hits` 来自发布/评论/举报的已存回执重放；`community.redis.unavailable` 区分 post/comment/report/hot/cache_invalidation。`community.moderation.backlog` 从 PostgreSQL 聚合待审内容或带 OPEN 举报的目标，每个目标只计一次；`community.moderation.oldest.age` 为最老待处理目标的等待秒数。数据库查询失败返回 NaN，不能当作积压为零。审核队列每 30–60 秒观察一次，值班团队在上线前设定数量/时长告警阈值；数量持续增长、最老等待增加或指标缺失需要排查。举报处理时长可只读聚合 `handled_at-created_at`；不得把举报说明或身份导入监控。监控还应观察 Hikari 连接等待/使用率、PostgreSQL 慢查询与锁等待、表/索引增长和 Redis 延迟。

四个核心计时器启用可聚合直方图，P50/P95/P99 由内部监控的直方图导出器计算；未加入客户端 percentile 的 `phi` 标签。仓库现有生产 Actuator 仅暴露 health，也没有配置生产指标收集器；上线前运维必须连接内部 MeterRegistry 导出器或经审批在私有后端开启 metrics（不能由公网代理暴露）。隔离环境下使用下面启动命令明确开启 `/actuator/metrics`，可检查 `/actuator/metrics/community.moderation.backlog` 和 `/actuator/metrics/community.results`。生产指标收集与告警连通验证应记录为独立发布证据。

### 仅限本机隔离压测

**绝不对生产、真实账号数据库或生产 Redis 执行压测或种子脚本。** 以下 Compose 文件有独立项目名、独立容器和仅监听 loopback 的端口；不得改为生产 Compose，不得将 localhost 隧道接到生产。需要 Docker、Java 21、Node 24 和已安装的 k6。在仓库根目录开启隔离依赖（不是部署命令）：

```bash
docker compose -p community-load-test -f backend/src/test/k6/compose.load-test.yaml up -d --wait
```

在第二个本地终端从 `backend/` 启动隔离应用；显式关闭 `.env` 导入及微信外部调用，保留实际默认社区限额。只在这个隔离实例信任 loopback，以模拟 5,000 个不同客户端的合成测试地址：

```bash
SPRING_PROFILES_ACTIVE=dev SPRING_CONFIG_IMPORT='optional:file:/dev/null[.properties]' \
POSTGRES_HOST=127.0.0.1 POSTGRES_PORT=55432 POSTGRES_DB=community_load_test \
POSTGRES_USER=community_load_test POSTGRES_PASSWORD=isolated-load-only \
REDIS_HOST=127.0.0.1 REDIS_PORT=56379 REDIS_PASSWORD= \
ELASTICSEARCH_URL=http://127.0.0.1:19200 SERVER_ADDRESS=127.0.0.1 SERVER_PORT=18080 \
APP_COMMUNITY_ENABLED=true APP_COMMUNITY_CURSOR_SECRET=isolated-load-cursor-secret-at-least-32-bytes \
APP_TRUSTED_PROXIES=127.0.0.1 APP_MINIAPP_AUTH_ENABLED=true \
APP_MINIAPP_LOCAL_PROVIDER_ENABLED=true APP_MINIAPP_LOCAL_TEST_CODE=isolated-load-login-unused \
APP_MINIAPP_LOCAL_TEST_SUBJECT=synthetic-isolated-load APP_AUTH_WECHAT_ENABLED=false \
APP_SEARCH_INDEX_INITIALIZE_ON_STARTUP=false APP_SEARCH_SYNC_SCHEDULING_ENABLED=false \
MANAGEMENT_ENDPOINTS_WEB_EXPOSURE_INCLUDE=health,metrics \
./mvnw spring-boot:run
```

等该应用完成 Flyway 并确认 health 为 UP，在仓库根目录的第一个终端运行种子脚本：

```bash
curl --fail --silent http://127.0.0.1:18080/actuator/health
docker compose -p community-load-test -f backend/src/test/k6/compose.load-test.yaml exec -T postgres \
  psql -U community_load_test -d community_load_test -f /dev/stdin < backend/src/test/k6/community-seed.sql
docker compose -p community-load-test -f backend/src/test/k6/compose.load-test.yaml cp \
  postgres:/tmp/community-load-fixture.json /private/tmp/community-load-fixture.json
chmod 600 /private/tmp/community-load-fixture.json
node --check backend/src/test/k6/community-capacity.js
node --test backend/src/test/k6/community-capacity.test.mjs
COMMUNITY_LOAD_ISOLATED=yes COMMUNITY_LOAD_BASE_URL=http://127.0.0.1:18080 \
COMMUNITY_LOAD_FIXTURE=/private/tmp/community-load-fixture.json \
k6 run --summary-export=/private/tmp/community-capacity-summary.json backend/src/test/k6/community-capacity.js
```

SQL 拒绝非 `community_load_test` 数据库/用户或非空业务数据库，在同一事务生成 5,000 个纯合成 ACTIVE 账号、2 小时访问令牌、1,000 个帖子和 1,000 个评论。令牌只保存在本机临时凭据文件，勿提交、分享或写入容量报告；报告只附汇总结果。脚本固定目标为 `http://127.0.0.1:18080`，拒绝其他主机/端口/路径、缺少隔离确认、错误标记、非 5,000 个独立凭据；写入前 GET 核对种子数据库唯一哨兵，所有请求禁用重定向，URL 指标使用固定路径模板。

模型严格为两个 constant-arrival-rate 场景：读取 100/s、10m、预分配 400 VU/最多 500；写入 20/s、10m、预分配 100 VU/最多 200。总预分配 500，弹性上限总计 700，并不等于已证明 500 个请求同时在途。读取按 40%最新/30%热门/20%详情/10%评论列表；写入按 40%评论/40%点赞/20%发帖轮换全部 5,000 账号，每次 POST 使用唯一、最长 64 字符以内幂等键。阈值原样为 `http_req_failed rate<0.01`、`http_req_duration p(95)<500`、`p(99)<1000`。检查 dropped_iterations、实际吞吐、连接池/锁/队列和数据完整性后才能签容量通过。

容量验收还需在隔离环境单独记录 Redis 故障与恢复、慢查询、原键重复写、两个 Adviser 并发版本冲突，以及恢复后无重复/丢失的证据。自动化回归覆盖不等于容量故障注入已执行。缺少 k6 或隔离依赖时只运行脚本语法及离线契约检查，明确填写容量“未执行”；不得据此宣称 5,000 用户容量通过。

### 回滚与发布证据

回滚先在服务器未跟踪环境文件设置 `APP_COMMUNITY_ENABLED=false`，按照现有批准的应用更新流程重新创建 backend，然后验证新发布/评论/举报/互动/作者删除为 `503 COMMUNITY_DISABLED`、读取仍可用、Adviser 审核仍可处理证据。无需回滚迁移；已有 PostgreSQL 数据、回执、举报、限制、审核动作及点赞证据必须保留。禁止 DROP/TRUNCATE、删除表、清空业务证据、清空 Redis 或 `down -v` 作为回滚操作。

发布记录必须包括完整自动测试的退出码/计数、DevTools与真机项目状态、Adviser冲突流程、k6汇总和故障注入状态、指标与告警连通、备份/迁移/回滚准备；生产待填项包括正式微信凭据、共享密钥、批准的规则与隐私/保留期限、值班人和告警阈值。不执行的项目明确标注。仅在上述验收和既有发布批准完成后开启生产写入。

## 1. Prepare configuration

```bash
cp deploy/.env.production.example .env.production
chmod 600 .env.production
```

Replace every placeholder with a generated secret and the real HTTPS preview origin. To accept enquiries, set `APP_CONSULTATION_SUBMISSION_ENABLED=true` and set `APP_CONSULTATION_PRIVACY_NOTICE_VERSION` to the approved notice version shown to users. Keep submission disabled when that version has not been approved. Never commit `.env.production`.

Set `CADDY_SITE_ADDRESSES=yangdoujiao.com, www.yangdoujiao.com` and provide a monitored address in `CADDY_ACME_EMAIL`. Allow inbound TCP ports 80 and 443 plus UDP port 443 in the VPS firewall. Caddy uses ports 80 and 443 for automatic HTTPS, certificate renewal, HTTP-to-HTTPS redirects, and HTTP/3.

Set `DEPLOYMENT_NETWORK_SUBNET`, `FRONTEND_INTERNAL_IP`, and `BACKEND_INTERNAL_IP` to an unused RFC1918 private IPv4 range. Check existing Docker and VPN networks first; the preflight rejects public ranges and verifies address syntax and membership, while `docker compose ... config` and startup reveal host-level overlap.

微信登录在没有正式资质时必须保持 `APP_AUTH_WECHAT_ENABLED=false`。取得公司主体的微信开放平台
网站应用资质后，再通过部署密钥存储配置 AppID、AppSecret 和 HTTPS 回调地址，并重新执行预检。
真实密钥不能写入仓库、群聊、截图或普通运行日志。详细步骤见 [WECHAT_LOGIN.md](WECHAT_LOGIN.md)。

```bash
node scripts/deployment-preflight.mjs .env.production
docker compose --env-file .env.production -f compose.production.yaml config --quiet
```

Both commands must pass before deployment.

## GitHub production CD

The repository owner must create a `production Environment` in GitHub under **Settings → Environments → New environment** and restrict deployment branches to `main`. This private repository's current GitHub plan does not provide an Environment reviewer gate, so production deployment is deliberately **manual-only**: the workflow has no automatic trigger, and clicking **Actions → Deploy production → Run workflow** is the manual approval action. Never add an automatic `workflow_run`, `push`, or scheduled trigger unless the repository first gains an independently enforced deployment approval rule.

Add these five **Environment secrets** to `production` under **Environment secrets** (not repository or organization secrets):

| Secret | Purpose |
| --- | --- |
| `PRODUCTION_SSH_HOST` | VPS DNS name or IP address reached by the runner. |
| `PRODUCTION_SSH_PORT` | SSH port on that VPS. |
| `PRODUCTION_SSH_USER` | Dedicated deploy account on the VPS. |
| `PRODUCTION_SSH_PRIVATE_KEY` | Private half of a dedicated SSH deploy key for this workflow; preserve its multiline format. |
| `PRODUCTION_SSH_KNOWN_HOSTS` | Verified OpenSSH `known_hosts` entry for that host and port. |

These are SSH connection credentials only. Keep application passwords, API keys, and all other application configuration in the server-only `/opt/company-website/.env.production`; do not copy `.env.production` or application secrets into GitHub. Keep that file out of Git and readable only by the deploy account. The server's `.env.production` must already pass the preflight and Compose configuration checks above.

Create a new SSH key pair dedicated to this deploy account and workflow. Install **only its public key** in the deploy account's `~/.ssh/authorized_keys` on the VPS; save its private key only as `PRODUCTION_SSH_PRIVATE_KEY` in the GitHub Environment. Do not reuse a personal SSH key. The deploy account must have a clean `main` checkout at `/opt/company-website`, noninteractive read access to its `origin` Git remote, permission to fast-forward that checkout, and permission to run Docker and Compose without `sudo` or interactive prompts. As that account, require empty output from `git -C /opt/company-website status --short`; a successful exit alone does not establish a clean checkout. Also verify `git -C /opt/company-website fetch --dry-run origin main` and `docker info` succeed before the first run. Set up and test the server-only `.env.production` in that checkout separately; a workflow never uploads or creates it.

Collect the SSH host key from a trusted workstation using `ssh-keyscan -p <port> <host>`. Compare the resulting key fingerprint with the fingerprint shown by the VPS control panel or another independently trusted server channel before saving the matching OpenSSH line as `PRODUCTION_SSH_KNOWN_HOSTS`. Do not trust the output of `ssh-keyscan` alone. For a nondefault SSH port, retain its `[host]:port` prefix exactly as emitted. Never disable SSH host-key checking to work around a mismatch; investigate a changed key before updating the Environment secret.

After the `CI` workflow for the current `main` commit succeeds, open **Actions → Deploy production**, choose **Run workflow**, confirm the branch is `main`, and start it. This deliberate click is the manual approval for the release. The deployment workflow independently queries GitHub Actions and refuses to deploy unless that exact `main` SHA has a successful push CI run. Before clicking, check the release SHA and backup readiness, then watch the exact-release checkout, server preflight, Compose build/start, readiness check, and launch smoke check.

If a run fails, inspect its Actions log. The server script automatically captures `docker compose ps` and the last 200 lines of Caddy, frontend, and backend logs on a failed command. Use that context to identify the failing stage without printing `.env.production`; handle logs as potentially sensitive operational data. For manual recovery, follow **Update and application rollback** below and the backup guidance linked there. Restore the saved local application images when appropriate, repeat health and smoke checks, and never delete named volumes during routine recovery. A database migration requires its separately reviewed recovery plan.

## HTTPS proxy boundary

The public Caddy HTTPS reverse proxy connects to the private `frontend:3000` service; never publish or proxy the frontend or backend port directly. Before forwarding a request, Caddy removes all client-supplied forwarded headers (`Forwarded` and `X-Forwarded-*`), sets exactly one `X-Forwarded-Proto: https` header, and sets exactly one `X-Forwarded-For` value from the direct client address. The frontend forwards that single client address to the backend from its fixed trusted address. This boundary preserves per-client rate limits without allowing clients to forge trusted proxy metadata.

## 2. Build and start

For the first host build, when no application containers exist:

```bash
docker compose --env-file .env.production -f compose.production.yaml build --pull
docker compose --env-file .env.production -f compose.production.yaml up -d --wait --wait-timeout 300
docker compose --env-file .env.production -f compose.production.yaml ps
```

For subsequent production host builds, use the production CD workflow and `scripts/deploy-production.sh` so the running application images are saved before the configured image tags are overwritten. See **Update and application rollback** for recovery.

The production CD workflow does not publish registry images. If you separately publish a registry release, set `FRONTEND_IMAGE` and `BACKEND_IMAGE` in `.env.production` to immutable tags such as a Git commit SHA, then run:

```bash
docker compose --env-file .env.production -f compose.production.yaml pull frontend backend
docker compose --env-file .env.production -f compose.production.yaml up -d --wait --wait-timeout 300
```

Do not use a moving `latest` tag for a release.

## 3. Health and smoke checks

The backend readiness endpoint is private. Check it inside its container:

```bash
docker compose --env-file .env.production -f compose.production.yaml exec -T backend curl --fail --silent --header 'X-Forwarded-Proto: https' http://127.0.0.1:8080/actuator/health/readiness
curl --fail-with-body --silent "$(grep '^PUBLIC_SITE_URL=' .env.production | cut -d= -f2-)/healthz"
node scripts/launch-smoke.mjs "$(grep '^PUBLIC_SITE_URL=' .env.production | cut -d= -f2-)"
```

`/healthz` is the frontend readiness endpoint. It performs a real server-to-backend readiness request and returns `503` when that internal path is unavailable.

默认冒烟检查按私有预览模式验证：HTML 必须包含 `noindex`，`robots.txt` 必须禁止抓取，
`sitemap.xml` 必须为空，微信登录必须关闭。获得公开收录批准后加上 `--public`；只有微信开放平台
验收通过后才加上 `--wechat`：

```bash
node scripts/launch-smoke.mjs "https://yangdoujiao.com" --public --wechat
```

Smoke check these flows in a browser:

1. English and Chinese homepages render.
2. Login and password-reset forms use the real authentication service; registration remains closed until its production gate is approved.
3. An anonymous protected route redirects to login.
4. University browsing and search return reviewed records.
5. Submit a consented consultation and confirm that the success reference appears and a `NEW` enquiry is stored. When consultation collection is intentionally disabled, confirm the form shows the unavailable message instead.

`PUBLIC_INDEXING_ENABLED` must remain `false` during preview. Set it to `true` only after the
official `yangdoujiao.com` HTTPS deployment, content approval, SEO review, and final launch approval.

Inspect failures without printing the environment file:

```bash
docker compose --env-file .env.production -f compose.production.yaml ps
docker compose --env-file .env.production -f compose.production.yaml logs --no-color --tail=200 caddy frontend backend
```

## Database migration behavior

Flyway applies forward database migrations when the backend starts, and Hibernate validates the resulting schema. Take and verify a PostgreSQL backup before any release containing a migration. Database rollback is never automatic. If an application rollback is incompatible with the migrated schema, restore an approved backup into an isolated database first and follow a reviewed recovery plan.

## Update and application rollback

Before updating, complete the backup procedure in [BACKUP_AND_RESTORE.md](BACKUP_AND_RESTORE.md). Immediately before each backend/frontend host build, `scripts/deploy-production.sh` reads the image IDs of the currently running application containers and saves them as `udajo/frontend:production-rollback` and `udajo/backend:production-rollback`. It skips any service with no running container; a first deployment therefore has no previous release to restore.

This retains only the immediately previous application release and depends on these local tags and their images not being pruned. Each deployment attempt replaces the tags for services that are running at its start, so inspect and recover a failed deployment before retrying it. Keep these tags out of image cleanup jobs and verify that both saved images are the release you intend to restore.

To restore those local application images, first confirm they are compatible with the current database schema and Compose configuration, then run on the host:

```bash
cd /opt/company-website
docker image inspect udajo/frontend:production-rollback udajo/backend:production-rollback >/dev/null
FRONTEND_IMAGE=udajo/frontend:production-rollback \
BACKEND_IMAGE=udajo/backend:production-rollback \
  docker compose --env-file .env.production -f compose.production.yaml up -d --no-build --wait --wait-timeout 300 --pull never
```

The inline image overrides apply only to this recovery command and do not edit `.env.production`. `--no-build` prevents rebuilding the failed release, and `--pull never` requires the saved local images without contacting a registry. If either tag is missing, stop and use a separately reviewed recovery plan. Repeat all health and smoke checks. Never delete named volumes during a routine deployment or application rollback.

## Stop the preview

```bash
docker compose --env-file .env.production -f compose.production.yaml down
```

This keeps named volumes. Do not add `--volumes` unless following an explicitly approved destructive recovery procedure.
