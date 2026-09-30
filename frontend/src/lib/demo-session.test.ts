import assert from "node:assert/strict";
import test from "node:test";
import { DEMO_SESSION_COOKIE, hasDevelopmentDemoSession } from "./demo-session.ts";

test("accepts the local demo cookie outside production", () => {
  assert.equal(hasDevelopmentDemoSession(`${DEMO_SESSION_COOKIE}=1`, "development"), true);
  assert.equal(hasDevelopmentDemoSession(`other=x; ${DEMO_SESSION_COOKIE}=1`, "test"), true);
});

test("never accepts the local demo cookie in production", () => {
  assert.equal(hasDevelopmentDemoSession(`${DEMO_SESSION_COOKIE}=1`, "production"), false);
  assert.equal(hasDevelopmentDemoSession("", "development"), false);
});
