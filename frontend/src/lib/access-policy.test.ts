import assert from "node:assert/strict";
import test from "node:test";
import { isProtectedPath, safeReturnTo } from "./access-policy.ts";

test("keeps company, account, and contact pages public", () => {
  for (const path of ["/en", "/zh/about", "/en/login", "/zh/register", "/en/forgot-password"]) {
    assert.equal(isProtectedPath(path), false, path);
  }
});

test("protects member planning and content tools", () => {
  for (const path of ["/en/planning", "/zh/universities", "/en/universities/university-of-malaya", "/zh/language", "/en/scholarships", "/zh/news"]) {
    assert.equal(isProtectedPath(path), true, path);
  }
});

test("accepts only same-locale relative return destinations", () => {
  assert.equal(safeReturnTo("/en/universities?q=law", "en"), "/en/universities?q=law");
  assert.equal(safeReturnTo("/zh/planning", "en"), "/en");
  assert.equal(safeReturnTo("https://example.com", "en"), "/en");
  assert.equal(safeReturnTo("//example.com", "en"), "/en");
  assert.equal(safeReturnTo("/en/login", "en"), "/en");
  assert.equal(safeReturnTo("/en/../zh/planning", "en"), "/en");
  assert.equal(safeReturnTo("/en/../en/login", "en"), "/en");
  assert.equal(safeReturnTo(undefined, "zh"), "/zh");
});
