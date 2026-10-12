# Public Website and Member Portal Design

## Goal

UDAJO visitors should understand the company before creating an account. Signed-in users should gain access to the study-planning tools and detailed education information. The frontend must support a temporary demo session while the production authentication backend is being developed.

## Audience and access

### Public visitors

Public visitors can access:

- Home
- About UDAJO
- Services overview
- Contact and enquiry information
- Login, registration and password-reset pages
- Legal and error pages

The public navigation focuses on the company, its services and account access. It does not expose links to private tools.

### Signed-in users

Signed-in users can additionally access:

- Planning tools
- University directory and university details
- Programme information
- Language services
- Scholarships
- News and future student tools

The signed-in navigation adds these destinations without changing the visual identity of the site.

## Route policy

A single route-policy module owns the distinction between public and protected routes. Pages and navigation read from that policy instead of duplicating route lists.

When an anonymous visitor requests a protected route, the frontend redirects to the localized login page with a safe relative `returnTo` value. After successful login, the user returns to that route. Unsafe, external or malformed return destinations fall back to the localized university directory.

Public pages never require a session. Missing pages continue to use the existing custom 404 experience.

## Temporary frontend session

Until the backend is connected, completing any login method creates a clearly identified demo session in a first-party cookie. The cookie contains no password, phone number, QR data or other personal information. It stores only a short demo-session marker.

The demo session exists for interface testing. It is not a security boundary and must not be described as production authentication. A visible sign-out action clears it and returns the user to the localized public home page.

The session helper is isolated behind a small interface so the backend implementation can later replace it with a signed, secure, HTTP-only session cookie without rewriting page components.

## Login and registration behavior

The current account, phone and WeChat options remain available. In demo mode, a valid completed form unlocks the portal and redirects to `returnTo`. Registration follows the same rule after the form reaches its success state. Password reset stays public and does not create a session.

The interface labels the environment as a frontend preview when demo authentication is active. It never claims that an account was created or verified by a server.

## Navigation and layout

The shared header receives the current access state:

- Anonymous: company and service links, language switcher, Login and Register.
- Signed in: full product navigation, language switcher, Account and Sign out.

The public home page leads with what UDAJO does, the services it provides and how to contact the company. Detailed universities, programmes and planning information remain behind the login boundary.

The header remains visible at the top of the viewport while users scroll. It gains a restrained divider or shadow after leaving the top of the page so it stays distinct from content. Its height remains stable to prevent layout movement, and anchored sections include enough scroll offset to remain visible below it.

The transition between public and signed-in areas uses the existing green design system, spacing and typography. No separate dashboard visual language is introduced.

## Programme data

The supplied Bachelor, Master and Doctor workbooks provide the local reviewed programme fallback. Programme records remain available only on protected university-detail routes. Degree-level filters support Bachelor, Master and Doctor records. Missing values are omitted or described as requiring adviser confirmation; the frontend does not invent data.

Programme fees, intakes and entry requirements include a review note because the supplied records may change. The future backend remains the source of truth once connected.

## Components and responsibilities

- `access-policy`: defines public and protected paths and validates `returnTo`.
- `demo-session`: reads, creates and clears the temporary frontend session.
- request guard or middleware: redirects anonymous protected requests.
- shared site chrome: renders public or signed-in navigation from access state.
- login and registration forms: create the demo session only after successful client-side validation.
- programme fallback module: normalizes supplied programme data into the existing API-compatible page shape.

Each unit has one responsibility and can be replaced independently when backend authentication arrives.

## Error handling

- Invalid or expired demo state is treated as signed out.
- Invalid `returnTo` values never navigate outside the website.
- Failed form validation keeps the user on the form with field-level messages.
- Missing programme data shows the existing adviser-contact empty state.
- Backend/API failures continue to use the existing custom error states.

## Accessibility and responsive behavior

- Login status and errors are announced to assistive technology.
- Navigation remains keyboard accessible and preserves visible focus styles.
- Protected-route redirects preserve locale.
- Public and signed-in navigation fit desktop and mobile layouts without horizontal clipping.
- The sticky header does not cover headings, focused controls or anchor destinations.
- Motion respects `prefers-reduced-motion`.

## Testing

Automated tests cover:

- public and protected route classification
- safe and unsafe `returnTo` values
- anonymous redirect behavior
- demo-session creation and sign-out
- public versus signed-in navigation
- login and registration redirect behavior
- programme fallback, level filtering and pagination
- English and Chinese routes

The final verification runs frontend tests, lint, TypeScript checking and a production build. Browser checks cover anonymous access, login, protected navigation, language switching, sign-out and responsive layouts.

## Backend handoff

Production deployment must replace the demo marker with server-issued authentication and enforce authorization in the backend/API. Protected programme and account data must not rely on frontend route hiding for security. The isolated session interface and shared route policy minimize the replacement work.
