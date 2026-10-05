# University Filter Category Hierarchy Implementation Plan

> **For Codex:** Execute this plan with TDD and verify each checkpoint before claiming completion.

**Goal:** Make a parent subject-category filter such as `BUSINESS` match universities whose same published programme has a published descendant category and the requested study level.

**Architecture:** Keep the frontend request contract and the existing nested Elasticsearch query. Expand validated category codes to their published descendants in the backend application layer before building the nested programme query. This preserves AND semantics across category and study level on one programme, while Elasticsearch continues to return one hit per university.

**Tech Stack:** Java 21, Spring Boot, Spring Data JPA, Elasticsearch, JUnit 5, Mockito, Next.js.

**Spec:** `docs/data/filter-test-matrix.md` plus the current task acceptance criteria.

---

### Task 1: Lock down category hierarchy behavior

**Files:**
- Create: `backend/src/test/java/com/yangdoujiao/website/search/v4/SubjectCategoryFilterExpanderTest.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/search/v4/SubjectCategoryFilterExpander.java`

1. Add a failing unit test proving `BUSINESS` expands to itself and all published descendants, excludes unrelated and draft categories, preserves `BACHELOR`, and avoids repository work when no category is selected.
2. Run the focused test and confirm it fails because the behavior is missing.
3. Implement the smallest cycle-safe hierarchy expansion using `SubjectCategoryRepository` and existing domain types.
4. Run the focused test and confirm it passes.

### Task 2: Wire expansion into the search pipeline

**Files:**
- Modify: `backend/src/main/java/com/yangdoujiao/website/search/v4/UniversitySearchV1Service.java`
- Modify: `backend/src/test/java/com/yangdoujiao/website/search/v4/UniversitySearchV1ServiceTest.java`

1. Add a failing service test proving user input is validated first and the expanded criteria is sent to the search gateway.
2. Inject the expander and apply it after validation but before querying Elasticsearch.
3. Run the service and query-factory unit tests.

### Task 3: Protect same-programme AND semantics and deduplication

**Files:**
- Modify: `backend/src/test/java/com/yangdoujiao/website/search/v4/query/ElasticsearchUniversitySearchGatewayIntegrationTest.java`

1. Add an acceptance fixture where one university has only business-master plus non-business-bachelor programmes, and another has a business-bachelor programme.
2. Query expanded business categories plus bachelor and assert only the second university is returned once.
3. Run the integration test when Docker is available; otherwise report the environment limitation and retain the independently verified unit/query tests.

### Task 4: Verify the complete filter matrix

**Files:**
- Verify existing frontend search tests and backend search tests; no frontend production change unless a failing test identifies one.

1. Verify blank country and keyword are omitted, filter changes reset page one, and list/count/pagination share one response.
2. Run backend focused tests, frontend focused tests, formatting/diff checks, and the broadest practical test suite.
3. Recheck the production API/data evidence and document the live database access limitation plus a recursive SQL verification query.
