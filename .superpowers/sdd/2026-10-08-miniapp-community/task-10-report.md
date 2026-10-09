# Task 10 release instrumentation and verification report

Date: 2026-10-09, Asia/Kuala_Lumpur. Branch: `feat/miniapp-community-foundation`. Starting commit: `21da4cc`. Required commit message: `docs: complete community release verification`.

## Scope and implementation

Read the Task 10 brief, complete community design specification, Task 10 plan, repository instructions, existing community services/controllers/properties/tests, Micrometer dependency/configuration, production Compose and environment examples, deployment runbook and miniapp README. Applied TDD, systematic debugging and verification-before-completion. No subagents were dispatched, as explicitly required; review below is a self-review. No deployment, publishing, push or PR action was performed.

`CommunityMetrics` is an injected application component, with an optional-provider MVC adapter in `CommunityMetricsWebConfiguration`. The full application registers the adapter on real community and Adviser-community HTTP routes. MVC-only slices intentionally omit the database/registry component; the existing catalog and search controller tests verify their real responses still work. There is no unused metrics facade.

- HTTP completion records `community.feed`, `community.detail`, `community.publish`, `community.comment`, and additional bounded endpoint timers, plus `community.results`. It measures through MVC completion after transaction/service execution and serialization; security-filter rejections before MVC remain outside these custom timers.
- Label vocabulary is closed: only endpoint, sort, command and stable outcome. Invalid sort values collapse to `invalid`. No account/user/target identifiers, body, note, address, cursor, key, token or identity becomes a metric tag or new log field.
- Real Redis budget execution records `community.rate.limited` and `community.redis.unavailable` for post/comment/report failures, including null Redis results. Hot-feed Redis data-access failures also emit the unavailable signal. The author deletion cache-invalidation failure callback has a bounded `cache_invalidation` signal.
- Real persisted receipt paths record `community.idempotency.hits` for post, comment and report. A fresh key for an existing OPEN report is not counted as a receipt replay.
- `community.moderation.backlog` queries PostgreSQL pending content or targets with OPEN reports and counts each target once. `community.moderation.oldest.age` uses the earlier pending-review creation time or OPEN-report creation time, not an old published post's publication age. Empty queues return zero; database query failure returns NaN.
- The four core timers enable aggregatable histograms. Client percentile gauges were removed after tests caught Micrometer's additional `phi` label; application meter labels remain within the required vocabulary. P50/P95/P99 calculation requires an internal histogram-capable exporter, which is an operator prerequisite, not claimed installed here.

Constructor-only updates to existing cache tests supply a metrics double while their original real cache/read/concurrency assertions remain intact. The stale V3 migration compatibility assertion was updated from V14 to V15, because Task 3 already introduced V15. This changes no migration or application behavior; populated legacy migration compatibility passed afterward.

## TDD evidence and intermediate failures

All Maven commands below ran from `backend/`, using isolated Docker Testcontainers where needed. `DOCKER_AUTH_CONFIG='{"auths":{}}'` is a process-local workaround already used in prior tasks, not a change to user credentials.

| Command / local log | Exit / observed result |
| --- | --- |
| `./mvnw -Dtest=CommunityMetricsIntegrationTest test` → `/private/tmp/community-task10-red.log` | Exit 1 after stopping only stalled test JVM 83826; fork exit 143. Spring class scanning blocked reading generated `AdviserConsultationPage 2.class`; identified with `jcmd Thread.print` and `lsof`. This was not counted as feature RED. |
| `DOCKER_AUTH_CONFIG='{"auths":{}}' ./mvnw clean -Dtest=CommunityMetricsIntegrationTest test` → `community-task10-red-clean.log` | Exit 1; 3 tests, 2 assertion failures, 1 missing-meter error, 0 skips. Real 201/200 publish requests expected timer count 2, got 0; real limiter rejection expected counter 1, got 0. These behavioral failures established RED before production metrics code. |
| `DOCKER_AUTH_CONFIG='{"auths":{}}' ./mvnw -Dtest=CommunityMetricsIntegrationTest test` → `community-task10-green.log` | Exit 1; 3 tests, 2 failures, 0 errors/skips. Instrumentation worked, but client percentiles introduced `phi` labels and transaction timestamp precision yielded 3599.997 seconds. Removed client percentiles and used a one-second clock tolerance. |
| Same focused command → `community-task10-green2.log` | Exit 0; 3 tests, 0 failures/errors/skips. |
| Same focused command, with new hot Redis signal test → `community-task10-hot-red.log` | Exit 1; 4 tests, 1 failure, 0 errors/skips: hot Redis signal expected 1, got 0. Hooked the actual cache failure path afterward. |
| `DOCKER_AUTH_CONFIG='{"auths":{}}' ./mvnw test` → `community-task10-backend-full.log` | Exit 1; 766 tests, 1 failure, 5 errors, 0 skips. Four metrics tests passed. Errors identified MVC-only registry dependency; the failure was the stale V14 expectation versus actual V15. |
| `DOCKER_AUTH_CONFIG='{"auths":{}}' ./mvnw -Dtest=CommunityMetricsIntegrationTest,FilterOptionsControllerTest,UniversitySearchV1ControllerTest test` → `community-task10-age-red.log` | Exit 1; 10 tests, 1 failure, 5 errors, 0 skips. New report-age test expected 0–2 seconds but got ~31,536,000. The first adapter split still included a HandlerInterceptor in MVC slices. Corrected the PostgreSQL age expression and made metrics an ordinary component, with an anonymous adapter supplied only if metrics exist. |
| `DOCKER_AUTH_CONFIG='{"auths":{}}' ./mvnw test` → `community-task10-backend-full2.log` | Exit 1; 767 tests, 0 failures, 5 MVC-slice errors, 0 skips. This run compiled before the final anonymous-adapter correction. |
| `DOCKER_AUTH_CONFIG='{"auths":{}}' ./mvnw -Dtest=CommunityMetricsIntegrationTest,FilterOptionsControllerTest,UniversitySearchV1ControllerTest,V3MigrationCompatibilityTest test` → `community-task10-focused-green.log` | Exit 0; 11 tests, 0 failures/errors/skips: 5 metrics, 5 existing MVC response tests and 1 real populated V1–V15 migration test. |
| `node --test backend/src/test/k6/community-capacity.test.mjs` before script implementation → `community-task10-k6-red.log` | Exit 1; all 5 execution contracts failed because the artifact did not yet exist (ENOENT). |
| Same Node command after implementation → `community-task10-k6-green.log`, and final `community-task10-k6-final.log` | Exit 0; 5 tests, 0 failures/skips. Executes the actual script in a VM with only k6/file/network boundaries substituted; not source-grep assertions. |
| `COMMUNITY_SEED_FIXTURE=/private/tmp/community-task10-seed-fixture.json node --test backend/src/test/k6/community-capacity.test.mjs` → `community-task10-k6-seeded-contract.log` | Exit 1; 4 passes, 1 test-fixture assumption failure. Corrected a hardcoded `/posts/1` expectation to test the detail route for any seeded ID. |
| Same seeded-fixture command → `community-task10-k6-seeded-contract-green.log` | Exit 0; all 5 actual-artifact contracts pass against the real SQL-generated fixture. |

The metrics tests exercise real HTTP publish/replay/detail/feed/comment/report, real rate-limiter behavior, real PostgreSQL pending targets with multiple reports, and Redis boundary failures. Removing request wiring, replay/rate/Redis hooks or deduplication/age semantics makes meaningful assertions fail.

## Capacity artifact and safety validation

`backend/src/test/k6/community-capacity.js` preserves the exact two scenarios and thresholds from the plan:

```js
scenarios: {
  reads: { executor: 'constant-arrival-rate', rate: 100, timeUnit: '1s', duration: '10m', preAllocatedVUs: 400, maxVUs: 500 },
  writes: { executor: 'constant-arrival-rate', rate: 20, timeUnit: '1s', duration: '10m', preAllocatedVUs: 100, maxVUs: 200 },
},
thresholds: { http_req_failed: ['rate<0.01'], http_req_duration: ['p(95)<500', 'p(99)<1000'] },
```

Read mix: 40% latest, 30% hot, 20% detail, 10% comment reads. Write mix: 40% comment, 40% like, 20% post. It rotates the 5,000 synthetic accounts, supplies unique valid <=64-character POST idempotency keys, and uses stable URL template labels. Preallocated VUs total 500; maximum VUs total 700. Those configured counts do not prove 500 simultaneous in-flight requests.

Safety gates: exact loopback target `http://127.0.0.1:18080`, explicit isolated acknowledgement, fixture marker/run ID/base URL, exactly 5,000 distinct synthetic accounts/credentials, valid seeded post IDs, and a read-only sentinel match before any write. Redirects are disabled on every request. A SharedArray holds credentials without retaining the per-VU source credential array. No production host or arbitrary remote URL is accepted. Never run this profile through a production tunnel or against real data.

Validation commands and outcomes:

- `command -v k6`: exit 1; k6 unavailable. No `k6 run` or real capacity profile was executed; no capacity throughput/latency claim is made.
- `node --check backend/src/test/k6/community-capacity.js`: exit 0.
- `docker compose -p community-load-test -f backend/src/test/k6/compose.load-test.yaml config --quiet`: exit 0.
- Created only disposable container `community-task10-seed-validation` from cached `postgres:17.11`, with user/database `community_load_test`, no published ports. `docker exec ... pg_isready`: exit 0.
- Applied every V1–V15 SQL migration, ordered by `rg --files backend/src/main/resources/db/migration | sort -V`, through `docker exec -i ... psql -v ON_ERROR_STOP=1 -U community_load_test -d community_load_test`: exit 0 (`community-task10-seed-migrations.log`). This validates real schema compatibility, not a fake schema.
- `docker exec -i community-task10-seed-validation psql -U community_load_test -d postgres -f /dev/stdin < backend/src/test/k6/community-seed.sql`: exit 3 before writes; wrong-database guard (`community-task10-seed-wrongdb.log`).
- Same seed command with `-d community_load_test`: exit 0; creates only synthetic data (`community-task10-seed-valid.log`).
- Repeating that same seed command: exit 3; non-empty guard preserves existing fixture rows (`community-task10-seed-nonempty.log`).
- Read-only row counts returned exactly `5000|5000|1000|1000` for accounts/tokens/posts/comments; contact-field count was `0`, exit 0. The private temp fixture was copied with `docker cp`, mode 600, and used in offline contracts; raw credentials were not printed or committed.
- `docker stop community-task10-seed-validation` and `docker rm community-task10-seed-validation`: exit 0. Only this disposable synthetic container was removed; no user/production container, database or volume was altered. The seed is reproducible from the guarded script.

`compose.load-test.yaml` is isolated from production Compose and binds only local ports 55432/56379/19200. Exact dependency/application/seed/fixture/k6 commands are in `docs/DEPLOYMENT.md`; startup disables `.env` import and real WeChat calls, trusts only loopback in that isolated instance, and retains production-default community quotas. The startup/k6 application profile and fault-injection capacity scenarios were documented, not executed here.

## Secret/placeholder scan

Executed from repository root (exit 0, four matches):

```bash
rg -n "TO[D]O|TB[D]|session_key|APP_MINIAPP_WECHAT_APP_SECRET=.+|openid|reporterNote|postBody" \
  backend/src/main backend/src/test/k6 frontend/src miniapp/miniprogram .env.example compose.production.yaml
```

Every match and nearby implementation was inspected:

1. `frontend/src/lib/login-auth-ui.test.ts:250`: privacy assertion rejecting provider identity fields in account UI, approved test assertion.
2. `backend/src/main/java/com/yangdoujiao/website/auth/wechat/WechatOpenPlatformClient.java:65`: required provider response field name, not a fixture or log/tag value.
3. Same file, line 86: required provider protocol parameter name for the outbound WeChat profile call, not telemetry.
4. `backend/src/main/java/com/yangdoujiao/website/auth/miniapp/WechatMiniappClient.java:56`: required provider response field name, not a fixture or log/tag value.

No unfinished markers, non-empty miniapp secrets, personal fixtures or content-bearing telemetry fields were found by this scan. A supplementary scan of new load artifacts, production example and changed docs found only the existing README warning prohibiting `session_key` logging. Synthetic fixture credentials remain outside Git. This is the prescribed scoped scan, not a claim of an exhaustive security audit.

## Complete release suite

Environment: Java 21.0.12.1+1-LTS, Node 24.21.0, Spring Boot 4.0.5. Docker availability check first failed under sandbox (exit 1), then approved read-only check returned Docker 29.4.3 (exit 0). No automatic approval review rejection occurred.

| Command / log | Exact result |
| --- | --- |
| `DOCKER_AUTH_CONFIG='{"auths":{}}' ./mvnw test` → `community-task10-backend-final.log` | Default final attempt exited 1 after targeted termination of stalled JVM 88447 (fork exit 143). 757 completed tests, 0 failures/errors/skips; remaining tests incomplete. Default command is not claimed passing. |
| `DOCKER_AUTH_CONFIG='{"auths":{}}' ./mvnw -DargLine=-Djdk.virtualThreadScheduler.parallelism=32 test` → `community-task10-backend-final-scheduler.log` | Exit 0; 767 tests, 0 failures/errors/skips, BUILD SUCCESS, 1:14 minutes, finished 2026-10-09 11:19:51 +08:00. Test-only JVM scheduler setting; no production/application scheduling change. |
| `cd frontend && npm ci` → `community-task10-frontend-ci.log` | Exit 0; 424 packages installed. Existing ESLint deprecation and uncovered install-script policy warnings noted. |
| `cd frontend && npm test` → `community-task10-frontend-test.log` | Exit 0; 267 tests across ten invoked groups, 267 pass, 0 failures/skips. |
| `cd frontend && npm run lint` → `community-task10-frontend-lint.log` | Exit 0; no lint errors. |
| `cd frontend && npm run build` → `community-task10-frontend-build.log` | Exit 0; Next 16.3.5 optimized build, TypeScript and generated pages complete. |
| `cd miniapp && npm ci` → `community-task10-miniapp-ci.log` | Exit 0; 115 packages installed. Existing ESLint deprecation and esbuild/fsevents install-script policy warnings noted. |
| `cd miniapp && npm run check` under sandbox → `community-task10-miniapp-check.log` | Exit 1 before tests: tsx local IPC socket listen EPERM. Not counted as application failure. |
| `cd miniapp && npm run check` with approved test IPC → `community-task10-miniapp-check-approved.log` | Exit 0; 143 tests, 143 pass, 0 failures/skips; TypeScript and zero-warning lint pass. |
| `git diff --check` | Exit 0. |

The default full-run stall was investigated with `jcmd Thread.print` and `Thread.dump_to_file -format=json` including virtual workers (`community-task10-final-thread-dump.log`, `community-task10-virtual-threads.json`). Main was blocked on MVC's ConcurrentHashMap reservation; simultaneous first controller initialization pinned Java 21 virtual workers while annotation-cache lock waiters could not progress, before community service execution. Earlier complete runs reached this same test. Only the stalled test JVM was stopped; a 32-carrier scheduler setting was used solely for verification. Logs are temporary local evidence and may contain test operational details; do not publish raw logs indiscriminately.

## Documentation, remaining release work and self-review

Updated the existing `docs/DEPLOYMENT.md` (canonical uppercase filename), miniapp README and safe production environment example. The runbook documents actual defaults/bounds and flags, fail-closed Redis writes and saved-receipt behavior, moderation count/age monitoring and NaN handling, 45-second cache snapshots/current-pointer invalidation, exact guarded local capacity commands, approved policy/config prerequisites and rollback by disabling writes. Reads and Adviser moderation continue; evidence is never dropped/truncated or erased through Redis clearing/volume deletion.

Not executed: WeChat DevTools import; physical device latest/hot/detail/publish/comment/like/report/personal content/login expiry/weak network/safe area/large font; browser/manual Adviser hide/restore/reject/mute/ban/version conflict; live 10-minute k6 profile; capacity Redis/slow-query/idempotency/concurrent-Adviser fault injection; production monitoring exporter/alert connectivity; deployment or rollback on production. These are release prerequisites, not completed items. Production Actuator remains health-only; the repository has no production metrics collector configured. Operators must connect the private registry/exporter and set backlog/age alerts before rollout, and provide approved WeChat credentials, shared cursor secret, policy terms, privacy/retention policy and on-call ownership.

Self-review checked the plan's exact scenarios/thresholds, synthetic-only seed/refusal paths, status-based metric outcome bounds, no request identifiers/content in tags, transactional/PostgreSQL business authority, MVC-slice compatibility, one-line V15 test maintenance, safe feature rollback and unchanged existing service decisions. No new dependencies, public monitoring endpoints, production flags enabled, unrelated business behavior, deployment/publish/push/PR or child-agent dispatch were introduced. Capacity throughput, percentile latency and manual UX remain unproven. Queue aggregates execute at observation time; their production scrape frequency/query cost must be assessed during the outstanding capacity/monitoring acceptance.

## Final verification outcome

DONE_WITH_CONCERNS. Backend full suite passed 767/767 with the disclosed test-only scheduler setting; frontend 267/267 plus lint/build, miniapp 143/143 plus typecheck/lint, k6 syntax and 5/5 offline execution contracts all passed. Real V1–V15 migrations and isolated 5,000-account seeding/refusal guards passed. Prescribed scan matches were all inspected and approved; final diff whitespace check passed.

Remaining concerns: the exact default backend command stalled under Java 21 virtual-thread initialization and was terminated; no live k6/manual DevTools/device/Adviser acceptance or production metrics/alert connectivity was executed. These limitations prevent a production-release/capacity acceptance claim. Intended Task 10 source, tests, guarded load artifacts, documentation and this report are committed together with the required message; no push or PR follows.

## Task 10 review fix round 1 — three Important findings

Scope: only the capacity artifact, its behavioral contracts, seed safety, and matching operator documentation. No deferred Minor finding, backend business behavior, metrics wiring, migration, frontend or miniapp application code changed. The receiving-code-review, test-driven-development and verification-before-completion workflows guided reproduction and verification; no child agents were dispatched.

### RED before implementation

- `node --test backend/src/test/k6/community-capacity.test.mjs > /private/tmp/community-task10-fix1-k6-red.log 2>&1`: exit 1, 7 tests, 5 pass/2 fail. Running the actual script in two independent VM executions with the same fixture and identical normal VU assignment produced 7,200 reused POST keys instead of zero. The full 12,000-write profile had zero multi-operation accounts instead of at least 3,500. HTTP and k6 runtime boundaries alone are replaced; these are behavioral executions, not source-grep assertions.
- `node --test backend/src/test/k6/community-seed.test.mjs > /private/tmp/community-task10-fix1-seed-red.log 2>&1`: exit 1, 6 tests, 2 pass/4 fail. Two initial cases encountered the PostgreSQL image's temporary initialization socket rather than the final server; readiness was corrected to TCP on the container's loopback. This bootstrap failure was not used as proof of the consultation bug.
- Repeated the same command to `community-task10-fix1-seed-red-ready.log`: exit 1, 6 tests, 2 pass/4 meaningful failures. Consultation-only data, catalog-only data, an unknown empty future business table, and a missing business table were all incorrectly accepted (psql exit 0 instead of refusal exit 3). Every case executed the real SQL after all V1–V15 migrations in a newly owned disposable PostgreSQL 17.11 container, without published ports or any external database target.

### Minimal fixes and GREEN

1. `setup()` generates 16 cryptographically random bytes, converts them to a 32-character hex execution nonce, and returns it once for all VUs. POST keys combine this nonce with the writes scenario's globally unique iteration in base 36; persistent fixture run IDs and per-VU assignment cannot repeat keys across executions. Every observed key satisfies the existing allowed-character/64-character limit. A separate VU VM also consumes the same setup result. The official [k6 randomBytes API](https://grafana.com/docs/k6/latest/javascript-api/k6-crypto/randombytes/) and [setup lifecycle](https://grafana.com/docs/k6/latest/using-k6/test-lifecycle/) were checked for this runtime boundary; live k6 itself remains unavailable.
2. Accounts rotate independently from balanced ten-request command blocks; account laps change the operation rotation. Targets use separate per-operation ordinals and a coprime stride through the 1,000 seeded posts. Exact options and percentages remain unchanged. The actual full-profile VM execution reports 5,000 participating write accounts, 4,400 multi-operation accounts, 1,000 comment targets, 1,000 like targets, and all 4,800 like account/target pairs unique (zero duplicate-like pairs in one fresh profile). The 60,000-read profile retains 24,000 latest /18,000 hot /12,000 detail /6,000 comment reads; all 1,000 comment targets are covered and all 6,000 comment reads sample threads that receive comment writes. Both executions produce 7,200 individually unique POST keys each and zero cross-execution reuse.
3. The seed explicitly classifies all 28 current V1–V15 business tables, including independent catalogue, enquiries, content, authentication/session, search and community tables. Every table must exist and be empty. Only `public.flyway_schema_history` is allowed as persistent bootstrap/migration metadata; unclassified public tables fail closed even if empty. Refusals precede all seeding inside the transaction. The real SQL tests verify preserved consultation/catalog rows with zero seeded accounts on refusal, incomplete/future schema refusal, wrong-database refusal, migration metadata acceptance, exactly 5,000 accounts/access tokens and 1,000 posts/comments with zero enquiries on a fresh seed, distinct synthetic credentials, and repeat-seed refusal without account changes. Containers and synthetic credential files inside them were removed by test cleanup; no production/user data was accessed or removed.

### Exact round verification

Commands below were run from the repository root; logs are local temporary evidence without credential dumps.

| Command / log | Result |
| --- | --- |
| `node --test --test-name-pattern='two executions' backend/src/test/k6/community-capacity.test.mjs` → `community-task10-fix1-nonce-green.log` | Exit 0; 1 focused test pass, 0 failures/skips, before distribution implementation. |
| `node --test backend/src/test/k6/community-capacity.test.mjs` → `community-task10-fix1-k6-green.log` | Exit 0; 7/7 pass after distribution implementation. The additional-VU assertion was changed to locate a POST within a full balanced block rather than assume iteration 12,000 is a POST. |
| Same command with aggregate diagnostics → `community-task10-fix1-k6-green-final.log` | Exit 0; 7/7 pass, 0 failures/skips; aggregate values recorded above. |
| `COMMUNITY_SEED_FIXTURE=/private/tmp/community-task10-seed-fixture.json node --test backend/src/test/k6/community-capacity.test.mjs` → `community-task10-fix1-k6-real-fixture.log` | Exit 0; 7/7 pass using the original real isolated SQL-produced 5,000-account fixture, including the two-execution test. No credential output. |
| `node --test backend/src/test/k6/community-seed.test.mjs` → `community-task10-fix1-seed-green.log` | Exit 0; 6/6 pass, 0 failures/skips against real PostgreSQL 17.11 and V1–V15 SQL. |
| `node --test backend/src/test/k6/community-capacity.test.mjs backend/src/test/k6/community-seed.test.mjs` → `community-task10-fix1-contracts-final.log` | Exit 0; final combined 13/13 pass, 0 failures/errors/skips, including actual owned PostgreSQL container setup/cleanup. |
| `node --check backend/src/test/k6/community-capacity.js && node --check backend/src/test/k6/community-capacity.test.mjs && node --check backend/src/test/k6/community-seed.test.mjs && git diff --check` | Exit 0; all three syntax checks and whitespace check succeeded. |
| `docker compose -p community-load-test -f backend/src/test/k6/compose.load-test.yaml config --quiet` | Exit 0. No service started by this check. |
| `docker ps -a --filter name=community-seed-contract- --format '{{.Names}}'` | Exit 0, no output; test-owned containers cleaned up. |
| Required exact secret/placeholder `rg` command from the brief | Exit 0, exactly the same four approved matches. All four contexts re-inspected: frontend privacy absence assertion (line 250), WeChat miniapp response protocol field (line 56), Open Platform response protocol field (line 65), and required outbound provider parameter (line 86). No secret, content tag, personal fixture or unfinished marker. |
| `command -v k6` | Exit 1; no executable available. Live 10-minute capacity run NOT RUN. No production load test. |

Broader backend/frontend/miniapp suites were not rerun for this artifact-only fix round: Java, runtime configuration, migrations and all application/UI code are unchanged. Their previously recorded complete results and disclosed default Java 21 test-run blocker remain above; this round does not upgrade those claims. Manual DevTools/device/Adviser acceptance, live capacity/fault injection and production metric/alert connectivity remain NOT RUN.

Documentation now states the exact 28-table emptiness policy, sole metadata exception, unknown/missing schema refusal, safe self-owned seed-contract command, execution-wide nonce behavior, decoupled rotations and fresh-isolated-fixture requirement for a full capacity rerun (prior likes persist). Self-review checked actual execution rather than grepping implementation, all option values/mix unchanged, <=64-character keys, no content/credential output, transaction-safe seed refusal, owned-container cleanup and unchanged production authority. The round remains DONE_WITH_CONCERNS solely because live capacity/manual release evidence is still unavailable; the three Important findings are fixed and covered.
