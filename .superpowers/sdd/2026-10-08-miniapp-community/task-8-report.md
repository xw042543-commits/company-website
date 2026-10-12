# Task 8 implementation report

Status: DONE

## Delivered contract

- Added `frontend/src/lib/adviser-community-api.ts` with `loadCommunityModerationQueue`, `loadCommunityModerationDetail`, and `submitCommunityModerationAction`. All return `ModerationResult<T>`: a ready value or the fixed status-only failure union from the consultation client.
- Queue requests use `/api/v1/adviser/community/moderation`, backend filter names `status`, `targetType`, `reasonCode`, `from`, `to`, `cursor`, `size`, and backend defaults PENDING/20. Sizes are bounded to 1–50; duplicate/unknown keys, malformed filters and reversed date ranges are rejected locally.
- Detail requests use `/{targetType}/{targetId}` and optional `{ actionsCursor }`; the request function is the fifth parameter after these options. Actions POST to `/{targetType}/{targetId}/actions`, sending command, reasonCode, version and an explicit nullable restrictionEndsAt.
- Queue, detail, report summaries, action history and CSRF have exact-key parsers derived from Task 5 Java DTOs. Added contact, author, actor, reporter and private fields fail parsing rather than reaching the UI. Enum values use only actual backend values; report reasons and moderation decision reasons remain distinct.
- Target/action IDs remain canonical positive decimal strings, bounded to signed Java long without conversion to JavaScript number. Versions/counts must be nonnegative safe integers; version increments and target identity are verified on action acknowledgement. Timestamps use the existing strict calendar-aware consultation validator; body bounds match backend Unicode code-point limits (post 2000/comment 1000/preview 160).
- Exported `adviserClient` primitives from `adviser-consultation-api.ts` and routed consultation CSRF acquisition through the shared helper. Moderation literally reuses validated origins, exact CSRF acquisition, uncached credentialed GETs, five-second timeout, JSON parsing, and fixed HTTP error mapping. No backend failure body is consumed or returned.
- Added `adviserNavigation(locale)` in `adviser-consultations-ui.ts`, with existing consultations destination and exactly one moderation item (`U圈审核` / `Community moderation`) at `/${locale}/adviser/community`. This is the navigation contract for Task 9; no UI screen or authorization changes are included in Task 8.
- Included the new client tests in `frontend/package.json`'s existing `test:adviser` script so the normal test chain exercises them.

## TDD evidence

1. Wrote the client and navigation tests before production code.
2. Ran `node --test src/lib/adviser-community-api.test.ts src/lib/adviser-consultations-ui.test.ts`: failed with ERR_MODULE_NOT_FOUND for the moderation client and missing adviserNavigation; eight existing UI tests passed.
3. Implemented parsers, transport reuse, request functions, and navigation. Initial focused plus consultation regression run passed 28 tests.
4. Type checking exposed a BigInt literal incompatible with the existing TypeScript target; switched ID upper-bound comparison to decimal string length/lexicographic comparison.
5. Added a strictness regression for a null queue status. Observed failure (unexpected request/unavailable instead of validation-error), changed defaulting to apply only to undefined, reran successfully. Additional tests cover all command/reason payloads and malformed nested/detail options.

## Final verification

- `node --test src/lib/adviser-community-api.test.ts src/lib/adviser-consultations-ui.test.ts src/lib/adviser-consultation-api.test.ts src/lib/access-policy.test.ts src/proxy.test.ts`: **41/41 pass** (12 moderation client tests, 9 consultation client tests, 9 UI/navigation tests, 11 access/proxy tests).
- `npm test -- adviser-community-api.test.ts adviser-consultations-ui.test.ts`: **exit 0**. The repository's npm test script executes its full chained suites rather than filtering to these filenames; the new test:adviser registration ensures moderation tests are included. The direct node command above provides the focused result.
- `npx tsc --noEmit`: **exit 0**.
- Targeted `npx eslint` on all five changed/new TypeScript files: **exit 0**.
- `git diff --check`: **exit 0**.

## Self-review

- Cross-checked DTO keys and enums against CommunityModerationPage, CommunityModerationDetail, controller, request, service, and query repository. No aliases or compatibility fallbacks are accepted.
- Confirmed 400/401/403/404/409/429/502/503/504/500 failures, JSON parse failures, CSRF failures and transport failures resolve only to fixed statuses. Tests exercise failures at GET, CSRF GET and action POST stages and capture all five-second timeout calls.
- Reviewed changes to the consultation client: only shared primitives export and equivalent CSRF helper invocation; nine consultation regressions plus access/proxy tests pass. Navigation leaves consultation destination/copy and all existing authentication/authorization code intact.
- MUTE timestamp format is validated locally; its time window and authoritative permission/transition checks remain in the existing backend service. The client does not attempt to override server policy or time.
- No backend changes, UI implementation, runtime dependencies or unrelated work are included. No outstanding implementation concerns.

Commit message: `feat: add adviser community moderation client`.

## Review fix round 1: preserve whitespace-only queue previews

- Reviewer identified a backend-valid body (`160 spaces + review me`) whose unchanged PostgreSQL substring preview contains only spaces. The queue parser incorrectly reused the full-body nonblank check and returned error.
- Added a focused regression with that exact body and preview. Before implementation, `node --test src/lib/adviser-community-api.test.ts` failed only the new whitespace-preview test: actual error versus expected ready (12 passed, 1 failed).
- Added a dedicated preview validator: string type and maximum 160 Unicode code points, with no trim/nonblank requirement. Full detail body validation retains its nonblank and post/comment maximum checks; the regression verifies the leading-space full body is accepted and an entirely blank full body remains rejected.
- Added a supplementary-character boundary fixture proving a 160-emoji preview is accepted and 161 code points, null, and number values are rejected.
- Final verification: `node --test src/lib/adviser-community-api.test.ts src/lib/adviser-consultation-api.test.ts src/lib/adviser-consultations-ui.test.ts` passed **32/32**; `npx tsc --noEmit` and targeted ESLint on all five client/navigation TypeScript files exited 0; `git diff --check` exited 0.
- Self-review: the production change is confined to preview validation. Exact DTO keys, IDs, versions, authentication, CSRF, transport and full detail body checks are unchanged. No outstanding concerns for this review finding.
