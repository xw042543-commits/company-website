import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function read(path) {
  return readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
}

test("deployment runbook covers validation, startup, checks, immutable updates, and rollback", () => {
  const document = read("docs/DEPLOYMENT.md");
  for (const pattern of [
    /deployment-preflight\.mjs/,
    /docker compose[^\n]*config --quiet/,
    /docker compose[^\n]*up -d[^\n]*--wait/,
    /actuator\/health\/readiness/,
    /smoke check/i,
    /database migration/i,
    /immutable/i,
    /rollback/i,
    /launch-smoke\.mjs/,
  ]) assert.match(document, pattern);
  assert.match(document, /Database rollback is never automatic/i);
  assert.match(document, /Caddy/);
  assert.match(document, /automatic HTTPS/i);
  assert.match(document, /ports 80 and 443/i);
  assert.match(document, /frontend:3000/);
  assert.match(document, /X-Forwarded-Proto/);
  assert.match(document, /X-Forwarded-For/);
  assert.match(document, /remove[^\n]*client[^\n]*forwarded headers/i);
});

test("production CD runbook covers operator setup and SSH host verification", () => {
  const document = read("docs/DEPLOYMENT.md");
  for (const value of [
    "production Environment",
    "Run workflow",
    "PRODUCTION_SSH_HOST",
    "PRODUCTION_SSH_PORT",
    "PRODUCTION_SSH_USER",
    "PRODUCTION_SSH_PRIVATE_KEY",
    "PRODUCTION_SSH_KNOWN_HOSTS",
    "ssh-keyscan",
    "/opt/company-website",
  ]) assert.match(document, new RegExp(value));
  assert.doesNotMatch(document, /required reviewers/i);
  assert.match(document, /manual approval/i);
  assert.match(document, /Never disable SSH host-key checking/);
});

test("production setup requires empty git status output before the first deployment", () => {
  const document = read("docs/DEPLOYMENT.md");
  assert.match(document, /[Rr]equire empty output from `git -C \/opt\/company-website status --short`/);
});

test("host-build recovery uses the previous local images without building or pulling", () => {
  const document = read("docs/DEPLOYMENT.md");
  const recovery = document.split("## Update and application rollback\n")[1]?.split("\n## ")[0];
  assert.ok(recovery, "the application rollback procedure must exist");
  assert.match(recovery, /FRONTEND_IMAGE=udajo\/frontend:production-rollback/);
  assert.match(recovery, /BACKEND_IMAGE=udajo\/backend:production-rollback/);
  assert.match(recovery, /docker image inspect udajo\/frontend:production-rollback udajo\/backend:production-rollback/);
  assert.match(recovery, /up -d --no-build --wait --wait-timeout 300 --pull never/);
  assert.doesNotMatch(recovery, /docker compose[^\n]*\bpull frontend backend|down --volumes|rm -v/);
  assert.match(recovery, /only the immediately previous application release/i);
  assert.match(recovery, /local tags[^\n]*not being pruned/i);
  assert.match(recovery, /Never delete named volumes/i);
});

test("recovery runbook covers PostgreSQL rehearsal and derived-service recovery", () => {
  const document = read("docs/BACKUP_AND_RESTORE.md");
  for (const pattern of [
    /pg_dump/,
    /pg_restore --list/,
    /isolated restore/i,
    /Elasticsearch rebuild/i,
    /Redis cache recovery/i,
    /destructive/i,
  ]) assert.match(document, pattern);
});

test("public launch checklist covers every external production gate", () => {
  const document = read("docs/PUBLIC_LAUNCH_CHECKLIST.md");
  for (const phrase of ["domain", "HTTPS", "monitoring", "privacy", "real authentication", "email", "SMS", "WeChat", "SEO"]) {
    assert.match(document, new RegExp(phrase, "i"));
  }
});

test("README links all private-preview deployment runbooks", () => {
  const readme = read("README.md");
  assert.match(readme, /private preview/i);
  for (const path of ["docs/DEPLOYMENT.md", "docs/BACKUP_AND_RESTORE.md", "docs/PUBLIC_LAUNCH_CHECKLIST.md"]) {
    assert.match(readme, new RegExp(path.replaceAll(".", "\\.")));
  }
});
