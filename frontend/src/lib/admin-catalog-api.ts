import { getCsrfToken } from "./auth-api.ts";

export type AdminOption = { id: number; code: string; nameZh: string | null; nameEn: string | null };
export type AdminOptions = { countries: AdminOption[]; categories: AdminOption[]; studyLevels: AdminOption[]; courseModes: AdminOption[]; universities: AdminOption[] };
export type AdminPage<T> = { items: T[]; page: number; size: number; total: number; totalPages: number };
export type AdminUniversity = {
  id: number; universityCode: string; slug: string; nameZh: string | null; nameEn: string | null;
  countryCode: string; countryNameZh: string | null; countryNameEn: string | null; regionZh: string | null; regionEn: string | null;
  descriptionZh: string | null; descriptionEn: string | null; officialUrl: string | null; logoUrl: string | null;
  status: "PUBLISHED" | "ARCHIVED" | "DRAFT"; programmeCount: number; updatedAt: string;
};
export type AdminProgramme = {
  id: number; programmeCode: string; universityId: number; universityName: string; slug: string;
  nameZh: string | null; nameEn: string | null; categoryId: number; categoryName: string;
  studyLevelId: number | null; studyLevelName: string | null; courseModeId: number | null; courseModeName: string | null;
  descriptionZh: string | null; descriptionEn: string | null; durationMonths: number | null; durationDisplay: string | null;
  tuitionMin: number | null; tuitionMax: number | null; tuitionCurrency: string | null; tuitionDisplay: string | null;
  admissionsZh: string | null; admissionsEn: string | null; curriculumZh: string | null; curriculumEn: string | null;
  officialUrl: string | null; status: "PUBLISHED" | "ARCHIVED" | "DRAFT"; updatedAt: string;
};

export type AdminApiResult<T> = { status: "ready"; value: T } | { status: "unauthorized" | "forbidden" | "validation" | "conflict" | "unavailable" | "error"; message?: string };

function endpoint(baseUrl: string | undefined, path: string) { return `${(baseUrl ?? "").replace(/\/$/, "")}${path}`; }

async function readError(response: Response): Promise<AdminApiResult<never>> {
  let message: string | undefined;
  try { const body = await response.json() as { message?: unknown }; if (typeof body.message === "string") message = body.message; } catch { /* ignore */ }
  if (response.status === 401) return { status: "unauthorized", message };
  if (response.status === 403) return { status: "forbidden", message };
  if (response.status === 400) return { status: "validation", message };
  if (response.status === 409) return { status: "conflict", message };
  return { status: "error", message };
}

export async function adminRead<T>(baseUrl: string | undefined, path: string): Promise<AdminApiResult<T>> {
  try {
    const response = await fetch(endpoint(baseUrl, path), { credentials: "include", cache: "no-store", signal: AbortSignal.timeout(8_000) });
    if (!response.ok) return readError(response);
    return { status: "ready", value: await response.json() as T };
  } catch { return { status: "unavailable" }; }
}

export async function adminWrite<T>(baseUrl: string | undefined, path: string, method: "POST" | "PUT" | "PATCH", body: unknown): Promise<AdminApiResult<T>> {
  const csrf = await getCsrfToken(baseUrl);
  if (csrf.status !== "ready") return { status: csrf.status === "unauthorized" ? "unauthorized" : "unavailable" };
  try {
    const response = await fetch(endpoint(baseUrl, path), {
      method, credentials: "include", cache: "no-store", signal: AbortSignal.timeout(10_000),
      headers: { "Content-Type": "application/json", [csrf.headerName]: csrf.token }, body: JSON.stringify(body),
    });
    if (!response.ok) return readError(response);
    return { status: "ready", value: await response.json() as T };
  } catch { return { status: "unavailable" }; }
}

export function studyLevelZh(option: AdminOption) {
  const source = `${option.code} ${option.nameZh ?? ""} ${option.nameEn ?? ""}`.toLowerCase();
  if (/phd|doctor/.test(source)) return "博士";
  if (/master|硕士/.test(source)) return "硕士";
  if (/bachelor|undergraduate|本科/.test(source)) return "本科";
  if (/diploma|associate|大专|文凭/.test(source)) return "大专";
  return option.nameZh || option.nameEn || option.code;
}


export type AdminCatalogFilters = {
  query: string;
  status: string;
  country: string;
  universityId: string;
  page: number;
};

export function adminCatalogListPath(tab: "universities" | "programmes", filters: AdminCatalogFilters) {
  const search = new URLSearchParams({ q: filters.query, status: filters.status, page: String(filters.page), size: "20" });
  if (filters.country) search.set("country", filters.country);
  if (tab === "programmes" && filters.universityId) search.set("universityId", filters.universityId);
  return `/api/v1/admin/catalog/${tab}?${search}`;
}
