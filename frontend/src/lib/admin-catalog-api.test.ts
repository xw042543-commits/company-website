import assert from "node:assert/strict";
import test from "node:test";

import { adminWrite, studyLevelZh } from "./admin-catalog-api.ts";

test("normalizes administrator study level labels to the four Chinese names", () => {
  assert.equal(studyLevelZh({ id: 1, code: "DIPLOMA", nameZh: "大专/文凭", nameEn: "Diploma" }), "大专");
  assert.equal(studyLevelZh({ id: 2, code: "BACHELOR", nameZh: null, nameEn: "Bachelor's" }), "本科");
  assert.equal(studyLevelZh({ id: 3, code: "MASTER", nameZh: null, nameEn: "Master" }), "硕士");
  assert.equal(studyLevelZh({ id: 4, code: "PHD", nameZh: null, nameEn: "Doctoral Degree" }), "博士");
});

test("admin writes acquire csrf and send a credentialed JSON request", async () => {
  const original = globalThis.fetch;
  const calls: Array<{ input: string; init?: RequestInit }> = [];
  const responses = [
    Response.json({ headerName: "X-XSRF-TOKEN", token: "token" }),
    Response.json({ id: 8, status: "ARCHIVED" }),
  ];
  globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    calls.push({ input: String(input), init });
    return responses.shift()!;
  }) as typeof fetch;
  try {
    const result = await adminWrite<{ id: number }>("http://localhost:3000", "/api/v1/admin/catalog/universities/8/status", "PATCH", { enabled: false });
    assert.equal(result.status, "ready");
    assert.equal(calls[0].input, "http://localhost:3000/api/v1/auth/csrf");
    assert.equal(calls[1].init?.method, "PATCH");
    assert.equal(calls[1].init?.credentials, "include");
    assert.equal(new Headers(calls[1].init?.headers).get("X-XSRF-TOKEN"), "token");
    assert.equal(calls[1].init?.body, JSON.stringify({ enabled: false }));
  } finally { globalThis.fetch = original; }
});
