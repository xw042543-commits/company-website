# Private image upload Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a disabled-by-default private upload endpoint with durable ownership and quotas; do not publish attachments yet.

**Architecture:** Authenticated multipart controller → upload service → JDBC metadata repository and private file store. Account lock protects user limits; a singleton database row serializes aggregate storage accounting. File rollback cleanup occurs after transaction failure. No public read route.

**Tech Stack:** Java 21, Spring Boot, PostgreSQL/Flyway, ImageIO, JUnit/Testcontainers.

**Spec:** `docs/superpowers/specs/2026-10-12-community-image-posts-design.md`

## Global Constraints

- Up to9 pictures per eventual post; uploads independently private and initially PENDING.
- 5MiB input,20million pixels; same codec as prior phase;90 uploads/user/UTC day.
- Reserve2GiB disk space and configurable aggregate capacity; no secrets or production changes.
- Existing text publication unchanged; metadata ownership may never come from request body.
- Keep local project.config.json untouched.

## Task: durable private upload

Files: V25 migration; `community/media/CommunityImageRepository.java`; `community/CommunityImageUploadService.java`; `community/CommunityImageUploadController.java`; `community/CommunityImageUploadConfiguration.java`; `community/CommunityImageUploadIntegrationTest.java`.

Interfaces: service `upload(long actorId, byte[] content)` returns `Upload(String id,int width,int height,String status)`; repository locks quota, counts since UTC midnight, stores immutable owner/key/dimensions/bytes with status PENDING. Endpoint `POST /api/v1/community/images`, multipart `file`, returns201. Feature flag `app.community.images.enabled` defaultfalse and explicit root/max-bytes required when enabled.

- [ ] Write real PostgreSQL tests: `Upload result=service.upload(owner,png); assertEquals("PENDING",result.status());` and assert database owner, JPEG file contents, absence of public URL. Use TempDir, real codec/storage and TransactionTemplate.
- [ ] Run `./mvnw -Djava.awt.headless=true -Dtest=CommunityImageUploadIntegrationTest test` and confirm missing implementation fails.
- [ ] Add V25 images metadata table plus singleton byte counter; foreign key owner; unique storage key; nonnegative counters/checks. Repository SQL uses bound parameters, no user paths. Lock account then singleton counter in every upload transaction.
- [ ] Implement upload: enabled check, bounded codec, locked ACTIVE account, restriction guard,90/day count, quota/disk headroom check, save files, register rollback cleanup, insert metadata and increment bytes. Use `if(bytes > limit-used) throw quotaError;` to avoid overflow. No publication or guessed audit response.
- [ ] Add controller with bounded stream read (`readNBytes(5*1024*1024+1)`), actor from principal; conditional registration and storage bean require explicit flag. Max multipart parser size must match and only change global parser ceiling after auditing other upload routes.
- [ ] Add daily-limit, aggregate-quota, disabled-community, restricted/deleted-account and rollback tests. Run focused tests then full backend tests with Docker access. Confirm existing text tests unchanged.
- [ ] Record limits and unfinished areas in runbook. Local commit only, no push or deployment.

## Remaining integration (not delivered by this plan)

Provider submit and durable callback inbox, encrypted callback verification, actor recent-login handling, timed signed download URL, atomic attachment binding to posts, text/image combined state and manual overrides, orphan cleanup/reconciliation, proxy upload limit, deployment backup, miniapp uploader/drafts/editor and visibility-aware reads. Feature remains disabled until these are implemented and verified.

## Execution checkpoint

- [x] Added V25 metadata/capacity tables, repository, upload service and conditional endpoint/configuration.
- [x] Observed missing-service and missing-controller compilation failures before implementation.
- [x] Nine real-database tests passed: ownership/PENDING, controller201, unauthenticated/oversize rejection, capacity, inactive account, daily limit, rollback, reserved disk space, disabled community.
- [x] Audited existing multipart usage: no other MultipartFile handler found; parser ceiling only registered with upload feature enabled.
- [x] Full backend regression `./mvnw -q -Djava.awt.headless=true test` exited0. First run exposed two schema-count assertions fixed to include V25 and its new bigint owner field; assertions were retained.
- [ ] Additional security coverage remains: actual HTTP/filter wiring, muted account, concurrent quota contention and crash reconciliation; no production enablement claim.
