import { buildUniversitySearchPath, type Query } from "./site.ts";
import type { FilterOption, FilterOptions } from "./filter-options-api.ts";
import { requestInternalApi } from "./internal-api-request.ts";

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

export type UniversityDetail = {
  id: number;
  slug: string;
  nameZh: string | null;
  nameEn: string | null;
  countryCode: string | null;
  countryNameZh: string | null;
  countryNameEn: string | null;
  cityZh: string | null;
  cityEn: string | null;
  descriptionZh: string | null;
  descriptionEn: string | null;
  popular: boolean;
};

export type UniversityProgramme = {
  id: number;
  programmeCode: string;
  slug: string;
  nameZh: string | null;
  nameEn: string | null;
  descriptionZh: string | null;
  descriptionEn: string | null;
  categoryCode: string;
  studyLevelCode: string | null;
  courseModeCode: string | null;
  languageCodes: string[];
  durationMonths: number | null;
  durationDisplay: string | null;
  tuitionMin: number | null;
  tuitionMax: number | null;
  tuitionCurrency: string | null;
  tuitionFeePeriod: string;
  tuitionTotalRmbMin: number | null;
  tuitionTotalRmbMax: number | null;
  exchangeRate: number | null;
  exchangeRateDate: string | null;
  tuitionDisplay: string | null;
  intakeMonths: string[];
  intakeDisplayTexts: string[];
  categoryDisplayZh?: string;
  categoryDisplayEn?: string;
};

export type UniversityProgrammePage = {
  items: UniversityProgramme[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

export type UniversitySearchRequestResult =
  | { status: "ready"; page: UniversitySearchPage }
  | { status: "error" };

export type UniversityDetailRequestResult =
  | { status: "ready"; university: UniversityDetail }
  | { status: "not-found" }
  | { status: "error" };

export type UniversityProgrammesRequestResult =
  | { status: "ready"; page: UniversityProgrammePage }
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

export type UniversityDetailView = {
  name: string;
  secondaryName?: string;
  country: string;
  city: string;
  description: string;
  programmes: Array<{
    id: string;
    name: string;
    secondaryName?: string;
    description: string;
    category: string;
    level: string;
    mode: string;
    languages: string;
    duration: string;
    tuition: string;
    intakes: string;
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

function isUniversityProgramme(value: unknown): value is UniversityProgramme {
  if (!isRecord(value)) return false;

  return isInteger(value.id, 1)
    && typeof value.programmeCode === "string"
    && typeof value.slug === "string"
    && isNullableString(value.nameZh)
    && isNullableString(value.nameEn)
    && isNullableString(value.descriptionZh)
    && isNullableString(value.descriptionEn)
    && typeof value.categoryCode === "string"
    && isNullableString(value.studyLevelCode)
    && isNullableString(value.courseModeCode)
    && isStringArray(value.languageCodes)
    && (value.durationMonths === null || isInteger(value.durationMonths, 1))
    && isNullableString(value.durationDisplay)
    && isNullableNumber(value.tuitionMin)
    && isNullableNumber(value.tuitionMax)
    && isNullableString(value.tuitionCurrency)
    && typeof value.tuitionFeePeriod === "string"
    && isNullableNumber(value.tuitionTotalRmbMin)
    && isNullableNumber(value.tuitionTotalRmbMax)
    && isNullableNumber(value.exchangeRate)
    && isNullableString(value.exchangeRateDate)
    && isNullableString(value.tuitionDisplay)
    && isStringArray(value.intakeMonths)
    && isStringArray(value.intakeDisplayTexts);
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

export function parseUniversityDetail(payload: unknown): UniversityDetail | null {
  if (!isRecord(payload)
    || !isInteger(payload.id, 1)
    || typeof payload.slug !== "string"
    || payload.slug.trim().length === 0
    || !isNullableString(payload.nameZh)
    || !isNullableString(payload.nameEn)
    || !isNullableString(payload.countryCode)
    || !isNullableString(payload.countryNameZh)
    || !isNullableString(payload.countryNameEn)
    || !isNullableString(payload.cityZh)
    || !isNullableString(payload.cityEn)
    || !isNullableString(payload.descriptionZh)
    || !isNullableString(payload.descriptionEn)
    || typeof payload.popular !== "boolean") {
    return null;
  }

  return payload as UniversityDetail;
}

export function parseUniversityProgrammePage(
  payload: unknown,
): UniversityProgrammePage | null {
  if (!isRecord(payload)
    || !Array.isArray(payload.items)
    || !payload.items.every(isUniversityProgramme)
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

  return payload as UniversityProgrammePage;
}

export async function searchUniversities(
  baseUrl: string | undefined,
  query: Query,
  request: typeof fetch = fetch,
): Promise<UniversitySearchRequestResult> {
  if (!baseUrl) return { status: "error" };

  try {
    const url = new URL(buildUniversitySearchPath(query), baseUrl);
    const response = await requestInternalApi(request, url, {
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

export async function getUniversityDetail(
  baseUrl: string | undefined,
  slug: string,
  request: typeof fetch = fetch,
): Promise<UniversityDetailRequestResult> {
  if (!baseUrl || !slug.trim()) return { status: "error" };

  try {
    const path = `/api/v1/universities/${encodeURIComponent(slug)}`;
    const response = await requestInternalApi(request, new URL(path, baseUrl), {
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (response.status === 404) return { status: "not-found" };
    if (!response.ok) return { status: "error" };

    const university = parseUniversityDetail(await response.json());
    return university ? { status: "ready", university } : { status: "error" };
  } catch {
    return { status: "error" };
  }
}

export async function getUniversityProgrammes(
  baseUrl: string | undefined,
  slug: string,
  query: Query,
  request: typeof fetch = fetch,
): Promise<UniversityProgrammesRequestResult> {
  if (!baseUrl || !slug.trim()) return { status: "error" };

  try {
    const searchUrl = new URL(buildUniversitySearchPath(query), baseUrl);
    const path = `/api/v1/universities/${encodeURIComponent(slug)}/programmes`;
    const url = new URL(`${path}${searchUrl.search}`, baseUrl);
    const response = await requestInternalApi(request, url, {
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return { status: "error" };

    const page = parseUniversityProgrammePage(await response.json());
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

export function toUniversityDetailView(
  university: UniversityDetail,
  programmes: UniversityProgramme[],
  locale: "zh" | "en",
  options?: FilterOptions,
): UniversityDetailView {
  const name = preferredText(locale, university.nameZh, university.nameEn, university.slug);
  const secondaryName = locale === "zh" ? university.nameEn : university.nameZh;

  return {
    name,
    ...(secondaryName?.trim() && secondaryName.trim() !== name
      ? { secondaryName: secondaryName.trim() }
      : {}),
    country: preferredText(
      locale,
      university.countryNameZh,
      university.countryNameEn,
      university.countryCode ?? "",
    ),
    city: preferredText(locale, university.cityZh, university.cityEn, ""),
    description: preferredText(
      locale,
      university.descriptionZh,
      university.descriptionEn,
      "",
    ),
    programmes: programmes.map((programme) => {
      const programmeName = preferredText(
        locale,
        programme.nameZh,
        programme.nameEn,
        programme.programmeCode,
      );
      const programmeSecondaryName = locale === "zh"
        ? programme.nameEn
        : programme.nameZh;

      return {
        id: String(programme.id),
        name: programmeName,
        ...(programmeSecondaryName?.trim()
          && programmeSecondaryName.trim() !== programmeName
          ? { secondaryName: programmeSecondaryName.trim() }
          : {}),
        description: preferredText(
          locale,
          programme.descriptionZh,
          programme.descriptionEn,
          "",
        ),
        category: locale === "zh"
          ? programme.categoryDisplayZh?.trim() || localizedOption(options?.subjectCategories, programme.categoryCode, locale)
          : programme.categoryDisplayEn?.trim() || localizedOption(options?.subjectCategories, programme.categoryCode, locale),
        level: localizedOption(options?.studyLevels, programme.studyLevelCode, locale),
        mode: localizedOption(options?.courseModes, programme.courseModeCode, locale),
        languages: programme.languageCodes
          .map((code) => localizedOption(options?.languages, code, locale))
          .join(", "),
        duration: programme.durationDisplay ?? "",
        tuition: programme.tuitionDisplay ?? "",
        intakes: programme.intakeDisplayTexts.join(", "),
      };
    }),
  };
}

function localizedOption(
  options: FilterOption[] | undefined,
  code: string | null,
  locale: "zh" | "en",
) {
  if (!code) return "";
  const option = options?.find((candidate) => candidate.code === code);
  if (!option) return code;
  return locale === "zh"
    ? option.nameZh.trim() || option.nameEn.trim() || code
    : option.nameEn.trim() || option.nameZh.trim() || code;
}
