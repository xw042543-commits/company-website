import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import test from "node:test";

import { parseEnv } from "./deployment-preflight.mjs";

const compose = readFileSync(new URL("../compose.production.yaml", import.meta.url), "utf8").replace(/\r\n/g, "\n");

function renderedBackend(overrides = {}) {
  const rendered = execFileSync("docker", ["compose", "--env-file", ".env.example", "-f", "compose.production.yaml", "config", "--format", "json"], {
    cwd: new URL("../", import.meta.url),
    env: {
      PATH: process.env.PATH,
      APP_COMMUNITY_CURSOR_SECRET: "synthetic-compose-cursor-key-at-least-32-bytes",
      PUBLIC_SITE_URL: "https://preview.example.test", CORS_ALLOWED_ORIGINS: "https://preview.example.test",
      APP_AUTH_PUBLIC_SITE_ORIGIN: "https://preview.example.test",
      CADDY_SITE_ADDRESSES: ":80", CADDY_ACME_EMAIL: "ci@example.test",
      DEPLOYMENT_NETWORK_SUBNET: "172.30.0.0/24", CADDY_INTERNAL_IP: "172.30.0.5",
      FRONTEND_INTERNAL_IP: "172.30.0.10", BACKEND_INTERNAL_IP: "172.30.0.20",
      ...overrides,
    },
    encoding: "utf8",
  });
  return JSON.parse(rendered).services.backend.environment;
}

test("rendered Compose disables safety by default and applies bounded timeout and retry defaults", () => {
  const backend = renderedBackend();
  assert.equal(backend.APP_COMMUNITY_ENABLED, "false");
  assert.equal(backend.APP_COMMUNITY_IMAGES_ENABLED, "false");
  assert.equal(backend.APP_COMMUNITY_IMAGES_REVIEW_ENABLED, "false");
  assert.equal(backend.APP_COMMUNITY_CONTENT_SAFETY_ENABLED, "false");
  assert.equal(backend.APP_COMMUNITY_CONTENT_SAFETY_REQUEST_TIMEOUT, "2s");
  assert.equal(backend.APP_COMMUNITY_CONTENT_SAFETY_MAXIMUM_ATTEMPTS, "2");
  assert.equal(backend.APP_COMMUNITY_CONTENT_SAFETY_ACCESS_TOKEN_ENDPOINT, "https://api.weixin.qq.com/cgi-bin/token");
  assert.equal(backend.APP_COMMUNITY_CONTENT_SAFETY_MESSAGE_CHECK_ENDPOINT, "https://api.weixin.qq.com/wxa/msg_sec_check");
});

test("rendered Compose forwards owned safety settings and shares miniapp credentials without local auth", () => {
  const backend = renderedBackend({
    APP_COMMUNITY_CONTENT_SAFETY_ENABLED: "true", APP_COMMUNITY_CONTENT_SAFETY_REQUEST_TIMEOUT: "3s",
    APP_COMMUNITY_CONTENT_SAFETY_MAXIMUM_ATTEMPTS: "1", APP_MINIAPP_AUTH_ENABLED: "true",
    APP_MINIAPP_WECHAT_APP_ID: "wx-ci-only-miniapp", APP_MINIAPP_WECHAT_APP_SECRET: "synthetic-ci-only-secret",
    APP_MINIAPP_LOCAL_PROVIDER_ENABLED: "true",
  });
  assert.equal(backend.APP_COMMUNITY_CONTENT_SAFETY_ENABLED, "true");
  assert.equal(backend.APP_COMMUNITY_CONTENT_SAFETY_REQUEST_TIMEOUT, "3s");
  assert.equal(backend.APP_COMMUNITY_CONTENT_SAFETY_MAXIMUM_ATTEMPTS, "1");
  assert.equal(backend.APP_MINIAPP_WECHAT_APP_SECRET, "synthetic-ci-only-secret");
  assert.equal(backend.APP_MINIAPP_LOCAL_PROVIDER_ENABLED, "false");
});

test("checked-in environment examples contain no credentials, cursor key or sample moderation rules", () => {
  for (const name of [".env.example", "deploy/.env.production.example"]) {
    const example = parseEnv(readFileSync(new URL(`../${name}`, import.meta.url), "utf8"));
    for (const variable of ["APP_MINIAPP_WECHAT_APP_ID", "APP_MINIAPP_WECHAT_APP_SECRET", "APP_COMMUNITY_CURSOR_SECRET",
      "APP_COMMUNITY_REVIEW_TERMS", "APP_COMMUNITY_REJECT_TERMS"]) assert.equal(example[variable], "", `${name}: ${variable}`);
    assert.equal(example.APP_COMMUNITY_CONTENT_SAFETY_ENABLED, "false");
  }
});

function serviceBlock(name) {
  const match = compose.match(new RegExp(`^  ${name}:\\n([\\s\\S]*?)(?=^  [a-z][a-z0-9_-]*:|^volumes:|^networks:|(?![\\s\\S]))`, "m"));
  assert.ok(match, `missing ${name} service`);
  return match[1];
}

test("production topology includes all required services with health checks", () => {
  for (const name of ["caddy", "frontend", "backend", "postgres", "redis", "elasticsearch"]) {
    assert.match(serviceBlock(name), /^    healthcheck:/m, `${name} needs a health check`);
    assert.match(serviceBlock(name), /^    restart: unless-stopped/m, `${name} needs a restart policy`);
  }
});

test("production data services preserve the project-pinned versions", () => {
  assert.match(serviceBlock("caddy"), /image: caddy:2\.11\.4-alpine/);
  assert.match(serviceBlock("postgres"), /image: postgres:17\.11/);
  assert.match(serviceBlock("redis"), /image: redis:8\.2\.9/);
  assert.match(serviceBlock("elasticsearch"), /image: docker\.elastic\.co\/elasticsearch\/elasticsearch:9\.4\.5/);
});

test("only Caddy publishes the public HTTP and HTTPS ports", () => {
  const caddy = serviceBlock("caddy");
  assert.match(caddy, /^    ports:/m);
  assert.match(caddy, /"80:80"/);
  assert.match(caddy, /"443:443"/);
  assert.match(caddy, /"443:443\/udp"/);
  for (const name of ["frontend", "backend", "postgres", "redis", "elasticsearch"]) {
    assert.doesNotMatch(serviceBlock(name), /^    ports:/m, `${name} must remain private`);
  }
});

test("Caddy terminates HTTPS and waits for the private frontend", () => {
  const caddy = serviceBlock("caddy");
  assert.match(caddy, /CADDY_SITE_ADDRESSES: \$\{CADDY_SITE_ADDRESSES\}/);
  assert.match(caddy, /CADDY_ACME_EMAIL: \$\{CADDY_ACME_EMAIL\}/);
  assert.match(caddy, /\.\/deploy\/Caddyfile:\/etc\/caddy\/Caddyfile:ro/);
  assert.match(caddy, /caddy-data:\/data/);
  assert.match(caddy, /caddy-config:\/config/);
  assert.match(caddy, /frontend:\n\s+condition: service_healthy/);
  assert.match(caddy, /frontend-backend:\n\s+ipv4_address: \$\{CADDY_INTERNAL_IP\}/);
});

test("frontend and backend wait for healthy dependencies and use production configuration", () => {
  const frontend = serviceBlock("frontend");
  const backend = serviceBlock("backend");
  assert.match(frontend, /API_BASE_URL: http:\/\/backend:8080/);
  assert.match(frontend, /PUBLIC_SITE_URL: \$\{PUBLIC_SITE_URL\}/);
  assert.match(frontend, /PUBLIC_INDEXING_ENABLED: \$\{PUBLIC_INDEXING_ENABLED:-false\}/);
  assert.match(frontend, /backend:\n\s+condition: service_healthy/);
  assert.match(backend, /SPRING_PROFILES_ACTIVE: prod/);
  assert.match(backend, /APP_CONSULTATION_SUBMISSION_ENABLED: \$\{APP_CONSULTATION_SUBMISSION_ENABLED:-false\}/);
  assert.match(backend, /APP_CONSULTATION_PRIVACY_NOTICE_VERSION: \$\{APP_CONSULTATION_PRIVACY_NOTICE_VERSION:-\}/);
  for (const name of ["postgres", "redis", "elasticsearch"]) {
    assert.match(backend, new RegExp(`${name}:\\n\\s+condition: service_healthy`));
  }
});

test("Caddy and frontend have stable trusted proxy identities and backend readiness reports HTTPS", () => {
  const caddy = serviceBlock("caddy");
  const frontend = serviceBlock("frontend");
  const backend = serviceBlock("backend");
  assert.match(caddy, /ipv4_address: \$\{CADDY_INTERNAL_IP\}/);
  assert.match(frontend, /ipv4_address: \$\{FRONTEND_INTERNAL_IP\}/);
  assert.match(backend, /ipv4_address: \$\{BACKEND_INTERNAL_IP\}/);
  assert.match(backend, /APP_TRUSTED_PROXIES: "127\.0\.0\.1,\$\{CADDY_INTERNAL_IP\},\$\{FRONTEND_INTERNAL_IP\}"/);
  assert.match(backend, /X-Forwarded-Proto: https/);
  assert.match(backend, /http:\/\/127\.0\.0\.1:8080\/actuator\/health\/readiness/);
  assert.match(compose, /subnet: \$\{DEPLOYMENT_NETWORK_SUBNET\}/);
});

test("stateful services use named volumes", () => {
  assert.match(serviceBlock("postgres"), /postgres-data:\/var\/lib\/postgresql\/data/);
  assert.match(serviceBlock("redis"), /redis-data:\/data/);
  assert.match(serviceBlock("elasticsearch"), /elasticsearch-data:\/usr\/share\/elasticsearch\/data/);
  assert.match(compose, /^volumes:\n  community-images:\n  postgres-data:\n  redis-data:\n  elasticsearch-data:\n  caddy-data:\n  caddy-config:/m);
  assert.match(serviceBlock('backend'), /community-images:\/var\/lib\/udajo\/community-images/);
  assert.doesNotMatch(serviceBlock('caddy'), /community-images:/);
});
