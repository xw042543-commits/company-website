# Task 4: isolated sessions and bounded runs

Baseline: `e8b0e62`. Scope: session controller/service/repository/DTOs/worker, V36 migration, session/worker integration tests. No model implementation, paid API, deployment, push, new queue service, or SecurityConfig change. Existing `/api/v1/miniapp/**` USER protection is exercised through real bearer authentication.

## API and DTO contract

All endpoints start with `/api/v1/miniapp/me/planning-agent`. Owner comes exclusively from authenticated `UserPrincipal.userId()`, never a body or model argument.

| Method/path | Body | Response |
| --- | --- | --- |
| POST `/sessions` | `CreateSession(String ageBand,String privacyVersion)` | 201 `SessionCreated(UUID id)` |
| POST `/sessions/{id}/messages` | `MessageRequest(String requestKey,String text,Intent intent)` | 202 `RunAccepted(UUID runId,String status)` |
| GET `/sessions/{id}` | none | `SessionView(UUID id,Profile profile,List<Message> messages,List<RunView> runs)` |
| GET `/sessions/{id}/runs/{runId}` | none | `RunView(UUID runId,String status,String result,String errorCode)` |
| POST `/sessions/{id}/profile-confirmation` | `ProfileConfirmation(long version,Map<String,String> facts)` | `ProfileConfirmed(long confirmedVersion)` |
| DELETE `/sessions/{id}` | none | 204 |

`Message(long id,String role,String text,Instant createdAt)` uses USER/ASSISTANT. `Profile(long version,Map<String,String> facts)` is the existing EligibilityTypes contract. No profile initially means `{version:0,facts:{}}`. All IDs are UUIDs except message IDs. Intent is CHAT or GENERATE, omitted/null defaults to CHAT. CHAT works before confirmation; GENERATE requires current confirmed profile. Runs pin their profile version at enqueue.

Age bands are AGE_14_17 and AGE_18_PLUS; other values, including UNDER_14, are forbidden. Exact current privacyVersion is the explicit consent receipt; missing or stale versions are forbidden. Request keys are nonblank up to 100 characters, text nonblank up to 4000. Exact intent + text are hashed; a reused key with different intent/text conflicts. Same key/hash returns original runId and its current status without extra message/run rows. A different request during QUEUED/RUNNING conflicts. Profile edits also conflict while a run is active.

Confirmation.version is the expected current server version, not a client-selected next version. The server allocates immutable next version (first confirmation 0 -> 1) and confirms the supplied edited facts. Stale version conflicts. All client facts must be whitelisted, nonblank strings up to 500 characters; empty profile is rejected. The whitelist is:

```
targetLevel, education, qualification, curriculum, institution, major,
degreeAwarded, graduationStatus, grade, grade.scale,
languageTest, languageTotal, languageTotal.scale,
languageListening, languageListening.scale,
languageReading, languageReading.scale,
languageWriting, languageWriting.scale,
languageSpeaking, languageSpeaking.scale,
math, math.scale, science, science.scale,
budget, budgetCurrency, budgetPeriod, budgetIncludesLiving,
intake, subject, city, studyMode, researchDirection,
researchExperience, researchPlanReady, transferCredits, crossMajor
```

targetLevel accepts only persisted canonical FOUNDATION/BACHELOR/MASTER/DOCTOR. Subject grades use fixed math/science fields and scales, not arbitrary nested objects. No grades, intakes, currencies or conversions are guessed. country/studentScope cannot be supplied as client facts: the existing catalogue and EvidencePolicy restrict server tools to MY and CN_MAINLAND respectively.

Application errors: 401 AUTH_REQUIRED (security filter has its existing auth error format); 404 NOT_FOUND for absent/foreign session, foreign run, or run belonging to another owned session; 403 AGE_RESTRICTED / PRIVACY_CONSENT_REQUIRED; 400 INVALID_MESSAGE / INVALID_PROFILE (Bean Validation/invalid JSON retain existing framework validation handling); 409 IDEMPOTENCY_CONFLICT / RUN_ACTIVE / PROFILE_CONFIRMATION_REQUIRED / PROFILE_VERSION_CONFLICT; 503 PLANNING_DISABLED. Run errorCode values are RUNNER_UNAVAILABLE, RUN_FAILED, RUN_INTERRUPTED and DEADLINE_EXCEEDED. Internal exceptions are never returned to clients.

## Worker seam for Task 5

Register one Spring bean implementing:

```java
PlanningWorker.Runner {
    String execute(PlanningDtos.RunInput input, PlanningWorker.Guard guard) throws Exception;
}
PlanningWorker.Guard { void check(); }
RunInput(UUID runId, UUID sessionId, long ownerId, Intent intent, String text,
    EligibilityTypes.Profile profile, List<Message> messages, Instant deadline)
```

The returned String is persisted as result and one ASSISTANT message; Task 5 may serialize its validated plan there. Nonblank result max 64000 characters. Every runner model/tool call MUST invoke guard.check() immediately before starting. Guard checks current time, persisted status/token/deadline/lease and owner/session relationship. RunInput.ownerId is server sourced. No execution database transaction spans execute(). A missing Runner fails explicitly as FAILED/RUNNER_UNAVAILABLE; no fake successful reply.

Feature `app.planning-agent.enabled` defaults false. Configure nonblank `app.planning-agent.privacy-version` to accept creation. Scheduling additionally uses `app.planning-agent.scheduling-enabled` (default true) and `app.planning-agent.poll-interval-ms` (default 1000). Shared existing Clock is injected, no duplicate Clock bean.

V36 stores sessions, messages, immutable profiles and runs. A session row lock serializes admission, profile confirmation and completion; unique(session_id,request_key) and partial unique active-session index provide database backstops. A user message and its QUEUED run commit together. Claim is transactional FOR UPDATE SKIP LOCKED and assigns persisted random lease_token + lease_until. Absolute deadline is enqueue time + 60 seconds, including queue time, constrained by schema. Restart/poll expires queued and abandoned running rows at the persisted deadline; it never repeats a model execution under a new lease. Completion matches current RUNNING token and owner/session, locks session before writing, then rechecks Clock after lock acquisition. Deletion cascades all associated data and prevents late writeback.

Worker waits only until the persisted deadline using a cancellable virtual-thread Future, checks before/after execution, and cancels on expiry. A Java runner ignoring interruption can keep its own virtual thread alive until it returns, but cannot delay runOnce() past the deadline or write a late result; Task 5 must honor Guard and bound underlying I/O. No new external queue or model client was introduced.

## Verification evidence

Using Java 21 (`JAVA_HOME=/Library/Java/JavaVirtualMachines/temurin-21.jdk/Contents/Home`), Maven Wrapper, existing test profile and real local PostgreSQL 17.11 / Redis 8.2.9 / Elasticsearch 9.4.5 Testcontainers. Sandbox Docker socket access initially failed; an authorized local-test escalation allowed the actual containers to run. No production database was used.

Initial RED:

```
cd backend
JAVA_HOME=/Library/Java/JavaVirtualMachines/temurin-21.jdk/Contents/Home ./mvnw -Dtest=PlanningWorkerTest,PlanningSessionIntegrationTest test
```

Failed test compilation because PlanningDtos, PlanningSessionService, PlanningSessionRepository and PlanningWorker did not exist (`/private/tmp/task4-red.log`). First implemented behavior run passed 17 tests, 0 failures/errors (`/private/tmp/task4-green.log`). Expanded HTTP test initially used a session principal, which the existing miniapp bearer filter intentionally clears; corrected tests use persisted access-token fixtures through the real token authentication path. No authentication production change was required.

An additional behavioral RED reproduced result-commit lock waiting crossing deadline:

```
JAVA_HOME=/Library/Java/JavaVirtualMachines/temurin-21.jdk/Contents/Home ./mvnw -Dtest=PlanningWorkerTest#waitingForSessionLockCannotCommitSuccessAfterDeadline test
```

One failure, expected TIMED_OUT but was SUCCEEDED (`/private/tmp/task4-lock-red.log`). Fix: sample shared Clock again after obtaining the session lock. The final suite covers authenticated/unauthenticated HTTP, principal ownership and supplied owner ignored, foreign read/delete/confirm/message, mismatched run/session joins, age/privacy, disabled feature, profile confirmation/whitelist/stale version, same-key double requests, active run serialization, persisted queued/running restart expiry, successful assistant persistence outside transaction, stale lease, session deletion, missing runner, tool guard expiry, uncooperative runner timeout and late result rejection, and deadline consumed by lock waiting.

Final GREEN (2026-10-15 10:46:19 +08:00):

```
JAVA_HOME=/Library/Java/JavaVirtualMachines/temurin-21.jdk/Contents/Home ./mvnw -Dtest=PlanningWorkerTest,PlanningSessionIntegrationTest test
Tests run: 24, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS (34.392 s)
```

`/private/tmp/task4-final-tests.log` contains the full final run. The 24 executions comprise 8 session cases and 16 worker-class cases (the worker class reuses the session fixture and inherits those 8 isolation cases). The final worker cases include competing worker claims and the lock/deadline regression. All integration auth uses the existing local identity-provider configuration with real persisted bearer access tokens; no WeChat HTTP request occurs. `git diff --check` passed. Unrelated existing miniapp/project.config.json and concurrently created design/product files were left unstaged and unchanged by this task.
