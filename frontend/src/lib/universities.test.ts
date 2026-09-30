import assert from "node:assert/strict";
import test from "node:test";

import * as universities from "./universities.ts";

const { getUniversitySearch } = universities;

test("enriches database search results with the reviewed public identity", () => {
  const enrichSchoolSummary = Reflect.get(universities, "enrichSchoolSummary");
  assert.equal(typeof enrichSchoolSummary, "function");

  assert.deepEqual(
    enrichSchoolSummary({
      id: "9",
      slug: "segi",
      name: "世纪大学",
      nameZh: "世纪大学",
      nameEn: "SEGi University",
      country: "马来西亚",
      countryZh: "马来西亚",
      countryEn: "Malaysia",
      matchedProgrammeCount: 0,
      matchedCourses: [],
    }, "zh"),
    {
      id: "9",
      slug: "segi-university",
      name: "世纪大学",
      nameZh: "世纪大学",
      nameEn: "SEGi University",
      country: "马来西亚",
      countryZh: "马来西亚",
      countryEn: "Malaysia",
      city: "哥打白沙罗",
      cityZh: "哥打白沙罗",
      cityEn: "Kota Damansara",
      logoSrc: "/universities/segi-university.jpg",
      aliases: ["SEGi", "SEGI", "世纪"],
      programmeStatus: "available",
      matchedProgrammeCount: 0,
      matchedCourses: [],
    },
  );
});

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

test("falls back to reviewed university data when the configured API has no matching record", async () => {
  const request = (async () => new Response(null, { status: 404 })) as typeof fetch;
  const result = await universities.getUniversityDetailWithFallback(
    "asia-pacific-university",
    "https://api.example.test",
    request,
  );

  assert.equal(result.status, "ready");
  if (result.status !== "ready") return;
  assert.equal(result.university.nameEn, "Asia Pacific University of Technology & Innovation");
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

test("falls back to reviewed programmes when the configured API has no matching record", async () => {
  const request = (async () => new Response(null, { status: 404 })) as typeof fetch;
  const result = await universities.getUniversityProgrammesWithFallback(
    "university-of-malaya",
    {},
    "https://api.example.test",
    request,
  );

  assert.equal(result.status, "ready");
  if (result.status !== "ready") return;
  assert.ok(result.page.items.length > 0);
});

test("filters reviewed local programmes by degree level", async () => {
  const loadProgrammes = Reflect.get(universities, "getUniversityProgrammesWithFallback");
  const result = await loadProgrammes("university-of-malaya", { level: "doctorate" }, "");

  assert.equal(result.status, "ready");
  assert.ok(result.page.items.length > 0);
  assert.ok(result.page.items.every((programme: { studyLevelCode: string | null }) => programme.studyLevelCode === "doctorate"));
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
