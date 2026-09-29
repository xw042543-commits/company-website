import assert from "node:assert/strict";
import test from "node:test";
import { DEMO_SESSION_COOKIE, DEMO_SESSION_VALUE, isDemoSessionValue } from "./demo-session.ts";

test("uses a non-personal marker for the frontend demo session", () => {
  assert.equal(DEMO_SESSION_COOKIE, "udajo-demo-session");
  assert.equal(DEMO_SESSION_VALUE, "member-preview-v1");
  assert.equal(isDemoSessionValue(DEMO_SESSION_VALUE), true);
  assert.equal(isDemoSessionValue("user@example.com"), false);
  assert.equal(isDemoSessionValue(undefined), false);
});
