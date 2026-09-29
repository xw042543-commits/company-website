# Private Preview Deployment

This runbook targets a single Linux host with Docker Engine and Docker Compose v2. The preview publishes only the frontend. The backend, PostgreSQL, Redis, and Elasticsearch remain on the Compose network.

## 1. Prepare configuration

```bash
cp deploy/.env.production.example .env.production
chmod 600 .env.production
```

Replace every placeholder with a generated secret and the real HTTPS preview origin. Keep `APP_CONSULTATION_SUBMISSION_ENABLED=false`. Never commit `.env.production`.

Set `DEPLOYMENT_NETWORK_SUBNET`, `FRONTEND_INTERNAL_IP`, and `BACKEND_INTERNAL_IP` to an unused RFC1918 private IPv4 range. Check existing Docker and VPN networks first; the preflight rejects public ranges and verifies address syntax and membership, while `docker compose ... config` and startup reveal host-level overlap.

微信登录在没有正式资质时必须保持 `APP_AUTH_WECHAT_ENABLED=false`。取得公司主体的微信开放平台
网站应用资质后，再通过部署密钥存储配置 AppID、AppSecret 和 HTTPS 回调地址，并重新执行预检。
真实密钥不能写入仓库、群聊、截图或普通运行日志。详细步骤见 [WECHAT_LOGIN.md](WECHAT_LOGIN.md)。

```bash
node scripts/deployment-preflight.mjs .env.production
docker compose --env-file .env.production -f compose.production.yaml config --quiet
```

Both commands must pass before deployment.

## HTTPS proxy boundary

The public HTTPS reverse proxy must connect only to `127.0.0.1:3000`; never publish or proxy the backend port directly. Before forwarding a request, remove all client-supplied forwarded headers (`Forwarded` and `X-Forwarded-*`), set exactly one `X-Forwarded-Proto: https` header, and set exactly one `X-Forwarded-For` value to the validated client IP. The frontend forwards that single client address to the backend from its fixed trusted address. This boundary preserves per-client rate limits without allowing clients to forge trusted proxy metadata.

## 2. Build and start

For a host build:

```bash
docker compose --env-file .env.production -f compose.production.yaml build --pull
docker compose --env-file .env.production -f compose.production.yaml up -d --wait --wait-timeout 300
docker compose --env-file .env.production -f compose.production.yaml ps
```

For a registry release, set `FRONTEND_IMAGE` and `BACKEND_IMAGE` in `.env.production` to immutable tags such as a Git commit SHA, then run:

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
5. Consultation submission remains disabled for the private preview.

`PUBLIC_INDEXING_ENABLED` must remain `false` during preview. Set it to `true` only after the
official `yangdoujiao.com` HTTPS deployment, content approval, SEO review, and final launch approval.

Inspect failures without printing the environment file:

```bash
docker compose --env-file .env.production -f compose.production.yaml ps
docker compose --env-file .env.production -f compose.production.yaml logs --no-color --tail=200 frontend backend
```

## Database migration behavior

Flyway applies forward database migrations when the backend starts, and Hibernate validates the resulting schema. Take and verify a PostgreSQL backup before any release containing a migration. Database rollback is never automatic. If an application rollback is incompatible with the migrated schema, restore an approved backup into an isolated database first and follow a reviewed recovery plan.

## Update and application rollback

Before updating, record the current immutable `FRONTEND_IMAGE` and `BACKEND_IMAGE` values and complete the backup procedure in [BACKUP_AND_RESTORE.md](BACKUP_AND_RESTORE.md).

To roll back application containers, restore the previous immutable image tags in `.env.production`, then run:

```bash
node scripts/deployment-preflight.mjs .env.production
docker compose --env-file .env.production -f compose.production.yaml pull frontend backend
docker compose --env-file .env.production -f compose.production.yaml up -d --wait --wait-timeout 300
```

Repeat all health and smoke checks. Never delete named volumes during a routine deployment or application rollback.

## Stop the preview

```bash
docker compose --env-file .env.production -f compose.production.yaml down
```

This keeps named volumes. Do not add `--volumes` unless following an explicitly approved destructive recovery procedure.
