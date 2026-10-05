import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import test from "node:test";
import { parseEnv } from "./deployment-preflight.mjs";

const script = readFileSync(new URL("./deploy-production.sh", import.meta.url), "utf8");
const workflow = readFileSync(new URL("../.github/workflows/deploy-production.yml", import.meta.url), "utf8");

// Run the real deployment tail through bash stdin, replacing only external
// Docker/HTTP operations. The readiness double deliberately reads inherited
// stdin so this catches commands being swallowed, even with a successful exit.
function runDeploymentCommands({ source = script, runningServices = "frontend backend", failTag = "", consumeStdin = false } = {}) {
  const start = source.indexOf("\ndocker compose --env-file .env.production -f compose.production.yaml config --quiet\n");
  assert.notEqual(start, -1, "the deployment commands must be exercised");
  return spawnSync("bash", ["-s"], {
    encoding: "utf8",
    timeout: 5000,
    env: {
      ...process.env,
      DEPLOY_TEST_RUNNING_SERVICES: runningServices,
      DEPLOY_TEST_FAIL_TAG: failTag,
      DEPLOY_TEST_CONSUME_STDIN: String(consumeStdin),
    },
    input: `set -Eeuo pipefail
public_site_url=https://deploy.example.test
docker() {
  case "$1" in
    compose)
      [[ "$2 $3 $4 $5" == '--env-file .env.production -f compose.production.yaml' ]] || return 90
      shift 5
      case "$1" in
        config) [[ "$*" == 'config --quiet' ]] ;;
        ps)
          [[ "$2 $3 $4" == '--status running -q' ]] || return 90
          case " $DEPLOY_TEST_RUNNING_SERVICES " in
            *" $5 "*) printf '%s-container\\n' "$5" ;;
          esac ;;
        build)
          [[ "$*" == 'build --pull backend frontend' ]] || return 90
          printf 'build\\n' ;;
        up) printf 'up\\n' ;;
        exec)
          printf 'readiness\\n'
          if [[ $DEPLOY_TEST_CONSUME_STDIN == true ]]; then command cat >/dev/null; fi ;;
        *) return 90 ;;
      esac ;;
    container)
      [[ "$2 $3 $4" == 'inspect --format {{.Image}}' ]] || return 90
      case "$5" in
        frontend-container) printf 'sha256:frontend-running\\n' ;;
        backend-container) printf 'sha256:backend-running\\n' ;;
        *) return 90 ;;
      esac ;;
    image)
      [[ $2 == tag ]] || return 90
      [[ $4 != "$DEPLOY_TEST_FAIL_TAG" ]] || return 91
      printf 'tag %s %s\\n' "$3" "$4" ;;
    run)
      case "$*" in
        *'node scripts/launch-smoke.mjs https://deploy.example.test --public --wechat') printf 'launch-smoke\\n' ;;
        *) return 90 ;;
      esac ;;
    *) return 90 ;;
  esac
}
curl() {
  [[ "$*" == '--fail-with-body --silent --connect-timeout 10 --max-time 30 https://deploy.example.test/healthz' ]] || return 90
  printf 'healthz\\n'
}
${source.slice(start)}`,
  });
}

test("production CD waits for successful main CI and environment approval", () => {
  assert.match(workflow, /workflow_run:/);
  assert.match(workflow, /workflows: \["CI"\]/);
  assert.match(workflow, /branches: \[main\]/);
  assert.match(workflow, /github\.event\.workflow_run\.conclusion == 'success'/);
  assert.match(workflow, /github\.ref == 'refs\/heads\/main'/);
  assert.match(workflow, /environment:\s*\n\s*name: production/);
  assert.match(workflow, /cancel-in-progress: false/);
});

test("production CD accepts automatic releases only from repository push CI", () => {
  assert.match(workflow, /github\.event\.workflow_run\.event == 'push'/);
  assert.match(workflow, /github\.event_name == 'workflow_run'/);
});

test("production CD rejects automatic releases from other repositories", () => {
  assert.match(workflow, /github\.event\.workflow_run\.head_repository\.full_name == github\.repository/);
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
  assert.match(script, /exec -T --interactive=false backend curl --fail --silent --connect-timeout 10 --max-time 30[^\n]* < \/dev\/null/);
  assert.match(script, /\/healthz/);
  assert.match(script, /curl --fail-with-body --silent --connect-timeout 10 --max-time 30/);
  assert.match(script, /launch-smoke\.mjs "\$public_site_url" --public --wechat/);
  assert.doesNotMatch(script, /down --volumes|rm -v|\.env\.production.*cat/);
});

test("streamed deployment still runs public checks after a stdin-reading readiness child", () => {
  const unsafeSource = script.replace(" --interactive=false", "").replace(" < /dev/null", "");
  const unsafe = runDeploymentCommands({ source: unsafeSource, consumeStdin: true });
  assert.equal(unsafe.status, 0, unsafe.stderr);
  assert.match(unsafe.stdout, /readiness\n$/);
  assert.doesNotMatch(unsafe.stdout, /healthz|launch-smoke/, "the control must reproduce false success from swallowed commands");

  const isolated = runDeploymentCommands({ consumeStdin: true });
  assert.equal(isolated.status, 0, isolated.stderr);
  assert.match(isolated.stdout, /readiness\nhealthz\nlaunch-smoke\n$/, "both public checks must actually execute after readiness");
});

test("production deploy preserves both running image IDs under local rollback tags before building", () => {
  const result = runDeploymentCommands();
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(result.stdout.trim().split("\n").slice(0, 3), [
    "tag sha256:frontend-running udajo/frontend:production-rollback",
    "tag sha256:backend-running udajo/backend:production-rollback",
    "build",
  ]);
});

test("production deploy skips absent services when preserving rollback images", () => {
  for (const [runningServices, expectedTags] of [
    ["", []],
    ["frontend", ["tag sha256:frontend-running udajo/frontend:production-rollback"]],
    ["backend", ["tag sha256:backend-running udajo/backend:production-rollback"]],
  ]) {
    const result = runDeploymentCommands({ runningServices });
    assert.equal(result.status, 0, result.stderr);
    assert.deepEqual(result.stdout.trim().split("\n"), [...expectedTags, "build", "up", "readiness", "healthz", "launch-smoke"]);
  }
});

test("production deploy stops before building if a running image cannot be retained", () => {
  const result = runDeploymentCommands({ failTag: "udajo/backend:production-rollback" });
  assert.equal(result.status, 91, result.stderr);
  assert.doesNotMatch(result.stdout, /build|up|readiness|healthz|launch-smoke/);
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
