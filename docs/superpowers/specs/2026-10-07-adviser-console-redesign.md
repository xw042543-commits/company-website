# Adviser Consultation Console Redesign Specification

## Purpose

Turn the existing adviser consultations page into a focused internal work console for authorised study-abroad advisers. The console must make submitted consultation details easy to scan and follow up without changing the underlying consultation workflow or exposing the page to ordinary users.

## Approved experience

- Use a restrained, professional dashboard treatment based on the existing UDAJO green design tokens.
- Present an internal workspace shell rather than the public marketing header and footer.
- Show the signed-in adviser, a clear page title, and a route back to the account page.
- Show total, new, in-progress, and completed counts as compact filter cards.
- Show whether public consultation submission is enabled or paused using the backend's actual `app.consultation.submission-enabled` setting.
- Use a master-detail layout on desktop: compact enquiry list on the left and a sticky detail panel on the right.
- Use a single-column card layout on narrow screens; selecting a record must move focus to the detail heading and closing it must restore focus to the opener.
- Keep search, status filtering, one-based pagination, latest-request cancellation, conflict handling, and versioned status updates.
- Prioritise name, contact, study intention, qualification, submission time, and workflow status.
- Put reference code, submission language, privacy notice version, updating account ID, timestamps, and record version in a collapsed `系统信息 / System information` disclosure.
- Provide safe contact actions only when the contact is recognisably an email address or telephone number. Do not guess an action for unknown contact formats.

## Security and data constraints

- `/api/v1/adviser/**` remains restricted to users with the `ADVISER` role.
- No delete, export, bulk-edit, or public sharing capability is added.
- The console only renders fields already returned by the adviser APIs.
- The collection-state banner is informational. It must not toggle production configuration from the browser.
- API response parsing remains strict and rejects additional or malformed fields.
- The public consultation feature remains controlled by `APP_CONSULTATION_SUBMISSION_ENABLED` and a non-blank `APP_CONSULTATION_PRIVACY_NOTICE_VERSION`.

## Accessibility and responsive requirements

- All controls have accessible names, visible focus styles, and at least 44 px interactive height on touch layouts.
- Status is not communicated by colour alone.
- Loading, failure, conflict, empty, and success states use appropriate live-region semantics.
- Desktop master-detail layout must not force horizontal page scrolling.
- Mobile list rows render as cards and the detail panel follows the list in document order.
- Reduced-motion preferences are respected.

## Out of scope

- Enabling production submission or editing production environment variables.
- Creating adviser accounts or changing roles.
- Export, deletion, assignment, adviser notes, analytics, or CRM integrations.
- Redesigning public consultation forms or unrelated account pages.

## Acceptance criteria

1. An authorised adviser can see the consultation count, filter/search records, open complete submitted details, and update status.
2. An ordinary or expired account is still redirected according to the existing security flow.
3. The page clearly reports whether public consultation submission is enabled.
4. Empty production data is distinguished from paused submission collection.
5. Desktop and mobile layouts remain usable without exposing technical metadata as primary content.
6. Existing backend, frontend, lint, and production deployment checks pass.
