# University Search Platform Design

**Status:** Approved

**Date:** 2026-09-15

**Scope:** Backend foundation for university/programme search, filtering, import, caching, consultation, and team integration

## 1. Context and constraints

The public website helps visitors find universities through programmes. The first release covers the home page, programme filtering, university list, and university detail page. Search results show one card per university and up to three matching programmes.

The approved system remains a modular monolith:

```text
Browser -> Next.js -> Spring Boot REST API
                         |-> PostgreSQL (source of truth)
                         |-> Redis (cache only)
                         `-> Elasticsearch (search only)
```

PostgreSQL owns all formal business data. Elasticsearch is a rebuildable projection and Redis is an optional acceleration layer. The design does not introduce microservices, Kafka, RabbitMQ, Kubernetes, or MongoDB.

The employer will provide the source Excel file. The development team must inspect its real sheets and columns before implementing the final mapping. Unknown columns or meanings must be confirmed rather than guessed.

The employer-provided “筛选功能网站文档” and “网站UI文案” remain the highest-priority product and content sources. The approved navigation is 首页、规划、院校一览、语言、奖学金、留学项目、新闻、关于我们. IDP is the primary visual reference and Educations is secondary, but their branding, assets, and copy must not be copied. When this technical design conflicts with later written employer confirmation, record the decision and update this document before implementation.

## 2. Architectural decisions

- Use Java 21, Spring Boot, Maven, PostgreSQL, Redis, and Elasticsearch.
- Organize backend code by business feature.
- Use Controller -> Service -> Repository -> PostgreSQL for database-backed requests.
- Use DTOs for API inputs and outputs; do not serialize JPA entities directly.
- Use Java records for DTOs and explicit mapper classes for initial mappings.
- Manage schema changes only through Flyway; Hibernate validates the schema.
- Use a university-centred Elasticsearch document with nested programmes.
- Use the official `ElasticsearchClient` for explicit nested queries.
- Use a PostgreSQL outbox-style table for reliable search synchronization.
- Use command-line import and index maintenance in the first release; do not expose public maintenance endpoints.
- Use JUnit, Spring Boot Test, and Testcontainers for meaningful integration tests.

## 3. Backend module boundaries

```text
com.yangdoujiao.website
|-- university
|   |-- University.java
|   |-- UniversityRepository.java
|   |-- UniversityService.java
|   |-- UniversityController.java
|   |-- dto/
|   `-- mapper/
|-- programme
|   |-- Programme.java
|   |-- ProgrammeRepository.java
|   |-- ProgrammeService.java
|   |-- ProgrammeController.java
|   |-- dto/
|   `-- mapper/
|-- catalog
|   |-- Country.java
|   |-- SubjectCategory.java
|   |-- StudyLevel.java
|   |-- CourseMode.java
|   `-- Language.java
|-- search
|   |-- UniversitySearchDocument.java
|   |-- UniversitySearchService.java
|   |-- UniversityIndexService.java
|   |-- SearchAliasService.java
|   |-- SearchSyncJob.java
|   |-- SearchSyncWorker.java
|   |-- SearchController.java
|   `-- dto/
|-- consultation
|   |-- Consultation.java
|   |-- ConsultationRepository.java
|   |-- ConsultationService.java
|   |-- ConsultationController.java
|   `-- dto/
|-- dataimport
|   |-- ImportService.java
|   |-- ImportValidator.java
|   `-- dto/
`-- common
    |-- config/
    |-- error/
    `-- web/
```

Controllers handle HTTP concerns and validation. Services own business decisions. Repositories only access persistence. A module should normally call another module's service instead of reaching directly into its repository. `common` contains only genuinely shared infrastructure.

Existing demo classes and endpoints are migrated incrementally so current frontend work is not broken without coordination.

## 4. PostgreSQL model

### 4.1 Countries

`countries` stores a unique ISO 3166-1 alpha-2 code, Chinese and English names, continent code, and audit timestamps. Continent codes are stable application codes such as `ASIA` and `EUROPE`.

### 4.2 Subject categories

`subject_categories` stores a stable code, bilingual names, optional `parent_id`, sort order, publication status, and audit timestamps. Parent links allow hierarchical categories. A programme belongs to exactly one most-specific category in the first release.

### 4.3 Universities

`universities` contains:

- internal `BIGINT` identity;
- unique stable `university_code` for imports;
- unique public `slug`;
- Chinese and English name, city, and description fields;
- `country_id`;
- `popular` flag;
- `DRAFT`, `PUBLISHED`, or `ARCHIVED` status;
- `created_at`, `updated_at`, and `published_at`.

Existing `name` and `country` columns are migrated safely before later removal. Business records are archived instead of physically deleted.

### 4.4 Programmes

`programmes` contains:

- internal `BIGINT` identity;
- `university_id` and `subject_category_id`;
- globally unique stable `programme_code`;
- a slug unique within its university;
- bilingual name and description;
- stable `study_level` and `course_mode` codes;
- normalized duration in months plus original display text;
- original tuition minimum, maximum, currency, and display text;
- normalized RMB minimum and maximum, exchange rate, and exchange-rate date;
- publication status and audit timestamps.

Amounts must be non-negative, minimums cannot exceed maximums, and duration must be positive when present. Unknown values are stored as `NULL` and displayed as “请咨询”.

### 4.5 Programme languages and intakes

`programme_languages` uses `(programme_id, language_code)` as a unique key so a programme can have multiple teaching languages.

`programme_intakes` stores `programme_id`, a normalized ISO date for filtering, and the original display text.

### 4.6 Search aliases

`search_aliases` stores an alias, target type, and stable target code. For example, an employer-approved `UK` alias maps to country `GB`. Aliases are business data rather than hard-coded Java conditions.

### 4.7 Search synchronization jobs

`search_sync_jobs` stores entity type, entity ID, `UPSERT` or `DELETE` operation, processing status, retry count, next attempt time, sanitized last error, and audit timestamps. The business update and job creation occur in the same PostgreSQL transaction.

### 4.8 Consultations

`consultations` stores a reference ID, name, contact type and value, optional university/programme links, free-form intended school/programme, study level, remarks, consent time, workflow status, and audit timestamps. Contact values and remarks must not be written to logs, Redis, Elasticsearch, or Git.

### 4.9 Import audit

`data_import_runs` records file name, hash, dry-run/apply mode, status, counts, timestamps, and a summary. It does not store the entire source file.

### 4.10 Migration sequence

Executed migrations are immutable. Planned migrations are separated by concern:

```text
V2__create_catalog_tables.sql
V3__extend_universities_and_create_programmes.sql
V4__create_search_sync_jobs.sql
V5__create_consultations.sql
V6__create_data_import_runs.sql
```

The exact split may be refined before implementation, but existing `V1` must not be edited.

## 5. Elasticsearch design

Each search document represents one published university and embeds its published programmes as `nested` objects. University fields include codes, slugs, bilingual names, country, city, and popularity. Programme fields include codes, bilingual names, category, study level, course mode, languages, duration, intakes, normalized tuition, and display values.

Codes and filters use keyword mappings, ranges use numeric/date mappings, and names use text mappings with exact and partial-match subfields. English matching is case-insensitive. Chinese and English behaviour must be tested with representative examples using deployment-portable analysis settings before selecting the final mapping.

All filters for a programme must be placed in the same nested clause. This prevents fields from different programmes being combined into a false match.

Keyword relevance is weighted in this order:

1. exact programme name;
2. partial programme name;
3. subject category;
4. university name;
5. country, city, and approved aliases.

The query uses `inner_hits` to return the three most relevant programmes that also satisfy all active programme filters. Pagination and totals are calculated by university document, so a university appears once.

Aliases are resolved before building the typed Elasticsearch request. Query-string concatenation is prohibited. This avoids the existing failure for multi-word input such as `United Kingdom`.

### 5.1 Incremental synchronization

After a university or programme transaction commits, `SearchSyncWorker` claims pending jobs, reloads the complete university projection from PostgreSQL, and indexes one complete university document. Jobs use increasing retry delays and retain a terminal failed state for operator review. Consecutive pending jobs for the same university may be coalesced.

Draft and archived content is absent from the public index. Elasticsearch failure does not roll back already committed formal data.

### 5.2 Full rebuild

A command-line rebuild creates a versioned physical index, bulk-indexes all published universities, verifies counts and representative queries, and atomically switches the stable read alias. The old index is removed only after verification. Application startup does not delete or rebuild the index.

Local single-node Elasticsearch uses zero replicas. Production replica configuration depends on the actual production node count.

## 6. Search semantics

- An empty keyword is valid when structured filters are present.
- Values within one filter group use OR.
- Different filter groups use AND.
- Missing data remains visible when its filter is inactive but does not match an active range/value filter.
- Tuition filtering uses stored normalized RMB values and preserves the original currency and exchange-rate date.
- Limited fuzzy matching is allowed for ordinary longer terms; short terms and country codes use exact/alias matching.
- A result card contains only programmes satisfying every active programme condition.
- One university counts as one result and contains at most three matched programmes.
- No matches return a successful empty page; filters are never silently relaxed.
- Default page size is 12 and maximum page size is 48.

## 7. REST API contract

New endpoints use `/api/v1`.

### 7.1 University search

`GET /api/v1/universities/search` accepts keyword, repeated multi-value filters, duration/intake/tuition ranges, page, and size. Repeated values such as `country=GB&country=MY` represent OR within the country group.

The response contains `items`, `page`, `pageSize`, `totalItems`, and `totalPages`. Each item includes bilingual university/location fields and at most three matched programme DTOs.

### 7.2 Browsing and details

- `GET /api/v1/universities` browses published universities by continent/country with pagination, using PostgreSQL.
- `GET /api/v1/universities/{slug}` returns published university details.
- `GET /api/v1/universities/{slug}/programmes` returns that university's published programmes with pagination.
- `GET /api/v1/universities/popular` uses Redis with PostgreSQL fallback.

### 7.3 Catalogues

- `GET /api/v1/catalog/countries`
- `GET /api/v1/catalog/subject-categories`
- `GET /api/v1/catalog/filter-options`

The filter-options response exposes stable codes and bilingual labels for levels, modes, and languages.

### 7.4 Consultations

`POST /api/v1/consultations` validates contact details, intended school/programme, study level, remarks, and privacy consent. It returns `201 Created`, a generated reference ID, and a confirmation message without echoing personal information.

### 7.5 Errors

Errors use a stable code, safe message, optional field errors, and trace ID. Expected statuses include 400 validation, 404 missing published resource, 409 import conflict, 429 consultation rate limit, and 503 unavailable search. Production responses never include Java stack traces.

Existing demo endpoints remain temporarily while the frontend migrates.

## 8. Import design

The employer-provided Excel file is authoritative input. Once received, the team must inspect sheets, headers, examples, formulas, merged cells, units, and missing values. A documented mapping converts employer columns to stable system fields. Ambiguous meanings are escalated for confirmation.

Import has two phases:

1. Dry run: parse, normalize, validate references and constraints, compare with PostgreSQL, and produce inserted/updated/unchanged/warning/error counts without writes.
2. Apply: verify the same file hash, repeat validation, write one atomic PostgreSQL transaction for the initial expected data size, and enqueue search synchronization jobs.

Stable `universityCode` and `programmeCode` identify records. Repeat imports show differences before updating. Missing rows never imply deletion; archival must be explicit. Published records require display-critical fields, while drafts may be incomplete. Missing translations are not invented.

## 9. Redis and failure behaviour

Redis initially caches popular universities, countries, categories, and approved aliases. Search result combinations are not cached. Cache keys must be namespaced and have explicit TTLs and invalidation rules.

- Redis unavailable: log a safe warning and query PostgreSQL.
- Elasticsearch unavailable: search returns `503 SEARCH_UNAVAILABLE`; unrelated database endpoints remain usable.
- PostgreSQL unavailable: source-of-truth dependent health and functionality fail rather than serving caches as formal data.

## 10. Security and observability

- Public APIs and command-line maintenance are separated.
- CORS origins come from environment configuration; local development allows only the configured Next.js origin.
- Consultation submission uses validation, rate limiting, and a honeypot field; CAPTCHA is added only if evidence requires it.
- Logs may include path, status, duration, record ID, trace ID, and sanitized failures.
- Logs must exclude secrets, tokens, contact values, remarks, and complete request bodies.
- Spring Boot Actuator exposes only required health information and never publishes sensitive details in production.

## 11. Testing and CI

Unit tests cover import validation, DTO mapping, normalization, alias resolution, tuition/duration rules, and retry decisions. MVC tests cover request validation, pagination limits, safe errors, and consultation submission.

Testcontainers integration tests use real PostgreSQL, Redis, and Elasticsearch to verify Flyway, repositories, nested queries, cache fallback, and synchronization retries. Critical search cases include `UK`, multi-word terms, OR within groups, AND across groups, same-nested-programme correctness, university-level pagination, top-three matching programmes, missing tuition, and empty results.

Pull requests must pass backend compilation/tests, core integration tests, frontend lint/type/build checks, Flyway validation, and secret/environment-file checks. Team members review one another's pull requests; direct pushes to `main` are not allowed.

## 12. Implementation order and checkpoints

1. Audit the current `chore/ci` branch and protect its uncommitted search fix.
2. Create a dedicated feature branch.
3. Establish package conventions, DTOs, and error contracts.
4. Add catalogues and university schema changes through Flyway.
5. Add programme, language, and intake models.
6. Add PostgreSQL-backed `/api/v1` browsing/detail APIs.
7. Inspect the employer Excel and define the explicit mapping when it arrives.
8. Implement dry-run validation, then apply mode.
9. Add the university-centred index and typed nested search.
10. Add reliable incremental synchronization and safe full rebuild.
11. Add Redis degradation, Actuator, and consultation submission.
12. Complete automated tests, documentation, CI, and frontend integration.

Each checkpoint starts with a test or explicit verification criterion, changes only one concern, runs relevant checks, reviews `git diff`, confirms no secrets, and ends with user review before the next checkpoint.

## 13. Acceptance criteria

The backend foundation is complete when:

- Flyway creates and validates all approved tables;
- employer Excel data can be dry-run validated and safely imported after its mapping is approved;
- PostgreSQL changes reliably synchronize to Elasticsearch;
- structured filters and relevance rules have automated tests;
- results paginate by university and return at most three matching programmes;
- Redis failure falls back to PostgreSQL;
- Elasticsearch failure returns an explicit search-unavailable response;
- consultation data is validated and not leaked;
- API and architecture documents match the implementation;
- CI passes for all required checks.
