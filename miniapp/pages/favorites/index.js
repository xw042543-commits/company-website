const storage = require('../../utils/storage')
const api = require('../../utils/api')
const { requireLogin } = require('../../utils/session')
Page({
  data: { items: [], loading: true, error: '' },
  onShow() { if (requireLogin('/pages/favorites/index')) this.load() },
  async load() {
    this.setData({ loading: true, error: '' })
    try {
      const items = await api.request('/api/v1/miniapp/me/favorites')
      storage.write('favorites', items)
      this.setData({ items, loading: false })
    } catch (error) {
      this.setData({ items: storage.read('favorites'), loading: false, error: api.errorMessage(error) })
    }
  },
  open(event) { const item = event.currentTarget.dataset.item; wx.navigateTo({ url: `/pages/programme-detail/index?university=${item.universitySlug}&programme=${item.id}` }) },
  async remove(event) {
    const id = event.currentTarget.dataset.id
    try {
      await api.write(`/api/v1/miniapp/me/favorites/${id}`, undefined, 'DELETE')
      storage.remove('favorites', id)
      this.setData({ items: this.data.items.filter(item => String(item.id) !== String(id)) })
    } catch (error) { wx.showToast({ title: api.errorMessage(error), icon: 'none' }) }
  }
})
