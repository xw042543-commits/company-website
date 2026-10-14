const emgsUrl = 'https://visa.educationmalaysia.gov.my/emgs/application/searchForm/';
export {};

Page({
  data: { emgsUrl },
  copyLink() {
    wx.setClipboardData({
      data: emgsUrl,
      success: () => wx.showToast({ title: '已复制，请到浏览器粘贴打开', icon: 'none' }),
      fail: () => wx.showToast({ title: '复制失败，请重试或长按下方链接复制', icon: 'none' }),
    });
  },
});
