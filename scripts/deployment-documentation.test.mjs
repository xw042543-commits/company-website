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
  ]) assert.match(document, pattern);
  assert.match(document, /Database rollback is never automatic/i);
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
