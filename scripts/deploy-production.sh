#!/usr/bin/env bash
set -Eeuo pipefail

release_sha="${1:-}"
[[ $release_sha =~ ^[0-9a-f]{40}$ ]] || { echo "A full release SHA is required" >&2; exit 64; }

cd /opt/company-website
test -f .env.production || { echo ".env.production is missing" >&2; exit 65; }

show_failure_context() {
  docker compose --env-file .env.production -f compose.production.yaml ps || true
  docker compose --env-file .env.production -f compose.production.yaml logs --no-color --tail=200 caddy frontend backend || true
}
trap show_failure_context ERR

git diff --quiet
git diff --cached --quiet
git fetch --prune origin main
remote_sha="$(git rev-parse origin/main)"
[[ $remote_sha == "$release_sha" ]] || { echo "Release SHA is not current origin/main" >&2; exit 66; }
git checkout main
git merge --ff-only "$release_sha"
[[ $(git rev-parse HEAD) == "$release_sha" ]] || { echo "Server checkout does not match release SHA" >&2; exit 67; }

docker run --rm --mount "type=bind,source=$PWD,target=/app,readonly" -w /app node:24-bookworm-slim node scripts/deployment-preflight.mjs .env.production
public_site_url="$(docker run --rm --mount "type=bind,source=$PWD,target=/app,readonly" -w /app node:24-bookworm-slim node --input-type=module -e 'import fs from "node:fs"; import { parseEnv } from "./scripts/deployment-preflight.mjs"; process.stdout.write(parseEnv(fs.readFileSync(".env.production", "utf8")).PUBLIC_SITE_URL ?? "")')"
[[ $public_site_url == https://* ]] || { echo "PUBLIC_SITE_URL must be HTTPS" >&2; exit 68; }
docker compose --env-file .env.production -f compose.production.yaml config --quiet
docker compose --env-file .env.production -f compose.production.yaml build --pull backend frontend
docker compose --env-file .env.production -f compose.production.yaml up -d --wait --wait-timeout 300
docker compose --env-file .env.production -f compose.production.yaml exec -T backend curl --fail --silent --connect-timeout 10 --max-time 30 --header 'X-Forwarded-Proto: https' http://127.0.0.1:8080/actuator/health/readiness
curl --fail-with-body --silent --connect-timeout 10 --max-time 30 "$public_site_url/healthz"
docker run --rm --mount "type=bind,source=$PWD,target=/app,readonly" -w /app node:24-bookworm-slim node scripts/launch-smoke.mjs "$public_site_url" --public --wechat
