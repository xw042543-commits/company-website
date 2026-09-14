# Architecture

## System shape

```text
Browser
  -> Next.js (:3000)
      -> REST API
          -> Spring Boot (:8080)
              -> PostgreSQL (source of truth)
              -> Elasticsearch (search index only)
              -> Redis (cache only)
```

This is a modular monolith, not a microservice system. The frontend and backend are separately runnable applications in one repository; the backend is one Spring Boot application.

## PostgreSQL request flow

For `GET /api/universities`:

```text
UniversityController
  -> UniversityService
      -> UniversityRepository (Spring Data JPA)
          -> PostgreSQL universities table
  -> UniversityResponse DTO
      -> JSON
```

The Controller handles HTTP and maps entities to DTOs. The Service owns read-only transaction and caching rules. The Repository performs database access. The JPA `University` entity is internal and is not the public API contract.

## Search flow

For `GET /api/search?q=Malaysia`:

```text
SearchController
  -> request validation
  -> UniversitySearchService
      -> UniversitySearchRepository
          -> Elasticsearch universities index
  -> UniversitySearchResponse DTO
      -> JSON
```

At application startup, `UniversitySearchService.rebuildIndex()` reads every university from PostgreSQL, deletes the old Elasticsearch documents, and saves rebuilt documents. This simple strategy is suitable only for the current small development dataset. PostgreSQL remains authoritative even if Elasticsearch is empty or recreated.

## Cache flow

For `GET /api/universities/popular`:

```text
Request
  -> Redis cache lookup: popularUniversities
      -> hit: return cached list
      -> miss: UniversityRepository -> PostgreSQL
               -> cache result for 10 minutes
               -> return result
```

Redis persistence in local Docker helps development convenience but does not make Redis a business database. Cache data may be deleted at any time.

## Configuration boundaries

- `application.yml`: shared settings, schema validation, caching, safe errors, and logging
- `application-dev.yml`: local service connections and CORS origin
- `.env`: real local values, ignored by Git
- `.env.example`: safe onboarding template
- `compose.yaml`: version-pinned local data services and named volumes

Bean Validation rejects invalid requests before search logic runs. `GlobalExceptionHandler` returns stable error DTOs without exposing stack traces. CORS applies to `/api/**` and permits configured origins only. Elasticsearch security being disabled is strictly a local-development choice.
