import assert from "node:assert/strict";
import { existsSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import test from "node:test";

import { findUniversityBySlug, localizeUniversity, searchUniversityCatalog, UNIVERSITY_CATALOG } from "./university-catalog.ts";

test("matches an approved abbreviation", () => {
  assert.deepEqual(searchUniversityCatalog("UM").map((university) => university.slug), ["university-of-malaya"]);
});

test("matches a Chinese university name", () => {
  assert.equal(searchUniversityCatalog("马来亚大学")[0]?.slug, "university-of-malaya");
});

test("normalizes case and surrounding whitespace", () => {
  assert.equal(searchUniversityCatalog("  university OF malaya ")[0]?.slug, "university-of-malaya");
});

test("returns no records for an unmatched query", () => {
  assert.deepEqual(searchUniversityCatalog("no such institution"), []);
});

test("finds a reviewed university by slug", () => {
  assert.equal(findUniversityBySlug("sunway-university")?.nameZh, "双威大学");
});

test("returns undefined for an unknown slug", () => {
  assert.equal(findUniversityBySlug("unknown-university"), undefined);
});

test("localizes a university identity for Chinese pages", () => {
  const university = findUniversityBySlug("sunway-university");
  assert.ok(university);
  assert.deepEqual(localizeUniversity(university, "zh"), {
    name: "双威大学",
    secondaryName: "Sunway University",
    country: "马来西亚",
    city: "双威城",
  });
});

test("localizes a university identity for English pages", () => {
  const university = findUniversityBySlug("sunway-university");
  assert.ok(university);
  assert.deepEqual(localizeUniversity(university, "en"), {
    name: "Sunway University",
    secondaryName: "双威大学",
    country: "Malaysia",
    city: "Bandar Sunway",
  });
});

test("every supplied logo reference resolves to a nonempty public file", () => {
  const publicRoot = fileURLToPath(new URL("../../public/", import.meta.url));
  for (const university of UNIVERSITY_CATALOG) {
    if (!university.logoSrc) continue;
    const path = `${publicRoot}${university.logoSrc.slice(1).replaceAll("/", "\\")}`;
    assert.equal(existsSync(path), true, `${university.slug} logo is missing`);
    assert.ok(statSync(path).size > 0, `${university.slug} logo is empty`);
  }
});


