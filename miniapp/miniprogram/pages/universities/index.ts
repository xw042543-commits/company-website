import { searchUniversities, type UniversitySummary } from '../../services/universities';

type ViewState = 'loading' | 'ready' | 'empty' | 'failed' | 'offline';

interface UniversitySelectEvent extends WechatMiniprogram.BaseEvent {
  detail: { slug?: string };
}

Page({
  data: {
    query: '',
    category: 'ALL',
    level: 'ALL',
    state: 'loading' as ViewState,
    universities: [] as UniversitySummary[],
    totalItems: 0,
    page: 1,
    totalPages: 0,
    loadingMore: false,
  },

  onLoad() {
    void this.loadUniversities(true);
  },

  onPullDownRefresh() {
    void this.loadUniversities(true).finally(() => wx.stopPullDownRefresh());
  },

  onReachBottom() {
    if (this.data.state !== 'ready' || this.data.loadingMore
      || this.data.page >= this.data.totalPages) return;
    void this.loadUniversities(false);
  },

  updateQuery(event: WechatMiniprogram.Input) {
    this.setData({ query: event.detail.value });
  },

  submitSearch() {
    void this.loadUniversities(true);
  },

  selectCategory(event: WechatMiniprogram.BaseEvent) {
    const category = String(event.currentTarget.dataset.value ?? 'ALL');
    this.setData({ category }, () => void this.loadUniversities(true));
  },

  selectLevel(event: WechatMiniprogram.BaseEvent) {
    const level = String(event.currentTarget.dataset.value ?? 'ALL');
    this.setData({ level }, () => void this.loadUniversities(true));
  },

  retry() {
    void this.loadUniversities(true);
  },

  openUniversity(event: UniversitySelectEvent) {
    if (!event.detail.slug) return;
    wx.showToast({ title: '院校详情正在接入', icon: 'none' });
  },

  async loadUniversities(reset: boolean) {
    if (reset) {
      this.setData({ state: 'loading' as ViewState, page: 1, totalPages: 0 });
    } else {
      this.setData({ loadingMore: true });
    }
    const nextPage = reset ? 1 : this.data.page + 1;
    const result = await searchUniversities({
      q: this.data.query,
      category: this.data.category,
      level: this.data.level,
      page: nextPage,
      size: 12,
    });
    if (!result.ok) {
      if (result.error.code === 'REQUEST_SUPERSEDED') return;
      const state: ViewState = result.error.kind === 'unavailable' ? 'offline' : 'failed';
      this.setData({ state, loadingMore: false });
      return;
    }
    const existing = reset ? [] : this.data.universities;
    const bySlug = new Map(existing.map((university) => [university.slug, university]));
    result.value.items.forEach((university) => bySlug.set(university.slug, university));
    const universities = [...bySlug.values()];
    this.setData({
      universities,
      totalItems: result.value.totalItems,
      page: result.value.page,
      totalPages: result.value.totalPages,
      state: universities.length === 0 ? 'empty' as ViewState : 'ready' as ViewState,
      loadingMore: false,
    });
  },
});
