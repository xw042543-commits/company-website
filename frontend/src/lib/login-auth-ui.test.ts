import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import test from "node:test";

const read = (path: string) => readFileSync(fileURLToPath(new URL(path, import.meta.url)), "utf8");

test("login page uses a focused portal shell for the real account flow", () => {
  const page = read("../app/[locale]/login/page.tsx");
  const panel = read("../components/auth-account-panel.tsx");
  assert.match(page, /auth-portal-header/);
  assert.match(page, /auth-login-card/);
  assert.match(panel, /auth-form-column/);
  assert.match(panel, /WechatQrPanel/);
  assert.doesNotMatch(page, /auth-qr-column/);
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

test("account form exposes only the launch-ready email login", () => {
  const source = read("../components/login-form.tsx");
  assert.doesNotMatch(source, /login-tab-phone/);
  assert.doesNotMatch(source, /Phone sign in|手机号登录/);
  assert.doesNotMatch(source, /login-tab-wechat/);
  assert.match(source, /Email address|邮箱/);
});

test("WeChat QR access embeds the official scanner and supports verified-account binding", () => {
  const panel = read("../components/auth-account-panel.tsx");
  const wechat = read("../components/wechat-qr-panel.tsx");
  const binding = read("../components/wechat-bind-form.tsx");
  const page = read("../app/[locale]/login/page.tsx");
  assert.match(panel, /mode=\{registering \? "register" : "login"\}/);
  assert.match(panel, /returnTo=\{returnTo\}/);
  assert.match(wechat, /getWechatQrConfig/);
  assert.match(wechat, /res\.wx\.qq\.com\/connect\/zh_CN\/htmledition\/js\/wxLogin\.js/);
  assert.match(wechat, /new window\.WxLogin/);
  assert.match(wechat, /wechat-login-container/);
  assert.match(wechat, /iframe\.addEventListener\("load"/);
  assert.match(wechat, /WeChat QR iframe timed out/);
  assert.match(wechat, /existing\?\.remove\(\)/);
  assert.match(wechat, /retryNonce/);
  assert.match(wechat, /重试二维码/);
  assert.match(wechat, /aria-busy/);
  assert.match(wechat, /role="alert"/);
  assert.match(wechat, /wechat-qr-frame/);
  assert.match(wechat, /微信扫码登录或注册/);
  assert.match(wechat, /\/api\/v1\/auth\/wechat\/start/);
  assert.match(wechat, /\/privacy/);
  assert.match(binding, /bindWechatAccount/);
  assert.match(binding, /verified email or phone account/);
  assert.match(panel, /"wechat-bind"/);
  assert.match(page, /wechatError/);
  assert.doesNotMatch(wechat, /qrPattern|wechat-qr-grid/);
  assert.doesNotMatch(`${wechat}\n${binding}`, /fake qr|demo session|startDemoSession/i);
});

test("account forms submit to the real versioned authentication client and isolate local demo access", () => {
  const login = read("../components/login-form.tsx");
  const register = read("../components/register-form.tsx");
  assert.match(login, /import \{ login \} from "@\/lib\/auth-api"/);
  assert.match(register, /registerAccount/);
  assert.match(login, /browserApiBaseUrl/);
  assert.match(register, /browserApiBaseUrl/);
  assert.match(login, /startDemoSession/);
  assert.doesNotMatch(register, /startDemoSession/);
});

test("registration and password recovery accept email only for the initial launch", () => {
  const register = read("../components/register-form.tsx");
  const recovery = read("../components/forgot-password-form.tsx");
  assert.doesNotMatch(register, /registration-method/);
  assert.doesNotMatch(register, /Phone number|手机号/);
  assert.match(register, /type="email"/);
  assert.match(recovery, /type="email"/);
  assert.doesNotMatch(recovery, /Email or phone number|邮箱或手机号码/);
});

test("privacy policy discloses WeChat identifiers and unavailable-function handling", () => {
  const policy = read("../app/[locale]/privacy/page.tsx");
  const chrome = read("../components/site-chrome.tsx");
  assert.match(policy, /OpenID/);
  assert.match(policy, /UnionID/);
  assert.match(policy, /微信密码/);
  assert.match(policy, /功能尚未开放或仅供预览/);
  assert.match(policy, /Resend/);
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

test("verification forms let users request replacement instructions", () => {
  const email = read("../components/email-verification-form.tsx");
  const phone = read("../components/phone-verification-form.tsx");
  assert.match(email, /resendVerification/);
  assert.match(email, /Resend verification code/);
  assert.match(phone, /resendVerification/);
  assert.match(phone, /Resend verification code/);
});

test("email verification accepts a six digit code and enforces a resend countdown", () => {
  const email = read("../components/email-verification-form.tsx");
  assert.match(email, /inputMode="numeric"/);
  assert.match(email, /autoComplete="one-time-code"/);
  assert.match(email, /maxLength=\{6\}/);
  assert.match(email, /cooldown/);
  assert.match(email, /60/);
});

test("local demo accounts load a profile without exposing production account actions", () => {
  const account = read("../components/account-panel.tsx");
  const route = read("../app/api/demo-session/route.ts");
  assert.match(account, /loadDemoAccount/);
  assert.match(account, /demo-account-note/);
  assert.match(account, /!demoAccount/);
  assert.match(route, /export async function GET/);
  assert.match(route, /UDAJO Demo Student/);
});
