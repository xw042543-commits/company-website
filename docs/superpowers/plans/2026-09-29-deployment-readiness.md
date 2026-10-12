# Deployment Readiness Implementation Plan

> **For implementers:** Follow this plan in order. Use test-driven development for every behavior change and commit after each task. Do not enable public data collection, real authentication claims, or search indexing.

**Goal:** Produce reproducible, health-checked containers and operational documentation for a private UDAJO preview while keeping unfinished production features safely gated.

**Architecture:** Package the existing Next.js and Spring Boot applications as non-root containers. Run them with PostgreSQL, Redis, and Elasticsearch on a private Compose network, publish only the frontend, and use a server-only internal API URL. Add a production Spring profile, Actuator probes, preflight environment validation, deployment CI, and backup/rollback documentation.

**Tech stack:** Next.js 16, React 19, TypeScript, Node.js 24, Spring Boot 4, Java 21, Maven Wrapper, PostgreSQL 17, Redis 8, Elasticsearch 9, Docker Compose, GitHub Actions.

**Design reference:** `docs/superpowers/specs/2026-09-29-deployment-readiness-design.md`

---

## File map

### Create

- `frontend/src/lib/runtime-config.ts` — server-only API configuration and validation.
- `frontend/src/lib/runtime-config.test.ts` — development fallback and production failure tests.
- `frontend/src/lib/deployment-config.test.ts` — standalone output, security headers, and preview-indexing contract tests.
- `frontend/Dockerfile` — multi-stage Node.js 24 standalone image.
- `frontend/.dockerignore` — frontend build-context exclusions.
- `backend/src/main/resources/application-prod.yml` — production-only backend settings.
- `backend/src/test/java/com/yangdoujiao/website/config/ProductionConfigurationTest.java` — production configuration contract.
- `backend/Dockerfile` — multi-stage Java 21 image.
- `backend/.dockerignore` — backend build-context exclusions.
- `compose.production.yaml` — private application and data-service topology.
- `deploy/.env.production.example` — safe production variable template.
- `scripts/deployment-preflight.mjs` — cross-platform environment validation.
- `scripts/deployment-preflight.test.mjs` — validator unit tests.
- `docs/DEPLOYMENT.md` — build, deploy, smoke-check, and update runbook.
- `docs/BACKUP_AND_RESTORE.md` — PostgreSQL backup rehearsal and derived-service recovery.
- `docs/PUBLIC_LAUNCH_CHECKLIST.md` — business, backend, privacy, vendor, SEO, and infrastructure gates.

### Modify

- `frontend/next.config.ts` — standalone output and browser security headers.
- `frontend/package.json` — include deployment contract tests.
- frontend API consumers under `frontend/src/app/` and `frontend/src/lib/universities.ts` — use server-only runtime configuration.
- `backend/pom.xml` — add Actuator.
- `.env.example` — point developers to the production template and keep local defaults explicit.
- `.github/workflows/ci.yml` — validate deploy configuration and build production images.
- `README.md` — link the deployment and launch documentation.

---

## Task 1: Establish deployment configuration contracts

**Files:**

- Create: `scripts/deployment-preflight.mjs`
- Create: `scripts/deployment-preflight.test.mjs`
- Create: `deploy/.env.production.example`
- Modify: `.env.example`

### Step 1: Write failing preflight tests

Cover these cases with `node:test`:

- reports every missing required variable in one run;
- rejects empty values;
- rejects documented placeholders such as `change_me` and `replace_with_*`;
- rejects non-HTTPS public URLs in production;
- rejects equal database and Redis passwords only if the policy explicitly requires distinct secrets;
- accepts a complete private-preview environment;
- never prints secret values in an error.

Required variables:

```text
PUBLIC_SITE_URL
API_BASE_URL
SPRING_PROFILES_ACTIVE
CORS_ALLOWED_ORIGINS
POSTGRES_DB
POSTGRES_USER
POSTGRES_PASSWORD
POSTGRES_HOST
POSTGRES_PORT
REDIS_HOST
REDIS_PORT
REDIS_PASSWORD
ELASTICSEARCH_URL
APP_CONSULTATION_SUBMISSION_ENABLED
```

Run: `node --test scripts/deployment-preflight.test.mjs`
Expected: FAIL because the validator does not exist.

### Step 2: Implement the validator

Export pure parsing and validation functions for tests, plus a CLI entry point that reads a named env file. Return a nonzero exit code with variable names and corrective guidance. Never log values.

### Step 3: Add the production template

Document every deployment variable with safe placeholders. Keep consultation disabled and preview indexing disabled. Explain that real secrets belong in an untracked `.env.production` file or the hosting provider’s secret store.

### Step 4: Verify

Run:

```powershell
node --test scripts/deployment-preflight.test.mjs
node scripts/deployment-preflight.mjs deploy/.env.production.example
```

Expected: unit tests pass; the example-file check fails clearly because placeholders are intentionally not deployable.

### Step 5: Commit

```powershell
git add scripts deploy .env.example
git commit -m "feat: validate deployment environment"
```

---

## Task 2: Make frontend runtime configuration production-safe

**Files:**

- Create: `frontend/src/lib/runtime-config.ts`
- Create: `frontend/src/lib/runtime-config.test.ts`
- Modify: `frontend/src/lib/universities.ts`
- Modify: `frontend/src/app/[locale]/planning/page.tsx`
- Modify: `frontend/src/app/[locale]/universities/page.tsx`
- Modify: `frontend/src/app/[locale]/universities/[slug]/page.tsx`
- Modify: `frontend/src/app/[locale]/[section]/page.tsx`
- Modify: `frontend/src/app/[locale]/[section]/[slug]/page.tsx`
- Modify: `frontend/package.json`

### Step 1: Write failing runtime tests

Specify one helper that:

- returns a trimmed `API_BASE_URL`;
- permits an undefined API during local development so reviewed local records still work;
- rejects a missing API URL when `NODE_ENV=production`;
- rejects browser-public variable names as the production source;
- rejects invalid or non-HTTP(S) URLs.

Run: `node --test src/lib/runtime-config.test.ts`
Expected: FAIL.

### Step 2: Implement server-only configuration

Use `import "server-only"` in the production helper while keeping validation logic testable through a pure exported function. Do not expose internal service names through `NEXT_PUBLIC_*` variables.

### Step 3: Update API consumers

Replace direct `process.env.NEXT_PUBLIC_API_BASE_URL` reads with the helper. Preserve the current reviewed-local-data fallback outside production.

### Step 4: Add the test to the standard suite

Update `npm test` so deployment runtime tests cannot be skipped in CI.

### Step 5: Verify and commit

```powershell
npm test
npm run lint
npx tsc --noEmit
git add frontend
git commit -m "refactor: use server-only backend configuration"
```

---

## Task 3: Add frontend production output and security defaults

**Files:**

- Create: `frontend/src/lib/deployment-config.test.ts`
- Modify: `frontend/next.config.ts`
- Modify: `frontend/package.json`

### Step 1: Write failing configuration tests

Assert that:

- Next.js standalone output is enabled;
- all routes receive `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, and `Permissions-Policy`;
- production transport security is configured without breaking local HTTP development;
- the root metadata remains `noindex` for private preview.

Run: `node --test src/lib/deployment-config.test.ts`
Expected: FAIL.

### Step 2: Implement headers and standalone output

Add a centralized header list in `next.config.ts`. Keep policies compatible with Next.js rendering and existing local development. Do not add an untested strict CSP in this task.

### Step 3: Verify and commit

```powershell
npm test
npm run lint
npm run build -- --webpack
git add frontend
git commit -m "feat: harden frontend production output"
```

---

## Task 4: Add backend production profile and health probes

**Files:**

- Modify: `backend/pom.xml`
- Create: `backend/src/main/resources/application-prod.yml`
- Create: `backend/src/test/java/com/yangdoujiao/website/config/ProductionConfigurationTest.java`

### Step 1: Write a failing production configuration test

The test must verify:

- the `prod` profile requires environment-driven PostgreSQL, Redis, and Elasticsearch endpoints;
- CORS has no localhost fallback;
- consultation submission remains disabled by default;
- forwarded headers are enabled for proxy deployments;
- only the health endpoint is exposed;
- liveness and readiness probes are enabled;
- error messages and stack traces remain hidden.

Run: `./mvnw --batch-mode -Dtest=ProductionConfigurationTest test`
Expected: FAIL because the profile and Actuator dependency do not exist.

### Step 2: Add Actuator and production settings

Add `spring-boot-starter-actuator`. Configure health probes, restricted endpoint exposure, dependency settings, CORS, and forwarded headers in `application-prod.yml`. Do not add credentials to YAML.

### Step 3: Verify and commit

```powershell
./mvnw --batch-mode test
./mvnw --batch-mode -DskipTests package
git add backend
git commit -m "feat: add production backend health configuration"
```

---

## Task 5: Package frontend and backend containers

**Files:**

- Create: `frontend/Dockerfile`
- Create: `frontend/.dockerignore`
- Create: `backend/Dockerfile`
- Create: `backend/.dockerignore`

### Step 1: Add image contract checks

Extend deployment tests to inspect Dockerfiles and require:

- pinned Node.js 24 and Java 21 major versions;
- multi-stage builds;
- locked frontend install with `npm ci`;
- Maven Wrapper backend build;
- non-root runtime users;
- only runtime artifacts in final stages;
- declared application ports;
- no copied `.env` files.

Run the contract tests and confirm they fail.

### Step 2: Implement the Dockerfiles

Frontend final image contains standalone server output, `.next/static`, and `public`. Backend final image contains only the executable JAR and runtime necessities. Add OCI labels for revision/source when they can be passed safely.

### Step 3: Build and inspect images

```powershell
docker build -t udajo-frontend:local frontend
docker build -t udajo-backend:local backend
docker image inspect udajo-frontend:local udajo-backend:local
```

Confirm both images run as non-root and contain no environment files.

### Step 4: Commit

```powershell
git add frontend/Dockerfile frontend/.dockerignore backend/Dockerfile backend/.dockerignore scripts
git commit -m "feat: package production application images"
```

---

## Task 6: Define the private production topology

**Files:**

- Create: `compose.production.yaml`
- Modify: `scripts/deployment-preflight.test.mjs`

### Step 1: Write failing Compose contract tests

Assert that:

- only the frontend publishes a host port;
- backend, PostgreSQL, Redis, and Elasticsearch remain private;
- all five services have health checks;
- dependent services wait for healthy prerequisites;
- application services use the `prod` profile and server-only `API_BASE_URL`;
- persistent services use named volumes;
- restart policies are present;
- consultation submission remains disabled unless explicitly changed.

### Step 2: Implement `compose.production.yaml`

Use the existing pinned data-service versions. Do not duplicate secrets in the file. Use Compose interpolation from the untracked production environment. Bind the frontend to a configurable address and port suitable for a local hosting edge.

### Step 3: Validate and start

Create a temporary local env file containing generated non-production secrets, then run:

```powershell
node scripts/deployment-preflight.mjs <temporary-env-path>
docker compose --env-file <temporary-env-path> -f compose.production.yaml config --quiet
docker compose --env-file <temporary-env-path> -f compose.production.yaml up -d --build --wait
docker compose --env-file <temporary-env-path> -f compose.production.yaml ps
```

Do not commit the temporary env file.

### Step 4: Smoke test and stop

Verify the localized homepage, backend readiness from inside the frontend network, and anonymous protected-route redirect. Then stop without deleting named volumes:

```powershell
docker compose --env-file <temporary-env-path> -f compose.production.yaml down
```

### Step 5: Commit

```powershell
git add compose.production.yaml scripts
git commit -m "feat: add private preview deployment topology"
```

---

## Task 7: Enforce deployment readiness in CI

**Files:**

- Modify: `.github/workflows/ci.yml`

### Step 1: Add validation steps

Extend CI to:

- run preflight unit tests;
- generate a short-lived CI deployment env without printing secrets;
- validate `compose.production.yaml`;
- build both production images;
- retain existing frontend and backend test jobs.

Do not push images and do not deploy from CI in this phase.

### Step 2: Validate workflow syntax and commands locally

Run the same Compose validation and Docker builds used by CI. Inspect the workflow diff for permissions; keep `contents: read` only.

### Step 3: Commit

```powershell
git add .github/workflows/ci.yml
git commit -m "ci: verify production deployment artifacts"
```

---

## Task 8: Write deployment, recovery, and launch runbooks

**Files:**

- Create: `docs/DEPLOYMENT.md`
- Create: `docs/BACKUP_AND_RESTORE.md`
- Create: `docs/PUBLIC_LAUNCH_CHECKLIST.md`
- Modify: `README.md`

### Step 1: Write documentation contract tests

Extend deployment contract tests to require documented commands for:

- preflight validation;
- image build and Compose startup;
- health and smoke checks;
- database migration behavior;
- PostgreSQL backup, integrity check, and isolated restore rehearsal;
- Elasticsearch rebuild and Redis cache recovery;
- immutable-tag deployment and application rollback;
- domain, HTTPS, monitoring, privacy, real authentication, email/SMS/WeChat, and SEO launch gates.

### Step 2: Write the runbooks

Commands must be copyable on the supported deployment shell, must not contain real secrets, and must distinguish destructive recovery actions from read-only checks. State that database rollback is never automatic.

### Step 3: Link documentation from the root README

Add a short deployment section that points to the three runbooks and labels the current target as a private preview.

### Step 4: Verify and commit

```powershell
node --test scripts/deployment-preflight.test.mjs
git diff --check
git add docs README.md scripts
git commit -m "docs: add deployment and recovery runbooks"
```

---

## Task 9: Full release-candidate verification

**Files:** No planned product-code changes. Fix only failures caused by this deployment work.

### Step 1: Verify frontend

```powershell
cd frontend
npm ci
npm test
npm run lint
npx tsc --noEmit
npm run build -- --webpack
```

Expected: all commands exit 0.

### Step 2: Verify backend

```powershell
cd backend
./mvnw --batch-mode test
./mvnw --batch-mode -DskipTests package
```

Expected: all commands exit 0.

### Step 3: Verify deployment artifacts

```powershell
node --test scripts/deployment-preflight.test.mjs
node scripts/deployment-preflight.mjs <temporary-env-path>
docker compose --env-file <temporary-env-path> -f compose.production.yaml config --quiet
docker compose --env-file <temporary-env-path> -f compose.production.yaml up -d --build --wait
```

Run documented smoke checks. Inspect container health and logs. Shut down without deleting volumes after verification.

### Step 4: Audit the release diff

Confirm:

- no `.env` or secret files are tracked;
- no data-service port is published;
- preview remains `noindex`;
- demo authentication and disabled consultation are still disclosed;
- only intended deployment and configuration files changed.

### Step 5: Commit verification-only corrections

If verification required corrections, commit them separately:

```powershell
git add <corrected-files>
git commit -m "fix: complete deployment readiness verification"
```

### Step 6: Request final review

Run an independent whole-branch review, resolve material findings, rerun affected verification, then push and open a pull request against `main`.
