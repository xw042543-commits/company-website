import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

type TabItem = {
  pagePath: string;
  text: string;
};

function readAppConfig(): { tabBar: { list: TabItem[] } } {
  return JSON.parse(readFileSync('miniprogram/app.json', 'utf8')) as {
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
