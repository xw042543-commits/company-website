import assert from "node:assert/strict";
import { existsSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import { filterUniversityCatalog, findUniversityBySlug, localizeUniversity, searchUniversityCatalog, UNIVERSITY_CATALOG } from "./university-catalog.ts";
import { universityProfile } from "./university-profiles.ts";
import { localProgrammeLevels } from "./local-programmes.ts";
import { isNavigationActive } from "../lib/site.ts";

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

test("filters the reviewed catalogue by country", () => {
  const matches = filterUniversityCatalog("", "MY", "");
  assert.equal(matches.length, UNIVERSITY_CATALOG.length);
});

test("filters the reviewed catalogue by continent", () => {
  const matches = filterUniversityCatalog("", "", "AS");
  assert.equal(matches.length, UNIVERSITY_CATALOG.length);
});

test("combines approved aliases with geography filters", () => {
  assert.deepEqual(
    filterUniversityCatalog("APU", "MY", "AS").map((university) => university.slug),
    ["asia-pacific-university"],
  );
});

test("returns no reviewed records for an unsupported geography", () => {
  assert.deepEqual(filterUniversityCatalog("", "GB", "EU"), []);
});

test("marks a nested university detail route as active", () => {
  assert.equal(isNavigationActive("/en/universities/sunway-university", "en", "universities"), true);
});

test("does not mark home active on nested routes", () => {
  assert.equal(isNavigationActive("/zh/universities", "zh", ""), false);
  assert.equal(isNavigationActive("/zh", "zh", ""), true);
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

test("APU and UTAR use the supplied local logos", () => {
  const apu = UNIVERSITY_CATALOG.find((university) => university.id === "apu");
  const utar = UNIVERSITY_CATALOG.find((university) => university.id === "utar");
  assert.equal(apu?.logoSrc, "/universities/asia-pacific-university.png");
  assert.equal(utar?.logoSrc, "/universities/universiti-tunku-abdul-rahman.png");
});

test("every supplied logo reference resolves to a nonempty public file", () => {
  const publicRoot = fileURLToPath(new URL("../../public/", import.meta.url));
  for (const university of UNIVERSITY_CATALOG) {
    if (!university.logoSrc) continue;
    const path = resolve(publicRoot, university.logoSrc.slice(1));
    assert.equal(existsSync(path), true, `${university.slug} logo is missing`);
    assert.ok(statSync(path).size > 0, `${university.slug} logo is empty`);
  }
});

test("every reviewed university has bilingual comparison and introduction data", () => {
  for (const university of UNIVERSITY_CATALOG) {
    const profile = universityProfile(university.id);
    assert.ok(profile, `${university.id} profile is missing`);
    assert.ok(profile.introductionZh.length > 20, `${university.id} Chinese introduction is incomplete`);
    assert.ok(profile.introductionEn.length > 20, `${university.id} English introduction is incomplete`);
    assert.ok(profile.subjectsZh.length >= 3, `${university.id} Chinese subjects are incomplete`);
    assert.equal(profile.subjectsZh.length, profile.subjectsEn.length, `${university.id} subject translations do not match`);
  }
});

test("every campus photo reference resolves to a nonempty public file", () => {
  const publicRoot = fileURLToPath(new URL("../../public/", import.meta.url));
  for (const university of UNIVERSITY_CATALOG) {
    const photo = universityProfile(university.id)?.campusImageSrc;
    if (!photo) continue;
    const path = resolve(publicRoot, photo.slice(1));
    assert.equal(existsSync(path), true, `${university.slug} campus photo is missing`);
    assert.ok(statSync(path).size > 0, `${university.slug} campus photo is empty`);
  }
});

test("University of Malaya uses the supplied modern campus photo", () => {
  assert.equal(universityProfile("um")?.campusImageSrc, "/universities/campuses/um-modern-campus.webp");
  assert.equal(universityProfile("um")?.imageCredit, undefined);
});

test("catalogue marks universities with supplied programme records as available", () => {
  for (const university of UNIVERSITY_CATALOG) {
    if (!localProgrammeLevels(university.slug).length) continue;
    assert.equal(university.programmeStatus, "available", `${university.id} should show available programme data`);
  }
});


