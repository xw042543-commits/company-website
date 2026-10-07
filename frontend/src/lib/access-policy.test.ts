import assert from "node:assert/strict";
import test from "node:test";
import { isAdviserPath, isProtectedPath, safeReturnTo, signedInLoginDestination } from "./access-policy.ts";

test("keeps company, authentication support, and contact pages public", () => {
  for (const path of [
    "/en",
    "/zh/about",
    "/en/login",
    "/zh/register",
    "/en/forgot-password",
    "/zh/reset-password",
    "/en/verify-email",
    "/zh/verify-phone",
    "/en/privacy",
    "/zh/terms",
  ]) {
    assert.equal(isProtectedPath(path), false, path);
  }
});

test("protects both localized adviser route trees while leaving forbidden public", () => {
  for (const path of ["/zh/adviser/consultations", "/en/adviser/consultations/ref", "/zh/adviser"]) {
    assert.equal(isProtectedPath(path), true, path);
    assert.equal(isAdviserPath(path), true, path);
  }
  for (const path of ["/zh/advisers", "/zh/forbidden", "/en/account", "/adviser/consultations"]) {
    assert.equal(isAdviserPath(path), false, path);
  }
  assert.equal(isProtectedPath("/zh/forbidden"), false);
});

test("protects every member tool and private account route", () => {
  for (const path of [
    "/en/planning",
    "/zh/universities",
    "/en/universities/university-of-malaya",
    "/zh/language",
    "/en/scholarships",
    "/zh/news",
    "/en/account",
    "/zh/review",
  ]) {
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

test("sends signed-in visitors from login to their localized account page", () => {
  assert.equal(signedInLoginDestination(true, "zh"), "/zh/account");
  assert.equal(signedInLoginDestination(true, "en"), "/en/account");
  assert.equal(signedInLoginDestination(false, "zh"), null);
});
