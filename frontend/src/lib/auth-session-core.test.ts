import assert from "node:assert/strict";
import test from "node:test";
import { hasAuthenticatedSession, loadSessionAccess } from "./auth-session-core.ts";

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

test("loads authenticated adviser capabilities through an uncached cookie-bound session", async () => {
  for (const adviser of [false, true]) {
    const request = (async (url, init) => {
      assert.equal(String(url), "http://backend:8080/api/v1/auth/session");
      assert.equal(init?.cache, "no-store");
      const headers = new Headers(init?.headers);
      assert.equal(headers.get("cookie"), "JSESSIONID=real-session");
      assert.equal(headers.get("x-forwarded-for"), "203.0.113.7");
      assert.equal(headers.get("x-forwarded-proto"), "https");
      return Response.json({ authenticated: true, userId: 7, fullName: "Adviser", adviser });
    }) as typeof fetch;
    assert.deepEqual(await loadSessionAccess("http://backend:8080/", "JSESSIONID=real-session", request,
      "203.0.113.7"), { authenticated: true, adviser });
  }
});

test("adviser session access fails closed for anonymous and malformed session contracts", async () => {
  for (const payload of [
    { authenticated: false, userId: null, fullName: null, adviser: false },
    null, [], "signed-in", { authenticated: "true", adviser: true },
    { authenticated: true, userId: 7, fullName: "Adviser", adviser: "true" },
    { authenticated: true, userId: "7", fullName: "Adviser", adviser: true },
    { authenticated: true, userId: 7, fullName: "", adviser: true },
    { authenticated: true, adviser: true },
    { authenticated: false, userId: null, fullName: null, adviser: true },
  ]) {
    const request = (async () => Response.json(payload)) as typeof fetch;
    assert.deepEqual(await loadSessionAccess("http://backend:8080", "JSESSIONID=session", request),
      { authenticated: false, adviser: false }, JSON.stringify(payload));
  }
});

test("session access never reuses capabilities after missing cookies or backend failure", async () => {
  let calls = 0;
  const request = (async () => { calls++; throw new Error("offline"); }) as typeof fetch;
  assert.deepEqual(await loadSessionAccess(undefined, "cookie", request), { authenticated: false, adviser: false });
  assert.deepEqual(await loadSessionAccess("http://backend:8080", null, request), { authenticated: false, adviser: false });
  assert.equal(calls, 0);
  assert.deepEqual(await loadSessionAccess("http://backend:8080", "cookie", request), { authenticated: false, adviser: false });
  for (const response of [new Response("denied", { status: 403 }), new Response("{")]) {
    assert.deepEqual(await loadSessionAccess("http://backend:8080", "cookie", (async () => response) as typeof fetch),
      { authenticated: false, adviser: false });
  }
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
