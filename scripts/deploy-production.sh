#!/usr/bin/env bash
set -Eeuo pipefail

release_sha="${1:-}"
[[ $release_sha =~ ^[0-9a-f]{40}$ ]] || { echo "A full release SHA is required" >&2; exit 64; }

cd /opt/company-website
test -f .env.production || { echo ".env.production is missing" >&2; exit 65; }

update_production_value() {
  local name="$1" value="$2" temporary found=false
  temporary="$(mktemp .env.production.XXXXXX)"
  chmod 600 "$temporary"
  while IFS= read -r line || [[ -n $line ]]; do
    if [[ $line == "$name="* ]]; then
      printf '%s=%s\n' "$name" "$value" >> "$temporary"
      found=true
    else
      printf '%s\n' "$line" >> "$temporary"
    fi
  done < .env.production
  if [[ $found == false ]]; then printf '%s=%s\n' "$name" "$value" >> "$temporary"; fi
  mv "$temporary" .env.production
  chmod 600 .env.production
}

miniapp_id="${APP_MINIAPP_WECHAT_APP_ID:-}"
miniapp_secret="${APP_MINIAPP_WECHAT_APP_SECRET:-}"
if [[ -n $miniapp_id || -n $miniapp_secret ]]; then
  [[ $miniapp_id =~ ^wx[0-9a-f]{16}$ ]] || { echo "A valid mini-program AppID is required" >&2; exit 70; }
  [[ $miniapp_secret =~ ^[0-9a-f]{32}$ ]] || { echo "A valid mini-program AppSecret is required" >&2; exit 70; }
  update_production_value APP_MINIAPP_AUTH_ENABLED true
  update_production_value APP_MINIAPP_WECHAT_APP_ID "$miniapp_id"
  update_production_value APP_MINIAPP_WECHAT_APP_SECRET "$miniapp_secret"
fi

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

docker run --rm --mount "type=bind,source=$PWD,target=/app,readonly" -w /app node:24-bookworm-slim node scripts/deployment-preflight.mjs .env.production < /dev/null
public_site_url="$(docker run --rm --mount "type=bind,source=$PWD,target=/app,readonly" -w /app node:24-bookworm-slim node --input-type=module -e 'import fs from "node:fs"; import { parseEnv } from "./scripts/deployment-preflight.mjs"; process.stdout.write(parseEnv(fs.readFileSync(".env.production", "utf8")).PUBLIC_SITE_URL ?? "")' < /dev/null)"
[[ $public_site_url == https://* ]] || { echo "PUBLIC_SITE_URL must be HTTPS" >&2; exit 68; }
docker compose --env-file .env.production -f compose.production.yaml config --quiet

# Every release may contain a forward-only Flyway migration. Capture and verify
# a restricted PostgreSQL archive before replacing either application image.
install -d -m 700 backups
backup_file="backups/postgres-$(date -u +%Y%m%dT%H%M%SZ)-pre-${release_sha:0:12}.dump"
docker compose --env-file .env.production -f compose.production.yaml exec -T postgres sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc' > "$backup_file"
chmod 600 "$backup_file"
docker compose --env-file .env.production -f compose.production.yaml exec -T postgres pg_restore --list < "$backup_file" > /dev/null
test -s "$backup_file"

# Retain the running images before a host build overwrites the configured tags.
for service in frontend backend; do
  container_id="$(docker compose --env-file .env.production -f compose.production.yaml ps --status running -q "$service")"
  if [[ -n $container_id ]]; then
    running_image_id="$(docker container inspect --format '{{.Image}}' "$container_id")"
    docker image tag "$running_image_id" "udajo/$service:production-rollback"
  fi
done
docker compose --env-file .env.production -f compose.production.yaml build --pull backend frontend
docker compose --env-file .env.production -f compose.production.yaml up -d --wait --wait-timeout 300
# Bash receives this script on stdin; the probe must not consume later commands.
docker compose --env-file .env.production -f compose.production.yaml exec -T --interactive=false backend curl --fail --silent --connect-timeout 10 --max-time 30 --header 'X-Forwarded-Proto: https' http://127.0.0.1:8080/actuator/health/readiness < /dev/null
curl --fail-with-body --silent --connect-timeout 10 --max-time 30 "$public_site_url/healthz"
docker run --rm --mount "type=bind,source=$PWD,target=/app,readonly" -w /app node:24-bookworm-slim node scripts/launch-smoke.mjs "$public_site_url" --public --wechat < /dev/null
