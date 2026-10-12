# Architecture

## System shape

```text
Browser -> Next.js -> Spring Boot REST API
WeChat miniapp ------> Spring Boot REST API
                           -> PostgreSQL (business data and website sessions)
                           -> Elasticsearch (derived search indexes)
                           -> Redis (cache, community snapshots and rate limits)
```

The backend is a modular monolith. Controllers handle HTTP input and DTOs,
services own business logic and transactions, and repositories access persisted
data. PostgreSQL is the source of truth. Flyway owns schema changes; Hibernate
validates the schema rather than creating it.

## API and authentication

New clients use `/api/v1` for university and programme discovery, articles,
consultations, authentication, applications, and community features. Legacy
university endpoints remain for compatibility. Consult [API.md](API.md) for
current routes and response contracts.

Website authentication uses PostgreSQL-backed Spring Session and an HttpOnly
`JSESSIONID` cookie, with CSRF protection for writes. The miniapp uses its own
access and refresh token flow; see [the miniapp guide](../miniapp/README.md).
Registration and other write features have independent configuration gates.

## Search and cache

Legacy `UniversitySearchService` rebuilds the `universities` index from
PostgreSQL on application startup. V1 discovery uses the services under
`search/v4/`, including PostgreSQL projection loading and persisted
`search_sync_jobs`. The synchronization worker claims jobs with lease tokens
and records failures for retry. Elasticsearch remains derived data; never use
it as the only copy of a business record.

The legacy popular-university list uses the `popularUniversities` Redis cache
with a configured ten-minute TTL. Community hot feeds and write rate limits
also use Redis. Community writes fail closed when rate limiting is unavailable;
latest feeds, details, and comments can continue to read PostgreSQL. The
[community contract](community-read-contract.md) and miniapp guide describe
the supported failure behavior.

## Configuration and deployment

- `application.yml` and profile-specific files configure the backend.
- `.env` contains ignored local values; `.env.example` contains safe examples.
- `compose.yaml` runs local PostgreSQL, Redis, and Elasticsearch.
- `compose.production.yaml` adds the frontend, backend, and HTTPS reverse proxy.
- [DEPLOYMENT.md](DEPLOYMENT.md) and [BACKUP_AND_RESTORE.md](BACKUP_AND_RESTORE.md)
  describe deployment and recovery.

Deployment configuration exists in the repository. A production feature is
enabled only after its configuration and release checks pass; see the
[public launch checklist](PUBLIC_LAUNCH_CHECKLIST.md).
