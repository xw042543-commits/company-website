# Malaysia official curriculum repair — 2026-10-14

## Scope and result

- Scope: published curriculum records imported from official Malaysian university pages.
- Audited records: 101 (Universiti Malaya 72, Taylor's University 29).
- Incorrect records found: 101.
- Corrected from retained official HTML snapshots: 101.
- Disabled among the reviewed set: 0.
- Clean official course-title lines after deduplication: 5,156.
- Additional unreviewed Malaysian records that still match contamination rules are archived by migration V38 instead of being displayed.

No non-Malaysian programme data is changed.

## Root cause

The crawler previously flattened an entire programme-structure container into newline-separated text. Headings, selection instructions, notes, percentages, entry requirements and navigation text therefore entered `CURRICULUM.body_en`. Website and mini-program parsers then interpreted many of those lines as course titles.

## Repair

- Curriculum extraction now accepts semantic leaf list items and Taylor's bullet-style module paragraphs only.
- Parent selection instructions, year/semester headings, entry requirements, percentages, notes, generic elective placeholders and navigation text are rejected.
- Import reconciliation validates every curriculum section before SQL generation and reports rejected sections.
- V38 replaces the 101 known contaminated records with course-title-only data from the retained official snapshots.
- Any additional suspicious published Malaysian curriculum is archived when it cannot be verified.
- Programme level, category, tuition fee, duration and admission requirements remain in their existing dedicated fields or sections.
- Website and mini-program parsing apply the same defensive rejection rules. If no verified official item remains, the mini-program displays `暂无官方课程资料`.

## Official sources

Each repaired row retains its programme-specific HTTPS source URL and original collection timestamp. The reviewed source domains are:

- Universiti Malaya: <https://study.um.edu.my/>
- Taylor's University: <https://university.taylors.edu.my/en/study/explore-all-programmes.html>

Examples used in end-to-end verification:

- UM Bachelor of Computer Science (Artificial Intelligence): <https://study.um.edu.my/bachelor-of-computer-science-artificial-intelligence>
- Taylor's Bachelor of Computer Science: <https://university.taylors.edu.my/en/study/explore-all-programmes/computer-science/undergraduate/bachelor-of-computer-science.html>

## Deployment verification

Deploy the backend so Flyway applies V38, then query published Malaysian curriculum sections for contamination patterns and confirm the API returns `sourceUrl` with course-title-only content. Rebuild the website and mini-program from the same revision. Client-side cache may take up to two minutes to expire.
