# Production CD Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a GitHub Environment-gated CD workflow that deploys the exact successful `main` commit to `/opt/company-website` and verifies the live production topology without exposing secrets or deleting data.

**Architecture:** A dedicated GitHub Actions workflow consumes the successful completion event from the existing `CI` workflow and pauses at the `production` Environment approval boundary. After approval it checks out the exact release SHA, establishes a host-key-verified SSH connection, and streams that release's repository-owned Bash script to the server. The script performs exact-SHA validation, safe fast-forward update, production preflight, Compose update, readiness checks, and public smoke tests. Streaming the script avoids a first-deployment bootstrap dependency on a copy already present in the server checkout.

**Tech Stack:** GitHub Actions YAML, OpenSSH, Bash, Docker Compose v2, Node.js 24 container, Node.js built-in test runner.

**Spec:** `docs/superpowers/specs/2026-10-05-production-cd-design.md`

## Global Constraints

- Deploy only after the existing `CI` workflow succeeds for `main`, or after an explicit manual workflow dispatch.
- Require approval through the GitHub Environment named `production` before exposing production secrets or opening SSH.
- Never disable SSH host-key checking; require `PRODUCTION_SSH_KNOWN_HOSTS`.
- Deploy the exact triggering commit SHA and require the remote `origin/main` to match it.
- Reject tracked server changes; never use `git reset --hard` or force checkout.
- Preserve `/opt/company-website/.env.production` and every named Docker volume.
- Never print `.env.production`, SSH private keys, API keys, passwords, or tokens.
- Do not attempt automatic database rollback.
- Use a non-cancelling production concurrency group.

---

### Task 1: Remote production deployment script

**Files:**
- Create: `scripts/deploy-production.sh`
- Create: `scripts/deployment-cd.test.mjs`

**Interfaces:**
- Consumes: one positional argument, the full 40-character release SHA; existing `.env.production`, `compose.production.yaml`, `scripts/deployment-preflight.mjs`, and `scripts/launch-smoke.mjs` on the server.
- Produces: `scripts/deploy-production.sh <release-sha>`, returning zero only after preflight, update, readiness, and public smoke checks pass.

- [ ] **Step 1: Write failing deployment-script contract tests**

Create `scripts/deployment-cd.test.mjs` with assertions that read `scripts/deploy-production.sh` and require:

```js
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const script = readFileSync(new URL("./deploy-production.sh", import.meta.url), "utf8");

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
  assert.match(script, /compose\.production\.yaml config --quiet/);
  assert.match(script, /compose\.production\.yaml build --pull backend frontend/);
  assert.match(script, /up -d --wait --wait-timeout 300/);
  assert.match(script, /actuator\/health\/readiness/);
  assert.match(script, /\/healthz/);
  assert.match(script, /launch-smoke\.mjs "\$public_site_url" --public --wechat/);
  assert.doesNotMatch(script, /down --volumes|rm -v|\.env\.production.*cat/);
});
```

- [ ] **Step 2: Run the tests and verify RED**

Run: `node --test scripts/deployment-cd.test.mjs`

Expected: FAIL because `scripts/deploy-production.sh` does not exist.

- [ ] **Step 3: Implement the safe remote script**

Create an executable `scripts/deploy-production.sh` that:

```bash
#!/usr/bin/env bash
set -Eeuo pipefail

release_sha="${1:-}"
[[ $release_sha =~ ^[0-9a-f]{40}$ ]] || { echo "A full release SHA is required" >&2; exit 64; }

cd /opt/company-website
test -f .env.production || { echo ".env.production is missing" >&2; exit 65; }

show_failure_context() {
  docker compose --env-file .env.production -f compose.production.yaml ps || true
  docker compose --env-file .env.production -f compose.production.yaml logs --no-color --tail=200 caddy frontend backend || true
}
trap show_failure_context ERR

git diff --quiet
git diff --cached --quiet
git fetch --prune origin main
remote_sha="$(git rev-parse origin/main)"
[[ $remote_sha == "$release_sha" ]] || { echo "Release SHA is not current origin/main" >&2; exit 66; }
git checkout main
git merge --ff-only "$release_sha"
[[ $(git rev-parse HEAD) == "$release_sha" ]] || { echo "Server checkout does not match release SHA" >&2; exit 67; }

docker run --rm -v "$PWD:/app:ro" -w /app node:24-bookworm-slim node scripts/deployment-preflight.mjs .env.production
docker compose --env-file .env.production -f compose.production.yaml config --quiet
docker compose --env-file .env.production -f compose.production.yaml build --pull backend frontend
docker compose --env-file .env.production -f compose.production.yaml up -d --wait --wait-timeout 300
docker compose --env-file .env.production -f compose.production.yaml exec -T backend curl --fail --silent --header 'X-Forwarded-Proto: https' http://127.0.0.1:8080/actuator/health/readiness
public_site_url="$(sed -n 's/^PUBLIC_SITE_URL=//p' .env.production)"
[[ $public_site_url == https://* ]] || { echo "PUBLIC_SITE_URL must be HTTPS" >&2; exit 68; }
curl --fail-with-body --silent "$public_site_url/healthz"
docker run --rm -v "$PWD:/app:ro" -w /app node:24-bookworm-slim node scripts/launch-smoke.mjs "$public_site_url" --public --wechat
```

Use `chmod +x scripts/deploy-production.sh`.

- [ ] **Step 4: Verify GREEN and shell syntax**

Run:

```bash
node --test scripts/deployment-cd.test.mjs
bash -n scripts/deploy-production.sh
```

Expected: all tests pass and `bash -n` exits zero.

- [ ] **Step 5: Commit Task 1**

```bash
git add scripts/deploy-production.sh scripts/deployment-cd.test.mjs
git commit -m "feat: add safe production deployment script"
```

---

### Task 2: GitHub Environment-gated workflow

**Files:**
- Create: `.github/workflows/deploy-production.yml`
- Modify: `scripts/deployment-cd.test.mjs`
- Modify: `.github/workflows/ci.yml`
- Modify: `scripts/deployment-ci.test.mjs`

**Interfaces:**
- Consumes: successful `CI` workflow completion on `main`, manual dispatch on `main`, and five `production` Environment secrets.
- Produces: one serialized, approval-gated production deployment invoking `scripts/deploy-production.sh` with the exact release SHA.

- [ ] **Step 1: Add failing workflow contract tests**

Extend `scripts/deployment-cd.test.mjs` to read `.github/workflows/deploy-production.yml` and assert:

```js
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
```

Also extend `scripts/deployment-ci.test.mjs` to require `deployment-cd.test.mjs` in the deployment contract command.

- [ ] **Step 2: Run tests and verify RED**

Run:

```bash
node --test scripts/deployment-cd.test.mjs scripts/deployment-ci.test.mjs
```

Expected: FAIL because the workflow is absent and CI does not yet include the CD contract test.

- [ ] **Step 3: Implement the workflow and CI contract hook**

Create `.github/workflows/deploy-production.yml` with:

```yaml
name: Deploy production

on:
  workflow_run:
    workflows: ["CI"]
    branches: [main]
    types: [completed]
  workflow_dispatch:

concurrency:
  group: production-deployment
  cancel-in-progress: false

permissions:
  contents: read

jobs:
  deploy:
    if: >-
      (github.event_name == 'workflow_dispatch' && github.ref == 'refs/heads/main') ||
      github.event.workflow_run.conclusion == 'success'
    runs-on: ubuntu-latest
    timeout-minutes: 30
    environment:
      name: production
      url: https://yangdoujiao.com
```

The steps must select the release SHA from the event, validate it as 40 lowercase hexadecimal characters, expose it as the `release` step's `sha` output, check out that exact SHA with `actions/checkout@v7`, write the private key and known-hosts secret to `RUNNER_TEMP` with mode `600`, and stream the checked-out release's deployment script to the server:

```bash
ssh -i "$RUNNER_TEMP/production_deploy_key" \
  -o BatchMode=yes \
  -o IdentitiesOnly=yes \
  -o StrictHostKeyChecking=yes \
  -o UserKnownHostsFile="$RUNNER_TEMP/production_known_hosts" \
  -p "$PRODUCTION_SSH_PORT" \
  "$PRODUCTION_SSH_USER@$PRODUCTION_SSH_HOST" \
  "bash -s -- '$release_sha'" \
  < scripts/deploy-production.sh
```

The streamed script itself changes to `/opt/company-website` before touching Git or Compose. This makes the first rollout work even though the server's pre-deployment checkout cannot yet contain the new script.

Add `scripts/deployment-cd.test.mjs` to the deployment-contract `node --test` command in `.github/workflows/ci.yml` and its expected-file list in `scripts/deployment-ci.test.mjs`.

- [ ] **Step 4: Verify workflow contracts pass**

Run:

```bash
node --test scripts/deployment-cd.test.mjs scripts/deployment-ci.test.mjs
```

Expected: all tests pass.

- [ ] **Step 5: Commit Task 2**

```bash
git add .github/workflows/deploy-production.yml .github/workflows/ci.yml scripts/deployment-cd.test.mjs scripts/deployment-ci.test.mjs
git commit -m "ci: gate production deployment after successful main checks"
```

---

### Task 3: Operator setup and complete verification

**Files:**
- Modify: `docs/DEPLOYMENT.md`
- Modify: `scripts/deployment-documentation.test.mjs`

**Interfaces:**
- Consumes: the workflow and script from Tasks 1–2.
- Produces: exact GitHub Environment setup instructions and a complete contract regression run.

- [ ] **Step 1: Add failing documentation assertions**

Extend `scripts/deployment-documentation.test.mjs` to assert that `docs/DEPLOYMENT.md` contains:

```js
for (const value of [
  "production Environment",
  "required reviewers",
  "PRODUCTION_SSH_HOST",
  "PRODUCTION_SSH_PORT",
  "PRODUCTION_SSH_USER",
  "PRODUCTION_SSH_PRIVATE_KEY",
  "PRODUCTION_SSH_KNOWN_HOSTS",
  "ssh-keyscan",
  "/opt/company-website",
]) assert.match(document, new RegExp(value));
assert.match(document, /Never disable SSH host-key checking/);
```

- [ ] **Step 2: Run the documentation test and verify RED**

Run: `node --test scripts/deployment-documentation.test.mjs`

Expected: FAIL because the operator setup is not documented.

- [ ] **Step 3: Document initial Environment and server setup**

Add a “GitHub production CD” section to `docs/DEPLOYMENT.md` covering:

- creation of the `production` Environment and required reviewers;
- all five secret names and their exact purpose;
- creation of a dedicated deploy key and installation of only its public key in the deploy user’s `authorized_keys`;
- obtaining the server host key with `ssh-keyscan -p <port> <host>` and verifying its fingerprint against the VPS control panel before saving it;
- ensuring the deploy user can fast-forward `/opt/company-website` and run Docker without interactive prompts;
- preserving server-only `.env.production`;
- approving and observing the first deployment;
- diagnosing failed runs with the automatically captured Compose status/logs;
- manual recovery using the existing rollback section, without deleting volumes.

- [ ] **Step 4: Run complete deployment verification**

Run:

```bash
node --test scripts/deployment-preflight.test.mjs scripts/deployment-artifacts.test.mjs scripts/deployment-compose.test.mjs scripts/deployment-ci.test.mjs scripts/deployment-cd.test.mjs scripts/deployment-documentation.test.mjs scripts/launch-smoke.test.mjs
bash -n scripts/deploy-production.sh
docker compose --env-file deploy/.env.production.example -f compose.production.yaml config --quiet
git diff --check
```

Expected: every test and syntax/configuration check passes.

- [ ] **Step 5: Commit Task 3**

```bash
git add docs/DEPLOYMENT.md scripts/deployment-documentation.test.mjs
git commit -m "docs: add production CD setup runbook"
```

---

### Task 4: Final review and handoff

**Files:**
- Review only: all files changed since `origin/main`.

**Interfaces:**
- Consumes: completed Tasks 1–3.
- Produces: a review-ready branch and a precise list of GitHub settings the owner must configure.

- [ ] **Step 1: Review the branch diff for secret and destructive-operation risks**

Run:

```bash
git diff --check origin/main...HEAD
git diff origin/main...HEAD -- .github/workflows/deploy-production.yml scripts/deploy-production.sh docs/DEPLOYMENT.md
rg -n "StrictHostKeyChecking=no|sshpass|reset --hard|down --volumes|cat .*\.env\.production" .github/workflows/deploy-production.yml scripts/deploy-production.sh docs/DEPLOYMENT.md
```

Expected: the first two checks are clean and the forbidden-pattern search returns no matches.

- [ ] **Step 2: Re-run the complete verification suite**

Run the same commands from Task 3 Step 4.

Expected: zero failures.

- [ ] **Step 3: Prepare the integration choice**

Report the branch name, commit list, passing checks, and the five required Environment secrets. Do not create repository secrets, upload private keys, configure reviewers, merge, or trigger production without the owner’s explicit authorization at the relevant step.
