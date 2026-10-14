import assert from 'node:assert/strict';
import test from 'node:test';

test('empty application list browses universities using regular page navigation', async () => {
  let page: { browse(): void } | undefined;
  const navigated: string[] = [];
  const switched: string[] = [];
  const host = globalThis as unknown as { Page?: (value: { browse(): void }) => void; wx?: unknown };
  host.Page = value => { page = value; };
  host.wx = {
    navigateTo: ({ url }: { url: string }) => navigated.push(url),
    switchTab: ({ url }: { url: string }) => switched.push(url),
  };
  try {
    await import('../miniprogram/pages/orders/index');
    assert.ok(page);
    page.browse();
    assert.deepEqual(navigated, ['/pages/universities/index']);
    assert.deepEqual(switched, []);
  } finally { delete host.Page; delete host.wx; }
});
