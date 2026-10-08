import {
  getUniversityDetail,
  getUniversityProgrammes,
  type UniversityDetail,
  type UniversityProgramme,
} from '../../services/universities';
import { favoriteUniversities } from '../../stores/favorites';

type ViewState = 'loading' | 'ready' | 'failed' | 'offline';

Page({
  data: {
    slug: '',
    state: 'loading' as ViewState,
    university: null as UniversityDetail | null,
    programmes: [] as UniversityProgramme[],
    programmeCount: 0,
    favorite: false,
    imageFailed: false,
    logoLetter: 'U',
  },

  onLoad(options: Record<string, string | undefined>) {
    const slug = options.slug ? decodeURIComponent(options.slug) : '';
    this.setData({ slug, favorite: favoriteUniversities.has(slug) });
    void this.loadPage();
  },
  onShow() {
    if (this.data.slug) this.setData({ favorite: favoriteUniversities.has(this.data.slug) });
  },

  back() { wx.navigateBack(); },
  imageError() { this.setData({ imageFailed: true }); },
  retry() { void this.loadPage(); },
  toggleFavorite() {
    if (!this.data.slug) return;
    const favorite = favoriteUniversities.toggle(this.data.slug);
    this.setData({ favorite });
    wx.showToast({ title: favorite ? '已收藏' : '已取消收藏', icon: 'none' });
  },
  openProgramme() {
    wx.showToast({ title: '专业详情将在模块整合后开放', icon: 'none' });
  },
  consult() {
    wx.showToast({ title: '咨询功能正在接入', icon: 'none' });
  },

  async loadPage() {
    if (!this.data.slug) {
      this.setData({ state: 'failed' as ViewState });
      return;
    }
    this.setData({ state: 'loading' as ViewState, imageFailed: false });
    const [detail, programmes] = await Promise.all([
      getUniversityDetail(this.data.slug),
      getUniversityProgrammes(this.data.slug),
    ]);
    if (!detail.ok || !programmes.ok) {
      const error = !detail.ok ? detail.error : (!programmes.ok ? programmes.error : null);
      if (error?.code === 'REQUEST_SUPERSEDED') return;
      this.setData({ state: error?.kind === 'unavailable' ? 'offline' as ViewState : 'failed' as ViewState });
      return;
    }
    this.setData({
      university: detail.value,
      programmes: programmes.value.items,
      programmeCount: programmes.value.totalItems,
      logoLetter: detail.value.nameEn.charAt(0).toUpperCase() || 'U',
      state: 'ready' as ViewState,
    });
    wx.setNavigationBarTitle({ title: detail.value.nameZh });
  },
});
