import test from "node:test";
import assert from "node:assert/strict";
import { saveOwnProfile } from "./account-profile-api.ts";
import { parseAccount } from "./auth-api.ts";

const account = { id: 7, fullName: "新用户名", email: "s***@example.com", phone: null, emailVerified: true, phoneVerified: false, wechatLinked: false, wechatDisplayName: null, wechatAvatarUrl: null, wechatLastLoginAt: null, createdAt: "2026-10-01T00:00:00Z", updatedAt: "2026-10-16T00:00:00Z", avatarUrl: null };
test("self profile uses session identity, CSRF and an explicit field allowlist", async () => {
  const calls: { path: string; init?: RequestInit }[] = [];
  const original = globalThis.fetch;
  globalThis.fetch = (async (input, init) => {
    const path = new URL(String(input)).pathname; calls.push({ path, init });
    return Response.json(path.endsWith("csrf") ? { headerName: "X-CSRF-TOKEN", token: "csrf-test" } : account);
  }) as typeof fetch;
  try {
    const changes = { id: 99, role: "ADMIN", fullName: "新用户名", avatarAction: "KEEP", expectedUpdatedAt: account.updatedAt, contentBase64: "must-not-send" };
    assert.deepEqual(await saveOwnProfile("http://localhost:8080", changes), { status: "ready", value: account });
    assert.equal(calls[1].path, "/api/v1/account/profile");
    assert.equal(calls[1].init?.method, "PATCH");
    assert.equal(calls[1].init?.credentials, "include");
    assert.equal(new Headers(calls[1].init?.headers).get("X-CSRF-TOKEN"), "csrf-test");
    assert.deepEqual(JSON.parse(calls[1].init?.body as string), { fullName: "新用户名", avatarAction: "KEEP", expectedUpdatedAt: account.updatedAt });
  } finally { globalThis.fetch = original; }
});
test("profile parsing validates version while retaining old API compatibility", () => {
  assert.deepEqual(parseAccount(account), account);
  assert.equal(parseAccount({ ...account, updatedAt: "bad" }), null);
  assert.deepEqual(parseAccount({ ...account, avatarUrl: "https://evil.test/image.png" }), account);
  assert.equal(parseAccount({ ...account, role: "ADMIN" }), null);
  const { updatedAt, ...legacy } = account; void updatedAt;
  assert.deepEqual(parseAccount(legacy), legacy);
});
test("self profile surfaces conflict, unauthorized and ambiguous network failures", async () => {
  const original = globalThis.fetch;
  try {
    for (const [code, expected] of [[409, "conflict"], [401, "unauthorized"], [400, "validation"]] as const) {
      globalThis.fetch = (async (input) => String(input).endsWith("csrf") ? Response.json({ headerName: "X-CSRF-TOKEN", token: "test" }) : Response.json({ message: "资料已更新" }, { status: code })) as typeof fetch;
      assert.equal((await saveOwnProfile("http://localhost:8080", { fullName: "姓名", avatarAction: "REMOVE", expectedUpdatedAt: account.updatedAt })).status, expected);
    }
    globalThis.fetch = (async () => { throw new Error("offline"); }) as typeof fetch;
    assert.equal((await saveOwnProfile("http://localhost:8080", { fullName: "姓名", avatarAction: "KEEP" })).status, "unavailable");
  } finally { globalThis.fetch = original; }
});
