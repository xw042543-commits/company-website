# Miniapp Community Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a production-safe U圈 community for 5,000 registered users and 500 concurrent users with posts, comments, likes, reports, moderation, and real miniapp/adviser interfaces.

**Architecture:** Add a focused `community` module to the existing Spring Boot modular monolith. PostgreSQL remains the source of truth; Redis is limited to fail-closed rate limiting, short-lived hot-feed caching, and idempotency acceleration. The native miniapp uses the shared bearer request layer, while moderation reuses the existing Adviser session and `/api/v1/adviser/**` boundary.

**Tech Stack:** Java 21, Spring Boot, Spring Security, Spring Data JPA, PostgreSQL, Redis, Flyway, Testcontainers, Next.js/React/TypeScript, native WeChat Mini Program TypeScript/WXML/WXSS, Node.js 24.

**Spec:** `docs/superpowers/specs/2026-10-08-miniapp-community-design.md`

## Global Constraints

- Capacity target is 5,000 registered users, 500 concurrent users, 100 reads/second, and 20 writes/second.
- PostgreSQL is the only business source of truth; Redis loss must not lose posts, reactions, reports, restrictions, or moderation decisions.
- Normal content publishes immediately; prohibited content is rejected and risky content enters `PENDING_REVIEW`.
- Posts and comments always bind to a real account; no anonymous posting.
- Posts are 1–2,000 Unicode code points, comments 1–1,000, and report notes 0–500.
- V1 is text-only: no private messaging, group chat, media upload, microservice, message queue, or Elasticsearch community index.
- Public DTOs never expose account IDs, openids, email, phone, restriction reasons, or moderation internals.
- Miniapp post/comment creation and report submission carry `Idempotency-Key`; inherently idempotent reaction `PUT`/`DELETE` requests do not require it. Moderation writes carry the current entity version.
- Redis failure must fail closed for post, comment, and report creation; reads continue from PostgreSQL.
- Existing layout, authentication, adviser consultation workflows, and university features must remain unchanged.

## File Map

- `backend/src/main/resources/db/migration/V14__create_community.sql`: community tables, constraints, and indexes.
- `backend/src/main/java/com/yangdoujiao/website/community/`: domain entities, repositories, DTOs, cursor codec, services, controllers, limiter, audit, and configuration.
- `backend/src/test/java/com/yangdoujiao/website/community/`: schema, service, HTTP, persistence, security, and Redis-failure tests.
- `backend/src/main/java/com/yangdoujiao/website/auth/config/SecurityConfig.java`: public community reads, authenticated community writes, and Adviser moderation boundary.
- `miniapp/miniprogram/services/community.ts`: strict community API client and DTO validation.
- `miniapp/miniprogram/pages/circle/`: real feed replacing the construction placeholder.
- `miniapp/miniprogram/pages/circle-detail/`, `circle-compose/`, `circle-me/`: detail, publish, and personal-content pages.
- `miniapp/miniprogram/components/community-post-card/`: reusable post summary card.
- `frontend/src/lib/adviser-community-api.ts`: strict Adviser moderation client.
- `frontend/src/app/[locale]/adviser/community/page.tsx` and `frontend/src/components/adviser-community-panel.tsx`: moderation workspace.
- `backend/src/test/k6/community-capacity.js`: repeatable capacity model.

---

### Task 1: Community schema and domain foundation

**Files:**
- Create: `backend/src/main/resources/db/migration/V14__create_community.sql`
- Create: `backend/src/main/java/com/yangdoujiao/website/community/CommunityPost.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/community/CommunityComment.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/community/CommunityReaction.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/community/CommunityReport.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/community/CommunityModerationAction.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/community/CommunityUserRestriction.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/community/CommunityIdempotencyRecord.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/community/CommunityContentStatus.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/community/CommunityTargetType.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/community/CommunityReportStatus.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/community/CommunityRestrictionType.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/community/CommunityPostRepository.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/community/CommunityCommentRepository.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/community/CommunityReactionRepository.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/community/CommunityReportRepository.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/community/CommunityModerationActionRepository.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/community/CommunityUserRestrictionRepository.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/community/CommunityIdempotencyRecordRepository.java`
- Test: `backend/src/test/java/com/yangdoujiao/website/community/CommunitySchemaIntegrationTest.java`

**Interfaces:**
- Consumes: `user_accounts.id BIGINT` and existing Flyway/Testcontainers setup.
- Produces: JPA entities with `Long` account IDs, optimistic `version`, status enums, and repositories used by Tasks 2–5.

- [ ] **Step 1: Write the failing schema integration test**

```java
@Test
void enforcesCommunityOwnershipUniquenessAndStatusChecks() {
    long user = insertActiveUser();
    long post = jdbc.queryForObject("""
        INSERT INTO community_posts(author_account_id, body, status, published_at)
        VALUES (?, 'hello', 'PUBLISHED', NOW()) RETURNING id
        """, Long.class, user);
    jdbc.update("INSERT INTO community_reactions(account_id,target_type,target_id) VALUES (?,'POST',?)", user, post);
    assertThatThrownBy(() -> jdbc.update(
        "INSERT INTO community_reactions(account_id,target_type,target_id) VALUES (?,'POST',?)", user, post))
        .isInstanceOf(DataIntegrityViolationException.class);
    assertThatThrownBy(() -> jdbc.update(
        "UPDATE community_posts SET status='UNKNOWN' WHERE id=?", post))
        .isInstanceOf(DataIntegrityViolationException.class);
}
```

- [ ] **Step 2: Run the test to verify V14 is missing**

Run: `cd backend && ./mvnw -Dtest=CommunitySchemaIntegrationTest test`  
Expected: FAIL because `community_posts` and related tables do not exist.

- [ ] **Step 3: Add V14 with exact tables and constraints**

```sql
CREATE TABLE community_posts (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  author_account_id BIGINT NOT NULL REFERENCES user_accounts(id),
  body TEXT NOT NULL,
  status VARCHAR(30) NOT NULL,
  comment_count INTEGER NOT NULL DEFAULT 0 CHECK (comment_count >= 0),
  like_count INTEGER NOT NULL DEFAULT 0 CHECK (like_count >= 0),
  risk_reason_code VARCHAR(50),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  version BIGINT NOT NULL DEFAULT 0,
  CONSTRAINT ck_community_post_body CHECK (CHAR_LENGTH(body) BETWEEN 1 AND 2000),
  CONSTRAINT ck_community_post_status CHECK (status IN ('PENDING_REVIEW','PUBLISHED','HIDDEN','DELETED','REJECTED'))
);
CREATE INDEX idx_community_posts_feed ON community_posts(status, published_at DESC, id DESC);
CREATE INDEX idx_community_posts_author ON community_posts(author_account_id, created_at DESC, id DESC);
```

Add the remaining tables with explicit ownership, uniqueness, and audit constraints:

```sql
CREATE TABLE community_comments (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  post_id BIGINT NOT NULL REFERENCES community_posts(id),
  author_account_id BIGINT NOT NULL REFERENCES user_accounts(id),
  parent_comment_id BIGINT REFERENCES community_comments(id),
  reply_to_account_id BIGINT REFERENCES user_accounts(id),
  body TEXT NOT NULL CHECK (CHAR_LENGTH(body) BETWEEN 1 AND 1000),
  status VARCHAR(30) NOT NULL CHECK (status IN ('PENDING_REVIEW','PUBLISHED','HIDDEN','DELETED','REJECTED')),
  like_count INTEGER NOT NULL DEFAULT 0 CHECK (like_count >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), version BIGINT NOT NULL DEFAULT 0,
  CONSTRAINT uk_community_comment_id_post UNIQUE(id, post_id),
  CONSTRAINT fk_community_comment_parent_post FOREIGN KEY(parent_comment_id, post_id)
    REFERENCES community_comments(id, post_id)
);
CREATE INDEX idx_community_comments_post ON community_comments(post_id,status,created_at,id);
CREATE INDEX idx_community_comments_parent ON community_comments(parent_comment_id,status,created_at,id);
CREATE INDEX idx_community_comments_author ON community_comments(author_account_id,created_at DESC,id DESC);

CREATE TABLE community_reactions (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  account_id BIGINT NOT NULL REFERENCES user_accounts(id),
  target_type VARCHAR(10) NOT NULL CHECK (target_type IN ('POST','COMMENT')),
  target_id BIGINT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uk_community_reaction UNIQUE(account_id,target_type,target_id)
);

CREATE TABLE community_reports (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  reporter_account_id BIGINT NOT NULL REFERENCES user_accounts(id),
  target_type VARCHAR(10) NOT NULL CHECK (target_type IN ('POST','COMMENT')),
  target_id BIGINT NOT NULL, reason_code VARCHAR(50) NOT NULL, note VARCHAR(500),
  status VARCHAR(30) NOT NULL CHECK (status IN ('OPEN','RESOLVED_ACTIONED','RESOLVED_REJECTED')),
  handled_by_account_id BIGINT REFERENCES user_accounts(id), handled_at TIMESTAMPTZ,
  resolution_reason_code VARCHAR(50), created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX uk_community_open_report ON community_reports(reporter_account_id,target_type,target_id) WHERE status='OPEN';

CREATE TABLE community_moderation_actions (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  actor_account_id BIGINT NOT NULL REFERENCES user_accounts(id), target_type VARCHAR(10) NOT NULL,
  target_id BIGINT NOT NULL, action VARCHAR(30) NOT NULL, reason_code VARCHAR(50) NOT NULL,
  previous_status VARCHAR(30), next_status VARCHAR(30), created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE community_user_restrictions (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  account_id BIGINT NOT NULL REFERENCES user_accounts(id), restriction_type VARCHAR(10) NOT NULL CHECK (restriction_type IN ('MUTED','BANNED')),
  reason_code VARCHAR(50) NOT NULL, starts_at TIMESTAMPTZ NOT NULL, ends_at TIMESTAMPTZ,
  created_by_account_id BIGINT NOT NULL REFERENCES user_accounts(id), released_at TIMESTAMPTZ,
  released_by_account_id BIGINT REFERENCES user_accounts(id)
);
CREATE TABLE community_idempotency_records (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  account_id BIGINT NOT NULL REFERENCES user_accounts(id), operation_type VARCHAR(30) NOT NULL,
  idempotency_key VARCHAR(64) NOT NULL, request_hash VARCHAR(64) NOT NULL, result_target_id BIGINT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uk_community_idempotency UNIQUE(account_id,operation_type,idempotency_key)
);
```

- [ ] **Step 4: Add focused entities and repositories**

```java
public enum CommunityContentStatus { PENDING_REVIEW, PUBLISHED, HIDDEN, DELETED, REJECTED }
public enum CommunityTargetType { POST, COMMENT }
public interface CommunityPostRepository extends JpaRepository<CommunityPost, Long> {}
public interface CommunityCommentRepository extends JpaRepository<CommunityComment, Long> {}
```

Map `@Version private long version`, immutable creation timestamps, and package-private state transition methods; do not expose public setters.

- [ ] **Step 5: Run schema and repository tests**

Run: `cd backend && ./mvnw -Dtest=CommunitySchemaIntegrationTest test`  
Expected: PASS, including duplicate reaction, invalid state, negative counter, cross-post reply, and duplicate open-report constraints.

- [ ] **Step 6: Commit Task 1**

```bash
git add backend/src/main/resources/db/migration/V14__create_community.sql backend/src/main/java/com/yangdoujiao/website/community backend/src/test/java/com/yangdoujiao/website/community/CommunitySchemaIntegrationTest.java
git commit -m "feat: add community persistence model"
```

---

### Task 2: Stable cursors and public read API

**Files:**
- Create: `backend/src/main/java/com/yangdoujiao/website/community/CommunityCursorCodec.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/community/CommunityPostSummary.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/community/CommunityPostDetail.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/community/CommunityCommentView.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/community/CommunityCursorPage.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/community/CommunityReadService.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/community/CommunityPostController.java`
- Modify: `backend/src/main/java/com/yangdoujiao/website/auth/config/SecurityConfig.java`
- Modify: `backend/src/main/java/com/yangdoujiao/website/auth/miniapp/MiniappBearerFilter.java`
- Test: `backend/src/test/java/com/yangdoujiao/website/community/CommunityReadHttpIntegrationTest.java`
- Test: `backend/src/test/java/com/yangdoujiao/website/community/CommunityCursorCodecTest.java`

**Interfaces:**
- Consumes: `CommunityPostRepository`, `CommunityCommentRepository`, `CommunityContentStatus`.
- Produces: `GET /api/v1/community/posts`, `GET /api/v1/community/posts/{id}`, `GET /api/v1/community/posts/{id}/comments`; opaque cursor codec.

- [ ] **Step 1: Write failing cursor and visibility tests**

```java
@Test
void listUsesOpaqueCursorAndNeverReturnsHiddenPosts() throws Exception {
    seedPublishedPostsWithSameTimestamp(3);
    seedPost(CommunityContentStatus.HIDDEN);
    String first = mvc.perform(get("/api/v1/community/posts").param("size", "2"))
        .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
    String cursor = JsonPath.read(first, "$.nextCursor");
    mvc.perform(get("/api/v1/community/posts").param("size", "2").param("cursor", cursor))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.items.length()").value(1))
        .andExpect(jsonPath("$.items[0].status").doesNotExist());
}
```

- [ ] **Step 2: Run tests and verify missing controllers fail**

Run: `cd backend && ./mvnw -Dtest=CommunityCursorCodecTest,CommunityReadHttpIntegrationTest test`  
Expected: FAIL with 404 or missing types.

- [ ] **Step 3: Implement strict cursor and DTO contracts**

```java
public record CommunityCursorPage<T>(List<T> items, String nextCursor) {}
public record CommunityPostSummary(long id, String authorName, String authorAvatarUrl,
        String bodyPreview, int commentCount, int likeCount, OffsetDateTime publishedAt, boolean likedByMe) {}
public record CommunityCommentView(long id, String authorName, String authorAvatarUrl,
        String body, OffsetDateTime createdAt, int likeCount, boolean likedByMe, List<CommunityCommentView> replies) {}
```

Encode `(publishedAt,id,sort)` as Base64URL JSON with a server HMAC. Reject wrong sort, malformed Base64, invalid timestamp, unsafe ID, or tampered signature with `400 INVALID_COMMUNITY_CURSOR`.

- [ ] **Step 4: Implement indexed reads and public security rules**

```java
@GetMapping
CommunityCursorPage<CommunityPostSummary> list(@RequestParam(defaultValue="latest") String sort,
        @RequestParam(required=false) String cursor, @RequestParam(defaultValue="20") int size,
        @AuthenticationPrincipal UserPrincipal viewer) { return service.list(sort, cursor, size, viewer); }
```

Permit `GET` and `HEAD` for `/api/v1/community/posts` and `/api/v1/community/posts/**`; keep all other community methods authenticated. Extend `MiniappBearerFilter.shouldNotFilter` so Bearer authentication runs for `/api/v1/community/**` as well as `/api/v1/miniapp/**`. Add a CSRF ignore `RequestMatcher` that matches community requests only when the request path begins `/api/v1/community/` and the `Authorization` header begins `Bearer `; do not blanket-exempt Cookie-session community requests.

- [ ] **Step 5: Run read API tests**

Run: `cd backend && ./mvnw -Dtest=CommunityCursorCodecTest,CommunityReadHttpIntegrationTest test`  
Expected: PASS for latest order, same-timestamp tie breaking, max size 50, hidden/deleted exclusion, invalid cursor, missing post, and optional viewer like state.

- [ ] **Step 6: Commit Task 2**

```bash
git add backend/src/main/java/com/yangdoujiao/website/community backend/src/main/java/com/yangdoujiao/website/auth/config/SecurityConfig.java backend/src/test/java/com/yangdoujiao/website/community
git commit -m "feat: add community read APIs"
```

---

### Task 3: Fail-closed limits, idempotent posts, and comments

**Files:**
- Create: `backend/src/main/java/com/yangdoujiao/website/community/CommunityProperties.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/community/CommunityRateLimiter.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/community/CommunityRiskPolicy.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/community/CommunityPostRequest.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/community/CommunityCommentRequest.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/community/CommunityWriteService.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/community/CommunityCommentController.java`
- Modify: `backend/src/main/java/com/yangdoujiao/website/community/CommunityPostController.java`
- Modify: `backend/src/main/resources/application.yml`
- Modify: `.env.example`
- Modify: `compose.production.yaml`
- Test: `backend/src/test/java/com/yangdoujiao/website/community/CommunityWriteHttpIntegrationTest.java`
- Test: `backend/src/test/java/com/yangdoujiao/website/community/CommunityRateLimiterTest.java`

**Interfaces:**
- Consumes: entities and repositories from Task 1; authenticated `UserPrincipal.userId()`.
- Produces: idempotent post/comment creation and owner deletion; `CommunityRiskPolicy.classify(String)` returning `PUBLISH`, `REVIEW`, or `REJECT`.

- [ ] **Step 1: Write failing write, length, idempotency, and Redis-failure tests**

```java
@Test
void repeatedIdempotencyKeyReturnsTheOriginalPost() throws Exception {
    String key = UUID.randomUUID().toString();
    String first = postAsUser("/api/v1/community/posts", key, "真实帖子").andExpect(status().isCreated())
        .andReturn().getResponse().getContentAsString();
    postAsUser("/api/v1/community/posts", key, "真实帖子").andExpect(status().isOk())
        .andExpect(jsonPath("$.id").value(JsonPath.read(first, "$.id")));
    assertThat(countPosts()).isEqualTo(1);
}
```

Also assert 2,001 code points, blank text, another user's delete, missing key, muted user, and unavailable Redis return 400/403/409/503 as specified.

- [ ] **Step 2: Run focused tests and verify they fail**

Run: `cd backend && ./mvnw -Dtest=CommunityWriteHttpIntegrationTest,CommunityRateLimiterTest test`  
Expected: FAIL because write services and endpoints do not exist.

- [ ] **Step 3: Implement validated configuration and limiter**

```java
@ConfigurationProperties("app.community")
public record CommunityProperties(boolean enabled, int postPerMinute, int postPerDay,
        int commentPerMinute, int commentPerDay, int reportPerDay, Duration hotCacheTtl) {
    public CommunityProperties { if (postPerMinute < 1 || postPerDay < postPerMinute
            || hotCacheTtl.isNegative() || hotCacheTtl.isZero())
        throw new IllegalArgumentException("Invalid community limits"); }
}
```

Use one atomic Redis Lua increment-with-expiry per window. Hash client addresses before constructing keys. Catch Redis access failures and throw `503 COMMUNITY_WRITE_UNAVAILABLE` for posts, comments, and reports.

- [ ] **Step 4: Implement risk classification and transactional writes**

```java
public enum RiskDecision { PUBLISH, REVIEW, REJECT }
public interface CommunityRiskPolicy { RiskDecision classify(String normalizedText); }
@Transactional
public CommunityPostDetail createPost(long actorId, String idempotencyKey, CommunityPostRequest request) {
    return idempotency.execute(actorId, "CREATE_POST", idempotencyKey, fingerprints.post(request), () -> {
        restrictions.requireWriteAllowed(actorId);
        limiter.checkPost(actorId);
        RiskDecision decision = riskPolicy.classify(request.body());
        if (decision == RiskDecision.REJECT) throw rejected();
        CommunityPost post = CommunityPost.create(actorId, request.body(), decision, OffsetDateTime.now(clock));
        return mapper.detail(posts.save(post), actorId);
    });
}
@Transactional
public CommunityCommentView createComment(long actorId, long postId, String idempotencyKey, CommunityCommentRequest request) {
    return idempotency.execute(actorId, "CREATE_COMMENT", idempotencyKey, fingerprints.comment(postId, request), () -> {
        restrictions.requireWriteAllowed(actorId);
        limiter.checkComment(actorId);
        CommunityPost post = posts.requirePublished(postId);
        CommunityComment parent = comments.requireParentOnPost(request.parentCommentId(), postId);
        return mapper.view(comments.save(CommunityComment.create(post, parent, actorId, request.body(), OffsetDateTime.now(clock))), actorId);
    });
}
```

Normalize line endings only; preserve user-visible spacing. Count Unicode code points. Store idempotency result identity in PostgreSQL before commit; the same key with a different body returns `409 IDEMPOTENCY_CONFLICT`.

- [ ] **Step 5: Run focused and auth security tests**

Run: `cd backend && ./mvnw -Dtest=CommunityWriteHttpIntegrationTest,CommunityRateLimiterTest,AuthSecurityHttpIntegrationTest test`  
Expected: PASS; GET remains public, writes require `ROLE_USER`, and Adviser routes still require `ROLE_ADVISER`.

- [ ] **Step 6: Commit Task 3**

```bash
git add backend .env.example compose.production.yaml
git commit -m "feat: add safe community publishing"
```

---

### Task 4: Transactional reactions and rebuildable counters

**Files:**
- Create: `backend/src/main/java/com/yangdoujiao/website/community/CommunityReactionService.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/community/CommunityReactionController.java`
- Test: `backend/src/test/java/com/yangdoujiao/website/community/CommunityReactionHttpIntegrationTest.java`
- Test: `backend/src/test/java/com/yangdoujiao/website/community/CommunityCounterPersistenceIntegrationTest.java`

**Interfaces:**
- Consumes: `CommunityReactionRepository`, post/comment repositories, target enums.
- Produces: idempotent `PUT`/`DELETE` like endpoints and counter reconciliation query.

- [ ] **Step 1: Write failing reaction tests**

```java
@Test
void duplicateLikeIsIdempotentAndCounterCanBeRebuilt() throws Exception {
    putLike(postId).andExpect(status().isNoContent());
    putLike(postId).andExpect(status().isNoContent());
    assertThat(reactionCount(postId)).isEqualTo(1);
    assertThat(postLikeCount(postId)).isEqualTo(1);
    corruptPostLikeCount(postId, 9);
    service.reconcilePost(postId);
    assertThat(postLikeCount(postId)).isEqualTo(1);
}
```

- [ ] **Step 2: Run test to verify missing endpoints fail**

Run: `cd backend && ./mvnw -Dtest=CommunityReactionHttpIntegrationTest,CommunityCounterPersistenceIntegrationTest test`  
Expected: FAIL with 404 or missing service.

- [ ] **Step 3: Implement atomic insert/delete and count changes**

```java
@Transactional
public void like(long actorId, CommunityTargetType type, long targetId) {
    if (reactions.insertIfAbsent(actorId, type, targetId) == 1) targets.incrementLikeCount(type, targetId);
}
@Transactional
public void unlike(long actorId, CommunityTargetType type, long targetId) {
    if (reactions.deleteOwned(actorId, type, targetId) == 1) targets.decrementLikeCount(type, targetId);
}
```

Lock the target row before counter mutation and reject reactions to non-published content. Reconciliation computes counts from `community_reactions` and never trusts Redis.

- [ ] **Step 4: Run reaction tests**

Run: `cd backend && ./mvnw -Dtest=CommunityReactionHttpIntegrationTest,CommunityCounterPersistenceIntegrationTest test`  
Expected: PASS for concurrent duplicate likes, repeated deletes, hidden targets, comment targets, and reconciliation.

- [ ] **Step 5: Commit Task 4**

```bash
git add backend/src/main/java/com/yangdoujiao/website/community backend/src/test/java/com/yangdoujiao/website/community
git commit -m "feat: add community reactions"
```

---

### Task 5: Reports, restrictions, moderation, and private audit

**Files:**
- Create: `backend/src/main/java/com/yangdoujiao/website/community/CommunityReportRequest.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/community/CommunityReportService.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/community/CommunityReportController.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/community/AdviserCommunityModerationController.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/community/CommunityModerationService.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/community/CommunityModerationPage.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/community/CommunityModerationDetail.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/community/CommunityModerationRequest.java`
- Create: `backend/src/main/java/com/yangdoujiao/website/community/CommunityAuditLogger.java`
- Test: `backend/src/test/java/com/yangdoujiao/website/community/CommunityModerationHttpIntegrationTest.java`
- Test: `backend/src/test/java/com/yangdoujiao/website/community/CommunityAuditLoggerTest.java`

**Interfaces:**
- Consumes: report/restriction/action entities, `ROLE_ADVISER`, entity version.
- Produces: report submission and Adviser queue/detail/action endpoints; post-commit privacy-safe audit.

- [ ] **Step 1: Write failing report and moderation tests**

```java
@Test
void adviserActionRequiresReasonAndCurrentVersion() throws Exception {
    adviserAction(postId, "HIDE", "", 0).andExpect(status().isBadRequest());
    adviserAction(postId, "HIDE", "HARASSMENT", 0).andExpect(status().isOk());
    adviserAction(postId, "RESTORE", "APPEAL_ACCEPTED", 0).andExpect(status().isConflict());
    assertThat(lastAuditLine()).doesNotContain(postBody).doesNotContain(reporterNote);
}
```

Also test duplicate open reports, 501-code-point notes, non-Adviser access, timed mute expiry, banned writes, automatic hide threshold, restore, and rejected report resolution.

- [ ] **Step 2: Run tests and verify the moderation API is absent**

Run: `cd backend && ./mvnw -Dtest=CommunityModerationHttpIntegrationTest,CommunityAuditLoggerTest test`  
Expected: FAIL with missing endpoints/types.

- [ ] **Step 3: Implement report and moderation contracts**

```java
public record CommunityModerationRequest(
    @NotNull CommunityModerationCommand command,
    @NotBlank @Size(max=50) String reasonCode,
    @PositiveOrZero long version,
    OffsetDateTime restrictionEndsAt) {}
public enum CommunityModerationCommand { HIDE, RESTORE, REJECT_REPORT, MUTE, BAN }
```

Use repository projections for the queue so list responses never load private account contact fields. Resolve all open reports transactionally when a target decision is made.

- [ ] **Step 4: Implement post-commit audit**

```java
audit.recordAfterCommit(new CommunityAuditEvent(actorId, targetType, targetId,
    command.name(), reasonCode, outcome));
```

Log only trace ID, numeric identifiers, command, reason code, and outcome. Add tests that Unicode content and report notes never appear in captured logs.

- [ ] **Step 5: Run moderation, security, and audit tests**

Run: `cd backend && ./mvnw -Dtest=CommunityModerationHttpIntegrationTest,CommunityAuditLoggerTest,AdviserAuthorizationHttpIntegrationTest test`  
Expected: PASS, including 401/403/409 boundaries and transaction rollback without success audit.

- [ ] **Step 6: Commit Task 5**

```bash
git add backend/src/main/java/com/yangdoujiao/website/community backend/src/test/java/com/yangdoujiao/website/community
git commit -m "feat: add community moderation workflow"
```

---

### Task 6: Strict miniapp community client

Preflight correction (2026-10-08): include authenticated personal read APIs omitted by Tasks 2–5. Use author-scoped signed keyset cursors and exact `CommunityMyPost` / `CommunityMyComment` DTOs documented in spec §6.1, retaining all statuses and own replies regardless of public ancestors. Also add a shared safe restriction denial contract for post/comment/like/report with `details:{restrictionKind:"MUTE"|"BAN",endsAt:ISO|null}` and strict miniapp error parsing. Backend HTTP privacy/expiry tests and all relevant regressions are required. Task 7 consumes `listMyCommunityPosts`, `listMyCommunityComments`, deletion services, `error.details`, and Result-returning circle route builders; it must unwrap route results before navigation and handle absent/malformed restriction details generically.

Task 7 request-isolation correction (2026-10-09): cancellable community reads carry a validated, opaque, Page-instance `requestScope` used only to derive local shared-HTTP request keys. Same-instance refreshes retain supersession, while two feed/detail Page instances never cancel each other. Detail uses independent post, top-level comment, and per-root reply generations; only refresh/unload invalidates all reply continuations. Awaited writes must finish silently after Page unload, and avatar fallback resets only when its URL changes.

Task 7 review correction (2026-10-09): post detail and every comment/reply read DTO also include server-computed `ownedByMe:boolean`. Anonymous reads return false; authenticated reads compare the viewer to the stored author. The client must use this flag for delete affordances and must not infer ownership from nickname or scan a truncated personal list.

**Files:**
- Create: `miniapp/miniprogram/services/community.ts`
- Modify: `miniapp/miniprogram/utils/routes.ts`
- Test: `miniapp/tests/community.test.ts`
- Test: `miniapp/tests/routes.test.ts`

**Interfaces:**
- Consumes: shared `request<T>()`, `Result<T>`, session refresh, backend DTOs from Tasks 2–5.
- Produces: `listCommunityPosts`, `loadCommunityPost`, `listCommunityComments`, `createCommunityPost`, `createCommunityComment`, `setCommunityReaction`, `reportCommunityTarget`, and route builders.

- [ ] **Step 1: Write failing strict parser and request tests**

```ts
test('rejects malformed community pages instead of showing a false empty feed', () => {
  assert.deepEqual(parsePostPage({ items: [], nextCursor: 3 }), invalidCommunityResponse());
});
test('feed requests use a stable cancellation key', async () => {
  await service.listPosts({ sort: 'latest', cursor: null, size: 20 });
  assert.equal(options[0]?.requestKey, 'community-feed:latest');
});
```

- [ ] **Step 2: Run tests and verify the service is missing**

Run: `cd miniapp && npm test -- --test-name-pattern='community|route'`  
Expected: FAIL because `services/community.ts` and community routes do not exist.

- [ ] **Step 3: Implement exact DTO validation and service methods**

```ts
export type CommunityPostSummary = Readonly<{ id: string; authorName: string; authorAvatarUrl: string | null;
  bodyPreview: string; commentCount: number; likeCount: number; publishedAt: string; likedByMe: boolean }>;
export function listCommunityPosts(input: FeedInput): Promise<Result<CursorPage<CommunityPostSummary>>> {
  return request({ method: 'GET', path: buildFeedPath(input), requestKey: `community-feed:${input.sort}` });
}
```

Represent backend `BIGINT` identifiers as validated decimal strings in TypeScript. Reject extra/missing fields, unsafe numbers, invalid timestamps, oversized arrays, malformed cursors, and non-HTTPS avatar URLs.

- [ ] **Step 4: Implement idempotent writes and route builders**

Generate a UUID idempotency key once per user submission and retain it across network retry. Add `communityPostRoute(id)`, `communityComposeRoute()`, and `communityMeRoute()` using strict decimal-string validation.

- [ ] **Step 5: Run miniapp service tests**

Run: `cd miniapp && npm run check`  
Expected: PASS for strict DTOs, request cancellation, retry key reuse, invalid ID rejection, and existing 68 tests.

- [ ] **Step 6: Commit Task 6**

```bash
git add miniapp/miniprogram/services/community.ts miniapp/miniprogram/utils/routes.ts miniapp/tests/community.test.ts miniapp/tests/routes.test.ts
git commit -m "feat: add miniapp community client"
```

---

### Task 7: Miniapp feed, detail, publishing, reporting, and personal content

**Files:**
- Modify: `miniapp/miniprogram/pages/circle/index.ts`
- Modify: `miniapp/miniprogram/pages/circle/index.wxml`
- Modify: `miniapp/miniprogram/pages/circle/index.wxss`
- Create: `miniapp/miniprogram/pages/circle-detail/index.ts`
- Create: `miniapp/miniprogram/pages/circle-detail/index.json`
- Create: `miniapp/miniprogram/pages/circle-detail/index.wxml`
- Create: `miniapp/miniprogram/pages/circle-detail/index.wxss`
- Create: `miniapp/miniprogram/pages/circle-compose/index.ts`
- Create: `miniapp/miniprogram/pages/circle-compose/index.json`
- Create: `miniapp/miniprogram/pages/circle-compose/index.wxml`
- Create: `miniapp/miniprogram/pages/circle-compose/index.wxss`
- Create: `miniapp/miniprogram/pages/circle-me/index.ts`
- Create: `miniapp/miniprogram/pages/circle-me/index.json`
- Create: `miniapp/miniprogram/pages/circle-me/index.wxml`
- Create: `miniapp/miniprogram/pages/circle-me/index.wxss`
- Create: `miniapp/miniprogram/components/community-post-card/index.ts`
- Create: `miniapp/miniprogram/components/community-post-card/index.json`
- Create: `miniapp/miniprogram/components/community-post-card/index.wxml`
- Create: `miniapp/miniprogram/components/community-post-card/index.wxss`
- Modify: `miniapp/miniprogram/app.json`
- Test: `miniapp/tests/community-pages.test.ts`
- Test: `miniapp/tests/component-contracts.test.ts`

**Interfaces:**
- Consumes: Task 6 service and routes; shared `app-state`, tokens, and session store.
- Produces: complete text-only U圈 user flow with honest loading/empty/offline/error/restricted states.

- [ ] **Step 1: Write failing page contract tests**

```ts
test('registers all community pages while keeping U圈 as the third tab', () => {
  assert.ok(app.pages.includes('pages/circle-detail/index'));
  assert.ok(app.pages.includes('pages/circle-compose/index'));
  assert.equal(app.tabBar.list[2]?.pagePath, 'pages/circle/index');
});
test('feed ignores superseded requests and distinguishes failure from empty', () => {
  assert.match(circleSource, /REQUEST_SUPERSEDED/);
  assert.match(circleTemplate, /state === 'failed'/);
  assert.match(circleTemplate, /state === 'empty'/);
});
```

- [ ] **Step 2: Run page tests and verify they fail**

Run: `cd miniapp && npm test -- --test-name-pattern='community page|community card|registers all community'`  
Expected: FAIL because pages and component are absent.

- [ ] **Step 3: Build the feed and card**

Implement `latest`/`hot` tabs, pull-to-refresh, 20-item cursor loading, `REQUEST_SUPERSEDED` suppression, image fallback, login-aware likes, and one-request-at-a-time load-more. Use the existing brand tokens and 88rpx minimum interactive height.

- [ ] **Step 4: Build detail, compose, report, and personal pages**

```ts
async submit() {
  if (this.data.submitting) return;
  const key = this.data.idempotencyKey ?? createSubmissionKey();
  this.setData({ submitting: true, idempotencyKey: key });
  const result = await createCommunityPost({ body: this.data.body, idempotencyKey: key });
  this.setData({ submitting: false });
  if (result.ok) wx.redirectTo({ url: communityPostRoute(result.value.id) });
}
```

Keep the key after unavailable errors, replace it only when text changes after a completed attempt, and show explicit muted/banned expiry. Report reasons are fixed codes; no raw backend message is rendered.

- [ ] **Step 5: Run miniapp checks**

Run: `cd miniapp && npm run check`  
Expected: all tests, TypeScript, and ESLint pass; no placeholder construction copy remains on the U圈 page.

- [ ] **Step 6: Commit Task 7**

```bash
git add miniapp/miniprogram miniapp/tests
git commit -m "feat: build miniapp community experience"
```

---

### Task 8: Strict Adviser moderation client

**Files:**
- Create: `frontend/src/lib/adviser-community-api.ts`
- Create: `frontend/src/lib/adviser-community-api.test.ts`
- Modify: `frontend/src/lib/adviser-consultations-ui.ts`
- Test: `frontend/src/lib/adviser-consultations-ui.test.ts`

**Interfaces:**
- Consumes: Adviser moderation DTOs and CSRF pattern from `adviser-consultation-api.ts`.
- Produces: `loadCommunityModerationQueue`, `loadCommunityModerationDetail`, `submitCommunityModerationAction` with strict result unions.

- [ ] **Step 1: Write failing API parser and CSRF tests**

```ts
it('rejects moderation items containing contact fields or malformed versions', async () => {
  fetchMock.mockResolvedValue(response({ items: [{ ...validItem, email: 'hidden@example.com' }], nextCursor: null }));
  expect(await loadCommunityModerationQueue(origin, {})).toEqual({ status: 'error' });
});
it('sends current version and reason through the CSRF-protected adviser endpoint', async () => {
  await submitCommunityModerationAction(origin, 'POST', '42', { command: 'HIDE', reasonCode: 'HARASSMENT', version: 3 });
  expect(lastBody()).toEqual({ command: 'HIDE', reasonCode: 'HARASSMENT', version: 3, restrictionEndsAt: null });
});
```

- [ ] **Step 2: Run tests and verify the client is missing**

Run: `cd frontend && npm test -- adviser-community-api.test.ts`  
Expected: FAIL because the module does not exist.

- [ ] **Step 3: Implement exact parsers and request functions**

```ts
export type ModerationAction = Readonly<{ command: 'HIDE'|'RESTORE'|'REJECT_REPORT'|'MUTE'|'BAN';
  reasonCode: string; version: number; restrictionEndsAt?: string | null }>;
export type ModerationResult<T> = { status: 'ready'; value: T } |
  { status: 'unauthorized'|'forbidden'|'not-found'|'conflict'|'validation-error'|'rate-limited'|'unavailable'|'error' };
```

Reuse the consultation client's origin validation, five-second timeout, `credentials: 'include'`, CSRF token request, and exact-key parsing. IDs remain decimal strings.

- [ ] **Step 4: Add the Adviser navigation contract**

Add a single `U圈审核` item pointing to `/${locale}/adviser/community`; preserve existing consultation navigation and authorization behavior.

- [ ] **Step 5: Run focused frontend tests**

Run: `cd frontend && npm test -- adviser-community-api.test.ts adviser-consultations-ui.test.ts`  
Expected: PASS for strict DTO validation, CSRF, 409, timeout, forbidden, and navigation.

- [ ] **Step 6: Commit Task 8**

```bash
git add frontend/src/lib
git commit -m "feat: add adviser community moderation client"
```

---

### Task 9: Adviser moderation workspace

**Files:**
- Create: `frontend/src/app/[locale]/adviser/community/page.tsx`
- Create: `frontend/src/components/adviser-community-panel.tsx`
- Create: `frontend/src/lib/adviser-community-ui.ts`
- Create: `frontend/src/lib/adviser-community-ui.test.ts`
- Modify: `frontend/src/app/globals.css`

**Interfaces:**
- Consumes: Task 8 client; existing Adviser session guard and visual shell.
- Produces: accessible queue/detail moderation UI with conflict recovery and no sensitive URL/log leakage.

- [ ] **Step 1: Write failing view-model and source contract tests**

```ts
it('requires a reason before enabling a destructive action', () => {
  expect(canSubmitModeration({ command: 'HIDE', reasonCode: '', version: 2 })).toBe(false);
});
it('refreshes detail after a conflict without discarding the selected target', () => {
  expect(afterModerationFailure(state, { status: 'conflict' })).toMatchObject({ refreshDetail: true, selectedId: '42' });
});
```

- [ ] **Step 2: Run tests and verify the workspace is absent**

Run: `cd frontend && npm test -- adviser-community-ui.test.ts`  
Expected: FAIL because the UI module does not exist.

- [ ] **Step 3: Implement server entry and master-detail workspace**

Render queue filters `待审核 / 已处理 / 已隐藏`, target type, reason, and time. Detail shows content, minimum necessary context, report aggregate, and action history. Keep the selected target in component state, not the URL, so report notes and content never enter browser history.

- [ ] **Step 4: Implement guarded moderation actions**

Require a fixed reason code, current version, confirmation for hide/ban, and optional future expiry for mute. On `409`, reload the detail and announce via `aria-live` that another adviser completed an action. Disable controls while a request is in flight.

- [ ] **Step 5: Run frontend tests, lint, and build**

Run: `cd frontend && npm test && npm run lint && npm run build`  
Expected: PASS with no changes to consultation workflow tests.

- [ ] **Step 6: Commit Task 9**

```bash
git add frontend/src/app frontend/src/components/adviser-community-panel.tsx frontend/src/lib/adviser-community-ui.ts frontend/src/lib/adviser-community-ui.test.ts
git commit -m "feat: build adviser community moderation"
```

---

### Task 10: Metrics, capacity test, documentation, and release verification

**Files:**
- Create: `backend/src/main/java/com/yangdoujiao/website/community/CommunityMetrics.java`
- Create: `backend/src/test/k6/community-capacity.js`
- Modify: `backend/src/main/resources/application.yml`
- Modify: `miniapp/README.md`
- Modify: `docs/deployment.md`
- Test: full backend, frontend, and miniapp suites.

**Interfaces:**
- Consumes: all Tasks 1–9.
- Produces: metrics, reproducible 5,000-user/500-concurrent load profile, operator runbook, and release evidence.

- [ ] **Step 1: Write failing metrics tests**

```java
@Test
void recordsLatencyRateLimitsAndModerationBacklogWithoutContentTags() {
    metrics.recordPublished(Duration.ofMillis(30));
    assertThat(registry.get("community.publish").timer().count()).isEqualTo(1);
    assertThat(registry.getMeters()).allSatisfy(meter ->
        assertThat(meter.getId().getTags()).noneMatch(tag -> tag.getKey().contains("body")));
}
```

- [ ] **Step 2: Implement low-cardinality metrics**

Record feed/detail/publish/comment timers, result counters, rate-limit counters, idempotency hits, moderation backlog gauge, and Redis-unavailable counter. Tags are limited to endpoint class, sort, command, and stable outcome; never tag user ID, target ID, body, note, or address.

- [ ] **Step 3: Add the exact k6 capacity model**

```js
export const options = {
  scenarios: {
    reads: { executor: 'constant-arrival-rate', rate: 100, timeUnit: '1s', duration: '10m', preAllocatedVUs: 400, maxVUs: 500 },
    writes: { executor: 'constant-arrival-rate', rate: 20, timeUnit: '1s', duration: '10m', preAllocatedVUs: 100, maxVUs: 200 },
  },
  thresholds: { http_req_failed: ['rate<0.01'], http_req_duration: ['p(95)<500', 'p(99)<1000'] },
};
```

Seed 5,000 synthetic accounts in an isolated load-test database. Never run this script against production. Mix latest/hot/detail/comment/like/post operations and use unique idempotency keys.

- [ ] **Step 4: Document operations and feature rollout**

Document the community feature flag, rate-limit variables, Redis fail-closed behavior, moderation queue monitoring, cache invalidation, load-test command, rollback by disabling writes, and the prohibition on dropping tables or clearing business evidence.

- [ ] **Step 5: Run secret and placeholder scans**

Run:

```bash
rg -n "TO[D]O|TB[D]|session_key|APP_MINIAPP_WECHAT_APP_SECRET=.+|openid|reporterNote|postBody" \
  backend/src/main backend/src/test/k6 frontend/src miniapp/miniprogram .env.example compose.production.yaml
```

Expected: only approved property/type names and test assertions; no secrets, fixture personal data, unfinished markers, or content-bearing metric/log fields.

- [ ] **Step 6: Run the complete verification suite**

```bash
cd backend && ./mvnw test
cd ../frontend && npm ci && npm test && npm run lint && npm run build
cd ../miniapp && npm ci && npm run check
```

Expected: every command exits 0. Record exact counts and any intentionally skipped environment-dependent tests.

- [ ] **Step 7: Perform manual and capacity verification**

Import `miniapp/` into WeChat DevTools and verify latest/hot, detail, publish, comment, like, report, personal content, login expiry, weak network, safe area, and large font. Verify Adviser hide/restore/mute/ban/conflict flow. Run the k6 profile only against the isolated load-test environment and attach the output summary to the PR.

- [ ] **Step 8: Commit Task 10**

```bash
git add backend/src/main/java/com/yangdoujiao/website/community/CommunityMetrics.java backend/src/test/k6/community-capacity.js backend/src/main/resources/application.yml miniapp/README.md docs/deployment.md
git commit -m "docs: complete community release verification"
```

- [ ] **Step 9: Push and open the integration PR**

```bash
git push -u origin feat/miniapp-community-foundation
gh pr create --base feat/miniapp-v1 --head feat/miniapp-community-foundation \
  --title "feat: add scalable miniapp community" \
  --body $'## Scope\n- Real U圈 posts, comments, likes, reports, and moderation\n- 5,000-user capacity model\n\n## Verification\n- Backend, frontend, and miniapp suites recorded below\n- DevTools and k6 evidence attached when available\n\n## Operations\n- Feature flag defaults off\n- Writes fail closed when Redis is unavailable\n- Rollback disables writes without deleting evidence'
```

The PR description must include automated verification, manual DevTools status, capacity-test status, migration/rollback behavior, feature-flag default, and any production configuration still awaiting operator input.
