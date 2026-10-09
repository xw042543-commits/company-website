import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

type TabItem = {
  pagePath: string;
  text: string;
};

function readAppConfig(): { pages: string[]; tabBar: { list: TabItem[] } } {
  return JSON.parse(readFileSync('miniprogram/app.json', 'utf8')) as {
    pages: string[];
    tabBar: { list: TabItem[] };
  };
}

test('registers the approved four tabs in order', () => {
  const app = readAppConfig();

  assert.deepEqual(
    app.tabBar.list.map((item) => [item.pagePath, item.text]),
    [
      ['pages/home/index', '首页'],
      ['pages/universities/index', '院校'],
      ['pages/circle/index', 'U圈'],
      ['pages/account/index', '我的'],
    ],
  );
});

test('does not register planning as a bottom tab', () => {
  const app = readAppConfig();

  assert.equal(app.tabBar.list.some((item) => item.text === '规划'), false);
});

test('registers planning as a non-tab page', () => {
  const app = readAppConfig();

  assert.equal(app.pages.includes('pages/planning/index'), true);
  assert.equal(app.tabBar.list.some((item) => item.pagePath === 'pages/planning/index'), false);
});

test('registers the university detail page outside the bottom navigation', () => {
  const app = readAppConfig();

  assert.equal(app.pages.includes('pages/university-detail/index'), true);
  assert.equal(app.tabBar.list.some((item) => item.pagePath === 'pages/university-detail/index'), false);
});

test('registers integrated programme and account data pages outside the bottom navigation', () => {
  const app = readAppConfig();
  for (const page of ['pages/programme-detail/index', 'pages/plans/index', 'pages/favorites/index', 'pages/consultations/index']) {
    assert.equal(app.pages.includes(page), true);
    assert.equal(app.tabBar.list.some((item) => item.pagePath === page), false);
  }
});

test('registers application order list and detail pages outside bottom navigation', () => {
  const app = readAppConfig();
  for (const page of ['pages/orders/index', 'pages/order-detail/index']) {
    assert.equal(app.pages.includes(page), true);
    assert.equal(app.tabBar.list.some((item) => item.pagePath === page), false);
  }
});
