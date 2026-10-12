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
  APP_COMMUNITY_CURSOR_SECRET: "test-only-community-key-with-32-bytes",
  APP_CONSULTATION_PRIVACY_NOTICE_VERSION: "web-enquiry-v1",
  PUBLIC_INDEXING_ENABLED: "false",
  CADDY_SITE_ADDRESSES: ":80",
  CADDY_ACME_EMAIL: "ci@example.test",
  DEPLOYMENT_NETWORK_SUBNET: "172.30.0.0/24",
  FRONTEND_INTERNAL_IP: "172.30.0.10",
  BACKEND_INTERNAL_IP: "172.30.0.20",
};

const enabledCommunityEnvironment = {
  ...validEnvironment,
  APP_COMMUNITY_ENABLED: "true",
  APP_COMMUNITY_REVIEW_TERMS: "policy-owned-term",
  APP_COMMUNITY_CONTENT_SAFETY_ENABLED: "true",
  APP_MINIAPP_AUTH_ENABLED: "true",
  APP_MINIAPP_LOCAL_PROVIDER_ENABLED: "false",
  APP_MINIAPP_WECHAT_APP_ID: "wx-ci-only-miniapp",
  APP_MINIAPP_WECHAT_APP_SECRET: "ci-only-miniapp-credential",
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

test("requires a shared community cursor key of at least 32 UTF-8 bytes", () => {
  for (const secret of [undefined, "", "too-short"]) {
    assert.match(validateDeploymentEnv({ ...validEnvironment, APP_COMMUNITY_CURSOR_SECRET: secret }).join("\n"), /APP_COMMUNITY_CURSOR_SECRET/);
  }
  assert.deepEqual(validateDeploymentEnv({ ...validEnvironment, APP_COMMUNITY_CURSOR_SECRET: "🔐".repeat(8) }), []);
});

test("validates community write limits even while disabled and requires configured production policy when enabled", () => {
  for (const [name, value] of [
    ["APP_COMMUNITY_ENABLED", "yes"], ["APP_COMMUNITY_POST_PER_MINUTE", "0"],
    ["APP_COMMUNITY_POST_PER_MINUTE", "101"], ["APP_COMMUNITY_POST_PER_DAY", "1"],
    ["APP_COMMUNITY_POST_PER_DAY", "1001"], ["APP_COMMUNITY_COMMENT_PER_MINUTE", "301"],
    ["APP_COMMUNITY_COMMENT_PER_DAY", "9"], ["APP_COMMUNITY_COMMENT_PER_DAY", "10001"],
    ["APP_COMMUNITY_REPORT_PER_DAY", "301"],
    ["APP_COMMUNITY_AUTO_HIDE_REPORT_THRESHOLD", "1"], ["APP_COMMUNITY_AUTO_HIDE_REPORT_THRESHOLD", "101"],
  ]) {
    assert.match(validateDeploymentEnv({ ...validEnvironment, [name]: value }).join("\n"), /APP_COMMUNITY/);
  }
  assert.match(validateDeploymentEnv({ ...validEnvironment, APP_COMMUNITY_ENABLED: "true" }).join("\n"), /community.*policy/i);
  assert.deepEqual(validateDeploymentEnv(enabledCommunityEnvironment), []);
  assert.deepEqual(validateDeploymentEnv({ ...validEnvironment, APP_COMMUNITY_ENABLED: "false" }), []);
});

test("enabled community requires owned review rules rather than only reject rules or sample terms", () => {
  assert.match(validateDeploymentEnv({
    ...enabledCommunityEnvironment, APP_COMMUNITY_REVIEW_TERMS: " , ", APP_COMMUNITY_REJECT_TERMS: "owned-reject-rule",
  }).join("\n"), /owned local review rules/i);
  for (const term of ["synthetic-review", "hard-reject", "needs-review", "example-review", "example-reject"]) {
    for (const name of ["APP_COMMUNITY_REVIEW_TERMS", "APP_COMMUNITY_REJECT_TERMS"]) {
      assert.match(validateDeploymentEnv({ ...enabledCommunityEnvironment, [name]: ` ${term.toUpperCase()} ` }).join("\n"),
        /owned local review rules/i);
    }
  }
});

test("both policy lists enforce runtime entry and UTF-16 length bounds before filtering or deduplication", () => {
  for (const environment of [validEnvironment, enabledCommunityEnvironment]) {
    for (const name of ["APP_COMMUNITY_REVIEW_TERMS", "APP_COMMUNITY_REJECT_TERMS"]) {
      for (const terms of ["x".repeat(201), "🔐".repeat(101), `\u00a0${"x".repeat(200)}`,
        Array.from({ length: 1001 }, (_, index) => `owned-rule-${index}`).join(","),
        Array(1001).fill("owned-rule").join(","), Array(1001).fill("").join(",")]) {
        assert.match(validateDeploymentEnv({ ...environment, [name]: terms }).join("\n"), new RegExp(`${name}.*1000.*200`));
      }
      for (const terms of ["x".repeat(200), "🔐".repeat(100), `  ${"x".repeat(200)}  `,
        Array.from({ length: 1000 }, (_, index) => `owned-rule-${index}`).join(","),
        Array(1000).fill("owned-rule").join(",")]) {
        assert.deepEqual(validateDeploymentEnv({ ...environment, [name]: terms }), []);
      }
    }
  }
});

test("enabled community requires content safety and real miniapp auth with shared credentials", () => {
  for (const [name, value] of [
    ["APP_COMMUNITY_CONTENT_SAFETY_ENABLED", "false"], ["APP_MINIAPP_AUTH_ENABLED", "false"],
    ["APP_MINIAPP_LOCAL_PROVIDER_ENABLED", "true"], ["APP_MINIAPP_WECHAT_APP_ID", ""],
    ["APP_MINIAPP_WECHAT_APP_SECRET", " "], ["APP_MINIAPP_WECHAT_APP_SECRET", "replace_with_secret"],
  ]) {
    assert.match(validateDeploymentEnv({ ...enabledCommunityEnvironment, [name]: value }).join("\n"),
      /content safety and real miniapp credentials/i, name);
  }
});

test("content safety flags and bounded request budgets are validated even with writes disabled", () => {
  for (const [name, value] of [
    ["APP_COMMUNITY_CONTENT_SAFETY_ENABLED", "yes"], ["APP_MINIAPP_AUTH_ENABLED", "yes"],
    ["APP_MINIAPP_LOCAL_PROVIDER_ENABLED", "yes"],
    ["APP_COMMUNITY_CONTENT_SAFETY_REQUEST_TIMEOUT", "249ms"], ["APP_COMMUNITY_CONTENT_SAFETY_REQUEST_TIMEOUT", "5001ms"],
    ["APP_COMMUNITY_CONTENT_SAFETY_REQUEST_TIMEOUT", "invalid"],
    ["APP_COMMUNITY_CONTENT_SAFETY_MAXIMUM_ATTEMPTS", "0"], ["APP_COMMUNITY_CONTENT_SAFETY_MAXIMUM_ATTEMPTS", "4"],
    ["APP_COMMUNITY_CONTENT_SAFETY_MAXIMUM_ATTEMPTS", "1.5"],
  ]) {
    assert.match(validateDeploymentEnv({ ...validEnvironment, [name]: value }).join("\n"), new RegExp(name));
  }
  for (const timeout of ["250ms", "2s", "5s", "PT0.25S", "PT5S", "2000"]) {
    assert.deepEqual(validateDeploymentEnv({ ...validEnvironment, APP_COMMUNITY_CONTENT_SAFETY_REQUEST_TIMEOUT: timeout }), []);
  }
  for (const attempts of ["1", "2", "3"]) {
    assert.deepEqual(validateDeploymentEnv({ ...validEnvironment, APP_COMMUNITY_CONTENT_SAFETY_MAXIMUM_ATTEMPTS: attempts }), []);
  }
});

test("enabled community permits only the exact official HTTPS token and message-check endpoints", () => {
  for (const [name, official] of [
    ["APP_COMMUNITY_CONTENT_SAFETY_ACCESS_TOKEN_ENDPOINT", "https://api.weixin.qq.com/cgi-bin/token"],
    ["APP_COMMUNITY_CONTENT_SAFETY_MESSAGE_CHECK_ENDPOINT", "https://api.weixin.qq.com/wxa/msg_sec_check"],
  ]) {
    assert.deepEqual(validateDeploymentEnv({ ...enabledCommunityEnvironment, [name]: official }), []);
    for (const endpoint of [official.replace("https:", "http:"), official.replace("api.weixin.qq.com", "evil.example"),
      `${official}?redirect=1`, `${official}#fragment`, `${official}/`,
      official.replace("https://", "https://user:password@"), official.replace(".com/", ".com:443/")]) {
      assert.match(validateDeploymentEnv({ ...enabledCommunityEnvironment, [name]: endpoint }).join("\n"),
        /official HTTPS endpoints/i);
    }
  }
});

test("content safety endpoint structure is validated while community writes are disabled", () => {
  for (const name of ["APP_COMMUNITY_CONTENT_SAFETY_ACCESS_TOKEN_ENDPOINT", "APP_COMMUNITY_CONTENT_SAFETY_MESSAGE_CHECK_ENDPOINT"]) {
    for (const endpoint of ["not-a-url", "/relative", "ftp://provider.test/check", "https:///check", "https:provider.test/check",
      "https://user:secret@provider.test/check", "https://@provider.test/check",
      "https://provider.test/check?", "https://provider.test/check?token=secret",
      "https://provider.test/check#", "https://provider.test/check#fragment",
      "https://provider.test/space here", "https://审核.test/check", "https://-provider.test/check",
      "https://provider-.test/check", "https://127.1/check", "https://a.123/check", "https://provider.test/%zz"]) {
      const errors = validateDeploymentEnv({ ...validEnvironment, [name]: endpoint }).join("\n");
      assert.match(errors, new RegExp(`${name}.*absolute HTTP or HTTPS.*host.*userinfo.*query.*fragment`));
      assert.equal(errors.includes(endpoint), false, "endpoint errors must redact input values");
    }
    for (const endpoint of ["http://localhost:18080/mock-check", "https://provider.test/check", "http://[::1]:18080/check",
      "https://provider.test:99999/check", "https://provider.test:/check"]) {
      assert.deepEqual(validateDeploymentEnv({ ...validEnvironment, [name]: endpoint }), []);
    }
  }
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
