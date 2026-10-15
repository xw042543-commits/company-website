# 马来西亚规划 Agent 验收与接入交接

验收日期：2026-10-15。范围：已确认的受控单 Agent、小程序对话、确定性规则和原币费用工具、会话、显式保存与转顾问。本地结果与发布批准分别记录。本交付尚不可作为完整商业 AI 服务上线。

## 本地实现与自动回归

`backend/src/test/resources/planning-agent/evaluation-cases.json` 是 **20 个合成案例**，不是 20 个顾问复核真实案例，也不是官方招生数据。源链接使用示例域名；`OFFICIAL` / `VERIFIED` 仅模拟测试输入。固定评估时间为 2026-10-15T00:00:00Z，四层级各五例。每例保存背景、规则、证据、预期符合状态、缺失项、逐项判定，以及原币费用期望。

| 层级 | 五例覆盖 |
| --- | --- |
| FOUNDATION | 百分制临界值、4 分制、无语言成绩、跨专业不符合、缺招生证据 |
| BACHELOR | 临界值下方、5 分制、10 分制与百分制不可比、缺学历、证据过期 |
| MASTER | 百分制临界值、历史 GPA4 别名、无语言成绩、允许跨专业、规则不完整 |
| DOCTOR | 百分制临界值、10 分制、语言成绩不符合、缺研究计划、冲突证据 |

学术分制别名只规范到 100 / 4 / 5 / 10，不换算分数；不同比例且缺少可比依据时要求补充资料。语言分制保持独立。费用同时记录 MYR、USD 小计，不在没有已核验汇率时合并币种。

| 设计验收点 | 自动化证据 | 本地状态 |
| --- | --- | --- |
| 10.1 固定背景与四层级 | `PlanningEvaluationTest`：20 个参数化案例及语料数量约束 | 本地通过 |
| 10.2 规则及证据追溯、未知不判符合 | 合成案例逐条件 `MET / NOT_MET / PROFILE_MISSING / EVIDENCE_MISSING`；`EligibilityEvaluatorTest`、`EvidencePolicyTest`、`PlanValidatorTest` | 本地通过 |
| 10.3 每年、每学期、全程、税、生活费、多币种 | 合成案例原币字面期望；`BudgetCalculatorTest#totalsPeriodsInOriginalCurrenciesAndRequiresAllBudgetCategories` | 本地通过 |
| 10.3 缺周期、部分小计、重复计费 | `BudgetCalculatorTest#unknownPeriodDoesNotBecomeTotal`、`missingPeriodAndCurrencyInInclusionChainFailClosed`、`emptyOrMissingLivingCostsNeverMeanComplete`、`includedItemsAreNotCountedTwiceRegardlessOfOrder`、`cyclesDuplicateIdsAndUnknownCoverageRemainIncomplete` | 本地通过 |
| 10.4 假 ID、来源、注入、越权、确认、限额、超时 | `PlanningOrchestratorTest`、`PlanValidatorTest`、`PlanningPrivacyFilterTest`、`PlanningSessionIntegrationTest`、`PlanningOwnershipIntegrationTest`、`PlanningLimitsTest`、`PlanningWorkerTest`、小程序规划测试 | 本地通过 |
| 10.5 背景确认→生成→改预算→第二版本→保存→咨询重试→清理 | `PlanningEvaluationTest#confirmedBackgroundBudgetRevisionSaveConsultRetryAndPurgeUseRealServices`，真实服务 / PostgreSQL / 工具，只有模型使用测试脚本 | 本地通过 |
| 模型故障没有假方案 | `PlanningEvaluationTest#missingOrFailingModelNeverCreatesAnAssistantPlanOrSaveableResult`：缺模型和异常分别验证失败、无助手结果、不可保存 | 本地通过 |
| 历史库兼容 | `V3MigrationCompatibilityTest` 从已有 V2 数据升级到 V38，39 个迁移含 V35.1，验证历史数据和新表；旧目录不会生成招生证据 | 本地通过 |

完整流程使用本地 Testcontainers 和合成用户、合成专业。第二次背景版本从 1 到 2，预算由 30000 MYR 改到 15000 MYR；历史版本保持不变，服务重新计算费用仍为 20000 MYR。费用完整不等于预算足够，系统不会为了迎合用户预算改写学费。没有点击确认之前不会保存或创建咨询；同一保存和咨询幂等键重试只产生一条记录。

## 可复现命令与结果

Java 明确使用 `/Library/Java/JavaVirtualMachines/temurin-21.jdk/Contents/Home`；仅运行本地可丢弃 Docker 数据库、Redis 和 Elasticsearch。无真实供应商、用户数据、生产写入、推送、部署或费用购买。

```sh
cd backend
JAVA_HOME=/Library/Java/JavaVirtualMachines/temurin-21.jdk/Contents/Home ./mvnw -Dtest=PlanningEvaluationTest,V3MigrationCompatibilityTest test
JAVA_HOME=/Library/Java/JavaVirtualMachines/temurin-21.jdk/Contents/Home ./mvnw test
cd ../miniapp
npm run check
cd ..
git diff --check
```

RED：`/private/tmp/task8-red.log`，3 tests / 2 assertion failures / 0 errors / 0 skipped。完整流程在没有测试模型时得到 FAILED 而不是 SUCCEEDED；兼容测试期待旧版本 33 而实际为 38。这是测试接线与迁移期望的失败证据，不表示添加了真实模型实现。随后只补测试脚本和兼容断言，不修改生产服务。

最终验证全部退出 0：focused **24 tests**；夹具隔离回归 **87 tests**；后端全量 **1145 tests / 0 failures / 0 errors / 0 skipped / BUILD SUCCESS**；小程序 **377 tests / 377 pass / 0 fail / 0 skipped**，TypeScript 与 ESLint 通过；`git diff --check` 通过。日志依次为 `/private/tmp/task8-focused-green.log`、`/private/tmp/task8-isolation-green.log`、`/private/tmp/task8-backend-full-green.log`、`/private/tmp/task8-miniapp-check-green.log`。

保留的失败记录：首次后端全量 `/private/tmp/task8-backend-full.log` 为 1145 tests / 0 failures / 34 errors，根因是本任务新夹具留下 MY 字典，导致后续旧 schema/catalog 测试重复键。修复仅跟踪并按确切 ID 清理夹具自己新建的 country / level 行，已有字典不删除；相关 87 项及全量 1145 项随后通过。首次小程序 `/private/tmp/task8-miniapp-check.log` 在测试开始前遭沙箱 `tsx` 本地 IPC `listen EPERM`，允许本地 IPC 后重跑通过，未改产品代码。后端输出仍有 macOS DNS fallback、JDK CDS 和既有故障分支测试 WARN，不声称输出完全没有警告。

## 真机验收：未通过，发布阻断

当前无可用真机与测试账号；浏览器模板预览不能替代原生微信验证。以下全部 **未执行**。设备型号 / OS / 微信版本 / 小程序构建号 / 测试账号类型 / 网络条件：均未提供。执行人应逐行填写实际值、结果、失败截图或录像及问题链接，不能以自动化结果代填。

| 场景 | 操作与通过条件 | 设备 / 构建号 | 实际结果 |
| --- | --- | --- | --- |
| 入口、年龄与隐私 | 登录后进入对话；默认关闭时入口不可生成；14 岁以下阻止，14–17 与成年分支和隐私同意正确 | 未提供 | 未执行 / 阻断 |
| 对话与背景确认 | 按 1–2 个渐进问题录入背景，确认前无法生成；软键盘不挡输入、下一步或确认按钮；长文本可读 | 未提供 | 未执行 / 阻断 |
| 项目与依据 | 生成后查看专业、原币费用、规则和来源；缺图、长专业名、缺证据和无结果有明确状态 | 未提供 | 未执行 / 阻断 |
| 调整与历史版本 | 调整预算并确认，生成第二版本；第一次结果不被覆盖；原生返回键、页面返回和取消行为正确 | 未提供 | 未执行 / 阻断 |
| 保存与重新进入 | 明确点击确认后保存；离开再进入可读取自己的方案，历史依据变化有提示 | 未提供 | 未执行 / 阻断 |
| 咨询幂等 | 明确确认转顾问并确认咨询隐私；连点、重试只创建一次；成功后状态可读 | 未提供 | 未执行 / 阻断 |
| 慢网与断网 | 慢网等待有截止时间；断网可恢复 / 重试，不重复提交，不制造成功结果 | 未提供 | 未执行 / 阻断 |
| 模型失败与超时 | 无供应商、模型异常和超时均展示可操作失败状态，恢复 / 重试不出现假结果 | 未提供 | 未执行 / 阻断 |
| 登录失效与数据删除 | 失效后提示重新登录；规划删除后自己的会话与方案不可恢复查看；咨询保留说明正确 | 未提供 | 未执行 / 阻断 |

## 独立外部门槛与发布决策

| 门槛 | 当前状态 | 通过所需证据 |
| --- | --- | --- |
| A：真实供应商、成本、隐私批准 | **未通过 / 发布阻断** | 另行选定供应商、地区、预算、定价与令牌估算、数据处理/保留和内容安全条件，完成批准；按届时官方 API 文档独立实现适配器并评估。当前没有真实模型服务。供应商/成本/隐私任一批准缺失均保持不可用。 |
| B：顾问真实案例与官方示范项目 | **未通过 / 发布阻断** | 至少 20 个顾问复核的真实案例，四层级各至少一个完整官方示范项目，保存核验人、日期、招生/费用原始依据与适用人群/入学批次；严重错误为零。不能用此处 20 个合成案例替代。 |
| C：原生微信真机全流程 | **未通过 / 发布阻断** | 上表全部实测记录，包括键盘、原生返回、重新进入、慢网、断网、登录失效和故障恢复。 |
| D：最终审查与生产发布授权 | **未通过 / 发布阻断** | 最终独立代码审查、生产配置/隐私/内容安全检查、服务监控、成本熔断、关闭入口验证及另行上线授权。通过本地测试不自动批准上线。 |

现有 2,232 条目录记录不能批量视为已核验招生事实。证据适用范围为中国内地申请者和对应入学批次，超过 90 天或失效/冲突即需复核。单次执行最多 8 次工具调用、1 次格式修复、60 秒，最多 5 个候选、2 个问题；每日每用户最多 10 次生成。30 天按最后活动时间清理会话，保留明确保存的历史方案。默认关闭入口与无供应商失败路径须在实际发布环境再验证。

隐私交接：只允许白名单结构化背景与安全词法进入未来模型；包含个人叙述的输入返回 `STRUCTURED_INPUT_REQUIRED`，不会宣称可以安全匿名化任意文字。模型没有保存或咨询工具。规划清理会删除该用户的规划会话、方案和规划用途记录；已单独确认提交的 `consultation_enquiries` 继续遵循既有咨询生命周期，不能宣称所有个人数据已删除。每日共享成本账本是已消费成本，不随用户规划删除退回，也不根据缺失的供应商实际用量虚构退款。

后续交接顺序：完成独立审查；补 A、B、C 证据；单独实施真实模型适配器和评估；完成 D 并取得另行上线授权。本任务不推送、不合并、不部署。
