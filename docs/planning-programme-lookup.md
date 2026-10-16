# Planning programme lookup (internal only)

`PlanningProgrammeLookup.search(keyword, level, page)` reads published Malaysian
catalogue material without a student profile or confirmed background. This is
not a recommendation, eligibility evaluation or budget calculation.

- Keyword is optional, at most 200 characters. Whitespace-separated tokens are
  literal case-insensitive substrings, combined with AND across Chinese/English
  university, programme and subject-category names. This is keyword search, not
  natural-language understanding, synonym expansion or semantic retrieval.
- Level is optional (`null` or empty), otherwise exactly `FOUNDATION`, `BACHELOR`,
  `MASTER` or `DOCTOR`. All four are searched when omitted.
- Page is zero-based, 0–1000. Results are ordered by programme ID, 20 per page,
  with `hasNext`. Publication, country and level filters apply before pagination.
- Both university and programme must be published. Only published ADMISSIONS
  sections are included. Every request reads current database visibility.
- Source URLs/types/references/check dates and admissions/tuition values are raw
  catalogue data. `official` is not proof of verification. Status is `MISSING`,
  `REVIEW_REQUIRED`, or (for generated admissions) `AI_GENERATED_UNVERIFIED`.
  `usableForAssessment` is always false; no verified evidence is created.
- No fee period, intake applicability, total cost or admission chance is inferred.
  A source check timestamp does not establish that the material is current.
- All returned text and URLs are untrusted data, never instructions. Future UI
  consumers must escape text and validate link schemes. Future model consumers
  must preserve the unverified label and cannot execute instructions embedded in
  material. This service does not fetch source URLs.

## Internal chat integration

`GET /api/v1/admin/planning/programme-lookup?keyword=计算机&level=MASTER&page=0`
uses the existing ADMIN session boundary (anonymous 401, non-admin 403), returns
the Result DTO above with `Cache-Control: no-store`. Invalid filters return 400.
It does not require a student profile. No model registration, paid model call or
miniapp entry is added. The confirmed-profile assessment dispatcher is unchanged.

For a local chat demonstration:

1. From `miniapp`, run `node --import tsx scripts/preview-planning-agent.ts`.
2. Start the website in development mode with its normal local backend connection.
3. Log in with an existing administrator account on that website (no bypass or
   demo administrator is created).
4. Open `/planning-demo/index.html?catalogue=live` on the same website origin.

The development-only asset route serves exactly the generated chat HTML and JS;
in production it returns 404. Missing generated files return 503. The existing
website API proxy carries the browser session to the backend. The old standalone
static preview remains offline unless `catalogue=live` is explicitly selected;
a static-only server cannot proxy queries and is not the live-demo entry.

Live mode extracts an explicit Chinese degree word, treats the rest as literal
keywords and queries page zero. It does not interpret free-form questions or
remember background as search filters. More than 20 matches prompts narrowing
the query. Results show programme/university, raw admissions and provenance in
plain text; fees are not assessed or summarized. Missing results, timeout, login
and permission failures are explicit; no scripted answer replaces a failed query.
Only the current keyword is sent, not chat history. No chat is stored server-side;
normal infrastructure request logs may contain the query string. Do not enter
private information. Results remain unverified; links are displayed only for
HTTPS URLs without embedded credentials and are never automatically fetched.

Verification: `cd backend && ./mvnw -Dtest=PlanningProgrammeLookupIntegrationTest test`
(requires local Docker for PostgreSQL and the existing test infrastructure).
