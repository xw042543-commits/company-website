const SESSION_KEY = 'udajo:miniapp:session'

function restoreSession() {
  return wx.getStorageSync(SESSION_KEY) || null
}

function saveSession(session) {
  wx.setStorageSync(SESSION_KEY, session)
  getApp().globalData.session = session
}

function clearSession() {
  wx.removeStorageSync(SESSION_KEY)
  getApp().globalData.session = null
}

function isAuthenticated() {
  const session = getApp().globalData.session || restoreSession()
  return Boolean(session && session.authenticated)
}

function requireLogin(returnTo) {
  if (isAuthenticated()) return true
  wx.navigateTo({ url: `/pages/login/index?returnTo=${encodeURIComponent(returnTo || '/pages/me/index')}` })
  return false
}

module.exports = { restoreSession, saveSession, clearSession, isAuthenticated, requireLogin }
