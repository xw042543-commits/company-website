import { request, type RequestOptions } from './http';
import type { Result } from '../utils/result';

export type Qualification = '' | 'foundation' | 'bachelor' | 'master' | 'doctorate';
export interface ConsultationDraft {
  readonly name: string; readonly contact: string; readonly intendedSchool: string;
  readonly intendedCourse: string; readonly qualification: Qualification;
  readonly notes: string; readonly privacyConsent: boolean;
}
export interface ConsultationReceipt { readonly referenceCode: string; readonly submittedAt: string }
type Sender = (options: RequestOptions) => Promise<Result<unknown>>;

export function createConsultationGateway(send: Sender = request) {
  return { async submit(draft: ConsultationDraft): Promise<Result<ConsultationReceipt>> {
    const payload = normalize(draft);
    if (!payload) return failure('INVALID_CONSULTATION');
    const result = await send({ method: 'POST', path: '/api/v1/consultations', data: payload,
      authenticated: true, requestKey: 'consultation-submit' });
    if (!result.ok) return result;
    return receipt(result.value);
  } };
}

export const consultationGateway = createConsultationGateway();

function normalize(draft: ConsultationDraft) {
  const name = draft.name.trim(); const contact = draft.contact.trim();
  const intendedSchool = draft.intendedSchool.trim(); const intendedCourse = draft.intendedCourse.trim();
  const notes = draft.notes.trim(); const qualification = draft.qualification;
  if (!name || name.length > 100 || !contact || contact.length > 100 || intendedSchool.length > 200
    || intendedCourse.length > 200 || notes.length > 2000 || !draft.privacyConsent
    || !['', 'foundation', 'bachelor', 'master', 'doctorate'].includes(qualification)) return null;
  return { name, contact, intendedSchool: intendedSchool || null, intendedCourse: intendedCourse || null,
    qualification: qualification || null, notes: notes || null, locale: 'zh', privacyConsent: true };
}

function receipt(value: unknown): Result<ConsultationReceipt> {
  if (!object(value) || typeof value.referenceCode !== 'string' || !UUID.test(value.referenceCode)
    || typeof value.submittedAt !== 'string' || !value.submittedAt.trim()) return failure('INVALID_CONSULTATION_RESPONSE');
  return { ok: true, value: { referenceCode: value.referenceCode, submittedAt: value.submittedAt } };
}
function object(value: unknown): value is Record<string, unknown> { return typeof value === 'object' && value !== null && !Array.isArray(value); }
function failure(code: string): Result<never> { return { ok: false, error: { kind: 'unexpected', code } }; }
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
