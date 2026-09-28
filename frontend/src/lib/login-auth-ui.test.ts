import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import test from "node:test";

const read = (path: string) => readFileSync(fileURLToPath(new URL(path, import.meta.url)), "utf8");

test("login page uses a focused portal shell with QR and account columns", () => {
  const page = read("../app/[locale]/login/page.tsx");
  assert.match(page, /auth-portal-header/);
  assert.match(page, /auth-login-card/);
  assert.match(page, /auth-qr-column/);
  assert.match(page, /auth-form-column/);
  assert.match(page, /WeChatLogin/);
  assert.match(page, /Back to website|返回网站/);
});

test("public chrome is hidden only for the focused login portal", () => {
  const source = read("../components/site-chrome.tsx");
  const layout = read("../app/[locale]/layout.tsx");
  assert.match(source, /usePathname/);
  assert.match(source, /isLoginPortal/);
  assert.match(source, /\/login/);
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
