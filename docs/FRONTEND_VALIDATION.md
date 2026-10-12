# Frontend wireframe validation

Validation date: 17 September 2026  
Branch observed during final validation: `feature/my-updates`

## Automated checks

| Check | Result | Evidence |
| --- | --- | --- |
| ESLint | Passed | `node_modules/.bin/eslint.cmd . --max-warnings 0` exited with code 0 and no warnings |
| Production build | Passed | `npm run build`; Next.js 16.3.5 compiled, completed TypeScript checks, generated route data and exited with code 0 |
| Route generation | Passed | `/`, `/_not-found`, locale homepage, content section, consultation, planning, review, directory and university-detail routes were listed by the production build |
| Browser console | Passed for inspected routes | No warning or error entries were present after the desktop and mobile review |
| Secret-pattern review | Passed for this stage's files | No credentials were added. Existing safe placeholders and environment-variable references remain elsewhere in the working tree |

The normal `npm run lint` command produced no lint messages but its npm process did not exit cleanly in this Windows/OneDrive environment. The underlying project-local ESLint executable was then run directly with zero warnings allowed and exited successfully. This records the actual result without treating the stalled npm wrapper as a pass.

## Browser checks completed

The following checks used the Codex in-app Chromium browser against the production server at `127.0.0.1:3100`. This is a Chromium review, not an Edge or Safari certification.

- `/` redirected to `/zh` and rendered the fixed eight-item Chinese navigation.
- The Chinese homepage preserved the supplied banner, six study shortcuts, four benefit blocks and five application steps.
- Desktop homepage and university-detail layouts rendered without visible clipping or overlap at a 1440 × 1000 viewport.
- Planning displayed keyword, category, qualification, country, course mode, language, duration, intake and tuition controls with labels.
- Applying keyword `CS`, qualification `master`, country `MY`, mode `taught`, duration `24`, and tuition `1000–2000` produced URL parameters and restored the selected values after refresh.
- Switching to English preserved all active query parameters and translated fixed interface labels.
- At a 390 × 844 viewport, the filter panel collapsed behind a keyboard-operable button, opened with Enter, exposed all controls, and created no horizontal document overflow.
- The consultation preview contained every Q31 A field: name, phone/WeChat, intended university, intended course, qualification, notes and privacy consent.
- The real submission button and privacy checkbox remained disabled. The preview had no form field `name` attributes, did not change the URL, and reported that nothing was sent or saved.
- The directory's left panel contained continent and country only. Active Asia/Malaysia values remained in the URL and displayed the pending-backend state instead of an inaccurate result.
- The university-detail preview included school identity, country/city, introduction, authorised-media placeholder, course fields, tuition/currency/FX-date fields and an enquiry entry.
- The component review page showed one card with exactly three course rows, loading/empty/error/unconfigured states, and pagination for 25 abstract records at 12 per page.
- Pagination moved from page 2 to page 3, disabled Next on the last page and preserved the locale.
- Confirmed navigation placeholders rendered without invented content; an unsupported section rendered the custom not-found page.

## Checks intentionally not claimed

- No live backend course-filter result was tested because that endpoint does not exist.
- No consultation was submitted or saved because the privacy copy, required-field rules and persistence endpoint have not been approved or implemented.
- No official school/course data, alias table, Excel workbook, authorised images or QR code were available.
- Chrome, Microsoft Edge and Safari were not each run. Safari must be tested on Apple hardware or a suitable team-owned environment before release.
- PostgreSQL, Elasticsearch, Redis and Docker were not required for the standalone wireframe checks.
- No push, pull request, merge or deployment was performed.

## Remaining decisions and implementation work

1. Approve subject categories, teaching languages, the complete country list, duration semantics, tuition fee period and multi-select behavior.
2. Approve English copy, footer/contact content, brand artwork, school images and adviser QR code.
3. Finalize the course-search, directory, detail, consultation and reference-data contracts in `FRONTEND_API_PROPOSAL.md`.
4. Approve consultation required fields, validation messages, privacy wording/version, retention, staff access and notification recipients.
5. Obtain the boss-approved alias table and project-team Excel data dictionary; do not infer production aliases or records.
6. Implement backend persistence/search on new Flyway migrations, connect the frontend, and run the API acceptance matrix.
7. Complete real Chrome, Edge and Safari checks after integration.

The wireframes are suitable for first-stage structure review. They are not ready for public launch because the listed business decisions, real data and backend services remain outstanding.
