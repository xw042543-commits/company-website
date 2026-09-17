# V4 课程筛选与院校搜索接口实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现按专业筛选院校的 V4 后端接口，以院校为分页单位返回最多三个匹配专业，并通过 PostgreSQL 同步任务可靠维护 Elasticsearch 搜索投影。

**Architecture:** 保持 Spring Boot 模块化单体。PostgreSQL 是唯一正式数据源，Elasticsearch 使用“一所院校一条文档、专业为 nested 对象”的可重建投影；新 V4 搜索模块与旧 `/api/search` 并存，避免前端迁移期间发生回归。

**Tech Stack:** Java 21、Spring Boot 4.1.1、Spring Data JPA、Spring Data Elasticsearch 6.1.1、Elasticsearch Java Client 9.4.5、PostgreSQL 17.11、Flyway、Testcontainers、JUnit 5、AssertJ、Mockito。

**Spec:** `docs/superpowers/specs/2026-09-17-programme-search-api-design.md`

## Global Constraints

- PostgreSQL 始终是业务数据的唯一真实来源，Elasticsearch 必须可以从 PostgreSQL 重建。
- 不修改已经发布的 V1、V2、V3 Flyway 迁移；数据库变化只能新增 V4。
- V4 只修改后端和中文技术文档，不修改同事负责的前端页面。
- 不加入微服务、Kafka、RabbitMQ、MongoDB、Kubernetes 或搜索结果缓存。
- 公开搜索只包含 `PUBLISHED` 院校及其 `PUBLISHED` 专业。
- 同一维度多个值使用 OR，不同维度之间使用 AND；专业级条件必须由同一个 nested 专业同时满足。
- 公开页码从 1 开始，默认每页 12 所院校，最大 48 所。
- V4 不实现模糊纠错；只支持正式名称、专业分类和已审核别名。
- 缺失翻译、学费或其他业务资料保持空值，禁止自动补译或将未知金额写为零。
- 虚构数据只进入 Testcontainers 临时环境，不进入本地开发数据库或正式数据库。
- 旧 `/api/search`、`/api/universities`、`/api/universities/popular` 在 V4 期间继续工作。
- 每个任务遵循红灯、绿灯、重构的 TDD 循环，并在独立验证后提交。

---

## 文件结构

V4 新代码按职责拆分：

```text
backend/src/main/java/com/yangdoujiao/website/
├── catalog/api/
│   ├── FilterOptionResponse.java
│   ├── FilterOptionsResponse.java
│   ├── FilterOptionsService.java
│   └── FilterOptionsController.java
├── programme/
│   └── TuitionFeePeriod.java
└── search/v4/
    ├── api/
    │   ├── UniversitySearchV1Controller.java
    │   ├── UniversitySearchQuery.java
    │   ├── UniversitySearchItemResponse.java
    │   └── MatchedProgrammeResponse.java
    ├── document/
    │   ├── UniversityProgrammeSearchDocument.java
    │   └── ProgrammeSearchDocument.java
    ├── model/
    │   ├── UniversitySearchCriteria.java
    │   ├── ResolvedSearchTerm.java
    │   └── UniversitySearchResult.java
    ├── alias/
    │   ├── SearchAlias.java
    │   ├── SearchAliasRepository.java
    │   ├── SearchAliasStatus.java
    │   ├── SearchAliasTargetType.java
    │   └── SearchAliasResolver.java
    ├── index/
    │   ├── SearchIndexNames.java
    │   ├── UniversitySearchProjectionLoader.java
    │   ├── SearchIndexManager.java
    │   └── SearchIndexRebuilder.java
    ├── query/
    │   ├── UniversitySearchQueryFactory.java
    │   ├── UniversitySearchGateway.java
    │   └── ElasticsearchUniversitySearchGateway.java
    ├── sync/
    │   ├── SearchSyncJob.java
    │   ├── SearchSyncJobRepository.java
    │   ├── SearchSyncJobStatus.java
    │   ├── SearchSyncEnqueuer.java
    │   ├── SearchSyncJobClaimer.java
    │   └── SearchSyncWorker.java
    ├── UniversitySearchCriteriaFactory.java
    └── UniversitySearchV1Service.java
```

旧 `search/UniversitySearchDocument`、`UniversitySearchRepository` 和 `UniversitySearchService` 暂不重命名，避免旧接口迁移风险。

---

### Task 1: V4 数据库结构与 JPA 映射

**Files:**
- Create: `backend/src/main/resources/db/migration/V4__create_search_support.sql`
- Create: `backend/src/main/java/com/yangdoujiao/website/programme/TuitionFeePeriod.java`
- Modify: `backend/src/main/java/com/yangdoujiao/website/programme/Programme.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/search/v4/alias/SearchAlias.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/search/v4/alias/SearchAliasStatus.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/search/v4/alias/SearchAliasTargetType.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/search/v4/alias/SearchAliasRepository.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/search/v4/sync/SearchSyncJob.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/search/v4/sync/SearchSyncJobStatus.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/search/v4/sync/SearchSyncJobRepository.java`
- Test: `backend/src/test/java/com/yangdoujiao/website/search/v4/V4SchemaIntegrationTest.java`
- Test: `backend/src/test/java/com/yangdoujiao/website/search/v4/V4MigrationCompatibilityTest.java`

**Interfaces:**
- Produces: `Programme#getTuitionFeePeriod()`、`getTuitionTotalRmbMin()`、`getTuitionTotalRmbMax()`。
- Produces: `SearchAliasRepository#findAllByNormalizedAliasAndStatus(String, SearchAliasStatus)`，返回列表以便识别冲突别名。
- Produces: 可持久化的 `SearchSyncJob`，供 Task 8 的任务领取和重试使用。

- [ ] **Step 1: 写 V4 迁移失败测试**

在 `V4SchemaIntegrationTest` 中用 `JdbcTemplate` 查询 `information_schema`，断言三个课程字段、`search_aliases` 和 `search_sync_jobs` 尚不存在；再加入约束用例：负总学费、颠倒范围、非法计费周期、重复规范化别名、非法任务状态都必须被 PostgreSQL 拒绝。

核心断言形状：

```java
assertThatThrownBy(() -> jdbcTemplate.update("""
        UPDATE programmes
        SET tuition_total_rmb_min = 300000,
            tuition_total_rmb_max = 200000
        WHERE id = ?
        """, programmeId))
        .hasMessageContaining("ck_programmes_tuition_total_rmb_range");
```

- [ ] **Step 2: 运行测试确认红灯**

Run:

```bash
cd backend
./mvnw -Dtest=V4SchemaIntegrationTest,V4MigrationCompatibilityTest test
```

Expected: FAIL，原因是 V4 迁移和新实体尚不存在；不能接受测试本身无法编译以外的无关失败。

- [ ] **Step 3: 编写 V4 Flyway 迁移**

迁移必须包含明确约束：

```sql
ALTER TABLE programmes
    ADD COLUMN tuition_fee_period VARCHAR(24) NOT NULL DEFAULT 'UNKNOWN',
    ADD COLUMN tuition_total_rmb_min NUMERIC(14, 2),
    ADD COLUMN tuition_total_rmb_max NUMERIC(14, 2),
    ADD CONSTRAINT ck_programmes_tuition_fee_period CHECK (
        tuition_fee_period IN ('PER_YEAR', 'PER_SEMESTER', 'TOTAL_PROGRAM', 'UNKNOWN')
    ),
    ADD CONSTRAINT ck_programmes_tuition_total_rmb_min CHECK (
        tuition_total_rmb_min IS NULL OR tuition_total_rmb_min >= 0
    ),
    ADD CONSTRAINT ck_programmes_tuition_total_rmb_max CHECK (
        tuition_total_rmb_max IS NULL OR tuition_total_rmb_max >= 0
    ),
    ADD CONSTRAINT ck_programmes_tuition_total_rmb_range CHECK (
        tuition_total_rmb_min IS NULL
        OR tuition_total_rmb_max IS NULL
        OR tuition_total_rmb_min <= tuition_total_rmb_max
    );
```

`search_aliases` 使用规范化别名、语言、目标类型、目标代码、状态和审计时间；目标类型固定为 `COUNTRY`、`SUBJECT_CATEGORY`、`PROGRAMME`，状态固定为 `DRAFT`、`PUBLISHED`、`ARCHIVED`，唯一键至少覆盖 `(normalized_alias, language, target_type, target_code)`。Repository 返回全部命中项，不能用 `findFirst` 掩盖冲突。`search_sync_jobs` 使用 `PENDING`、`PROCESSING`、`FAILED` 状态，并保存 `attempt_count`、`available_at`、`locked_at`、`last_error`。

- [ ] **Step 4: 添加最小 JPA 映射**

`TuitionFeePeriod`：

```java
public enum TuitionFeePeriod {
    PER_YEAR,
    PER_SEMESTER,
    TOTAL_PROGRAM,
    UNKNOWN
}
```

在 `Programme` 中使用 `@Enumerated(EnumType.STRING)`，金额使用 `precision = 14, scale = 2`。`SearchAlias` 和 `SearchSyncJob` 只暴露维持业务不变量所需的方法，不为实体生成公共 setter。

- [ ] **Step 5: 补充迁移兼容性测试**

`V4MigrationCompatibilityTest` 使用独立 PostgreSQL 容器：先只迁移到 V3，插入一条兼容旧课程，再迁移到 V4，断言旧记录的 `tuition_fee_period` 为 `UNKNOWN`，新总学费字段为空，旧数据未丢失。

- [ ] **Step 6: 运行任务测试**

Run:

```bash
./mvnw -Dtest=V4SchemaIntegrationTest,V4MigrationCompatibilityTest test
```

Expected: PASS，约束名和默认值均符合测试。

- [ ] **Step 7: 运行完整后端测试**

Run: `./mvnw test`

Expected: 现有 83 项与新增测试全部通过。

- [ ] **Step 8: 提交**

```bash
git add backend/src/main/resources/db/migration/V4__create_search_support.sql \
  backend/src/main/java/com/yangdoujiao/website/programme \
  backend/src/main/java/com/yangdoujiao/website/search/v4/alias \
  backend/src/main/java/com/yangdoujiao/website/search/v4/sync \
  backend/src/test/java/com/yangdoujiao/website/search/v4
git diff --cached --check
git commit -m "feat: 新增V4搜索数据结构"
```

---

### Task 2: 筛选字典接口

**Files:**
- Modify: `backend/src/main/java/com/yangdoujiao/website/catalog/CountryRepository.java`
- Modify: `backend/src/main/java/com/yangdoujiao/website/catalog/SubjectCategoryRepository.java`
- Modify: `backend/src/main/java/com/yangdoujiao/website/catalog/StudyLevelRepository.java`
- Modify: `backend/src/main/java/com/yangdoujiao/website/catalog/CourseModeRepository.java`
- Modify: `backend/src/main/java/com/yangdoujiao/website/catalog/LanguageRepository.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/catalog/api/FilterOptionResponse.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/catalog/api/FilterOptionsResponse.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/catalog/api/FilterOptionsService.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/catalog/api/FilterOptionsController.java`
- Test: `backend/src/test/java/com/yangdoujiao/website/catalog/api/FilterOptionsServiceIntegrationTest.java`
- Test: `backend/src/test/java/com/yangdoujiao/website/catalog/api/FilterOptionsControllerTest.java`

**Interfaces:**
- Produces: `GET /api/v1/catalog/filter-options`。
- Produces: `FilterOptionsResponse(countries, subjectCategories, studyLevels, courseModes, languages)`。
- Consumes: `CategoryStatus.PUBLISHED` 和现有目录 Repository。

- [ ] **Step 1: 写 Service 集成测试**

在 Testcontainers PostgreSQL 中插入 `PUBLISHED`、`DRAFT`、`ARCHIVED` 字典项，断言只返回公开项并按 `sortOrder`、`code` 稳定排序。国家表当前没有状态和排序字段，因此返回全部国家并按代码排序。

期望 DTO：

```java
public record FilterOptionResponse(String code, String nameZh, String nameEn) {}

public record FilterOptionsResponse(
        List<FilterOptionResponse> countries,
        List<FilterOptionResponse> subjectCategories,
        List<FilterOptionResponse> studyLevels,
        List<FilterOptionResponse> courseModes,
        List<FilterOptionResponse> languages
) {}
```

- [ ] **Step 2: 运行 Service 测试确认红灯**

Run: `./mvnw -Dtest=FilterOptionsServiceIntegrationTest test`

Expected: FAIL，缺少 API DTO 和 Service。

- [ ] **Step 3: 添加 Repository 排序方法和 Service**

Repository 方法名固定为：

```java
List<Country> findAllByOrderByCodeAsc();
List<SubjectCategory> findAllByStatusOrderBySortOrderAscCodeAsc(CategoryStatus status);
List<StudyLevel> findAllByStatusOrderBySortOrderAscCodeAsc(CategoryStatus status);
List<CourseMode> findAllByStatusOrderBySortOrderAscCodeAsc(CategoryStatus status);
List<Language> findAllByStatusOrderBySortOrderAscCodeAsc(CategoryStatus status);
```

`FilterOptionsService#getPublishedOptions()` 使用只读事务，集中完成实体到 DTO 的映射。

- [ ] **Step 4: 添加 Controller MVC 测试**

使用 `@WebMvcTest(FilterOptionsController.class)` 和 MockMvc，断言 HTTP 200、五个字段名、代码和中英文名称；Service 异常不得泄露堆栈。

- [ ] **Step 5: 实现 Controller**

```java
@RestController
@RequestMapping("/api/v1/catalog")
public class FilterOptionsController {
    @GetMapping("/filter-options")
    public FilterOptionsResponse getFilterOptions() {
        return service.getPublishedOptions();
    }
}
```

- [ ] **Step 6: 运行任务测试与完整测试**

Run:

```bash
./mvnw -Dtest=FilterOptionsServiceIntegrationTest,FilterOptionsControllerTest test
./mvnw test
```

Expected: PASS。

- [ ] **Step 7: 提交**

```bash
git add backend/src/main/java/com/yangdoujiao/website/catalog \
  backend/src/test/java/com/yangdoujiao/website/catalog/api
git diff --cached --check
git commit -m "feat: 新增搜索筛选字典接口"
```

---

### Task 3: 搜索请求契约与校验

**Files:**
- Create: `backend/src/main/java/com/yangdoujiao/website/search/v4/api/UniversitySearchQuery.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/search/v4/model/UniversitySearchCriteria.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/search/v4/UniversitySearchCriteriaFactory.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/search/v4/SearchValidationException.java`
- Modify: `backend/src/main/java/com/yangdoujiao/website/common/exception/GlobalExceptionHandler.java`
- Test: `backend/src/test/java/com/yangdoujiao/website/search/v4/UniversitySearchCriteriaFactoryTest.java`
- Test: `backend/src/test/java/com/yangdoujiao/website/search/v4/SearchValidationExceptionHandlerTest.java`

**Interfaces:**
- Consumes: Spring MVC 绑定的 `UniversitySearchQuery` JavaBean。
- Produces: 不可变 `UniversitySearchCriteria`，包含规范化关键词、去重后的代码集合、`YearMonth intake`、金额范围、从 1 开始的公开页码和页大小。
- Produces: `SearchValidationException(Map<String, String> fieldErrors)`，由全局异常处理器转换为 `400 VALIDATION_ERROR`。

- [ ] **Step 1: 写参数校验单元测试**

覆盖：空白关键词、连续空格、英文大小写保留给分析器处理、重复代码去重、单维度最多 20 个值、非法年月、非正学制、负学费、颠倒学费、页码小于 1、size 超过 48、不支持的 sort。

核心用例：

```java
assertThatThrownBy(() -> factory.create(queryWithTuition("300000", "200000")))
        .isInstanceOfSatisfying(SearchValidationException.class, exception ->
                assertThat(exception.getFieldErrors())
                        .containsEntry(
                                "tuitionMax",
                                "must be greater than or equal to tuitionMin"
                        )
        );
```

- [ ] **Step 2: 运行测试确认红灯**

Run: `./mvnw -Dtest=UniversitySearchCriteriaFactoryTest test`

Expected: FAIL，目标类型不存在。

- [ ] **Step 3: 实现 Query、Criteria 和 Factory**

`UniversitySearchQuery` 使用可绑定 JavaBean 字段：`q`、五个可重复筛选列表、`duration`、`intake`、`tuitionMin`、`tuitionMax`、`page`、`size`、`sort`。默认页码 1、大小 12、排序 `relevance`。

`UniversitySearchCriteria` 使用 record：

```java
public record UniversitySearchCriteria(
        String keyword,
        Set<String> categories,
        Set<String> levels,
        Set<String> countries,
        Set<String> modes,
        Set<String> languages,
        Integer durationMonths,
        YearMonth intakeMonth,
        BigDecimal tuitionMin,
        BigDecimal tuitionMax,
        int page,
        int pageSize
) {}
```

Factory 负责 trim、合并空格、代码转大写、集合去重和跨字段校验；Controller 不复制这些规则。

- [ ] **Step 4: 实现字段错误响应**

`GlobalExceptionHandler` 新增专用 handler，把 `SearchValidationException` 转换为：

```json
{
  "code": "VALIDATION_ERROR",
  "message": "Request validation failed",
  "fieldErrors": {},
  "traceId": "..."
}
```

- [ ] **Step 5: 运行任务测试和公共异常回归测试**

Run:

```bash
./mvnw -Dtest=UniversitySearchCriteriaFactoryTest,SearchValidationExceptionHandlerTest,GlobalExceptionHandlerTest test
```

Expected: PASS。

- [ ] **Step 6: 提交**

```bash
git add backend/src/main/java/com/yangdoujiao/website/search/v4 \
  backend/src/main/java/com/yangdoujiao/website/common/exception/GlobalExceptionHandler.java \
  backend/src/test/java/com/yangdoujiao/website/search/v4
git diff --cached --check
git commit -m "feat: 定义院校搜索请求与校验规则"
```

---

### Task 4: 院校聚合搜索文档与 PostgreSQL 投影加载

**Files:**
- Create: `backend/src/main/java/com/yangdoujiao/website/search/v4/document/ProgrammeSearchDocument.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/search/v4/document/UniversityProgrammeSearchDocument.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/search/v4/index/SearchIndexNames.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/search/v4/index/UniversitySearchProjectionLoader.java`
- Modify: `backend/src/main/java/com/yangdoujiao/website/university/UniversityRepository.java`
- Modify: `backend/src/main/java/com/yangdoujiao/website/programme/ProgrammeRepository.java`
- Modify: `backend/src/main/java/com/yangdoujiao/website/programme/ProgrammeIntakeRepository.java`
- Test: `backend/src/test/java/com/yangdoujiao/website/search/v4/index/UniversitySearchProjectionLoaderIntegrationTest.java`

**Interfaces:**
- Produces: `Optional<UniversityProgrammeSearchDocument> loadPublishedUniversity(long universityId)`。
- Produces: `SearchIndexNames.READ_ALIAS = "universities-v4-read"` 和 `WRITE_ALIAS = "universities-v4-write"`。
- Consumes: V3/V4 院校、课程、语言、入学时间和总学费数据。

- [ ] **Step 1: 写投影加载集成测试**

测试数据包含：一所公开院校、两个公开专业、一个草稿专业、多语言、多入学日期和总学费。断言文档只包含两个公开专业，语言代码无重复，入学时间规范为 `YYYY-MM`，中英文空值不被补写。

另测：非公开院校或没有任何公开专业时返回 `Optional.empty()`。

- [ ] **Step 2: 运行测试确认红灯**

Run: `./mvnw -Dtest=UniversitySearchProjectionLoaderIntegrationTest test`

Expected: FAIL，文档和 loader 不存在。

- [ ] **Step 3: 定义 Elasticsearch 文档类型**

根文档使用：

```java
@Document(indexName = SearchIndexNames.READ_ALIAS, createIndex = false)
public class UniversityProgrammeSearchDocument { ... }
```

`programmes` 字段使用 `@Field(type = FieldType.Nested)`；代码使用 `Keyword`，名称使用 `Text`，布尔、整数、日期和金额使用对应类型。`ProgrammeSearchDocument` 只保存公开搜索需要的数据，不保存完整介绍正文。

- [ ] **Step 4: 添加批量读取 Repository 方法**

`ProgrammeRepository` 使用 `@EntityGraph` 一次加载分类、学历、模式和语言：

```java
@EntityGraph(attributePaths = {
        "subjectCategory", "studyLevel", "courseMode", "languages"
})
List<Programme> findAllByUniversity_IdAndStatusOrderByIdAsc(
        Long universityId,
        CategoryStatus status
);
```

`ProgrammeIntakeRepository` 增加：

```java
List<ProgrammeIntake> findAllByProgramme_IdInOrderByIntakeDateAsc(Collection<Long> ids);
```

不要在循环内逐条查询 intake。

- [ ] **Step 5: 实现投影 Loader**

Loader 使用只读事务，按 programme ID 对 intake 分组，构造不可变文档。城市、翻译、学费未知时保留 `null`；只把 `tuitionTotalRmbMin/Max` 写入筛选字段。

- [ ] **Step 6: 运行任务测试和 Hibernate 查询检查**

Run: `./mvnw -Dtest=UniversitySearchProjectionLoaderIntegrationTest test`

Expected: PASS；测试日志中不能出现每个专业单独查询语言或 intake 的 N+1 模式。

- [ ] **Step 7: 提交**

```bash
git add backend/src/main/java/com/yangdoujiao/website/search/v4/document \
  backend/src/main/java/com/yangdoujiao/website/search/v4/index \
  backend/src/main/java/com/yangdoujiao/website/university/UniversityRepository.java \
  backend/src/main/java/com/yangdoujiao/website/programme \
  backend/src/test/java/com/yangdoujiao/website/search/v4/index
git diff --cached --check
git commit -m "feat: 建立院校课程搜索投影"
```

---

### Task 5: 版本索引与全量重建

**Files:**
- Create: `backend/src/main/java/com/yangdoujiao/website/search/v4/index/SearchIndexManager.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/search/v4/index/SearchIndexRebuilder.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/search/v4/index/SearchIndexInitializer.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/search/v4/index/SearchIndexProperties.java`
- Modify: `backend/src/main/resources/application.yml`
- Modify: `backend/src/test/resources/application-test.yml`
- Test: `backend/src/test/java/com/yangdoujiao/website/search/v4/index/SearchIndexRebuilderIntegrationTest.java`
- Test: `backend/src/test/java/com/yangdoujiao/website/search/v4/index/SearchIndexInitializerTest.java`

**Interfaces:**
- Produces: `String createVersionedIndex()`、`void swapAliases(String indexName)`。
- Produces: `SearchIndexRebuilder#rebuild()`，返回已写入院校数量和索引名的结果对象。
- Produces: 首次部署缺少读写别名时自动重建；正常重启不重复清空或重建索引。
- Consumes: `UniversitySearchProjectionLoader` 和 `ElasticsearchOperations`。

- [ ] **Step 1: 写真实 Elasticsearch 重建测试**

Testcontainers 中预建旧索引和读写别名，执行 rebuild 后断言：

- 新版本索引存在；
- mapping 中 `programmes` 为 nested；
- 公开院校数量正确；
- 读写别名同时指向新索引；
- 切换前旧别名仍可查询，切换动作不会出现无别名窗口；
- 验证失败时不切换别名。

- [ ] **Step 2: 运行测试确认红灯**

Run: `./mvnw -Dtest=SearchIndexRebuilderIntegrationTest test`

Expected: FAIL，管理器不存在。

- [ ] **Step 3: 实现动态索引创建**

使用本机 Spring Data Elasticsearch 6.1.1 已确认的 API：

```java
IndexOperations ops = operations.indexOps(IndexCoordinates.of(indexName));
ops.create(
        ops.createSettings(UniversityProgrammeSearchDocument.class),
        ops.createMapping(UniversityProgrammeSearchDocument.class)
);
```

索引名称使用固定前缀加 UTC 时间和短随机后缀，不能使用用户输入。

- [ ] **Step 4: 实现批量重建和验证**

读取所有符合公开条件的院校 ID，逐批加载完整投影并写入新索引。刷新后比较预期文档数与 Elasticsearch 实际文档数；只有相等才允许切换别名。

- [ ] **Step 5: 原子切换别名**

使用 `AliasActions` 在一个请求内移除旧索引别名并给新索引添加读写别名：

```java
AliasActionParameters addRead = AliasActionParameters.builder()
        .withIndices(newIndex)
        .withAliases(SearchIndexNames.READ_ALIAS)
        .build();
AliasActionParameters addWrite = AliasActionParameters.builder()
        .withIndices(newIndex)
        .withAliases(SearchIndexNames.WRITE_ALIAS)
        .withIsWriteIndex(true)
        .build();
```

同一个 `AliasActions` 请求还要包含从旧索引移除两个别名的动作，确保切换原子完成。不要在本任务自动删除旧索引；旧索引清理由后续受控维护流程完成。

- [ ] **Step 6: 配置属性**

`application.yml` 只保存非敏感默认值，例如批量大小和别名前缀。任何连接凭据继续来自环境变量，不能写入仓库。

- [ ] **Step 7: 添加首次部署初始化测试与实现**

`SearchIndexInitializerTest` Mock `SearchIndexManager` 和 `SearchIndexRebuilder`，断言：读写别名都存在时不调用 rebuild；任一必需别名缺失时只调用一次 rebuild；初始化失败时记录安全错误并使应用启动失败，不能让 API 在未知索引状态下假装可用。

Initializer 只负责首次部署的缺失检测，不在每次启动时删除或重建已有索引。

- [ ] **Step 8: 运行任务测试与完整测试**

Run:

```bash
./mvnw -Dtest=SearchIndexRebuilderIntegrationTest,SearchIndexInitializerTest test
./mvnw test
```

Expected: PASS。

- [ ] **Step 9: 提交**

```bash
git add backend/src/main/java/com/yangdoujiao/website/search/v4/index \
  backend/src/main/resources/application.yml \
  backend/src/test/resources/application-test.yml \
  backend/src/test/java/com/yangdoujiao/website/search/v4/index
git diff --cached --check
git commit -m "feat: 新增搜索索引重建与别名切换"
```

---

### Task 6: Elasticsearch nested 查询与院校级分页

**Files:**
- Create: `backend/src/main/java/com/yangdoujiao/website/search/v4/model/UniversitySearchResult.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/search/v4/query/UniversitySearchQueryFactory.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/search/v4/query/UniversitySearchGateway.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/search/v4/query/ElasticsearchUniversitySearchGateway.java`
- Test: `backend/src/test/java/com/yangdoujiao/website/search/v4/query/UniversitySearchQueryFactoryTest.java`
- Test: `backend/src/test/java/com/yangdoujiao/website/search/v4/query/ElasticsearchUniversitySearchGatewayIntegrationTest.java`

**Interfaces:**
- Produces: `PageResponse<UniversitySearchResult> search(UniversitySearchCriteria criteria, ResolvedSearchTerm resolvedTerm)`。
- Consumes: `UniversitySearchCriteria`、`universities-v4-read` 别名和 `UniversityProgrammeSearchDocument`。

- [ ] **Step 1: 写 QueryFactory 单元测试**

断言生成查询满足：

- 同维度 terms 是 OR；
- 不同维度进入同一 programme nested bool 的 filter/must；
- 国家条件在根文档；
- duration 精确匹配；
- intake 使用 `YYYY-MM`；
- 学费交集为 `document.max >= request.min` 且 `document.min <= request.max`；
- 只设置 tuitionMin 或 tuitionMax 时仍形成正确单边范围；
- inner hits 名称固定为 `matched_programmes`、size 为 3。

- [ ] **Step 2: 运行 QueryFactory 测试确认红灯**

Run: `./mvnw -Dtest=UniversitySearchQueryFactoryTest test`

Expected: FAIL。

- [ ] **Step 3: 使用 NativeQuery 实现查询工厂**

使用 Spring Data Elasticsearch 6.1.1 的 `NativeQuery.builder()` 和 Elasticsearch Java Client 9.4.5 的 typed query builder。禁止拼接 JSON 或 query string。

分页转换：

```java
Pageable pageable = PageRequest.of(criteria.page() - 1, criteria.pageSize());
```

有关键词时按 `_score`、`popular`、稳定 ID 排序；无关键词时按 `popular`、名称 keyword、稳定 ID 排序。

- [ ] **Step 4: 写真实 Elasticsearch 筛选矩阵测试**

至少覆盖 `docs/data/filter-test-matrix.md` 的 F01～F15、F22、F23：

- 同课程 AND；
- 禁止跨课程拼接；
- 同维度 OR；
- 多语言和多入学时间；
- 学费交集与空学费；
- 一校一卡；
- 每校最多三个专业；
- 13 所院校分页 12＋1；
- 草稿院校和专业不可见。

- [ ] **Step 5: 实现 Gateway 和 inner hits 映射**

```java
SearchHits<UniversityProgrammeSearchDocument> hits = operations.search(
        query,
        UniversityProgrammeSearchDocument.class,
        IndexCoordinates.of(SearchIndexNames.READ_ALIAS)
);
```

从 `SearchHit#getInnerHits("matched_programmes")` 读取最多三项。`totalItems` 使用根文档 `hits.getTotalHits()`，不能用专业数量。映射代码集中在 Gateway，不让 Controller 依赖 Elasticsearch 类型。

- [ ] **Step 6: 运行任务测试**

Run:

```bash
./mvnw -Dtest=UniversitySearchQueryFactoryTest,ElasticsearchUniversitySearchGatewayIntegrationTest test
```

Expected: PASS；分页无重复、无遗漏。

- [ ] **Step 7: 提交**

```bash
git add backend/src/main/java/com/yangdoujiao/website/search/v4/model \
  backend/src/main/java/com/yangdoujiao/website/search/v4/query \
  backend/src/test/java/com/yangdoujiao/website/search/v4/query
git diff --cached --check
git commit -m "feat: 实现院校课程嵌套筛选"
```

---

### Task 7: 别名解析、公开 Service 与 V1 Controller

**Files:**
- Create: `backend/src/main/java/com/yangdoujiao/website/search/v4/model/ResolvedSearchTerm.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/search/v4/alias/SearchAliasResolver.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/search/v4/SearchFilterCodeValidator.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/search/v4/UniversitySearchV1Service.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/search/v4/api/MatchedProgrammeResponse.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/search/v4/api/UniversitySearchItemResponse.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/search/v4/api/UniversitySearchV1Controller.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/search/v4/SearchServiceUnavailableException.java`
- Modify: `backend/src/main/java/com/yangdoujiao/website/common/exception/GlobalExceptionHandler.java`
- Test: `backend/src/test/java/com/yangdoujiao/website/search/v4/alias/SearchAliasResolverIntegrationTest.java`
- Test: `backend/src/test/java/com/yangdoujiao/website/search/v4/SearchFilterCodeValidatorIntegrationTest.java`
- Test: `backend/src/test/java/com/yangdoujiao/website/search/v4/UniversitySearchV1ServiceTest.java`
- Test: `backend/src/test/java/com/yangdoujiao/website/search/v4/api/UniversitySearchV1ControllerTest.java`

**Interfaces:**
- Produces: `GET /api/v1/universities/search`。
- Produces: `PageResponse<UniversitySearchItemResponse>`。
- Consumes: CriteriaFactory、SearchFilterCodeValidator、AliasResolver 和 SearchGateway。

- [ ] **Step 1: 写别名解析测试**

测试规范化精确匹配、仅 `PUBLISHED` 别名有效、未知别名保持普通关键词、同一规范化别名出现冲突目标时返回明确校验错误。测试数据中的 `UK → COUNTRY → GB` 只能写入临时数据库。

- [ ] **Step 2: 实现别名解析器**

`ResolvedSearchTerm` 明确区分普通文本和结构化目标：

```java
public record ResolvedSearchTerm(
        String text,
        SearchAliasTargetType targetType,
        String targetCode
) {
    public boolean isAlias() { return targetType != null; }
}
```

别名匹配使用与 Task 3 相同的 trim、空格合并和小写规范化逻辑，避免两套规则漂移。

- [ ] **Step 3: 写 Service 单元测试**

先写 `SearchFilterCodeValidatorIntegrationTest`：国家代码必须存在；专业分类、学历、课程模式和语言代码必须存在且状态为 `PUBLISHED`；未知、草稿或归档代码产生对应字段错误。随后 Mock CriteriaFactory、Validator、AliasResolver 和 Gateway，验证调用顺序、普通关键词、结构化别名、空关键词、空结果和 Gateway 异常转换。

- [ ] **Step 4: 实现筛选代码校验器**

在目录 Repository 中增加明确的存在性方法：

```java
boolean existsByCode(String code);
boolean existsByCodeAndStatus(String code, CategoryStatus status);
```

Validator 一次验证去重后的代码集合，把所有错误合并进 `SearchValidationException.fieldErrors`，不能遇到第一个错误就丢失其余字段错误。

- [ ] **Step 5: 实现 Service 与安全异常转换**

只捕获 Elasticsearch 连接或查询执行异常，转换为 `SearchServiceUnavailableException`；参数错误继续返回 400，未知编程错误不能被伪装为 503。

- [ ] **Step 6: 写 Controller MVC 测试**

覆盖：默认参数、重复 query 参数、多条件请求、分页响应、400 字段错误、503 安全错误、空结果 200，以及响应中最多三个匹配专业。

- [ ] **Step 7: 实现 Controller**

```java
@RestController
@RequestMapping("/api/v1/universities")
public class UniversitySearchV1Controller {
    @GetMapping("/search")
    public PageResponse<UniversitySearchItemResponse> search(
            @ModelAttribute UniversitySearchQuery query
    ) {
        return service.search(query);
    }
}
```

全局异常处理器把搜索服务不可用转换为 `503 SEARCH_SERVICE_UNAVAILABLE`，并保留 `traceId`。

- [ ] **Step 8: 运行任务测试和旧接口回归测试**

Run:

```bash
./mvnw -Dtest=SearchAliasResolverIntegrationTest,SearchFilterCodeValidatorIntegrationTest,UniversitySearchV1ServiceTest,UniversitySearchV1ControllerTest,UniversitySearchServiceTest test
```

Expected: PASS。

- [ ] **Step 9: 提交**

```bash
git add backend/src/main/java/com/yangdoujiao/website/search/v4 \
  backend/src/main/java/com/yangdoujiao/website/common/exception/GlobalExceptionHandler.java \
  backend/src/test/java/com/yangdoujiao/website/search/v4
git diff --cached --check
git commit -m "feat: 新增V1院校课程搜索接口"
```

---

### Task 8: 可靠增量同步任务

**Files:**
- Create: `backend/src/main/java/com/yangdoujiao/website/search/v4/sync/SearchSyncEnqueuer.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/search/v4/sync/SearchSyncJobClaimer.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/search/v4/sync/SearchSyncWorker.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/search/v4/sync/SearchSyncConfiguration.java`
- Modify: `backend/src/main/java/com/yangdoujiao/website/search/v4/sync/SearchSyncJobRepository.java`
- Modify: `backend/src/main/resources/application.yml`
- Test: `backend/src/test/java/com/yangdoujiao/website/search/v4/sync/SearchSyncEnqueuerIntegrationTest.java`
- Test: `backend/src/test/java/com/yangdoujiao/website/search/v4/sync/SearchSyncWorkerIntegrationTest.java`

**Interfaces:**
- Produces: `void enqueue(long universityId)`，必须在业务事务内调用。
- Produces: `List<Long> claimBatch(int batchSize, Instant now)`，用 PostgreSQL 锁安全领取任务。
- Consumes: ProjectionLoader 和 `universities-v4-write` 别名。

- [ ] **Step 1: 写入队和事务回滚测试**

验证业务事务提交时任务存在，事务回滚时任务也回滚；错误摘要和日志不包含业务正文。连续入队允许 worker 合并同一院校任务，但不能丢失处理期间的新变更。

- [ ] **Step 2: 写并发领取测试**

两个线程同时领取任务，每个 job 只能被一个 worker 获取。使用 PostgreSQL `FOR UPDATE SKIP LOCKED`，不能用 JVM 进程内锁代替数据库锁。

- [ ] **Step 3: 实现 Enqueuer 和 Claimer**

Claimer 在短事务内把任务从 `PENDING` 改为 `PROCESSING` 并写 `locked_at`，随后提交；调用 Elasticsearch 时不能持有数据库行锁。

- [ ] **Step 4: 写 Worker 成功、删除和重试测试**

覆盖：

- 公开院校保存完整文档；
- 非公开院校从索引删除；
- 成功后删除已完成 job；
- Elasticsearch 失败后增加次数并按延迟重新设为 `PENDING`；
- 超过最大次数标记 `FAILED`；
- 超时的 `PROCESSING` 任务可恢复；
- 错误日志不含完整 Elasticsearch 响应或业务内容。

- [ ] **Step 5: 实现 Worker**

`SearchSyncWorker` 每次处理有限批次。每个任务独立失败，单条错误不能阻止同批其他任务。重试时间使用确定性的递增延迟，测试通过注入 `Clock` 验证，不使用真实 sleep。

- [ ] **Step 6: 添加调度配置**

通过 `SearchSyncConfiguration` 启用调度。`application.yml` 提供非敏感默认值：批次大小、固定轮询间隔、最大重试次数和锁超时。测试 profile 可关闭自动调度，避免测试不稳定。

- [ ] **Step 7: 运行任务测试和完整测试**

Run:

```bash
./mvnw -Dtest=SearchSyncEnqueuerIntegrationTest,SearchSyncWorkerIntegrationTest test
./mvnw test
```

Expected: PASS，没有依赖等待时间的脆弱测试。

- [ ] **Step 8: 提交**

```bash
git add backend/src/main/java/com/yangdoujiao/website/search/v4/sync \
  backend/src/main/resources/application.yml \
  backend/src/test/java/com/yangdoujiao/website/search/v4/sync
git diff --cached --check
git commit -m "feat: 新增搜索索引可靠同步任务"
```

---

### Task 9: 文档、完整验收与兼容性审核

**Files:**
- Modify: `docs/API.md`
- Modify: `docs/DATABASE.md`
- Modify: `docs/data/filter-test-matrix.md`
- Test: all backend tests

**Interfaces:**
- Documents: V4 搜索和筛选字典接口、请求示例、响应示例、错误码、数据库表和同步运维流程。
- Verifies: 旧接口、V1～V4 迁移、PostgreSQL、Redis 和 Elasticsearch 测试容器的完整基线。

- [ ] **Step 1: 更新中文 API 文档**

`docs/API.md` 必须包含：

- 两个 V4 endpoint；
- 所有 query 参数、重复参数 OR 规则和跨维度 AND 规则；
- 默认分页和最大 size；
- 学费交集定义；
- 200 空分页、400 校验错误和 503 搜索不可用示例；
- 中英文空值和最多三个匹配专业规则；
- 旧接口暂时保留的迁移说明。

- [ ] **Step 2: 更新数据库与测试矩阵**

`docs/DATABASE.md` 记录 V4 迁移、新字段、别名表和同步任务表。`docs/data/filter-test-matrix.md` 把已经实现并运行的场景标记为已验证；不能把未执行的浏览器或正式数据测试写成通过。

- [ ] **Step 3: 运行格式和敏感文件检查**

Run:

```bash
git diff --check main
git ls-files -- '.env' ':(glob)**/.env' ':(glob)**/.env.local'
git diff --exit-code main...HEAD -- \
  backend/src/main/resources/db/migration/V1__create_universities_table.sql \
  backend/src/main/resources/db/migration/V2__create_catalog_tables.sql \
  backend/src/main/resources/db/migration/V3__extend_universities_and_create_programmes.sql
```

Expected: 无格式错误；没有真实 `.env` 被跟踪；V1～V3 没有变化。

- [ ] **Step 4: 运行完整后端测试**

Run:

```bash
cd backend
./mvnw clean test
```

Expected: `BUILD SUCCESS`，所有测试 0 failures、0 errors。

- [ ] **Step 5: 本地 API 冒烟测试**

基础服务和后端启动后验证：

```bash
curl -i 'http://localhost:8080/api/v1/catalog/filter-options'
curl -i 'http://localhost:8080/api/v1/universities/search?page=1&size=12'
curl -i 'http://localhost:8080/api/v1/universities/search?country=GB&level=MASTER&language=EN'
curl -i 'http://localhost:8080/api/v1/universities/search?tuitionMin=300000&tuitionMax=200000'
curl -i 'http://localhost:8080/api/search?q=University'
```

Expected: 前三条分别是 200；颠倒学费为 400 且含 `traceId`；旧接口仍为 200。正式开发库没有资料时允许新搜索返回空分页，不能为演示写入虚构正式数据。

- [ ] **Step 6: 提交文档**

```bash
git add docs/API.md docs/DATABASE.md docs/data/filter-test-matrix.md
git diff --cached --check
git commit -m "docs: 完善V4搜索接口与同步说明"
```

- [ ] **Step 7: 最终只读审核**

对 `main...HEAD` 请求独立代码审查，重点检查：

- nested 查询没有跨专业误匹配；
- 分页总数按院校计算；
- outbox 任务不会在并发或失败时丢失；
- Elasticsearch 故障只转换已知基础设施异常；
- 没有 N+1 查询、敏感信息日志或未经批准的正式数据；
- 文档与实际接口完全一致。

发现 Critical 或 Important 问题必须修复并重新运行完整测试，才能创建 PR。

---

## 实施顺序和检查点

```text
Task 1  V4 数据结构
  ↓ 审核数据库兼容性
Task 2  筛选字典接口
  ↓ 审核公开字典边界
Task 3  请求契约和校验
  ↓ 审核 API 规则
Task 4  PostgreSQL 搜索投影
  ↓ 审核映射和查询数量
Task 5  索引重建与别名
  ↓ 审核无中断切换
Task 6  nested 查询和分页
  ↓ 审核完整筛选矩阵
Task 7  别名、Service、Controller
  ↓ 审核 HTTP 契约和兼容性
Task 8  可靠增量同步
  ↓ 审核并发、重试和恢复
Task 9  文档与最终验收
```

每个任务通过测试和审查后再进入下一项，不把全部改动堆积成一个大提交。
