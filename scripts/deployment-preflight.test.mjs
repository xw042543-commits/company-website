import assert from "node:assert/strict";
import test from "node:test";

import {
  parseEnv,
  validateDeploymentEnv,
} from "./deployment-preflight.mjs";

const validEnvironment = {
  PUBLIC_SITE_URL: "https://preview.yangdoujiao.com",
  API_BASE_URL: "http://backend:8080",
  SPRING_PROFILES_ACTIVE: "prod",
  CORS_ALLOWED_ORIGINS: "https://preview.yangdoujiao.com",
  POSTGRES_DB: "company_website",
  POSTGRES_USER: "company_app",
  POSTGRES_PASSWORD: "postgres-secret-value",
  POSTGRES_HOST: "postgres",
  POSTGRES_PORT: "5432",
  REDIS_HOST: "redis",
  REDIS_PORT: "6379",
  REDIS_PASSWORD: "redis-secret-value",
  ELASTICSEARCH_URL: "http://elasticsearch:9200",
  APP_CONSULTATION_SUBMISSION_ENABLED: "false",
};

test("parses comments, whitespace, and quoted env values", () => {
  assert.deepEqual(parseEnv(`
    # preview settings
    PUBLIC_SITE_URL = "https://preview.yangdoujiao.com"
    POSTGRES_DB=company_website
  `), {
    PUBLIC_SITE_URL: "https://preview.yangdoujiao.com",
    POSTGRES_DB: "company_website",
  });
});

test("reports every missing required deployment variable", () => {
  const errors = validateDeploymentEnv({});
  for (const name of Object.keys(validEnvironment)) {
    assert.match(errors.join("\n"), new RegExp(name));
  }
});

test("rejects empty and documented placeholder values", () => {
  const errors = validateDeploymentEnv({
    ...validEnvironment,
    POSTGRES_PASSWORD: " ",
    REDIS_PASSWORD: "replace_with_redis_password",
  });
  assert.match(errors.join("\n"), /POSTGRES_PASSWORD/);
  assert.match(errors.join("\n"), /REDIS_PASSWORD/);
});

test("requires HTTPS for the public site and CORS origin", () => {
  const errors = validateDeploymentEnv({
    ...validEnvironment,
    PUBLIC_SITE_URL: "http://preview.yangdoujiao.com",
    CORS_ALLOWED_ORIGINS: "http://preview.yangdoujiao.com",
  });
  assert.match(errors.join("\n"), /PUBLIC_SITE_URL.*HTTPS/);
  assert.match(errors.join("\n"), /CORS_ALLOWED_ORIGINS.*HTTPS/);
});

test("requires the production profile and keeps preview submissions disabled", () => {
  const errors = validateDeploymentEnv({
    ...validEnvironment,
    SPRING_PROFILES_ACTIVE: "dev",
    APP_CONSULTATION_SUBMISSION_ENABLED: "true",
  });
  assert.match(errors.join("\n"), /SPRING_PROFILES_ACTIVE.*prod/);
  assert.match(errors.join("\n"), /APP_CONSULTATION_SUBMISSION_ENABLED.*false/);
});

test("accepts a complete private-preview environment", () => {
  assert.deepEqual(validateDeploymentEnv(validEnvironment), []);
});

test("never includes secret values in validation errors", () => {
  const secret = "do-not-print-this-secret";
  const errors = validateDeploymentEnv({
    ...validEnvironment,
    POSTGRES_PASSWORD: secret,
    PUBLIC_SITE_URL: secret,
  });
  assert.equal(errors.join("\n").includes(secret), false);
});
