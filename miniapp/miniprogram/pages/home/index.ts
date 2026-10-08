import { searchUniversities, type UniversitySummary } from '../../services/universities';

type PreviewState = 'loading' | 'ready' | 'empty' | 'failed';

Page({
  data: {
    featureEntries: [
      { key: 'planning', label: '规划', caption: '明确留学方向' },
      { key: 'ai', label: 'AI规划', caption: '功能建设中' },
      { key: 'universities', label: '院校清单', caption: '查看真实院校' },
      { key: 'visa', label: '签证查询', caption: '功能建设中' },
    ],
    previewState: 'loading' as PreviewState,
    universities: [] as UniversitySummary[],
  },

  onLoad() {
    void this.loadUniversityPreview();
  },

  openFeature(event: WechatMiniprogram.BaseEvent) {
    const key = event.currentTarget.dataset.key as string | undefined;
    if (key === 'universities') {
      wx.switchTab({ url: '/pages/universities/index' });
      return;
    }
    wx.showToast({ title: key === 'planning' ? '规划功能即将开放' : '功能建设中', icon: 'none' });
  },

  openUniversity() {
    wx.showToast({ title: '院校详情正在接入', icon: 'none' });
  },

  async loadUniversityPreview() {
    this.setData({ previewState: 'loading' as PreviewState });
    const result = await searchUniversities({ page: 1, size: 3 });
    if (!result.ok) {
      this.setData({ previewState: 'failed' as PreviewState });
      return;
    }
    this.setData({
      universities: result.value.items,
      previewState: result.value.items.length > 0 ? 'ready' as PreviewState : 'empty' as PreviewState,
    });
  },
});
