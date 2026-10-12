# Project context

## Product goal and current scope

UDAJO serves prospective international students through a bilingual company
website and a native WeChat miniapp. The repository includes university and
programme discovery, planning, articles, consultations, website and miniapp
authentication, application tracking, community features, and adviser tools.
Implementation and production availability are separate: registration,
consultation submission, community writes, and public indexing have independent
configuration and release gates.

## Technical baseline

- Next.js, React, TypeScript, and Node.js 24 LTS for the website.
- Native WXML, WXSS, and TypeScript for the miniapp.
- Java 21 LTS, Spring Boot, and Maven Wrapper for the modular backend.
- PostgreSQL is authoritative; Elasticsearch holds derived search indexes.
- Redis supports caching, community hot snapshots, and community rate limits.
- Docker Compose supplies local dependencies and the production topology.

Read `frontend/package.json`, `miniapp/package.json`, `backend/pom.xml`, and the
Compose files for exact dependency versions. Verify compatibility before
upgrading Spring Boot, Spring Data Elasticsearch, or Elasticsearch.

## Local development and documentation

Follow [the README](../README.md) for setup and checks. Local frontend and backend
defaults are `http://localhost:3000` and `http://localhost:8080`. Local data
services bind to localhost. Flyway owns migrations and the default backend
profile is `dev`. Real local credentials belong in the ignored root `.env`.

- [ARCHITECTURE.md](ARCHITECTURE.md): components and data flow.
- [API.md](API.md): current HTTP contracts.
- [DATABASE.md](DATABASE.md): schema guidance.
- [Miniapp README](../miniapp/README.md): development, login, and release checks.
- [DEPLOYMENT.md](DEPLOYMENT.md): deployment procedures.
- [PUBLIC_LAUNCH_CHECKLIST.md](PUBLIC_LAUNCH_CHECKLIST.md): production gates.
- [GIT_WORKFLOW.md](GIT_WORKFLOW.md): branches, commits, and review.

## Business information and pending decisions

Approved company information and contacts are maintained in
`frontend/src/data/company-profile.ts`. Reviewed content and import packages
exist in the repository, but their presence does not establish publication
approval. Final university and programme data must follow owner approval as
described in the README and data documentation.

Record new unresolved requirements as `TBD` with their scope and owner. Check
existing product specifications and runbooks before treating branding,
contacts, authentication, or deployment as undecided. Do not invent missing
business requirements or describe gated features as enabled.

## Resuming work

Inspect `git status`, read `AGENTS.md` and the relevant documentation, then verify
the implementation. Documentation is a navigation aid rather than a substitute
for checking the code. Keep API, schema, configuration, and architecture guidance
current when their implementation changes.
