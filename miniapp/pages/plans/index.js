const storage = require('../../utils/storage')
const api = require('../../utils/api')
const { requireLogin } = require('../../utils/session')
Page({
  data: { items: [], loading: true, error: '' },
  onShow() { if (requireLogin('/pages/plans/index')) this.load() },
  present(items) { return items.map(item => ({ ...item, statusText: item.status === 'COMPLETED' ? '已完成' : '规划中', date: item.updatedAt.slice(0, 10), subjectsText: item.form.subjects.join('、') || '方向待确认' })) },
  async load() {
    this.setData({ loading: true, error: '' })
    try {
      const items = await api.request('/api/v1/miniapp/me/plans')
      storage.write('plans', items)
      this.setData({ items: this.present(items), loading: false })
    } catch (error) {
      this.setData({ items: this.present(storage.read('plans')), loading: false, error: api.errorMessage(error) })
    }
  },
  create() { wx.navigateTo({ url: '/pages/planning/index' }) },
  edit(event) { wx.navigateTo({ url: `/pages/planning/index?id=${event.currentTarget.dataset.id}` }) },
  async remove(event) {
    const id = event.currentTarget.dataset.id
    try {
      await api.write(`/api/v1/miniapp/me/plans/${id}`, undefined, 'DELETE')
      storage.remove('plans', id)
      this.setData({ items: this.data.items.filter(item => String(item.id) !== String(id)) })
    } catch (error) { wx.showToast({ title: api.errorMessage(error), icon: 'none' }) }
  }
})
