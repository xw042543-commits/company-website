Page({
  data: {
    featureEntries: [
      { key: 'planning', label: '规划', caption: '明确留学方向' },
      { key: 'ai', label: 'AI规划', caption: '功能建设中' },
      { key: 'universities', label: '院校清单', caption: '查看真实院校' },
      { key: 'visa', label: '签证查询', caption: '功能建设中' },
    ],
  },

  openFeature(event: WechatMiniprogram.BaseEvent) {
    const key = event.currentTarget.dataset.key as string | undefined;
    if (key === 'universities') {
      wx.switchTab({ url: '/pages/universities/index' });
      return;
    }
    wx.showToast({ title: key === 'planning' ? '规划功能即将开放' : '功能建设中', icon: 'none' });
  },
});
