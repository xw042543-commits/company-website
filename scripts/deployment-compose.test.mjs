import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const compose = readFileSync(new URL("../compose.production.yaml", import.meta.url), "utf8");

function serviceBlock(name) {
  const match = compose.match(new RegExp(`^  ${name}:\\n([\\s\\S]*?)(?=^  [a-z][a-z0-9_-]*:|^volumes:|^networks:|(?![\\s\\S]))`, "m"));
  assert.ok(match, `missing ${name} service`);
  return match[1];
}

test("production topology includes all required services with health checks", () => {
  for (const name of ["frontend", "backend", "postgres", "redis", "elasticsearch"]) {
    assert.match(serviceBlock(name), /^    healthcheck:/m, `${name} needs a health check`);
    assert.match(serviceBlock(name), /^    restart: unless-stopped/m, `${name} needs a restart policy`);
  }
});

test("production data services preserve the project-pinned versions", () => {
  assert.match(serviceBlock("postgres"), /image: postgres:17\.11/);
  assert.match(serviceBlock("redis"), /image: redis:8\.2\.9/);
  assert.match(serviceBlock("elasticsearch"), /image: docker\.elastic\.co\/elasticsearch\/elasticsearch:9\.4\.5/);
});

test("only the frontend publishes a host port", () => {
  assert.match(serviceBlock("frontend"), /^    ports:/m);
  for (const name of ["backend", "postgres", "redis", "elasticsearch"]) {
    assert.doesNotMatch(serviceBlock(name), /^    ports:/m, `${name} must remain private`);
  }
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
  for (const name of ["postgres", "redis", "elasticsearch"]) {
    assert.match(backend, new RegExp(`${name}:\\n\\s+condition: service_healthy`));
  }
});

test("frontend has a stable trusted proxy identity and backend readiness reports HTTPS", () => {
  const frontend = serviceBlock("frontend");
  const backend = serviceBlock("backend");
  assert.match(frontend, /ipv4_address: \$\{FRONTEND_INTERNAL_IP\}/);
  assert.match(backend, /ipv4_address: \$\{BACKEND_INTERNAL_IP\}/);
  assert.match(backend, /APP_TRUSTED_PROXIES: "127\.0\.0\.1,\$\{FRONTEND_INTERNAL_IP\}"/);
  assert.match(backend, /X-Forwarded-Proto: https/);
  assert.match(backend, /http:\/\/127\.0\.0\.1:8080\/actuator\/health\/readiness/);
  assert.match(compose, /subnet: \$\{DEPLOYMENT_NETWORK_SUBNET\}/);
});

test("stateful services use named volumes", () => {
  assert.match(serviceBlock("postgres"), /postgres-data:\/var\/lib\/postgresql\/data/);
  assert.match(serviceBlock("redis"), /redis-data:\/data/);
  assert.match(serviceBlock("elasticsearch"), /elasticsearch-data:\/usr\/share\/elasticsearch\/data/);
  assert.match(compose, /^volumes:\n  postgres-data:\n  redis-data:\n  elasticsearch-data:/m);
});
