import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import { JSDOM } from "jsdom";
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import ts from "typescript";

const require = createRequire(import.meta.url);
const listeners = new Set();
const redirects = [];
const router = { replace: path => redirects.push(path), refresh: () => {} };
const link = ({ children, href, ...props }) => {
  delete props.scroll;
  return createElement("a", { ...props, href }, children);
};
const empty = () => null;
const stubs = {
  "next/link": { default: link },
  "next/image": { default: empty },
  "next/navigation": { useRouter: () => router,
    usePathname: () => "/zh/account", useSearchParams: () => new URLSearchParams() },
  "./account-avatar": { AccountAvatar: empty },
  "@/components/auth-success-feedback": { AuthSuccessFeedback: empty },
  "@/components/saved-items-panel": { SavedItemsPanel: empty },
  "@/components/consultation-history-panel": { ConsultationHistoryPanel: empty },
  "@/lib/profile-sync": { watchProfileUpdates: callback => { listeners.add(callback); return () => listeners.delete(callback); } },
};
function component(file) {
  const { outputText } = ts.transpileModule(readFileSync(new URL(file, import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  });
  const componentModule = { exports: {} };
  const resolve = name => stubs[name] ?? require(name.startsWith("@/lib/") ? `../lib/${name.slice(6)}.ts` : name);
  new Function("require", "module", "exports", outputText)(resolve, componentModule, componentModule.exports);
  return componentModule.exports;
}
const { SiteHeader } = component("./site-header.tsx");
const { AccountPanel } = component("./account-panel.tsx");
const { AdminAccountLink } = component("./admin-account-link.tsx");
const profile = { id: 7, fullName: "权限测试", email: "u***@example.com", phone: null,
  emailVerified: true, phoneVerified: false, wechatLinked: false, wechatDisplayName: null,
  wechatAvatarUrl: null, wechatLastLoginAt: null, createdAt: "2026-10-01T00:00:00Z" };

test("actual desktop/mobile entries follow current ordinary, admin and advanced sessions across upgrades and downgrades", async () => {
  const dom = new JSDOM("<!doctype html><div id='root'></div>", { url: "https://yangdoujiao.com/zh/account" });
  const previous = Object.fromEntries(["window", "document", "fetch", "IntersectionObserver", "IS_REACT_ACT_ENVIRONMENT"].map(key => [key, globalThis[key]]));
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  globalThis.IntersectionObserver = class { observe() {} disconnect() {} };
  let identity = { authenticated: true, userId: 7, fullName: "权限测试", adviser: false, admin: false };
  let advanced = false;
  globalThis.fetch = async input => {
    const path = new URL(String(input), dom.window.location.origin).pathname;
    if (path === "/api/v1/auth/session") return Response.json(identity);
    if (path === "/api/v1/account") return identity.authenticated ? Response.json(profile) : new Response(null, { status: 401 });
    if (path.endsWith("/capabilities")) return identity.admin ? Response.json({ permanentDelete: advanced }) : new Response(null, { status: 403 });
    if (path === "/api/demo-session") return new Response(null, { status: 404 });
    throw new Error(`Unexpected request: ${path}`);
  };
  const container = dom.window.document.getElementById("root");
  const root = createRoot(container);
  const render = () => act(() => root.render(createElement("div", null,
    createElement(SiteHeader, { locale: "zh", signedIn: true }), createElement(AccountPanel, { locale: "zh" }),
    createElement(AdminAccountLink, { locale: "zh" }))));
  const refresh = () => act(async () => { for (const listener of [...listeners]) listener(); });
  const assertEntries = (admin, accounts) => {
    assert.equal(!!container.querySelector("nav a[href='/zh/admin']"), admin);
    assert.equal(!!container.querySelector(".account-panel a[href='/zh/admin']"), admin);
    assert.equal(!!container.querySelector("a[href='/zh/admin/accounts']"), accounts);
    assert.equal(!!container.querySelector("a[href*='/adviser/consultations']"), false, "admins must not be sent to adviser-only endpoints");
  };
  try {
    await render(); assertEntries(false, false);
    identity = { ...identity, admin: true, avatarUrl: "https://invalid.example/old-avatar" };
    await refresh(); assertEntries(true, false);
    await act(() => container.querySelector(".navigation-toggle").click());
    assert.equal(container.querySelector("nav").classList.contains("navigation-open"), true);
    assert.equal(container.querySelector("nav a[href='/zh/admin']").textContent, "管理后台");
    advanced = true;
    await refresh(); assertEntries(true, true);
    identity = { ...identity, admin: false }; advanced = false;
    await refresh(); assertEntries(false, false);
    identity = { authenticated: false, userId: null, fullName: null, adviser: false, admin: false };
    await refresh(); assertEntries(false, false);
    assert.ok(redirects.includes("/zh/login"));
    // A fresh login must restore the entry even after this tab observed revocation.
    identity = { authenticated: true, userId: 7, fullName: "权限测试", adviser: false, admin: true };
    await refresh(); assertEntries(true, false);
    await act(() => root.render(null));
    await render(); assertEntries(true, false); // Reload/mount preserves server identity.
  } finally {
    await act(() => root.unmount()); dom.window.close();
    for (const [key, value] of Object.entries(previous)) globalThis[key] = value;
    listeners.clear();
  }
});
