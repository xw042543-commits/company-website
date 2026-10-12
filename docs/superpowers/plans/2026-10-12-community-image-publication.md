# Community image publication Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete attachment binding, durable image review, protected reads and miniapp publishing without changing installed text readers.
**Architecture:** Append image IDs to post requests while retaining historical text fingerprints. Image bindings and text-review result are separate durable state; asynchronous provider outcomes only publish unchanged pending posts after all images pass. Separate batched media endpoint preserves existing exact-key response readers.
**Tech Stack:** Java21/PostgreSQL/Spring, WeChat encrypted event callback, TypeScript native miniapp.
**Spec:** `docs/superpowers/specs/2026-10-12-community-image-posts-design.md`

## Constraints

Maximum9 distinct owned/unbound IDs; private until approved; no video/comment images. Preserve60/2000 title/body limits. Default production flag remains off. No push/deploy/secret changes. Token and EncodingAESKey never logged. Preserve user project.config.json.

## Tasks

- [ ] Binding: V26 adds post_id/position and post review gate. `CommunityImageAttachments.parse(JsonNode)` validates IDs; `bind(actor,post,ids,textPassed)` locks capacity and images, checks ownership/age/unbound status, persists order and gate. Post creation includes ordered IDs in fingerprint only when nonempty. Tests create a post with IDs and assert PENDING_REVIEW plus ownership rejection and replay stability before implementation.
- [ ] Read: `forPosts(ids,viewer)` batches metadata with current post visibility; `read(id,thumbnail,viewer)` checks current visibility/owner/adviser before storage access and uses no-store. Keep original post DTOs unchanged; response map maps decimal post IDs to ordered image metadata. Tests hide post and assert anonymous read becomes404; private owner/adviser still allowed unless deleted.
- [ ] Review: persist job attempt/lease/trace and callback inbox before effects. Verified signed callbacks are deduplicated; only result errcode0/pass sets PASS; review/risky/unavailable remain manual. Reconcile only PENDING_REVIEW posts with version0 and stored textPassed; never resurrect manual/hidden/deleted state. Test callback-before-ack, duplicate and stale events.
- [ ] Provider security: validate message signature, AES256-CBC/PKCS7 length32 padding and innerAppID against official message-push fixture; GET signature echo. Signed one-hour provider download URL with purpose/image/expiry HMAC; validate expiry and never arbitrary source URLs. Tests signature/body/appID tampering, expired URLs, malformed padding. Fetch official Java sample before implementing cryptography.
- [ ] Worker: claim persisted bounded jobs; submit bytes with Content-Length; network calls outside transactions; max3 attempts with backoff,35-minute callback timeout→manual. Cleanup expired unbound images with same capacity lock as bind; never delete bound media. Restart recovers expired leases. Tests claims/retries and bind-vs-cleanup.
- [ ] Client: service for uploadFile with bearer refresh and account-generation guards; at most2 uploads,9 selection limit, compression, previews, retries, persistent user-scoped files. Submitted imageIds enter idempotency fingerprint; pending uploads block submit. Build clear title/body editing surface and image area without decorative panels. Tests cancellation, remove-before-upload-completion, logout, retries, draft reload.
- [ ] Presentation: one reusable image gallery for feed/details/my-posts; authenticated download for private image previews. Batch metadata per page, not per post. Add protected image previews to adviser detail without changing existing moderation commands.
- [ ] Deployment: named volume, disabled-by-default image variables, callback routing, multipart limits and preflight; database+volume backup runbook. Run backend full suite, miniapp check, frontend lint/build and deployment tests; inspect UI. Record required real callback/phone verification, never claim live success from mocks.

## Verification commands

```sh
cd backend && ./mvnw -Djava.awt.headless=true test
npm --prefix miniapp run check
npm --prefix frontend run lint
npm --prefix frontend run build
node --test scripts/deployment-*.test.mjs
```
