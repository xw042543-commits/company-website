# Malaysia Planning Agent Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为中国大陆学生提供可追溯、可调整、可保存的马来西亚四层级留学规划。

**Architecture:** 保持 Spring Boot 模块化单体，在 planningagent 内实现证据、确定性工具、受控编排、用户会话及方案。PostgreSQL 保存事实和运行记录，模型只负责理解与解释；小程序通过短轮询 REST 接入。

**Tech Stack:** Java 21、Spring Boot、PostgreSQL、Flyway、JUnit、Testcontainers、微信小程序 TypeScript；沿用现有依赖，不新增 Agent 框架或数据库。

**Spec:** `docs/superpowers/specs/2026-10-15-malaysia-planning-agent-design.md`（用户已确认）。

## Global Constraints

- 不自动申请、付款、联系学校，不承诺录取，不输出录取概率。
- 不提供开放网络代理、任意 SQL、终端执行或任意 URL 抓取工具。
- 首版不上传成绩单、护照或研究材料，不新增文档解析子系统。
- 不训练自有模型，不为首版引入多 Agent、独立微服务或向量数据库。
- 每轮最多八次工具调用、一次模型格式修复，总处理时限 60 秒。
- 首次展示最多五个候选，每轮最多两个相关问题。
- 未保存会话最后活动 30 天后删除；证据默认超过 90 天进入复核状态，并受更早有效期和适用入学季约束。
- 初始每用户每日 10 次规划生成或重算；功能开关默认关闭。
- 未满 14 周岁不开放 Agent。生产不得以模拟结果替代真实服务。
- 不改动用户现有 `miniapp/project.config.json`，不推送、部署或写入生产数据。

## 执行准备与边界

当前设计基线提交为 `815eb44`。执行时先使用 using-git-worktrees 技能准备隔离工作区，确认该设计提交存在。不要从远端默认分支丢失本地已确认设计。当前迁移最高为 V33，执行时重新检查冲突；本计划分配 V34 至 V37，若被占用需顺延并更新计划及测试。

阶段 A（任务 1—3）交付可独立测试的数据和工具；阶段 B（任务 4—6）交付仅测试环境可运行的 Agent；阶段 C（任务 7—8）交付小程序闭环与上线门槛。阶段间检查契约，不把接口变更留到最后合并。

所有新增后端文件基目录为 `backend/src/main/java/com/yangdoujiao/website/planningagent/`，对应测试目录为 `backend/src/test/java/com/yangdoujiao/website/planningagent/`。下文文件表中的子路径都相对这两个明确目录；现有文件和迁移使用完整仓库路径。

每项执行均先写所列测试并确认失败，再实现、复测、审查 diff，单独提交。测试示例使用生产类型；辅助 fixture 必须建在测试目录，不向生产库插入示范规则。

## Task 1 证据可用性和数据库边界

**Files:** 创建 `evidence/Evidence.java`、`evidence/EvidencePolicy.java`、`evidence/EvidenceRepository.java`；测试 `evidence/EvidencePolicyTest.java`、`evidence/EvidenceSchemaIntegrationTest.java`；创建 `backend/src/main/resources/db/migration/V34__create_planning_evidence.sql`。

**Interfaces:**

```java
public record Evidence(long id, long programmeId, String factType,
    String sourceUrl, String sourceType, String studentScope, String intake,
    Instant checkedAt, Instant expiresAt, String reviewStatus,
    Long reviewerId, String excerpt, boolean conflict) {}
public enum EvidenceState { VERIFIED, REVIEW_REQUIRED }
// EvidencePolicy 内定义以上枚举或单独建 EvidenceState.java，并统一引用。
public EvidenceState assess(Evidence evidence, Instant now, String intake);
public List<Evidence> findByProgrammeId(long programmeId); // repository
```

- [ ] 写固定时间测试，验证 AI 来源、无核验者、未审核、无 URL、未来核实时间、过 90 天、已到期、入学季不匹配和冲突全部不可用。

```java
@Test void generatedTextIsNotAdmissionsEvidence() {
    var now = Instant.parse("2026-10-15T00:00:00Z");
    var e = new Evidence(1, 2, "ADMISSIONS", "https://example.edu/admissions",
        "ai_generated", "CN_MAINLAND", "2027-02", now, null,
        "VERIFIED", 3L, "illustrative", false);
    assertThat(new EvidencePolicy().assess(e, now, "2027-02"))
        .isEqualTo(EvidenceState.REVIEW_REQUIRED);
}
```

- [ ] 运行 `cd backend && ./mvnw -Dtest=EvidencePolicyTest test`，确认缺少类型或实现导致失败。
- [ ] 实现可用性谓词：官方 HTTPS 来源、CN_MAINLAND、VERIFIED、核验者存在、无冲突、时间有效、入学季一致；入学季为空表示未知，不等于全部适用。使用注入时间而非系统时间。

```sql
CREATE TABLE planning_evidence (
 id BIGSERIAL PRIMARY KEY,
 programme_id BIGINT NOT NULL REFERENCES programmes(id),
 fact_type VARCHAR(40) NOT NULL,
 source_url TEXT,
 source_type VARCHAR(30) NOT NULL,
 student_scope VARCHAR(30) NOT NULL,
 intake VARCHAR(30),
 checked_at TIMESTAMPTZ,
 expires_at TIMESTAMPTZ,
 review_status VARCHAR(20) NOT NULL CHECK (review_status IN ('DRAFT','VERIFIED','REVOKED')),
 reviewer_id BIGINT,
 excerpt TEXT NOT NULL,
 conflict BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE INDEX planning_evidence_programme_idx ON planning_evidence(programme_id);
```

- [ ] 参考 `article/ArticleSchemaIntegrationTest.java` 的 Testcontainers 设置，验证外键、状态约束、回滚及无自动发布；补测可用证据、恰好 90 天及到期边界。运行 `./mvnw -Dtest=EvidencePolicyTest,EvidenceSchemaIntegrationTest test`。
- [ ] 只暂存本任务文件，提交 `feat(planning): add reviewed evidence foundation`。

## Task 2 招生规则和资格判断

**Files:** 创建 `eligibility/EligibilityTypes.java`、`eligibility/EligibilityEvaluator.java`、`eligibility/RuleRepository.java`；测试 `eligibility/EligibilityEvaluatorTest.java`、`eligibility/RuleSchemaIntegrationTest.java`；迁移 `backend/src/main/resources/db/migration/V35__create_planning_rules.sql`。

**Interfaces:** 所有以下 record/enum 作为 EligibilityTypes 的嵌套 public 类型。

```java
enum Status { MET, NOT_MET, PROFILE_MISSING, EVIDENCE_MISSING }
record Profile(long version, Map<String,String> facts) {}
record Condition(String field, String operator, String expected,
                 String scale, long evidenceId) {}
record RuleSet(long programmeId, long version, boolean complete,
               List<List<Condition>> alternatives) {}
record Finding(String field, Status status, long evidenceId) {}
record Assessment(boolean eligible, List<List<Finding>> alternatives) {}
// EligibilityEvaluator
Assessment evaluate(Profile profile, RuleSet rules,
                    Map<Long,Evidence> evidence, Instant now, String intake);
// RuleRepository
Optional<RuleSet> findCurrent(long programmeId);
```

外层 alternatives 为 OR，内层条件为 AND。首版支持 EQ、GTE，其他运算或人工例外返回 EVIDENCE_MISSING。分数字段使用独立 `field + ".scale"`；语言总分及单项分别作为条件。complete 由顾问确认完整规则集合，空规则不得通过。

- [ ] 写首个失败测试和四种学历各五组参数化测试：空规则、分数临界、不同满分、缺语言、专升本/跨专业未知。测试数据明确为合成规则。

```java
@Test void missingRulesNeverMeansEligible() {
    var rules = new RuleSet(1, 1, false, List.of());
    var result = new EligibilityEvaluator().evaluate(
        new Profile(1, Map.of()), rules, Map.of(), Instant.EPOCH, "2027-02");
    assertThat(result.eligible()).isFalse();
}
```

- [ ] 运行 `cd backend && ./mvnw -Dtest=EligibilityEvaluatorTest test` 确认失败。
- [ ] 实现每个条件的证据检查、同分制 BigDecimal 比较，不做成绩换算；保留所有分支的失败和未知结果。只有 complete=true 且至少一个非空 AND 分支全部 MET 才 eligible=true。

```java
boolean eligible = rules.complete() && findings.stream()
    .anyMatch(branch -> !branch.isEmpty()
        && branch.stream().allMatch(f -> f.status() == Status.MET));
```

- [ ] 建表 `planning_rule_sets(id,programme_id,version,complete,active)` 和 `planning_rule_conditions(id,rule_set_id,branch_no,field,operator,expected,scale,evidence_id)`，版本唯一、外键指向证据，每专业最多一个 active（部分唯一索引）。仓库验证规则证据属于同一专业。
- [ ] 验证 OR 一条通过、AND 单项缺失、矛盾成绩、未证实的特殊学历不会误判；运行 `./mvnw -Dtest=EligibilityEvaluatorTest,RuleSchemaIntegrationTest test`。
- [ ] 提交 `feat(planning): evaluate evidence-backed admission conditions`。

## Task 3 预算与公开专业工具

**Files:** 创建 `budget/BudgetCalculator.java`、`budget/BudgetTypes.java`、`catalog/PlanningCatalogue.java`、`tools/PlanningTools.java`；测试 `budget/BudgetCalculatorTest.java`、`catalog/PlanningCatalogueIntegrationTest.java`。只读复用现有 ProgrammeRepository 和 UniversitySearchV1Service，不改变现有查询返回格式。

**Interfaces:** BudgetTypes 定义 `Fee(BigDecimal amount,String currency,String period,Integer units,long evidenceId,String includedIn)`、`BudgetResult(Map<String,BigDecimal> subtotals,boolean complete,List<String> missing)`；period 为 TOTAL、YEAR、SEMESTER、UNKNOWN，units 为明确已知的计费次数，includedIn 为已包含此项的费用标识或 null。TOTAL 的 units 固定为 1，其他周期必须显式提供次数。

```java
BudgetResult calculate(List<Fee> fees, Map<Long,Evidence> evidence,
                       Instant now, String intake);
// PlanningCatalogue
List<Long> search(String level, String subject, String city, int page);
boolean isPublishedMalaysianProgramme(long programmeId);
// PlanningTools: 服务端内部调用，不直接开放模型写接口
List<Evidence> getProgrammeEvidence(long programmeId);
```

- [ ] 写未知周期不可计算总额测试，以及 YEAR/SEMESTER/TOTAL、多币种、不明税费、重复包含项目测试。

```java
@Test void unknownPeriodDoesNotBecomeTotal() {
    var fee = new Fee(new BigDecimal("28000"), "MYR", "UNKNOWN", null, 1L, null);
    var result = new BudgetCalculator().calculate(List.of(fee), Map.of(), Instant.EPOCH, "2027-02");
    assertThat(result.complete()).isFalse();
    assertThat(result.subtotals()).isEmpty();
}
```

- [ ] 运行 `cd backend && ./mvnw -Dtest=BudgetCalculatorTest test` 确认失败。
- [ ] 实现原币小计：有效证据、非负金额、已知周期与次数才参与乘法；已含费用不重复相加。补充 `convert(amount,rate)` 使用 BigDecimal，汇率需要有效证据和日期；没有汇率不合并币种。预算是否足够仅在学费、税费、生活费范围及用户口径均完整时判断。

```java
BigDecimal total = fee.amount().multiply(BigDecimal.valueOf(fee.units()));
subtotals.merge(fee.currency(), total, BigDecimal::add);
```

- [ ] 专业搜索固定 country=MY、学历白名单、size≤20；对每个返回 ID 用 PostgreSQL 复核学校和专业 PUBLISHED、国家 MY。仅返回当前页，不返回全库。测试其他国家、下架、陈旧搜索索引和非法 ID。
- [ ] 运行 `./mvnw -Dtest=BudgetCalculatorTest,PlanningCatalogueIntegrationTest test`；提交 `feat(planning): add bounded catalogue and budget tools`。

## Task 4 所有者隔离的会话和后台运行

**Files:** 创建 `session/PlanningSessionController.java`、`session/PlanningSessionService.java`、`session/PlanningSessionRepository.java`、`session/PlanningDtos.java`、`session/PlanningWorker.java`；迁移 `backend/src/main/resources/db/migration/V36__create_planning_sessions.sql`；测试 `session/PlanningSessionIntegrationTest.java`、`session/PlanningWorkerTest.java`。修改 `backend/src/main/java/com/yangdoujiao/website/auth/config/SecurityConfig.java` 仅新增受保护路由。

**Interfaces:** `/api/v1/miniapp/me/planning-agent` 前缀；身份只从 UserPrincipal 取得。

```text
POST /sessions                         {ageBand,privacyVersion} → {id}
POST /sessions/{id}/messages            {requestKey,text} → 202 {runId,status}
GET  /sessions/{id}                     → 自己的消息、背景和运行摘要
GET  /sessions/{id}/runs/{runId}         → {status,result,errorCode}
POST /sessions/{id}/profile-confirmation {version,facts} → {confirmedVersion}
DELETE /sessions/{id}                   → 204
```

运行状态为 QUEUED、RUNNING、SUCCEEDED、FAILED、TIMED_OUT；状态与消息在一事务内保存。表 `planning_sessions`、`planning_messages`、`planning_profiles`、`planning_runs` 分别保存所有者、消息、不可变背景版本、运行与租约。profile 的 facts 使用任务 2 的 Profile 契约。

- [ ] 写跨用户查询/删除 404、未登录 401、未满 14 岁 403、同 requestKey 同内容返回同 runId、同键不同内容 409、未确认背景不可生成方案测试。

```java
@Test void queuedRunTimesOutAfterDeadline() {
    var deadline = Instant.parse("2026-10-15T00:01:00Z");
    assertThat(PlanningWorker.isExpired(deadline, deadline)).isTrue();
}
```

- [ ] 运行 `cd backend && ./mvnw -Dtest=PlanningWorkerTest,PlanningSessionIntegrationTest test` 确认失败。
- [ ] 数据库建立 UNIQUE(session_id,request_key)、每会话单个活动运行的部分唯一索引；同键返回旧运行须校验请求哈希。工作线程通过 `FOR UPDATE SKIP LOCKED` 领取运行，数据库记录 lease_token；写结果必须匹配当前 lease_token 和 RUNNING 状态。开始前、每次工具前和返回后检查 60 秒截止时间。

```java
public static boolean isExpired(Instant deadline, Instant now) {
    return !now.isBefore(deadline);
}
```

- [ ] 增加重启恢复、旧 worker 不能写回、新消息串行、重复请求不重复计数的集成测试，确认所有权在每个仓库查询条件中生效。
- [ ] 复跑任务测试；提交 `feat(planning): persist isolated sessions and bounded runs`。

## Task 5 受控 Agent 编排与响应验证

**Files:** 创建 `agent/PlanningModel.java`、`agent/AgentReply.java`、`agent/PlanningOrchestrator.java`、`agent/ToolDispatcher.java`、`agent/PlanValidator.java`；测试 `agent/PlanningOrchestratorTest.java`、`agent/PlanValidatorTest.java`，测试专用 `agent/ScriptedPlanningModel.java`。修改任务 4 的 PlanningWorker 接入编排器。

**Interfaces:**

```java
interface PlanningModel { AgentReply next(ModelContext context); }
record ModelContext(List<String> redactedMessages, Profile confirmedProfile,
                    List<ToolResult> results, Instant deadline) {}
record ToolCall(String name, JsonNode arguments) {}
record ToolResult(String name, JsonNode value) {}
record AgentReply(List<String> questions, List<ToolCall> calls, PlanDraft plan) {}
record PlanDraft(long profileVersion, List<Long> programmeIds,
                 List<Long> evidenceIds, List<String> generalNextSteps) {}
// 各 record 独立文件，均在 agent 包；JsonNode 使用现有 Jackson。
ValidatedPlan validate(PlanDraft draft, ModelContext context);
record ValidatedPlan(long profileVersion, List<ProgrammeDecision> programmes,
                     List<String> generalNextSteps) {}
record ProgrammeDecision(long programmeId, Assessment assessment,
                         BudgetResult budget, List<Long> evidenceIds) {}
```

- [ ] 用 ScriptedPlanningModel 连续请求九次工具，断言第九次被拒；测试未知工具、任意 SQL/URL 参数、伪造 ID、无证据、用户要求忽略系统规则、模型超时和格式修复超过一次。

```java
@Test void modelCannotInvokeSave() {
    assertThat(ToolDispatcher.allowed("save_plan")).isFalse();
    assertThat(ToolDispatcher.allowed("search_programmes")).isTrue();
}
```

- [ ] 运行 `cd backend && ./mvnw -Dtest=PlanningOrchestratorTest,PlanValidatorTest test` 确认失败。
- [ ] dispatcher 仅支持四工具，参数字段白名单、长度和类型验证；不得支持模型用户 ID。所有 evidenceId/programmeId 均须存在于本次受控工具结果，且相互归属一致。

```java
private static final Set<String> TOOLS = Set.of("search_programmes",
    "get_programme_evidence", "evaluate_eligibility", "calculate_budget");
public static boolean allowed(String name) { return TOOLS.contains(name); }
```

- [ ] 组装结果时由服务端重新附上 Assessment 和 BudgetResult；不给模型写入招生状态、金额和链接的字段。一般建议只允许准备材料、语言准备、咨询确认等非事实建议；带招生数字、截止日期或承诺的文本拒绝输出，改用工具事实模板。
- [ ] 追问限制为两个；结果最多五个，先按 eligible/明确不符合/未知分组，组内按明确偏好和专业 ID 稳定排序；不得把 NOT_MET 包装成推荐。空结果保留为空。
- [ ] 复跑任务测试；提交 `feat(planning): orchestrate allowlisted tools and validate plans`。

## Task 6 保存方案、顾问确认、隐私与成本限制

**Files:** 创建 `plan/PlanningPlanService.java`、`plan/PlanningPlanController.java`、`plan/PlanningPlanRepository.java`、`security/PlanningPrivacyFilter.java`、`security/PlanningLimits.java`、`session/PlanningCleanup.java`、`config/PlanningAgentProperties.java`；迁移 `backend/src/main/resources/db/migration/V37__create_planning_saved_plans.sql`；测试各同名 Test，另加 `plan/PlanningOwnershipIntegrationTest.java`。复用现有 ConsultationService.submit(ConsultationRequest,Long)，不更改其公开语义。

**Interfaces:**

```text
POST /sessions/{id}/plans {runId,confirmed:true,requestKey} → {planId,version}
GET /plans → 当前用户 Agent 方案（不改旧 /me/plans）
GET /plans/{id} → {snapshot,revalidationWarnings}
DELETE /plans/{id} → 204
POST /plans/{id}/consultations {confirmed:true,requestKey,consultationRequest}
  → 现有 ConsultationResponse
```

- [ ] 写 confirmed=false 不保存、不创建咨询；他人方案不能读；同请求重复咨询只有一条；老方案重读提示失效但快照不变；清理不删除独立保存方案的测试。

```java
@Test void confirmationIsMandatory() {
    assertThatThrownBy(() -> PlanningPlanService.requireConfirmation(false))
        .isInstanceOf(IllegalArgumentException.class);
}
```

- [ ] 运行 `cd backend && ./mvnw -Dtest=PlanningPlanServiceTest,PlanningPrivacyFilterTest,PlanningLimitsTest,PlanningCleanupTest,PlanningOwnershipIntegrationTest test` 确认失败。
- [ ] 创建不可变方案快照和引用表，保存证据/规则/背景版本；咨询幂等映射与咨询创建同一事务。咨询只携带用户确认的摘要，不带聊天全文。

```java
public static void requireConfirmation(boolean confirmed) {
    if (!confirmed) throw new IllegalArgumentException("CONFIRMATION_REQUIRED");
}
```

- [ ] 模型输入采用明确字段白名单；自由文本先剔除手机号、身份证号、邮箱和平台标识，疑似无法脱敏内容不发送，提示使用结构化表单。日志只保留运行 ID、错误码、次数和耗时，不记录提示词与回复全文。
- [ ] 通过数据库原子计数预占每日次数与最大 token 成本预算；重试使用同 reservation，失败可释放未消费预算但不得无限重试。每日 10 次以 Asia/Shanghai 日期分桶；消息每分钟 20 次。全局日费用上限未配置时禁止真实模型运行。
- [ ] 添加 30 天会话清理与注销关联清理测试；saved plan 与 conversation 使用独立生命周期。年龄和隐私版本校验在后端强制，不能只靠页面。
- [ ] 默认 enabled=false；供应商、处理地域、隐私版本、真实费用上限缺一则启动保持不可用。测试替身仅 test profile 可装配；生产禁止 fake provider。
- [ ] 在 PlanningPlanController 添加 `GET /api/v1/miniapp/me/planning-agent/capability`，返回 `{enabled,available}`，不暴露供应商凭证或配置值；前端登录前不展示 Agent 入口，登录后读取 capability。不可用不影响读取用户已有方案。
- [ ] 复跑任务测试；提交 `feat(planning): add consented persistence privacy and usage limits`。

## Task 7 小程序聊天、卡片、方案与咨询

**Files:** 创建 `miniapp/miniprogram/services/planning-agent.ts`、`miniapp/miniprogram/utils/planning-agent-state.ts`、`miniapp/miniprogram/pages/planning-agent/index.ts`、`index.wxml`、`index.wxss`、`index.json`；修改 `miniapp/miniprogram/app.json`、`miniapp/miniprogram/pages/plans/index.ts`、`index.wxml` 和首页对应入口；测试 `miniapp/tests/planning-agent.test.ts`、`planning-agent-state.test.ts`、`planning-agent-navigation.test.ts`。

**Interfaces:** service 使用现有 request 返回 Result，提供 createSession、sendMessage、getRun、confirmProfile、savePlan、listPlans、deletePlan、handoff；参数和返回对应任务 4、6。客户端不得携带 ownerId 或自行拼接专业来源 URL。

```ts
export type AgentViewState = 'idle' | 'sending' | 'polling' | 'ready' | 'failed';
export function canSave(state: AgentViewState, confirmed: boolean): boolean {
  return state === 'ready' && confirmed;
}
```

- [ ] 写 `assert.equal(canSave('polling', true), false)` 和 `assert.equal(canSave('ready', false), false)`，再测失败重试保持同 requestKey、页面离开停止轮询、重新进入恢复服务端状态。
- [ ] 运行 `cd miniapp && npx tsx --test tests/planning-agent-state.test.ts` 确认失败。
- [ ] 实现聊天和背景确认独立区块；卡片展示原币费用、缺项、证据日期及来源，明确区分符合和待核实。来源只能是服务端返回的安全 HTTPS 地址，不用开放 web-view 绕过域名配置。
- [ ] 短轮询初始 2 秒、最高 5 秒、运行截止后停止；onHide/onUnload 取消计时器，禁用重复提交。前端等到服务器成功后才显示保存或咨询成功。
- [ ] 新旧规划以类型区分并列展示，旧页面行为保留。新增 GET capability 返回 enabled/available，只有后端可用才展示首页 Agent 入口；直接进入不可用页仍显示查询/咨询替代入口。
- [ ] 运行 `npm run check`，审查文字、长名称、无数据、键盘遮挡、返回键、断网和登录失效；提交 `feat(miniapp): add controlled planning conversation flow`。

## Task 8 回归、离线评估和接入交接

**Files:** 创建 `backend/src/test/resources/planning-agent/evaluation-cases.json`、`backend/src/test/java/com/yangdoujiao/website/planningagent/PlanningEvaluationTest.java`、`docs/testing/malaysia-planning-agent-acceptance.md`。更新本计划任务勾选状态，不改已确认设计的范围。

- [ ] 建 20 个合成评估案例，每层级五例，记录 profile、规则证据、expectedEligible、expectedMissing 和预算原币结果。合成案例不得标作顾问已复核或官方真实数据。

```json
{"id":"foundation-missing-evidence","level":"FOUNDATION",
 "profile":{"version":1,"facts":{"education":"HIGH_SCHOOL"}},
 "rules":{"programmeId":1,"version":1,"complete":false,"alternatives":[]},
 "expectedEligible":false,"expectedMissing":["ADMISSIONS"]}
```

- [ ] 新增先失败的完整流程测试：确认背景、生成方案、改变预算、生成第二版本、保存、咨询幂等、删除用户数据。验证模型故障不会生成假结果。
- [ ] 运行后端 `./mvnw test`、小程序 `npm run check`、`git diff --check`，保留失败输出并修复本任务引入的问题；不声称未跑的集成测试或真机通过。
- [ ] 用真机逐项完成设计第 10 节第 6 项，记录设备、构建号、步骤及结果。没有设备或账号时明确列为发布阻断。
- [ ] 在验收文档列出两个独立外部门槛：真实供应商与成本/隐私批准；20 个顾问复核真实案例及四个学历的完整官方示范项目。未满足时标记未通过，不自动购买模型或修改生产。
- [ ] 提交 `test(planning): add evaluation and release acceptance checklist`。

## 设计覆盖与最终交接

设计 1—3：任务 4、5、7；设计 4：任务 1—3；设计 5—6：任务 2—5；设计 7：任务 6—7；设计 8—9：任务 4—7；设计 10：任务 8；设计 11：三个阶段的检查点。

真实模型适配器在选定供应商、预算和数据处理条件后单独制定接入任务，核对其当时的官方 API 文档，再开发和评估；本计划交付不是可直接上线的完整商业服务。规划数据只接受已核验规则，不将现有 2,232 条目录记录批量标为可信招生事实。

执行方式由用户选择：逐任务子代理开发并审查，或在当前会话使用 executing-plans 分批执行。任何方式均不自动推送、部署或上线。
