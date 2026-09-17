import "server-only";

import { searchUniversityCatalog, type ProgrammeStatus } from "@/data/university-catalog";

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
  matchedCourses?: { id: string; name: string; level?: string; language?: string }[];
};
export type SchoolResult = { status: "ready"; schools: SchoolSummary[] } | { status: "error" };

function localSchools(query: string): SchoolSummary[] {
  return searchUniversityCatalog(query).map((university) => ({
    ...university,
    name: university.nameEn,
    country: university.countryEn,
    city: university.cityEn,
  }));
}

// The reviewed local catalogue is the public fallback until the API catalogue is configured.
// Course search and details require a separately reviewed backend contract.
export async function getSchools(query = ""): Promise<SchoolResult> {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!base) return { status: "ready", schools: localSchools(query) };
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
