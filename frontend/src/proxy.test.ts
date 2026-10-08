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

test("demo cookies grant ordinary development access but never adviser capabilities", async () => {
  let calls = 0;
  const request = (async () => {
    calls++;
    return Response.json({ authenticated: false, userId: null, fullName: null, adviser: false });
  }) as typeof fetch;
  const cookie = "udajo_demo_session=1";
  assert.deepEqual(await loadProxySessionAccess("/zh/planning", "http://backend:8080", cookie,
    "development", request), { authenticated: true, adviser: false });
  assert.equal(calls, 0);
  assert.deepEqual(await loadProxySessionAccess("/zh/adviser/consultations", "http://backend:8080", cookie,
    "development", request), { authenticated: false, adviser: false });
  assert.equal(calls, 1);
  assert.deepEqual(await loadProxySessionAccess("/zh/planning", "http://backend:8080", cookie,
    "production", request), { authenticated: false, adviser: false });
  assert.equal(calls, 2);
  assert.deepEqual(await loadProxySessionAccess("/zh/about", "http://backend:8080", cookie,
    "development", request), { authenticated: false, adviser: false });
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
