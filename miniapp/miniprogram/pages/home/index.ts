import { searchUniversities, type UniversitySummary } from '../../services/universities';
import { favoriteUniversities } from '../../stores/favorites';
import { universityDetailRoute } from '../../utils/routes';
import { universityLogoUrl } from '../../services/university-media';

type PreviewState = 'loading' | 'ready' | 'empty' | 'failed';
type HomeUniversity = UniversitySummary & { favorite: boolean; logoUrl: string | null; coverFailed: boolean; logoFailed: boolean };

interface UniversityEvent extends WechatMiniprogram.BaseEvent {
  detail: { slug?: string };
}

Page({
  data: {
    statusBarHeight: 20,
    heroIndex: 0,
    fallbackHeroFailed: false,
    featureEntries: [
      { key: 'planning', label: '规划', icon: '/assets/icons/planning.png', tone: 'mint' },
      { key: 'ai', label: 'AI规划', icon: '/assets/icons/ai.png', tone: 'mint' },
      { key: 'universities', label: '院校清单', icon: '/assets/icons/university-green.png', tone: 'mint' },
      { key: 'visa', label: '签证查询', icon: '/assets/icons/visa.png', tone: 'orange' },
    ],
    previewState: 'loading' as PreviewState,
    universities: [] as HomeUniversity[],
    featuredUniversities: [] as HomeUniversity[],
  },

  onLoad() {
    this.setData({ statusBarHeight: wx.getWindowInfo().statusBarHeight });
    void this.loadUniversityPreview();
  },
  onShow() { this.syncFavorites(); },

  openFeature(event: WechatMiniprogram.BaseEvent) {
    const key = event.currentTarget.dataset.key as string | undefined;
    if (key === 'universities') {
      wx.navigateTo({ url: '/pages/universities/index' });
      return;
    }
    if (key === 'planning') {
      wx.navigateTo({ url: '/pages/planning/index' });
      return;
    }
    wx.showToast({ title: '功能建设中', icon: 'none' });
  },

  openUniversity(event: UniversityEvent) {
    const slug = event.detail?.slug ?? String(event.currentTarget.dataset.slug ?? '');
    const route = universityDetailRoute(slug);
    if (route.ok) wx.navigateTo({ url: route.value });
  },

  toggleFavorite(event: UniversityEvent) {
    const slug = event.detail?.slug ?? String(event.currentTarget.dataset.slug ?? '');
    if (!slug) return;
    const active = favoriteUniversities.toggle(slug);
    this.syncFavorites();
    wx.showToast({ title: active ? '已收藏' : '已取消收藏', icon: 'none' });
  },

  syncFavorites() {
    const saved = new Set(favoriteUniversities.list());
    this.setData({ universities: this.data.universities.map((item) => ({
      ...item, favorite: saved.has(item.slug),
    })) });
  },

  imageError(event: WechatMiniprogram.BaseEvent) {
    const { slug, kind } = event.currentTarget.dataset;
    const mark = (item: HomeUniversity) => item.slug === slug
      ? { ...item, ...(kind === 'logo' ? { logoFailed: true } : { coverFailed: true }) } : item;
    this.setData({ universities: this.data.universities.map(mark), featuredUniversities: this.data.featuredUniversities.map(mark) });
  },

  fallbackImageError() { this.setData({ fallbackHeroFailed: true }); },
  heroChanged(event: WechatMiniprogram.SwiperChange) { this.setData({ heroIndex: event.detail.current }); },

  retry() { void this.loadUniversityPreview(); },

  async loadUniversityPreview() {
    this.setData({ previewState: 'loading' as PreviewState });
    const result = await searchUniversities({ page: 1, size: 6 }, 'home');
    if (!result.ok) {
      if (result.error.code !== 'REQUEST_SUPERSEDED') {
        this.setData({ previewState: 'failed' as PreviewState });
      }
      return;
    }
    const saved = new Set(favoriteUniversities.list());
    const universities = result.value.items.map((item) => ({
      ...item, favorite: saved.has(item.slug),
      logoUrl: universityLogoUrl(item.slug), coverFailed: false, logoFailed: false,
    }));
    this.setData({
      universities,
      featuredUniversities: universities.slice(0, 3),
      previewState: universities.length > 0 ? 'ready' as PreviewState : 'empty' as PreviewState,
    });
  },
});
