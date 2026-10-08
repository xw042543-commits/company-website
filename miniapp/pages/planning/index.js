const storage = require('../../utils/storage')
const api = require('../../utils/api')
const { requireLogin } = require('../../utils/session')

const EMPTY = { goal: '', subjects: [], country: '', intake: '', education: '', grade: '', language: '', budget: '' }

Page({
  data: {
    step: 1,
    progress: 33,
    form: { ...EMPTY },
    goals: ['本科', '硕士', '博士', '语言课程'],
    subjectOptions: ['计算机', '商科', '工程', '设计', '医学', '教育'].map(label => ({ label, selected: false })),
    subjectText: '待确认',
    countries: ['马来西亚', '新加坡', '澳大利亚', '英国', '美国'],
    educations: ['高中在读', '高中毕业', '本科在读', '本科毕业', '硕士及以上']
  },
  async onLoad(query) {
    const returnTo = `/pages/planning/index${query.id ? `?id=${encodeURIComponent(query.id)}` : ''}`
    if (!requireLogin(returnTo)) return
    if (query.id) {
      let plan = storage.read('plans').find(item => String(item.id) === String(query.id))
      try {
        const plans = await api.request('/api/v1/miniapp/me/plans')
        storage.write('plans', plans)
        plan = plans.find(item => String(item.id) === String(query.id))
      } catch (_) {}
      if (plan) {
        const form = { ...EMPTY, ...plan.form }
        this.setData({ form, editingId: plan.id,
          subjectOptions: this.data.subjectOptions.map(item => ({ ...item, selected: form.subjects.includes(item.label) })),
          subjectText: form.subjects.join('、') || '待确认' })
      }
    }
  },
  setChoice(event) {
    this.setData({ [`form.${event.currentTarget.dataset.field}`]: event.currentTarget.dataset.value })
  },
  toggleSubject(event) {
    const value = event.currentTarget.dataset.value
    const subjects = this.data.form.subjects.includes(value)
      ? this.data.form.subjects.filter(item => item !== value)
      : [...this.data.form.subjects, value]
    this.setData({ 'form.subjects': subjects,
      subjectOptions: this.data.subjectOptions.map(item => ({ ...item, selected: subjects.includes(item.label) })),
      subjectText: subjects.join('、') || '待确认' })
  },
  input(event) { this.setData({ [`form.${event.currentTarget.dataset.field}`]: event.detail.value }) },
  next() {
    if (this.data.step === 1 && (!this.data.form.goal || !this.data.form.country)) return this.warn('请选择留学目标和国家/地区')
    if (this.data.step === 2 && !this.data.form.education) return this.warn('请选择当前学历')
    const step = Math.min(3, this.data.step + 1)
    this.setData({ step, progress: step * 33 + (step === 3 ? 1 : 0) })
  },
  previous() {
    const step = Math.max(1, this.data.step - 1)
    this.setData({ step, progress: step * 33 + (step === 3 ? 1 : 0) })
  },
  async save() {
    if (!requireLogin('/pages/planning/index')) return
    if (!this.data.form.goal || !this.data.form.country || !this.data.form.education) return this.warn('请先完善必填信息')
    this.setData({ saving: true })
    try {
      const path = this.data.editingId ? `/api/v1/miniapp/me/plans/${this.data.editingId}` : '/api/v1/miniapp/me/plans'
      const saved = await api.write(path, this.data.form, this.data.editingId ? 'PUT' : 'POST')
      storage.upsert('plans', saved)
      this.setData({ saving: false, editingId: saved.id })
      wx.showToast({ title: '规划已保存', icon: 'success' })
      setTimeout(() => wx.redirectTo({ url: '/pages/plans/index' }), 500)
    } catch (error) {
      this.setData({ saving: false })
      wx.showToast({ title: api.errorMessage(error), icon: 'none' })
    }
  },
  warn(title) { wx.showToast({ title, icon: 'none' }) }
  ,goMe() { wx.navigateTo({ url: '/pages/me/index' }) }
})
