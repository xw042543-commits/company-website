# Private Preview Deployment

This runbook targets a single Linux host with Docker Engine and Docker Compose v2. Caddy is the only public service. The frontend, backend, PostgreSQL, Redis, and Elasticsearch remain on Compose networks.

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

The repository owner must create a `production Environment` in GitHub under **Settings → Environments → New environment**. Under its deployment protection rules, enable **required reviewers** and select the people or team authorized to approve production releases. This is a required GitHub-side setup step: the workflow's `environment: production` declaration alone does not configure reviewers or enforce approval. Restrict deployment branches to `main` in the Environment settings as an additional guard. Confirm the protection rules are active before enabling the first deployment.

Add these five **Environment secrets** to `production` under **Environment secrets** (not repository or organization secrets):

| Secret | Purpose |
| --- | --- |
| `PRODUCTION_SSH_HOST` | VPS DNS name or IP address reached by the runner. |
| `PRODUCTION_SSH_PORT` | SSH port on that VPS. |
| `PRODUCTION_SSH_USER` | Dedicated deploy account on the VPS. |
| `PRODUCTION_SSH_PRIVATE_KEY` | Private half of a dedicated SSH deploy key for this workflow; preserve its multiline format. |
| `PRODUCTION_SSH_KNOWN_HOSTS` | Verified OpenSSH `known_hosts` entry for that host and port. |

These are SSH connection credentials only. Keep application passwords, API keys, and all other application configuration in the server-only `/opt/company-website/.env.production`; do not copy `.env.production` or application secrets into GitHub. Keep that file out of Git and readable only by the deploy account. The server's `.env.production` must already pass the preflight and Compose configuration checks above.

Create a new SSH key pair dedicated to this deploy account and workflow. Install **only its public key** in the deploy account's `~/.ssh/authorized_keys` on the VPS; save its private key only as `PRODUCTION_SSH_PRIVATE_KEY` in the GitHub Environment. Do not reuse a personal SSH key. The deploy account must have a clean `main` checkout at `/opt/company-website`, noninteractive read access to its `origin` Git remote, permission to fast-forward that checkout, and permission to run Docker and Compose without `sudo` or interactive prompts. As that account, verify `git -C /opt/company-website status --short`, `git -C /opt/company-website fetch --dry-run origin main`, and `docker info` succeed before the first run. Set up and test the server-only `.env.production` in that checkout separately; a workflow never uploads or creates it.

Collect the SSH host key from a trusted workstation using `ssh-keyscan -p <port> <host>`. Compare the resulting key fingerprint with the fingerprint shown by the VPS control panel or another independently trusted server channel before saving the matching OpenSSH line as `PRODUCTION_SSH_KNOWN_HOSTS`. Do not trust the output of `ssh-keyscan` alone. For a nondefault SSH port, retain its `[host]:port` prefix exactly as emitted. Never disable SSH host-key checking to work around a mismatch; investigate a changed key before updating the Environment secret.

After a successful CI run for a push to `main`, open **Actions → Deploy production**. The deploy job should wait for the configured Environment reviewer; an authorized reviewer approves the pending deployment only after checking the release SHA, backup readiness, and production change. Watch the job through its exact-release checkout, server preflight, Compose build/start, readiness check, and launch smoke check. `workflow_dispatch` can also start a run from `main` when a manual deployment is needed; it uses the selected release SHA from that branch.

If a run fails, inspect its Actions log. The server script automatically captures `docker compose ps` and the last 200 lines of Caddy, frontend, and backend logs on a failed command. Use that context to identify the failing stage without printing `.env.production`; handle logs as potentially sensitive operational data. For manual recovery, follow **Update and application rollback** below and the backup guidance linked there. Restore the previous immutable application image tags when appropriate, repeat health and smoke checks, and never delete named volumes during routine recovery. A database migration requires its separately reviewed recovery plan.

## HTTPS proxy boundary

The public Caddy HTTPS reverse proxy connects to the private `frontend:3000` service; never publish or proxy the frontend or backend port directly. Before forwarding a request, Caddy removes all client-supplied forwarded headers (`Forwarded` and `X-Forwarded-*`), sets exactly one `X-Forwarded-Proto: https` header, and sets exactly one `X-Forwarded-For` value from the direct client address. The frontend forwards that single client address to the backend from its fixed trusted address. This boundary preserves per-client rate limits without allowing clients to forge trusted proxy metadata.

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
