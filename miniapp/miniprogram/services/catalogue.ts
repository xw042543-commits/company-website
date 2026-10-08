import { request, type RequestOptions } from './http';
import type { Result } from '../utils/result';

export interface FilterOption {
  readonly code: string;
  readonly nameZh: string;
  readonly nameEn: string;
}

export interface FilterOptions {
  readonly countries: FilterOption[];
  readonly subjectCategories: FilterOption[];
  readonly studyLevels: FilterOption[];
  readonly courseModes: FilterOption[];
  readonly languages: FilterOption[];
}

export interface CatalogueService {
  load(): Promise<Result<FilterOptions>>;
  reset(): void;
}

const GROUPS = [
  'countries', 'subjectCategories', 'studyLevels', 'courseModes', 'languages',
] as const;

type UnknownRequester = (options: RequestOptions) => Promise<Result<unknown>>;

function isObject(raw: unknown): raw is Record<string, unknown> {
  return typeof raw === 'object' && raw !== null && !Array.isArray(raw);
}

function invalidFilterOptions(): Result<never> {
  return {
    ok: false,
    error: { kind: 'unexpected', code: 'INVALID_FILTER_OPTIONS_RESPONSE' },
  };
}

function parseGroup(raw: unknown): FilterOption[] | null {
  if (!Array.isArray(raw)) return null;
  const seen = new Set<string>();
  const options: FilterOption[] = [];
  for (const item of raw) {
    if (!isObject(item) || typeof item.code !== 'string'
      || typeof item.nameZh !== 'string' || typeof item.nameEn !== 'string') return null;
    const code = item.code.trim();
    const nameZh = item.nameZh.trim();
    const nameEn = item.nameEn.trim();
    if (!code || (!nameZh && !nameEn) || seen.has(code)) return null;
    seen.add(code);
    options.push({ code, nameZh, nameEn });
  }
  return options;
}

export function parseFilterOptions(raw: unknown): Result<FilterOptions> {
  if (!isObject(raw)) return invalidFilterOptions();
  const parsed = Object.fromEntries(GROUPS.map((group) => [group, parseGroup(raw[group])]));
  if (GROUPS.some((group) => parsed[group] === null)) return invalidFilterOptions();
  return {
    ok: true,
    value: {
      countries: parsed.countries as FilterOption[],
      subjectCategories: parsed.subjectCategories as FilterOption[],
      studyLevels: parsed.studyLevels as FilterOption[],
      courseModes: parsed.courseModes as FilterOption[],
      languages: parsed.languages as FilterOption[],
    },
  };
}

export function createCatalogueService(
  requester: UnknownRequester = (options) => request<unknown>(options),
): CatalogueService {
  let cached: FilterOptions | null = null;
  let pending: Promise<Result<FilterOptions>> | null = null;
  let generation = 0;
  return {
    load() {
      if (cached) return Promise.resolve({ ok: true, value: cached });
      if (pending) return pending;
      const current = generation;
      const work = (async (): Promise<Result<FilterOptions>> => {
        const response = await requester({
          method: 'GET',
          path: '/api/v1/catalog/filter-options',
        });
        if (!response.ok) return response;
        const parsed = parseFilterOptions(response.value);
        if (parsed.ok && current === generation) cached = parsed.value;
        return parsed;
      })().finally(() => { if (pending === work) pending = null; });
      pending = work;
      return work;
    },
    reset() {
      generation += 1;
      cached = null;
      pending = null;
    },
  };
}

const catalogue = createCatalogueService();

export function loadFilterOptions(): Promise<Result<FilterOptions>> {
  return catalogue.load();
}

export function resetFilterOptionsCache(): void {
  catalogue.reset();
}
