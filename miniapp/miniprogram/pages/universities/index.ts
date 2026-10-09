import { loadFilterOptions, type FilterOption } from '../../services/catalogue';
import { searchUniversities, type UniversitySummary } from '../../services/universities';
import { favoriteUniversities } from '../../stores/favorites';
import { universityDetailRoute } from '../../utils/routes';

type ViewState = 'loading' | 'ready' | 'empty' | 'failed' | 'offline';
type ListedUniversity = UniversitySummary & { favorite: boolean };
type FilterKey = 'country' | 'category' | 'level';

interface UniversityEvent extends WechatMiniprogram.BaseEvent { detail: { slug?: string }; }
type FilterEvent = WechatMiniprogram.BaseEvent;

const allOption = (label: string): FilterOption => ({ code: 'ALL', nameZh: label, nameEn: 'All' });

Page({
  data: {
    query: '',
    country: 'ALL',
    category: 'ALL',
    level: 'ALL',
    openFilterKey: '' as '' | FilterKey,
    openFilterOptions: [] as FilterOption[],
    openFilterValue: 'ALL',
    skeletonCards: [0, 1, 2],
    countryIndex: 0,
    categoryIndex: 0,
    levelIndex: 0,
    countryOptions: [allOption('全部地区')] as FilterOption[],
    categoryOptions: [allOption('全部专业')] as FilterOption[],
    levelOptions: [allOption('全部学历')] as FilterOption[],
    filtersLoading: true,
    state: 'loading' as ViewState,
    universities: [] as ListedUniversity[],
    totalItems: 0,
    page: 1,
    totalPages: 0,
    loadingMore: false,
  },

  onLoad(options: Record<string, string | undefined>) {
    if (options.q) this.setData({ query: decodeURIComponent(options.q) });
    void Promise.all([this.loadFilters(), this.loadUniversities(true)]);
  },
  onShow() { this.syncFavorites(); },
  onPullDownRefresh() { void this.loadUniversities(true).finally(() => wx.stopPullDownRefresh()); },
  onReachBottom() {
    if (this.data.openFilterKey || this.data.state !== 'ready' || this.data.loadingMore || this.data.page >= this.data.totalPages) return;
    void this.loadUniversities(false);
  },

  updateQuery(event: WechatMiniprogram.Input) { this.setData({ query: event.detail.value }); },
  submitSearch() {
    if (this.data.state === 'loading') return;
    this.setData({ query: this.data.query.trim(), openFilterKey: '', state: 'loading' as ViewState }, () => void this.loadUniversities(true));
  },

  openFilter(event: FilterEvent) {
    const key: unknown = event.currentTarget.dataset.key;
    if (key !== 'country' && key !== 'level' && key !== 'category') return;
    if (this.data.openFilterKey === key) { this.closeFilters(); return; }
    const optionKey = (key + 'Options') as 'countryOptions' | 'categoryOptions' | 'levelOptions';
    this.setData({ openFilterKey: key, openFilterOptions: this.data[optionKey], openFilterValue: this.data[key] });
  },

  selectFilter(event: FilterEvent) {
    const key = this.data.openFilterKey;
    if (!key) return;
    const optionKey = (key + 'Options') as 'countryOptions' | 'categoryOptions' | 'levelOptions';
    const options = this.data[optionKey];
    const index = options.findIndex((option) => option.code === event.currentTarget.dataset.code);
    const selected = options[index];
    if (!selected || this.data[key] === selected.code) { this.closeFilters(); return; }
    this.setData({
      [key]: selected.code,
      [key + 'Index']: index,
      openFilterKey: '',
    }, () => void this.loadUniversities(true));
  },

  closeFilters() { this.setData({ openFilterKey: '' }); },

  clearFilters() {
    this.setData({
      query: '', country: 'ALL', category: 'ALL', level: 'ALL',
      countryIndex: 0, categoryIndex: 0, levelIndex: 0,
      openFilterKey: '',
    }, () => void this.loadUniversities(true));
  },

  retry() { void this.loadUniversities(true); },

  openUniversity(event: UniversityEvent) {
    if (this.data.openFilterKey) return;
    const route = universityDetailRoute(event.detail.slug ?? '');
    if (route.ok) wx.navigateTo({ url: route.value });
  },

  toggleFavorite(event: UniversityEvent) {
    if (this.data.openFilterKey) return;
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

  async loadFilters() {
    const result = await loadFilterOptions();
    if (!result.ok) {
      this.setData({ filtersLoading: false });
      return;
    }
    const options = {
      countryOptions: [allOption('全部地区'), ...result.value.countries],
      categoryOptions: [allOption('全部专业'), ...result.value.subjectCategories],
      levelOptions: [allOption('全部学历'), ...result.value.studyLevels],
    };
    const key = this.data.openFilterKey;
    this.setData({
      ...options,
      openFilterOptions: key ? options[(key + 'Options') as keyof typeof options] : [],
      filtersLoading: false,
    });
  },

  async loadUniversities(reset: boolean) {
    if (reset) this.setData({ state: 'loading' as ViewState, page: 1, totalPages: 0, loadingMore: false });
    else this.setData({ loadingMore: true });
    const nextPage = reset ? 1 : this.data.page + 1;
    const result = await searchUniversities({
      q: this.data.query,
      country: this.data.country,
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
    const saved = new Set(favoriteUniversities.list());
    const bySlug = new Map(existing.map((university) => [university.slug, university]));
    result.value.items.forEach((university) => bySlug.set(university.slug, {
      ...university, favorite: saved.has(university.slug),
    }));
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
