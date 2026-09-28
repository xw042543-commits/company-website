import assert from "node:assert/strict";
import test from "node:test";

import * as universities from "./universities.ts";

const { getUniversitySearch } = universities;

test("uses the reviewed local catalogue when the API is not configured", async () => {
  const result = await getUniversitySearch({}, "en", "");

  assert.equal(result.status, "ready");
  if (result.status !== "ready") return;
  assert.equal(result.totalItems, 20);
  assert.equal(result.schools.length, 12);
  assert.equal(result.schools[0]?.name, "University of Malaya");
});

test("filters and paginates the local university catalogue", async () => {
  const search = await getUniversitySearch({ q: "APU" }, "en", "");
  assert.equal(search.status, "ready");
  if (search.status !== "ready") return;
  assert.deepEqual(search.schools.map((school) => school.slug), ["asia-pacific-university"]);

  const secondPage = await getUniversitySearch({ page: "2" }, "en", "");
  assert.equal(secondPage.status, "ready");
  if (secondPage.status !== "ready") return;
  assert.equal(secondPage.page, 2);
  assert.equal(secondPage.schools.length, 8);
});

test("loads a reviewed university profile without an external API", async () => {
  const loadDetail = Reflect.get(universities, "getUniversityDetailWithFallback");
  assert.equal(typeof loadDetail, "function");

  const result = await loadDetail("university-of-malaya", "");
  assert.equal(result.status, "ready");
  assert.equal(result.university.nameEn, "University of Malaya");
  assert.match(result.university.descriptionEn ?? "", /public research university/i);
});

test("loads reviewed local programmes when the API is not configured", async () => {
  const loadProgrammes = Reflect.get(universities, "getUniversityProgrammesWithFallback");
  assert.equal(typeof loadProgrammes, "function");

  const result = await loadProgrammes("university-of-malaya", {}, "");
  assert.equal(result.status, "ready");
  assert.ok(result.page.items.length > 0);
  assert.ok(result.page.totalItems > 0);
  assert.equal(result.page.items[0]?.studyLevelCode, "bachelor");
});

test("filters reviewed local programmes by degree level", async () => {
  const loadProgrammes = Reflect.get(universities, "getUniversityProgrammesWithFallback");
  const result = await loadProgrammes("university-of-malaya", { level: "doctorate" }, "");

  assert.equal(result.status, "ready");
  assert.ok(result.page.items.length > 0);
  assert.ok(result.page.items.every((programme: { studyLevelCode: string }) => programme.studyLevelCode === "doctorate"));
});

test("paginates reviewed local programmes using twelve records per page", async () => {
  const loadProgrammes = Reflect.get(universities, "getUniversityProgrammesWithFallback");
  const firstPage = await loadProgrammes("university-of-malaya", { page: "1" }, "");
  const secondPage = await loadProgrammes("university-of-malaya", { page: "2" }, "");

  assert.equal(firstPage.status, "ready");
  assert.equal(secondPage.status, "ready");
  assert.equal(firstPage.page.pageSize, 12);
  assert.ok(firstPage.page.totalItems > 12);
  assert.equal(secondPage.page.page, 2);
  assert.notEqual(firstPage.page.items[0]?.id, secondPage.page.items[0]?.id);
});
