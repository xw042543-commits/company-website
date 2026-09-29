import assert from "node:assert/strict";
import test from "node:test";
import { proxyRedirectPath } from "./lib/proxy-policy.ts";

test("redirects an anonymous member route to localized login", () => {
  assert.equal(
    proxyRedirectPath("/en/universities", "?q=law", false),
    "/en/login?returnTo=%2Fen%2Funiversities%3Fq%3Dlaw",
  );
});

test("allows public pages and signed-in member routes", () => {
  assert.equal(proxyRedirectPath("/zh/about", "", false), null);
  assert.equal(proxyRedirectPath("/zh/planning", "", true), null);
});
