import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const nextConfig = readFileSync(new URL("../../next.config.ts", import.meta.url), "utf8");
const rootLayout = readFileSync(new URL("../app/layout.tsx", import.meta.url), "utf8");
const localeLayout = readFileSync(new URL("../app/[locale]/layout.tsx", import.meta.url), "utf8");
const localizedHome = readFileSync(new URL("../app/[locale]/page.tsx", import.meta.url), "utf8");
const rootHome = readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");
const publicHome = readFileSync(new URL("../components/public-home.tsx", import.meta.url), "utf8");

test("produces a standalone Next.js server for container deployment", () => {
  assert.match(nextConfig, /output:\s*["']standalone["']/);
});

test("applies the private-preview browser security header baseline", () => {
  for (const header of [
    "X-Content-Type-Options",
    "X-Frame-Options",
    "Referrer-Policy",
    "Permissions-Policy",
    "Strict-Transport-Security",
  ]) {
    assert.match(nextConfig, new RegExp(header));
  }
  assert.match(nextConfig, /source:\s*["']\/\(\.\*\)["']/);
});

test("gates search indexing through an explicit server-side launch flag", () => {
  assert.match(rootLayout, /resolvePublicIndexing\(process\.env\)/);
  assert.match(rootLayout, /generateMetadata/);
  assert.match(rootLayout, /export const dynamic = ["']force-dynamic["']/);
  assert.doesNotMatch(rootLayout, /robots:\s*\{\s*index:\s*true/);
});

test("publishes localized brand metadata for 洋豆角留学 and 洋豆角教育 searches", () => {
  assert.match(rootLayout, /洋豆角留学｜留学规划与院校查询/);
  assert.match(rootLayout, /洋豆角教育/);
  assert.doesNotMatch(localeLayout, /canonical:/);
  assert.match(localizedHome, /generateMetadata/);
  assert.match(localizedHome, /alternates:\s*\{/);
  assert.match(localizedHome, /canonical:/);
  assert.match(localizedHome, /"zh-CN":/);
  assert.match(localizedHome, /"x-default":/);
});

test("domain root renders the public homepage and owns the brand structured data", () => {
  assert.match(rootHome, /<PublicHome locale="zh"/);
  assert.match(rootHome, /if \(signedIn\) redirect\("\/zh"\)/);
  assert.match(rootHome, /application\/ld\+json/);
  assert.match(rootHome, /"WebSite"/);
  assert.match(rootHome, /"Organization"/);
  assert.match(rootHome, /name:\s*"洋豆角留学"/);
  assert.match(rootHome, /alternateName:\s*\["洋豆角教育",\s*"洋豆角",\s*"UDAJO"\]/);
  assert.doesNotMatch(publicHome, /application\/ld\+json/);
});
