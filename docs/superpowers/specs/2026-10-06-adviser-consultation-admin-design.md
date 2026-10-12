# Adviser Consultation Administration Design

Date: 2026-10-06

## Objective

Provide a small, secure back-office area where an authorised UDAJO adviser account can review consultation forms submitted through the public website and update each enquiry's processing status.

The first release is intentionally limited to consultation handling. It does not include university or programme content management, user administration, deletion, bulk editing, analytics, or data export.

## Confirmed Product Scope

- One shared adviser account uses `udajoedu@gmail.com`.
- The account signs in through the existing account system.
- Advisers can view a paginated list of submitted consultations.
- Advisers can search by name, contact details, or reference code.
- Advisers can filter by processing status.
- Advisers can open a complete consultation record.
- Advisers can change only the processing status.
- Existing submitted content remains immutable in the adviser interface.
- The statuses are `NEW`, `IN_PROGRESS`, and `COMPLETED`, displayed as 待处理, 跟进中, and 已完成 on the Chinese interface.

## Chosen Architecture

The adviser area will be added to the existing application rather than deployed as a separate website. It will reuse the current Spring Boot authentication session, PostgreSQL database, Next.js frontend, and production deployment pipeline.

This approach keeps the first release small while still enforcing access at the API boundary. Direct database access and a shared database-management tool are explicitly rejected because they expose credentials and make accidental data changes too easy.

## Roles and Authentication

The `user_accounts` table will gain a role column with an allow-listed value:

- `USER`: default for existing and newly registered accounts.
- `ADVISER`: grants access to consultation administration only.

Registration requests cannot select or modify a role. The role is loaded into `UserPrincipal`. A normal account receives `ROLE_USER`; an adviser account receives both `ROLE_USER` and `ROLE_ADVISER` so it retains ordinary signed-in features while gaining the narrowly scoped adviser endpoints.

The shared `udajoedu@gmail.com` account must first be registered and email-verified through the existing flow. A one-time production database command will then promote exactly that normalised email address to `ADVISER`. The email address and password will not be hardcoded into application code or migrations. The account must sign out and sign in again after promotion so the new authority is present in its session.

Because the first release uses one shared account, audit records can identify the adviser account but cannot identify the individual staff member operating it. Moving to individual adviser accounts is the recommended later security improvement.

## Backend API

All adviser endpoints live below `/api/v1/adviser/consultations` and require `ROLE_ADVISER` on the server:

- `GET /api/v1/adviser/consultations`
  - Accepts bounded `page`, `size`, `status`, and `query` parameters.
  - Sorts by `createdAt DESC, id DESC` by default.
  - Returns page metadata and consultation summaries using the same filter predicate for the list and total count.
- `GET /api/v1/adviser/consultations/{referenceCode}`
  - Returns one complete consultation by its public UUID reference code.
  - Returns 404 only when the record does not exist.
- `PATCH /api/v1/adviser/consultations/{referenceCode}/status`
  - Accepts only `NEW`, `IN_PROGRESS`, or `COMPLETED`.
  - Requires the record version returned by the detail or list response.
  - Requires the existing CSRF protection.
  - Changes only status and status-update metadata.

The public `POST /api/v1/consultations` endpoint remains unchanged and continues to use its existing validation, payload limit, privacy consent, rate limiting, and availability controls.

The API will return explicit DTOs rather than serialising the JPA entity. Error responses will follow the existing stable API error format and will not leak database errors or sensitive consultation content.

## Database Changes

A new Flyway migration will:

1. Add `role` to `user_accounts` with `USER` as the non-null default and a constraint allowing only `USER` and `ADVISER`.
2. Replace the existing consultation status constraint, which currently permits only `NEW`, with a constraint allowing `NEW`, `IN_PROGRESS`, and `COMPLETED`.
3. Add `status_updated_at` to `consultation_enquiries`, initialised from `created_at` for existing rows.
4. Add `status_updated_by_user_id`, nullable for historical and newly submitted `NEW` rows, with a restricted foreign key to `user_accounts`.
5. Add a non-null optimistic-lock `version` column with a default of zero.
6. Add a composite `(status, created_at DESC, id DESC)` index while retaining the existing newest-first index for unfiltered lists.

No migration will insert a password, create the shared adviser account, or hardcode the adviser email address.

## Adviser Interface

The primary route is `/zh/adviser/consultations`, with the equivalent English route following the site's existing locale convention.

The page includes:

- A title and the signed-in account identity.
- Three status summary counts: 待处理, 跟进中, and 已完成.
- A search field for name, contact details, or reference code.
- A status filter.
- A newest-first table showing submission time, name, contact, intended university, intended course, qualification level, and status.
- Server-driven pagination.
- A detail view showing all stored submission fields, locale, privacy notice version, reference code, submission time, current status, and status-update time.
- A status control that changes only the processing state and gives clear pending, success, and failure feedback.

The interface will reuse the existing site tokens and component patterns, remain usable on mobile, preserve visible keyboard focus, and keep contact information readable without exposing it in URLs. Empty results, loading failures, and genuine zero-result searches will be shown as distinct states.

The adviser routes will opt out of search indexing and will not be linked from public navigation. Hiding the route is not a security control; both the frontend route guard and backend authority check remain required.

## Frontend Access Flow

1. An unauthenticated visitor requesting an adviser page is sent to the localised login page with a safe relative return destination.
2. After login, the frontend checks the authenticated session and its adviser authority.
3. A signed-in non-adviser receives a 403-style access-denied page and cannot call the adviser API successfully.
4. An adviser loads the list through the protected API.
5. Search, status filter, and page are represented in the page query string so refresh and browser navigation are stable.
6. Changing search or status resets pagination to the first page.
7. Status updates refresh the affected record and summary counts without treating request failures as empty data.

## Security and Privacy

- Spring Security enforces `ROLE_ADVISER` for every adviser endpoint.
- State-changing requests retain CSRF protection and same-origin cookie rules.
- Pagination and search lengths are bounded to prevent unbounded queries.
- Adviser pages send no-index directives.
- Consultation records cannot be deleted or edited in the first release.
- Application logs record the acting account ID, consultation ID or reference hash, prior status, new status, timestamp, outcome, and trace ID.
- Logs must not contain names, contact details, intended study information, or notes.
- API responses must not be cacheable by shared caches.
- Existing privacy notice and retention commitments continue to apply.

## Error Handling

- Authentication absence produces the existing unauthenticated response and login redirect behaviour.
- Insufficient authority produces 403, not an empty consultation list.
- Unknown consultation references produce 404.
- Invalid status transitions or malformed parameters produce validation errors.
- Database or API failures produce an error state with retry guidance; they are never displayed as "no consultations".
- Concurrent status updates use the persisted optimistic-lock version. A stale update receives a conflict response and the interface asks the adviser to reload instead of silently overwriting newer work.

## Testing and Acceptance

Backend tests will cover:

- Role migration defaults existing users to `USER`.
- Adviser authority is loaded into authenticated sessions.
- Anonymous and ordinary users cannot list, read, or update consultations.
- Advisers can list, search, filter, paginate, read details, and update status.
- List results and total counts use identical filters.
- Invalid status values, malformed reference codes, missing CSRF, and stale updates are rejected.
- Existing `NEW` records survive the migration.
- The public consultation submission flow remains unchanged.

Frontend tests will cover:

- Route protection and safe login return paths.
- Adviser list, detail, filtering, pagination, empty state, error state, and status feedback.
- Changing a filter resets to page one.
- A failed or stale request cannot replace newer results.
- Ordinary users never receive consultation data even when directly calling the API.

Release verification will include the existing backend test suite, frontend tests, lint, production build, migration compatibility checks, and a production smoke test using the verified adviser account.

## Production Setup

After the feature is merged and deployed:

1. Register `udajoedu@gmail.com` through the normal website registration flow.
2. Complete email verification.
3. Confirm the account is active in `user_accounts`.
4. Run a reviewed, exact SQL update that changes only this account's role to `ADVISER` and asserts that exactly one row changed.
5. Sign out and sign in again.
6. Verify the adviser can view a known consultation and update its status.
7. Verify a normal user and an anonymous browser receive no consultation data.

The SQL command and rollback command will be documented in the implementation runbook, but credentials and passwords will not be included.

## Deferred Work

- Individual adviser accounts and per-person attribution.
- Assignment of consultations to a specific adviser.
- Adviser notes and contact-history timelines.
- Excel or CSV export.
- Deletion, anonymisation, and retention automation.
- University, programme, article, or user administration.
- Management analytics and reporting dashboards.
