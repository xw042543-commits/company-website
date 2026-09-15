# Backend Stabilization and API Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore a clean, tested backend baseline and introduce the reusable trace, error, and pagination contracts required by the new `/api/v1` APIs.

**Architecture:** Keep the existing modular monolith and demo endpoints intact. First repair the current multi-word search change on `chore/ci`; after its review gate, create a dedicated backend foundation branch and add small shared API components under `common` without changing the database schema.

**Tech Stack:** Java 21, Spring Boot 4.1.1, Spring MVC, Jakarta Validation, JUnit 6, Mockito, AssertJ, Maven Wrapper

**Spec:** `docs/superpowers/specs/2026-09-15-university-search-platform-design.md`

## Global Constraints

- PostgreSQL remains the source of truth; Redis is cache only and Elasticsearch is search only.
- Keep one Spring Boot modular monolith.
- Do not add microservices, Kafka, RabbitMQ, Kubernetes, MongoDB, MapStruct, or an admin authentication system.
- Do not modify the executed `V1__create_universities_table.sql` migration.
- Do not expose JPA entities through new API contracts.
- Do not remove `/api/search` or `/api/universities` in this phase.
- Do not log passwords, tokens, phone numbers, WeChat IDs, consultation remarks, or request bodies.
- Use the Maven Wrapper for every backend command.
- Stage files explicitly; never use `git add .` while unrelated working-tree changes exist.
- Stop at the review checkpoint after Task 1 before creating the new feature branch.

## Follow-on plans

This plan deliberately implements only the first independently reviewable slice of the approved specification. Separate plans will cover:

1. catalogue, university, programme, language, intake, and `/api/v1` database APIs;
2. employer-Excel mapping, dry-run validation, and atomic import after the actual file is available;
3. university-centred Elasticsearch mapping, nested filtering, index aliases, and PostgreSQL synchronization jobs;
4. Redis degradation, consultation protection, Actuator, OpenAPI, and final integration checks.

No requirement from those slices is silently implemented in this foundation branch.

---

## Planned file map

```text
backend/src/main/java/com/yangdoujiao/website/
|-- common/
|   |-- api/
|   |   |-- ApiErrorResponse.java       stable public error DTO
|   |   `-- PageResponse.java           stable public page DTO
|   |-- exception/
|   |   |-- ApiException.java           typed application exception
|   |   |-- ResourceNotFoundException.java
|   |   `-- GlobalExceptionHandler.java exception-to-HTTP mapping
|   `-- web/
|       `-- RequestTraceFilter.java      request trace creation/propagation
`-- search/
    |-- UniversitySearchRepository.java repaired safe demo query
    `-- UniversitySearchService.java    trims and delegates demo search

backend/src/test/java/com/yangdoujiao/website/
|-- common/
|   |-- api/PageResponseTest.java
|   |-- exception/GlobalExceptionHandlerTest.java
|   `-- web/RequestTraceFilterTest.java
`-- search/UniversitySearchServiceTest.java

docs/API.md                             shared API conventions
```

---

### Task 1: Repair and protect the current multi-word search fix

**Files:**
- Modify: `backend/src/main/java/com/yangdoujiao/website/search/UniversitySearchRepository.java`
- Modify: `backend/src/main/java/com/yangdoujiao/website/search/UniversitySearchService.java`
- Create: `backend/src/test/java/com/yangdoujiao/website/search/UniversitySearchServiceTest.java`

**Interfaces:**
- Consumes: existing `UniversityRepository`, `UniversitySearchRepository`, and `UniversitySearchDocument`
- Produces: `UniversitySearchService.search(String): List<UniversitySearchDocument>` that trims the input once and passes it as a typed repository parameter

- [ ] **Step 1: Add the regression test**

Create `UniversitySearchServiceTest.java`:

```java
package com.yangdoujiao.website.search;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.yangdoujiao.website.university.UniversityRepository;

@ExtendWith(MockitoExtension.class)
class UniversitySearchServiceTest {

    @Mock
    private UniversityRepository universityRepository;

    @Mock
    private UniversitySearchRepository universitySearchRepository;

    @InjectMocks
    private UniversitySearchService universitySearchService;

    @Test
    void passesTrimmedMultiWordQueryAsOneRepositoryParameter() {
        when(universitySearchRepository.search("United Kingdom")).thenReturn(List.of());

        List<UniversitySearchDocument> result =
                universitySearchService.search("  United Kingdom  ");

        assertThat(result).isEmpty();
        verify(universitySearchRepository).search("United Kingdom");
    }
}
```

- [ ] **Step 2: Run the regression test and confirm the baseline is broken**

Run from `backend/`:

```bash
./mvnw -Dtest=UniversitySearchServiceTest test
```

Expected: compilation fails because `UniversitySearchRepository.java` currently begins with an illegal `、` character and ends with pasted editor text. This confirms the failure is source corruption, not a Maven or Elasticsearch installation problem.

- [ ] **Step 3: Replace the corrupted repository source with the minimal safe version**

Use this complete content:

```java
package com.yangdoujiao.website.search;

import java.util.List;

import org.springframework.data.elasticsearch.annotations.Query;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

public interface UniversitySearchRepository
        extends ElasticsearchRepository<UniversitySearchDocument, String> {

    @Query("""
            {
              "multi_match": {
                "query": "?0",
                "fields": ["name", "country"]
              }
            }
            """)
    List<UniversitySearchDocument> search(String query);
}
```

Keep the current service implementation:

```java
public List<UniversitySearchDocument> search(String query) {
    return universitySearchRepository.search(query.trim());
}
```

- [ ] **Step 4: Run the focused test**

```bash
./mvnw -Dtest=UniversitySearchServiceTest test
```

Expected: `Tests run: 1, Failures: 0, Errors: 0` and `BUILD SUCCESS`.

- [ ] **Step 5: Run the complete backend test suite with local services**

From the repository root:

```bash
docker compose up -d --wait
```

Expected: PostgreSQL, Redis, and Elasticsearch report healthy.

Then from `backend/`:

```bash
./mvnw test
```

Expected: all tests pass and Maven prints `BUILD SUCCESS`.

- [ ] **Step 6: Review and commit only the search repair**

```bash
git diff --check
git diff -- backend/src/main/java/com/yangdoujiao/website/search backend/src/test/java/com/yangdoujiao/website/search
git add backend/src/main/java/com/yangdoujiao/website/search/UniversitySearchRepository.java
git add backend/src/main/java/com/yangdoujiao/website/search/UniversitySearchService.java
git add backend/src/test/java/com/yangdoujiao/website/search/UniversitySearchServiceTest.java
git commit -m "fix: support multi-word university searches"
```

Expected: the commit contains exactly two search source files and one regression test.

**Mandatory review checkpoint:** stop here. Review `git status`, the commit, and the `chore/ci` branch with the user. Do not create the backend foundation branch until the user decides how the CI branch will be integrated.

---

### Task 2: Create the backend foundation branch

**Files:**
- No source files changed

**Interfaces:**
- Consumes: the reviewed clean commit from Task 1
- Produces: isolated branch `feature/backend-foundation`

- [ ] **Step 1: Confirm the working tree is clean**

```bash
git status --short --branch
```

Expected: no modified or untracked source files. If changes exist, stop and classify each one; do not stash or discard them automatically.

- [ ] **Step 2: Create the feature branch from the user-approved base**

After the user confirms the base commit:

```bash
git switch -c feature/backend-foundation
```

Expected: `Switched to a new branch 'feature/backend-foundation'`.

- [ ] **Step 3: Record the branch baseline**

```bash
git status --short --branch
git log -3 --oneline
```

Expected: current branch is `feature/backend-foundation`, the tree is clean, and the reviewed search repair is present in recent history.

---

### Task 3: Add request trace propagation

**Files:**
- Create: `backend/src/main/java/com/yangdoujiao/website/common/web/RequestTraceFilter.java`
- Create: `backend/src/test/java/com/yangdoujiao/website/common/web/RequestTraceFilterTest.java`

**Interfaces:**
- Consumes: servlet requests and optional `X-Trace-Id` header
- Produces: `RequestTraceFilter.TRACE_ID_ATTRIBUTE`, response `X-Trace-Id` header, and MDC key `traceId`

- [ ] **Step 1: Write tests for generated and accepted trace IDs**

Create `RequestTraceFilterTest.java`:

```java
package com.yangdoujiao.website.common.web;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.slf4j.MDC;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

class RequestTraceFilterTest {

    private final RequestTraceFilter filter = new RequestTraceFilter();

    @Test
    void generatesTraceIdWhenHeaderIsMissing() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/v1/test");
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilter(request, response, new MockFilterChain());

        assertThat(response.getHeader(RequestTraceFilter.TRACE_ID_HEADER)).isNotBlank();
        assertThat(request.getAttribute(RequestTraceFilter.TRACE_ID_ATTRIBUTE))
                .isEqualTo(response.getHeader(RequestTraceFilter.TRACE_ID_HEADER));
        assertThat(MDC.get(RequestTraceFilter.TRACE_ID_MDC_KEY)).isNull();
    }

    @Test
    void reusesValidIncomingTraceId() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/v1/test");
        request.addHeader(RequestTraceFilter.TRACE_ID_HEADER, "frontend-123");
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilter(request, response, new MockFilterChain());

        assertThat(response.getHeader(RequestTraceFilter.TRACE_ID_HEADER))
                .isEqualTo("frontend-123");
    }
}
```

- [ ] **Step 2: Run the tests and verify they fail**

```bash
./mvnw -Dtest=RequestTraceFilterTest test
```

Expected: test compilation fails because `RequestTraceFilter` does not exist.

- [ ] **Step 3: Implement the trace filter**

Create `RequestTraceFilter.java`:

```java
package com.yangdoujiao.website.common.web;

import java.io.IOException;
import java.util.UUID;
import java.util.regex.Pattern;

import org.slf4j.MDC;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class RequestTraceFilter extends OncePerRequestFilter {

    public static final String TRACE_ID_HEADER = "X-Trace-Id";
    public static final String TRACE_ID_ATTRIBUTE = RequestTraceFilter.class.getName() + ".traceId";
    public static final String TRACE_ID_MDC_KEY = "traceId";

    private static final Pattern SAFE_TRACE_ID = Pattern.compile("[A-Za-z0-9._-]{1,64}");

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        String traceId = resolveTraceId(request.getHeader(TRACE_ID_HEADER));
        request.setAttribute(TRACE_ID_ATTRIBUTE, traceId);
        response.setHeader(TRACE_ID_HEADER, traceId);
        MDC.put(TRACE_ID_MDC_KEY, traceId);

        try {
            filterChain.doFilter(request, response);
        } finally {
            MDC.remove(TRACE_ID_MDC_KEY);
        }
    }

    private String resolveTraceId(String candidate) {
        if (candidate != null && SAFE_TRACE_ID.matcher(candidate).matches()) {
            return candidate;
        }
        return UUID.randomUUID().toString();
    }
}
```

- [ ] **Step 4: Run focused tests and commit**

```bash
./mvnw -Dtest=RequestTraceFilterTest test
git add backend/src/main/java/com/yangdoujiao/website/common/web/RequestTraceFilter.java
git add backend/src/test/java/com/yangdoujiao/website/common/web/RequestTraceFilterTest.java
git commit -m "feat: add request trace propagation"
```

Expected: both tests pass and the commit contains only the filter and its test.

---

### Task 4: Introduce the stable API error contract

**Files:**
- Modify: `backend/src/main/java/com/yangdoujiao/website/common/api/ApiErrorResponse.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/common/exception/ApiException.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/common/exception/ResourceNotFoundException.java`
- Modify: `backend/src/main/java/com/yangdoujiao/website/common/exception/GlobalExceptionHandler.java`
- Create: `backend/src/test/java/com/yangdoujiao/website/common/exception/GlobalExceptionHandlerTest.java`

**Interfaces:**
- Consumes: `RequestTraceFilter.TRACE_ID_ATTRIBUTE`, validation exceptions, typed `ApiException`, unexpected exceptions
- Produces: `ApiErrorResponse(String code, String message, Map<String, String> fieldErrors, String traceId)`

- [ ] **Step 1: Write focused handler tests**

Create `GlobalExceptionHandlerTest.java`:

```java
package com.yangdoujiao.website.common.exception;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpServletRequest;

import com.yangdoujiao.website.common.api.ApiErrorResponse;
import com.yangdoujiao.website.common.web.RequestTraceFilter;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void mapsTypedExceptionWithoutExposingInternalDetails() {
        MockHttpServletRequest request = requestWithTraceId();

        ResponseEntity<ApiErrorResponse> response = handler.handleApiException(
                new ResourceNotFoundException("University not found"),
                request
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(response.getBody()).isEqualTo(new ApiErrorResponse(
                "RESOURCE_NOT_FOUND",
                "University not found",
                java.util.Map.of(),
                "test-trace"
        ));
    }

    @Test
    void mapsUnexpectedExceptionToSafeMessage() {
        ResponseEntity<ApiErrorResponse> response = handler.handleUnexpected(
                new IllegalStateException("database password must not escape"),
                requestWithTraceId()
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
        assertThat(response.getBody().code()).isEqualTo("INTERNAL_ERROR");
        assertThat(response.getBody().message()).isEqualTo("An unexpected error occurred");
        assertThat(response.getBody().toString()).doesNotContain("database password");
    }

    private MockHttpServletRequest requestWithTraceId() {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/v1/test");
        request.setAttribute(RequestTraceFilter.TRACE_ID_ATTRIBUTE, "test-trace");
        return request;
    }
}
```

- [ ] **Step 2: Run tests and verify the contract does not yet exist**

```bash
./mvnw -Dtest=GlobalExceptionHandlerTest test
```

Expected: test compilation fails because the new DTO constructor, exception types, and handler method do not exist.

- [ ] **Step 3: Replace the error DTO**

Use this complete `ApiErrorResponse.java`:

```java
package com.yangdoujiao.website.common.api;

import java.util.Map;

public record ApiErrorResponse(
        String code,
        String message,
        Map<String, String> fieldErrors,
        String traceId
) {
    public ApiErrorResponse {
        fieldErrors = fieldErrors == null ? Map.of() : Map.copyOf(fieldErrors);
    }
}
```

- [ ] **Step 4: Add typed application exceptions**

Create `ApiException.java`:

```java
package com.yangdoujiao.website.common.exception;

import org.springframework.http.HttpStatus;

public class ApiException extends RuntimeException {

    private final HttpStatus status;
    private final String code;

    public ApiException(HttpStatus status, String code, String message) {
        super(message);
        this.status = status;
        this.code = code;
    }

    public HttpStatus getStatus() {
        return status;
    }

    public String getCode() {
        return code;
    }
}
```

Create `ResourceNotFoundException.java`:

```java
package com.yangdoujiao.website.common.exception;

import org.springframework.http.HttpStatus;

public class ResourceNotFoundException extends ApiException {

    public ResourceNotFoundException(String message) {
        super(HttpStatus.NOT_FOUND, "RESOURCE_NOT_FOUND", message);
    }
}
```

- [ ] **Step 5: Replace the global exception handler**

Implement these handlers in `GlobalExceptionHandler.java`:

```java
package com.yangdoujiao.website.common.exception;

import java.util.LinkedHashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.HandlerMethodValidationException;

import com.yangdoujiao.website.common.api.ApiErrorResponse;
import com.yangdoujiao.website.common.web.RequestTraceFilter;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ApiErrorResponse> handleApiException(
            ApiException exception,
            HttpServletRequest request
    ) {
        return buildResponse(
                exception.getStatus(),
                exception.getCode(),
                exception.getMessage(),
                Map.of(),
                request
        );
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleBodyValidation(
            MethodArgumentNotValidException exception,
            HttpServletRequest request
    ) {
        Map<String, String> fieldErrors = new LinkedHashMap<>();
        exception.getBindingResult().getFieldErrors().forEach(error ->
                fieldErrors.putIfAbsent(error.getField(), error.getDefaultMessage())
        );

        return buildResponse(
                HttpStatus.BAD_REQUEST,
                "VALIDATION_ERROR",
                "Request validation failed",
                fieldErrors,
                request
        );
    }

    @ExceptionHandler({HandlerMethodValidationException.class, ConstraintViolationException.class})
    public ResponseEntity<ApiErrorResponse> handleRequestValidation(
            Exception exception,
            HttpServletRequest request
    ) {
        return buildResponse(
                HttpStatus.BAD_REQUEST,
                "VALIDATION_ERROR",
                "Request validation failed",
                Map.of(),
                request
        );
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleUnexpected(
            Exception exception,
            HttpServletRequest request
    ) {
        log.error(
                "Unhandled exception type={} for {} {} traceId={}",
                exception.getClass().getName(),
                request.getMethod(),
                request.getRequestURI(),
                request.getAttribute(RequestTraceFilter.TRACE_ID_ATTRIBUTE)
        );
        return buildResponse(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "INTERNAL_ERROR",
                "An unexpected error occurred",
                Map.of(),
                request
        );
    }

    private ResponseEntity<ApiErrorResponse> buildResponse(
            HttpStatus status,
            String code,
            String message,
            Map<String, String> fieldErrors,
            HttpServletRequest request
    ) {
        Object traceId = request.getAttribute(RequestTraceFilter.TRACE_ID_ATTRIBUTE);
        ApiErrorResponse body = new ApiErrorResponse(
                code,
                message,
                fieldErrors,
                traceId == null ? "unavailable" : traceId.toString()
        );
        return ResponseEntity.status(status).body(body);
    }
}
```

- [ ] **Step 6: Run focused and full tests**

```bash
./mvnw -Dtest=GlobalExceptionHandlerTest,RequestTraceFilterTest test
./mvnw test
```

Expected: both focused tests and the complete backend suite pass.

- [ ] **Step 7: Review and commit the error contract**

```bash
git diff --check
git diff -- backend/src/main/java/com/yangdoujiao/website/common backend/src/test/java/com/yangdoujiao/website/common
git add backend/src/main/java/com/yangdoujiao/website/common/api/ApiErrorResponse.java
git add backend/src/main/java/com/yangdoujiao/website/common/exception/ApiException.java
git add backend/src/main/java/com/yangdoujiao/website/common/exception/ResourceNotFoundException.java
git add backend/src/main/java/com/yangdoujiao/website/common/exception/GlobalExceptionHandler.java
git add backend/src/test/java/com/yangdoujiao/website/common/exception/GlobalExceptionHandlerTest.java
git commit -m "feat: standardize API error responses"
```

Expected: one focused commit with no controller, entity, migration, or configuration changes.

---

### Task 5: Add the reusable page response

**Files:**
- Create: `backend/src/main/java/com/yangdoujiao/website/common/api/PageResponse.java`
- Create: `backend/src/test/java/com/yangdoujiao/website/common/api/PageResponseTest.java`

**Interfaces:**
- Consumes: item list, one-based page number, page size, total item count
- Produces: `PageResponse.of(List<T>, int, int, long): PageResponse<T>` with calculated total pages

- [ ] **Step 1: Write page calculation tests**

Create `PageResponseTest.java`:

```java
package com.yangdoujiao.website.common.api;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.List;

import org.junit.jupiter.api.Test;

class PageResponseTest {

    @Test
    void calculatesTotalPagesUsingOneBasedPublicPageNumber() {
        PageResponse<String> response = PageResponse.of(
                List.of("a", "b"),
                2,
                12,
                25
        );

        assertThat(response.page()).isEqualTo(2);
        assertThat(response.pageSize()).isEqualTo(12);
        assertThat(response.totalItems()).isEqualTo(25);
        assertThat(response.totalPages()).isEqualTo(3);
        assertThat(response.items()).containsExactly("a", "b");
    }

    @Test
    void reportsZeroPagesForAnEmptyResult() {
        PageResponse<String> response = PageResponse.of(List.of(), 1, 12, 0);
        assertThat(response.totalPages()).isZero();
    }

    @Test
    void rejectsInvalidPageArguments() {
        assertThatThrownBy(() -> PageResponse.of(List.of(), 0, 12, 0))
                .isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> PageResponse.of(List.of(), 1, 0, 0))
                .isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> PageResponse.of(List.of(), 1, 12, -1))
                .isInstanceOf(IllegalArgumentException.class);
    }
}
```

- [ ] **Step 2: Run the test and verify it fails**

```bash
./mvnw -Dtest=PageResponseTest test
```

Expected: test compilation fails because `PageResponse` does not exist.

- [ ] **Step 3: Implement the immutable page DTO**

Create `PageResponse.java`:

```java
package com.yangdoujiao.website.common.api;

import java.util.List;

public record PageResponse<T>(
        List<T> items,
        int page,
        int pageSize,
        long totalItems,
        int totalPages
) {
    public PageResponse {
        items = List.copyOf(items);
    }

    public static <T> PageResponse<T> of(
            List<T> items,
            int page,
            int pageSize,
            long totalItems
    ) {
        if (page < 1) {
            throw new IllegalArgumentException("page must be at least 1");
        }
        if (pageSize < 1) {
            throw new IllegalArgumentException("pageSize must be at least 1");
        }
        if (totalItems < 0) {
            throw new IllegalArgumentException("totalItems must not be negative");
        }

        int totalPages = totalItems == 0
                ? 0
                : Math.toIntExact((totalItems + pageSize - 1) / pageSize);
        return new PageResponse<>(items, page, pageSize, totalItems, totalPages);
    }
}
```

- [ ] **Step 4: Run the test and commit**

```bash
./mvnw -Dtest=PageResponseTest test
git add backend/src/main/java/com/yangdoujiao/website/common/api/PageResponse.java
git add backend/src/test/java/com/yangdoujiao/website/common/api/PageResponseTest.java
git commit -m "feat: add reusable page response"
```

Expected: three page tests pass and the commit contains only the DTO and its test.

---

### Task 6: Document and verify the API foundation

**Files:**
- Create: `docs/API.md`

**Interfaces:**
- Consumes: `ApiErrorResponse`, `PageResponse`, request trace header
- Produces: team-readable API rules used by frontend, backend, testing, and future AI sessions

- [ ] **Step 1: Create the API convention document**

Create `docs/API.md` with this content:

```markdown
# API Conventions

## Base path

New public endpoints use `/api/v1`. Existing `/api/search` and `/api/universities` endpoints remain temporary compatibility endpoints until frontend migration is reviewed.

## Trace ID

Every response includes `X-Trace-Id`. A client may send a safe `X-Trace-Id` containing 1–64 letters, digits, dots, underscores, or hyphens. The backend generates a UUID when the value is missing or invalid.

## Errors

Errors use `code`, `message`, `fieldErrors`, and `traceId`. Production responses never include Java stack traces, credentials, contact values, remarks, or full request bodies.

```json
{
  "code": "VALIDATION_ERROR",
  "message": "Request validation failed",
  "fieldErrors": {
    "size": "must be less than or equal to 48"
  },
  "traceId": "frontend-123"
}
```

## Pagination

Public page numbers are one-based. New paginated endpoints return `items`, `page`, `pageSize`, `totalItems`, and `totalPages`. University search defaults to 12 items and rejects sizes above 48.

```json
{
  "items": [],
  "page": 1,
  "pageSize": 12,
  "totalItems": 0,
  "totalPages": 0
}
```
```

- [ ] **Step 2: Run complete verification**

From the repository root:

```bash
docker compose config --quiet
docker compose up -d --wait
```

Expected: Compose configuration is valid and all configured services become healthy.

From `backend/`:

```bash
./mvnw clean test
```

Expected: Maven prints `BUILD SUCCESS`.

From the repository root:

```bash
npm --prefix frontend run lint
npm --prefix frontend run build
git diff --check
git status --short
```

Expected: frontend lint/build pass, `git diff --check` prints nothing, and only `docs/API.md` is uncommitted.

- [ ] **Step 3: Commit the API documentation**

```bash
git add docs/API.md
git commit -m "docs: define API response conventions"
```

- [ ] **Step 4: Final phase review**

```bash
git status --short --branch
git log --oneline --decorate -6
```

Expected: the feature branch is clean and contains separate commits for trace propagation, error responses, pagination, and API documentation. Stop for user review before planning catalogues or database migrations.

## Phase completion criteria

- The corrupted search repository compiles and has a multi-word regression test.
- Existing demo endpoints still compile and run.
- Every request receives a safe trace ID.
- Typed and unexpected exceptions return the approved safe error shape.
- A reusable one-based pagination response is tested.
- Full backend tests, frontend lint/build, and Compose validation pass.
- No database migrations or business entities change in this phase.
- No secret or personal data is added to source, tests, logs, or documentation.
