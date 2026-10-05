import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { parseEnv } from "./deployment-preflight.mjs";

const script = readFileSync(new URL("./deploy-production.sh", import.meta.url), "utf8");
const workflow = readFileSync(new URL("../.github/workflows/deploy-production.yml", import.meta.url), "utf8");

test("production CD waits for successful main CI and environment approval", () => {
  assert.match(workflow, /workflow_run:/);
  assert.match(workflow, /workflows: \["CI"\]/);
  assert.match(workflow, /branches: \[main\]/);
  assert.match(workflow, /github\.event\.workflow_run\.conclusion == 'success'/);
  assert.match(workflow, /github\.ref == 'refs\/heads\/main'/);
  assert.match(workflow, /environment:\s*\n\s*name: production/);
  assert.match(workflow, /cancel-in-progress: false/);
});

test("production CD verifies SSH identity and streams the exact release script", () => {
  for (const secret of [
    "PRODUCTION_SSH_HOST",
    "PRODUCTION_SSH_PORT",
    "PRODUCTION_SSH_USER",
    "PRODUCTION_SSH_PRIVATE_KEY",
    "PRODUCTION_SSH_KNOWN_HOSTS",
  ]) assert.match(workflow, new RegExp(`secrets\\.${secret}`));
  assert.match(workflow, /StrictHostKeyChecking=yes/);
  assert.match(workflow, /actions\/checkout@v7/);
  assert.match(workflow, /ref: \$\{\{ steps\.release\.outputs\.sha \}\}/);
  assert.match(workflow, /bash -s -- '\$release_sha'/);
  assert.match(workflow, /< scripts\/deploy-production\.sh/);
  assert.doesNotMatch(workflow, /StrictHostKeyChecking=no|sshpass|password=/);
});

test("production deploy validates and advances to the exact release SHA", () => {
  assert.match(script, /\[\[ \$release_sha =~ \^\[0-9a-f\]\{40\}\$ \]\]/);
  assert.match(script, /git diff --quiet/);
  assert.match(script, /git diff --cached --quiet/);
  assert.match(script, /git fetch --prune origin main/);
  assert.match(script, /git rev-parse origin\/main/);
  assert.match(script, /git merge --ff-only "\$release_sha"/);
  assert.doesNotMatch(script, /reset --hard|checkout -f|clean -f/);
});

test("production deploy validates configuration, health, and public launch", () => {
  assert.match(script, /deployment-preflight\.mjs \.env\.production/);
  assert.match(script, /parseEnv\(fs\.readFileSync\("\.env\.production", "utf8"\)\)\.PUBLIC_SITE_URL/);
  assert.ok(script.indexOf("[[ $public_site_url == https://* ]]") < script.indexOf("build --pull backend frontend"));
  assert.match(script, /compose\.production\.yaml config --quiet/);
  assert.match(script, /compose\.production\.yaml build --pull backend frontend/);
  assert.match(script, /up -d --wait --wait-timeout 300/);
  assert.match(script, /actuator\/health\/readiness/);
  assert.match(script, /exec -T backend curl --fail --silent --connect-timeout 10 --max-time 30/);
  assert.match(script, /\/healthz/);
  assert.match(script, /curl --fail-with-body --silent --connect-timeout 10 --max-time 30/);
  assert.match(script, /launch-smoke\.mjs "\$public_site_url" --public --wechat/);
  assert.doesNotMatch(script, /down --volumes|rm -v|\.env\.production.*cat/);
});

test("production URL normalization accepts quoted and CRLF environment values", () => {
  assert.equal(
    parseEnv('PUBLIC_SITE_URL="https://yangdoujiao.com"\n').PUBLIC_SITE_URL,
    "https://yangdoujiao.com",
  );
  assert.equal(
    parseEnv('PUBLIC_SITE_URL="https://yangdoujiao.com"\r\nPUBLIC_INDEXING_ENABLED=false\r\n').PUBLIC_SITE_URL,
    "https://yangdoujiao.com",
  );
});
