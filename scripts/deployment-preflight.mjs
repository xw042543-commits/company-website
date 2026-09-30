import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const REQUIRED_DEPLOYMENT_VARIABLES = [
  "PUBLIC_SITE_URL",
  "PUBLIC_INDEXING_ENABLED",
  "API_BASE_URL",
  "SPRING_PROFILES_ACTIVE",
  "CORS_ALLOWED_ORIGINS",
  "CADDY_SITE_ADDRESSES",
  "CADDY_ACME_EMAIL",
  "POSTGRES_DB",
  "POSTGRES_USER",
  "POSTGRES_PASSWORD",
  "POSTGRES_HOST",
  "POSTGRES_PORT",
  "REDIS_HOST",
  "REDIS_PORT",
  "REDIS_PASSWORD",
  "ELASTICSEARCH_URL",
  "APP_CONSULTATION_SUBMISSION_ENABLED",
  "DEPLOYMENT_NETWORK_SUBNET",
  "FRONTEND_INTERNAL_IP",
  "BACKEND_INTERNAL_IP",
];

function ipv4Number(value) {
  const octets = value.split(".");
  if (octets.length !== 4 || octets.some((octet) => !/^(?:0|[1-9]\d{0,2})$/.test(octet)
      || Number(octet) > 255)) return null;
  return octets.reduce((address, octet) => address * 256 + Number(octet), 0);
}

function ipv4Cidr(value) {
  const match = value.match(/^([^/]+)\/(\d{1,2})$/);
  if (!match) return null;
  const address = ipv4Number(match[1]);
  const prefix = Number(match[2]);
  if (address === null || prefix < 16 || prefix > 29) return null;
  const blockSize = 2 ** (32 - prefix);
  if (address % blockSize !== 0) return null;
  const endAddress = address + blockSize - 1;
  const privateRanges = [
    [ipv4Number("10.0.0.0"), ipv4Number("10.255.255.255")],
    [ipv4Number("172.16.0.0"), ipv4Number("172.31.255.255")],
    [ipv4Number("192.168.0.0"), ipv4Number("192.168.255.255")],
  ];
  if (!privateRanges.some(([start, end]) => address >= start && endAddress <= end)) return null;
  return { address, blockSize };
}

export function parseEnv(source) {
  const values = {};
  for (const rawLine of source.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const separator = line.indexOf("=");
    if (separator < 1) continue;
    const name = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    values[name] = value;
  }
  return values;
}

function validUrl(value, protocols) {
  try {
    return protocols.includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

export function validateDeploymentEnv(environment) {
  const errors = [];
  const valueFor = (name) => String(environment[name] ?? "").trim();

  for (const name of REQUIRED_DEPLOYMENT_VARIABLES) {
    const value = valueFor(name);
    if (!value) {
      errors.push(`${name} is required and cannot be empty.`);
    } else if (/^(change[_-]?me|replace[_-]?with|example|your[_-]|todo)/i.test(value)) {
      errors.push(`${name} still contains a placeholder value.`);
    }
  }

  if (valueFor("PUBLIC_SITE_URL") && !validUrl(valueFor("PUBLIC_SITE_URL"), ["https:"])) {
    errors.push("PUBLIC_SITE_URL must be a valid HTTPS URL.");
  }
  const publicIndexing = valueFor("PUBLIC_INDEXING_ENABLED");
  if (publicIndexing && publicIndexing !== "true" && publicIndexing !== "false") {
    errors.push("PUBLIC_INDEXING_ENABLED must be true or false.");
  }
  if (publicIndexing === "true") {
    try {
      const host = new URL(valueFor("PUBLIC_SITE_URL")).hostname.toLowerCase();
      if (host !== "yangdoujiao.com" && !host.endsWith(".yangdoujiao.com")) {
        errors.push("PUBLIC_INDEXING_ENABLED may be true only for yangdoujiao.com.");
      }
    } catch {
      // PUBLIC_SITE_URL format is reported separately.
    }
  }
  if (valueFor("CORS_ALLOWED_ORIGINS") && !valueFor("CORS_ALLOWED_ORIGINS").split(",").every((origin) => validUrl(origin.trim(), ["https:"]))) {
    errors.push("CORS_ALLOWED_ORIGINS must contain only valid HTTPS origins.");
  }
  const certificateEmail = valueFor("CADDY_ACME_EMAIL");
  if (certificateEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(certificateEmail)) {
    errors.push("CADDY_ACME_EMAIL must be a valid email address.");
  }
  let officialPublicSite = false;
  try {
    officialPublicSite = new URL(valueFor("PUBLIC_SITE_URL")).origin === "https://yangdoujiao.com";
  } catch {
    // PUBLIC_SITE_URL format is reported separately.
  }
  if (officialPublicSite) {
    const caddySites = valueFor("CADDY_SITE_ADDRESSES")
      .split(",")
      .map((site) => site.trim().toLowerCase());
    if (!caddySites.includes("yangdoujiao.com") || !caddySites.includes("www.yangdoujiao.com")) {
      errors.push("CADDY_SITE_ADDRESSES must include yangdoujiao.com and www.yangdoujiao.com for the official launch.");
    }
  }
  for (const name of ["API_BASE_URL", "ELASTICSEARCH_URL"]) {
    const value = valueFor(name);
    if (value && !validUrl(value, ["http:", "https:"])) errors.push(`${name} must be a valid HTTP or HTTPS URL.`);
  }
  for (const name of ["POSTGRES_PORT", "REDIS_PORT"]) {
    const value = valueFor(name);
    if (value && (!/^\d+$/.test(value) || Number(value) < 1 || Number(value) > 65535)) {
      errors.push(`${name} must be a valid TCP port.`);
    }
  }
  if (valueFor("SPRING_PROFILES_ACTIVE") && valueFor("SPRING_PROFILES_ACTIVE") !== "prod") {
    errors.push("SPRING_PROFILES_ACTIVE must be prod for deployment.");
  }
  const consultationEnabled = valueFor("APP_CONSULTATION_SUBMISSION_ENABLED");
  const privacyNoticeVersion = valueFor("APP_CONSULTATION_PRIVACY_NOTICE_VERSION");
  if (consultationEnabled && consultationEnabled !== "true" && consultationEnabled !== "false") {
    errors.push("APP_CONSULTATION_SUBMISSION_ENABLED must be true or false.");
  }
  if (consultationEnabled === "true" && !privacyNoticeVersion) {
    errors.push("APP_CONSULTATION_PRIVACY_NOTICE_VERSION is required when consultation submission is enabled.");
  }
  if (privacyNoticeVersion.length > 50) {
    errors.push("APP_CONSULTATION_PRIVACY_NOTICE_VERSION must not exceed 50 characters.");
  }

  const network = ipv4Cidr(valueFor("DEPLOYMENT_NETWORK_SUBNET"));
  if (valueFor("DEPLOYMENT_NETWORK_SUBNET") && !network) {
    errors.push("DEPLOYMENT_NETWORK_SUBNET must be a network-aligned private IPv4 CIDR between /16 and /29.");
  }
  const frontendAddress = ipv4Number(valueFor("FRONTEND_INTERNAL_IP"));
  const backendAddress = ipv4Number(valueFor("BACKEND_INTERNAL_IP"));
  for (const [name, address] of [["FRONTEND_INTERNAL_IP", frontendAddress], ["BACKEND_INTERNAL_IP", backendAddress]]) {
    if (valueFor(name) && address === null) errors.push(`${name} must be a literal IPv4 address.`);
    else if (network && address !== null
        && (address <= network.address || address >= network.address + network.blockSize - 1)) {
      errors.push(`${name} must be a usable address inside DEPLOYMENT_NETWORK_SUBNET.`);
    }
  }
  if (frontendAddress !== null && backendAddress !== null && frontendAddress === backendAddress) {
    errors.push("FRONTEND_INTERNAL_IP and BACKEND_INTERNAL_IP must be different.");
  }

  const wechatEnabled = valueFor("APP_AUTH_WECHAT_ENABLED");
  if (wechatEnabled && wechatEnabled !== "true" && wechatEnabled !== "false") {
    errors.push("APP_AUTH_WECHAT_ENABLED must be true or false.");
  }
  if (wechatEnabled === "true") {
    for (const name of ["APP_AUTH_WECHAT_APP_ID", "APP_AUTH_WECHAT_APP_SECRET", "APP_AUTH_WECHAT_CALLBACK_URL"]) {
      const value = valueFor(name);
      if (!value) errors.push(`${name} is required when WeChat login is enabled.`);
      else if (/^(change[_-]?me|replace[_-]?with|example|your[_-]|todo)/i.test(value)) {
        errors.push(`${name} still contains a placeholder value.`);
      }
    }
    const callback = valueFor("APP_AUTH_WECHAT_CALLBACK_URL");
    const publicSite = valueFor("PUBLIC_SITE_URL");
    if (callback && !validUrl(callback, ["https:"])) {
      errors.push("APP_AUTH_WECHAT_CALLBACK_URL must be a valid HTTPS URL.");
    } else if (callback && publicSite) {
      try {
        const callbackUrl = new URL(callback);
        if (callbackUrl.origin !== new URL(publicSite).origin) {
          errors.push("APP_AUTH_WECHAT_CALLBACK_URL must use the PUBLIC_SITE_URL origin.");
        }
        if (callbackUrl.pathname !== "/api/v1/auth/wechat/callback"
            || callbackUrl.search || callbackUrl.hash) {
          errors.push("APP_AUTH_WECHAT_CALLBACK_URL must use /api/v1/auth/wechat/callback without query or fragment.");
        }
      } catch {
        // URL format errors are already reported above.
      }
    }
  }

  return [...new Set(errors)];
}

function runCli() {
  const envPath = process.argv[2];
  if (!envPath) {
    console.error("Usage: node scripts/deployment-preflight.mjs <environment-file>");
    process.exitCode = 2;
    return;
  }

  let source;
  try {
    source = fs.readFileSync(path.resolve(envPath), "utf8");
  } catch {
    console.error(`Unable to read deployment environment file: ${envPath}`);
    process.exitCode = 2;
    return;
  }

  const errors = validateDeploymentEnv(parseEnv(source));
  if (errors.length) {
    console.error("Deployment preflight failed:");
    for (const error of errors) console.error(`- ${error}`);
    process.exitCode = 1;
    return;
  }
  console.log("Deployment environment passed preflight validation.");
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) runCli();
