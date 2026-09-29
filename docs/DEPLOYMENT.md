# Private Preview Deployment

This runbook targets a single Linux host with Docker Engine and Docker Compose v2. The preview publishes only the frontend. The backend, PostgreSQL, Redis, and Elasticsearch remain on the Compose network.

## 1. Prepare configuration

```bash
cp deploy/.env.production.example .env.production
chmod 600 .env.production
```

Replace every placeholder with a generated secret and the real HTTPS preview origin. Keep `APP_CONSULTATION_SUBMISSION_ENABLED=false`. Never commit `.env.production`.

```bash
node scripts/deployment-preflight.mjs .env.production
docker compose --env-file .env.production -f compose.production.yaml config --quiet
```

Both commands must pass before deployment.

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
docker compose --env-file .env.production -f compose.production.yaml exec -T backend curl --fail --silent http://localhost:8080/actuator/health/readiness
curl --fail --silent --show-error http://127.0.0.1:3000/en >/dev/null
curl --fail --silent --show-error http://127.0.0.1:3000/zh >/dev/null
```

Smoke check these flows in a browser:

1. English and Chinese homepages render.
2. Login and password-reset forms use the real authentication service; registration remains closed until its production gate is approved.
3. An anonymous protected route redirects to login.
4. University browsing and search return reviewed records.
5. Consultation submission remains disabled for the private preview.

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
