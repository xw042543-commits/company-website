# Community final-review fix wave — 2026-10-09

Base: `eb93de5`, branch `feat/miniapp-community-foundation`.

Preflight `git status --short` produced no output. Branch and HEAD matched the delegated task. Read the binding design specification (including §9.2), implementation plan, progress ledger, repository instructions, affected production code and tests. Applied receiving-code-review, systematic-debugging, test-driven-development and verification-before-completion workflows. No subagents, push, merge, deployment or external messages were used in this wave.

## Five Important findings addressed

1. **Automatic moderation history.** `ModerationHistoryCommand` and history allowlists now accept `AUTO_HIDE` / `REPORT_THRESHOLD` independently of the manual submission allowlists. Manual commands remain HIDE, RESTORE, REJECT_REPORT, MUTE and BAN; automatic commands/reasons are rejected before acquiring CSRF. The actual moderation panel uses fixed bilingual event/reason labels with safe unknown fallbacks. `backend/src/test/resources/community/automatic-hide-detail.json` is shared by frontend contract/UI tests and checked against a real threshold-triggered backend detail response, normalizing only generated target/action IDs and event time. The actual response version is 2, which the fixture preserves.
2. **Authoritative moderation versions.** A successful exact, target-matched detail response is accepted only when its safe integer version is strictly greater than the submitted version. Stale/equal/regressed/unsafe versions and mismatched targets still fail; HTTP 409 retains the existing conflict path. Real PostgreSQL integration coverage hides/restores a post with a published comment, checks reconciled counts, verifies the response matches the persisted version and advances by more than one, and rejects a stale restore. Frontend coverage follows hide with restore using the returned version.
3. **Comment submission lifecycle.** Confirmed success resets only the comment submission state to a fresh state. In-flight duplicate clicks remain blocked, uncertain retries retain the original key, and a second intentional identical confirmed comment gets a new key. The lifecycle test covers both PUBLISHED and PENDING_REVIEW success receipts. The failed-submission path and other submission flows are unchanged.
4. **Existing Adviser entry navigation.** The consultations server entry now renders the existing shared `adviserNavigation(locale)` items with the existing responsive navigation classes, accessible label, and correct current tab. No header, panel, authentication, CSS or consultation data-flow refactor was needed. The regression executes the actual TSX server page for both locales and checks the navigation links/current state and retained console header; only the unrelated data-fetching client panel is substituted at its import boundary.
5. **Public unavailable post states.** Public detail preserves HTTP 404 and the existing safe error envelope while returning `COMMUNITY_POST_HIDDEN`, `COMMUNITY_POST_DELETED`, or `COMMUNITY_POST_NOT_FOUND`. Pending/rejected content remains indistinguishable from missing content. The status check occurs before profile, reactions or content DTO creation. Anonymous and author detail responses contain only the four safe error-envelope fields, never body, account/profile or moderation information. Comment-thread behavior remains unchanged. The miniapp allowlists only the proper 404/code pairs, uses distinct fixed state copy, hides the thread/composer UI for unavailable posts, clears previously loaded content, and invalidates late comment/reply reads so they cannot repopulate an unavailable thread. An already-open report sheet remains available, preserving the existing supported hidden-target report flow.

## RED evidence before production changes

Commands are relative to the named package unless otherwise stated.

| Scope / command | Observed failure |
| --- | --- |
| Frontend: `node --test src/lib/adviser-community-api.test.ts src/lib/adviser-community-ui.test.ts` | Exit 1, 27 passed / 3 failed. Real automatic-hide payload returned `error` rather than `ready` in contract and UI tests; hide response advancing version 3 → 5 returned `error`. |
| Miniapp: `node --import tsx --test --test-name-pattern='confirmed identical' tests/community-page-lifecycle.test.ts` | Exit 1, one failed. Two intentional identical comments retained `comment-1` after confirmed success; in-flight/failed retry assertions before it passed. |
| Frontend: `node --test --test-name-pattern='established consultation' src/lib/adviser-consultations-ui.test.ts` | Exit 1, one failed. Executed established page had no navigation element. |
| Miniapp: `node --import tsx --test --test-name-pattern='post detail preserves|unavailable post states' tests/community.test.ts tests/community-page-lifecycle.test.ts` | Exit 1, two failed. Hidden code became `UNEXPECTED_RESPONSE`; hidden page became `failed`. |
| Backend: `./mvnw -q '-Dtest=CommunityReadHttpIntegrationTest#unavailableDetailsDistinguishHiddenDeletedAndMissingWithoutExposingPrivateContent' test` after clean generated classes | Exit 1, one failure / zero errors. Expected `COMMUNITY_POST_HIDDEN`, actual `COMMUNITY_POST_NOT_FOUND`. Log: `/private/tmp/community-unavailable-red-clean.log`. |

The first backend moderation characterization run passed the new version-advance test and all other existing tests, but its new shared fixture assertion found the provisional fixture's version 1 differed from the real backend's version 2 (11 tests, one fixture failure). Corrected the fixture to the measured backend response; no backend moderation behavior was changed to satisfy the fixture.

## Focused GREEN and broad verification

| Command | Result |
| --- | --- |
| Frontend: `node --test src/lib/adviser-community-api.test.ts src/lib/adviser-community-ui.test.ts` | Exit 0; 30/30 passed after history/version fixes. |
| Frontend: `npm run test:adviser` | Exit 0; 49/49 passed, including established consultations entry, manual allowlists, CSRF, target identity and conflict regressions. |
| Miniapp: `node --import tsx --test tests/community-page-lifecycle.test.ts` | Exit 0; 15/15 passed after comment lifecycle fix. |
| Miniapp: `node --import tsx --test tests/community.test.ts tests/community-page-lifecycle.test.ts tests/community-pages.test.ts` | Exit 0; 73/73 passed after unavailable-state implementation. |
| Backend: `./mvnw -q -Dtest=CommunityReadHttpIntegrationTest,CommunityModerationHttpIntegrationTest test` | Exit 0; 29/29 passed (18 read + 11 moderation), zero failures/errors/skips. Log: `/private/tmp/community-focused-green.log`. |
| Frontend: `npm test` | Exit 0; 271/271 passed across ten groups, zero failures/skips. Log: `/private/tmp/community-frontend-test.log`. |
| Frontend: `npm run lint` | Exit 0. Log: `/private/tmp/community-frontend-lint.log`. |
| Frontend: `npm run build` after isolating stale generated output | Exit 0; optimized Next 16.3.5 build, TypeScript, page generation and standalone tracing complete. Log: `/private/tmp/community-frontend-build-clean.log`. |
| Miniapp: `npm run check` with local IPC permission | Exit 0; 146/146 tests, TypeScript and zero-warning lint passed. Log: `/private/tmp/community-miniapp-check.log`. |
| Backend: `./mvnw -DargLine=-Djdk.virtualThreadScheduler.parallelism=32 test` | Exit 0; 768/768 passed, zero failures/errors/skips, BUILD SUCCESS, 1:05 minutes, finished 2026-10-09 13:49:01 +08:00. Log: `/private/tmp/community-backend-final.log`. |
| Repository: `git diff --check` | Exit 0. |

## Verification environment and recovery

Java 21.0.12.1+1-LTS and Node 24.21.0. Existing dependency versions and lockfiles were unchanged. Local Docker access and the miniapp runner's IPC socket required approved sandbox escalation; no automatic approval rejection occurred.

- The initial sandboxed miniapp `npm run check` exited before tests because tsx could not create its local IPC socket (`listen EPERM`). The same script passed with approved local IPC permissions; no application code was changed for the environment.
- The initial frontend production build failed with `ENOTEMPTY` while removing an old `.next/standalone/node_modules/next` directory. The backend detail RED attempt also stalled before test execution while Spring scanned an old generated `ElasticsearchUniversitySearchGatewayIntegrationTest$Request 2.class`; `jcmd` and `lsof` confirmed a local file-read wait, not a service/database test failure. Stopped only test JVM 95195 started by this wave. These incomplete attempts are not counted as passing tests.
- Moved only ignored `backend/target` and `frontend/.next` to `/private/tmp/community-verification-backup.RqfXzV/backend-target` and `/private/tmp/community-verification-backup.RqfXzV/frontend-next`. Both remain recoverable. No source files, user data, database evidence, external containers or volumes were deleted. Fresh output restored normal verification.
- The full backend run uses the same test-only 32-carrier Java 21 virtual-thread scheduler setting documented by Task 10, avoiding its previously established default-scheduler test-harness stall. No production setting was changed; this report does not claim a default full backend run passed.

## Self-review and remaining concerns

Reviewed the complete diff against each requested finding, specification §9.2 and existing consumers. Decimal-string IDs and exact DTO parsing remain intact. Automatic history values are not exposed as manual options/commands. Version validation still requires forward progress and retains conflict/identity safeguards. Public unavailable responses cannot construct a content DTO; pending/rejected status is not disclosed. Unavailable page handling also invalidates in-flight thread data, and existing request-scope, reply-generation, ownership, avatar fallback and unloaded-write regressions remain covered. Existing consultation layout styles are reused, and no authentication/CSRF, server locking, authorization or audit code was altered.

Self-review correction before committing: the first unavailable-state implementation also closed an existing report sheet. The binding contract explicitly permits reports on hidden posts, so this unnecessary behavior change was removed. Changed the lifecycle expectation to retain the report request, observed RED (`false !== true`) with `node --import tsx --test --test-name-pattern='unavailable post states' tests/community-page-lifecycle.test.ts`, then preserved report state and kept its WXML outside the unavailable thread/composer block. Re-ran the full miniapp check after this correction.

The two deferred Task 10 minors (cache-invalidation metric coverage and moderation gauge query cost) were not addressed. WeChat DevTools/physical-device rendering, browser manual Adviser acceptance and live capacity/fault-injection tests were not run by this fix wave; those existing release prerequisites remain. No deployment, push or merge was attempted.

Final status: all five Important findings fixed and automatically verified; ready for independent final re-review. The qualifications above concern test harness/environment and existing manual release prerequisites, not an unresolved finding in this wave.
