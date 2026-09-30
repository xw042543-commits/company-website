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
  APP_CONSULTATION_SUBMISSION_ENABLED: "true",
  APP_CONSULTATION_PRIVACY_NOTICE_VERSION: "web-enquiry-v1",
  PUBLIC_INDEXING_ENABLED: "false",
  CADDY_SITE_ADDRESSES: ":80",
  CADDY_ACME_EMAIL: "ci@example.test",
  DEPLOYMENT_NETWORK_SUBNET: "172.30.0.0/24",
  FRONTEND_INTERNAL_IP: "172.30.0.10",
  BACKEND_INTERNAL_IP: "172.30.0.20",
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
  for (const name of Object.keys(validEnvironment).filter((name) => name !== "APP_CONSULTATION_PRIVACY_NOTICE_VERSION")) {
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

test("requires a certificate contact and both public hostnames for the official launch", () => {
  assert.match(validateDeploymentEnv({
    ...validEnvironment,
    CADDY_ACME_EMAIL: "not-an-email",
  }).join("\n"), /CADDY_ACME_EMAIL/);

  const official = {
    ...validEnvironment,
    PUBLIC_SITE_URL: "https://yangdoujiao.com",
    CORS_ALLOWED_ORIGINS: "https://yangdoujiao.com",
    CADDY_SITE_ADDRESSES: "yangdoujiao.com",
  };
  assert.match(validateDeploymentEnv(official).join("\n"), /CADDY_SITE_ADDRESSES.*www\.yangdoujiao\.com/);
  assert.match(validateDeploymentEnv({
    ...official,
    PUBLIC_SITE_URL: "https://yangdoujiao.com/",
  }).join("\n"), /CADDY_SITE_ADDRESSES.*www\.yangdoujiao\.com/);
  assert.deepEqual(validateDeploymentEnv({
    ...official,
    CADDY_SITE_ADDRESSES: "yangdoujiao.com, www.yangdoujiao.com",
  }), []);
});

test("requires the production profile and complete consultation settings", () => {
  const errors = validateDeploymentEnv({
    ...validEnvironment,
    SPRING_PROFILES_ACTIVE: "dev",
    APP_CONSULTATION_PRIVACY_NOTICE_VERSION: "",
  });
  assert.match(errors.join("\n"), /SPRING_PROFILES_ACTIVE.*prod/);
  assert.match(errors.join("\n"), /APP_CONSULTATION_PRIVACY_NOTICE_VERSION/);
  assert.deepEqual(validateDeploymentEnv({
    ...validEnvironment,
    APP_CONSULTATION_SUBMISSION_ENABLED: "false",
    APP_CONSULTATION_PRIVACY_NOTICE_VERSION: "",
  }), []);
});

test("accepts a complete private-preview environment", () => {
  assert.deepEqual(validateDeploymentEnv(validEnvironment), []);
});

test("requires distinct frontend and backend addresses inside the deployment subnet", () => {
  assert.match(validateDeploymentEnv({
    ...validEnvironment,
    FRONTEND_INTERNAL_IP: "172.31.0.10",
  }).join("\n"), /FRONTEND_INTERNAL_IP.*DEPLOYMENT_NETWORK_SUBNET/);
  assert.match(validateDeploymentEnv({
    ...validEnvironment,
    BACKEND_INTERNAL_IP: "172.30.0.10",
  }).join("\n"), /FRONTEND_INTERNAL_IP.*BACKEND_INTERNAL_IP.*different/);
  assert.match(validateDeploymentEnv({
    ...validEnvironment,
    DEPLOYMENT_NETWORK_SUBNET: "not-a-subnet",
  }).join("\n"), /DEPLOYMENT_NETWORK_SUBNET.*IPv4 CIDR/);
});

test("rejects deployment subnets outside RFC1918 private address space", () => {
  for (const subnet of ["8.8.0.0/16", "172.15.0.0/16", "172.32.0.0/16", "192.167.0.0/16"]) {
    assert.match(validateDeploymentEnv({
      ...validEnvironment,
      DEPLOYMENT_NETWORK_SUBNET: subnet,
    }).join("\n"), /DEPLOYMENT_NETWORK_SUBNET.*private IPv4 CIDR/);
  }
});

test("requires an explicit indexing flag and only enables it on the official domain", () => {
  assert.match(validateDeploymentEnv({ ...validEnvironment, PUBLIC_INDEXING_ENABLED: "yes" }).join("\n"),
    /PUBLIC_INDEXING_ENABLED.*true or false/);
  assert.match(validateDeploymentEnv({
    ...validEnvironment,
    PUBLIC_INDEXING_ENABLED: "true",
    PUBLIC_SITE_URL: "https://preview.example.test",
  }).join("\n"), /PUBLIC_INDEXING_ENABLED.*yangdoujiao\.com/);
  assert.deepEqual(validateDeploymentEnv({
    ...validEnvironment,
    PUBLIC_INDEXING_ENABLED: "true",
    PUBLIC_SITE_URL: "https://yangdoujiao.com",
    CORS_ALLOWED_ORIGINS: "https://yangdoujiao.com",
    CADDY_SITE_ADDRESSES: "yangdoujiao.com, www.yangdoujiao.com",
  }), []);
});

test("accepts disabled WeChat login without credentials", () => {
  assert.deepEqual(validateDeploymentEnv({ ...validEnvironment, APP_AUTH_WECHAT_ENABLED: "false" }), []);
});

test("requires safe complete WeChat configuration when enabled", () => {
  const incomplete = validateDeploymentEnv({ ...validEnvironment, APP_AUTH_WECHAT_ENABLED: "true" });
  assert.match(incomplete.join("\n"), /APP_AUTH_WECHAT_APP_ID/);
  assert.match(incomplete.join("\n"), /APP_AUTH_WECHAT_APP_SECRET/);
  assert.match(incomplete.join("\n"), /APP_AUTH_WECHAT_CALLBACK_URL/);

  const wrongOrigin = validateDeploymentEnv({
    ...validEnvironment,
    APP_AUTH_WECHAT_ENABLED: "true",
    APP_AUTH_WECHAT_APP_ID: "wx-company-client",
    APP_AUTH_WECHAT_APP_SECRET: "company-owned-secret",
    APP_AUTH_WECHAT_CALLBACK_URL: "https://evil.example/api/v1/auth/wechat/callback",
  });
  assert.match(wrongOrigin.join("\n"), /PUBLIC_SITE_URL origin/);

  const wrongPath = validateDeploymentEnv({
    ...validEnvironment,
    APP_AUTH_WECHAT_ENABLED: "true",
    APP_AUTH_WECHAT_APP_ID: "wx-company-client",
    APP_AUTH_WECHAT_APP_SECRET: "company-owned-secret",
    APP_AUTH_WECHAT_CALLBACK_URL: "https://preview.yangdoujiao.com/oauth/callback",
  });
  assert.match(wrongPath.join("\n"), /api\/v1\/auth\/wechat\/callback/);

  assert.deepEqual(validateDeploymentEnv({
    ...validEnvironment,
    APP_AUTH_WECHAT_ENABLED: "true",
    APP_AUTH_WECHAT_APP_ID: "wx-company-client",
    APP_AUTH_WECHAT_APP_SECRET: "company-owned-secret",
    APP_AUTH_WECHAT_CALLBACK_URL: "https://preview.yangdoujiao.com/api/v1/auth/wechat/callback",
  }), []);
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
