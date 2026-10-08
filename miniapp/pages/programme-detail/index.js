const api = require('../../utils/api')
const storage = require('../../utils/storage')
const { requireLogin } = require('../../utils/session')

const TABS = [
  { key: 'intro', label: '介绍' },
  { key: 'basic', label: '基本信息' },
  { key: 'admissions', label: '录取要求' },
  { key: 'curriculum', label: '课程安排' },
  { key: 'career', label: '就业方向' }
]

Page({
  data: { loading: true, savingFavorite: false, error: '', programme: null, tabs: TABS, active: 'intro', favorite: false },
  onLoad(query) {
    this.query = query
    if (!query.university || !query.programme) {
      this.setData({ loading: false, error: '缺少院校或专业参数，请从院校专业列表重新进入。' })
      return
    }
    this.load()
  },
  async load() {
    this.setData({ loading: true, error: '' })
    try {
      const path = `/api/v1/miniapp/universities/${encodeURIComponent(this.query.university)}/programmes/${encodeURIComponent(this.query.programme)}`
      const programme = await api.request(path)
      this.setData({ programme: this.present(programme), loading: false })
      this.refreshFavorite(programme.id)
      wx.setNavigationBarTitle({ title: programme.nameZh || programme.nameEn || '专业详情' })
    } catch (error) {
      this.setData({ loading: false, error: error.statusCode === 404 ? '该专业不存在或暂未发布。' : api.errorMessage(error) })
    }
  },
  async refreshFavorite(programmeId) {
    const session = getApp().globalData.session
    if (!session || !session.authenticated) {
      this.setData({ favorite: false })
      return
    }
    try {
      const items = await api.request('/api/v1/miniapp/me/favorites')
      this.setData({ favorite: items.some(item => item.id === programmeId) })
      storage.write('favorites', items)
    } catch (_) {}
  },
  present(programme) {
    const sections = programme.sections || []
    const getSections = types => sections.filter(item => types.includes(item.type)).map(item => ({
      ...item,
      title: item.titleZh || item.titleEn || '',
      paragraphs: (item.bodyZh || item.bodyEn || '').split(/\r?\n/).filter(Boolean)
    }))
    const duration = programme.durationDisplay || (programme.durationMonths ? `${programme.durationMonths}个月` : '待确认')
    const levelLabels = { FOUNDATION: '预科', DIPLOMA: '文凭', BACHELOR: '本科', MASTER: '硕士', DOCTORATE: '博士' }
    return {
      ...programme,
      displayName: programme.nameZh || programme.nameEn,
      universityName: programme.universityNameZh || programme.universityNameEn,
      city: programme.cityZh || programme.cityEn || '待确认',
      description: programme.descriptionZh || programme.descriptionEn || '专业介绍资料正在完善，请联系顾问获取最新官方说明。',
      languages: (programme.languageCodes || []).join(' / ') || '待确认',
      duration,
      studyLevelLabel: levelLabels[programme.studyLevelCode] || programme.studyLevelCode || '专业课程',
      tuition: programme.tuitionDisplay || [programme.tuitionCurrency, programme.tuitionMin].filter(Boolean).join(' ') || '请咨询顾问',
      intakes: (programme.intakeDisplayTexts || []).join('、') || '待确认',
      admissions: getSections(['ADMISSIONS', 'IDEAL_STUDENT']),
      curriculum: getSections(['CURRICULUM', 'LEARNING_OUTCOMES']),
      careers: getSections(['CAREER_OPPORTUNITIES'])
    }
  },
  selectTab(event) { this.setData({ active: event.currentTarget.dataset.key }) },
  async toggleFavorite() {
    const returnTo = `/pages/programme-detail/index?university=${this.query.university}&programme=${this.query.programme}`
    if (!requireLogin(returnTo)) return
    if (this.data.savingFavorite) return
    const programme = this.data.programme
    const wasFavorite = this.data.favorite
    this.setData({ savingFavorite: true })
    try {
      if (wasFavorite) {
        await api.write(`/api/v1/miniapp/me/favorites/${programme.id}`, undefined, 'DELETE')
        storage.remove('favorites', programme.id)
      } else {
        const saved = await api.write(`/api/v1/miniapp/me/favorites/${programme.id}`, {})
        storage.upsert('favorites', saved)
      }
      this.setData({ favorite: !wasFavorite, savingFavorite: false })
      wx.showToast({ title: wasFavorite ? '已取消' : '已收藏', icon: 'success' })
    } catch (error) {
      this.setData({ savingFavorite: false })
      if (error.statusCode === 401 || error.statusCode === 403) return requireLogin(returnTo)
      wx.showToast({ title: api.errorMessage(error), icon: 'none' })
    }
  },
  consult() {
    const p = this.data.programme
    wx.navigateTo({ url: `/pages/consultation/index?school=${encodeURIComponent(p.universityName)}&course=${encodeURIComponent(p.displayName)}` })
  }
})
