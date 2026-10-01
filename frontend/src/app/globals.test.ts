import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import test from "node:test";

const css = readFileSync(fileURLToPath(new URL("./globals.css", import.meta.url)), "utf8");
const schoolCard = readFileSync(fileURLToPath(new URL("../components/school-card.tsx", import.meta.url)), "utf8");
const publicHome = readFileSync(fileURLToPath(new URL("../components/public-home.tsx", import.meta.url)), "utf8");
const memberHome = readFileSync(fileURLToPath(new URL("./[locale]/page.tsx", import.meta.url)), "utf8");

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
    ".public-home-hero",
    ".public-home-campus-grid",
    ".public-home-contact-desk",
    ".public-home-enquiry",
    ".public-home-school-grid",
  ]) {
    assert.match(css, new RegExp(`\\${selector}\\b`), `${selector} is missing from globals.css`);
  }

  assert.match(css, /\.hero-intro\s*\{[\s\S]*?font-size:\s*clamp\(1\.03rem,\s*1\.35vw,\s*1\.16rem\)/);
});

test("public homepage uses a compact enquiry desk and responsive university cards", () => {
  assert.match(css, /\.public-home-contact-desk\s*\{[\s\S]*?grid-template-columns:/);
  assert.match(css, /\.public-home-contact-photo img\s*\{[\s\S]*?object-position:\s*center/);
  assert.match(css, /\.public-home-school-grid\s*\{[\s\S]*?grid-template-columns:\s*repeat\(3/);
  assert.match(css, /@media \(max-width:\s*760px\)[\s\S]*?\.public-home-contact-desk/);
});

test("public homepage balances the process heading and emphasizes contact details", () => {
  assert.match(publicHome, /每一步都清楚/);
  assert.match(publicHome, /下一步怎么走/);
  assert.doesNotMatch(publicHome, /每一步，都知道接下来做什么/);
  assert.match(publicHome, /className="public-home-contact-action"/);
  assert.match(css, /\.public-home-process-heading\s*\{[\s\S]*?text-wrap:\s*balance/);
  assert.match(css, /\.public-home-contact-details\s*\{[\s\S]*?border:\s*1px solid/);
  assert.match(css, /\.public-home-contact-action\s*\{[\s\S]*?font-weight:\s*800/);
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

test("university loading skeleton is scoped to data-heavy routes without visible copy", () => {
  const localeRoot = fileURLToPath(new URL("./[locale]/", import.meta.url));
  assert.equal(existsSync(`${localeRoot}/loading.tsx`), false, "locale-wide loading UI causes every navigation to flash university copy");

  for (const section of ["planning", "universities"]) {
    const loadingPath = `${localeRoot}/${section}/loading.tsx`;
    assert.equal(existsSync(loadingPath), true, `${section} needs a route-scoped loading boundary`);
    const source = readFileSync(loadingPath, "utf8");
    assert.match(source, /UniversityLoadingSkeleton/);
  }

  const skeleton = readFileSync(fileURLToPath(new URL("../components/university-loading-skeleton.tsx", import.meta.url)), "utf8");
  assert.match(skeleton, /aria-busy="true"/);
  assert.match(skeleton, /aria-hidden="true"/);
  assert.doesNotMatch(skeleton, /正在加载院校资料|Loading university information/);
});

test("directory logos use a centered safe area with a separate hover caption", () => {
  assert.match(schoolCard, /className="school-logo-block"/);
  assert.match(schoolCard, /className="school-logo-caption"/);
  assert.match(css, /\.school-image img\s*\{[\s\S]*?width:\s*82%[\s\S]*?height:\s*82%[\s\S]*?object-position:\s*center/);
  assert.match(css, /\.school-logo-caption\s*\{[\s\S]*?position:\s*static/);
  assert.match(css, /\.school-card:hover \.school-logo-caption/);
});

test("university result cards collapse matching programmes behind an accessible disclosure", () => {
  assert.match(schoolCard, /<details className="school-programme-disclosure">/);
  assert.match(schoolCard, /<summary>/);
  assert.match(schoolCard, /school-programme-chevron/);
  assert.match(schoolCard, /<Link className="school-card-action"/);
  assert.doesNotMatch(schoolCard, /<Link className="school-card-link"[^>]*><article/);
  assert.match(css, /\.school-programme-disclosure\s*\{/);
  assert.match(css, /\.school-programme-disclosure\[open\] \.school-programme-chevron/);
});

test("signed-in homepage uses an image-led action hero and separate search panel", () => {
  assert.match(memberHome, /className="member-home-hero"/);
  assert.match(memberHome, /全球第一家留学生综合服务平台/);
  assert.match(memberHome, /A comprehensive service platform for international students worldwide/);
  assert.match(memberHome, /\/universities\/campuses\/apu-campus\.webp/);
  assert.match(memberHome, /className="member-search-panel/);
  assert.match(css, /\.member-home-hero-grid\s*\{[\s\S]*?grid-template-columns:/);
  assert.match(css, /\.member-home-visual img\s*\{[\s\S]*?object-fit:\s*cover/);
});

test("member search panel reserves its full height instead of being covered by the next section", () => {
  const panelRule = css.match(/\.member-search-panel\s*\{([^}]*)\}/)?.[1] ?? "";
  assert.doesNotMatch(panelRule, /transform:\s*translateY/);
  assert.match(css, /\.member-search-band\s*\{[^}]*padding-block:\s*26px/);
  assert.match(css, /@media \(max-width:\s*760px\)[\s\S]*?\.member-search-band\s*\{[^}]*padding-block:\s*22px/);
});

test("sticky header uses restrained dimensional styling", () => {
  assert.match(css, /\.site-header\s*\{[\s\S]*?linear-gradient/);
  assert.match(css, /\.site-header\s*\{[\s\S]*?box-shadow:/);
  assert.match(css, /\.brand img\s*\{[\s\S]*?filter:\s*drop-shadow/);
  assert.match(css, /\.navigation a:hover\s*\{[\s\S]*?transform:\s*translateY/);
  assert.match(css, /\.site-header \.login-link\s*\{[\s\S]*?box-shadow:/);
});

test("benefit cards use an even two-column alignment", () => {
  assert.match(css, /\.benefits\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/);
  assert.match(css, /\.benefits\s*\{[^}]*grid-auto-rows:\s*minmax\(140px,\s*auto\)/);
  assert.doesNotMatch(css, /\.benefits article:nth-child/);
});
