import { request } from './http';
import type { Result } from '../utils/result';
import { universityLogoUrl } from './university-media';

export const STATUS_LABELS = { IN_PROGRESS: '进行中', NEEDS_DOCUMENTS: '待补充材料', SUBMITTED: '已递交', COMPLETED: '已完成', CANCELLED: '已取消' } as const;
export type ApplicationStatus = keyof typeof STATUS_LABELS;
export const STAGES = ['材料准备', '材料初审', '申请递交', '院校审核', '录取结果', '签证办理', '入学报到', '结案'];
export const FILTERS = [{ value: '', label: '全部申请' }, { value: 'IN_PROGRESS', label: '进行中' }, { value: 'NEEDS_DOCUMENTS', label: '待补充材料' }, { value: 'COMPLETED', label: '已完成' }, { value: 'CANCELLED', label: '已取消' }];
export interface ApplicationSummary {
  id: string; reference: string; universitySlug: string; universityName: string; programmeName: string;
  level: string; subject: string; status: ApplicationStatus; stage: number; note: string; createdAt: string;
  statusLabel: string; tone: string; date: string; logo: string | null;
}
export interface ApplicationDocument {
  id: string; title: string; stage: number; status: 'MISSING' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  reviewNote: string; filename: string; updatedAt: string; statusLabel: string; tone: string; editable: boolean; symbol: string;
}
export interface ApplicationFee { id: string; title: string; amount: number; currency: string; status: 'DUE' | 'PAID' | 'WAIVED'; stage: number; displayAmount: string; statusLabel: string }
export interface ApplicationEvent { id: string; stage: number; message: string; createdAt: string; date: string }
export interface ApplicationDetail { application: ApplicationSummary; documents: ApplicationDocument[]; fees: ApplicationFee[]; history: ApplicationEvent[] }
export interface ApplicationPage { items: ApplicationSummary[]; hasMore: boolean }
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function validApplicationId(id: string): boolean { return UUID.test(id); }
const record = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);
const text = (value: unknown): value is string => typeof value === 'string';
const date = (value: unknown): value is string => text(value) && /^\d{4}-\d{2}-\d{2}T/.test(value) && Number.isFinite(Date.parse(value));
const stage = (value: unknown): value is number => Number.isInteger(value) && Number(value) >= 1 && Number(value) <= 8;
function invalid<T>(): Result<T> { return { ok: false, error: { kind: 'unexpected', code: 'INVALID_APPLICATION_RESPONSE' } }; }
export function mapSummary(raw: unknown): ApplicationSummary | null {
  if (!record(raw) || !text(raw.id) || !UUID.test(raw.id) || !text(raw.status) || !Object.hasOwn(STATUS_LABELS, raw.status)
    || !stage(raw.stage) || !date(raw.createdAt) || !['reference','universitySlug','universityName','programmeName','level','subject','note'].every((key) => text(raw[key]))) return null;
  const status = raw.status as ApplicationStatus;
  return { id: raw.id, reference: String(raw.reference), universitySlug: String(raw.universitySlug), universityName: String(raw.universityName),
    programmeName: String(raw.programmeName), level: String(raw.level), subject: String(raw.subject), status, stage: raw.stage,
    note: String(raw.note), createdAt: raw.createdAt, date: raw.createdAt.slice(0,10), statusLabel: STATUS_LABELS[status],
    tone: status === 'NEEDS_DOCUMENTS' ? 'warning' : status === 'CANCELLED' || status === 'SUBMITTED' ? 'muted' : 'green', logo: universityLogoUrl(String(raw.universitySlug)) };
}
export function mapApplicationPage(raw: unknown): Result<ApplicationPage> {
  if (!record(raw) || !Array.isArray(raw.items) || typeof raw.hasMore !== 'boolean') return invalid();
  const items = raw.items.map(mapSummary);
  if (items.some((item) => !item)) return invalid();
  return { ok: true, value: { items: items as ApplicationSummary[], hasMore: raw.hasMore } };
}
export function mapApplicationDetail(raw: unknown): Result<ApplicationDetail> {
  if (!record(raw) || !Array.isArray(raw.documents) || !Array.isArray(raw.fees) || !Array.isArray(raw.history)) return invalid();
  const application = mapSummary(raw.application); if (!application) return invalid();
  const documents: ApplicationDocument[] = []; const fees: ApplicationFee[] = []; const history: ApplicationEvent[] = [];
  const docLabels = { MISSING: '待补充', SUBMITTED: '审核中', APPROVED: '已通过', REJECTED: '需修改' };
  const feeLabels = { DUE: '待支付', PAID: '已支付', WAIVED: '已减免' };
  for (const d of raw.documents) {
    if (!record(d) || !text(d.id) || !UUID.test(d.id) || !text(d.title) || !stage(d.stage) || !text(d.status) || !Object.hasOwn(docLabels,d.status)
      || !text(d.reviewNote) || !(d.filename === null || text(d.filename)) || !date(d.updatedAt)) return invalid();
    const status = d.status as ApplicationDocument['status'];
    documents.push({ id:d.id, title:d.title, stage:d.stage, status, reviewNote:d.reviewNote, filename:d.filename ?? '', updatedAt:d.updatedAt,
      statusLabel:docLabels[status], tone:status === 'APPROVED' ? 'green' : status === 'SUBMITTED' ? 'muted' : 'warning',
      symbol:status === 'APPROVED' ? '✓' : status === 'SUBMITTED' ? '·' : '!',
      editable: (status === 'MISSING' || status === 'REJECTED') && application.status !== 'COMPLETED' && application.status !== 'CANCELLED' });
  }
  for (const f of raw.fees) {
    if (!record(f) || !text(f.id) || !UUID.test(f.id) || !text(f.title) || !stage(f.stage) || typeof f.amount !== 'number' || !Number.isFinite(f.amount) || f.amount < 0
      || !text(f.currency) || !/^[A-Z]{3}$/.test(f.currency) || !text(f.status) || !Object.hasOwn(feeLabels,f.status)) return invalid();
    const status = f.status as ApplicationFee['status'];
    fees.push({ id:f.id,title:f.title,stage:f.stage,amount:f.amount,currency:f.currency,status,displayAmount:`${f.currency} ${f.amount.toFixed(2)}`,statusLabel:feeLabels[status] });
  }
  for (const e of raw.history) {
    if (!record(e) || !text(e.id) || !UUID.test(e.id) || !stage(e.stage) || !text(e.message) || !date(e.createdAt)) return invalid();
    history.push({ id:e.id,stage:e.stage,message:e.message,createdAt:e.createdAt,date:e.createdAt.slice(0,16).replace('T',' ') });
  }
  return { ok:true,value:{application,documents,fees,history} };
}
export async function getApplications(status: string, page: number): Promise<Result<ApplicationPage>> {
  const response = await request<unknown>({ method:'GET',path:`/api/v1/miniapp/me/applications?page=${page}${status ? `&status=${encodeURIComponent(status)}` : ''}`,authenticated:true });
  return response.ok ? mapApplicationPage(response.value) : response;
}
export async function getApplication(id: string): Promise<Result<ApplicationDetail>> {
  if (!validApplicationId(id)) return invalid();
  const response = await request<unknown>({ method:'GET',path:`/api/v1/miniapp/me/applications/${id}`,authenticated:true });
  return response.ok ? mapApplicationDetail(response.value) : response;
}
export async function submitApplicationDocument(id: string, document: string, filename: string, contentBase64: string): Promise<Result<ApplicationDetail>> {
  if (!validApplicationId(id) || !validApplicationId(document)) return invalid();
  const response = await request<unknown>({method:'PUT',path:`/api/v1/miniapp/me/applications/${id}/documents/${document}`,data:{filename,contentBase64},authenticated:true});
  return response.ok ? mapApplicationDetail(response.value) : response;
}
