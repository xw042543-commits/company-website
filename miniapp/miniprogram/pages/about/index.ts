Page({
  data: {
    phone: '15589913695',
    email: 'bertram@staff.udajo.com',
    wechatAccounts: ['udajo005', 'udajo002', 'udajo006'],
  },
  callPhone() {
    wx.makePhoneCall({ phoneNumber: this.data.phone });
  },
  copyContact(event: WechatMiniprogram.BaseEvent) {
    const value = event.currentTarget.dataset.value;
    if (typeof value !== 'string' || !value) return;
    wx.setClipboardData({ data: value, success: () => wx.showToast({ title: '复制成功', icon: 'success' }) });
  },
});
