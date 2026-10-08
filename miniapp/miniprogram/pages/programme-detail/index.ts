import {
  addProgrammeFavorite,
  getProgrammeDetail,
  getProgrammeFavorites,
  removeProgrammeFavorite,
  type ProgrammeDetail,
  type ProgrammeDetailSection,
} from '../../services/miniapp-data';
import { sessionStore } from '../../stores/session';

type ViewState = 'loading' | 'ready' | 'offline' | 'failed';
type DetailTab = { key: string; label: string; sections: ProgrammeDetailSection[] };

const TAB_LABELS: Record<string, string> = {
  INTRODUCTION: '介绍', BASIC_INFORMATION: '基本信息', ADMISSION_REQUIREMENTS: '录取要求',
  ADMISSIONS: '录取要求', COURSE_STRUCTURE: '课程安排', CURRICULUM: '课程安排',
  LEARNING_OUTCOMES: '学习成果', CAREER_OUTLOOK: '未来职业', CAREER_OPPORTUNITIES: '未来职业',
  IDEAL_STUDENT: '适合人群', OTHER: '更多资料',
};

Page({
  data: {
    universitySlug: '', programmeId: '', state: 'loading' as ViewState,
    programme: null as ProgrammeDetail | null, tabs: [] as DetailTab[], activeTab: '',
    favorite: false, saving: false, imageFailed: false,
  },
  onLoad(options: Record<string, string | undefined>) {
    this.setData({
      universitySlug: decodeURIComponent(options.universitySlug ?? ''),
      programmeId: decodeURIComponent(options.programmeId ?? ''),
    });
    void this.loadPage();
  },
  back() { wx.navigateBack(); },
  retry() { void this.loadPage(); },
  imageError() { this.setData({ imageFailed: true }); },
  selectTab(event: WechatMiniprogram.BaseEvent) {
    this.setData({ activeTab: String(event.currentTarget.dataset.key ?? '') });
  },
  consult() { wx.showToast({ title: '顾问咨询正在接入', icon: 'none' }); },
  async toggleFavorite() {
    const programme = this.data.programme;
    if (!programme || this.data.saving) return;
    const auth = await sessionStore.ensureAuthenticated();
    if (!auth.ok) { wx.showToast({ title: '请先完成微信登录', icon: 'none' }); return; }
    this.setData({ saving: true });
    const result = this.data.favorite
      ? await removeProgrammeFavorite(programme.id)
      : await addProgrammeFavorite(programme.id);
    this.setData({ saving: false });
    if (!result.ok) { wx.showToast({ title: '操作失败，请重试', icon: 'none' }); return; }
    const favorite = !this.data.favorite;
    this.setData({ favorite });
    wx.showToast({ title: favorite ? '已收藏专业' : '已取消收藏', icon: 'none' });
  },
  async loadPage() {
    this.setData({ state: 'loading' as ViewState, imageFailed: false });
    const result = await getProgrammeDetail(this.data.universitySlug, this.data.programmeId);
    if (!result.ok) {
      this.setData({ state: result.error.kind === 'unavailable' ? 'offline' as ViewState : 'failed' as ViewState });
      return;
    }
    const tabs = buildTabs(result.value);
    this.setData({ programme: result.value, tabs, activeTab: tabs[0]?.key ?? '', state: 'ready' as ViewState });
    wx.setNavigationBarTitle({ title: result.value.nameZh });
    if (sessionStore.getSnapshot().status === 'authenticated') {
      const favorites = await getProgrammeFavorites();
      if (favorites.ok) this.setData({ favorite: favorites.value.some((item) => item.id === result.value.id) });
    }
  },
});

export function buildTabs(programme: ProgrammeDetail): DetailTab[] {
  const grouped = new Map<string, ProgrammeDetailSection[]>();
  programme.sections.forEach((section) => grouped.set(section.type, [...(grouped.get(section.type) ?? []), section]));
  if (programme.descriptionZh && !grouped.has('INTRODUCTION')) {
    grouped.set('INTRODUCTION', [{ type: 'INTRODUCTION', titleZh: '专业介绍', titleEn: '',
      bodyZh: programme.descriptionZh, bodyEn: '', sortOrder: -1 }]);
  }
  return [...grouped.entries()].map(([key, sections]) => ({ key, label: TAB_LABELS[key] ?? '详细资料', sections }));
}
