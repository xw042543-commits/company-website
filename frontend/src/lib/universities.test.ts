import assert from "node:assert/strict";
import test from "node:test";

import * as universities from "./universities.ts";

const { getUniversitySearch } = universities;

test("uses the reviewed local catalogue when the API is not configured", async () => {
  const result = await getUniversitySearch({}, "en", undefined);

  assert.equal(result.status, "ready");
  if (result.status !== "ready") return;
  assert.equal(result.totalItems, 20);
  assert.equal(result.schools.length, 12);
  assert.equal(result.schools[0]?.name, "University of Malaya");
});

test("filters and paginates the local university catalogue", async () => {
  const search = await getUniversitySearch({ q: "APU" }, "en", undefined);
  assert.equal(search.status, "ready");
  if (search.status !== "ready") return;
  assert.deepEqual(search.schools.map((school) => school.slug), ["asia-pacific-university"]);

  const secondPage = await getUniversitySearch({ page: "2" }, "en", undefined);
  assert.equal(secondPage.status, "ready");
  if (secondPage.status !== "ready") return;
  assert.equal(secondPage.page, 2);
  assert.equal(secondPage.schools.length, 8);
});

test("loads a reviewed university profile without an external API", async () => {
  const loadDetail = Reflect.get(universities, "getUniversityDetailWithFallback");
  assert.equal(typeof loadDetail, "function");

  const result = await loadDetail("university-of-malaya", undefined);
  assert.equal(result.status, "ready");
  assert.equal(result.university.nameEn, "University of Malaya");
  assert.match(result.university.descriptionEn ?? "", /public research university/i);
});

test("returns an empty reviewed programme page when the API is not configured", async () => {
  const loadProgrammes = Reflect.get(universities, "getUniversityProgrammesWithFallback");
  assert.equal(typeof loadProgrammes, "function");

  const result = await loadProgrammes("university-of-malaya", {}, undefined);
  assert.equal(result.status, "ready");
  assert.deepEqual(result.page.items, []);
  assert.equal(result.page.totalItems, 0);
});
