import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { proxyBackendApiRequest } from "./backend-api-proxy.ts";

test("proxies same-origin API requests with one trusted HTTPS forwarding boundary", async () => {
  let forwardedUrl = "";
  let forwardedInit: RequestInit | undefined;
  const request = new Request("https://yangdoujiao.com/api/v1/auth/register?source=web", {
    method: "POST",
    headers: {
      Connection: "keep-alive",
      Cookie: "JSESSIONID=test",
      Forwarded: "for=attacker;proto=http",
      Host: "attacker.example",
      "X-CSRF-TOKEN": "csrf-token",
      "X-Forwarded-For": "203.0.113.7",
      "X-Forwarded-Proto": "http",
      "X-Real-IP": "198.51.100.9",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email: "student@example.com" }),
  });

  const response = await proxyBackendApiRequest(
    request,
    "http://backend:8080",
    ["v1", "auth", "register"],
    async (input, init) => {
      forwardedUrl = input.toString();
      forwardedInit = init;
      return new Response('{"accepted":true}', {
        status: 202,
        headers: { "Content-Type": "application/json", "Set-Cookie": "JSESSIONID=new; HttpOnly" },
      });
    },
  );

  assert.equal(forwardedUrl, "http://backend:8080/api/v1/auth/register?source=web");
  assert.equal(forwardedInit?.method, "POST");
  const headers = new Headers(forwardedInit?.headers);
  assert.equal(headers.get("cookie"), "JSESSIONID=test");
  assert.equal(headers.get("x-csrf-token"), "csrf-token");
  assert.equal(headers.get("x-forwarded-for"), "203.0.113.7");
  assert.equal(headers.get("x-forwarded-proto"), "https");
  for (const name of ["connection", "forwarded", "host", "x-real-ip"]) assert.equal(headers.get(name), null);
  assert.equal(forwardedInit?.body, request.body);
  assert.equal(response.status, 202);
  assert.equal(response.headers.get("set-cookie"), "JSESSIONID=new; HttpOnly");
  assert.deepEqual(await response.json(), { accepted: true });
});

test("the catch-all API route forwards browser preflight requests", () => {
  const route = readFileSync(new URL("../app/api/[...path]/route.ts", import.meta.url), "utf8");
  assert.match(route, /proxyApi as OPTIONS/);
});
