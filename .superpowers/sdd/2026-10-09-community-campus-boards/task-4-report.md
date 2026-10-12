# Task 4 report — campus community UI and reading integration

Implemented on the existing Task 1–3 branch from `e835bc3`. Approved spec and visual handoff were followed; no new concept exploration. Actual routes verified in `miniapp/miniprogram/app.json`: `pages/circle-detail/index`, `pages/circle-me/index`, and `pages/circle-compose/index`.

## Result

- U圈 has compact header / 我的内容, 广场 / 校园圈, horizontally scrolling life categories including 全部, latest/hot sort, and real posts.
- Campus selection uses `createUniversitySearchService`, database-backed names, explicit query submission, paging, retry and cancellation. No unscoped plaza request is issued while campus selection is missing.
- Mode/category/school changes clear posts and cursor, invalidate old generation, and refresh the real server scope. B school remains displayed after a slower A response. Load-more sends the active category/school and preserves page request scope.
- Empty feed says exactly `这里还没有帖子` and has a working `发布帖子` action through the existing authentication/composer route. Errors, including a current superseded failure, remain retryable failed/offline states rather than false empty feeds.
- Card, detail, personal posts and moderation queue/detail render title (only when supplied), category and actual university name. User titles are WXML/React text interpolation; no HTML renderer or fabricated legacy title. Metadata-less posts retain opening, liking and reporting. Existing deletion, owner visibility, comments/replies, moderation version and permission paths remain intact.
- Moderation strict parser permits the new optional public metadata while keeping legacy DTO support and privacy allowlists; comment metadata must be null/absent. Task 2's existing backend `automatic-hide-detail.json` fixture is now consumed successfully by both frontend contract and history tests. No backend file was changed.
- Native navigation and bottom tabs/AppID unchanged. White/#F5F7F6 surfaces, #183C30 text, #087C49 accents, 32rpx titles/28rpx bodies/22rpx metadata, thin separators, safe-bottom padding and no decorative gradients or structural emoji. Small secondary text uses #65736B (darkened from #738078 for contrast). Major controls use at least 44px min-height, long title/school/body/author text wraps, publish button is hidden during school keyboard interaction and feed bottom padding reserves space for it.

## RED → GREEN evidence

1. `node --import tsx --test tests/community-page-lifecycle.test.ts` (miniapp): RED 21 tests / 17 pass / 4 fail, `/private/tmp/task4-mini-red.log`. Failures: missing mode and school chooser behavior, current superseded failure incorrectly producing empty state, absent category labels. Existing legacy open/react/report path test already passed as regression coverage. GREEN 21/21, `/private/tmp/task4-mini-green.log`.
2. `node --test src/lib/adviser-community-api.test.ts src/lib/adviser-community-ui.test.ts` (frontend): RED 31 tests / 28 pass / 3 fail, `/private/tmp/task4-front-red.log`. New metadata and Task 2 golden DTO rejected by old exact parser. GREEN 31/31, `/private/tmp/task4-front-green.log`.
3. `node --test src/lib/adviser-community-ui.test.ts`: RED 15 tests / 14 pass / 1 fail, missing post-context formatter, `/private/tmp/task4-context-red.log`. Covered bilingual board + real school and legacy category context; included in final passing adviser run.
4. `node --test src/lib/adviser-community-api.test.ts`: RED 18 tests / 17 pass / 1 fail, valid tab-containing Unicode title incorrectly rejected, `/private/tmp/task4-unicode-red.log`. Validator aligned with public title contract (Unicode code points, NUL/unpaired-surrogate rejection); included in final passing adviser run.

Initial `npx tsx --test` attempt could not create its IPC socket under sandbox (`EPERM`). Used the equivalent `node --import tsx --test` runner without IPC; no sandbox escalation or source workaround needed. Initial typecheck exposed non-null assertions needed for test deferred-array access; corrected test typing and reran successfully.

## Final verification (lean scope requested by controller)

- Miniapp: `node --import tsx --test tests/community.test.ts tests/community-pages.test.ts tests/community-page-lifecycle.test.ts` — 84 tests / 84 pass / 0 fail, `/private/tmp/task4-mini-final.log`.
- Miniapp: `npm run typecheck && npm run lint` — both exit 0, no warnings (also logs `/private/tmp/task4-mini-type.log`, `/private/tmp/task4-mini-lint.log`).
- Frontend: `npm run test:adviser` — 52 tests / 52 pass / 0 fail, `/private/tmp/task4-adviser-final.log`.
- Frontend: `npx tsc --noEmit` — exit 0, `/private/tmp/task4-front-type.log`; final `npm run build` also completes TypeScript checking.
- Frontend: `npm run lint` — exit 0, 0 errors, 1 existing `@next/next/no-img-element` warning in `src/components/remote-image.tsx:28`; this task did not modify that file. `/private/tmp/task4-front-lint.log`.
- Frontend: `npm run build` — exit 0, optimized production build, TypeScript and static page generation pass; `/private/tmp/task4-front-build-final.log`.
- `git diff --check` — exit 0.
- No backend changes, therefore no backend tests rerun. Full backend suite, full frontend suite and aggregate miniapp `npm run check` were not run; affected tests plus type/lint followed the controller's lean verification instruction. They are not claimed as passing.

## Changed files

- `miniapp/miniprogram/pages/circle/index.ts`, `index.wxml`, `index.wxss`
- `miniapp/miniprogram/components/community-post-card/index.ts`, `index.wxml`, `index.wxss`
- `miniapp/miniprogram/pages/circle-detail/index.ts`, `index.wxml`, `index.wxss`
- `miniapp/miniprogram/pages/circle-me/index.ts`, `index.wxml`, `index.wxss`
- `miniapp/miniprogram/pages/circle-compose/index.wxss` (approved visual token/readability alignment)
- `miniapp/miniprogram/utils/community-boards.ts`
- `miniapp/tests/community-page-lifecycle.test.ts`
- `frontend/src/lib/adviser-community-api.ts`, `adviser-community-api.test.ts`, `adviser-community-ui.ts`, `adviser-community-ui.test.ts`
- `frontend/src/components/adviser-community-panel.tsx`
- `frontend/src/app/globals.css`
- This report.

## Unverified and handoff

WeChat developer tools is installed. CLI help succeeded, but the native UI observation took approximately 12 minutes and showed an unrelated `/Users/wangxin/Projects/company-website-recovery-20261009/miniapp` project with a real AppID. That project was not operated or edited, and its UI cannot validate this isolated checkout. No browser approximations or fabricated native screenshots were produced. Actual 320/375/430 width checks, long-title rendering, empty/error/school-choice screenshots, input keyboard layout, native tab/safe-area clearance, device touch targets and native pagination remain unverified and must be performed against this branch in WeChat DevTools/device.

The code/controller should review this commit before integration. Remaining release work: native device checks above, real SQL query plans and independent capacity/load testing at the inherited 5,000-user target, then migration/environment deployment checks under separate user authorization. No push, deployment, AppID change, production write or subagent dispatch performed.
