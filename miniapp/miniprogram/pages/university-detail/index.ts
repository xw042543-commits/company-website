import {
  getUniversityDetail,
  getUniversityProgrammes,
  type UniversityDetail,
  type UniversityProgramme,
  type UniversitySearchInput,
} from '../../services/universities';
import { createPlanningDiscoveryService } from '../../services/planning-discovery';
import { favoriteUniversities } from '../../stores/favorites';
import { loadFilterOptions } from '../../services/catalogue';
import { deriveProgrammeCategories, filterProgrammes, type ProgrammeCategory } from '../../utils/discovery-view';
import { consultationRoute, programmeDetailRoute } from '../../utils/routes';

type ViewState = 'loading' | 'ready' | 'failed' | 'offline';
type DetailSection = 'introduction' | 'facts' | 'programmes';

Page({
  data: {
    slug: '',
    planningEntry: false,
    planningFilters: {} as UniversitySearchInput,
    state: 'loading' as ViewState,
    university: null as UniversityDetail | null,
    programmes: [] as UniversityProgramme[],
    programmeCount: 0,
    activeSection: 'introduction' as DetailSection,
    activeCategory: '',
    programmeCategories: [] as ProgrammeCategory[],
    featuredCategories: [] as ProgrammeCategory[],
    visibleProgrammes: [] as UniversityProgramme[],
    descriptionParagraphs: [] as string[],
    location: '',
    levelSummary: '待确认',
    profileFacts: [] as BasicFact[],
    statusBarHeight: 20,
    navigationHeight: 44,
    navigationRight: 96,
    favorite: false,
    imageFailed: false,
    logoFailed: false,
    logoLetter: 'U',
  },

  onLoad(options: Record<string, string | undefined>) {
    this.setupNavigation();
    let slug: string;
    const planningEntry = options.planning === '1';
    const planningFilters: Record<string, string> = {};
    try {
      slug = options.slug ? decodeURIComponent(options.slug) : '';
      if (planningEntry) {
        for (const key of ['q', 'level', 'category', 'country', 'mode', 'language', 'duration', 'intake', 'tuitionMin', 'tuitionMax']) {
          if (options[key]) planningFilters[key] = decodeURIComponent(options[key]!);
        }
      }
    }
    catch {
      this.setData({ state: 'failed' as ViewState });
      return;
    }
    this.setData({ slug, planningEntry, planningFilters, activeSection: planningEntry ? 'programmes' : 'introduction', favorite: favoriteUniversities.has(slug) });
    void this.loadPage();
  },
  onShow() {
    if (this.data.slug) this.setData({ favorite: favoriteUniversities.has(this.data.slug) });
  },

  back() { wx.navigateBack(); },
  imageError() { this.setData({ imageFailed: true }); },
  logoError() { this.setData({ logoFailed: true }); },
  setupNavigation() {
    try {
      const windowInfo = wx.getWindowInfo();
      const capsule = wx.getMenuButtonBoundingClientRect();
      const statusBarHeight = windowInfo.statusBarHeight || 20;
      const validCapsule = capsule.width > 0 && capsule.height > 0 && capsule.top >= statusBarHeight;
      this.setData({
        statusBarHeight,
        navigationHeight: validCapsule ? Math.max(44, capsule.height + (capsule.top - statusBarHeight) * 2) : 44,
        navigationRight: validCapsule ? Math.max(96, windowInfo.windowWidth - capsule.left + 12) : 96,
      });
    } catch { /* Keep safe navigation defaults on older clients. */ }
  },
  selectSection(event: WechatMiniprogram.BaseEvent) {
    const section: unknown = event.currentTarget.dataset.section;
    if (section !== 'introduction' && section !== 'facts' && section !== 'programmes') return;
    this.setData({ activeSection: section });
  },
  showProgrammes() {
    this.setData({ activeSection: 'programmes' as DetailSection });
    wx.pageScrollTo({ selector: '#university-sections', duration: 240 });
  },
  selectCategory(event: WechatMiniprogram.BaseEvent) {
    const code: unknown = event.currentTarget.dataset.code;
    if (typeof code !== 'string' || !this.data.programmeCategories.some((category) => category.code === code)) return;
    this.setData({ activeCategory: code, visibleProgrammes: filterProgrammes(this.data.programmes, code) });
  },
  retry() { void this.loadPage(); },
  toggleFavorite() {
    if (!this.data.slug) return;
    const favorite = favoriteUniversities.toggle(this.data.slug);
    this.setData({ favorite });
    wx.showToast({ title: favorite ? '已收藏' : '已取消收藏', icon: 'none' });
  },
  openProgramme(event: WechatMiniprogram.BaseEvent) {
    const id = Number(event.currentTarget.dataset.id);
    const route = programmeDetailRoute(this.data.slug, id);
    if (!route.ok) {
      wx.showToast({ title: '专业资料暂时无法打开', icon: 'none' });
      return;
    }
    wx.navigateTo({ url: route.value });
  },
  consult() {
    const route = consultationRoute({ school: this.data.university?.nameZh ?? '' });
    if (route.ok) wx.navigateTo({ url: route.value });
  },

  async loadPage() {
    if (!this.data.slug) {
      this.setData({ state: 'failed' as ViewState });
      return;
    }
    this.setData({ state: 'loading' as ViewState, imageFailed: false, logoFailed: false });
    const loadProgrammes = (page: number) => this.data.planningEntry
      ? createPlanningDiscoveryService().programmes(this.data.slug, this.data.planningFilters, page)
      : getUniversityProgrammes(this.data.slug, page, 48);
    const [detail, programmes, catalogue] = await Promise.all([
      getUniversityDetail(this.data.slug),
      loadProgrammes(1),
      loadFilterOptions(),
    ]);
    if (!detail.ok || !programmes.ok) {
      const error = !detail.ok ? detail.error : (!programmes.ok ? programmes.error : null);
      if (error?.code === 'REQUEST_SUPERSEDED') return;
      this.setData({ state: error?.kind === 'unavailable' ? 'offline' as ViewState : 'failed' as ViewState });
      return;
    }
    const allProgrammes = [...programmes.value.items];
    // The service shares one request key, so later pages must complete in order.
    for (let page = 2; page <= programmes.value.totalPages; page++) {
      const next = await loadProgrammes(page);
      if (!next.ok) {
        if (next.error.code === 'REQUEST_SUPERSEDED') return;
        this.setData({ state: next.error.kind === 'unavailable' ? 'offline' as ViewState : 'failed' as ViewState });
        return;
      }
      allProgrammes.push(...next.value.items);
    }
    if (allProgrammes.length !== programmes.value.totalItems) {
      this.setData({ state: 'failed' as ViewState });
      return;
    }
    const labels = new Map(catalogue.ok
      ? catalogue.value.subjectCategories.map((category) => [category.code, category.nameZh]) : []);
    const programmeCategories = deriveProgrammeCategories(allProgrammes, labels)
      .filter((category) => category.code !== 'ALL');
    const activeCategory = this.data.planningEntry ? '' : programmeCategories.some((category) => category.code === this.data.activeCategory)
      ? this.data.activeCategory : programmeCategories[0]?.code ?? '';
    this.setData({
      university: detail.value,
      programmes: allProgrammes,
      programmeCount: programmes.value.totalItems,
      programmeCategories,
      featuredCategories: programmeCategories.slice(0, 4),
      activeCategory,
      visibleProgrammes: this.data.planningEntry ? allProgrammes : filterProgrammes(allProgrammes, activeCategory),
      location: [detail.value.cityZh, detail.value.countryNameZh].filter(Boolean).join('，'),
      levelSummary: summarizeLevels(allProgrammes),
      profileFacts: detail.value.sections.map((section) => ({
        label: section.titleZh || section.titleEn,
        value: section.bodyZh || section.bodyEn,
      })).filter((fact) => fact.label && fact.value),
      descriptionParagraphs: detail.value.descriptionZh.split(/\r?\n/).map((paragraph) => paragraph.trim()).filter(Boolean),
      logoLetter: detail.value.nameEn.charAt(0).toUpperCase() || 'U',
      state: 'ready' as ViewState,
    });
    wx.setNavigationBarTitle({ title: detail.value.nameZh });
  },
});

type BasicFact = { label: string; value: string };

function summarizeLevels(programmes: readonly UniversityProgramme[]): string {
  const labels: Readonly<Record<string, string>> = {
    FOUNDATION: '预科', DIPLOMA: '文凭', BACHELOR: '本科', MASTER: '硕士', DOCTORATE: '博士',
  };
  const levels = [...new Set(programmes.map((programme) => labels[programme.studyLevelCode] || programme.studyLevelCode).filter(Boolean))];
  return levels.join('、') || '待确认';
}
