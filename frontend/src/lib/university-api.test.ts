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

function boundedPage(page: number, totalPages: number): number | undefined {
  const candidate = Reflect.get(site, "boundedPage");
  return typeof candidate === "function"
    ? (candidate as (page: number, totalPages: number) => number)(page, totalPages)
    : undefined;
}

type SearchPageParser = (payload: unknown) => unknown;
type UniversitySearchRequest = (
  baseUrl: string | undefined,
  query: site.Query,
  request?: typeof fetch,
) => Promise<unknown>;
type SchoolSummaryMapper = (item: unknown, locale: "zh" | "en") => unknown;
type UniversityDetailParser = (payload: unknown) => unknown;
type UniversityProgrammePageParser = (payload: unknown) => unknown;
type UniversityProgrammeParser = (payload: unknown) => unknown;
type UniversityDetailRequest = (
  baseUrl: string | undefined,
  slug: string,
  request?: typeof fetch,
) => Promise<unknown>;
type UniversityProgrammesRequest = (
  baseUrl: string | undefined,
  slug: string,
  query: site.Query,
  request?: typeof fetch,
) => Promise<unknown>;
type UniversityProgrammeRequest = (
  baseUrl: string | undefined,
  universitySlug: string,
  programmeIdentifier: string,
  request?: typeof fetch,
) => Promise<unknown>;
type UniversityDetailViewMapper = (
  university: unknown,
  programmes: unknown[],
  locale: "zh" | "en",
  options?: unknown,
) => universityApi.UniversityDetailView;

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

function parseUniversityDetail(payload: unknown): unknown {
  const candidate = Reflect.get(universityApi, "parseUniversityDetail");
  return typeof candidate === "function"
    ? (candidate as UniversityDetailParser)(payload)
    : undefined;
}

function parseUniversityProgrammePage(payload: unknown): unknown {
  const candidate = Reflect.get(universityApi, "parseUniversityProgrammePage");
  return typeof candidate === "function"
    ? (candidate as UniversityProgrammePageParser)(payload)
    : undefined;
}

function parseUniversityProgramme(payload: unknown): unknown {
  const candidate = Reflect.get(universityApi, "parseUniversityProgramme");
  return typeof candidate === "function"
    ? (candidate as UniversityProgrammeParser)(payload)
    : undefined;
}

async function requestUniversityDetail(
  baseUrl: string | undefined,
  slug: string,
  request?: typeof fetch,
): Promise<unknown> {
  const candidate = Reflect.get(universityApi, "getUniversityDetail");
  return typeof candidate === "function"
    ? (candidate as UniversityDetailRequest)(baseUrl, slug, request)
    : undefined;
}

async function requestUniversityProgrammes(
  baseUrl: string | undefined,
  slug: string,
  query: site.Query,
  request?: typeof fetch,
): Promise<unknown> {
  const candidate = Reflect.get(universityApi, "getUniversityProgrammes");
  return typeof candidate === "function"
    ? (candidate as UniversityProgrammesRequest)(baseUrl, slug, query, request)
    : undefined;
}

async function requestUniversityProgramme(
  baseUrl: string | undefined,
  universitySlug: string,
  programmeIdentifier: string,
  request?: typeof fetch,
): Promise<unknown> {
  const candidate = Reflect.get(universityApi, "getUniversityProgramme");
  return typeof candidate === "function"
    ? (candidate as UniversityProgrammeRequest)(baseUrl, universitySlug, programmeIdentifier, request)
    : undefined;
}

function toUniversityDetailView(
  university: unknown,
  programmes: unknown[],
  locale: "zh" | "en",
  options?: unknown,
): universityApi.UniversityDetailView {
  const candidate = Reflect.get(universityApi, "toUniversityDetailView");
  return typeof candidate === "function"
    ? (candidate as UniversityDetailViewMapper)(university, programmes, locale, options)
    : { name: "", country: "", city: "", description: "", programmes: [] };
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
      imageUrl: null,
    }],
    imageUrl: null,
  }],
  page: 1,
  pageSize: 12,
  totalItems: 1,
  totalPages: 1,
};

const validUniversityDetail = {
  id: 1,
  slug: "university-of-malaya",
  nameZh: "马来亚大学",
  nameEn: "University of Malaya",
  countryCode: "MY",
  countryNameZh: "马来西亚",
  countryNameEn: "Malaysia",
  cityZh: "吉隆坡",
  cityEn: "Kuala Lumpur",
  descriptionZh: "院校中文介绍",
  descriptionEn: "University description",
  popular: true,
  imageUrl: null,
};

const validUniversityProgrammePage = {
  items: [{
    id: 11,
    programmeCode: "BSC_CS",
    slug: "bachelor-computer-science",
    nameZh: "计算机科学学士",
    nameEn: "Bachelor of Computer Science",
    descriptionZh: "课程中文介绍",
    descriptionEn: "Programme description",
    categoryCode: "COMPUTING",
    studyLevelCode: "BACHELOR",
    courseModeCode: "ON_CAMPUS",
    languageCodes: ["EN"],
    durationMonths: 36,
    durationDisplay: "3 years",
    tuitionMin: 35000,
    tuitionMax: 40000,
    tuitionCurrency: "MYR",
    tuitionFeePeriod: "TOTAL_PROGRAM",
    tuitionTotalRmbMin: 55000,
    tuitionTotalRmbMax: 63000,
    exchangeRate: 1.57,
    exchangeRateDate: "2026-09-21",
    tuitionDisplay: "MYR 35,000–40,000",
    intakeMonths: ["2027-09"],
    intakeDisplayTexts: ["September 2027"],
    imageUrl: null,
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

test("bounds requested pages to the available page range", () => {
  assert.equal(boundedPage(999, 2), 2);
  assert.equal(boundedPage(2, 0), 1);
  assert.equal(boundedPage(1, 3), 1);
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
    countryCode: "MY",
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

test("accepts a complete V1 university detail response", () => {
  assert.deepEqual(parseUniversityDetail(validUniversityDetail), validUniversityDetail);
});

test("requests and parses a university detail by slug", async () => {
  let requestedUrl = "";
  const request = (async (input: string | URL | Request) => {
    requestedUrl = String(input);
    return new Response(JSON.stringify(validUniversityDetail), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }) as typeof fetch;

  assert.deepEqual(
    await requestUniversityDetail(
      "http://localhost:8080",
      "university-of-malaya",
      request,
    ),
    { status: "ready", university: validUniversityDetail },
  );
  assert.equal(
    requestedUrl,
    "http://localhost:8080/api/v1/universities/university-of-malaya",
  );
});

test("returns a not-found state when the university does not exist", async () => {
  const request = (async () => new Response(null, { status: 404 })) as typeof fetch;

  assert.deepEqual(
    await requestUniversityDetail(
      "http://localhost:8080",
      "missing-university",
      request,
    ),
    { status: "not-found" },
  );
});

test("accepts a complete university programme page", () => {
  assert.deepEqual(
    parseUniversityProgrammePage(validUniversityProgrammePage),
    validUniversityProgrammePage,
  );
});

test("requests and parses a university programme page", async () => {
  let requestedUrl = "";
  const request = (async (input: string | URL | Request) => {
    requestedUrl = String(input);
    return new Response(JSON.stringify(validUniversityProgrammePage), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }) as typeof fetch;

  assert.deepEqual(
    await requestUniversityProgrammes(
      "http://localhost:8080",
      "university-of-malaya",
      { page: "1" },
      request,
    ),
    { status: "ready", page: validUniversityProgrammePage },
  );
  assert.equal(
    requestedUrl,
    "http://localhost:8080/api/v1/universities/university-of-malaya/programmes?page=1&size=12&sort=relevance",
  );
});

test("requests one programme by its database id and preserves not-found separately from failures", async () => {
  const programme = validUniversityProgrammePage.items[0];
  let requestedUrl = "";
  const successful = (async (input: string | URL | Request) => {
    requestedUrl = String(input);
    return new Response(JSON.stringify(programme), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }) as typeof fetch;

  assert.deepEqual(parseUniversityProgramme(programme), programme);
  assert.deepEqual(
    await requestUniversityProgramme(
      "http://localhost:8080",
      "segi",
      "584",
      successful,
    ),
    { status: "ready", programme },
  );
  assert.equal(
    requestedUrl,
    "http://localhost:8080/api/v1/universities/segi/programmes/584",
  );

  const missing = (async () => new Response(null, { status: 404 })) as typeof fetch;
  assert.deepEqual(
    await requestUniversityProgramme("http://localhost:8080", "segi", "999999", missing),
    { status: "not-found" },
  );

  const unavailable = (async () => new Response(null, { status: 503 })) as typeof fetch;
  assert.deepEqual(
    await requestUniversityProgramme("http://localhost:8080", "segi", "584", unavailable),
    { status: "error" },
  );
});

test("maps university details and programmes to localized display data", () => {
  assert.deepEqual(
    toUniversityDetailView(
      validUniversityDetail,
      validUniversityProgrammePage.items,
      "zh",
    ),
    {
      name: "马来亚大学",
      secondaryName: "University of Malaya",
      country: "马来西亚",
      city: "吉隆坡",
      description: "院校中文介绍",
      programmes: [{
        id: "11",
        name: "计算机科学学士",
        secondaryName: "Bachelor of Computer Science",
        description: "课程中文介绍",
        category: "COMPUTING",
        level: "BACHELOR",
        mode: "ON_CAMPUS",
        languages: "EN",
        duration: "3 years",
        tuition: "MYR 35,000–40,000",
        intakes: "September 2027",
      }],
    },
  );
});

test("English university views stay English and omit Chinese secondary labels", () => {
  const view = toUniversityDetailView(
    validUniversityDetail,
    validUniversityProgrammePage.items,
    "en",
  );

  assert.equal(view.name, "University of Malaya");
  assert.equal(view.secondaryName, undefined);
  assert.equal(view.description, "University description");
  assert.equal(view.programmes[0]?.name, "Bachelor of Computer Science");
  assert.equal(view.programmes[0]?.secondaryName, undefined);
  assert.equal(view.programmes[0]?.description, "Programme description");
});

test("English views do not fall back to Chinese when English copy is missing", () => {
  const view = toUniversityDetailView(
    { ...validUniversityDetail, nameEn: null, descriptionEn: null },
    [{ ...validUniversityProgrammePage.items[0], nameEn: null, descriptionEn: null }],
    "en",
  );

  assert.equal(view.name, "university-of-malaya");
  assert.equal(view.description, "");
  assert.equal(view.programmes[0]?.name, "BSc CS");
  assert.equal(view.programmes[0]?.description, "");
});

test("localizes programme dictionary codes with catalog options", () => {
  assert.deepEqual(
    toUniversityDetailView(
      validUniversityDetail,
      validUniversityProgrammePage.items,
      "zh",
      {
        countries: [],
        subjectCategories: [{ code: "COMPUTING", nameZh: "计算机", nameEn: "Computing" }],
        studyLevels: [{ code: "BACHELOR", nameZh: "本科", nameEn: "Bachelor's" }],
        courseModes: [{ code: "ON_CAMPUS", nameZh: "校内授课", nameEn: "On campus" }],
        languages: [{ code: "EN", nameZh: "英语", nameEn: "English" }],
      },
    ),
    {
      name: "马来亚大学",
      secondaryName: "University of Malaya",
      country: "马来西亚",
      city: "吉隆坡",
      description: "院校中文介绍",
      programmes: [{
        id: "11",
        name: "计算机科学学士",
        secondaryName: "Bachelor of Computer Science",
        description: "课程中文介绍",
        category: "计算机",
        level: "本科",
        mode: "校内授课",
        languages: "英语",
        duration: "3 years",
        tuition: "MYR 35,000–40,000",
        intakes: "September 2027",
      }],
    },
  );
});
