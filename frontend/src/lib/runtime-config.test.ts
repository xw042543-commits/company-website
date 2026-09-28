import assert from "node:assert/strict";
import test from "node:test";

import { resolveApiBaseUrl } from "./runtime-config-core.ts";

test("returns a trimmed server-only API URL", () => {
  assert.equal(resolveApiBaseUrl({ API_BASE_URL: " http://backend:8080 " }, "production"), "http://backend:8080");
});

test("allows reviewed local data when the API is unset outside production", () => {
  assert.equal(resolveApiBaseUrl({}, "development"), undefined);
  assert.equal(resolveApiBaseUrl({}, "test"), undefined);
});

test("requires an API URL in production", () => {
  assert.throws(() => resolveApiBaseUrl({}, "production"), /API_BASE_URL is required/);
});

test("does not accept the browser-public legacy variable", () => {
  assert.throws(
    () => resolveApiBaseUrl({ NEXT_PUBLIC_API_BASE_URL: "https://public.example.com" }, "production"),
    /API_BASE_URL is required/,
  );
});

test("rejects malformed and unsupported API URLs", () => {
  assert.throws(() => resolveApiBaseUrl({ API_BASE_URL: "backend:8080" }, "production"), /valid HTTP or HTTPS URL/);
  assert.throws(() => resolveApiBaseUrl({ API_BASE_URL: "ftp://backend" }, "production"), /valid HTTP or HTTPS URL/);
});
