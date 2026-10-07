# Adviser consultation administration release runbook

This is an operator procedure for an approved production release. Run host commands only in `/opt/company-website` on the authorised deployment host. Local development verification does not establish production readiness. Record the release SHA, CI run, operator, UTC time, outcomes and trace IDs in the restricted release record. Never record credentials, cookies, verification codes, consultation bodies or screenshots containing student data.

## 1. Release gates and deployment

Merge only after CI passes. Require a successful **main push CI run for the exact release SHA** before deployment, including the full backend suite with Docker/Testcontainers and the frontend tests, lint and build. A local Docker failure is a verification limitation, not a passing or skipped integration suite.

Run these checks locally from the repository root:

```bash
(cd backend && ./mvnw --batch-mode test)
(cd frontend && npm test && npm run lint && npm run build)
git diff --check
docker compose --env-file .env.example -f compose.yaml config >/dev/null
node --test scripts/deployment-compose.test.mjs scripts/deployment-preflight.test.mjs scripts/deployment-cd.test.mjs
```

The normal `npm test` entry point includes both adviser API and UI suites through `test:adviser`, so the existing CI frontend test step gates them. All commands must exit 0; backend tests must have zero failures and errors. Use Node 24 and Java 21. For a local browser rehearsal of the standalone build, launch the generated server as documented in `frontend/Dockerfile`, with its static/public assets present, rather than `next start`.

Take, integrity-check and rehearse a PostgreSQL backup following [BACKUP_AND_RESTORE.md](../BACKUP_AND_RESTORE.md). Record pre-deploy account and consultation row counts and workflow status counts as aggregates only, with a known migration rehearsal containing pre-V12 `NEW` rows. Follow [DEPLOYMENT.md](../DEPLOYMENT.md): **Actions → Deploy production → Run workflow → main** is the existing manual approval/deployment workflow. It gates the exact release SHA, keeps the previous running images, validates configuration, starts healthy containers and runs credential-free launch smoke. Do not bypass it by running a separate release script.

After the workflow succeeds, verify all six services (`caddy`, `frontend`, `backend`, `postgres`, `redis`, `elasticsearch`) are running and healthy:

```bash
cd /opt/company-website
docker compose --env-file .env.production -f compose.production.yaml ps
docker compose --env-file .env.production -f compose.production.yaml exec -T backend curl --fail --silent --connect-timeout 10 --max-time 30 --header 'X-Forwarded-Proto: https' http://127.0.0.1:8080/actuator/health/readiness
curl --fail --silent --connect-timeout 10 --max-time 30 --output /dev/null https://yangdoujiao.com/healthz
docker run --rm --mount "type=bind,source=$PWD,target=/app,readonly" -w /app node:24-bookworm-slim node scripts/launch-smoke.mjs https://yangdoujiao.com --public --wechat
```

The shown launch flags match the current production workflow; use only the approved indexing/WeChat launch configuration. Keep `launch-smoke.mjs` public and credential-free. Authenticated adviser checks are a separate manual browser procedure below. Never add adviser credentials to CI, smoke scripts or shell arguments.

## 2. Verify V12 before promotion

Run read-only SQL through the production Postgres container using its existing environment. `-X` disables psql startup customisations and `ON_ERROR_STOP` stops on any SQL error; no connection secret is printed or supplied in the command.

```bash
docker compose --env-file .env.production -f compose.production.yaml exec -T postgres sh -c 'psql -X -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB"' <<'SQL'
SELECT version, description, success
FROM flyway_schema_history
ORDER BY installed_rank DESC LIMIT 3;
SELECT count(*) AS successful_v12
FROM flyway_schema_history
WHERE version = '12' AND success;
SELECT count(*) AS failed_migrations FROM flyway_schema_history WHERE NOT success;
SELECT table_name, column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND ((table_name = 'user_accounts' AND column_name = 'role')
    OR (table_name = 'consultation_enquiries'
      AND column_name IN ('status_updated_at', 'status_updated_by_user_id', 'version')))
ORDER BY table_name, column_name;
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conname IN ('ck_user_accounts_role', 'ck_consultation_enquiries_status', 'fk_consultation_status_updated_by');
SELECT indexname, indexdef FROM pg_indexes
WHERE schemaname = 'public' AND tablename = 'consultation_enquiries';
SELECT role, count(*) FROM user_accounts GROUP BY role;
SELECT status, count(*) FROM consultation_enquiries GROUP BY status;
SELECT count(*) AS invalid_workflow_rows FROM consultation_enquiries
WHERE status_updated_at IS NULL OR version IS NULL OR version < 0;
SQL
```

Require latest successful migration V12, `successful_v12 = 1`, `failed_migrations = 0`, and `invalid_workflow_rows = 0`. Confirm role is non-null with `USER` default and only `USER`/`ADVISER` allowed; status allows `NEW`/`IN_PROGRESS`/`COMPLETED`; timestamp is non-null TIMESTAMPTZ, updater is nullable BIGINT with `ON DELETE RESTRICT`, and version is non-null BIGINT with default zero. Confirm `(status, created_at DESC, id DESC)` and the retained newest-first index. Compare aggregates with the pre-deploy record, accounting for concurrent genuine submissions; investigate differences rather than rewriting rows. In the isolated migration rehearsal verify pre-V12 accounts became `USER`, existing `NEW` rows retained their content, `status_updated_at` was backfilled from `created_at`, version is zero and updater is null. This is mandatory migration acceptance evidence even if a fresh-schema test passes.

## 3. Register, verify and inspect the existing account

Before promotion, register `udajoedu@gmail.com` using the normal website flow and complete email verification if the account does not already exist. If it exists, reuse it and verify mailbox ownership through the established account process. Do not insert an account or verification timestamp using SQL, overwrite credentials, bypass registration gates or create a duplicate. Resolve blocked registration through the approved authentication launch procedure. Sign out in every staff browser before promotion.

Run these read-only checks and review the result:

```bash
docker compose --env-file .env.production -f compose.production.yaml exec -T postgres sh -c 'psql -X -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB"' <<'SQL'
SELECT count(*) AS exact_email_count FROM user_accounts
WHERE normalized_email = 'udajoedu@gmail.com';
SELECT id, normalized_email, status, email_verified_at, role
FROM user_accounts WHERE normalized_email = 'udajoedu@gmail.com';
SQL
```

Require exactly one matching account, `ACTIVE`, a non-null `email_verified_at` and current role `USER`. If already `ADVISER`, verify the prior authorised promotion record instead of repeating this transaction. Any missing, unverified, inactive or unexpected result stops promotion.

## 4. Promote exactly that verified account

Review the command before executing it. The first block locks and validates the pre-existing verified `USER` row inside the transaction, closing the gap between the read-only inspection and the mandated exact-row update. Any assertion failure aborts the transaction; investigate and repeat the read-only checks.

```bash
docker compose --env-file .env.production -f compose.production.yaml exec -T postgres sh -c 'psql -X -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB"' <<'SQL'
BEGIN;
DO $$
DECLARE target_rows integer;
BEGIN
  PERFORM id FROM user_accounts
   WHERE normalized_email = 'udajoedu@gmail.com' FOR UPDATE;
  SELECT count(*) INTO target_rows FROM user_accounts
   WHERE normalized_email = 'udajoedu@gmail.com'
     AND status = 'ACTIVE' AND email_verified_at IS NOT NULL AND role = 'USER';
  IF target_rows <> 1 THEN
    RAISE EXCEPTION 'Expected exactly one verified active USER account, found %', target_rows;
  END IF;
END $$;
DO $$
DECLARE changed_rows integer;
BEGIN
  UPDATE user_accounts
     SET role = 'ADVISER', updated_at = CURRENT_TIMESTAMP
   WHERE normalized_email = 'udajoedu@gmail.com'
     AND status = 'ACTIVE';
  GET DIAGNOSTICS changed_rows = ROW_COUNT;
  IF changed_rows <> 1 THEN
    RAISE EXCEPTION 'Expected exactly one active adviser account, changed %', changed_rows;
  END IF;
END $$;
COMMIT;
SELECT id, status, email_verified_at, role FROM user_accounts
WHERE normalized_email = 'udajoedu@gmail.com';
SQL
```

Require the final role to be `ADVISER`. Sign in again through the normal login page so the stored role is loaded into a new session. Registration never allows role selection; ordinary account features must still work. The shared account identifies the account in audits, not the individual staff member; record the smoke operator separately in the release record.

## 5. Privacy-safe access and workflow smoke

Use three isolated browser profiles: anonymous, an ordinary verified `USER`, and the promoted adviser. Keep credentials in the normal login UI. Browser DevTools may inspect responses locally, but do not export HAR files, use “Copy as cURL”, persist cookies, or paste consultation bodies into the release record. Use only synthetic data for smoke queries and the dedicated enquiry, since search text is present in the browser URL.

Create exactly one dedicated synthetic consultation through the public consented form. Mark its name/contact/notes as release-test data, use an operator-controlled test contact, record its UUID privately and its UTC creation interval for the reviewed cleanup. Never select a real student's enquiry as the test. If public submission is deliberately disabled, confirm its unavailable state and stop this acceptance check until a separately approved dedicated fixture is available; do not bypass consent or enable collection solely for smoke.

| Identity/check | Expected outcome |
| --- | --- |
| Anonymous `GET /api/v1/adviser/consultations?page=0&size=1` | 401, no consultation payload. Adviser page redirects to same-locale login with a safe relative return path. |
| Ordinary user list and dedicated UUID detail GET | 403, no consultation payload; both localised adviser pages show the access-denied destination. |
| Anonymous/ordinary status PATCH with otherwise valid CSRF | Rejected with no data or state change; normal security/CSRF rules remain enforced. |
| Adviser `/zh/adviser/consultations` and `/en/adviser/consultations` | Correct signed-in identity, noindex/nofollow, absent from public navigation/sitemap; ordinary account access retained. |
| Adviser list, synthetic name/contact/UUID search, status filter and pagination | 200; newest first, matching total count, distinct zero-result state, filter resets page one and browser navigation restores filters. Search only synthetic strings. |
| Adviser dedicated UUID detail | 200; all synthetic submission fields, locale, privacy version, timestamps, reference, updater and version visible and immutable. List/detail/PATCH responses have private no-store cache protection. |
| Adviser dedicated record `NEW → IN_PROGRESS → COMPLETED` through UI | Each PATCH 200 with the loaded version, version increments once, counts and list refresh, success/pending feedback is clear; submitted content remains unchanged. |
| Two adviser tabs loaded at the same version | After first tab updates, second stale PATCH receives 409; current detail remains visible and controls lock until reload. The conflict notice reports reloading while pending, asks staff to review the latest record after success, or asks staff to retry loading details after failure. Verify the loaded version and control state; failed reloads keep updates locked. |
| Invalid enum/reference/oversized search/page, unknown valid UUID, PATCH without CSRF | Validation 400, unknown detail 404, missing CSRF 403; never an empty success list or sensitive error. Perform malformed/security cases in the isolated rehearsal; do not introduce student data into requests. |
| Mobile, keyboard, retry, delayed responses | At 375px list/details wrap without horizontal overflow; visible focus and readable contacts; errors differ from empty results; retry recovers and superseded requests cannot replace newer results. Rehearse simulated outage/latency locally, without disrupting production. |

For an anonymous API check, this command intentionally sends no cookies or authorization and discards the body; require output `401`:

```bash
curl --silent --show-error --connect-timeout 10 --max-time 30 --output /dev/null --write-out '%{http_code}\n' 'https://yangdoujiao.com/api/v1/adviser/consultations?page=0&size=1'
```

For authenticated checks use the browser Network panel to confirm HTTP status, cache headers and `X-Trace-Id`. The app obtains fresh CSRF using `/api/v1/auth/csrf` and sends `{status, version}` on PATCH; do not extract or log its token. Record only status, reference hash, version, workflow state and trace ID as necessary for acceptance.

## 6. Inspect logs by trace ID without consultation contents

For a dedicated test PATCH copy only the response's `X-Trace-Id` into this prompt. The audit logger hashes its exact UTF-8 bytes with SHA-256 (no trailing newline); do not search logs by name, contact or notes. The command filters before displaying and emits only allow-listed audit fields, leaving raw log lines out of terminal output.

```bash
read -r -p 'Dedicated test X-Trace-Id: ' adviser_trace_id
adviser_trace_hash="$(printf '%s' "$adviser_trace_id" | sha256sum | cut -d ' ' -f 1)"
docker compose --env-file .env.production -f compose.production.yaml logs --no-color --since=30m backend 2>&1 \
  | awk -v trace="traceId=sha256:$adviser_trace_hash" '
    index($0, "event=consultation_status_update") && index($0, trace) {
      for (i = 1; i <= NF; i++)
        if ($i ~ /^(event|outcome|actorId|referenceHash|priorStatus|newStatus|traceId)=/) printf "%s ", $i;
      printf "\n";
    }'
unset adviser_trace_id adviser_trace_hash
```

Require `SUCCEEDED` for each committed test update, expected actor ID/reference hash, prior/new statuses and hashed trace. Record the matching request's UTC time separately; standard log timestamps are present in restricted raw logs. Rejected/stale requests must have the expected rejection/conflict outcome. Audit/exception privacy assertions (`ConsultationAuditLoggerTest`, `AdviserConsultationStatusHttpIntegrationTest`, `GlobalExceptionHandlerTest`) must pass in CI; approved staff can inspect restricted raw logs in place to check for unexpected content, but never print full request/body/query logs or share raw logs. Names, contacts, intended study information, notes, secrets and unhashed attacker-controlled path/trace identifiers must be absent. Review the workflow's existing failure diagnostics as restricted operational data.

## 7. Reviewed cleanup of only the dedicated test enquiry

There is no delete/export control in the adviser application. After acceptance, an authorised operator may remove the dedicated synthetic row using a separately reviewed SQL command. Replace the impossible zero UUID with the recorded test UUID only after reviewing its synthetic provenance and creation time. Inspect only identifiers/workflow metadata first; never use a broad status/contact predicate or `RETURNING *`. The zero UUID is deliberately fail-closed.

```bash
docker compose --env-file .env.production -f compose.production.yaml exec -T postgres sh -c 'psql -X -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB"' <<'SQL'
SELECT id, reference_code, created_at, status, version FROM consultation_enquiries
WHERE reference_code = '00000000-0000-0000-0000-000000000000'::uuid;
SQL
```

Require exactly one row matching the privately recorded dedicated fixture. Review the exact substituted command and expected UUID/creation metadata before deletion. This is irreversible deletion of the synthetic row; backups follow existing retention rules.

```bash
docker compose --env-file .env.production -f compose.production.yaml exec -T postgres sh -c 'psql -X -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB"' <<'SQL'
BEGIN;
DO $$
DECLARE changed_rows integer;
BEGIN
  DELETE FROM consultation_enquiries
   WHERE reference_code = '00000000-0000-0000-0000-000000000000'::uuid;
  GET DIAGNOSTICS changed_rows = ROW_COUNT;
  IF changed_rows <> 1 THEN
    RAISE EXCEPTION 'Expected exactly one reviewed synthetic test enquiry, changed %', changed_rows;
  END IF;
END $$;
COMMIT;
SELECT count(*) AS remaining_test_rows FROM consultation_enquiries
WHERE reference_code = '00000000-0000-0000-0000-000000000000'::uuid;
SQL
```

Require `remaining_test_rows = 0`, record the cleanup outcome without contents and verify surrounding list/count behaviour. Do not delete accounts or audit history.

## 8. Role and application rollback

If acceptance fails, pause adviser use and follow the approved incident process. A role rollback and application-image rollback are separate actions. Before demotion repeat the exact-email read-only checks in section 3; require one active, email-verified `ADVISER` account. This transaction locks that account, demotes exactly one row and revokes every persisted session for its exact `user:<id>` principal. Revocation is necessary because existing sessions carry the previously loaded authority; merely changing the database role or signing out one browser is insufficient.

```bash
docker compose --env-file .env.production -f compose.production.yaml exec -T postgres sh -c 'psql -X -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB"' <<'SQL'
BEGIN;
DO $$
DECLARE target_rows integer;
BEGIN
  PERFORM id FROM user_accounts
   WHERE normalized_email = 'udajoedu@gmail.com' FOR UPDATE;
  SELECT count(*) INTO target_rows FROM user_accounts
   WHERE normalized_email = 'udajoedu@gmail.com'
     AND status = 'ACTIVE' AND email_verified_at IS NOT NULL AND role = 'ADVISER';
  IF target_rows <> 1 THEN
    RAISE EXCEPTION 'Expected exactly one verified active ADVISER account, found %', target_rows;
  END IF;
END $$;
DO $$
DECLARE changed_rows integer;
BEGIN
  UPDATE user_accounts
     SET role = 'USER', updated_at = CURRENT_TIMESTAMP
   WHERE normalized_email = 'udajoedu@gmail.com'
     AND status = 'ACTIVE';
  GET DIAGNOSTICS changed_rows = ROW_COUNT;
  IF changed_rows <> 1 THEN
    RAISE EXCEPTION 'Expected exactly one active account for rollback, changed %', changed_rows;
  END IF;
END $$;
DELETE FROM spring_session WHERE principal_name = (
  SELECT 'user:' || id::text FROM user_accounts
  WHERE normalized_email = 'udajoedu@gmail.com' AND status = 'ACTIVE'
);
COMMIT;
SELECT id, status, email_verified_at, role FROM user_accounts
WHERE normalized_email = 'udajoedu@gmail.com';
SELECT count(*) AS remaining_target_sessions FROM spring_session WHERE principal_name = (
  SELECT 'user:' || id::text FROM user_accounts
  WHERE normalized_email = 'udajoedu@gmail.com' AND status = 'ACTIVE'
);
SQL
```

Pause requests during revocation and verify `remaining_target_sessions = 0`; already in-flight requests may have authenticated before revocation. Confirm all former adviser profiles lose access, then sign in again and require 403 from adviser list/detail/status (valid CSRF), with ordinary account access retained. Do not change other users' roles or clear all sessions.

For application recovery use the retained images and exact commands in [DEPLOYMENT.md](../DEPLOYMENT.md#update-and-application-rollback), only after validating compatibility with V12. The previous `NEW`-only application may not understand `IN_PROGRESS`/`COMPLETED`; do not revert images blindly, rewrite genuine workflow data or drop V12 columns/Flyway history. Prefer a reviewed forward fix; database restoration requires a rehearsed, separately approved recovery plan under [BACKUP_AND_RESTORE.md](../BACKUP_AND_RESTORE.md). Never delete named volumes. Repeat health, credential-free launch smoke and the anonymous/user checks after recovery. Production acceptance remains pending until the merged release is deployed and the verified `udajoedu@gmail.com` adviser smoke succeeds.
