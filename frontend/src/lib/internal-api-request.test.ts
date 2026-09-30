import assert from "node:assert/strict";
import test from "node:test";

import { internalApiRequestInit, sanitizeClientAddress } from "./internal-api-request.ts";

test("marks trusted server-to-backend requests as HTTPS without duplicate forwarding headers", () => {
  const init = internalApiRequestInit({ headers: { Cookie: "JSESSIONID=test" } }, "203.0.113.9");
  const headers = new Headers(init.headers);
  assert.equal(headers.get("cookie"), "JSESSIONID=test");
  assert.equal(headers.get("x-forwarded-proto"), "https");
  assert.equal(headers.get("x-forwarded-for"), "203.0.113.9");
  assert.deepEqual([...headers.keys()].filter((name) => name === "x-forwarded-proto"), ["x-forwarded-proto"]);
});

test("forwards only one validated literal client address", () => {
  assert.equal(sanitizeClientAddress("198.51.100.20"), "198.51.100.20");
  assert.equal(sanitizeClientAddress("2001:db8::20"), "2001:db8::20");
  for (const value of ["198.51.100.20, 172.30.0.1", "999.1.1.1", "client.example", ""]) {
    assert.equal(sanitizeClientAddress(value), undefined);
  }
});
