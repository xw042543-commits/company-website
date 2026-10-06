import assert from "node:assert/strict";
import test from "node:test";

import {
  bindWechatAccount,
  changePassword,
  deleteAccount,
  getAccount,
  getAuthProviders,
  getWechatQrConfig,
  getCsrfToken,
  getSession,
  login,
  logout,
  registerAccount,
  resendVerification,
  requestPasswordReset,
  resetPassword,
  verifyEmail,
  verifyPhone,
} from "./auth-api.ts";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function requestQueue(responses: Response[]) {
  const calls: Array<{ url: string; init?: RequestInit }> = [];
  const request = (async (input: string | URL | Request, init?: RequestInit) => {
    calls.push({ url: String(input), init });
    const response = responses.shift();
    if (!response) throw new Error("Unexpected request");
    return response;
  }) as typeof fetch;
  return { calls, request };
}

const csrf = { headerName: "X-XSRF-TOKEN", token: "csrf-token" };
const session = {
  authenticated: true,
  userId: 7,
  fullName: "Wang Xin",
};

test("loads csrf and sends credentials on login", async () => {
  const { calls, request } = requestQueue([jsonResponse(csrf), jsonResponse(session)]);
  const result = await login("http://localhost:8080", {
    identifier: "student@example.com",
    password: "correct-horse-42",
    rememberMe: false,
  }, request);

  assert.equal(calls[0].url, "http://localhost:8080/api/v1/auth/csrf");
  assert.equal(calls[0].init?.credentials, "include");
  assert.equal(calls[1].url, "http://localhost:8080/api/v1/auth/login");
  assert.equal(calls[1].init?.credentials, "include");
  assert.equal(calls[1].init?.method, "POST");
  assert.equal(new Headers(calls[1].init?.headers).get("X-XSRF-TOKEN"), "csrf-token");
  assert.deepEqual(result, { status: "ready", session });
});

test("discovers WeChat availability with strict no-store parsing", async () => {
  const available = requestQueue([jsonResponse({ wechat: true })]);
  assert.deepEqual(await getAuthProviders("http://localhost:8080", available.request), {
    status: "ready", wechat: true,
  });
  assert.equal(available.calls[0].url, "http://localhost:8080/api/v1/auth/providers");
  assert.equal(available.calls[0].init?.credentials, "include");
  assert.equal(available.calls[0].init?.cache, "no-store");

  const leaked = requestQueue([jsonResponse({ wechat: true, appSecret: "secret" })]);
  assert.deepEqual(await getAuthProviders("http://localhost:8080", leaked.request), { status: "error" });
});

test("loads a session-bound public WeChat QR configuration", async () => {
  const payload = {
    appId: "wx-public-app",
    scope: "snsapi_login",
    redirectUri: "https://yangdoujiao.com/api/v1/auth/wechat/callback",
    state: "one-time-state",
  };
  const ready = requestQueue([jsonResponse(payload)]);

  assert.deepEqual(await getWechatQrConfig(
    "http://localhost:8080", "zh", "/zh/account", ready.request,
  ), { status: "ready", config: payload });
  assert.equal(ready.calls[0].url,
    "http://localhost:8080/api/v1/auth/wechat/qr-config?locale=zh&returnTo=%2Fzh%2Faccount");
  assert.equal(ready.calls[0].init?.credentials, "include");
  assert.equal(ready.calls[0].init?.cache, "no-store");

  const leaked = requestQueue([jsonResponse({ ...payload, appSecret: "must-not-leak" })]);
  assert.deepEqual(await getWechatQrConfig(
    "http://localhost:8080", "zh", "/zh/account", leaked.request,
  ), { status: "error" });
});

test("binds a pending WeChat identity through csrf protected account verification", async () => {
  const { calls, request } = requestQueue([jsonResponse(csrf), jsonResponse(session)]);
  assert.deepEqual(await bindWechatAccount("http://localhost:8080", {
    identifier: "student@example.com", password: "correct-horse-42", rememberMe: false,
  }, request), { status: "ready", session });
  assert.equal(calls[1].url, "http://localhost:8080/api/v1/auth/wechat/bind");
  assert.equal(calls[1].init?.method, "POST");
  assert.equal(calls[1].init?.credentials, "include");
});

test("strictly validates csrf and session payloads", async () => {
  const malformedCsrf = requestQueue([jsonResponse({ headerName: "", token: "x" })]);
  assert.deepEqual(await getCsrfToken("http://localhost:8080", malformedCsrf.request), { status: "error" });

  const malformedSession = requestQueue([jsonResponse({ authenticated: true, userId: "7" })]);
  assert.deepEqual(await getSession("http://localhost:8080", malformedSession.request), { status: "error" });

  const anonymous = { authenticated: false, userId: null, fullName: null };
  const validSession = requestQueue([jsonResponse(anonymous)]);
  assert.deepEqual(await getSession("http://localhost:8080", validSession.request), {
    status: "ready",
    session: anonymous,
  });
});

test("rejects unsafe base URLs before making a request", async () => {
  let called = false;
  const request = (async () => {
    called = true;
    return jsonResponse(csrf);
  }) as typeof fetch;

  assert.deepEqual(await getSession("javascript:alert(1)", request), { status: "error" });
  assert.deepEqual(await getCsrfToken("https://user:secret@example.com", request), { status: "error" });
  assert.equal(called, false);
});

test("registers accounts and validates the accepted response", async () => {
  const accepted = { verificationMethod: "EMAIL", message: "Instructions sent" };
  const { calls, request } = requestQueue([jsonResponse(csrf), jsonResponse(accepted, 202)]);
  const result = await registerAccount("http://localhost:8080", {
    fullName: "Wang Xin",
    email: "student@example.com",
    phone: null,
    password: "correct-horse-42",
    agreementAccepted: true,
    privacyAccepted: true,
    locale: "zh",
  }, request);

  assert.deepEqual(result, { status: "accepted", verificationMethod: "EMAIL" });
  assert.equal(JSON.parse(String(calls[1].init?.body)).password, "correct-horse-42");

  const malformed = requestQueue([jsonResponse(csrf), jsonResponse({ verificationMethod: "FAX" }, 202)]);
  assert.deepEqual(await registerAccount("http://localhost:8080", {
    fullName: "Wang Xin", email: "student@example.com", phone: null, password: "correct-horse-42",
    agreementAccepted: true, privacyAccepted: true, locale: "zh",
  }, malformed.request), { status: "error" });
});

test("uses the correct methods and csrf protection for every write endpoint", async () => {
  const cases: Array<{
    path: string;
    method: string;
    run: (request: typeof fetch) => Promise<unknown>;
    responseStatus?: number;
  }> = [
    { path: "/api/v1/auth/verify-email", method: "POST", run: (r) => verifyEmail("http://localhost:8080", { email: "student@example.com", code: "123456" }, r), responseStatus: 204 },
    { path: "/api/v1/auth/verify-phone", method: "POST", run: (r) => verifyPhone("http://localhost:8080", { phone: "+60123456789", code: "123456" }, r), responseStatus: 204 },
    { path: "/api/v1/auth/logout", method: "POST", run: (r) => logout("http://localhost:8080", r), responseStatus: 204 },
    { path: "/api/v1/auth/forgot-password", method: "POST", run: (r) => requestPasswordReset("http://localhost:8080", { identifier: "student@example.com", locale: "en" }, r), responseStatus: 202 },
    { path: "/api/v1/auth/reset-password", method: "POST", run: (r) => resetPassword("http://localhost:8080", { token: "reset-token", newPassword: "new-correct-horse-42" }, r), responseStatus: 204 },
    { path: "/api/v1/account/password", method: "PUT", run: (r) => changePassword("http://localhost:8080", { currentPassword: "correct-horse-42", newPassword: "new-correct-horse-42" }, r), responseStatus: 204 },
    { path: "/api/v1/account", method: "DELETE", run: (r) => deleteAccount("http://localhost:8080", { currentPassword: "correct-horse-42", confirmation: "DELETE" }, r), responseStatus: 204 },
  ];

  for (const item of cases) {
    const { calls, request } = requestQueue([jsonResponse(csrf), new Response(null, { status: item.responseStatus })]);
    assert.deepEqual(await item.run(request), item.responseStatus === 202 ? { status: "accepted" } : { status: "ready" });
    assert.equal(new URL(calls[1].url).pathname, item.path);
    assert.equal(calls[1].init?.method, item.method);
    assert.equal(calls[1].init?.credentials, "include");
    assert.equal(new Headers(calls[1].init?.headers).get(csrf.headerName), csrf.token);
  }
});

test("resends verification instructions through the versioned auth endpoint", async () => {
  const accepted = { verificationMethod: "PHONE", message: "Instructions sent" };
  const { calls, request } = requestQueue([jsonResponse(csrf), jsonResponse(accepted, 202)]);

  assert.deepEqual(await resendVerification("http://localhost:8080", {
    identifier: "+60123456789",
    locale: "en",
  }, request), { status: "accepted", verificationMethod: "PHONE" });
  assert.equal(new URL(calls[1].url).pathname, "/api/v1/auth/resend-verification");
  assert.equal(calls[1].init?.method, "POST");
});

test("loads and strictly validates the masked account profile", async () => {
  const account = {
    id: 7,
    fullName: "Wang Xin",
    email: "s***@example.com",
    phone: null,
    emailVerified: true,
    phoneVerified: false,
    wechatLinked: true,
    wechatDisplayName: "小王",
    wechatAvatarUrl: "https://thirdwx.qlogo.cn/mmopen/example/132",
    wechatLastLoginAt: "2026-10-06T08:30:00Z",
    createdAt: "2026-09-28T10:00:00Z",
  };
  const valid = requestQueue([jsonResponse(account)]);
  assert.deepEqual(await getAccount("http://localhost:8080", valid.request), { status: "ready", account });
  assert.equal(valid.calls[0].init?.credentials, "include");

  const leaked = requestQueue([jsonResponse({ ...account, passwordHash: "secret" })]);
  assert.deepEqual(await getAccount("http://localhost:8080", leaked.request), { status: "error" });

  const unsafeAvatar = requestQueue([jsonResponse({ ...account, wechatAvatarUrl: "https://example.com/avatar.jpg" })]);
  assert.deepEqual(await getAccount("http://localhost:8080", unsafeAvatar.request), { status: "error" });
});

test("maps backend and network failures to stable client states", async () => {
  const fieldErrors = { password: "must be stronger" };
  const validation = requestQueue([jsonResponse(csrf), jsonResponse({ code: "VALIDATION_ERROR", fieldErrors }, 400)]);
  assert.deepEqual(await login("http://localhost:8080", {
    identifier: "student@example.com", password: "bad", rememberMe: false,
  }, validation.request), { status: "validation-error", fieldErrors });

  for (const [httpStatus, expected] of [[401, "unauthorized"], [429, "rate-limited"], [503, "unavailable"]] as const) {
    const queued = requestQueue([jsonResponse(csrf), jsonResponse({}, httpStatus)]);
    assert.deepEqual(await verifyEmail("http://localhost:8080", { email: "student@example.com", code: "000000" }, queued.request), { status: expected });
  }

  const network = (async () => { throw new TypeError("offline"); }) as typeof fetch;
  assert.deepEqual(await getSession("http://localhost:8080", network), { status: "unavailable" });
});
