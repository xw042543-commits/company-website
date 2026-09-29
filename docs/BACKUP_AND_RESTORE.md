# Backup and Restore

PostgreSQL is the source of truth. Redis is a cache and Elasticsearch is a derived search index. Run these commands from the repository root on the deployment host.

## PostgreSQL backup

Create a restricted backup directory and a custom-format dump:

```bash
install -d -m 700 backups
backup_file="backups/postgres-$(date -u +%Y%m%dT%H%M%SZ).dump"
docker compose --env-file .env.production -f compose.production.yaml exec -T postgres sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc' > "$backup_file"
chmod 600 "$backup_file"
```

Integrity check the archive without changing data:

```bash
docker compose --env-file .env.production -f compose.production.yaml exec -T postgres pg_restore --list < "$backup_file" >/dev/null
test -s "$backup_file"
```

Copy verified backups to encrypted storage outside the deployment host and apply the company retention policy.

## Isolated restore rehearsal

Perform an isolated restore rehearsal before relying on a backup. This creates a separate database and does not overwrite production:

```bash
docker compose --env-file .env.production -f compose.production.yaml exec -T postgres sh -c 'createdb -U "$POSTGRES_USER" "${POSTGRES_DB}_restore_test"'
docker compose --env-file .env.production -f compose.production.yaml exec -T postgres sh -c 'pg_restore -U "$POSTGRES_USER" -d "${POSTGRES_DB}_restore_test" --clean --if-exists' < "$backup_file"
docker compose --env-file .env.production -f compose.production.yaml exec -T postgres sh -c 'psql -U "$POSTGRES_USER" -d "${POSTGRES_DB}_restore_test" -c "SELECT count(*) FROM flyway_schema_history;"'
```

After recording the result, the following cleanup is **destructive only to the rehearsal database**:

```bash
docker compose --env-file .env.production -f compose.production.yaml exec -T postgres sh -c 'dropdb -U "$POSTGRES_USER" "${POSTGRES_DB}_restore_test"'
```

Restoring over production is destructive. Stop writes, preserve the failed database, obtain explicit approval, and rehearse the exact restore against an isolated database first.

## Elasticsearch rebuild

Elasticsearch contains derived records. When its volume is lost, the backend startup initializer rebuilds missing search aliases from PostgreSQL.

The following procedure is **destructive to the Elasticsearch index only**:

```bash
docker compose --env-file .env.production -f compose.production.yaml stop backend elasticsearch
docker compose --env-file .env.production -f compose.production.yaml rm -f elasticsearch
docker volume rm company-website-preview_elasticsearch-data
docker compose --env-file .env.production -f compose.production.yaml up -d --wait elasticsearch
docker compose --env-file .env.production -f compose.production.yaml up -d --wait backend
```

Confirm backend readiness and repeat university-search smoke checks before serving traffic.

## Redis cache recovery

First try the non-destructive action:

```bash
docker compose --env-file .env.production -f compose.production.yaml restart redis backend
```

If a corrupt cache volume is confirmed, the following procedure is **destructive to Redis cache data**:

```bash
docker compose --env-file .env.production -f compose.production.yaml stop backend redis
docker compose --env-file .env.production -f compose.production.yaml rm -f redis
docker volume rm company-website-preview_redis-data
docker compose --env-file .env.production -f compose.production.yaml up -d --wait redis backend
```

Do not delete the PostgreSQL volume during Elasticsearch rebuild or Redis cache recovery.
