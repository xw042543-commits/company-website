import { buildUniversitySearchPath, type Query } from "./site.ts";

export type MatchedProgramme = {
  id: number;
  programmeCode: string;
  nameZh: string | null;
  nameEn: string | null;
  categoryCode: string;
  studyLevelCode: string | null;
  courseModeCode: string | null;
  languageCodes: string[];
  durationMonths: number | null;
  intakeMonths: string[];
  tuitionTotalRmbMin: number | null;
  tuitionTotalRmbMax: number | null;
  durationDisplay: string | null;
  intakeDisplayTexts: string[];
  tuitionDisplay: string | null;
};

export type UniversitySearchItem = {
  id: number;
  slug: string;
  nameZh: string | null;
  nameEn: string | null;
  countryCode: string | null;
  countryNameZh: string | null;
  countryNameEn: string | null;
  cityZh: string | null;
  cityEn: string | null;
  popular: boolean;
  matchedProgrammeCount: number;
  matchedProgrammes: MatchedProgramme[];
};

export type UniversitySearchPage = {
  items: UniversitySearchItem[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

export type UniversitySearchRequestResult =
  | { status: "ready"; page: UniversitySearchPage }
  | { status: "error" };

export type SchoolSummaryData = {
  id: string;
  slug: string;
  name: string;
  nameZh?: string;
  nameEn?: string;
  country: string;
  countryZh?: string;
  countryEn?: string;
  city?: string;
  cityZh?: string;
  cityEn?: string;
  matchedProgrammeCount: number;
  matchedCourses: Array<{
    id: string;
    name: string;
    level?: string;
    language?: string;
  }>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isInteger(value: unknown, minimum = 0): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= minimum;
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === "string";
}

function isNullableNumber(value: unknown): value is number | null {
  return value === null || (typeof value === "number" && Number.isFinite(value));
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isMatchedProgramme(value: unknown): value is MatchedProgramme {
  if (!isRecord(value)) return false;

  return isInteger(value.id, 1)
    && typeof value.programmeCode === "string"
    && isNullableString(value.nameZh)
    && isNullableString(value.nameEn)
    && typeof value.categoryCode === "string"
    && isNullableString(value.studyLevelCode)
    && isNullableString(value.courseModeCode)
    && isStringArray(value.languageCodes)
    && (value.durationMonths === null || isInteger(value.durationMonths, 1))
    && isStringArray(value.intakeMonths)
    && isNullableNumber(value.tuitionTotalRmbMin)
    && isNullableNumber(value.tuitionTotalRmbMax)
    && isNullableString(value.durationDisplay)
    && isStringArray(value.intakeDisplayTexts)
    && isNullableString(value.tuitionDisplay);
}

function isUniversitySearchItem(value: unknown): value is UniversitySearchItem {
  if (!isRecord(value)) return false;

  return isInteger(value.id, 1)
    && typeof value.slug === "string"
    && value.slug.trim().length > 0
    && isNullableString(value.nameZh)
    && isNullableString(value.nameEn)
    && isNullableString(value.countryCode)
    && isNullableString(value.countryNameZh)
    && isNullableString(value.countryNameEn)
    && isNullableString(value.cityZh)
    && isNullableString(value.cityEn)
    && typeof value.popular === "boolean"
    && isInteger(value.matchedProgrammeCount)
    && Array.isArray(value.matchedProgrammes)
    && value.matchedProgrammes.every(isMatchedProgramme);
}

export function parseUniversitySearchPage(payload: unknown): UniversitySearchPage | null {
  if (!isRecord(payload)
    || !Array.isArray(payload.items)
    || !payload.items.every(isUniversitySearchItem)
    || !isInteger(payload.page, 1)
    || !isInteger(payload.pageSize, 1)
    || !isInteger(payload.totalItems)
    || !isInteger(payload.totalPages)) {
    return null;
  }

  const expectedTotalPages = payload.totalItems === 0
    ? 0
    : Math.ceil(payload.totalItems / payload.pageSize);
  if (payload.totalPages !== expectedTotalPages) return null;

  return payload as UniversitySearchPage;
}

export async function searchUniversities(
  baseUrl: string | undefined,
  query: Query,
  request: typeof fetch = fetch,
): Promise<UniversitySearchRequestResult> {
  if (!baseUrl) return { status: "error" };

  try {
    const url = new URL(buildUniversitySearchPath(query), baseUrl);
    const response = await request(url, {
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return { status: "error" };

    const page = parseUniversitySearchPage(await response.json());
    return page ? { status: "ready", page } : { status: "error" };
  } catch {
    return { status: "error" };
  }
}

function preferredText(
  locale: "zh" | "en",
  zh: string | null,
  en: string | null,
  fallback: string,
) {
  return locale === "zh"
    ? zh?.trim() || en?.trim() || fallback
    : en?.trim() || zh?.trim() || fallback;
}

export function toSchoolSummary(
  item: UniversitySearchItem,
  locale: "zh" | "en",
): SchoolSummaryData {
  const name = preferredText(locale, item.nameZh, item.nameEn, item.slug);
  const country = preferredText(
    locale,
    item.countryNameZh,
    item.countryNameEn,
    item.countryCode ?? "",
  );
  const city = preferredText(locale, item.cityZh, item.cityEn, "");

  return {
    id: String(item.id),
    slug: item.slug,
    name,
    ...(item.nameZh ? { nameZh: item.nameZh } : {}),
    ...(item.nameEn ? { nameEn: item.nameEn } : {}),
    country,
    ...(item.countryNameZh ? { countryZh: item.countryNameZh } : {}),
    ...(item.countryNameEn ? { countryEn: item.countryNameEn } : {}),
    ...(city ? { city } : {}),
    ...(item.cityZh ? { cityZh: item.cityZh } : {}),
    ...(item.cityEn ? { cityEn: item.cityEn } : {}),
    matchedProgrammeCount: item.matchedProgrammeCount,
    matchedCourses: item.matchedProgrammes.slice(0, 3).map((programme) => ({
      id: String(programme.id),
      name: preferredText(
        locale,
        programme.nameZh,
        programme.nameEn,
        programme.programmeCode,
      ),
      ...(programme.studyLevelCode ? { level: programme.studyLevelCode } : {}),
      ...(programme.languageCodes.length
        ? { language: programme.languageCodes.join(", ") }
        : {}),
    })),
  };
}
