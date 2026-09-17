# Proposed frontend API and data handoff

## Status

This is a proposal for the backend and data owners, not an implemented API contract or database migration. Existing endpoints are only `GET /api/universities`, `GET /api/universities/popular`, and `GET /api/search?q=...`. Their responses lack course data, pagination metadata, city, details and consultation support.

The frontend wireframes call only the existing list/search endpoints. All routes below marked proposed need team review before implementation.

## Request and data flow

Browser → Next.js → Spring Boot controller → service → repository → PostgreSQL.

Elasticsearch resolves course search and approved aliases; its index must be rebuildable from PostgreSQL. Redis may cache reference data or results and must not become the source of truth. Keep a modular monolith. No Kafka, RabbitMQ, Kubernetes, MongoDB or additional architectural components are proposed.

## Reference data

Proposed `GET /api/reference-data` returns approved options:

- `countries`: stable ID, code, nameZh, nameEn, continentId.
- `continents`: ID, nameZh, nameEn.
- `subjectCategories`: ID, nameZh, nameEn; optional parentId only if taxonomy is approved.
- `qualificationLevels`, `courseModes`, `teachingLanguages`: stable IDs and approved display names.
- Allowed intake months and duration/range guidance when available.

Display fixed UI translations separately from original owner-provided business names. The nine named countries are a minimum reference list, not an assertion that the boss's final list is complete.

## Course search grouped by university

Proposed `GET /api/course-search`:

| Parameter | Proposed meaning |
| --- | --- |
| `q` | Trimmed course keyword, resolved using formal names and owner-approved aliases |
| `category` | Approved subject category ID |
| `level` | Approved qualification ID |
| `country` | Approved country ID/code |
| `mode` | Taught, mixed or research enum |
| `language` | Approved teaching-language ID |
| `duration` | Duration in months; confirm exact matching versus range |
| `intake` | `YYYY-MM` |
| `tuitionMin`, `tuitionMax` | Non-negative decimal CNY amounts; confirm annual versus total fee basis |
| `sort` | `relevance` by default; no unapproved alternate sort choices |
| `page` | One-based positive integer |
| `size` | 12 distinct schools |

Different selected conditions combine with AND. A single school course must satisfy all course-level filters; do not match language on one course and tuition on another course in the same school. Decide within-field OR/AND behavior before adding multi-select controls; current wireframe selects one option per field.

Search courses first, group by university, compute distinct-school counts, then paginate. Return at most three highest-relevance matched courses for each university. Sorting needs a stable university ID tie-breaker so results do not jump or duplicate across pages.

Proposed response fields:

```typescript
type UniversitySearchPage = {
  items: Array<{
    id: string;
    slug: string;
    name: string; // owner-provided display name
    country: { id: string; name: string };
    city: { id: string; name: string } | null;
    imageUrl: string | null; // authorised material only
    matchedCourseCount: number;
    matchedCourses: Array<{ // maximum 3
      id: string;
      name: string;
      qualification: { id: string; name: string };
      teachingLanguages: Array<{ id: string; name: string }>;
    }>;
  }>;
  page: number;
  size: 12;
  totalUniversities: number;
  totalPages: number;
  sort: "relevance";
};
```

Empty results are a successful response with zero records, distinct from invalid input (400) or unavailable services (5xx). Reject invalid enum IDs, malformed months, negative tuition, reversed tuition ranges and unsupported sorts. Do not silently discard applied filters.

## Directory and school details

Proposed paginated `GET /api/universities` adds continent and country parameters. Keep directory geography filtering separate from the course-search contract. The existing simple response is incompatible with a page envelope; coordinate a versioned endpoint or explicit migration with the frontend.

Proposed `GET /api/universities/{slug}` returns identity, country, city, approved description/media, and consultation context. Proposed `GET /api/universities/{id}/courses` supplies paginated school courses with:

- Course ID, university ID, public category ID and owner-provided title.
- Qualification, teaching languages and mode.
- Duration and available intake months.
- Original tuition amount, currency, fee period, CNY comparison amount and exchange-rate date.
- Explicit missing-data status; unknown fees are null, never zero.

Return 404 for unknown school slugs. Missing optional content displays “请咨询” / “Please enquire”. Keep tuition, duration and intake on school courses, not on the shared subject category.

## Consultation Q31 A

Proposed `POST /api/consultations`, JSON body, never a URL containing personal data:

| Field | Requirement / decision |
| --- | --- |
| `name` | 姓名; requiredness and maximum length need approval |
| `contact` | 手机或微信; accept either, not phone-only regex; contact type design needs approval |
| `universityId` | 意向学校; decide whether unknown/undecided is allowed |
| `courseId` | 意向专业; validate course belongs to selected school; decide free-text fallback |
| `qualificationId` | 学历层次; validate approved enum |
| `notes` | 备注; length and requiredness need approval |
| `privacyConsent` | 隐私同意; must reference the approved consent wording |
| `privacyPolicyVersion` | Proposed version identifier for consent evidence |

No ID card, passport, transcript, or file-upload fields. UI maximum lengths in the wireframe are provisional bounds, not a final backend validation policy.

Proposed server behavior:

1. Validate approved field rules and consent; report field-level errors without exposing personal data in logs.
2. Persist to PostgreSQL transactionally with an internal ID, createdAt and processing status. Define retention and authorised staff access with the owner.
3. Return a created acknowledgement only after commit. The frontend must never report success before persistence succeeds.
4. Invoke an optional notification interface after successful persistence. Initially use no external sender until recipient, account and template are supplied. Preserve the saved enquiry if email/WeCom delivery fails; record retryable delivery status without putting the full enquiry in logs.
5. Design duplicate-submission protection (for example an idempotency key) and abuse protection within the existing stack. Do not introduce a queue service just for this feature.

Response proposal: `201 { id, status: "received" }`; validation `400 { code, fieldErrors }`; generic 5xx for unavailable persistence. Confirmation wording, staff ownership, notification retry behavior and privacy text require review.

## Maintainable search aliases

Owner supplies the alias data. Suggested columns: alias ID, alias text, language, entity type, canonical entity ID, approval status/date. Persist approved aliases in PostgreSQL and index them with their canonical entities in Elasticsearch.

The questionnaire examples UK → United Kingdom, CS → Computer Science and 计算机 → Computer Science demonstrate behavior; do not seed them as approved production records without the supplied alias table. Preserve ambiguous aliases for owner review. Do not automatically infer every abbreviation or typo. Define case/whitespace normalization and exact versus fuzzy matching with the team.

## Excel template handoff

The project team designs the template; the data owner confirms the dictionary and produces the workbook before importing. Suggested worksheets and columns:

| Sheet | Proposed columns |
| --- | --- |
| Universities | External key, nameZh, nameEn, original display name, country code, city key, approved description, authorised media reference |
| SubjectCategories | Category key, nameZh, nameEn |
| SchoolCourses | Course key, university key, category key, nameZh, nameEn, qualification, teaching language IDs, course mode, duration months, tuition amount, currency, fee period, tuition CNY, FX date |
| Intakes | Course key, intake month `YYYY-MM` |
| Locations | Country code, country names, continent code, city key and city names |
| Aliases | Alias text, language, target type/key, approval status/date |
| AllowedValues | Boss/team-approved enums for qualification, mode, language and currency |
| Instructions | Requiredness, formats, allowed values, relationships, missing-data notation and clearly marked test-only examples |

Requiredness is a proposal pending review. Preserve missing data as pending, not fabricated values. Validate duplicate keys, missing references, wrong enums, invalid dates/currencies, course-school relationships and original/CNY fee consistency. First verify import with 3–5 clearly labelled fictional test schools in a test environment, then import the 20–50 official schools provided by the boss. No production workbook, importer or data model changes are included in this frontend stage.

## Backend and integration acceptance matrix

| Scenario | Expected result |
| --- | --- |
| Approved alias and canonical name | Same intended canonical matches |
| Unknown or ambiguous abbreviation | No invented mapping |
| Country AND level AND language | Only courses satisfying all three |
| Course A meets language, course B meets tuition | School excluded unless a single course satisfies both |
| School with four matching courses | One card, at most three course summaries |
| 13 distinct matching schools | Pages of 12 and 1; total counts schools, not courses |
| Equal relevance | Stable ordering across page requests |
| Missing optional fee/city | “请咨询”, no made-up amount/location |
| Malformed filter or reversed range | Clear validation error |
| Valid empty search | Empty state, not an error state |
| Search service failure | Error state, not a fabricated empty result |
| Consent absent or invalid contact | Rejected according to approved rules |
| Database write failure | No submission-success message |
| Notification failure after commit | Saved enquiry retained; notification status retryable |
| Duplicate submission | No unintended duplicate enquiry |
| Unsupported locale/unknown school | Appropriate not-found response |

Actual Chrome, Edge and Safari release testing remains separate from a Chromium preview check. No cross-browser pass should be claimed without running that browser.
