# Deployment Readiness Design

**Date:** 2026-09-29  
**Status:** Approved design, awaiting written-spec review  
**Target:** Platform-neutral private preview, followed by a gated public launch

## Purpose

Prepare the UDAJO monorepo for a repeatable private-preview deployment without implying that unfinished account, consultation, or messaging features are production-ready. The result must package the existing Next.js frontend and Spring Boot backend, configure their data services safely, expose health signals, document operations, and make production gaps visible.

This work prepares deployable artifacts. It does not provision a cloud account, buy a domain, issue TLS certificates, or replace the planned authentication backend.

## Release stages

### Stage 1: private preview

The private preview may publish the public company pages and reviewed catalogue experience. It must:

- keep search-engine indexing disabled;
- label account, registration, phone, password-reset, and WeChat interactions as demonstrations;
- keep consultation submission disabled;
- avoid collecting or storing real account credentials or personal enquiry data;
- use generated secrets and HTTPS at the hosting edge;
- restrict administrative infrastructure to the private container network.

### Stage 2: public production launch

Public launch remains blocked until real authentication, approved privacy content, production communication providers, backups, monitoring, domain configuration, and HTTPS have been verified. Search indexing is enabled only as an explicit launch change.

## Runtime architecture

The deployment keeps the existing modular-monolith request flow:

```text
Browser
  -> HTTPS hosting edge or reverse proxy
  -> Next.js frontend
  -> Spring Boot REST API
  -> PostgreSQL (source of truth)
  -> Redis (cache only)
  -> Elasticsearch (rebuildable search index)
```

The production Compose definition will run five services: `frontend`, `backend`, `postgres`, `redis`, and `elasticsearch`. Only the frontend is published by the Compose file. The backend and data services communicate on a private network. A hosting provider may put its own TLS edge in front of the frontend; a VPS operator may attach a separate reverse proxy without changing application containers.

PostgreSQL data and Redis persistence use named volumes. Elasticsearch remains rebuildable from PostgreSQL, but its volume is retained to reduce recovery time.

## Container packaging

### Frontend

The frontend uses a multi-stage Node.js 24 image:

1. install locked dependencies with `npm ci`;
2. run the production build;
3. copy only Next.js standalone output and required static/public assets;
4. run as a non-root user on port 3000.

`next.config.ts` will enable `output: "standalone"`. The container receives the internal backend URL through a server-only `API_BASE_URL` variable. Existing server-side API reads will move away from `NEXT_PUBLIC_API_BASE_URL` so an internal backend address is not embedded in browser assets.

### Backend

The backend uses a multi-stage Java 21 image:

1. build with the Maven Wrapper and skip duplicate test execution during image assembly;
2. copy only the Spring Boot executable JAR into a small Java 21 runtime image;
3. run as a non-root user on port 8080.

The Maven Wrapper remains the canonical build entry point.

## Production configuration

`application-prod.yml` will define production-safe behavior while retaining secrets in environment variables:

- database, Redis, and Elasticsearch endpoints have no localhost defaults;
- schema management remains Flyway plus Hibernate validation;
- CORS accepts an explicit frontend origin only;
- forwarded headers are honored for trusted proxy deployments;
- error responses exclude internal messages and stack traces;
- search-index initialization and scheduling stay configurable;
- consultation submission defaults to disabled;
- only health endpoints are publicly exposed from Actuator.

The application must not default to the development profile inside production containers. Compose sets `SPRING_PROFILES_ACTIVE=prod` explicitly.

`.env.example` will contain safe placeholders and descriptions for every required preview/production variable. `.env` files and generated secrets remain ignored by Git. A deployment validation script will fail early when required variables are missing, blank, or still contain documented placeholder values.

## Health and startup behavior

Spring Boot Actuator supplies:

- `/actuator/health/liveness` for process health;
- `/actuator/health/readiness` for dependency readiness;
- no broad management-endpoint exposure.

Container health checks cover:

- PostgreSQL with `pg_isready`;
- Redis with an authenticated `PING`;
- Elasticsearch cluster health;
- backend readiness;
- frontend HTTP availability.

Compose dependency conditions wait for healthy infrastructure before starting dependent services. Restart policies handle unexpected process exits, while health checks expose failures to the host.

## Security baseline

The repository will provide these deployment defaults:

- non-root application containers;
- no published PostgreSQL, Redis, Elasticsearch, or backend ports;
- exact production CORS origin;
- secure, HTTP-only, same-site cookies where cookies are used;
- standard browser headers for content type, framing, referrer policy, permissions, and HTTPS transport;
- no secrets in images, source control, build arguments, or public environment variables;
- request-size and consultation rate limits retained;
- demo authentication clearly identified as non-security functionality.

The private-preview deployment does not claim that the fixed demo-session marker provides authorization. Real protected user data must not be added until backend authentication replaces it.

## Search indexing and metadata

Private preview retains `robots: { index: false, follow: false }`. The public-launch checklist requires a deliberate change that adds:

- production `metadataBase` and canonical URLs;
- localized page metadata;
- `robots.txt`;
- XML sitemap;
- verified social-sharing metadata;
- correct HTML language per locale.

Keeping this work behind a launch gate prevents an unfinished preview from being indexed accidentally.

## CI validation

Pull requests and `main` continue to run existing frontend and backend tests. Deployment readiness adds checks that:

- build both production container images;
- validate the production Compose file;
- reject tracked secret files;
- run the frontend production build;
- package the backend application;
- verify that deployment documentation and example variables stay aligned.

Image publishing and automatic production deployment are intentionally excluded until a hosting provider and container registry are selected.

## Backup and recovery

The operations guide will document:

- scheduled PostgreSQL logical backups with retention outside the application host;
- backup integrity checks;
- a restore rehearsal into a separate database;
- Redis recovery as cache regeneration rather than a source-of-truth restore;
- Elasticsearch recovery by rebuilding its index from PostgreSQL;
- protection and rotation of deployment secrets.

No backup is considered valid until a restore has succeeded.

## Rollback

Application releases use immutable image tags. Rollback means redeploying the previous known-good frontend and backend tags, then running smoke checks. Database migrations must be backward-compatible for at least one application release. Operators must never reverse a production migration automatically or delete a volume as part of rollback.

The runbook will include pre-deployment backup, deployment, smoke-test, rollback-decision, and post-deployment verification steps.

## Documentation deliverables

Implementation produces:

- a production environment template;
- container build files and production Compose definition;
- a deployment preflight script;
- private-preview deployment commands;
- health-check and smoke-test commands;
- backup and restore instructions;
- rollback instructions;
- a public-launch checklist that names every external dependency still required.

## Testing strategy

The implementation will use tests for configuration rules that can regress, including server-only API configuration, preview indexing behavior, and required production settings. Verification includes:

- full frontend tests and lint;
- frontend production build;
- full backend tests;
- backend package build;
- production image builds;
- production Compose configuration validation;
- local container startup and health checks when Docker is available;
- HTTP smoke checks for the homepage, backend readiness, and protected-route behavior.

## Out of scope

- implementing real account authentication or authorization;
- connecting email, SMS, or WeChat providers;
- enabling consultation data collection before privacy approval;
- provisioning a hosting account, DNS, TLS certificate, or monitoring vendor;
- importing unreviewed production catalogue data;
- enabling search-engine indexing during private preview;
- Kubernetes, microservices, message queues, or infrastructure changes prohibited by `AGENTS.md`.

## Acceptance criteria

The repository is ready for a private-preview deployment when:

1. frontend and backend production images build reproducibly;
2. production Compose validates and starts without publishing data-service ports;
3. every container becomes healthy with documented checks;
4. the frontend can reach the backend through its private service URL;
5. missing or placeholder production configuration fails before startup;
6. tests, lint, package builds, and deployment checks pass in CI;
7. preview pages remain excluded from search indexing;
8. account and consultation limitations are visible and no real credentials are collected;
9. backup, restore, smoke-test, and rollback commands are documented;
10. the public-launch checklist clearly separates completed repository work from external work still owned by the business and backend teams.
