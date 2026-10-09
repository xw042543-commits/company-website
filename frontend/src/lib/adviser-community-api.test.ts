import assert from "node:assert/strict";
import test from "node:test";
import { loadCommunityModerationQueue, loadCommunityModerationDetail, submitCommunityModerationAction } from "./adviser-community-api.ts";

const origin = "https://udajo.example";
const time = "2026-10-08T12:00:00.123456789Z";
const item = { targetType: "POST", targetId: "9223372036854775807", status: "PENDING_REVIEW",
  bodyPreview: "Review this post", version: 3, openReportCount: 1, createdAt: time };
const detail = { targetType: "POST", targetId: "42", status: "PENDING_REVIEW", body: "Review this post",
  postId: null, parentCommentId: null, version: 3, openReportCount: 1,
  reports: [{ reasonCode: "HARASSMENT", status: "OPEN", count: 1 }],
  actions: [{ id: "10", command: "RESTORE", reasonCode: "REVIEW_APPROVED", previousStatus: "HIDDEN", nextStatus: "PUBLISHED", createdAt: time }],
  actionsNextCursor: null };
const csrf = { headerName: "X-XSRF-TOKEN", token: "safe-token" };
const action = { command: "HIDE", reasonCode: "HARASSMENT", version: 3 } as const;
function transport(values: unknown[], status = 200) {
  const calls: { url: string; init?: RequestInit }[] = [];
  const request: typeof fetch = async (url, init) => {
    calls.push({ url: String(url), init });
    assert.ok(values.length, "unexpected request");
    return Response.json(values.shift(), { status });
  };
  return { request, calls };
}

test("queue retains decimal IDs and serializes only validated moderation filters", async () => {
  const page = { items: [item], nextCursor: "opaque+/=" };
  const { request, calls } = transport([page]);
  assert.deepEqual(await loadCommunityModerationQueue(`${origin}/ignored`, { status: "PENDING", size: 20,
    targetType: "POST", reasonCode: "HARASSMENT", from: time, to: time, cursor: "opaque+/=" }, request), { status: "ready", value: page });
  const url = new URL(calls[0].url);
  assert.equal(url.origin + url.pathname, `${origin}/api/v1/adviser/community/moderation`);
  assert.deepEqual(Object.fromEntries(url.searchParams), { status: "PENDING", size: "20", targetType: "POST",
    reasonCode: "HARASSMENT", from: time, to: time, cursor: "opaque+/=" });
  assert.equal(calls[0].init?.credentials, "include");
  assert.equal(calls[0].init?.cache, "no-store");
});

test("queue accepts the unchanged whitespace-only preview of a valid full body", async () => {
  // PostgreSQL substring(body from 1 for 160) preserves the body's leading spaces.
  const body = " ".repeat(160) + "review me";
  const previewItem = { ...item, bodyPreview: body.slice(0, 160) };
  const page = { items: [previewItem], nextCursor: null };
  assert.deepEqual(await loadCommunityModerationQueue(origin, {}, transport([page]).request), { status: "ready", value: page });
  const fullDetail = { ...detail, body };
  assert.deepEqual(await loadCommunityModerationDetail(origin, "POST", "42", {}, transport([fullDetail]).request), { status: "ready", value: fullDetail });
  const blankDetail = { ...detail, body: " ".repeat(160) };
  assert.deepEqual(await loadCommunityModerationDetail(origin, "POST", "42", {}, transport([blankDetail]).request), { status: "error" });
});

test("queue preview maximum counts Unicode code points and still rejects nonstrings and overflow", async () => {
  const page = { items: [{ ...item, bodyPreview: "😀".repeat(160) }], nextCursor: null };
  assert.deepEqual(await loadCommunityModerationQueue(origin, {}, transport([page]).request), { status: "ready", value: page });
  for (const bodyPreview of ["😀".repeat(161), null, 160]) {
    assert.deepEqual(await loadCommunityModerationQueue(origin, {}, transport([{ ...page, items: [{ ...item, bodyPreview }] }]).request), { status: "error" });
  }
});

test("queue rejects contact/private fields, missing keys, bad enums, IDs, timestamps and versions", async () => {
  for (const bad of [{ ...item, email: "hidden@example.com" }, { ...item, contact: "private" },
    { ...item, authorId: "5" }, { ...item, version: "3" }, { ...item, version: -1 }, { ...item, version: 0.5 },
    { ...item, version: Number.MAX_SAFE_INTEGER + 1 }, { ...item, targetId: 42 }, { ...item, targetId: "01" },
    { ...item, targetId: "9223372036854775808" }, { ...item, status: "NEW" }, { ...item, targetType: "USER" },
    { ...item, createdAt: "2026-02-30T00:00:00Z" }, { ...item, openReportCount: -1 },
    { ...item, bodyPreview: "x".repeat(161) }, { ...item, createdAt: undefined }]) {
    assert.deepEqual(await loadCommunityModerationQueue(origin, {}, transport([{ items: [bad], nextCursor: null }]).request), { status: "error" });
  }
  for (const bad of [{ items: [], nextCursor: null, privateNotes: "secret" }, { items: [] }, { items: [], nextCursor: 4 }]) {
    assert.deepEqual(await loadCommunityModerationQueue(origin, {}, transport([bad]).request), { status: "error" });
  }
});

test("invalid origins, IDs and filters never send requests", async () => {
  const { request, calls } = transport([]);
  for (const base of [undefined, "file:///tmp", "https://u:p@example.com", `${origin}?a=1`, `${origin}#fragment`]) {
    assert.deepEqual(await loadCommunityModerationQueue(base, {}, request), { status: "error" });
  }
  for (const filters of [{ status: "NEW" }, { status: null }, { size: 51 }, { size: 0 }, { size: "01" }, { reasonCode: "POLICY_VIOLATION" },
    { targetType: "USER" }, { from: "yesterday" }, { from: "2026-10-09T00:00:00Z", to: time },
    { cursor: "" }, { contact: "secret" }, new URLSearchParams("status=PENDING&status=HIDDEN")]) {
    assert.deepEqual(await loadCommunityModerationQueue(origin, filters as never, request), { status: "validation-error" });
  }
  for (const id of ["0", "01", "-1", "42/../1", "9223372036854775808", 42]) {
    assert.deepEqual(await loadCommunityModerationDetail(origin, "POST", id as string, {}, request), { status: "validation-error" });
  }
  assert.equal(calls.length, 0);
});

test("detail validates exact nested DTOs and target identity and passes history cursor", async () => {
  const { request, calls } = transport([detail]);
  assert.deepEqual(await loadCommunityModerationDetail(origin, "POST", "42", { actionsCursor: "opaque+/=" }, request), { status: "ready", value: detail });
  assert.equal(calls[0].url, `${origin}/api/v1/adviser/community/moderation/POST/42?actionsCursor=opaque%2B%2F%3D`);
  for (const bad of [{ ...detail, targetId: "43" }, { ...detail, targetType: "COMMENT" }, { ...detail, postId: "1" },
    { ...detail, email: "secret" }, { ...detail, reports: [{ ...detail.reports[0], reporterId: "1" }] },
    { ...detail, reports: [{ ...detail.reports[0], reasonCode: "REPORT_UNFOUNDED" }] },
    { ...detail, actions: [{ ...detail.actions[0], actorId: "1" }] },
    { ...detail, actions: [{ ...detail.actions[0], command: "UNKNOWN" }] },
    { ...detail, actions: [{ ...detail.actions[0], reasonCode: "OTHER" }] }, { ...detail, actionsNextCursor: 1 }]) {
    assert.deepEqual(await loadCommunityModerationDetail(origin, "POST", "42", {}, transport([bad]).request), { status: "error" });
  }
  const comment = { ...detail, targetType: "COMMENT", postId: "1", parentCommentId: "2", reports: [], openReportCount: 0, actions: [] };
  assert.deepEqual(await loadCommunityModerationDetail(origin, "COMMENT", "42", {}, transport([comment]).request), { status: "ready", value: comment });
});

test("action sends current version, reason and null restriction via credentialed CSRF protected POST", async () => {
  const updated = { ...detail, status: "HIDDEN", version: 4, reports: [], openReportCount: 0 };
  const { request, calls } = transport([csrf, updated]);
  assert.deepEqual(await submitCommunityModerationAction(origin, "POST", "42", action, request), { status: "ready", value: updated });
  assert.equal(calls[0].url, `${origin}/api/v1/auth/csrf`);
  assert.equal(calls[1].url, `${origin}/api/v1/adviser/community/moderation/POST/42/actions`);
  assert.equal(calls[1].init?.method, "POST");
  assert.equal(calls[1].init?.credentials, "include");
  assert.deepEqual(calls[1].init?.headers, { "Content-Type": "application/json", "X-XSRF-TOKEN": "safe-token" });
  assert.deepEqual(JSON.parse(calls[1].init?.body as string), { ...action, restrictionEndsAt: null });
});

test("invalid actions are rejected before acquiring CSRF", async () => {
  const { request, calls } = transport([]);
  for (const bad of [{ ...action, version: -1 }, { ...action, version: "3" }, { ...action, version: Number.MAX_SAFE_INTEGER },
    { ...action, command: "DELETE" }, { ...action, reasonCode: "OTHER" }, { ...action, reasonCode: "REPORT_UNFOUNDED" },
    { ...action, command: "RESTORE" }, { ...action, command: "MUTE" }, { ...action, restrictionEndsAt: time },
    { ...action, email: "secret" }]) {
    assert.deepEqual(await submitCommunityModerationAction(origin, "POST", "42", bad as never, request), { status: "validation-error" });
  }
  assert.equal(calls.length, 0);
});

test("all backend commands and reason pairs preserve the exact action payload", async () => {
  for (const [command, reasonCode, restrictionEndsAt] of [
    ["RESTORE", "APPEAL_ACCEPTED", null], ["RESTORE", "REVIEW_APPROVED", null],
    ["REJECT_REPORT", "REPORT_UNFOUNDED", null], ["BAN", "POLICY_VIOLATION", null],
    ["MUTE", "SCAM", "2026-10-10T00:00:00Z"],
  ] as const) {
    const submitted = { command, reasonCode, version: 3, restrictionEndsAt };
    const updated = { ...detail, version: 4 };
    const { request, calls } = transport([csrf, updated]);
    assert.deepEqual(await submitCommunityModerationAction(origin, "POST", "42", submitted, request), { status: "ready", value: updated });
    assert.deepEqual(JSON.parse(calls[1].init?.body as string), submitted);
  }
});

test("missing nested keys, private history fields and malformed detail options are rejected", async () => {
  for (const bad of [{ ...detail, actions: [{ ...detail.actions[0], reasonCode: undefined }] },
    { ...detail, reports: [{ ...detail.reports[0], count: "1" }] },
    { ...detail, reports: [{ ...detail.reports[0], count: -1 }] },
    { ...detail, actions: [{ ...detail.actions[0], id: 10 }] },
    { ...detail, actions: [{ ...detail.actions[0], previousStatus: "NEW" }] },
    { ...detail, actions: [{ ...detail.actions[0], createdAt: "yesterday" }] },
    { ...detail, parentCommentId: "2" }, { ...detail, reports: [{ ...detail.reports[0], privateNotes: "hidden" }] }]) {
    assert.deepEqual(await loadCommunityModerationDetail(origin, "POST", "42", {}, transport([bad]).request), { status: "error" });
  }
  const { request, calls } = transport([]);
  for (const filters of [{ actionsCursor: "" }, { actionsCursor: 1 }, { email: "secret" },
    new URLSearchParams("actionsCursor=a&actionsCursor=b")]) {
    assert.deepEqual(await loadCommunityModerationDetail(origin, "POST", "42", filters as never, request), { status: "validation-error" });
  }
  assert.equal(calls.length, 0);
});

test("CSRF rejects private fields and unsafe token headers without sending the action", async () => {
  for (const bad of [{ ...csrf, contact: "secret" }, { ...csrf, headerName: "Authorization" }, { ...csrf, token: "a\nb" }, { ...csrf, token: "" }]) {
    const { request, calls } = transport([bad]);
    assert.deepEqual(await submitCommunityModerationAction(origin, "POST", "42", action, request), { status: "error" });
    assert.equal(calls.length, 1);
  }
});

test("every protected request maps fixed HTTP failures without exposing raw backend errors", async () => {
  for (const [code, status] of [[400, "validation-error"], [401, "unauthorized"], [403, "forbidden"], [404, "not-found"],
    [409, "conflict"], [429, "rate-limited"], [502, "unavailable"], [503, "unavailable"], [504, "unavailable"], [500, "error"]]) {
    const bad = () => transport([{ message: "secret backend text" }], code as number).request;
    assert.deepEqual(await loadCommunityModerationQueue(origin, {}, bad()), { status });
    assert.deepEqual(await loadCommunityModerationDetail(origin, "POST", "42", {}, bad()), { status });
    assert.deepEqual(await submitCommunityModerationAction(origin, "POST", "42", action, bad()), { status });
    let call = 0;
    const request: typeof fetch = async () => ++call === 1 ? Response.json(csrf) : Response.json({ message: "secret" }, { status: code as number });
    assert.deepEqual(await submitCommunityModerationAction(origin, "POST", "42", action, request), { status });
  }
});

test("malformed and mismatched write responses never become ready", async () => {
  for (const bad of [{ ...detail, version: 3 }, { ...detail, version: 4, targetId: "43" }, { ...detail, version: 4, contact: "secret" }]) {
    assert.deepEqual(await submitCommunityModerationAction(origin, "POST", "42", action, transport([csrf, bad]).request), { status: "error" });
  }
  const malformed: typeof fetch = async () => new Response("not json");
  assert.deepEqual(await loadCommunityModerationQueue(origin, {}, malformed), { status: "error" });
});

test("transport failures and five-second timeouts return unavailable for reads, CSRF and actions", async (t) => {
  const milliseconds: number[] = [];
  t.mock.method(AbortSignal, "timeout", (ms: number) => { milliseconds.push(ms); return AbortSignal.abort(); });
  const timeout: typeof fetch = async (_url, init) => { init?.signal?.throwIfAborted(); throw new Error("offline"); };
  assert.deepEqual(await loadCommunityModerationQueue(origin, {}, timeout), { status: "unavailable" });
  assert.deepEqual(await loadCommunityModerationDetail(origin, "POST", "42", {}, timeout), { status: "unavailable" });
  assert.deepEqual(await submitCommunityModerationAction(origin, "POST", "42", action, timeout), { status: "unavailable" });
  let calls = 0;
  const actionTimeout: typeof fetch = async (url, init) => ++calls === 1 ? Response.json(csrf) : timeout(url, init);
  assert.deepEqual(await submitCommunityModerationAction(origin, "POST", "42", action, actionTimeout), { status: "unavailable" });
  assert.deepEqual(milliseconds, [5000, 5000, 5000, 5000, 5000]);
});
