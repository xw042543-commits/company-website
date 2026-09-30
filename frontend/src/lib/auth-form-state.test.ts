import assert from "node:assert/strict";
import test from "node:test";

import { authMessage, registrationDestination } from "./auth-form-state.ts";

test("maps backend states without exposing backend messages", () => {
  assert.deepEqual(authMessage("zh", { status: "rate-limited" }), {
    tone: "error", text: "尝试次数过多，请稍后再试。",
  });
  assert.deepEqual(authMessage("en", { status: "unavailable" }), {
    tone: "error", text: "Account service is temporarily unavailable. Please try again later.",
  });
  assert.deepEqual(authMessage("zh", { status: "unauthorized" }), {
    tone: "error", text: "账号或密码不正确，请重新输入。",
  });
});

test("uses safe generic copy for validation and unexpected failures", () => {
  assert.deepEqual(authMessage("en", { status: "validation-error", fieldErrors: { password: "secret backend rule" } }), {
    tone: "error", text: "Please check the information you entered and try again.",
  });
  assert.deepEqual(authMessage("zh", { status: "error" }), {
    tone: "error", text: "操作未完成，请稍后重试。",
  });
});

test("returns neutral success copy for accepted and ready states", () => {
  assert.deepEqual(authMessage("zh", { status: "accepted" }), {
    tone: "success", text: "请求已提交，请按页面提示继续。",
  });
  assert.deepEqual(authMessage("en", { status: "ready" }), {
    tone: "success", text: "Completed successfully.",
  });
});

test("routes registration to the matching bilingual verification page", () => {
  assert.equal(registrationDestination("zh", "EMAIL"), "/zh/verify-email");
  assert.equal(registrationDestination("en", "PHONE"), "/en/verify-phone");
});
