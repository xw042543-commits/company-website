import assert from "node:assert/strict";
import test from "node:test";
import { proxyRedirectPath } from "./lib/proxy-policy.ts";

test("redirects an anonymous member route to localized login", () => {
  assert.equal(
    proxyRedirectPath("/en/universities", "?q=law", false),
    "/en/login?returnTo=%2Fen%2Funiversities%3Fq%3Dlaw",
  );
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
