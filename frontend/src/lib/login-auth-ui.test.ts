import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import test from "node:test";

const read = (path: string) => readFileSync(fileURLToPath(new URL(path, import.meta.url)), "utf8");

test("login page uses a focused portal shell with QR and account columns", () => {
  const page = read("../app/[locale]/login/page.tsx");
  const panel = read("../components/auth-account-panel.tsx");
  assert.match(page, /auth-portal-header/);
  assert.match(page, /auth-login-card/);
  assert.match(page, /auth-qr-column/);
  assert.match(panel, /auth-form-column/);
  assert.match(page, /WeChatLogin/);
  assert.match(page, /Back to website|返回网站/);
});

test("public chrome is hidden for focused account routes", () => {
  const source = read("../components/site-chrome.tsx");
  const layout = read("../app/[locale]/layout.tsx");
  assert.match(source, /usePathname/);
  assert.match(source, /isAuthPortal/);
  assert.match(source, /\/login/);
  assert.match(source, /forgot-password/);
  assert.match(layout, /SiteChrome/);
  assert.doesNotMatch(layout, /<SiteHeader/);
});

test("login portal uses the full company wordmark from the public header", () => {
  const page = read("../app/[locale]/login/page.tsx");
  assert.match(page, /\/brand\/udajo-logo-transparent\.png/);
  assert.doesNotMatch(page, /src="\/icon\.png"/);
});

test("account form provides password and phone tabs with keyboard navigation", () => {
  const source = read("../components/login-form.tsx");
  assert.match(source, /\["password", "phone"\]/);
  assert.doesNotMatch(source, /login-tab-wechat/);
  assert.match(source, /role="tablist"/);
  assert.match(source, /ArrowRight/);
  assert.match(source, /ArrowLeft/);
});

test("WeChat column exposes backend-ready QR states", () => {
  const source = read("../components/wechat-login.tsx");
  for (const state of ["waiting", "scanned", "expired", "error"]) assert.match(source, new RegExp(state));
  assert.match(source, /wechatQrUrl/);
  assert.match(source, /Refresh QR|刷新二维码/);
  assert.match(source, /privacy|隐私政策/);
});

test("privacy policy discloses WeChat identifiers and unavailable-function handling", () => {
  const policy = read("../app/[locale]/privacy/page.tsx");
  const chrome = read("../components/site-chrome.tsx");
  assert.match(policy, /OpenID/);
  assert.match(policy, /UnionID/);
  assert.match(policy, /微信密码/);
  assert.match(policy, /功能尚未开放或仅供预览/);
  assert.match(chrome, /\/privacy/);
});

test("privacy policy and user agreement are linked from account and public pages", () => {
  const agreement = read("../app/[locale]/terms/page.tsx");
  const privacy = read("../app/[locale]/privacy/page.tsx");
  const login = read("../app/[locale]/login/page.tsx");
  const register = read("../components/register-form.tsx");
  const chrome = read("../components/site-chrome.tsx");
  assert.match(agreement, /主动确认本协议/);
  assert.match(agreement, /不构成录取、签证、奖学金、就业或其他结果保证/);
  assert.match(agreement, /\/privacy/);
  assert.match(privacy, /当您提交咨询时处理姓名/);
  for (const source of [login, register, chrome]) {
    assert.match(source, /\/privacy/);
    assert.match(source, /\/terms/);
  }
});

test("login background uses scroll-linked transform motion with a reduced-motion fallback", () => {
  const css = read("../app/globals.css");
  assert.match(css, /\.auth-portal/);
  assert.match(css, /animation-timeline:\s*scroll/);
  assert.match(css, /auth-backdrop-drift/);
  assert.match(css, /prefers-reduced-motion[\s\S]*auth-portal/);
});

test("login page no longer exposes the admin preview", () => {
  const source = read("../app/[locale]/login/page.tsx");
  assert.doesNotMatch(source, /admin|管理员界面预览/i);
});

test("registration opens inside the login portal instead of navigating away", () => {
  const page = read("../app/[locale]/login/page.tsx");
  const panel = read("../components/auth-account-panel.tsx");
  assert.match(page, /AuthAccountPanel/);
  assert.match(panel, /RegisterForm/);
  assert.match(panel, /"login" \| "register"/);
  assert.match(panel, /auth-form-switch/);
  assert.match(panel, /Create account/);
  assert.match(panel, /Back to sign in/);
  assert.doesNotMatch(page, /href={`\/\$\{locale\}\/register`}/);
});

test("password reset opens inside the login portal and keeps focused chrome", () => {
  const panel = read("../components/auth-account-panel.tsx");
  const loginForm = read("../components/login-form.tsx");
  const recoveryPage = read("../app/[locale]/forgot-password/page.tsx");
  assert.match(panel, /ForgotPasswordForm/);
  assert.match(panel, /"recovery"/);
  assert.match(loginForm, /onForgotPassword/);
  assert.match(recoveryPage, /login\?mode=recovery/);
});

test("login portal uses the main website language icon", () => {
  const page = read("../app/[locale]/login/page.tsx");
  assert.match(page, /language-switch/);
  assert.match(page, /language-symbol/);
  assert.match(page, /<span>A<\/span><span>文<\/span>/);
});

test("account mode switch remains readable on hover", () => {
  const css = read("../app/globals.css");
  assert.match(css, /\.auth-form-switch:hover\s*\{[\s\S]*?background:\s*transparent[\s\S]*?color:\s*var\(--brand-deep\)/);
});

test("demo account actions require completed visible fields", () => {
  const login = read("../components/login-form.tsx");
  const register = read("../components/register-form.tsx");
  assert.match(login, /reportValidity/);
  assert.match(register, /reportValidity/);
  assert.match(login, /required/);
  assert.match(register, /required/);
});
