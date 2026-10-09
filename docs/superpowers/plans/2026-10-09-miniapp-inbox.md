# Miniapp unified inbox implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement task-by-task.

**Goal:** Bottom navigation 首页 → U圈 → 消息 → 我的, with a real per-user inbox for community, system and application progress messages.
**Architecture:** PostgreSQL durable notifications in the existing monolith. Authenticated recipient-scoped APIs, transactional community producers. Native miniapp consumes only server-owned notifications and persists read state on server.
**Tech Stack:** Java 21/Spring Boot/PostgreSQL; WeChat native TypeScript/WXML/WXSS.
**Spec:** User-approved conversation: unified chronological received messages, categories U圈/系统/申请, unread indicators and contextual navigation. No invented messages.

## Global Constraints

- Preserve all dirty user changes and local project.config.json; do not reset the original checkout, deploy or run migrations on production. The user subsequently authorized recovery into a fresh local clone and submission through a feature branch/PR.
- Existing linked worktree is miniapp-foundation. Git objects/dependencies recently had dataless cloud placeholders; report verification failures honestly and never delete them.
- No Kafka, external message service or new auth mechanism.
- All inbox reads and read mutations must scope to authenticated recipient, never trust a client user ID.
- The original baseline had no application-order subsystem; the recovered branch now includes main's consultation-backed order pages from PR #81. SYSTEM/APPLICATION storage and server-only publishing contracts are supported, but their event producers remain unconnected. Do not invent application events, deadlines or deep links.
- With no messages show 暂无消息. Missing endpoint/network/auth errors must not be shown as empty.

## Task 1: Durable inbox API and community producers

Files: create backend notification package, V19 migration, relevant tests; modify community write/reaction/moderation only as necessary for published comment/reply/like events. Follow Controller → Service → Repository.

Interfaces:
- GET /api/v1/miniapp/me/messages?category=ALL|COMMUNITY|SYSTEM|APPLICATION&page=1&size=20 → {items:[{id:string,category,title,body,createdAt:ISO,readAt:ISO|null,targetType:COMMUNITY_POST|NONE,targetId:string|null}],page,pageSize,totalItems,totalPages,unreadCount:number}.
- GET /api/v1/miniapp/me/messages/unread-count → {unreadCount:number}.
- PUT /api/v1/miniapp/me/messages/{id}/read → 204; recipient scoped and idempotent, foreign/not-found →404.
- No public publish endpoint. Internal publication methods validate and deduplicate event identity per recipient. Persist SYSTEM/APPLICATION and plain-text body; NONE opens message locally rather than fake route.

- [ ] Write failing tests: foreign recipients cannot read/mark messages; authentication required; category/page validation; latest-first order; count excludes read; duplicate publication produces one row; self-likes/comments no notification; pending-review content cannot leak into messages; repeated idempotent community request no duplicate.
- [ ] Implement notification entity/repository/service/controller with bounded pagination (size max48), bigint wire IDs strings, immutable event uniqueness and indexes (recipient,created_at,id), (recipient,read_at).
- [ ] Integrate actual published community comment/reply/like events transactionally. Use generic message body instead of private/moderated content excerpts; notify direct parent author for replies, post author for top-level comments, target author for likes. Suppress self. Include approvals if moderation publishes a pending comment; do not notify rejected content. Re-likes do not spam duplicate events.
- [ ] Run focused backend tests and compilation using existing tooling; document exact environment limitations. Do not alter auth/visibility rules.
- [ ] Self-review and report changed file list and API contract to docs/superpowers/plans/2026-10-09-inbox-backend-report.md. No commit while Git remains unhealthy.

## Task 2: Native inbox and navigation

Files: app.json, pages/messages/*, services/messages.ts, message store if required, navigation call sites, app-config and inbox tests, icon generator/assets.
- [ ] Write failing tests for tab order, university non-tab navigation, category parsing, unauthorized/error states, own latest request wins, read action and count refresh, safe target routing.
- [ ] Change tabs to 首页/U圈/消息/我的. Keep university page registered; replace switchTab university calls with navigateTo. Distinct community icon and message bubble icon.
- [ ] Implement one chronological inbox, ALL/COMMUNITY/SYSTEM/APPLICATION filter chips with labels 全部/U圈/系统/申请, loading/error/empty states, load more and mark-read on opening. Render all content as plain text. Use existing sessionStore authentication and HTTP contracts.
- [ ] Clicking COMMUNITY_POST navigates through communityPostRoute; NONE opens full title/body within inbox (not a fake application route). Update red-dot at tab index2 from authoritative count on show and after read; no fake count or aggressive polling.
- [ ] Verify focused tests, npm run check where dependencies work, native preview. Preserve existing green/white visual system, compact typography and no colorful placeholder cards.

## Review
- [ ] Independent review of changed implementation for ownership, deduplication, native compatibility and regression risks.
- [ ] Report implemented features separately from unconnected system/application producers and undeployed migration.

## Recovery verification — 2026-10-09

- Recovered source into a fresh clone outside iCloud; original checkout and local credentials were not modified or copied. Rebased onto main `9b24f74`, preserving the logo, order pages and media work.
- `miniapp: npm run check`: 202 tests passed; TypeScript and ESLint passed.
- `backend: ./mvnw '-Dtest=InboxIntegrationTest,Community*Test,Miniapp*Test' test`: 222 tests passed, no failures/errors/skips. V19 applied only in disposable test containers.
- Corrected the inbox test to use actual miniapp bearer authentication and isolated its Redis rate-limit address from other fixtures; production authentication and limits remain unchanged.
- Independent final review found no blocking defects. Native-device rendering and production deployment remain unverified; SYSTEM/APPLICATION event producers remain unconnected.
