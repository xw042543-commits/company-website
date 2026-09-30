import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const nextConfig = readFileSync(new URL("../../next.config.ts", import.meta.url), "utf8");
const rootLayout = readFileSync(new URL("../app/layout.tsx", import.meta.url), "utf8");

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
