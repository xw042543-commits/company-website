import assert from "node:assert/strict";
import test from "node:test";
import { loadAdviserConsultations, loadAdviserConsultation, updateAdviserConsultationStatus } from "./adviser-consultation-api.ts";

const base = "https://udajo.example";
const referenceCode = "142b5647-b444-4d4c-91ea-7241cc6b4cdd";
const timestamp = "2026-10-06T09:30:05.123456789Z";
const summary = { referenceCode, name: "Lim", contact: "+60123456789", intendedSchool: null,
  intendedCourse: "Law", qualification: "bachelor", status: "NEW", createdAt: timestamp,
  statusUpdatedAt: timestamp, version: 0 };
const page = { items: [summary], page: 0, size: 20, totalElements: 1, totalPages: 1,
  counts: { newCount: 1, inProgressCount: 0, completedCount: 0 } };
const consultation = { ...summary, notes: null, locale: "zh", privacyNoticeVersion: "2026-10-v1", statusUpdatedByUserId: null };
const update = { referenceCode, status: "IN_PROGRESS", statusUpdatedAt: timestamp, statusUpdatedByUserId: 7, version: 1 };
const csrf = { headerName: "X-XSRF-TOKEN", token: "valid-token" };

function queue(responses: Response[]) {
  const calls: { url: string; init?: RequestInit }[] = [];
  const request = (async (url, init) => {
    calls.push({ url: String(url), init });
    const response = responses.shift();
    if (!response) throw new Error("Unexpected request");
    return response;
  }) as typeof fetch;
  return { request, calls };
}

test("constructs bounded list filters safely and requests uncached credentialed data", async () => {
  const { request, calls } = queue([Response.json(page)]);
  assert.deepEqual(await loadAdviserConsultations(`${base}/`, { page: 0, size: 20, status: "NEW", query: "Lim &status=COMPLETED" }, request),
    { status: "ready", page });
  assert.equal(calls[0].url, "https://udajo.example/api/v1/adviser/consultations?page=0&size=20&status=NEW&query=Lim+%26status%3DCOMPLETED");
  assert.equal(calls[0].init?.cache, "no-store");
  assert.equal(calls[0].init?.credentials, "include");
  assert.equal(calls[0].init?.method, "GET");
  assert.ok(calls[0].init?.signal instanceof AbortSignal);
});

test("rejects duplicate filters and invalid inputs before requesting protected data", async () => {
  const { request, calls } = queue([]);
  for (const filters of [
    new URLSearchParams("status=NEW&status=COMPLETED"), new URLSearchParams("page=0&page=1"),
    { status: ["NEW", "COMPLETED"] }, { page: -1 }, { size: 101 }, { page: 1.5 },
    { page: "01" }, { status: "unknown" }, { query: "a".repeat(101) }, { page: 2147483647, size: 100 },
  ]) assert.deepEqual(await loadAdviserConsultations(base, filters, request), { status: "validation-error" });
  for (const invalidBase of [undefined, "javascript:alert(1)", "https://user:secret@example.com", `${base}?x=1`, `${base}#x`]) {
    assert.deepEqual(await loadAdviserConsultations(invalidBase, {}, request), { status: "error" });
  }
  assert.deepEqual(await loadAdviserConsultation(base, "../auth/session", request), { status: "validation-error" });
  assert.deepEqual(await updateAdviserConsultationStatus(base, referenceCode, "NEW", -1, request), { status: "validation-error" });
  assert.equal(calls.length, 0);
});

test("loads strict complete details without caching", async () => {
  const { request, calls } = queue([Response.json(consultation)]);
  assert.deepEqual(await loadAdviserConsultation(base, referenceCode, request), { status: "ready", consultation });
  assert.equal(calls[0].url, `https://udajo.example/api/v1/adviser/consultations/${referenceCode}`);
  assert.equal(calls[0].init?.cache, "no-store");
  assert.equal(calls[0].init?.credentials, "include");
});

test("obtains fresh csrf before each status patch and verifies the versioned acknowledgement", async () => {
  const { request, calls } = queue([Response.json(csrf), Response.json(update)]);
  assert.deepEqual(await updateAdviserConsultationStatus(base, referenceCode, "IN_PROGRESS", 0, request), { status: "ready", update });
  assert.equal(calls[0].url, "https://udajo.example/api/v1/auth/csrf");
  assert.equal(calls[1].url, `https://udajo.example/api/v1/adviser/consultations/${referenceCode}/status`);
  assert.equal(calls[1].init?.method, "PATCH");
  assert.equal(new Headers(calls[1].init?.headers).get("X-XSRF-TOKEN"), "valid-token");
  assert.equal(new Headers(calls[1].init?.headers).get("Content-Type"), "application/json");
  assert.equal(calls[1].init?.body, '{"status":"IN_PROGRESS","version":0}');
  for (const call of calls) {
    assert.equal(call.init?.cache, "no-store");
    assert.equal(call.init?.credentials, "include");
  }
});

test("keeps authorization, missing records, conflict and network failures distinct without error text", async () => {
  const failures = [[400, "validation-error"], [401, "unauthorized"], [403, "forbidden"], [404, "not-found"],
    [409, "conflict"], [429, "rate-limited"], [503, "unavailable"], [500, "error"]] as const;
  for (const [code, status] of failures) {
    const response = () => Response.json({ message: "private backend detail" }, { status: code });
    assert.deepEqual(await loadAdviserConsultations(base, {}, queue([response()]).request), { status });
    assert.deepEqual(await loadAdviserConsultation(base, referenceCode, queue([response()]).request), { status });
    assert.deepEqual(await updateAdviserConsultationStatus(base, referenceCode, "NEW", 0,
      queue([Response.json(csrf), response()]).request), { status });
    const failedCsrf = queue([response()]);
    assert.deepEqual(await updateAdviserConsultationStatus(base, referenceCode, "NEW", 0, failedCsrf.request), { status });
    assert.equal(failedCsrf.calls.length, 1);
  }
  const offline = (async () => { throw new TypeError("offline"); }) as typeof fetch;
  assert.deepEqual(await loadAdviserConsultations(base, {}, offline), { status: "unavailable" });
  assert.deepEqual(await loadAdviserConsultation(base, referenceCode, offline), { status: "unavailable" });
  assert.deepEqual(await updateAdviserConsultationStatus(base, referenceCode, "NEW", 0, offline), { status: "unavailable" });
});

test("rejects malformed pagination, counts, enums, UUIDs and timestamps", async () => {
  assert.deepEqual(await loadAdviserConsultations(base, { size: 1 }, queue([Response.json({ ...page,
    size: 1, totalElements: 2147483648, totalPages: 2147483648,
  })]).request), { status: "error" });
  for (const payload of [null, [], { ...page, page: -1 }, { ...page, size: 0 }, { ...page, size: 101 },
    { ...page, totalElements: 1.5 }, { ...page, totalPages: 2 }, { ...page, items: [] },
    { ...page, counts: { newCount: -1, inProgressCount: 0, completedCount: 0 } },
    { ...page, counts: { newCount: 1, inProgressCount: "0", completedCount: 0 } },
    { ...page, leaked: "unexpected" },
  ]) assert.deepEqual(await loadAdviserConsultations(base, {}, queue([Response.json(payload)]).request), { status: "error" });
  for (const replacement of [
    { status: "new" }, { qualification: "school" }, { referenceCode: "bad-id" }, { version: -1 },
    { version: Number.MAX_SAFE_INTEGER + 1 }, { createdAt: "yesterday" }, { createdAt: "2026-02-30T12:00:00Z" },
    { createdAt: "2026-01-01" }, { statusUpdatedAt: null }, { name: " " }, { contact: 99 },
    { intendedSchool: 42 }, { intendedCourse: [] }, { qualification: false }, { qualification: ["bachelor"] },
  ]) assert.deepEqual(await loadAdviserConsultations(base, {}, queue([Response.json({ ...page, items: [{ ...summary, ...replacement }] })]).request),
    { status: "error" }, JSON.stringify(replacement));
});

test("rejects incomplete or malformed detail optional fields and cross-record responses", async () => {
  for (const replacement of [{ locale: "fr" }, { notes: 5 }, { privacyNoticeVersion: "" },
    { statusUpdatedByUserId: 0 }, { statusUpdatedByUserId: "7" }, { notes: undefined },
    { referenceCode: "242b5647-b444-4d4c-91ea-7241cc6b4cdd" }, { extra: "private" }]) {
    assert.deepEqual(await loadAdviserConsultation(base, referenceCode,
      queue([Response.json({ ...consultation, ...replacement })]).request), { status: "error" });
  }
});

test("rejects malformed csrf and stale or mismatched successful update responses", async () => {
  for (const payload of [{ headerName: "Cookie", token: "token" }, { headerName: "X-XSRF-TOKEN", token: "" },
    { headerName: "X-XSRF-TOKEN", token: "a\nb" }, { ...csrf, extra: true }]) {
    const failed = queue([Response.json(payload)]);
    assert.deepEqual(await updateAdviserConsultationStatus(base, referenceCode, "IN_PROGRESS", 0, failed.request), { status: "error" });
    assert.equal(failed.calls.length, 1);
  }
  for (const replacement of [{ version: 0 }, { version: 2 }, { status: "NEW" }, { statusUpdatedByUserId: null },
    { statusUpdatedAt: "invalid" }, { referenceCode: "242b5647-b444-4d4c-91ea-7241cc6b4cdd" }, { extra: true }]) {
    assert.deepEqual(await updateAdviserConsultationStatus(base, referenceCode, "IN_PROGRESS", 0,
      queue([Response.json(csrf), Response.json({ ...update, ...replacement })]).request), { status: "error" });
  }
});

test("malformed JSON never becomes network failure or revives protected data from earlier requests", async () => {
  const requests = queue([Response.json(page), new Response("{"), new Response("denied", { status: 401 })]);
  assert.equal((await loadAdviserConsultations(base, {}, requests.request)).status, "ready");
  assert.deepEqual(await loadAdviserConsultations(base, {}, requests.request), { status: "error" });
  assert.deepEqual(await loadAdviserConsultations(base, {}, requests.request), { status: "unauthorized" });
  assert.equal(requests.calls.length, 3);
});
