import assert from "node:assert/strict";
import test from "node:test";
import { loadProxySessionAccess, proxyRedirectPath } from "./lib/proxy-policy.ts";

test("redirects an anonymous member route to localized login", () => {
  assert.equal(
    proxyRedirectPath("/en/universities", "?q=law", false),
    "/en/login?returnTo=%2Fen%2Funiversities%3Fq%3Dlaw",
  );
});

test("adviser redirects distinguish anonymous, ordinary members and advisers", () => {
  assert.equal(proxyRedirectPath("/zh/adviser/consultations", "", { authenticated: false, adviser: false }),
    "/zh/login?returnTo=%2Fzh%2Fadviser%2Fconsultations");
  assert.equal(proxyRedirectPath("/zh/adviser/consultations", "", { authenticated: true, adviser: false }), "/zh/forbidden");
  assert.equal(proxyRedirectPath("/en/adviser/consultations/ref", "", { authenticated: true, adviser: false }), "/en/forbidden");
  assert.equal(proxyRedirectPath("/zh/adviser/consultations", "", { authenticated: true, adviser: true }), null);
  assert.equal(proxyRedirectPath("/zh/adviser/consultations", "", true), "/zh/forbidden");
  assert.equal(proxyRedirectPath("/zh/adviser/consultations", "", { authenticated: false, adviser: true }),
    "/zh/login?returnTo=%2Fzh%2Fadviser%2Fconsultations");
});

test("administrator routes fail closed for every non-admin session", () => {
  assert.equal(proxyRedirectPath("/zh/admin", "", { authenticated: false, adviser: false, admin: false }),
    "/zh/login?returnTo=%2Fzh%2Fadmin");
  assert.equal(proxyRedirectPath("/en/admin", "", { authenticated: true, adviser: true, admin: false }), "/en/forbidden");
  assert.equal(proxyRedirectPath("/zh/admin", "", { authenticated: true, adviser: false, admin: true }), null);
});

test("demo cookies grant ordinary development access but never adviser capabilities", async () => {
  let calls = 0;
  const request = (async () => {
    calls++;
    return Response.json({ authenticated: false, userId: null, fullName: null, adviser: false, admin: false });
  }) as typeof fetch;
  const cookie = "udajo_demo_session=1";
  assert.deepEqual(await loadProxySessionAccess("/zh/planning", "http://backend:8080", cookie,
    "development", request), { authenticated: true, adviser: false, admin: false });
  assert.equal(calls, 0);
  assert.deepEqual(await loadProxySessionAccess("/zh/adviser/consultations", "http://backend:8080", cookie,
    "development", request), { authenticated: false, adviser: false, admin: false });
  assert.equal(calls, 1);
  assert.deepEqual(await loadProxySessionAccess("/zh/planning", "http://backend:8080", cookie,
    "production", request), { authenticated: false, adviser: false, admin: false });
  assert.equal(calls, 2);
  assert.deepEqual(await loadProxySessionAccess("/zh/about", "http://backend:8080", cookie,
    "development", request), { authenticated: false, adviser: false, admin: false });
  assert.equal(calls, 2);
});

test("public and demo routes do not require backend configuration", async () => {
  let resolutions = 0;
  const resolveBase = () => { resolutions++; throw new Error("missing API_BASE_URL"); };
  for (const path of ["/zh/about", "/zh/planning"]) {
    const result = await loadProxySessionAccess(path, resolveBase, "udajo_demo_session=1", "development");
    assert.equal(result.authenticated, path === "/zh/planning");
  }
  assert.equal(resolutions, 0);
  await assert.rejects(loadProxySessionAccess("/zh/adviser/consultations", resolveBase, "udajo_demo_session=1", "development"),
    /missing API_BASE_URL/);
  assert.equal(resolutions, 1);
});

test("redirects anonymous visitors away from private account and review routes", () => {
  assert.equal(
    proxyRedirectPath("/en/account", "", false),
    "/en/login?returnTo=%2Fen%2Faccount",
  );
  assert.equal(
    proxyRedirectPath("/zh/review", "?page=2", false),
    "/zh/login?returnTo=%2Fzh%2Freview%3Fpage%3D2",
  );
});

test("allows public pages and signed-in member routes", () => {
  assert.equal(proxyRedirectPath("/zh/about", "", false), null);
  assert.equal(proxyRedirectPath("/zh/planning", "", true), null);
});


test("account management requires a fresh advanced administrator capability", async () => {
  const ordinary = { authenticated: true, adviser: false, admin: true };
  assert.equal(proxyRedirectPath("/zh/admin/accounts", "", ordinary), "/zh/forbidden");
  assert.equal(proxyRedirectPath("/zh/admin/%61ccounts", "", ordinary), "/zh/forbidden");
  assert.equal(proxyRedirectPath("/zh/admin/accounts", "", { ...ordinary, advancedAdmin: true }), null);
  for (const capability of [true, false, "true", null]) {
    const calls: string[] = [];
    const request = (async (url: string | URL | Request, init?: RequestInit) => {
      calls.push(String(url));
      assert.equal(init?.cache, "no-store");
      assert.equal(new Headers(init?.headers).get("Cookie"), "session=test");
      return calls.length === 1 ? Response.json({ ...ordinary, userId: 1, fullName: "管理员" }) : Response.json({ permanentDelete: capability });
    }) as typeof fetch;
    const access = await loadProxySessionAccess("/zh/admin/accounts", "http://backend:8080", "session=test", "production", request);
    assert.equal(access.advancedAdmin, capability === true);
    assert.equal(calls[1], "http://backend:8080/api/v1/admin/catalog/lifecycle/capabilities");
  }
});

test("account management denies access when the capability service fails", async () => {
  let calls = 0;
  const request = (async () => {
    if (++calls === 1) return Response.json({ authenticated: true, adviser: false, admin: true, userId: 1, fullName: "管理员" });
    throw new Error("offline");
  }) as typeof fetch;
  const access = await loadProxySessionAccess("/zh/admin/accounts", "http://backend:8080", "session=test", "production", request);
  assert.equal(proxyRedirectPath("/zh/admin/accounts", "", access), "/zh/forbidden");
});
