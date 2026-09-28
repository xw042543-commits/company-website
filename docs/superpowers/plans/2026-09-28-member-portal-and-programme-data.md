# Member Portal and Programme Data Implementation Plan

**Goal:** Make the public website explain UDAJO and its services, require a demo session for detailed tools, and publish the supplied programme data behind that access boundary.

**Architecture:** A pure access-policy module classifies routes and validates return destinations. Next.js 16 Proxy performs an optimistic cookie check for protected routes, while server helpers provide the access state to pages and navigation. Server Actions create and clear an HTTP-only demo cookie without receiving user credentials. The supplied workbooks are normalized into a static frontend fallback that keeps the existing backend programme contract intact.

**Tech stack:** Next.js 16 App Router, React 19, TypeScript, Node test runner, CSS.

---

## Task 1: Complete and validate the programme-data fallback

**Files:**

- Create: `frontend/src/data/local-programmes.generated.ts`
- Create: `frontend/src/data/local-programmes.ts`
- Modify: `frontend/src/lib/universities.ts`
- Modify: `frontend/src/lib/university-api.ts`
- Modify: `frontend/src/lib/universities.test.ts`
- Modify: `frontend/src/data/university-catalog.ts`

**Steps:**

1. Keep the failing tests that require local University of Malaya records, degree-level filtering and twelve-record pagination.
2. Normalize the supplied Bachelor, Master and Doctor records into bilingual local records. Include only universities already present in the reviewed catalogue.
3. Convert local records to the existing `UniversityProgrammePage` shape so a configured backend still takes precedence.
4. Preserve programme name, faculty, academic requirement, English requirement, duration, tuition, intake, mode, registration fee and interview status when supplied. Omit missing values.
5. Mark catalogue entries with programme data as available.
6. Run `npm run test:api` and confirm the new tests and existing API tests pass.

## Task 2: Define and test the access policy

**Files:**

- Create: `frontend/src/lib/access-policy.ts`
- Create: `frontend/src/lib/access-policy.test.ts`
- Modify: `frontend/package.json`

**Steps:**

1. Write failing tests for public routes, protected routes, locale preservation and safe relative `returnTo` values.
2. Implement route classification for public Home, About, Login, Register, password reset and error pages.
3. Protect Planning, Universities, Language, Scholarships, News and future member-tool routes.
4. Reject absolute URLs, protocol-relative URLs, encoded external URLs, login loops and cross-locale return values.
5. Add the test file to the frontend test command and run it red, then green.

## Task 3: Add the isolated demo-session interface

**Files:**

- Create: `frontend/src/lib/demo-session.ts`
- Create: `frontend/src/app/actions/demo-session.ts`
- Create: `frontend/src/lib/demo-session.test.ts`
- Modify: `frontend/package.json`

**Steps:**

1. Write failing tests for cookie-name/value constants, redirect fallback and sign-out destination.
2. Add a server-only session reader using asynchronous `cookies()`.
3. Add Server Actions that set or delete an HTTP-only, same-site cookie. Pass only locale and validated `returnTo`; never pass form credentials to the action.
4. Label the cookie and helpers as demo-only so the backend can replace them without changing consumers.
5. Run the focused tests and the full unit suite.

## Task 4: Guard protected routes with Next.js 16 Proxy

**Files:**

- Create: `frontend/src/proxy.ts`
- Create: `frontend/src/lib/proxy-access.test.ts`

**Steps:**

1. Write failing tests for anonymous protected-route redirects, authenticated pass-through and ignored static/API paths.
2. Implement an optimistic Proxy cookie check using the shared route policy.
3. Redirect anonymous users to `/{locale}/login?returnTo=<safe-relative-path>`.
4. Preserve query strings on the intended return destination.
5. Keep authorization warnings in code comments: Proxy improves navigation flow but does not replace backend authorization.
6. Run focused tests and TypeScript checking.

## Task 5: Render public and member navigation states

**Files:**

- Modify: `frontend/src/app/[locale]/layout.tsx`
- Modify: `frontend/src/components/site-chrome.tsx`
- Modify: `frontend/src/components/site-header.tsx`
- Modify: `frontend/src/lib/site.ts`
- Modify: `frontend/src/lib/site-content.test.ts`

**Steps:**

1. Write failing source/behavior tests for the two navigation sets and a sign-out action.
2. Read the demo session in the locale layout and pass a boolean to the shared chrome.
3. Show public navigation with Home, Services and About links plus Login and Create account.
4. Show the full tool navigation to signed-in users, replace account CTAs with Account and Sign out, and preserve language switching.
5. Keep the header fixed at the top while scrolling. Add a restrained scrolled-state divider or shadow without changing its height.
6. Add scroll margin for anchored sections so the sticky header does not cover their headings.
7. Ensure mobile menu behavior and active-link states work for anchors and nested protected routes.
8. Run company/content tests.

## Task 6: Connect login, phone, registration and WeChat preview flows

**Files:**

- Modify: `frontend/src/app/[locale]/login/page.tsx`
- Modify: `frontend/src/components/auth-account-panel.tsx`
- Modify: `frontend/src/components/login-form.tsx`
- Modify: `frontend/src/components/register-form.tsx`
- Modify: `frontend/src/components/wechat-login.tsx`
- Modify: `frontend/src/lib/login-auth-ui.test.ts`

**Steps:**

1. Write failing tests for preserving `returnTo`, creating a demo session after valid input and leaving password reset signed out.
2. Add client validation for required account, password and verification-code fields without sending those values to the Server Action.
3. On successful account, phone, registration or explicit WeChat preview completion, call the demo-session action and navigate to the validated destination.
4. Replace the current “nothing happens” preview copy with an honest demo-session notice.
5. Show clear loading, validation, error and success states with `aria-live` feedback.
6. Run authentication UI tests.

## Task 7: Make the public home page engaging and focused on conversion

**Files:**

- Modify: `frontend/src/app/[locale]/page.tsx`
- Create: `frontend/src/components/member-tools-preview.tsx`
- Modify: `frontend/src/app/globals.css`
- Modify: `frontend/src/lib/site-content.test.ts`
- Modify: `frontend/src/app/globals.test.ts`

**Design read:** Public education-services landing page for students and parents, calm and credible with purposeful energy. Reuse UDAJO green, warm paper and blue support tones. `DESIGN_VARIANCE: 5`, `MOTION_INTENSITY: 3`, `VISUAL_DENSITY: 5`.

**Steps:**

1. Write failing tests for public company/service content, member-tool preview and account CTAs, plus signed-in tool entry points.
2. Make the home page session-aware. Anonymous visitors see company positioning, service coverage, process, adviser access and a preview of protected tools. They do not see university records, programme search results or detailed planning controls.
3. Signed-in users see the tool-focused hero, university carousel, planning shortcuts and existing detailed sections.
4. Add one focused “Inside your account” preview showing planning, university comparison and programme information with Create account and Sign in actions.
5. Improve hierarchy with stronger section rhythm, one accent color, restrained illustrations made from existing brand assets and purposeful reveal/hover motion.
6. Verify focus, hover, active, disabled and reduced-motion states. Avoid extra gradients, nested cards and excessive color.
7. Run content and style tests.

## Task 8: Add programme level controls and polish programme cards

**Files:**

- Modify: `frontend/src/app/[locale]/universities/[slug]/page.tsx`
- Modify: `frontend/src/app/globals.css`
- Modify: `frontend/src/lib/site-content.test.ts`
- Modify: `frontend/src/app/globals.test.ts`

**Steps:**

1. Keep the failing tests for Bachelor, Master and Doctor filters and the review note.
2. Add compact accessible level links that preserve locale, clear pagination and indicate the selected filter.
3. Display the reviewed record count and explain that fees, entry requirements and intakes can change.
4. Refine programme cards into readable information rows with limited hover movement, consistent dividers and no nested-card treatment.
5. Check long bilingual names and mobile wrapping.
6. Run content and style tests.

## Task 9: Verify the complete experience

**Files:**

- Modify only files needed to resolve verified failures.

**Steps:**

1. Run `npm test`.
2. Run `npm run lint`.
3. Run `npx tsc --noEmit --incremental false`.
4. Run `npm run build`.
5. Start the local site and verify in English and Chinese:
   - public navigation and marketing home
   - protected-route redirect with preserved destination
   - account, phone, registration and WeChat demo entry
   - signed-in navigation and programme details
   - degree-level filters and pagination
   - sign-out and repeated protected-route access
   - sticky header behavior at the top and after scrolling
   - mobile and desktop layouts
6. Run the design-taste pre-flight review and fix material hierarchy, spacing, overflow, contrast, focus and motion issues.
7. Review the branch diff for generated-data anomalies, secrets, temporary files and unrelated changes.

## Task 10: Commit and prepare review

**Steps:**

1. Commit the normalized programme fallback separately from the access/session implementation where practical.
2. Commit the public-home and programme-interface polish.
3. Push the feature branch and create or update a pull request only when requested.
