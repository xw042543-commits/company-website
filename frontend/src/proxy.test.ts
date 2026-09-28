import assert from "node:assert/strict";
import test from "node:test";
import { proxyRedirectPath } from "./lib/proxy-policy.ts";
import { DEMO_SESSION_VALUE } from "./lib/demo-session.ts";

test("redirects an anonymous member route to localized login", () => {
  assert.equal(
    proxyRedirectPath("/en/universities", "?q=law", undefined),
    "/en/login?returnTo=%2Fen%2Funiversities%3Fq%3Dlaw",
  );
});

test("allows public pages and signed-in member routes", () => {
  assert.equal(proxyRedirectPath("/zh/about", "", undefined), null);
  assert.equal(proxyRedirectPath("/zh/planning", "", DEMO_SESSION_VALUE), null);
});
