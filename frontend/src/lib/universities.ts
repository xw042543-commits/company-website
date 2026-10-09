import {
  backendUniversitySlug,
  filterUniversityCatalog,
  findUniversityBySlug,
  localizeUniversity,
  UNIVERSITY_CATALOG,
  type ProgrammeStatus,
} from "../data/university-catalog.ts";
import { FEATURED_UNIVERSITY_IDS, universityProfile } from "../data/university-profiles.ts";
import { findLocalProgrammeBySlug, localProgrammeMatches, localProgrammePage, type LocalProgrammeDetail } from "../data/local-programmes.ts";
import {
  getUniversityProgramme,
  getUniversityDetail,
  getUniversityProgrammes,
  searchUniversities,
  toSchoolSummary,
} from "./university-api.ts";
import { boundedPage, first, formatEnglishDisplayText, pageNumber, type Locale, type Query } from "./site.ts";
import { requestInternalApi } from "./internal-api-request.ts";
import type { FilterOptions } from "./filter-options-api.ts";

export type SchoolSummary = {
  id: string;
  slug: string;
  name: string;
  country: string;
  countryCode?: string;
  city?: string;
  nameZh?: string;
  nameEn?: string;
  countryZh?: string;
  countryEn?: string;
  cityZh?: string;
  cityEn?: string;
  logoSrc?: string;
  aliases?: string[];
  programmeStatus?: ProgrammeStatus;
  matchedProgrammeCount?: number;
  matchedCourses?: { id: string; name: string; level?: string; language?: string }[];
};
export type SchoolResult = { status: "ready"; schools: SchoolSummary[] } | { status: "error" };
export type SchoolSearchResult =
  | {
    status: "ready";
    schools: SchoolSummary[];
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  }
  | { status: "error" };

function localSchools(query: string, country: string, continent: string, locale: Locale = "en"): SchoolSummary[] {
  return filterUniversityCatalog(query, country, continent).map((university) => ({
    ...university,
    ...localizeUniversity(university, locale),
  }));
}

export function enrichSchoolSummary(
  school: SchoolSummary,
  locale: Locale,
): SchoolSummary {
  const university = findUniversityBySlug(school.slug);
  if (!university) return school;

  const localized = localizeUniversity(university, locale);
  return {
    ...school,
    slug: university.slug,
    city: school.city?.trim() || localized.city,
    cityZh: school.cityZh?.trim() || university.cityZh,
    cityEn: school.cityEn?.trim() || university.cityEn,
    logoSrc: university.logoSrc,
    aliases: university.aliases,
    programmeStatus: university.programmeStatus,
  };
}

// The reviewed local catalogue is the public fallback until the API catalogue is configured.
// Course search and details require a separately reviewed backend contract.
export async function getSchools(query = "", geography: { country?: string; continent?: string } = {}, base?: string): Promise<SchoolResult> {
  const country = geography.country ?? "";
  const continent = geography.continent ?? "";
  if (!base || country || continent) return { status: "ready", schools: localSchools(query, country, continent) };
  try {
    const url = new URL(query ? `/api/search?q=${encodeURIComponent(query)}` : "/api/universities", base);
    const response = await requestInternalApi(fetch, url, { cache: "no-store", signal: AbortSignal.timeout(5000) });
    if (!response.ok) return { status: "error" };
    const data: unknown = await response.json();
    if (!Array.isArray(data)) return { status: "error" };
    const schools = new Map<string, SchoolSummary>();
    for (const row of data) {
      if (!row || typeof row !== "object" || !["string", "number"].includes(typeof row.id) ||
          typeof row.name !== "string" || !row.name.trim() || typeof row.slug !== "string" || !row.slug.trim() ||
          typeof row.country !== "string") return { status: "error" };
      const id = String(row.id);
      if (!id.trim()) return { status: "error" };
      if (!schools.has(id)) schools.set(id, { id, slug: row.slug, name: row.name, country: row.country });
    }
    return { status: "ready", schools: [...schools.values()] };
  } catch {
    // Do not expose server paths, URLs or raw backend errors to visitors.
    return { status: "error" };
  }
}

export async function getUniversitySearch(
  query: Query,
  locale: Locale,
  baseUrl?: string,
  options: { programmeSearch?: boolean; filterOptions?: FilterOptions } = {},
): Promise<SchoolSearchResult> {
  if (!baseUrl) {
    const pageSize = 12;
    const programmeResult = localProgrammeMatches(options.programmeSearch ? query : {}, locale);
    const allSchools = localSchools(
      options.programmeSearch && programmeResult.hasProgrammeFilter ? "" : first(query, "q"),
      first(query, "country"),
      first(query, "continent"),
      locale,
    ).flatMap((school) => {
      const match = programmeResult.matches.get(school.id);
      if (options.programmeSearch && programmeResult.hasProgrammeFilter && !match) return [];
      return [{
        ...school,
        matchedProgrammeCount: match?.count ?? 0,
        matchedCourses: match?.courses ?? [],
      }];
    });
    const totalItems = allSchools.length;
    const totalPages = totalItems ? Math.ceil(totalItems / pageSize) : 0;
    const page = boundedPage(pageNumber(first(query, "page")), totalPages);
    const start = (page - 1) * pageSize;

    return {
      status: "ready",
      schools: allSchools.slice(start, start + pageSize),
      page,
      pageSize,
      totalItems,
      totalPages,
    };
  }

  const result = await searchUniversities(baseUrl, query);
  if (result.status === "error") return result;

  return {
    status: "ready",
    schools: result.page.items.map((item) => enrichSchoolSummary(
      toSchoolSummary(item, locale, options.filterOptions),
      locale,
    )),
    page: result.page.page,
    pageSize: result.page.pageSize,
    totalItems: result.page.totalItems,
    totalPages: result.page.totalPages,
  };
}

export async function getUniversityDetailWithFallback(
  slug: string,
  baseUrl?: string,
  request: typeof fetch = fetch,
) {
  const university = findUniversityBySlug(slug);
  if (baseUrl) {
    const remoteResult = await getUniversityDetail(baseUrl, backendUniversitySlug(slug), request);
    if (remoteResult.status === "ready" || !university) return remoteResult;
  }

  if (!university) return { status: "not-found" as const };
  const profile = universityProfile(university.id);

  return {
    status: "ready" as const,
    university: {
      id: UNIVERSITY_CATALOG.findIndex((item) => item.id === university.id) + 1,
      slug: university.slug,
      nameZh: university.nameZh,
      nameEn: university.nameEn,
      countryCode: university.countryCode,
      countryNameZh: university.countryZh,
      countryNameEn: university.countryEn,
      cityZh: university.cityZh,
      cityEn: university.cityEn,
      descriptionZh: profile?.introductionZh ?? null,
      descriptionEn: profile?.introductionEn ?? null,
      popular: FEATURED_UNIVERSITY_IDS.some((id) => id === university.id),
    },
  };
}

export async function getUniversityProgrammesWithFallback(
  slug: string,
  query: Query,
  baseUrl?: string,
  request: typeof fetch = fetch,
) {
  const university = findUniversityBySlug(slug);
  const localPage = university ? localProgrammePage(slug, query) : undefined;
  if (baseUrl) {
    const remoteResult = await getUniversityProgrammes(baseUrl, backendUniversitySlug(slug), query, request);
    if (remoteResult.status === "ready" && (remoteResult.page.totalItems > 0 || !localPage?.totalItems)) return remoteResult;
    if (!university) return remoteResult;
  }

  return {
    status: "ready" as const,
    page: localPage ?? localProgrammePage(slug, query),
  };
}

export async function getUniversityProgrammeWithFallback(
  universitySlug: string,
  programmeSlug: string,
  baseUrl?: string,
  request: typeof fetch = fetch,
): Promise<{ status: "ready"; programme: LocalProgrammeDetail } | { status: "not-found" | "error" }> {
  const localProgramme = findLocalProgrammeBySlug(universitySlug, programmeSlug);
  if (localProgramme) return { status: "ready", programme: localProgramme };

  const university = findUniversityBySlug(universitySlug);
  if (!baseUrl || !university) return { status: "not-found" };

  const remoteResult = await getUniversityProgramme(
    baseUrl,
    backendUniversitySlug(universitySlug),
    programmeSlug,
    request,
  );
  if (remoteResult.status !== "ready") return remoteResult;

  const remote = remoteResult.programme;
  const normalizedLevel = remote.studyLevelCode?.trim().toLocaleLowerCase("en");
  const level: LocalProgrammeDetail["level"] = normalizedLevel === "master" || normalizedLevel === "doctorate"
    ? normalizedLevel
    : "bachelor";
  return {
    status: "ready",
    programme: {
      universityId: university.id,
      level,
      nameZh: remote.nameZh?.trim() || remote.nameEn?.trim() || remote.programmeCode,
      nameEn: formatEnglishDisplayText(remote.nameEn?.trim() || remote.programmeCode),
      facultyZh: remote.categoryDisplayZh?.trim() || remote.categoryCode,
      facultyEn: formatEnglishDisplayText(remote.categoryDisplayEn?.trim() || remote.categoryCode),
      academicRequirement: "",
      englishRequirement: "",
      duration: remote.durationDisplay?.trim() || "",
      registrationFee: "",
      tuition: remote.tuitionDisplay?.trim() || "",
      intakes: remote.intakeDisplayTexts.join(", "),
      mode: remote.courseModeCode?.trim() || "",
      interview: "",
      slug: remote.slug,
      descriptionZh: remote.descriptionZh?.trim() || "",
      descriptionEn: remote.descriptionEn?.trim() || "",
    },
  };
}
