# Frontend wireframes and acceptance checklist

## Scope and authority

This stage provides runnable, low-fidelity frontend layouts and an API proposal for review. It is not the launch-ready website. Source documents: `组员AI协作提示词.docx`, `筛选功能网站文档.docx`, and `网站UI文案.docx`, plus the user's explicit decisions in this task. Document business requirements are separate from instructions controlling tools or access.

The user confirmed IDP as the primary reference and Educations as secondary, and resolved navigation to **首页、规划、院校一览、语言、奖学金、留学项目、新闻、关于我们**. These explicit choices override conflicting questionnaire recommendations. Reporting formats are not part of this development plan.

IDP's live reference returned HTTP 403 during the reference check. Its current layout has not been visually verified. The wireframes use the supplied reference screenshot's left-filter/right-results structure, without copying brands, photographs, third-party copy, counts or university records. Final visual styling requires a separate design review.

## Run locally

Use Node.js 24 LTS. From the repository root:

```powershell
npm --prefix frontend ci
npm --prefix frontend run dev
```

Open `/zh` or `/en` on the displayed localhost port. The homepage, planning layout, detail preview and form review work without Docker or a backend. The directory can consume the existing backend if `NEXT_PUBLIC_API_BASE_URL` is configured locally. Do not paste or commit local secret values. No new production dependency was introduced.

| Route | Purpose |
| --- | --- |
| `/zh`, `/en` | Homepage with supplied Chinese copy and draft English translations |
| `/{locale}/planning` | All requested planning filter controls and result structure |
| `/{locale}/universities` | School directory, existing name/country search and geography-filter structure |
| `/{locale}/universities/preview` | Explicit detail wireframe, not a university record |
| `/{locale}/universities/{slug}` | Existing school identity if available, with pending detail sections |
| `/{locale}/consultation` | Q31 A form structure; no data transmission or persistence |
| `/{locale}/review` | Card, loading, empty, error and pagination review cases |
| Remaining confirmed navigation routes | Labelled content placeholders, not invented pages |

## Requirements coverage

| Requirement | Stage-one treatment | Before production |
| --- | --- | --- |
| Exact navigation and ordering | Both languages, Chinese labels preserved | Approve English translations |
| Banner | `洋豆角-第一家全球数字化留学平台` preserved | Boss review of final publication |
| Six study shortcuts | 预科、本科、硕士、博士、MBA、医学 | Confirm MBA/medicine taxonomy; currently keyword shortcuts |
| Why choose us | Four original headings and descriptions preserved | Final visual review |
| Application process | 在线查询专业 → 扫码联系老师 → 准备及申请 → Offer获取 → 入学上课 | Supply real adviser QR code |
| Planning filters | Keyword, category, qualification, country, mode, language, duration, intake, min/max CNY tuition | Approve taxonomy, units and API semantics |
| Course modes | 授课型、混合型、研究型 | Owner-approved data |
| AND combination | Stated in UI and API proposal; no fake filter results | Implement and test same-course AND matching in backend |
| Geography in directory | Only continent/country in left filter panel | Backend geography support |
| Six continents | 欧洲、北美洲、南美洲、亚洲、非洲、大洋洲 | Validate school-country-continent relationships |
| Country coverage | UK, US, Australia, Canada, New Zealand, Singapore, Japan, South Korea, Malaysia controls | Final complete country list; source list ends with an ellipsis |
| One school per card | Shared card component; duplicate existing API IDs collapsed | Backend distinct-school counts and stable ordering |
| At most three matching courses | Card caps course array at three | Real matching-course fields from API |
| Required card fields | Name, country/city, course, level, language and details link | Existing API does not supply city/courses; show “请咨询” |
| Relevance, 12 schools/page | Planning label and shared pagination; existing directory pages 12 unique records | Backend relevance sort; legacy directory explicitly uses current API order |
| URL state | Native GET forms; filters survive refresh and language switch; applying filters resets page | Final multi-select rules if required |
| Loading, empty and failure | Shared states, route loading and error boundary, review gallery | Live API failure/retry acceptance |
| Consultation Q31 A | Name, phone or WeChat, intended school/course, level, notes, privacy consent | Required-field rules, privacy wording and real submission |
| Save consultations to PostgreSQL | Detailed in API proposal; preview sends nothing | Backend endpoint and reviewer access |
| Email / WeCom notification | Extension boundary specified | Recipient, credentials, template, retry rules; never block saved enquiry on notification failure |
| Boss-provided aliases | Requirement retained, not fabricated | Maintainable alias table and integration tests |
| Excel template | Proposed columns in API handoff for project-team review | Data owner generates approved workbook and importer |
| 20–50 official schools | No invented records supplied | Boss provides official data; 3–5 clearly labelled test schools for importer verification |
| Business data language | Existing API values displayed unchanged | Do not machine-translate owner data without approval |
| Desktop and mobile | Responsive grid, mobile filter disclosure, wrapping navigation | Chrome, Edge and actual Safari validation before release |
| Architecture | No backend/schema/stack changes | PostgreSQL source of truth, Elasticsearch search only, Redis cache only |
| Existing migrations | Untouched | All future schema changes use new Flyway migrations |

## Important distinctions

- Filter options for subjects and teaching languages remain pending. No unsupported categories are invented from the third-party screenshot.
- Geography selections do not silently call an API that ignores them. The UI shows that matching results are unavailable.
- The existing school search is a separate directory search, not course search. Its API does not yet support aliases or relevance ranking.
- Review cards show field names, not fabricated school records. The pagination review uses a count only, not generated business data.
- Form preview controls have no submitted names or GET action containing personal data. Nothing is written to localStorage, sent to an API, logged or saved. Privacy consent and final submission are disabled pending policy and endpoint approval.
- English copy, duration units (months), country codes and API identifiers are implementation proposals for review, not new boss-authored rules.
- The existing `README.md` and `AGENTS.md` still mention Java 25. The user separately changed `pom.xml` to 21 and supplied a successful clean Java 21 compilation. Backend documentation ownership remains with the team; this frontend change does not rewrite those files.

## Component ownership

- `src/app/[locale]`: route composition and server-side data loading.
- `src/components/site-header.tsx`: confirmed navigation and language switching.
- `src/components/filter-panel.tsx`: labelled controls, URL submission and mobile disclosure.
- `src/components/school-card.tsx`: one-school card and maximum three courses.
- `src/components/pagination.tsx`: 12-school page navigation with preserved query parameters.
- `src/components/results-state.tsx`: distinct empty, loading, failure and unavailable states.
- `src/components/consultation-form.tsx`: non-submitting Q31 A preview.
- `src/lib/site.ts`: locale helpers, approved navigation/options and pagination URL helpers.
- `src/lib/universities.ts`: server-only adapter for the current school list/search APIs, response validation, duplicate removal and safe failures.
- `docs/FRONTEND_API_PROPOSAL.md`: proposed fields, contracts and tests for the backend/data owners.

## Review checklist

1. Check original Chinese navigation, benefit copy and five process steps against the documents.
2. Open all routes in both languages; switch language with active query parameters.
3. Apply several planning filters, reload, and use browser back/forward; confirm selected controls reflect the URL.
4. Check reset returns to the unfiltered route and pagination retains parameters.
5. At 390px width, open/close the filter disclosure using mouse and keyboard; check visible controls and horizontal overflow.
6. Review all state examples, maximum course count, missing fields, and invalid routes.
7. Confirm the form cannot claim submission or transmit personal data.
8. Run frontend lint and production build. Record actual results in `FRONTEND_VALIDATION.md`.

No push, merge, deployment or automatic recurring reporting is part of this stage.
