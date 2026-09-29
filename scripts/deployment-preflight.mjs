import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const REQUIRED_DEPLOYMENT_VARIABLES = [
  "PUBLIC_SITE_URL",
  "API_BASE_URL",
  "SPRING_PROFILES_ACTIVE",
  "CORS_ALLOWED_ORIGINS",
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
];

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
  if (valueFor("CORS_ALLOWED_ORIGINS") && !valueFor("CORS_ALLOWED_ORIGINS").split(",").every((origin) => validUrl(origin.trim(), ["https:"]))) {
    errors.push("CORS_ALLOWED_ORIGINS must contain only valid HTTPS origins.");
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
  if (valueFor("APP_CONSULTATION_SUBMISSION_ENABLED") && valueFor("APP_CONSULTATION_SUBMISSION_ENABLED") !== "false") {
    errors.push("APP_CONSULTATION_SUBMISSION_ENABLED must remain false for the private preview.");
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
