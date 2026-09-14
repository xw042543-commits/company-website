# Project instructions for developers and AI agents

Read these files before changing the project:

1. `docs/PROJECT_CONTEXT.md`
2. `docs/ARCHITECTURE.md`
3. `docs/DATABASE.md` when changing persisted data
4. `docs/API.md` when changing HTTP contracts
5. `docs/GIT_WORKFLOW.md` before committing or opening a pull request

## Non-negotiable architecture

- Keep one modular monolith: Next.js frontend plus Spring Boot backend.
- PostgreSQL is the primary database and source of truth.
- Elasticsearch is search-only; every index must be rebuildable from PostgreSQL.
- Redis is cache-only; cached values must be safe to expire or delete.
- Do not add microservices, Kafka, RabbitMQ, Kubernetes, MongoDB, or another core technology without an explicit architectural decision.
- Verify Spring Boot, Spring Data Elasticsearch, Elasticsearch, and Java compatibility before version changes.

## Code boundaries

- HTTP flow: Controller -> Service -> Repository -> PostgreSQL.
- Controllers validate HTTP input and return DTOs; do not expose JPA entities directly.
- Services contain business logic and transaction boundaries.
- Repositories contain data-access operations.
- Database schema changes require a new Flyway migration. Never edit an applied migration.
- Keep secrets out of Git. Real values belong in `.env`; only placeholders belong in `.env.example`.

## Canonical checks

Run from the repository root unless a command says otherwise:

```bash
docker compose config --quiet
(cd backend && ./mvnw test)
npm --prefix frontend run lint
```

Use Java 21 and Node.js 24 LTS. Use Maven Wrapper (`backend/mvnw`) instead of relying on a globally installed Maven.

## Current implementation

- `GET /api/hello`
- `GET /api/universities` from PostgreSQL
- `GET /api/universities/popular` with Redis caching
- `GET /api/search?q=...` from the Elasticsearch `universities` index
- The university search index is rebuilt from PostgreSQL on backend startup.

Do not invent missing business requirements. Record unknown company, content, workflow, role, and branding decisions as `TBD` in `docs/PROJECT_CONTEXT.md`. Do not describe planned pages or deployment as implemented. Update the relevant documentation in the same pull request whenever architecture, schema, environment variables, or API contracts change.
