import assert from 'node:assert/strict';
import test from 'node:test';
import { setAccessTokenReader, type TransportOptions } from '../miniprogram/services/http';
import { sessionStore } from '../miniprogram/stores/session';

interface RecordView {
  referenceCode: string; notes: string; statusLabel: string; submittedLabel: string;
  expanded: boolean; canExpand: boolean; qualificationLabel: string;
}
interface RecordsPage {
  data: { state: string; items: RecordView[] };
  setData(patch: object): void;
  load(): Promise<void>;
  onHide(): void;
  onUnload(): void;
  toggleNotes(event: { currentTarget: { dataset: { reference: string } } }): void;
  contactAdviser(): void;
}
const record = {
  referenceCode: 'c4d29e18-b266-4f6a-8e24-7cc312388174', intendedSchool: '', intendedCourse: '',
  qualification: 'bachelor', status: 'NEW', submittedAt: '2026-10-14T01:30:00Z',
  notes: '申请意向（待顾问确认，尚未向院校递交）：\n亚太科技大学：计算机\n双威大学：商科\n世纪大学：设计',
};

test('consultation records preserve submitted choices, truthful status and private page lifecycle', async t => {
  let definition!: RecordsPage;
  const host = globalThis as unknown as { Page?: (page: RecordsPage) => void; wx?: unknown };
  const originalWx = host.wx;
  const originalPage = host.Page;
  const originalAuth = sessionStore.ensureAuthenticated;
  const pending: TransportOptions[] = [];
  const destinations: string[] = [];
  host.Page = value => { definition = value; };
  host.wx = {
    getAccountInfoSync: () => ({ miniProgram: { envVersion: 'release' } }),
    request: (options: TransportOptions) => { pending.push(options); return { abort() {} }; },
    navigateTo: ({ url }: { url: string }) => destinations.push(url),
  };
  sessionStore.ensureAuthenticated = async () => ({ ok: true, value: { id: 7, displayName: '用户', avatarUrl: null, bindingStatus: 'LINKED' } });
  setAccessTokenReader(() => 'test-token');
  const makePage = () => {
    const page = { ...definition, data: structuredClone(definition.data) };
    page.setData = patch => { Object.assign(page.data, patch); };
    return page;
  };
  const reply = async (page: RecordsPage, rows: unknown[], statusCode = 200) => {
    const loading = page.load();
    await Promise.resolve();
    const request = pending.shift();
    assert.ok(request);
    assert.match(request.url, /\/api\/v1\/miniapp\/me\/consultations$/);
    assert.equal(request.header.Authorization, 'Bearer test-token');
    request.success({ statusCode, data: rows, header: {}, cookies: [] });
    await loading;
  };
  try {
    await import('../miniprogram/pages/consultations/index');
    await t.test('shows selected programmes and local submission time without inventing application progress', async () => {
      const page = makePage();
      await reply(page, [record]);
      assert.equal(page.data.state, 'ready');
      assert.equal(page.data.items[0]?.notes, record.notes);
      assert.equal(page.data.items[0]?.submittedLabel, '2026-10-14 09:30');
      assert.equal(page.data.items[0]?.statusLabel, '待顾问跟进');
    });
    await t.test('maps each real status and tolerates older records without notes or valid dates', async () => {
      const page = makePage();
      await reply(page, ['IN_PROGRESS', 'COMPLETED', 'FUTURE_STATUS'].map(status => ({
        ...record, status, notes: undefined, submittedAt: 'invalid',
      })));
      assert.deepEqual(page.data.items.map(item => item.statusLabel), ['顾问跟进中', '咨询已完成', '状态待确认']);
      assert.ok(page.data.items.every(item => item.notes === '' && item.submittedLabel === '时间未记录'));
    });
    await t.test('displays real stored qualification codes in Chinese while preserving historical labels', async () => {
      const page = makePage();
      await reply(page, ['foundation', 'bachelor', 'master', 'doctorate', '本科', '', 'future'].map(qualification => ({ ...record, qualification })));
      assert.deepEqual(page.data.items.map(item => item.qualificationLabel), ['预科', '本科', '硕士', '博士', '本科', '', '学历待确认']);
    });
    await t.test('converts explicit timezone offsets across midnight and never normalizes impossible dates', async () => {
      const page = makePage();
      await reply(page, ['2026-10-13T23:30:00Z', '2026-10-14T09:30:00+08:00', '2026-02-30T00:00:00Z', ''].map(submittedAt => ({ ...record, submittedAt })));
      assert.deepEqual(page.data.items.map(item => item.submittedLabel), ['2026-10-14 07:30', '2026-10-14 09:30', '时间未记录', '时间未记录']);
    });
    await t.test('expands only the chosen long note and can collapse it again', async () => {
      const page = makePage();
      await reply(page, [record, { ...record, referenceCode: 'second', notes: '希望了解商科' }]);
      assert.equal(page.data.items[0]?.canExpand, true);
      assert.equal(page.data.items[0]?.expanded, false);
      assert.equal(page.data.items[1]?.canExpand, false);
      const event = { currentTarget: { dataset: { reference: record.referenceCode } } };
      page.toggleNotes(event);
      assert.equal(page.data.items[0]?.expanded, true);
      assert.equal(page.data.items[1]?.expanded, false);
      page.toggleNotes(event);
      assert.equal(page.data.items[0]?.expanded, false);
    });
    await t.test('clears old personal records when reload fails or authentication fails', async () => {
      const page = makePage();
      await reply(page, [record]);
      await reply(page, [], 503);
      assert.equal(page.data.state, 'failed');
      assert.deepEqual(page.data.items, []);
      await reply(page, [record]);
      sessionStore.ensureAuthenticated = async () => ({ ok: false, error: { kind: 'unauthorized', code: 'AUTH_REQUIRED' } });
      await page.load();
      assert.equal(page.data.state, 'failed');
      assert.deepEqual(page.data.items, []);
      sessionStore.ensureAuthenticated = async () => ({ ok: true, value: { id: 7, displayName: '用户', avatarUrl: null, bindingStatus: 'LINKED' } });
    });
    await t.test('ignores stale requests after navigation away', async () => {
      for (const lifecycle of ['onHide', 'onUnload'] as const) {
        const page = makePage();
        const loading = page.load();
        await Promise.resolve();
        const request = pending.shift();
        assert.ok(request);
        page[lifecycle]?.();
        request.success({ statusCode: 200, data: [record], header: {}, cookies: [] });
        await loading;
        assert.deepEqual(page.data.items, []);
      }
    });
    await t.test('opens existing adviser contact page', () => {
      makePage().contactAdviser?.();
      assert.deepEqual(destinations, ['/pages/about/index']);
    });
  } finally {
    sessionStore.ensureAuthenticated = originalAuth;
    setAccessTokenReader(() => null);
    if (originalWx === undefined) delete host.wx; else host.wx = originalWx;
    if (originalPage === undefined) delete host.Page; else host.Page = originalPage;
  }
});
