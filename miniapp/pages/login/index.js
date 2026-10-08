const api = require('../../utils/api')
const { saveSession } = require('../../utils/session')

Page({
  data: { identifier: '', password: '', submitting: false, error: '' },
  onLoad(query) { this.returnTo = query.returnTo ? decodeURIComponent(query.returnTo) : '/pages/me/index' },
  input(event) { this.setData({ [event.currentTarget.dataset.field]: event.detail.value }) },
  async submit() {
    if (!this.data.identifier.trim() || !this.data.password) return this.setData({ error: '请输入手机号/邮箱和密码。' })
    this.setData({ submitting: true, error: '' })
    try {
      const session = await api.write('/api/v1/auth/login', { identifier: this.data.identifier.trim(), password: this.data.password, rememberMe: true })
      saveSession(session)
      wx.showToast({ title: '登录成功', icon: 'success' })
      setTimeout(() => wx.redirectTo({ url: this.returnTo }), 350)
    } catch (error) {
      this.setData({ submitting: false, error: error.statusCode === 401 ? '账号或密码不正确。' : api.errorMessage(error) })
    }
  }
})
