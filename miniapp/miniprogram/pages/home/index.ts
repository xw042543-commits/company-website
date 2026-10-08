import { searchUniversities, type UniversitySummary } from '../../services/universities';
import { favoriteUniversities } from '../../stores/favorites';
import { universityDetailRoute } from '../../utils/routes';

type PreviewState = 'loading' | 'ready' | 'empty' | 'failed';
type HomeUniversity = UniversitySummary & { favorite: boolean };

interface UniversityEvent extends WechatMiniprogram.BaseEvent {
  detail: { slug?: string };
}

Page({
  data: {
    featureEntries: [
      { key: 'planning', label: '留学规划', caption: '梳理目标与申请方向', icon: '规', tone: 'mint' },
      { key: 'ai', label: 'AI规划', caption: '智能辅助留学决策', icon: 'AI', tone: 'blue' },
      { key: 'universities', label: '院校清单', caption: '筛选真实院校与专业', icon: '校', tone: 'violet' },
      { key: 'visa', label: '签证查询', caption: '了解签证办理信息', icon: '签', tone: 'orange' },
    ],
    previewState: 'loading' as PreviewState,
    universities: [] as HomeUniversity[],
    featuredUniversities: [] as HomeUniversity[],
  },

  onLoad() { void this.loadUniversityPreview(); },
  onShow() { this.syncFavorites(); },

  openFeature(event: WechatMiniprogram.BaseEvent) {
    const key = event.currentTarget.dataset.key as string | undefined;
    if (key === 'universities') {
      wx.switchTab({ url: '/pages/universities/index' });
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
    const slug = event.detail.slug;
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

  retry() { void this.loadUniversityPreview(); },

  async loadUniversityPreview() {
    this.setData({ previewState: 'loading' as PreviewState });
    const result = await searchUniversities({ page: 1, size: 6 });
    if (!result.ok) {
      if (result.error.code !== 'REQUEST_SUPERSEDED') {
        this.setData({ previewState: 'failed' as PreviewState });
      }
      return;
    }
    const saved = new Set(favoriteUniversities.list());
    const universities = result.value.items.map((item) => ({
      ...item, favorite: saved.has(item.slug),
    }));
    this.setData({
      universities,
      featuredUniversities: universities.slice(0, 3),
      previewState: universities.length > 0 ? 'ready' as PreviewState : 'empty' as PreviewState,
    });
  },
});
