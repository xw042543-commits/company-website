import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import test from "node:test";

const css = readFileSync(fileURLToPath(new URL("./globals.css", import.meta.url)), "utf8");

test("global styles cover the rendered header and homepage layout", () => {
  for (const selector of [
    ".header-shell",
    ".pathway-grid",
    ".faq-layout",
    ".featured-carousel",
    ".comparison-panel",
    ".contact-card",
    ".programme-detail-list",
  ]) {
    assert.match(css, new RegExp(`\\${selector}\\b`), `${selector} is missing from globals.css`);
  }
});
