import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function read(relativePath) {
  return readFileSync(new URL(`../${relativePath}`, import.meta.url), "utf8");
}

test("frontend image uses a locked multi-stage Node 24 standalone build as non-root", () => {
  const dockerfile = read("frontend/Dockerfile");
  assert.match(dockerfile, /FROM node:24[^\n]* AS deps/i);
  assert.match(dockerfile, /FROM node:24[^\n]* AS builder/i);
  assert.match(dockerfile, /npm ci/);
  assert.match(dockerfile, /\.next\/standalone/);
  assert.match(dockerfile, /USER node/);
  assert.match(dockerfile, /EXPOSE 3000/);
  assert.doesNotMatch(dockerfile, /COPY .*\.env/);
});

test("backend image uses the Maven Wrapper and a non-root Java 21 runtime", () => {
  const dockerfile = read("backend/Dockerfile");
  assert.match(dockerfile, /FROM maven:[^\n]*21[^\n]* AS builder/i);
  assert.match(dockerfile, /\.\/mvnw[^\n]*package/);
  assert.match(dockerfile, /FROM eclipse-temurin:21[^\n]* AS runtime/i);
  assert.match(dockerfile, /USER app/);
  assert.match(dockerfile, /EXPOSE 8080/);
  assert.doesNotMatch(dockerfile, /COPY .*\.env/);
});

test("docker build contexts exclude dependencies, outputs, secrets, and VCS data", () => {
  const frontendIgnore = read("frontend/.dockerignore");
  const backendIgnore = read("backend/.dockerignore");
  for (const entry of ["node_modules", ".next", ".env", ".git"]) assert.match(frontendIgnore, new RegExp(entry.replace(".", "\\.")));
  for (const entry of ["target", ".env", ".git"]) assert.match(backendIgnore, new RegExp(entry.replace(".", "\\.")));
});

test("Caddy automatically serves the canonical domain without trusting client forwarding headers", () => {
  const caddyfile = read("deploy/Caddyfile");
  assert.match(caddyfile, /\{\$CADDY_SITE_ADDRESSES\}/);
  assert.match(caddyfile, /@www host www\.yangdoujiao\.com/);
  assert.match(caddyfile, /redir @www https:\/\/yangdoujiao\.com\{uri\} permanent/);
  assert.match(caddyfile, /reverse_proxy frontend:3000/);
  assert.match(caddyfile, /header_up -Forwarded/);
  assert.match(caddyfile, /header_up -X-Forwarded-\*/);
  assert.match(caddyfile, /header_up -X-Real-IP/);
  assert.match(caddyfile, /header_up X-Forwarded-Proto https/);
  assert.match(caddyfile, /header_up X-Forwarded-For \{remote_host\}/);
});

test("signed community review media bypasses the Next.js proxy", () => {
  const caddyfile = read("deploy/Caddyfile");
  const mediaMatcher = caddyfile.indexOf("@communityReviewMedia path /api/v1/community/image-review/media/*");
  const backendProxy = caddyfile.indexOf("reverse_proxy @communityReviewMedia backend:8080");
  const frontendProxy = caddyfile.indexOf("reverse_proxy frontend:3000");

  assert.ok(mediaMatcher >= 0, "the signed review media path needs a dedicated matcher");
  assert.ok(backendProxy > mediaMatcher, "the signed review media path needs a direct backend proxy");
  assert.ok(frontendProxy > backendProxy, "the direct media route must be handled before the frontend proxy");
});

test("community review media access diagnostics expose no signed URL or client metadata", () => {
  const caddyfile = read("deploy/Caddyfile");
  assert.match(caddyfile, /log default \{[\s\S]*?exclude http\.log\.error\.review_media[\s\S]*?\}/);
  assert.match(caddyfile, /log review_media_errors \{[\s\S]*?include http\.log\.error\.review_media[\s\S]*?request>uri replace \/api\/v1\/community\/image-review\/media\/REDACTED[\s\S]*?request>headers delete[\s\S]*?request>remote_ip delete[\s\S]*?request>client_ip delete[\s\S]*?\}/);
  assert.match(caddyfile, /log review_media \{[\s\S]*?no_hostname[\s\S]*?request>uri replace \/api\/v1\/community\/image-review\/media\/REDACTED[\s\S]*?request>headers delete[\s\S]*?request>remote_ip delete[\s\S]*?request>client_ip delete[\s\S]*?\}/);
  assert.match(caddyfile, /log_name @communityReviewMedia review_media/);
});
