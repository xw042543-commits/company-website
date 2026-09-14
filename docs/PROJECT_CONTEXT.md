# Project context

## Product goal

This repository is the foundation for a company website serving prospective international students. Planned areas include the home page, company information, study-abroad services, countries, universities, programmes, success stories, articles, FAQ, contact and consultation forms, administration, and search.

Only a small vertical slice is implemented today: university listing, university search, and popular-university caching. Planned features must not be presented as complete.

## Confirmed technical baseline

- Three-person development team using pull requests into `main`
- Node.js 24 LTS; Next.js 16.3.5; React 19.2.8; TypeScript 5
- Java 21 LTS; Spring Boot 4.1.1; Maven Wrapper
- PostgreSQL 17.11
- Spring Data Elasticsearch 6.1.1 with Elasticsearch 9.4.5
- Redis 8.2.9
- Docker Compose for local data services

The Elasticsearch versions were aligned through Spring Boot dependency management. Do not independently upgrade the server without checking Spring Data compatibility and the resolved Java client version.

## Current development state

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8080`
- PostgreSQL, Elasticsearch, and Redis bind only to localhost in development.
- Flyway owns database migrations; Hibernate validates the schema.
- The `dev` Spring profile is the local default.
- Real credentials are loaded from the ignored root `.env` file.

## TBD: information required from the business owner

- Official company and product names, contact information, legal entity, and footer details
- Brand assets, colours, typography, tone of voice, and approved page copy
- Final navigation, page hierarchy, supported countries, universities, and programmes
- Consultation form fields, consent wording, lead ownership, notification recipients, and retention rules
- Article, success-story, FAQ, and university content models
- Administrator roles, permissions, authentication method, and content approval workflow
- SEO requirements, analytics and cookie-consent requirements
- Domain name and access to Alibaba Cloud, DNS, email, and other production accounts
- Privacy policy, terms, regulatory requirements, and backup-retention policy

These decisions must be confirmed before their related production features are designed. Do not guess them.

## Resuming work

In a new developer or AI session, first inspect `git status`, read `AGENTS.md` and all files in `docs/`, then verify the code. Documentation is a navigation aid, not a substitute for checking the implementation.
