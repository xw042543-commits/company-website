# Database

## Ownership rules

PostgreSQL is the only source of truth for business data. Elasticsearch documents are derived search data. Redis entries are temporary cached data. Never rely on Elasticsearch or Redis as the only copy of a business record.

## Schema management

Flyway migration files live in `backend/src/main/resources/db/migration/` and use names such as:

```text
V2__short_description.sql
V3__another_change.sql
```

Never change a migration after it has been applied or shared. Add the next version instead. Hibernate uses `ddl-auto: validate`, so it verifies Java mappings but does not create tables.

## Current table: universities

| Column | PostgreSQL type | Rules | Meaning |
| --- | --- | --- | --- |
| `id` | `BIGINT` | identity, primary key | Internal identifier |
| `name` | `VARCHAR(200)` | not null | Display name |
| `slug` | `VARCHAR(200)` | not null, unique | URL-safe stable name |
| `country` | `VARCHAR(100)` | not null | Country name |
| `popular` | `BOOLEAN` | not null, default false | Eligible for popular list |
| `created_at` | `TIMESTAMP WITH TIME ZONE` | not null, current time default | Creation timestamp |

The schema was introduced by `V1__create_universities_table.sql`.

## Local connection

Connection values come from `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_DB`, `POSTGRES_USER`, and `POSTGRES_PASSWORD` in the ignored root `.env` file. Never place real credentials in code, documentation, commits, screenshots, or issues.

Application features should normally write through Controller -> Service -> Repository. Direct `psql` inserts were used only for the initial demonstration data. A repeatable seed-data strategy remains TBD until the real content model is confirmed.

Before merging a schema change, test the new migration on a disposable or backed-up development database and run `./mvnw test` from `backend/`.
