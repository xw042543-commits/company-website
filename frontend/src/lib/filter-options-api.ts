import { requestInternalApi } from "./internal-api-request.ts";
import { localFilterOptions } from "../data/local-programmes.ts";

export type FilterOption = {
  code: string;
  nameZh: string;
  nameEn: string;
};

export type FilterOptions = {
  countries: FilterOption[];
  subjectCategories: FilterOption[];
  studyLevels: FilterOption[];
  courseModes: FilterOption[];
  languages: FilterOption[];
};

export type FilterOptionsResult =
  | { status: "ready"; options: FilterOptions }
  | { status: "error" };

const optionGroups = [
  "countries",
  "subjectCategories",
  "studyLevels",
  "courseModes",
  "languages",
] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isFilterOption(value: unknown): value is FilterOption {
  return isRecord(value)
    && typeof value.code === "string"
    && value.code.trim().length > 0
    && typeof value.nameZh === "string"
    && typeof value.nameEn === "string"
    && (value.nameZh.trim().length > 0 || value.nameEn.trim().length > 0);
}

export function parseFilterOptions(payload: unknown): FilterOptions | null {
  if (!isRecord(payload)) return null;

  for (const group of optionGroups) {
    const options = payload[group];
    if (!Array.isArray(options) || !options.every(isFilterOption)) return null;
  }

  return payload as FilterOptions;
}

export async function getFilterOptions(
  baseUrl: string | undefined,
  request: typeof fetch = fetch,
): Promise<FilterOptionsResult> {
  if (!baseUrl) return { status: "ready", options: localFilterOptions() };

  try {
    const response = await requestInternalApi(request, new URL("/api/v1/catalog/filter-options", baseUrl), {
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return { status: "error" };

    const options = parseFilterOptions(await response.json());
    return options ? { status: "ready", options } : { status: "error" };
  } catch {
    return { status: "error" };
  }
}
