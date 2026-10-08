const api = require('../../utils/api')
const storage = require('../../utils/storage')
const { restoreSession, saveSession, clearSession } = require('../../utils/session')

Page({
  data: { session: null, account: null, avatarText: '○', counts: { favorites: 0, plans: 0, consultations: 0 }, loading: false },
  onShow() {
    const session = restoreSession()
    this.setData({ session, avatarText: session && session.authenticated ? (session.fullName || '我').slice(0, 1) : '○', counts: {
      favorites: storage.read('favorites').length,
      plans: storage.read('plans').length,
      consultations: storage.read('consultations').length
    } })
    this.refreshAccount()
  },
  async refreshAccount() {
    if (!this.data.session || !this.data.session.authenticated) return
    this.setData({ loading: true })
    try {
      const [session, account, counts] = await Promise.all([api.request('/api/v1/auth/session'), api.request('/api/v1/account'), api.request('/api/v1/miniapp/me')])
      if (!session.authenticated) throw { statusCode: 401 }
      saveSession(session)
      this.setData({ session, account, counts, avatarText: (session.fullName || '我').slice(0, 1), loading: false })
    } catch (error) {
      if (error.statusCode === 401 || error.statusCode === 403) clearSession()
      const session = restoreSession()
      this.setData({ session, account: null, avatarText: session ? (session.fullName || '我').slice(0, 1) : '○', loading: false })
    }
  },
  login() { wx.navigateTo({ url: '/pages/login/index?returnTo=%2Fpages%2Fme%2Findex' }) },
  open(event) { wx.navigateTo({ url: event.currentTarget.dataset.url }) },
  async logout() {
    try { await api.write('/api/v1/auth/logout', undefined) } catch (_) {}
    clearSession()
    this.setData({ session: null, account: null, avatarText: '○' })
  }
})
