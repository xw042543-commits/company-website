import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const workflow = readFileSync(new URL("../.github/workflows/ci.yml", import.meta.url), "utf8");

test("frontend CI uses the server-only API base URL", () => {
  assert.match(workflow, /API_BASE_URL: http:\/\/backend:8080/);
  assert.doesNotMatch(workflow, /NEXT_PUBLIC_API_BASE_URL/);
});

test("CI validates deployment contracts and Compose configuration", () => {
  assert.match(workflow, /^  deployment:/m);
  assert.match(workflow, /^\s+PUBLIC_INDEXING_ENABLED=false$/m);
  for (const file of [
    "deployment-preflight.test.mjs",
    "deployment-artifacts.test.mjs",
    "deployment-compose.test.mjs",
    "deployment-ci.test.mjs",
    "deployment-documentation.test.mjs",
  ]) assert.match(workflow, new RegExp(`scripts/${file.replaceAll(".", "\\.")}`));
  assert.match(workflow, /node scripts\/deployment-preflight\.mjs/);
  assert.match(workflow, /docker compose[^\n]*compose\.production\.yaml[^\n]*config --quiet/);
});

test("CI builds both production images", () => {
  assert.match(workflow, /docker build --tag udajo\/frontend:ci frontend/);
  assert.match(workflow, /docker build --tag udajo\/backend:ci backend/);
});

test("CI starts and probes the production topology before cleanup", () => {
  assert.match(workflow, /PUBLIC_SITE_URL=https:\/\/preview\.yangdoujiao\.com/);
  assert.match(workflow, /CORS_ALLOWED_ORIGINS=https:\/\/preview\.yangdoujiao\.com/);
  assert.match(workflow, /APP_AUTH_PUBLIC_SITE_ORIGIN=https:\/\/preview\.yangdoujiao\.com/);
  assert.match(workflow, /FRONTEND_IMAGE=udajo\/frontend:ci/);
  assert.match(workflow, /BACKEND_IMAGE=udajo\/backend:ci/);
  assert.match(workflow, /compose\.production\.yaml[^\n]*up -d --no-build --wait/);
  assert.match(workflow, /X-Forwarded-Proto: https/);
  assert.match(workflow, /--fail-with-body[^\n]*3000\/healthz/);
  assert.doesNotMatch(workflow, /3000\/zh\/universities/);
  assert.match(workflow, /api\/v1\/auth\/providers/);
  assert.match(workflow, /if: always\(\)/);
  assert.match(workflow, /compose\.production\.yaml[^\n]*down --volumes/);
});
