# UDAJO Frontend Brand Refresh Design

**Date:** 2026-09-17
**Status:** Approved for implementation planning

## Purpose

Refresh the existing bilingual UDAJO frontend so every public page uses the approved brand identity, presents a trustworthy study-abroad service, works well across desktop and mobile layouts, and remains honest about unfinished backend functionality.

## Confirmed Decisions

- UDAJO is the official English-facing brand name.
- The supplied logo is the official logo and must remain visually unchanged, including the lime circles.
- `#428675` is the primary UI green. Future interface elements that use green must use this color or an accessible lighter or darker shade derived from it.
- The current hero reserves a stable media container for a future approved photograph.
- Until a photograph is supplied, the media container uses a restrained green tint and the official logo as a watermark.
- Course search is the primary homepage action. Enquiry is the supporting action.
- The current unverified claim about being the first global digital platform is replaced with clear, defensible copy.
- The refresh covers the entire existing frontend, not only the homepage.
- The global wireframe banner and component-review link are removed from the public experience.
- Features that are not operational must retain concise, professionally styled notices so users are not misled.

## Design Direction

Reading this as a bilingual education consultancy platform for students and parents, with a calm, trustworthy, practical visual language inspired primarily by IDP's information hierarchy and secondarily by Educations.com's search clarity. The implementation will borrow interaction and content-structure principles without copying either website.

Design intensity:

- Design variance: 5/10
- Motion intensity: 3/10
- Visual density: 5/10

The design avoids decorative gradients, glass effects, excessive cards, oversized radii, generic equal-card grids, and ornamental animations.

## Brand System

### Color tokens

- `brand-500`: `#428675`, used for approved brand surfaces, active navigation, links, and decorative emphasis.
- `brand-700`: `#2F6D5F`, used for buttons containing white text.
- `brand-900`: `#173B33`, used for strong headings and text on pale green surfaces.
- `paper`: `#FBFCFB`, a green-tinted off-white.
- `wash`: `#F1F6F4`, a light green-neutral surface for grouped content.
- `ink`: `#172B27`, a near-black green-neutral for readable body copy.
- `muted`: `#536760`, a darker neutral that maintains WCAG AA contrast.
- `line`: `#CCDAD5`, a quiet green-neutral divider.
- Semantic error and warning colors remain distinct from the brand green.

The base `#428675` color is not used behind small white text unless the measured contrast passes WCAG AA. Darker derived shades are used where needed.

### Logo

The supplied UDAJO logo is added as a repository asset and used without recoloring, redrawing, or changing its proportions. The full logo appears in the header. The same asset may appear as a restrained watermark inside the temporary hero media panel.

### Typography

Use a bilingual system font stack led by Segoe UI for Latin text and Microsoft YaHei or Noto Sans SC when available for Chinese text. This avoids remote font requests and keeps rendering reliable. Heading scale, weight, and line height provide clear hierarchy. Body text remains between 65 and 75 characters per line where practical.

## Shared Layout

### Header

- Replace the text recreation with the official logo.
- Preserve the required navigation order: Home, Planning, Universities, Language, Scholarships, Study Abroad Programmes, News, About Us.
- Keep the language switch and Enquire action visible.
- Use a compact desktop header with a clear active state.
- Use an accessible disclosure-style mobile menu instead of wrapping navigation links across multiple lines.
- Retain the skip link and visible keyboard focus treatments.

### Footer

- Use consistent brand typography and spacing.
- Show only approved company and contact content.
- Do not expose development status, version labels, or placeholder marketing copy.

### Responsive behavior

- Desktop navigation remains on one line.
- Two-column content collapses to a single column below the appropriate breakpoint.
- Filter controls become a clear mobile disclosure panel.
- Interactive targets remain at least 44 by 44 pixels.
- Long English and Chinese headings must not overflow between breakpoints.

## Homepage

### Hero

- Replace the current headline with: `Find the right university and plan your next step abroad.`
- Use the Chinese headline: `找到适合你的院校，规划下一步留学之路。`
- Keep the course-search field and Find a course button as the dominant action.
- Present Enquire as a supporting action.
- Reserve a stable 4:3 media area for a future approved student or campus photograph.
- Until that photograph exists, show a quiet green-tinted field with the unchanged UDAJO logo as a watermark. Do not present it as a fake photograph or product screenshot.

### Benefits

Present the four existing benefits using an asymmetric text layout and dividers rather than four generic cards. Rewrite unsupported or negative statements into clear, positive, defensible descriptions without changing their intended meaning.

### Application process

Keep the five real sequential steps. The numbering remains valid because order conveys meaning. Improve visual progression across desktop and mobile without decorative animation.

## Planning and University Pages

- Refine filters, search inputs, results headings, cards, pagination, empty states, loading states, and error states under the shared brand system.
- Preserve current query parameters and existing frontend behavior.
- Keep approved alias-related messaging only where it helps the user.
- Use dividers and spacing for grouping. Use containers only where they communicate functional hierarchy.
- Preserve truthful pending states for filters or backend behavior that has not been connected.
- Make university cards easier to scan across bilingual content and narrow screens.

## Consultation Form

- Preserve the approved Q31 A field set: name, phone or WeChat, intended university, intended course, qualification level, notes, and privacy consent.
- Improve field grouping, required-state presentation, keyboard focus, disabled state, and explanatory messaging.
- Do not imply that submission works until the approved API, PostgreSQL persistence, privacy wording, and notification integration are operational.
- Prepare visual states for default, focus, disabled, loading, validation error, and success without inventing backend behavior.

## Other Content Pages

Apply the same page title rhythm, readable content width, section spacing, links, buttons, and truthful placeholder handling to Language, Scholarships, Study Abroad Programmes, News, About Us, loading, not-found, and error views.

## Interaction and Motion

- Use 160-220 millisecond transitions for hover and state feedback.
- Animate only opacity and transforms.
- Buttons use a subtle active press state.
- Hover and focus remain distinct.
- Respect `prefers-reduced-motion`.
- Do not add automatic carousels, parallax, scroll hijacking, or decorative entrance sequences.

## Accessibility

- Meet WCAG AA contrast for body text and controls.
- Preserve semantic landmarks, heading order, labels, skip navigation, and `aria-current` behavior.
- Provide visible `:focus-visible` styling.
- Maintain 44-pixel minimum touch targets.
- Ensure the mobile menu and filter disclosure expose correct expanded state.
- Keep validation messages adjacent to their fields and connect them with `aria-describedby` when validation becomes active.

## Implementation Boundaries

- Keep the existing Next.js and React architecture.
- Do not add a component library or animation dependency for this refresh.
- Reuse current routes, query parameters, server components, and data flow.
- Add only the smallest client-side behavior required for the mobile navigation and existing disclosures.
- Do not change backend APIs or claim unfinished backend behavior is complete.
- Do not alter the fixed navigation labels or order.

## Planned File Areas

- Global tokens and responsive styles in `frontend/src/app/globals.css`.
- Header and mobile navigation in `frontend/src/components/site-header.tsx` and a small isolated client component if needed.
- Brand asset under `frontend/public/brand/`.
- Homepage hierarchy and copy in `frontend/src/app/[locale]/page.tsx`.
- Shared result, filter, card, pagination, and consultation components.
- Existing locale content, loading, error, not-found, and section pages as needed for consistency.

## Verification and Completion Criteria

Implementation is complete only when all of the following pass:

1. ESLint completes without errors.
2. The Next.js production build completes successfully.
3. English and Chinese routes render without console or runtime errors.
4. Homepage, planning, universities, university details, consultation, content, loading, not-found, and error states are reviewed.
5. Desktop, tablet, and mobile layouts are visually checked.
6. Navigation, language switching, search, filters, pagination, and existing links are exercised.
7. Keyboard navigation, focus visibility, expanded states, labels, and touch target sizing are reviewed.
8. Brand green usage and text contrast are checked.
9. The supplied logo remains unchanged and correctly proportioned.
10. Development-only banners and review links are absent from public pages.
11. Incomplete functionality remains clearly and professionally disclosed.
12. A second critique and refinement pass is completed after the first implementation.

## Deferred Items

- Replacing the temporary hero media treatment with an approved photograph.
- Enabling consultation submission until its backend persistence, privacy language, and notification destination are complete.
- Adding final contact and footer information that has not yet been approved.
