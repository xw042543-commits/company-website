import {
  filterUniversityCatalog,
  findUniversityBySlug,
  localizeUniversity,
  UNIVERSITY_CATALOG,
  type ProgrammeStatus,
} from "../data/university-catalog.ts";
import { FEATURED_UNIVERSITY_IDS, universityProfile } from "../data/university-profiles.ts";
import { localProgrammePage } from "../data/local-programmes.ts";
import {
  getUniversityDetail,
  getUniversityProgrammes,
  searchUniversities,
  toSchoolSummary,
} from "./university-api.ts";
import { boundedPage, first, pageNumber, type Locale, type Query } from "./site.ts";

export type SchoolSummary = {
  id: string;
  slug: string;
  name: string;
  country: string;
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

// The reviewed local catalogue is the public fallback until the API catalogue is configured.
// Course search and details require a separately reviewed backend contract.
export async function getSchools(query = "", geography: { country?: string; continent?: string } = {}, base?: string): Promise<SchoolResult> {
  const country = geography.country ?? "";
  const continent = geography.continent ?? "";
  if (!base || country || continent) return { status: "ready", schools: localSchools(query, country, continent) };
  try {
    const url = new URL(query ? `/api/search?q=${encodeURIComponent(query)}` : "/api/universities", base);
    const response = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(5000) });
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
): Promise<SchoolSearchResult> {
  if (!baseUrl) {
    const pageSize = 12;
    const allSchools = localSchools(
      first(query, "q"),
      first(query, "country"),
      first(query, "continent"),
      locale,
    );
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
    schools: result.page.items.map((item) => toSchoolSummary(item, locale)),
    page: result.page.page,
    pageSize: result.page.pageSize,
    totalItems: result.page.totalItems,
    totalPages: result.page.totalPages,
  };
}

export async function getUniversityDetailWithFallback(
  slug: string,
  baseUrl?: string,
) {
  if (baseUrl) return getUniversityDetail(baseUrl, slug);

  const university = findUniversityBySlug(slug);
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
) {
  if (baseUrl) return getUniversityProgrammes(baseUrl, slug, query);

  return {
    status: "ready" as const,
    page: localProgrammePage(slug, query),
  };
}
