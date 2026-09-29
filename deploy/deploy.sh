#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
cd "${script_dir}"

if [[ ! -f .env ]]; then
  echo "Create deploy/.env from deploy/.env.example before deploying." >&2
  exit 1
fi

docker compose --env-file .env -f compose.production.yaml config --quiet
docker compose --env-file .env -f compose.production.yaml build --pull
docker compose --env-file .env -f compose.production.yaml up --detach --remove-orphans
docker compose --env-file .env -f compose.production.yaml ps
