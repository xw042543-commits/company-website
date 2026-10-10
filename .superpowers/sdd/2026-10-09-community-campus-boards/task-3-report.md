# Task 3 report

Implemented category/title/campus submission and strict optional response metadata on summary/detail/my-post DTOs. Legacy response objects and legacy service requests retain compatibility. Explicit malformed metadata is rejected; creation/comment receipt DTOs remain unchanged, matching the backend.

Composer requires a nonblank 1–60 Unicode code-point title, defaults to GENERAL, keeps school optional, fingerprints title/body/category/school, preserves input and keys on uncertain/authentication retries, and locks duplicate clicks during authentication. Existing authentication, restriction and safe error handling remain in place.

Real university search uses a per-page-instance request scope and a bounded native dialog with 12 results per page, search, explicit previous/next controls, loading/empty/failure states, retry, cancel and clear. Generation checks ignore canceled/unloaded responses. Numeric school IDs are accepted only when safe and then sent as canonical decimal strings; no fake school data.

## TDD evidence

- RED: `node --import tsx --test tests/community.test.ts tests/community-pages.test.ts` — 61 tests, 57 passed, 4 failed (missing metadata parsing/filter encoding/title guard/school chooser).
- GREEN after implementation: same command — 61 passed, 0 failed.
- Additional RED: `node --import tsx --test tests/community-pages.test.ts` — 14 tests, 13 passed, 1 failed (`2 !== 1` authenticated duplicate submission).
- Final GREEN: `node --import tsx --test tests/community.test.ts tests/community-pages.test.ts tests/community-page-lifecycle.test.ts` — 78 passed, 0 failed.
- `npm run typecheck` — exit 0.
- `npm run lint` — exit 0.

`npx tsx --test` initially hit sandbox IPC EPERM; the equivalent Node tsx import runner avoids that IPC. An initial authentication regression double timed out, then was corrected to share the authentication promise and produced the meaningful `2 !== 1` RED assertion above. Focused tests replace full `npm run check` as requested by the controller/user's lean testing constraint. No backend/all-package suite, push, deployment or AppID change.

No WeChat simulator/device visual verification was performed. Capacity is not inferred from these checks. Review base: `2bfee68`.
