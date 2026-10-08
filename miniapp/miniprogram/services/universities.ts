import { request } from './http';
import type { RequestOptions } from './http';
import type { Result } from '../utils/result';

export interface UniversitySearchInput {
  readonly q?: string;
  readonly country?: string;
  readonly category?: string;
  readonly level?: string;
  readonly page?: number;
  readonly size?: number;
}

export interface UniversitySummary {
  readonly id: number;
  readonly slug: string;
  readonly nameZh: string;
  readonly nameEn: string;
  readonly location: string;
  readonly programmeCount: number;
  readonly subjectTags: string[];
  readonly imageUrl: string | null;
  readonly popular: boolean;
}

export interface UniversityDetail {
  readonly id: number;
  readonly slug: string;
  readonly nameZh: string;
  readonly nameEn: string;
  readonly countryCode: string;
  readonly countryNameZh: string;
  readonly cityZh: string;
  readonly descriptionZh: string;
  readonly popular: boolean;
  readonly imageUrl: string | null;
}

export interface UniversityProgramme {
  readonly id: number;
  readonly slug: string;
  readonly nameZh: string;
  readonly nameEn: string;
  readonly categoryCode: string;
  readonly studyLevelCode: string;
  readonly durationDisplay: string;
  readonly tuitionDisplay: string;
  readonly intakeDisplayTexts: string[];
}

export interface UniversityProgrammePage {
  readonly items: UniversityProgramme[];
  readonly page: number;
  readonly pageSize: number;
  readonly totalItems: number;
  readonly totalPages: number;
}

export interface UniversityPage {
  readonly items: UniversitySummary[];
  readonly page: number;
  readonly pageSize: number;
  readonly totalItems: number;
  readonly totalPages: number;
}

type UnknownRequester = (options: RequestOptions) => Promise<Result<unknown>>;

export interface UniversitySearchService {
  search(input?: UniversitySearchInput): Promise<Result<UniversityPage>>;
}

export function createUniversitySearchService(
  requester: UnknownRequester = (options) => request<unknown>(options),
): UniversitySearchService {
  let generation = 0;
  return {
    async search(input: UniversitySearchInput = {}) {
      const current = ++generation;
      const result = await requester({
        method: 'GET',
        path: buildUniversitySearchPath(input),
        requestKey: 'university-search',
      });
      if (current !== generation) return superseded();
      if (!result.ok) return result;
      return mapUniversityPage(result.value);
    },
  };
}

const defaultUniversitySearch = createUniversitySearchService();

export function searchUniversities(input: UniversitySearchInput = {}): Promise<Result<UniversityPage>> {
  return defaultUniversitySearch.search(input);
}

export async function getUniversityDetail(slug: string): Promise<Result<UniversityDetail>> {
  const normalized = normalizeSlug(slug);
  if (!normalized) return invalid('INVALID_UNIVERSITY_SLUG');
  const response = await request<unknown>({
    method: 'GET',
    path: `/api/v1/universities/${normalized}`,
    requestKey: 'university-detail',
  });
  if (!response.ok) return response;
  return mapUniversityDetail(response.value);
}

export async function getUniversityProgrammes(
  slug: string,
  page = 1,
  size = 50,
): Promise<Result<UniversityProgrammePage>> {
  const normalized = normalizeSlug(slug);
  if (!normalized) return invalid('INVALID_UNIVERSITY_SLUG');
  const response = await request<unknown>({
    method: 'GET',
    path: `/api/v1/universities/${normalized}/programmes?page=${page}&size=${size}&sort=relevance`,
    requestKey: 'university-programmes',
  });
  if (!response.ok) return response;
  return mapUniversityProgrammePage(response.value);
}

export function buildUniversitySearchPath(input: UniversitySearchInput): `/api/${string}` {
  const query = new URLSearchParams();
  addFilter(query, 'q', input.q);
  addFilter(query, 'country', input.country);
  addFilter(query, 'category', input.category);
  addFilter(query, 'level', input.level);
  query.set('page', String(input.page ?? 1));
  query.set('size', String(input.size ?? 12));
  query.set('sort', 'relevance');
  return `/api/v1/universities/search?${query.toString()}`;
}

export function mapUniversityPage(raw: unknown): Result<UniversityPage> {
  if (!isObject(raw) || !Array.isArray(raw.items) || !positiveInteger(raw.page)
    || !positiveInteger(raw.pageSize) || !nonNegativeInteger(raw.totalItems)
    || !nonNegativeInteger(raw.totalPages)) return invalid();
  const expectedPages = raw.totalItems === 0 ? 0 : Math.ceil(raw.totalItems / raw.pageSize);
  if (raw.totalPages !== expectedPages) return invalid();
  const items: UniversitySummary[] = [];
  for (const item of raw.items) {
    const mapped = mapUniversity(item);
    if (!mapped) return invalid();
    items.push(mapped);
  }
  return {
    ok: true,
    value: {
      items,
      page: raw.page,
      pageSize: raw.pageSize,
      totalItems: raw.totalItems,
      totalPages: raw.totalPages,
    },
  };
}

function mapUniversity(raw: unknown): UniversitySummary | null {
  if (!isObject(raw) || !positiveInteger(raw.id) || !text(raw.slug)
    || !text(raw.nameZh) || !text(raw.nameEn) || !nonNegativeInteger(raw.matchedProgrammeCount)
    || !Array.isArray(raw.matchedProgrammes)) return null;
  const city = text(raw.cityZh) ? raw.cityZh : null;
  const country = text(raw.countryNameZh) ? raw.countryNameZh : null;
  const location = [city, country].filter(Boolean).join('，');
  const subjectTags = [...new Set(raw.matchedProgrammes.flatMap((programme) => {
    if (!isObject(programme) || !text(programme.categoryCode)) return [];
    return [programme.categoryCode];
  }))].slice(0, 3);
  const imageUrl = text(raw.imageUrl) && raw.imageUrl.startsWith('https://') ? raw.imageUrl : null;
  return {
    id: raw.id,
    slug: raw.slug,
    nameZh: raw.nameZh,
    nameEn: raw.nameEn,
    location,
    programmeCount: raw.matchedProgrammeCount,
    subjectTags,
    imageUrl,
    popular: raw.popular === true,
  };
}

export function mapUniversityDetail(raw: unknown): Result<UniversityDetail> {
  if (!isObject(raw) || !positiveInteger(raw.id) || !text(raw.slug)
    || !text(raw.nameZh) || !text(raw.nameEn)) return invalid('INVALID_UNIVERSITY_DETAIL_RESPONSE');
  return {
    ok: true,
    value: {
      id: raw.id,
      slug: raw.slug,
      nameZh: raw.nameZh,
      nameEn: raw.nameEn,
      countryCode: optionalText(raw.countryCode),
      countryNameZh: optionalText(raw.countryNameZh),
      cityZh: optionalText(raw.cityZh),
      descriptionZh: optionalText(raw.descriptionZh),
      popular: raw.popular === true,
      imageUrl: secureImage(raw.imageUrl),
    },
  };
}

export function mapUniversityProgrammePage(raw: unknown): Result<UniversityProgrammePage> {
  if (!isObject(raw) || !Array.isArray(raw.items) || !positiveInteger(raw.page)
    || !positiveInteger(raw.pageSize) || !nonNegativeInteger(raw.totalItems)
    || !nonNegativeInteger(raw.totalPages)) return invalid('INVALID_PROGRAMME_PAGE_RESPONSE');
  const items: UniversityProgramme[] = [];
  for (const item of raw.items) {
    if (!isObject(item) || !positiveInteger(item.id) || !text(item.slug)
      || !text(item.nameZh) || !text(item.nameEn)) return invalid('INVALID_PROGRAMME_PAGE_RESPONSE');
    items.push({
      id: item.id,
      slug: item.slug,
      nameZh: item.nameZh,
      nameEn: item.nameEn,
      categoryCode: optionalText(item.categoryCode),
      studyLevelCode: optionalText(item.studyLevelCode),
      durationDisplay: optionalText(item.durationDisplay),
      tuitionDisplay: optionalText(item.tuitionDisplay),
      intakeDisplayTexts: Array.isArray(item.intakeDisplayTexts)
        ? item.intakeDisplayTexts.filter(text) : [],
    });
  }
  return { ok: true, value: {
    items,
    page: raw.page,
    pageSize: raw.pageSize,
    totalItems: raw.totalItems,
    totalPages: raw.totalPages,
  } };
}

function normalizeSlug(value: string): string | null {
  const normalized = value.trim();
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(normalized) ? normalized : null;
}

function optionalText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function secureImage(value: unknown): string | null {
  return typeof value === 'string' && value.startsWith('https://') ? value : null;
}

function addFilter(query: URLSearchParams, name: string, value: string | undefined): void {
  const normalized = value?.trim();
  if (normalized && normalized !== 'ALL') query.set(name, normalized);
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function text(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function positiveInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 1;
}

function nonNegativeInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0;
}

function invalid(code = 'INVALID_UNIVERSITY_RESPONSE'): Result<never> {
  return { ok: false, error: { kind: 'unexpected', code } };
}

function superseded(): Result<never> {
  return { ok: false, error: { kind: 'unexpected', code: 'REQUEST_SUPERSEDED' } };
}
