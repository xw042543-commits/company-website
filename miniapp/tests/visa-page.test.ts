import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';

test('home visa entry opens a registered guide and copying handles success and failure', async () => {
  type Definition = { openFeature?(event: { currentTarget: { dataset: { key: string } } }): void; copyLink?(): void };
  let page: Definition | undefined;
  const routes: string[] = [];
  const notices: string[] = [];
  const copies: Array<{ data: string; success(): void; fail(): void }> = [];
  const host = globalThis as unknown as { Page?: (page: Definition) => void; wx?: unknown };
  host.Page = value => { page = value; };
  host.wx = {
    navigateTo: ({ url }: { url: string }) => routes.push(url),
    showToast: ({ title }: { title: string }) => notices.push(title),
    setClipboardData: (options: typeof copies[number]) => { copies.push(options); },
  };
  try {
    await import('../miniprogram/pages/home/index');
    page?.openFeature?.({ currentTarget: { dataset: { key: 'visa' } } });
    assert.deepEqual(routes, ['/pages/visa/index']);
    const app = JSON.parse(readFileSync('miniprogram/app.json', 'utf8'));
    assert.ok(app.pages.includes('pages/visa/index'));
    await import('../miniprogram/pages/visa/index');
    assert.equal(copies.length, 0);
    page?.copyLink?.();
    assert.equal(copies[0]?.data, 'https://visa.educationmalaysia.gov.my/emgs/application/searchForm/');
    copies[0]?.success();
    assert.match(notices.at(-1) ?? '', /浏览器/);
    page?.copyLink?.();
    copies[1]?.fail();
    assert.match(notices.at(-1) ?? '', /复制失败/);
  } finally {
    delete host.Page;
    delete host.wx;
  }
});
