import {
  addProgrammeFavorite,
  getProgrammeDetail,
  getProgrammeFavorites,
  removeProgrammeFavorite,
  type ProgrammeDetail,
} from '../../services/miniapp-data';
import { sessionStore } from '../../stores/session';
import { buildProgrammeDocument, type ProgrammeDocumentSection } from '../../utils/discovery-view';
import { consultationRoute } from '../../utils/routes';

type ViewState = 'loading' | 'ready' | 'offline' | 'failed';
type BasicFact = { label: string; value: string };

Page({
  favoriteRevision: 0,
  data: {
    universitySlug: '', programmeId: '', state: 'loading' as ViewState,
    programme: null as ProgrammeDetail | null,
    documentSections: [] as ProgrammeDocumentSection[], basicFacts: [] as BasicFact[],
    universityLogoUrl: null as string | null, logoLetter: 'U',
    statusBarHeight: 20, navigationHeight: 44, navigationRight: 96,
    favorite: false, saving: false, imageFailed: false,
  },
  onLoad(options: Record<string, string | undefined>) {
    this.setupNavigation();
    try {
      this.setData({
        universitySlug: decodeURIComponent(options.universitySlug ?? ''),
        programmeId: decodeURIComponent(options.programmeId ?? ''),
      });
    } catch {
      this.setData({ state: 'failed' as ViewState });
      return;
    }
    void this.loadPage();
  },
  back() { wx.navigateBack(); },
  retry() { void this.loadPage(); },
  imageError() { this.setData({ imageFailed: true }); },
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
  consult() {
    const programme = this.data.programme;
    if (!programme) return;
    const route = consultationRoute({ school: programme.universityNameZh, course: programme.nameZh,
      qualification: normalizeQualification(programme.studyLevelCode) });
    if (route.ok) wx.navigateTo({ url: route.value });
  },
  async toggleFavorite() {
    const programme = this.data.programme;
    if (!programme || this.data.saving) return;
    this.favoriteRevision += 1;
    this.setData({ saving: true });
    const auth = await sessionStore.ensureAuthenticated();
    if (!auth.ok) { this.setData({ saving: false }); wx.showToast({ title: '请先完成微信登录', icon: 'none' }); return; }
    const previous = this.data.favorite;
    this.setData({ saving: true, favorite: !previous });
    const result = previous
      ? await removeProgrammeFavorite(programme.id)
      : await addProgrammeFavorite(programme.id);
    this.setData({ saving: false });
    if (!result.ok) { this.setData({ favorite: previous }); wx.showToast({ title: '操作失败，请重试', icon: 'none' }); return; }
    wx.showToast({ title: previous ? '已取消收藏' : '已收藏专业', icon: 'none' });
  },
  async loadPage() {
    this.setData({ state: 'loading' as ViewState, imageFailed: false });
    const result = await getProgrammeDetail(this.data.universitySlug, this.data.programmeId);
    if (!result.ok) {
      if (result.error.code === 'REQUEST_SUPERSEDED') return;
      this.setData({ state: result.error.kind === 'unavailable' ? 'offline' as ViewState : 'failed' as ViewState });
      return;
    }
    const programme = result.value;
    this.setData({
      programme,
      documentSections: buildProgrammeDocument(programme),
      basicFacts: buildBasicFacts(programme),
      universityLogoUrl: programme.universityLogoUrl,
      logoLetter: programme.universityNameEn.charAt(0).toUpperCase() || 'U',
      state: 'ready' as ViewState,
    });
    wx.setNavigationBarTitle({ title: result.value.nameZh });
    if (sessionStore.getSnapshot().status === 'authenticated') {
      const revision = this.favoriteRevision;
      const favorites = await getProgrammeFavorites();
      if (favorites.ok && !this.data.saving && revision === this.favoriteRevision) this.setData({ favorite: favorites.value.some((item) => item.id === result.value.id) });
    }
  },
});

function buildBasicFacts(programme: ProgrammeDetail): BasicFact[] {
  return [
    { label: '学历', value: programme.studyLevelCode || '待确认' },
    { label: '学制', value: programme.durationDisplay || '待确认' },
    { label: '模式／方式', value: programme.courseModeCode || programme.studyPaceDisplay || '待确认' },
    { label: '授课语言', value: programme.languageCodes.join(' · ') || '待确认' },
    { label: '开学日期', value: programme.intakeDisplayTexts.join(' · ') || '请咨询院校' },
    { label: '学习地点', value: programme.cityZh },
    { label: '学费', value: programme.tuitionDisplay || '请咨询最新费用' },
  ].filter((fact) => fact.value.trim());
}

function normalizeQualification(value: string): string {
  const normalized = value.trim().toLowerCase();
  return ['foundation', 'bachelor', 'master', 'doctorate'].includes(normalized) ? normalized : '';
}
