## What changed?

<!-- Briefly explain the user-visible or technical change. -->

## Why?

<!-- Explain the problem or requirement this pull request addresses. -->

## How was it tested?

- [ ] Backend: `cd backend && ./mvnw test`
- [ ] Frontend: `npm --prefix frontend run lint`
- [ ] Manual browser/API test completed when relevant

## Safety checklist

- [ ] No passwords, API keys, `.env`, or `.env.local` files are included
- [ ] Database changes use a new Flyway migration
- [ ] PostgreSQL remains the source of truth
- [ ] Elasticsearch and Redis data can be rebuilt or safely expire

## Reviewer notes

<!-- Mention migration steps, risks, screenshots, or areas needing attention. -->
