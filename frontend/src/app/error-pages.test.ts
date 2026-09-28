import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import test from "node:test";

const read = (path: string) => readFileSync(fileURLToPath(new URL(path, import.meta.url)), "utf8");

test("404 page provides branded bilingual recovery actions", () => {
  const source = read("./not-found.tsx");
  assert.match(source, /udajo-logo-transparent\.png/);
  assert.match(source, /404/);
  assert.match(source, /href="\/zh"/);
  assert.match(source, /href="\/en"/);
});

test("localized error boundary supports retry and return home", () => {
  const source = read("./[locale]/error.tsx");
  assert.match(source, /reset/);
  assert.match(source, /Try again|重试/);
  assert.match(source, /Back to home|返回首页/);
});

test("global error boundary provides a complete document fallback", () => {
  const source = read("./global-error.tsx");
  assert.match(source, /<html/);
  assert.match(source, /<body/);
  assert.match(source, /reset/);
  assert.match(source, /UDAJO/);
});

test("error pages have responsive branded styling", () => {
  const css = read("./globals.css");
  assert.match(css, /\.status-page/);
  assert.match(css, /\.status-code/);
  assert.match(css, /@media[\s\S]*\.status-actions/);
});
