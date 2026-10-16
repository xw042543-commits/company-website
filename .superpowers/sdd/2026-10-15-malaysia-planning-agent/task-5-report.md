# Task 5: controlled planning orchestrator

Baseline: `a113e93`. Implemented only the scoped backend planning orchestrator, read-only metadata query, worker availability mapping and regressions. No provider, paid API, deployment, push, write tool, application, payment, contact or saved-plan action was added. Existing unrelated miniapp/project.config.json and controller design/product files were not modified or staged by this task.

## Implementation and downstream contracts

- `PlanningOrchestrator` implements the Task 4 `PlanningWorker.Runner` and is registered by `PlanningAgentConfiguration`. Its optional `PlanningModel` defaults to absent. Absence throws `ModelUnavailable`; the worker unwraps the execution future and persists FAILED/RUNNER_UNAVAILABLE, with no fake assistant success.
- `PlanningModel.next(ModelContext)` receives no owner/session/run identifiers. The context has `redactedMessages`, `confirmedProfile`, `results`, and an absolute deadline. Each model call is checked by the worker guard immediately before invocation, bounded by a cancellable virtual-thread Future, and checked again afterward. The run deadline is capped at 60 seconds and does not reset between tool/model calls.
- `ModelInputSanitizer.sanitize(RunInput,List<ToolResult>)` is the explicit Task 6 seam. A conditional default bean, `ModelInputSanitizer.VersionOnly`, sends no raw messages and only the profile version with an empty facts map. Tool results are deep copied before reaching the model. Task 6 can replace this bean with a reviewed allowlist/privacy filter and wrap Runner/model access with its rate/cost gates. Server owner information can be used in the outer gate, but must never be added to ModelContext. This default deliberately cannot conduct a functional production conversation. No model provider is installed or enabled by this task.
- The dispatcher always uses the immutable full confirmed server profile, separately from model input. `search_programmes` accepts only optional integral `page` 0..100; targetLevel, subject and city come from confirmed facts. The other three tools accept only a positive integral `programmeId` from this execution's search results. Intake and budget scope come exclusively from the server profile. No tool accepts evidence IDs, SQL, URL, owner, amounts or arbitrary filters. Only `search_programmes`, `get_programme_evidence`, `evaluate_eligibility`, `calculate_budget` exist. The ninth model-requested tool invocation is rejected; invalid tools/arguments fail closed.
- Tool evidence output contains only programme/evidence IDs. Raw evidence excerpts and URLs are not sent to the model. Eligibility and budget tool results contain server-calculated values. All model/tool calls and server finalization reads invoke Guard before execution. Final validation performs internal read-only reassembly rather than trusting a model's prior assessment or budget; those internal reads are not additional model-requested tool invocations.
- The trusted execution state owns candidate IDs and evidence provenance. For this reason the validator intentionally strengthens the planned two-argument signature to `validate(PlanDraft, ModelContext serverContext, ToolDispatcher.State)`: providers never receive State, and model JSON cannot manufacture provenance. This is an internal implementation API, not an HTTP DTO.
- External providers must use `AgentReply.decode(String,ObjectMapper)` for closed JSON parsing. It rejects unknown/missing fields, duplicate keys, trailing documents, wrong types, numeric/string coercion, oversized arrays/payloads, and unknown final factual fields. The project uses its existing Jackson 3 `tools.jackson` runtime. Direct typed replies are additionally shape checked by the orchestrator. One malformed-schema repair is permitted, indicated by a safe `format_repair` result with `INVALID_REPLY_SCHEMA`; a second malformed reply fails. Unknown tool/security violations are never repaired into accepted operations.
- Only confirmed GENERATE can produce a plan; CHAT can return controlled clarification questions. An absent/invalid target level or absent intake yields a controlled question before any search. No chat text is inferred into confirmed facts. At most two questions are returned. Question IDs are `CONFIRM_PROFILE`, `TARGET_LEVEL`, `INTAKE`, `EDUCATION`, `LANGUAGE`, `BUDGET`. General step IDs are `PREPARE_DOCUMENTS`, `PREPARE_LANGUAGE`, `CONFIRM_WITH_UNIVERSITY`. Task 7 should render localized controlled copy for these IDs; arbitrary model prose is never persisted as final claims.

## Serialized result contract for Task 7

Runner returns serialized `Response(String type,List<String> questions,ValidatedPlan plan)` with type QUESTIONS or PLAN. Question responses have a null plan; plan responses have an empty questions list. Task 4 persists the result string and one ASSISTANT message only on success.

`ValidatedPlan(long profileVersion,List<ProgrammeDecision> programmes,List<String> generalNextSteps)` contains zero to five programmes. Empty results remain empty. Search uses existing exact preferences and results are sorted by ELIGIBLE, NOT_MET, UNKNOWN, then ascending programmeId. NOT_MET is an explicit difference classification and must not be rendered as a recommendation. An OR rule is definitely NOT_MET only if every branch has a definite failing condition; otherwise unknown branches remain UNKNOWN. Existing Assessment findings preserve MET, NOT_MET, PROFILE_MISSING and EVIDENCE_MISSING separately.

`ProgrammeDecision` has the originally specified programmeId/assessment/budget/evidenceIds plus server-derived fields:

```
classification
programmeNameZh, programmeNameEn, universityNameZh, universityNameEn
Long ruleVersion
RuleSet ruleSnapshot
List<EvidenceSnapshot> evidenceSnapshot
```

EvidenceSnapshot has id, programmeId, factType, sourceUrl, sourceType, studentScope, intake, checkedAt and expiresAt. It excludes excerpts and reviewer identity. URLs pass the existing evidence policy (HTTPS, real host, no user info) and come exclusively from currently verified official CN_MAINLAND sources for the confirmed intake. No image URL was added because no trivial established safe-media mapping was necessary; Task 7 should gracefully omit images. English university name falls back only to its existing persisted legacy name.

Final validation runs in a repeatable-read read-only transaction and checks publication in MY again, refetches current evidence and rules, evaluates eligibility again, and recalculates stored fees through existing PlanningTools. Every selected programme needs evidence fetched in this run, and the draft must cite the complete current valid source set for that programme; forged IDs, cross-programme sources, omitted sources, revoked/expired sources and publication withdrawal fail closed. Snapshot changes after the original evidence read require a fresh run rather than borrowing new sources silently. Rule expected values lacking valid admissions proof are removed from the final ruleSnapshot while their EVIDENCE_MISSING findings remain visible. Rule version remains available even for an incomplete/unknown snapshot.

The eligibility evaluator now explicitly requires ADMISSIONS fact type; FEES evidence cannot substantiate an admission requirement. Budgets still use persisted amounts and existing mixed-currency/no-FX behavior. Explicit budgetIncludesLiving true requests TUITION/TAX/LIVING, false requests TUITION/TAX. Missing/invalid living scope requests all categories conservatively, preserves sourced subtotals, forces complete=false and appends `profile:budgetIncludesLiving`. No affordability or currency conversion claim is invented.

## TDD evidence

All commands used Java 21 and the Maven wrapper from backend:

```
JAVA_HOME=/Library/Java/JavaVirtualMachines/temurin-21.jdk/Contents/Home ./mvnw ... test
```

Initial RED: `-Dtest=PlanningOrchestratorTest,PlanValidatorTest,EligibilityEvaluatorTest`; test compilation failed because the new model/orchestrator/validator contracts did not exist (`/private/tmp/task5-red.log`). The first behavioral pass exposed Jackson-2 test serialization against this Jackson-3 application; imports and test mapper were corrected to the existing runtime, without adding/upgrading dependencies.

Additional behavioral RED runs:

- `PlanningWorkerTest#registeredOrchestratorWithoutProviderFailsAsUnavailable`: expected RUNNER_UNAVAILABLE, actual RUN_FAILED (`/private/tmp/task5-worker-red-docker.log`). Fixed ExecutionException unwrapping. Disposable local Docker test access was explicitly escalated after sandbox socket denial; no production DB was used.
- `EligibilityEvaluatorTest#feesEvidenceCannotEstablishAdmissionsEligibility`: expected false, actual true when the ADMISSIONS guard was temporarily reverted (`/private/tmp/task5-admissions-red.log`); guard restored and test passed.
- `PlanValidatorTest#unverifiedRuleExpectedValuesCannotEscapeIntoFinalClaims`: unverified requirement text leaked through raw ruleSnapshot (`/private/tmp/task5-claims-red.log`); final snapshot now filters EVIDENCE_MISSING conditions.
- `PlanningCatalogueIntegrationTest#displayUsesPersistedNamesAndDisappearsOnUnpublication`: expected persisted legacy university name, actual null (`/private/tmp/task5-display-red.log`); read query now falls back to persisted legacy name.
- `PlanningOrchestratorTest#providerDecoderRejectsDuplicateFieldsAndTrailingDocuments`: expected rejection, decoder accepted duplicate keys (`/private/tmp/task5-strict-red.log`); strict duplicate/trailing-document rejection added.
- `PlanValidatorTest#unconfirmedLivingScopeCannotProduceACompleteBudget`: expected false, actual true (`/private/tmp/task5-scope-red.log`); missing living-scope now stays incomplete.

Focused GREEN after final scope refinement: `-Dtest=PlanningOrchestratorTest,PlanValidatorTest,EligibilityEvaluatorTest` -> 56 tests, 0 failures/errors/skips, BUILD SUCCESS (`/private/tmp/task5-focused-final2.log`). This includes scripted ninth tool rejection, unknown/save tools, arbitrary SQL/URL/owner/target filters, strict field/types, fabricated programme/evidence IDs, cross-source provenance, raw prompt injection isolation, max questions, one repair, actual model timeout/cancellation, guard/deadline, empty results, source withdrawal, full differences/unknowns, and scripted search/evidence/final serialization.

Other scoped planning suites GREEN: `-Dtest=PlanningWorkerTest,PlanningSessionIntegrationTest,PlanningCatalogueIntegrationTest,RuleSchemaIntegrationTest,BudgetCalculatorTest,EvidencePolicyTest,EvidenceSchemaIntegrationTest` -> 88 tests, 0 failures/errors/skips (`/private/tmp/task5-integration.log`). Actual disposable PostgreSQL, Redis and Elasticsearch Testcontainers were used.

Final combined scoped suite (2026-10-15 11:03:35 +08:00): `-Dtest=PlanningOrchestratorTest,PlanValidatorTest,PlanningWorkerTest,PlanningSessionIntegrationTest,PlanningCatalogueIntegrationTest,EligibilityEvaluatorTest,RuleSchemaIntegrationTest,BudgetCalculatorTest,EvidencePolicyTest,EvidenceSchemaIntegrationTest` -> 144 tests, 0 failures/errors/skips, BUILD SUCCESS in 25.432 s (`/private/tmp/task5-all-planning-final.log`). `git diff --check` also passed.

Full backend regression `./mvnw test` ran 1079 tests: 1 failure, 0 errors, 0 skipped (`/private/tmp/task5-backend-full.log`). Sole failure: inherited `V3MigrationCompatibilityTest` line 129 hard-codes latest version 33 while Tasks 1–4 already added migrations through 36. `git show a113e93:backend/src/test/java/com/yangdoujiao/website/programme/V3MigrationCompatibilityTest.java` confirms the same stale assertions at baseline. Task 5 adds no migration and leaves this unrelated test unchanged. The full run preceded only the final extra unknown-living-scope test/refinement; that refinement was separately verified by focused and final combined scoped runs. Existing JVM class-sharing and Netty macOS resolver warnings remain; full-suite negative-path tests intentionally log errors/warnings. No dependency upgrades were made.

## Files and self-review

Added agent/PlanningModel, ModelContext, ToolCall, ToolResult, AgentReply, PlanDraft, ValidatedPlan, ProgrammeDecision, ModelInputSanitizer, ToolDispatcher, PlanValidator, PlanningOrchestrator, PlanningAgentConfiguration. Added agent/PlanningOrchestratorTest, PlanValidatorTest and test-only ScriptedPlanningModel. Modified PlanningCatalogue, EligibilityEvaluator and PlanningWorker, with corresponding existing catalogue/eligibility/worker regression tests. No whole implementation plan was read and no subagent/reviewer was spawned.

Self-review tightened final provenance, complete evidence coverage, OR-branch failure classification, immutable/deep-copied model context, unverified requirement snapshot filtering, missing budget-scope completeness, strict duplicate/trailing JSON handling, and no-provider exception mapping. Remaining limitations are intentional: production model absent and default sanitizer suppresses all chat/profile facts; provider integration and approved privacy/cost gates belong to Task 6. Full backend suite has the inherited migration-test failure above.
