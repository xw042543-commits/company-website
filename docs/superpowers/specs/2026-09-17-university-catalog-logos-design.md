# University catalogue and logo integration design

**Date:** 2026-09-17
**Status:** Approved

## Objective

Publish a reviewed bilingual university directory using the supplied university logos and verified identity data. Universities without programme records remain discoverable and show a clear programme-information-pending state. The programme spreadsheet is retained as source material for a later normalized import and is not imported in this change.

## Scope

- Add structured, bilingual university profiles for institutions with a supplied individual logo.
- Store names, aliases, country, city or campus, logo path, and programme availability in one frontend catalogue module.
- Use the catalogue as a reviewed fallback when the university API is not configured.
- Keep the data boundary compatible with future API records.
- Add logo presentation to directory cards and university detail pages.
- Search English names, Chinese names, and approved abbreviations.
- Show a bilingual programme-information-pending message where programme records are not ready.

## Institutions

The first catalogue covers the institutions that can be matched confidently to an individual supplied logo: University of Malaya, Universiti Kebangsaan Malaysia, Universiti Teknologi Malaysia, Universiti Putra Malaysia, Universiti Sains Malaysia, Universiti Utara Malaysia, Taylor's University, UCSI University, INTI International University, Sunway University, Asia Pacific University of Technology & Innovation, SEGi University, Universiti Tunku Abdul Rahman, Monash University Malaysia, University of Nottingham Malaysia, University of Southampton Malaysia, Heriot-Watt University Malaysia, Curtin University Malaysia, and University of Reading Malaysia.

Institutions without sufficient programme information remain visible with a pending state. No ranking, accreditation, fee, or marketing claim will be invented.

## Asset rules

- Prefer one clear individual logo per institution.
- Exclude collages, duplicate exports, promotional artwork, visibly distorted assets, and files that cannot be mapped confidently.
- Rename assets to stable lowercase ASCII filenames.
- Preserve original proportions with `object-fit: contain` inside a neutral logo surface.
- Provide meaningful alt text wherever a logo conveys identity.

## Data flow

`getSchools()` reads the configured API when available. When no API is configured, it returns the reviewed local catalogue rather than an empty state. API responses continue to use the same `SchoolSummary` type, extended with optional bilingual and presentation fields. Page components consume this single type and do not embed institution records.

## Interface behavior

Directory cards display logo, localized university name, location, programme status, and a detail link. Detail pages repeat the verified identity information, display the supplied logo, and provide a clear consultation action. Search matches normalized English names, Chinese names, abbreviations, and approved aliases. Missing descriptions or programme fields use explicit pending copy.

## Visual direction

The directory follows the existing UDAJO green system with moderate visual variation, restrained motion, and medium information density. Logos sit on consistent neutral surfaces so different aspect ratios remain legible. Mobile cards stack without cropping the logo.

## Verification

- Unit coverage for catalogue search and alias matching.
- Frontend ESLint and production build.
- Desktop and narrow viewport review for directory and detail pages.
- Backend test suite to confirm the frontend-only change does not disturb existing integration behavior.
