import assert from 'node:assert/strict';
import test from 'node:test';
import { consultationGateway, type ConsultationDraft } from '../miniprogram/services/consultations';
import { sessionStore } from '../miniprogram/stores/session';

test('intention form carries choices through consent validation to submission and consultation records', async () => {
  interface FormPage {
    data: { form: ConsultationDraft; receipt: string; applicationIntent: boolean };
    setData(value: object): void;
    onLoad(options: Record<string, string>): void;
    submit(): Promise<void>;
    openRecords(): void;
  }
  let page!: FormPage;
  const submitted: ConsultationDraft[] = [];
  const destinations: string[] = [];
  const host = globalThis as unknown as { Page?: (page: FormPage) => void; wx?: unknown };
  const originalSubmit = consultationGateway.submit;
  const originalAuth = sessionStore.ensureAuthenticated;
  host.Page = value => { page = value; page.setData = patch => Object.assign(page.data, patch); };
  host.wx = { showToast() {}, showLoading() {}, hideLoading() {}, redirectTo: ({ url }: { url: string }) => destinations.push(url) };
  sessionStore.ensureAuthenticated = async () => ({ ok: true, value: { id: 1, displayName: '用户', avatarUrl: null, bindingStatus: 'LINKED' } });
  consultationGateway.submit = async draft => { submitted.push(draft); return { ok: true, value: { referenceCode: 'receipt', submittedAt: '2026-10-14T00:00:00Z' } }; };
  try {
    await import('../miniprogram/pages/consultation/index');
    page.onLoad({ intent: 'application', notes: encodeURIComponent('亚太科技大学：计算机\n双威大学：商科') });
    assert.equal(page.data.applicationIntent, true);
    page.data.form = { ...page.data.form, name: '用户', contact: 'test-contact' };
    await page.submit();
    assert.equal(submitted.length, 0);
    page.data.form = { ...page.data.form, privacyConsent: true };
    await page.submit();
    assert.equal(submitted[0]?.notes, '亚太科技大学：计算机\n双威大学：商科');
    assert.equal(page.data.receipt, 'receipt');
    page.openRecords();
    assert.deepEqual(destinations, ['/pages/consultations/index']);
  } finally {
    consultationGateway.submit = originalSubmit;
    sessionStore.ensureAuthenticated = originalAuth;
    delete host.Page; delete host.wx;
  }
});
