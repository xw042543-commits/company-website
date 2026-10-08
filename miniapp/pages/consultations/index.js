const storage = require('../../utils/storage')
const api = require('../../utils/api')
const { requireLogin } = require('../../utils/session')
Page({
  data: { items: [], loading: true, error: '' },
  onShow() { if (requireLogin('/pages/consultations/index')) this.load() },
  present(items) { return items.map(item => ({ ...item, id: item.referenceCode, school: item.intendedSchool || item.school, course: item.intendedCourse || item.course, statusText: ({ NEW: '已提交', IN_PROGRESS: '跟进中', COMPLETED: '已完成' })[item.status] || item.status || '已提交', date: item.submittedAt.slice(0, 10) })) },
  async load() {
    this.setData({ loading: true, error: '' })
    try {
      const items = await api.request('/api/v1/miniapp/me/consultations')
      storage.write('consultations', items)
      this.setData({ items: this.present(items), loading: false })
    } catch (error) {
      this.setData({ items: this.present(storage.read('consultations')), loading: false, error: api.errorMessage(error) })
    }
  },
  create() { wx.navigateTo({ url: '/pages/consultation/index' }) }
})
