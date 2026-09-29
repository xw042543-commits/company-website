import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import test from "node:test";

const css = readFileSync(fileURLToPath(new URL("./globals.css", import.meta.url)), "utf8");
const schoolCard = readFileSync(fileURLToPath(new URL("../components/school-card.tsx", import.meta.url)), "utf8");

test("global styles cover the rendered header and homepage layout", () => {
  for (const selector of [
    ".header-shell",
    ".pathway-grid",
    ".faq-layout",
    ".featured-carousel",
    ".comparison-panel",
    ".contact-card",
    ".programme-detail-list",
    ".programme-level-filters",
  ]) {
    assert.match(css, new RegExp(`\\${selector}\\b`), `${selector} is missing from globals.css`);
  }

  assert.match(css, /\.hero-intro\s*\{[\s\S]*?font-size:\s*clamp\(1\.125rem,\s*1\.7vw,\s*1\.3rem\)/);
});

test("global styles include the shared motion and loading system", () => {
  for (const selector of [
    "[data-reveal]",
    ".form-progress",
    ".university-card-skeleton",
    ".university-logo-label",
    ".location-label",
  ]) {
    assert.match(css, new RegExp(selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `${selector} is missing from globals.css`);
  }

  assert.match(css, /prefers-reduced-motion:\s*reduce/, "reduced-motion support is missing");
});

test("directory logos use a centered safe area with a separate hover caption", () => {
  assert.match(schoolCard, /className="school-logo-block"/);
  assert.match(schoolCard, /className="school-logo-caption"/);
  assert.match(css, /\.school-image img\s*\{[\s\S]*?width:\s*82%[\s\S]*?height:\s*82%[\s\S]*?object-position:\s*center/);
  assert.match(css, /\.school-logo-caption\s*\{[\s\S]*?position:\s*static/);
  assert.match(css, /\.school-card-link:hover \.school-logo-caption/);
});
