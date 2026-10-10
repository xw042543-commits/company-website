# Final review fix wave

Base: `f75ae75`. Scope: P1 installed-client compatibility, P2 Unicode blank titles, isolated 28rpx body typography nit. No subagents, push, deployment, AppID changes, or production operations.

## Design choices

- Default v1 feed, detail and personal-post HTTP responses now use explicit legacy DTOs with exactly the original field sets, even for new campus posts. The new miniapp explicitly sends `representation=campus-v1` on all three reads. Unknown representations return 400. Filtering does not implicitly negotiate metadata. Adviser metadata is unchanged.
- Representation is in the URL, so cache keys naturally distinguish it. All three HTTP reads explicitly send `Cache-Control: no-store`; public responses include viewer state and personal responses are private. Redis hot snapshots store scoped IDs rather than DTOs, so no representation dimension or cache migration is needed there. Existing cursor/filter semantics remain unchanged.
- `CommunityText` shares validation between ingress and response construction. Blankness includes Java Unicode whitespace/space characters and U+FEFF (ECMAScript trim whitespace). Existing line-ending normalization, 1–60 code-point title limits and control/NUL/unpaired-surrogate rejection remain. Historical invalid titles become `null` in public, personal and adviser DTOs; bodies, rows and moderation data are retained. No database cleanup or fabricated title.
- A Java contract test serializes actual response DTOs after accepted ingress and from invalid historical titles. The cross-language runner exercises the frozen original v1 exact-key field gates with unchanged value validators, the current miniapp parsers, and real adviser reader functions. It covers 11 cases: three accepted Unicode titles, a legacy null title and seven malformed historical titles. PostgreSQL HTTP tests separately cover FEFF ingress rejection and historical rows through public/personal/adviser endpoints.
- Changed only comment/reply/textarea/input body font sizes from 27/25/29rpx to approved 28rpx. No unrelated redesign.

## RED → GREEN evidence

Commands below ran from the indicated directory; verbose logs were redirected to `/private/tmp/boards-final-*.log`.

### P1

1. Backend RED: `./mvnw -q -Dtest=CommunityReadHttpIntegrationTest#postRepresentationsKeepTheExactLegacyContractUnlessExplicitlyNegotiated test` → exit 1, 1 test / 1 assertion failure / 0 errors. Default response had unexpected `title`, `category`, `universityId`, `universityName`. Log: `boards-final-p1-backend-red.log`.
2. Miniapp RED: `node --import tsx --test tests/community.test.ts` → exit 1, 48 tests / 46 passed / 2 failed because the three post read URLs did not negotiate representation. Log: `boards-final-p1-miniapp-red.log`.
3. Backend GREEN: same focused backend command → exit 0, 1 test passed. It covers all three read URLs, exact legacy keys, opt-in metadata, no-store and unsupported negotiation rejection. Log: `boards-final-p1-backend-green.log`.
4. Miniapp GREEN: same miniapp command → exit 0, 48 passed. Log: `boards-final-p1-miniapp-green.log`.

### P2

1. Backend RED: `./mvnw -q -Dtest=CommunityPostMetadataTest,CommunityPostReaderContractTest test` → exit 1, 4 tests / 2 assertion failures / 0 errors: FEFF-only ingress was accepted; historical FEFF title serialized as FEFF instead of null. Log: `boards-final-p2-backend-red.log`.
2. Reader RED, miniapp directory: `node --import tsx tests/contracts/community-server-contract.ts` → exit 1; real miniapp feed reader rejected server JSON containing the historical FEFF title. This runner was subsequently moved to `scripts/community-reader-contract.mjs` to keep client TypeScript projects independent. Log: `boards-final-p2-reader-red.log`.
3. Backend GREEN: same focused backend command → exit 0, 4 tests passed. Log: `boards-final-p2-backend-green.log`.
4. Reader GREEN: original command → exit 0, 11 server cases passed. Final-location command `node --import tsx ../scripts/community-reader-contract.mjs` also exited 0 after the final backend run. Logs: `boards-final-p2-reader-green.log`, `boards-final-readers.log`.

## Lean final verification

- Backend: `./mvnw -q -Dtest=CommunityReadHttpIntegrationTest,CommunityPersonalHttpIntegrationTest,CommunityModerationHttpIntegrationTest,CommunityWriteHttpIntegrationTest,CommunityPostMetadataTest,CommunityPostReaderContractTest,CommunityReadServiceTest test` → 66 tests / 65 passed / 1 failure. The failure was an existing personal-post test still expecting the four new fields in the default response. Restored its assertion to the legacy contract; `./mvnw -q -Dtest=CommunityPersonalHttpIntegrationTest test` → exit 0, all 5 passed. All 66 selected tests have now passed across these runs; unchanged passing classes were not rerun. Logs: `boards-final-backend-focused.log`, `boards-final-personal-green.log`.
- Miniapp: `node --import tsx --test tests/community*.test.ts` → exit 0, 84 tests passed; `npm run typecheck` and `npm run lint` → exit 0. Logs: `boards-final-miniapp-tests.log`, `boards-final-miniapp-typecheck.log`, `boards-final-miniapp-lint.log`.
- Frontend: `node --test src/lib/adviser-community-api.test.ts src/lib/adviser-community-ui.test.ts` → exit 0, 33 tests passed. `npx tsc --noEmit --incremental false` → exit 0. `npx eslint src/lib/adviser-community-api.ts src/lib/adviser-community-api.test.ts src/lib/adviser-community-ui.ts src/lib/adviser-community-ui.test.ts src/components/adviser-community-panel.tsx --max-warnings=0` → exit 0. Logs: `boards-final-frontend-tests.log`, `boards-final-frontend-typecheck.log`, `boards-final-frontend-lint.log`.
- Cross-language final runner: `node --import tsx ../scripts/community-reader-contract.mjs` from miniapp → exit 0, 11 cases across all readers. `git diff --check` → exit 0.

## Test setup corrections and limits

- Initial sandboxed backend attempt could not reach Docker; integration commands then ran with allowed local-Docker escalation. The initial `npx tsx --test` wrapper hit sandbox IPC permissions, so tests used `node --import tsx --test` successfully.
- Initial JSON fixture writer could not encode a deliberately unpaired surrogate; enabled JSON non-ASCII escaping in the test mapper, then observed the two intended RED assertions above. This was test scaffolding, not a production workaround.
- The first miniapp typecheck followed the initial cross-client TypeScript runner into frontend dependencies and reported five frontend errors under miniapp's stricter config. Moving the integration runner to the repository scripts directory avoids mixing client compiler configurations. Both clients' own typechecks pass; no unrelated frontend code was modified.
- No full suite, production build, live capacity test or WeChat device/visual validation was run in this wave. The typography adjustment is source-verified only. Existing JVM/bootstrap and test-container log warnings remain. Invalid historical titles remain stored; null is the defensive read representation.
