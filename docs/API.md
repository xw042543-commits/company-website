# REST API

Local base URL: `http://localhost:8080`. All current responses use JSON. Public DTOs protect clients from internal JPA and Elasticsearch model changes.

## `GET /api/hello`

Response `200 OK`:

```json
{"message":"Hello from Spring Boot"}
```

## `GET /api/universities`

Returns all universities from PostgreSQL as `UniversityResponse[]`.

## `GET /api/universities/popular`

Returns universities whose `popular` field is true. The result is cached in Redis for 10 minutes; a cache miss reads PostgreSQL.

Example university:

```json
{
  "id": 1,
  "name": "University of Malaya",
  "slug": "university-of-malaya",
  "country": "Malaysia",
  "popular": true,
  "createdAt": "2026-09-14T03:22:43.141568Z"
}
```

## `GET /api/search?q={query}`

Searches the Elasticsearch `universities` index by university name or country.

Query rules:

- `q` is required and cannot be blank.
- Maximum length is 100 characters.

```bash
curl 'http://localhost:8080/api/search?q=Malaysia'
```

Search responses omit `createdAt` because it is not part of the current search document.

## Error response

Validation failures return `400 Bad Request`:

```json
{
  "timestamp": "2026-09-14T12:03:35.581227+08:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Request validation failed",
  "path": "/api/search"
}
```

Unexpected failures use the same structure with status 500 and a safe generic message. The backend logs the stack trace but does not return it to the browser.

When changing an endpoint or DTO, update tests, this document, and the Next.js consumer in the same pull request. Never expose a JPA entity directly as the intended API contract.
