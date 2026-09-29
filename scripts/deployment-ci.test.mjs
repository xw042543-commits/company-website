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
