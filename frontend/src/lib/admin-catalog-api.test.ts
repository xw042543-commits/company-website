import assert from "node:assert/strict";
import test from "node:test";

import { adminWrite, adminRead, adminCatalogListPath, studyLevelZh } from "./admin-catalog-api.ts";

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


test("admin country filtering is sent to the server with every existing condition and page", async () => {
  const filters = {query: "计算机 science", status: "ARCHIVED", country: "MY", universityId: "8", categoryId: "4", studyLevelId: "5", page: 2};
  const path = adminCatalogListPath("programmes", filters);
  const url = new URL(path, "https://example.test");
  assert.equal(url.searchParams.get("country"), "MY");
  assert.equal(url.searchParams.get("q"), "计算机 science");
  assert.equal(url.searchParams.get("status"), "ARCHIVED");
  assert.equal(url.searchParams.get("universityId"), "8");
  assert.equal(url.searchParams.get("categoryId"), "4");
  assert.equal(url.searchParams.get("studyLevelId"), "5");
  assert.equal(url.searchParams.get("page"), "2");
  assert.equal(url.searchParams.get("size"), "20");
  const next = new URL(adminCatalogListPath("programmes", {...filters, page: 3}), "https://example.test");
  assert.equal(next.searchParams.get("country"), "MY");
  assert.equal(next.searchParams.get("universityId"), "8");
  assert.equal(next.searchParams.get("categoryId"), "4");
  assert.equal(next.searchParams.get("studyLevelId"), "5");
  assert.equal(next.searchParams.get("page"), "3");
  const original = globalThis.fetch;
  let requested = "";
  globalThis.fetch = (async input => {requested = String(input); return Response.json({items: [],total:0});}) as typeof fetch;
  try { await adminRead("https://example.test", path); assert.equal(requested, url.toString()); }
  finally { globalThis.fetch = original; }
});

test("all countries omits the restriction and university lists ignore programme-only filters", () => {
  const filters = {query: "", status: "", country: "", universityId: "8", categoryId: "4", studyLevelId: "5", page: 1};
  const all = new URL(adminCatalogListPath("universities", filters), "https://example.test");
  assert.equal(all.searchParams.has("country"), false);
  assert.equal(all.searchParams.has("universityId"), false);
  assert.equal(all.searchParams.has("categoryId"), false);
  assert.equal(all.searchParams.has("studyLevelId"), false);
  const country = new URL(adminCatalogListPath("universities", {...filters, country: "SG"}), "https://example.test");
  assert.equal(country.searchParams.get("country"), "SG");
  assert.equal(country.searchParams.get("page"), "1");
});


test("account identity filters and self protection preserve existing roles", async () => {
  const { accountIdentity, accountListPath, accountPermissions, canChangePermission } = await import("./admin-account-api.ts");
  const account = { id: 2, fullName: "用户", email: null, phone: null, role: "USER", status: "ACTIVE", advanced: false, createdAt: "", updatedAt: "" };
  assert.equal(accountIdentity(account), "普通用户");
  assert.equal(accountIdentity({ role: "ADMIN", advanced: true }), "高级管理员");
  assert.equal(accountIdentity({ role: "ADVISER", advanced: false }), "顾问");
  assert.equal(canChangePermission(account, 2, "ADVISER"), true);
  assert.equal(canChangePermission(account, 1, "ADMIN"), true);
  assert.equal(canChangePermission({ ...account, status: "PENDING_VERIFICATION" }, 1, "ADMIN"), false);
  assert.equal(canChangePermission({ ...account, advanced: true }, 1, "ADVISER"), true);
  assert.equal(canChangePermission({ ...account, status: "DELETED" }, 1, "ADVISER"), false);
  assert.equal(accountIdentity({ role: "ADMIN", advanced: false, permissions: ["ADMIN","ADVISER"] }), "普通管理员、顾问");
  assert.equal(accountIdentity({ role: "ADMIN", advanced: true, permissions: ["ADMIN","ADVISER"] }), "高级管理员、顾问");
  assert.deepEqual(accountPermissions({ role: "ADMIN", permissions: [] }), []);
  assert.equal(accountIdentity({ role: "ADMIN", advanced: false, permissions: ["ADVISER"] }), "顾问");
  const url = new URL(accountListPath("名字&邮箱", "DISABLED", "ADMIN", 3), "https://test.local");
  assert.equal(url.searchParams.get("q"), "名字&邮箱");
  assert.equal(url.searchParams.get("page"), "3");
  assert.equal(url.searchParams.get("status"), "DISABLED");
  assert.equal(url.searchParams.get("identity"), "ADMIN");
});
