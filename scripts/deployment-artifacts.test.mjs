import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function read(relativePath) {
  return readFileSync(new URL(`../${relativePath}`, import.meta.url), "utf8");
}

test("frontend image uses a locked multi-stage Node 24 standalone build as non-root", () => {
  const dockerfile = read("frontend/Dockerfile");
  assert.match(dockerfile, /FROM node:24[^\n]* AS deps/i);
  assert.match(dockerfile, /FROM node:24[^\n]* AS builder/i);
  assert.match(dockerfile, /npm ci/);
  assert.match(dockerfile, /\.next\/standalone/);
  assert.match(dockerfile, /USER node/);
  assert.match(dockerfile, /EXPOSE 3000/);
  assert.doesNotMatch(dockerfile, /COPY .*\.env/);
});

test("backend image uses the Maven Wrapper and a non-root Java 21 runtime", () => {
  const dockerfile = read("backend/Dockerfile");
  assert.match(dockerfile, /FROM maven:[^\n]*21[^\n]* AS builder/i);
  assert.match(dockerfile, /\.\/mvnw[^\n]*package/);
  assert.match(dockerfile, /FROM eclipse-temurin:21[^\n]* AS runtime/i);
  assert.match(dockerfile, /USER app/);
  assert.match(dockerfile, /EXPOSE 8080/);
  assert.doesNotMatch(dockerfile, /COPY .*\.env/);
});

test("docker build contexts exclude dependencies, outputs, secrets, and VCS data", () => {
  const frontendIgnore = read("frontend/.dockerignore");
  const backendIgnore = read("backend/.dockerignore");
  for (const entry of ["node_modules", ".next", ".env", ".git"]) assert.match(frontendIgnore, new RegExp(entry.replace(".", "\\.")));
  for (const entry of ["target", ".env", ".git"]) assert.match(backendIgnore, new RegExp(entry.replace(".", "\\.")));
});
