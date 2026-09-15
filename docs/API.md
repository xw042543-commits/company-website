# API Conventions

## Base path

New public endpoints use `/api/v1`. Existing `/api/search` and
`/api/universities` endpoints remain temporary compatibility endpoints until
frontend migration is reviewed.

## Trace ID

Every response includes `X-Trace-Id`. A client may send a safe `X-Trace-Id`
containing 1–64 letters, digits, dots, underscores, or hyphens. The backend
generates a UUID when the value is missing or invalid.

## Errors

Errors use `code`, `message`, `fieldErrors`, and `traceId`. Production responses
never include Java stack traces, credentials, contact values, remarks, or full
request bodies.

```json
{
  "code": "VALIDATION_ERROR",
  "message": "Request validation failed",
  "fieldErrors": {
    "size": "must be less than or equal to 48"
  },
  "traceId": "frontend-123"
}
```

## Pagination

Public page numbers are one-based. New paginated endpoints return `items`,
`page`, `pageSize`, `totalItems`, and `totalPages`. University search defaults
to 12 items and rejects sizes above 48.

```json
{
  "items": [],
  "page": 1,
  "pageSize": 12,
  "totalItems": 0,
  "totalPages": 0
}
```
