Page({
  data: { email: 'udajoedu@gmail.com', version: '0.1.3' },
  copyEmail() {
    wx.setClipboardData({ data: this.data.email, success: () => wx.showToast({ title: '邮箱已复制', icon: 'success' }) });
  },
});

