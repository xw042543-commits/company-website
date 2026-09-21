import assert from "node:assert/strict";
import test from "node:test";

import * as universityApi from "./university-api.ts";
import * as site from "./site.ts";

type SearchPathBuilder = (query: site.Query) => string;

function buildSearchPath(query: site.Query): string | undefined {
  const candidate = Reflect.get(site, "buildUniversitySearchPath");
  return typeof candidate === "function"
    ? (candidate as SearchPathBuilder)(query)
    : undefined;
}

type SearchPageParser = (payload: unknown) => unknown;
type UniversitySearchRequest = (
  baseUrl: string | undefined,
  query: site.Query,
  request?: typeof fetch,
) => Promise<unknown>;
type SchoolSummaryMapper = (item: unknown, locale: "zh" | "en") => unknown;

function parseSearchPage(payload: unknown): unknown {
  const candidate = Reflect.get(universityApi, "parseUniversitySearchPage");
  return typeof candidate === "function"
    ? (candidate as SearchPageParser)(payload)
    : undefined;
}

async function requestUniversitySearch(
  baseUrl: string | undefined,
  query: site.Query,
  request?: typeof fetch,
): Promise<unknown> {
  const candidate = Reflect.get(universityApi, "searchUniversities");
  return typeof candidate === "function"
    ? (candidate as UniversitySearchRequest)(baseUrl, query, request)
    : undefined;
}

function toSchoolSummary(item: unknown, locale: "zh" | "en"): unknown {
  const candidate = Reflect.get(universityApi, "toSchoolSummary");
  return typeof candidate === "function"
    ? (candidate as SchoolSummaryMapper)(item, locale)
    : undefined;
}

const validSearchPage = {
  items: [{
    id: 1,
    slug: "university-of-malaya",
    nameZh: "马来亚大学",
    nameEn: "University of Malaya",
    countryCode: "MY",
    countryNameZh: "马来西亚",
    countryNameEn: "Malaysia",
    cityZh: "吉隆坡",
    cityEn: "Kuala Lumpur",
    popular: true,
    matchedProgrammeCount: 1,
    matchedProgrammes: [{
      id: 11,
      programmeCode: "BSC_CS",
      nameZh: "计算机科学学士",
      nameEn: "Bachelor of Computer Science",
      categoryCode: "COMPUTING",
      studyLevelCode: "BACHELOR",
      courseModeCode: "ON_CAMPUS",
      languageCodes: ["EN"],
      durationMonths: 36,
      intakeMonths: ["2027-09"],
      tuitionTotalRmbMin: 100000,
      tuitionTotalRmbMax: 120000,
      durationDisplay: "3 years",
      intakeDisplayTexts: ["September 2027"],
      tuitionDisplay: "CNY 100,000–120,000",
    }],
  }],
  page: 1,
  pageSize: 12,
  totalItems: 1,
  totalPages: 1,
};

test("builds the V1 university search path from every supported filter", () => {
  assert.equal(
    buildSearchPath({
      q: "data science",
      category: "COMPUTING",
      level: "BACHELOR",
      country: "MY",
      mode: "ON_CAMPUS",
      language: "EN",
      duration: "36",
      intake: "2027-09",
      tuitionMin: "100000",
      tuitionMax: "200000",
      page: "2",
    }),
    "/api/v1/universities/search?q=data+science&category=COMPUTING&level=BACHELOR&country=MY&mode=ON_CAMPUS&language=EN&duration=36&intake=2027-09&tuitionMin=100000&tuitionMax=200000&page=2&size=12&sort=relevance",
  );
});

test("preserves repeated filters and removes blank values", () => {
  assert.equal(
    buildSearchPath({
      category: ["COMPUTING", "", "BUSINESS"],
      language: ["EN", "ZH"],
      country: "  ",
    }),
    "/api/v1/universities/search?category=COMPUTING&category=BUSINESS&language=EN&language=ZH&page=1&size=12&sort=relevance",
  );
});

test("uses safe pagination and ignores unsupported query parameters", () => {
  assert.equal(
    buildSearchPath({ page: "0", size: "500", continent: "AS", unexpected: "value" }),
    "/api/v1/universities/search?page=1&size=12&sort=relevance",
  );
});

test("pagination links preserve every repeated filter", () => {
  assert.equal(
    site.pageLink("/zh/planning", {
      category: ["COMPUTING", "BUSINESS"],
      language: ["EN", "ZH"],
      page: "1",
    }, 2),
    "/zh/planning?category=COMPUTING&category=BUSINESS&language=EN&language=ZH&page=2",
  );
});

test("accepts a complete V1 university search page", () => {
  assert.deepEqual(parseSearchPage(validSearchPage), validSearchPage);
});

test("rejects legacy arrays and invalid page metadata", () => {
  assert.equal(parseSearchPage([]), null);
  assert.equal(parseSearchPage({ items: [], page: 0, pageSize: 12, totalItems: 0, totalPages: 0 }), null);
});

test("requests and parses the V1 university search endpoint", async () => {
  let requestedUrl = "";
  const request = (async (input: string | URL | Request) => {
    requestedUrl = String(input);
    return new Response(JSON.stringify(validSearchPage), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }) as typeof fetch;

  assert.deepEqual(
    await requestUniversitySearch("http://localhost:8080", { q: "data science" }, request),
    { status: "ready", page: validSearchPage },
  );
  assert.equal(
    requestedUrl,
    "http://localhost:8080/api/v1/universities/search?q=data+science&page=1&size=12&sort=relevance",
  );
});

test("returns an error state for unsuccessful backend responses", async () => {
  const request = (async () => new Response(null, { status: 500 })) as typeof fetch;

  assert.deepEqual(
    await requestUniversitySearch("http://localhost:8080", {}, request),
    { status: "error" },
  );
});

test("returns an error state when the backend payload is malformed", async () => {
  const request = (async () => new Response(JSON.stringify([]), { status: 200 })) as typeof fetch;

  assert.deepEqual(
    await requestUniversitySearch("http://localhost:8080", {}, request),
    { status: "error" },
  );
});

test("maps a V1 result to a localized card with at most three programmes", () => {
  const item = {
    ...validSearchPage.items[0],
    matchedProgrammeCount: 4,
    matchedProgrammes: [
      ...validSearchPage.items[0].matchedProgrammes,
      ...[12, 13, 14].map((id) => ({
        ...validSearchPage.items[0].matchedProgrammes[0],
        id,
        programmeCode: `PROGRAMME_${id}`,
        nameZh: `专业 ${id}`,
        nameEn: `Programme ${id}`,
      })),
    ],
  };

  assert.deepEqual(toSchoolSummary(item, "zh"), {
    id: "1",
    slug: "university-of-malaya",
    name: "马来亚大学",
    nameZh: "马来亚大学",
    nameEn: "University of Malaya",
    country: "马来西亚",
    countryZh: "马来西亚",
    countryEn: "Malaysia",
    city: "吉隆坡",
    cityZh: "吉隆坡",
    cityEn: "Kuala Lumpur",
    matchedProgrammeCount: 4,
    matchedCourses: [
      { id: "11", name: "计算机科学学士", level: "BACHELOR", language: "EN" },
      { id: "12", name: "专业 12", level: "BACHELOR", language: "EN" },
      { id: "13", name: "专业 13", level: "BACHELOR", language: "EN" },
    ],
  });
});
