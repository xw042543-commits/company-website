import assert from "node:assert/strict";
import test from "node:test";
import { hasAuthenticatedSession } from "./auth-session-core.ts";

test("forwards the browser cookie and accepts an authenticated backend session", async () => {
  let cookie = "";
  const request = (async (_input: string | URL | Request, init?: RequestInit) => {
    cookie = new Headers(init?.headers).get("cookie") ?? "";
    return new Response(JSON.stringify({ authenticated: true, userId: 7, fullName: "Student" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }) as typeof fetch;

  assert.equal(await hasAuthenticatedSession("http://backend:8080", "JSESSIONID=session-id", request), true);
  assert.equal(cookie, "JSESSIONID=session-id");
});

test("fails closed when the cookie, backend response, or payload is unavailable", async () => {
  let calls = 0;
  const request = (async () => {
    calls += 1;
    return new Response(JSON.stringify({ authenticated: false, userId: null, fullName: null }), { status: 200 });
  }) as typeof fetch;

  assert.equal(await hasAuthenticatedSession("http://backend:8080", null, request), false);
  assert.equal(calls, 0);
  assert.equal(await hasAuthenticatedSession("http://backend:8080", "JSESSIONID=session-id", request), false);
});
