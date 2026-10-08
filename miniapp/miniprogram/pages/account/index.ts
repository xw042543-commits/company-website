Page({
  data: {
    menuItems: [
      { key: 'orders', label: '我的订单', caption: '申请业务接入后开放' },
      { key: 'points', label: '会员积分', caption: '积分规则确认后开放' },
      { key: 'consultations', label: '咨询记录', caption: '查看已提交的咨询' },
      { key: 'settings', label: '设置', caption: '账号与隐私设置' },
      { key: 'about', label: '关于我们', caption: '了解洋豆角' },
    ],
  },

  openMenu(event: WechatMiniprogram.BaseEvent) {
    const key = event.currentTarget.dataset.key as string | undefined;
    const title = key === 'consultations' || key === 'settings' || key === 'about'
      ? '功能建设中'
      : '等待真实业务数据';
    wx.showToast({ title, icon: 'none' });
  },
});
