import "server-only";

import { filterUniversityCatalog, type ProgrammeStatus } from "@/data/university-catalog";
import {
  searchUniversities,
  toSchoolSummary,
} from "@/lib/university-api";
import type { Locale, Query } from "@/lib/site";

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

function localSchools(query: string, country: string, continent: string): SchoolSummary[] {
  return filterUniversityCatalog(query, country, continent).map((university) => ({
    ...university,
    name: university.nameEn,
    country: university.countryEn,
    city: university.cityEn,
  }));
}

// The reviewed local catalogue is the public fallback until the API catalogue is configured.
// Course search and details require a separately reviewed backend contract.
export async function getSchools(query = "", geography: { country?: string; continent?: string } = {}): Promise<SchoolResult> {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL;
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
): Promise<SchoolSearchResult> {
  const result = await searchUniversities(process.env.NEXT_PUBLIC_API_BASE_URL, query);
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
