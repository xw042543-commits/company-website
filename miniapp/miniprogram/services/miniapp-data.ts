import { request } from './http';
import type { Result } from '../utils/result';
import { createExpiringCache } from '../utils/expiring-cache';

const programmeCache = createExpiringCache<ProgrammeDetail>(2 * 60 * 1000);

export interface ProgrammeDetailSection {
  readonly type: string;
  readonly titleZh: string;
  readonly titleEn: string;
  readonly bodyZh: string;
  readonly bodyEn: string;
  readonly sortOrder: number;
}

export interface ProgrammeDetail {
  readonly id: number;
  readonly programmeCode: string;
  readonly slug: string;
  readonly nameZh: string;
  readonly nameEn: string;
  readonly universitySlug: string;
  readonly universityNameZh: string;
  readonly universityNameEn: string;
  readonly cityZh: string;
  readonly descriptionZh: string;
  readonly categoryCode: string;
  readonly studyLevelCode: string;
  readonly courseModeCode: string;
  readonly languageCodes: string[];
  readonly studyPaceDisplay: string;
  readonly durationDisplay: string;
  readonly tuitionDisplay: string;
  readonly intakeDisplayTexts: string[];
  readonly sections: ProgrammeDetailSection[];
  readonly imageUrl: string | null;
}

export interface UserOverview { readonly favorites: number; readonly plans: number; readonly consultations: number; readonly orders: number }
export interface ProgrammeFavorite {
  readonly id: number; readonly universitySlug: string; readonly name: string;
  readonly universityName: string; readonly level: string; readonly savedAt: string;
}
export interface StudyPlanForm {
  readonly goal: string; readonly subjects: string[]; readonly country: string;
  readonly intake: string; readonly education: string; readonly grade: string;
  readonly language: string; readonly budget: string;
}
export interface StudyPlan {
  readonly id: number; readonly form: StudyPlanForm; readonly createdAt: string;
  readonly updatedAt: string; readonly status: string;
}
export interface ConsultationRecord {
  readonly referenceCode: string; readonly intendedSchool: string; readonly intendedCourse: string;
  readonly qualification: string; readonly status: string; readonly submittedAt: string;
}
export type ApplicationOrderStatus = 'IN_PROGRESS' | 'NEEDS_DOCUMENTS' | 'COMPLETED' | 'CANCELLED';
export interface ApplicationOrderSummary {
  readonly referenceCode: string; readonly universityName: string; readonly programmeName: string;
  readonly qualification: string; readonly status: ApplicationOrderStatus; readonly statusLabel: string;
  readonly submittedAt: string; readonly submittedDate: string;
}
export interface ApplicationStage {
  readonly number: number; readonly title: string; readonly description: string;
  readonly state: 'COMPLETED' | 'ACTIVE' | 'PENDING';
}
export interface ApplicationMaterial {
  readonly name: string; readonly description: string; readonly state: 'RECORDED' | 'PENDING';
}
export interface ApplicationHistory { readonly title: string; readonly occurredAt: string; readonly occurredDate: string }
export interface ApplicationOrderDetail {
  readonly order: ApplicationOrderSummary; readonly activeStage: number; readonly stages: ApplicationStage[];
  readonly materials: ApplicationMaterial[]; readonly payment: { readonly paymentRequired: boolean; readonly message: string };
  readonly history: ApplicationHistory[]; readonly currentMessage: string;
}

export async function getProgrammeDetail(universitySlug: string, programmeId: string): Promise<Result<ProgrammeDetail>> {
  if (!slug(universitySlug) || !positiveId(programmeId)) return invalid('INVALID_PROGRAMME_ROUTE');
  const cacheKey = `${universitySlug}/${programmeId}`;
  const cached = programmeCache.get(cacheKey);
  if (cached) return { ok: true, value: cached };
  const result = await request<unknown>({
    method: 'GET',
    path: `/api/v1/miniapp/universities/${universitySlug}/programmes/${programmeId}`,
    requestKey: 'programme-detail',
  });
  if (!result.ok) return result;
  const mapped = mapProgrammeDetail(result.value);
  if (mapped.ok) programmeCache.set(cacheKey, mapped.value);
  return mapped;
}

export async function getUserOverview(): Promise<Result<UserOverview>> {
  const result = await authenticated<unknown>('GET', '/api/v1/miniapp/me');
  return result.ok ? mapOverview(result.value) : result;
}

export async function getProgrammeFavorites(): Promise<Result<ProgrammeFavorite[]>> {
  const result = await authenticated<unknown>('GET', '/api/v1/miniapp/me/favorites');
  return result.ok ? mapList(result.value, mapFavorite, 'INVALID_FAVORITES_RESPONSE') : result;
}

export async function addProgrammeFavorite(programmeId: number): Promise<Result<ProgrammeFavorite>> {
  if (!Number.isSafeInteger(programmeId) || programmeId < 1) return invalid('INVALID_PROGRAMME_ID');
  const result = await authenticated<unknown>('POST', `/api/v1/miniapp/me/favorites/${programmeId}`);
  return result.ok ? mapped(result.value, mapFavorite, 'INVALID_FAVORITE_RESPONSE') : result;
}

export async function removeProgrammeFavorite(programmeId: number): Promise<Result<void>> {
  if (!Number.isSafeInteger(programmeId) || programmeId < 1) return invalid('INVALID_PROGRAMME_ID');
  return authenticated<void>('DELETE', `/api/v1/miniapp/me/favorites/${programmeId}`);
}

export async function getStudyPlans(): Promise<Result<StudyPlan[]>> {
  const result = await authenticated<unknown>('GET', '/api/v1/miniapp/me/plans');
  return result.ok ? mapList(result.value, mapPlan, 'INVALID_PLANS_RESPONSE') : result;
}

export async function saveStudyPlan(form: StudyPlanForm, planId?: number): Promise<Result<StudyPlan>> {
  const result = await request<unknown>({
    method: planId ? 'PUT' : 'POST',
    path: planId ? `/api/v1/miniapp/me/plans/${planId}` : '/api/v1/miniapp/me/plans',
    data: form,
    authenticated: true,
  });
  return result.ok ? mapped(result.value, mapPlan, 'INVALID_PLAN_RESPONSE') : result;
}

export async function deleteStudyPlan(planId: number): Promise<Result<void>> {
  if (!Number.isSafeInteger(planId) || planId < 1) return invalid('INVALID_PLAN_ID');
  return authenticated<void>('DELETE', `/api/v1/miniapp/me/plans/${planId}`);
}

export async function getConsultations(): Promise<Result<ConsultationRecord[]>> {
  const result = await authenticated<unknown>('GET', '/api/v1/miniapp/me/consultations');
  return result.ok ? mapList(result.value, mapConsultation, 'INVALID_CONSULTATIONS_RESPONSE') : result;
}

export async function getApplicationOrders(): Promise<Result<ApplicationOrderSummary[]>> {
  const result = await authenticated<unknown>('GET', '/api/v1/miniapp/me/orders');
  return result.ok ? mapList(result.value, mapApplicationOrder, 'INVALID_ORDERS_RESPONSE') : result;
}

export async function getApplicationOrder(referenceCode: string): Promise<Result<ApplicationOrderDetail>> {
  if (!UUID.test(referenceCode)) return invalid('INVALID_ORDER_REFERENCE');
  const result = await authenticated<unknown>('GET', `/api/v1/miniapp/me/orders/${encodeURIComponent(referenceCode)}`);
  return result.ok ? mapApplicationOrderDetail(result.value) : result;
}

function authenticated<T>(method: 'GET' | 'POST' | 'DELETE', path: `/api/${string}`): Promise<Result<T>> {
  return request<T>({ method, path, authenticated: true });
}

export function mapProgrammeDetail(raw: unknown): Result<ProgrammeDetail> {
  if (!object(raw) || !integer(raw.id) || !text(raw.slug) || !text(raw.nameZh) || !text(raw.nameEn)
    || !text(raw.universitySlug) || !text(raw.universityNameZh) || !Array.isArray(raw.sections)) {
    return invalid('INVALID_PROGRAMME_DETAIL_RESPONSE');
  }
  const sections: ProgrammeDetailSection[] = [];
  for (const section of raw.sections) {
    if (!object(section) || !text(section.type) || !integerOrZero(section.sortOrder)) {
      return invalid('INVALID_PROGRAMME_DETAIL_RESPONSE');
    }
    sections.push({ type: section.type, titleZh: optional(section.titleZh), titleEn: optional(section.titleEn),
      bodyZh: optional(section.bodyZh), bodyEn: optional(section.bodyEn), sortOrder: section.sortOrder });
  }
  return { ok: true, value: {
    id: raw.id, programmeCode: optional(raw.programmeCode), slug: raw.slug, nameZh: raw.nameZh, nameEn: raw.nameEn,
    universitySlug: raw.universitySlug, universityNameZh: raw.universityNameZh,
    universityNameEn: optional(raw.universityNameEn), cityZh: optional(raw.cityZh),
    descriptionZh: optional(raw.descriptionZh), categoryCode: optional(raw.categoryCode),
    studyLevelCode: optional(raw.studyLevelCode), courseModeCode: optional(raw.courseModeCode),
    languageCodes: stringList(raw.languageCodes), studyPaceDisplay: optional(raw.studyPaceDisplay),
    durationDisplay: optional(raw.durationDisplay), tuitionDisplay: optional(raw.tuitionDisplay),
    intakeDisplayTexts: stringList(raw.intakeDisplayTexts), sections: sections.sort((a, b) => a.sortOrder - b.sortOrder),
    imageUrl: secureUrl(raw.imageUrl),
  } };
}

function mapOverview(raw: unknown): Result<UserOverview> {
  if (!object(raw) || !integerOrZero(raw.favorites) || !integerOrZero(raw.plans) || !integerOrZero(raw.consultations)
    || !integerOrZero(raw.orders)) {
    return invalid('INVALID_OVERVIEW_RESPONSE');
  }
  return { ok: true, value: { favorites: raw.favorites, plans: raw.plans, consultations: raw.consultations, orders: raw.orders } };
}

function mapFavorite(raw: unknown): ProgrammeFavorite | null {
  if (!object(raw) || !integer(raw.id) || !text(raw.universitySlug) || !text(raw.name) || !text(raw.universityName)) return null;
  return { id: raw.id, universitySlug: raw.universitySlug, name: raw.name, universityName: raw.universityName,
    level: optional(raw.level), savedAt: optional(raw.savedAt) };
}

function mapPlan(raw: unknown): StudyPlan | null {
  if (!object(raw) || !integer(raw.id) || !object(raw.form) || !text(raw.form.goal) || !text(raw.form.country)
    || !text(raw.form.education) || !Array.isArray(raw.form.subjects)) return null;
  return { id: raw.id, form: { goal: raw.form.goal, subjects: stringList(raw.form.subjects), country: raw.form.country,
    intake: optional(raw.form.intake), education: raw.form.education, grade: optional(raw.form.grade),
    language: optional(raw.form.language), budget: optional(raw.form.budget) }, createdAt: optional(raw.createdAt),
    updatedAt: optional(raw.updatedAt), status: optional(raw.status) };
}

function mapConsultation(raw: unknown): ConsultationRecord | null {
  if (!object(raw) || !text(raw.referenceCode) || !text(raw.status)) return null;
  return { referenceCode: raw.referenceCode, intendedSchool: optional(raw.intendedSchool),
    intendedCourse: optional(raw.intendedCourse), qualification: optional(raw.qualification),
    status: raw.status, submittedAt: optional(raw.submittedAt) };
}

export function mapApplicationOrder(raw: unknown): ApplicationOrderSummary | null {
  if (!object(raw) || !text(raw.referenceCode) || !UUID.test(raw.referenceCode) || !orderStatus(raw.status)
    || !text(raw.statusLabel)) return null;
  const submittedAt = optional(raw.submittedAt);
  return { referenceCode: raw.referenceCode, universityName: optional(raw.universityName),
    programmeName: optional(raw.programmeName), qualification: optional(raw.qualification), status: raw.status,
    statusLabel: raw.statusLabel, submittedAt, submittedDate: dateLabel(submittedAt) };
}

export function mapApplicationOrderDetail(raw: unknown): Result<ApplicationOrderDetail> {
  if (!object(raw)) return invalid('INVALID_ORDER_RESPONSE');
  const order = mapApplicationOrder(raw.order);
  if (!order || !integer(raw.activeStage) || !Array.isArray(raw.stages) || !Array.isArray(raw.materials)
    || !Array.isArray(raw.history) || !object(raw.payment) || typeof raw.payment.paymentRequired !== 'boolean'
    || !text(raw.payment.message)) return invalid('INVALID_ORDER_RESPONSE');
  const stages = raw.stages.map(mapStage);
  const materials = raw.materials.map(mapMaterial);
  const history = raw.history.map(mapHistory);
  if (stages.some(nullValue) || materials.some(nullValue) || history.some(nullValue)) return invalid('INVALID_ORDER_RESPONSE');
  return { ok: true, value: { order, activeStage: raw.activeStage, stages: stages as ApplicationStage[],
    materials: materials as ApplicationMaterial[], payment: { paymentRequired: raw.payment.paymentRequired,
      message: raw.payment.message }, history: history as ApplicationHistory[], currentMessage: optional(raw.currentMessage) } };
}

function mapStage(raw: unknown): ApplicationStage | null {
  if (!object(raw) || !integer(raw.number) || !text(raw.title) || !text(raw.description)
    || (raw.state !== 'COMPLETED' && raw.state !== 'ACTIVE' && raw.state !== 'PENDING')) return null;
  return { number: raw.number, title: raw.title, description: raw.description, state: raw.state };
}
function mapMaterial(raw: unknown): ApplicationMaterial | null {
  if (!object(raw) || !text(raw.name) || !text(raw.description) || (raw.state !== 'RECORDED' && raw.state !== 'PENDING')) return null;
  return { name: raw.name, description: raw.description, state: raw.state };
}
function mapHistory(raw: unknown): ApplicationHistory | null {
  if (!object(raw) || !text(raw.title) || !text(raw.occurredAt)) return null;
  return { title: raw.title, occurredAt: raw.occurredAt, occurredDate: dateLabel(raw.occurredAt) };
}

function mapList<T>(raw: unknown, mapper: (item: unknown) => T | null, code: string): Result<T[]> {
  if (!Array.isArray(raw)) return invalid(code);
  const items = raw.map(mapper);
  return items.some((item) => item === null) ? invalid(code) : { ok: true, value: items as T[] };
}
function mapped<T>(raw: unknown, mapper: (item: unknown) => T | null, code: string): Result<T> {
  const value = mapper(raw); return value ? { ok: true, value } : invalid(code);
}
function object(value: unknown): value is Record<string, unknown> { return typeof value === 'object' && value !== null && !Array.isArray(value); }
function text(value: unknown): value is string { return typeof value === 'string' && value.trim().length > 0; }
function optional(value: unknown): string { return typeof value === 'string' ? value.trim() : ''; }
function integer(value: unknown): value is number { return typeof value === 'number' && Number.isSafeInteger(value) && value > 0; }
function integerOrZero(value: unknown): value is number { return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0; }
function stringList(value: unknown): string[] { return Array.isArray(value) ? value.filter(text) : []; }
function secureUrl(value: unknown): string | null { return typeof value === 'string' && value.startsWith('https://') ? value : null; }
function slug(value: string): boolean { return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value); }
function positiveId(value: string): boolean { return /^[1-9]\d*$/.test(value); }
function orderStatus(value: unknown): value is ApplicationOrderStatus {
  return value === 'IN_PROGRESS' || value === 'NEEDS_DOCUMENTS' || value === 'COMPLETED' || value === 'CANCELLED';
}
function dateLabel(value: string): string { return /^\d{4}-\d{2}-\d{2}/.test(value) ? value.slice(0, 10) : ''; }
function nullValue<T>(value: T | null): value is null { return value === null; }
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function invalid(code: string): Result<never> { return { ok: false, error: { kind: 'unexpected', code } }; }
