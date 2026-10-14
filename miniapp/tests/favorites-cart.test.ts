import assert from 'node:assert/strict';
import test from 'node:test';
import { favoriteUniversities } from '../miniprogram/stores/favorites';
import { sessionStore } from '../miniprogram/stores/session';
import type { ProgrammeFavorite } from '../miniprogram/services/miniapp-data';

Object.assign(globalThis, { Page() {}, wx: { showToast() {} } });
const { createFavoritesCartPage } = await import('../miniprogram/pages/favorites-cart/index');
const courses: ProgrammeFavorite[] = [
  { id: 1, universitySlug: 'apu', universityName: '亚太科技大学', name: '计算机', level: 'BACHELOR', savedAt: '' },
  { id: 2, universitySlug: 'apu', universityName: '亚太科技大学', name: '设计', level: 'BACHELOR', savedAt: '' },
  { id: 3, universitySlug: 'sunway', universityName: '双威大学', name: '商科', level: 'BACHELOR', savedAt: '' },
];
function setup(fail = false) {
  let saved = ['apu', 'um'];
  const definition = createFavoritesCartPage({
    session: { ...sessionStore, getSnapshot: () => ({ status: 'authenticated', account: null }) },
    schools: { ...favoriteUniversities, list: () => saved, has: slug => saved.includes(slug), toggle: slug => { saved = saved.filter(value => value !== slug); return false; } },
    favourites: async () => fail ? { ok: false, error: { kind: 'unavailable', code: 'FAILED' } } : { ok: true, value: courses },
    detail: async () => ({ ok: false, error: { kind: 'unavailable', code: 'FAILED' } }),
    remove: async () => ({ ok: true, value: undefined }),
  });
  return Object.assign(definition, { setData(patch: object) { Object.assign(definition.data, patch); } });
}
const event = (data: Record<string, unknown>) => ({ currentTarget: { dataset: data } });

test('selected programmes open an intention form with complete school-course pairs, without creating orders', async () => {
  const urls: string[] = [];
  Object.assign(globalThis, { wx: { navigateTo: ({ url }: { url: string }) => urls.push(url), showToast() {} } });
  const page = setup(); await page.load(); page.toggleAll();
  await page.checkout();
  assert.equal(urls.length, 1);
  const url = new URL(urls[0]!, 'https://example.test');
  assert.equal(url.pathname, '/pages/consultation/index');
  assert.equal(url.searchParams.get('intent'), 'application');
  assert.match(url.searchParams.get('notes') ?? '', /亚太科技大学：计算机/);
  assert.match(url.searchParams.get('notes') ?? '', /亚太科技大学：设计/);
  assert.match(url.searchParams.get('notes') ?? '', /双威大学：商科/);
});

test('groups saved schools and programme-only schools, retaining favourites when details fail', async () => {
  const page = setup(); await page.load();
  assert.deepEqual(page.data.groups.map(group => [group.slug, group.saved, group.courses.length]), [['apu', true, 2], ['um', true, 0], ['sunway', false, 1]]);
  assert.equal(page.data.groups[0]?.name, '亚太科技大学');
  assert.equal(page.data.detailsFailed, true);
});
test('individual, school and global selection count only saved programmes', async () => {
  const page = setup(); await page.load();
  page.toggleCourse(event({ id: 1 }));
  assert.equal(page.data.groups[0]?.partial, true);
  page.toggleGroup(event({ slug: 'apu' }));
  assert.deepEqual(page.data.selected, [1, 2]);
  page.toggleGroup(event({ slug: 'um' }));
  assert.equal(page.data.selectedCount, 2);
  page.toggleAll(); assert.equal(page.data.selectedCount, 3); assert.equal(page.data.allChecked, true);
  page.toggleGroup(event({ slug: 'apu' })); assert.deepEqual(page.data.selected, [3]);
  page.toggleCourse(event({ id: 999 })); assert.deepEqual(page.data.selected, [3]);
});
test('removing a school preserves its programmes; removing the last programme removes an unsaved group', async () => {
  const page = setup(); await page.load(); page.toggleAll();
  page.removeSchool(event({ slug: 'apu' }));
  assert.equal(page.data.groups[0]?.courses.length, 2);
  await page.removeCourse(event({ id: 3 }));
  assert.equal(page.data.groups.some(group => group.slug === 'sunway'), false);
  assert.deepEqual(page.data.selected, [1, 2]);
});
test('programme loading failure is explicit and local schools remain visible', async () => {
  const page = setup(true); await page.load();
  assert.equal(page.data.failed, true);
  assert.equal(page.data.groups.length, 2);
  assert.equal(page.data.selectedCount, 0);
});
test('leaving the tab clears displayed private data and invalidates pending loads', async () => {
  const page = setup(); const loading = page.load(); page.onHide(); await loading;
  assert.deepEqual(page.data.groups, []);
  assert.equal(page.data.selectedCount, 0);
});
