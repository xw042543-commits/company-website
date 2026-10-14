import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { createAccountPage } from '../miniprogram/pages/account/index';

test('account exposes intention records separately from existing application progress', () => {
  const page = createAccountPage();
  const menus = page.data!.menuItems as Array<{ key: string; label: string }>;
  const intention = menus.find(item => item.key === 'consultations');
  const application = menus.find(item => item.key === 'orders');
  assert.ok(intention, 'submitted intentions need a visible account entry');
  assert.ok(application, 'existing application records remain accessible');
  const routes: string[] = [];
  const host = globalThis as unknown as { wx?: unknown };
  const previous = host.wx;
  host.wx = { navigateTo: ({ url }: { url: string }) => routes.push(url) };
  try {
    const open = page.openMenu as (event: { currentTarget: { dataset: { key: string } } }) => void;
    open({ currentTarget: { dataset: { key: intention.key } } });
    open({ currentTarget: { dataset: { key: application.key } } });
    assert.deepEqual(routes, ['/pages/consultations/index', '/pages/orders/index']);
    const app = JSON.parse(readFileSync('miniprogram/app.json', 'utf8'));
    for (const route of routes) assert.ok(app.pages.includes(route.slice(1)));
  } finally {
    if (previous === undefined) delete host.wx; else host.wx = previous;
  }
});
