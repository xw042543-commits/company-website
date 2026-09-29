# Production deployment

Target: one Ubuntu 24.04 LTS server with 4 vCPU, 16 GB RAM and at least 220 GB SSD.

## Before deployment

1. Point the filed domain's `A` record to the server public IP.
2. In the cloud firewall, allow TCP 80 and 443 from everywhere. Allow TCP 22 only from the administrator's fixed IP. Do not open 3000, 5432, 6379, 8080, 9200 or 9300.
3. Run `sudo bash deploy/install-server.sh` once on a fresh Ubuntu 24.04 server.
4. Copy `deploy/.env.example` to `deploy/.env`, replace every example value, and set the filed domain. Generate a different random password for each service.

## Deploy

From the repository root:

```bash
bash deploy/deploy.sh
```

Caddy obtains and renews the TLS certificate automatically. PostgreSQL, Redis and Elasticsearch are reachable only by the application containers.

## Checks

```bash
docker compose --env-file deploy/.env -f deploy/compose.production.yaml ps
curl --fail --silent --show-error https://YOUR_DOMAIN/api/hello
```

Expected API response:

```json
{"message":"Hello from Spring Boot"}
```

## Backups

The `postgres-backup` container creates one compressed database dump each day and keeps seven days in the `postgres_backups` volume. This protects against application mistakes but not total server loss. Enable daily cloud snapshots and copy database backups to an encrypted off-server location before accepting consultation data.

## Routine update

Pull the reviewed release, then run `bash deploy/deploy.sh` again. Persistent data stays in named Docker volumes. Never use `docker compose down --volumes` in production.
