import assert from "node:assert/strict";
import test from "node:test";

import { checkBackendReadiness } from "./frontend-readiness.ts";

test("checks backend readiness through the trusted internal request contract", async () => {
  let requestedUrl = "";
  let requestedHeaders = new Headers();
  const ready = await checkBackendReadiness("http://backend:8080", async (input, init) => {
    requestedUrl = String(input);
    requestedHeaders = new Headers(init?.headers);
    return new Response('{"status":"UP"}', { status: 200 });
  });

  assert.equal(ready, true);
  assert.equal(requestedUrl, "http://backend:8080/actuator/health/readiness");
  assert.equal(requestedHeaders.get("x-forwarded-proto"), "https");
});

test("reports not ready for missing configuration, failures, and malformed payloads", async () => {
  assert.equal(await checkBackendReadiness(undefined), false);
  assert.equal(await checkBackendReadiness("http://backend:8080", async () => new Response("down", { status: 503 })), false);
  assert.equal(await checkBackendReadiness("http://backend:8080", async () => new Response("{}", { status: 200 })), false);
  assert.equal(await checkBackendReadiness("http://backend:8080", async () => { throw new Error("offline"); }), false);
});
