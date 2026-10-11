import { favoriteUniversities } from '../../stores/favorites';
import { loadFavoriteUniversityDetails } from '../../services/university-favorites';
import { universityDetailRoute } from '../../utils/routes';
import type { UniversityDetail } from '../../services/universities';

type ViewState = 'loading' | 'ready' | 'empty' | 'failed';
type FavoriteCard = UniversityDetail & { imageFailed: boolean; logoFailed: boolean; logoLetter: string };

Page({
  generation: 0,
  data: { state: 'loading' as ViewState, items: [] as FavoriteCard[], unavailableCount: 0 },
  onShow() { void this.load(); },
  onUnload() { this.generation++; },
  retry() { void this.load(); },
  browse() { wx.navigateTo({ url: '/pages/universities/index' }); },
  open(event: WechatMiniprogram.BaseEvent) {
    const route = universityDetailRoute(String(event.currentTarget.dataset.slug ?? ''));
    if (route.ok) wx.navigateTo({ url: route.value });
  },
  remove(event: WechatMiniprogram.BaseEvent) {
    const slug = String(event.currentTarget.dataset.slug ?? '');
    if (!favoriteUniversities.has(slug)) return;
    favoriteUniversities.toggle(slug);
    const items = this.data.items.filter((item: FavoriteCard) => item.slug !== slug);
    this.setData({ items, state: items.length ? 'ready' as ViewState : 'empty' as ViewState });
    wx.showToast({ title: '已取消收藏', icon: 'none' });
  },
  imageError(event: WechatMiniprogram.BaseEvent) {
    const slug = String(event.currentTarget.dataset.slug ?? '');
    const kind = String(event.currentTarget.dataset.kind ?? 'image');
    this.setData({ items: this.data.items.map((item: FavoriteCard) => item.slug === slug
      ? { ...item, ...(kind === 'logo' ? { logoFailed: true } : { imageFailed: true }) } : item) });
  },
  async load() {
    const generation = ++this.generation;
    const slugs = favoriteUniversities.list();
    if (!slugs.length) { this.setData({ state: 'empty' as ViewState, items: [], unavailableCount: 0 }); return; }
    this.setData({ state: 'loading' as ViewState, unavailableCount: 0 });
    const result = await loadFavoriteUniversityDetails(slugs);
    if (generation !== this.generation) return;
    const items = result.items.map((item) => ({ ...item, imageFailed: false, logoFailed: false, logoLetter: item.nameZh.charAt(0) || 'U' }));
    this.setData({ items, unavailableCount: result.unavailableCount,
      state: items.length ? 'ready' as ViewState : 'failed' as ViewState });
  },
});