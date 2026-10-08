const { API_BASE_URL } = require('./config')

const COOKIE_KEY = 'udajo:miniapp:cookie'

function cookieFromHeader(header, responseCookies) {
  const raw = header && (header['Set-Cookie'] || header['set-cookie'])
  const values = responseCookies && responseCookies.length
    ? responseCookies
    : !raw ? [] : Array.isArray(raw) ? raw : String(raw).split(/,(?=\s*[^;,=]+=[^;,]+)/)
  return values.map(value => value.split(';')[0]).filter(Boolean).join('; ')
}

function mergeCookies(current, received) {
  const cookies = new Map()
  ;[current, received].filter(Boolean).forEach(group => group.split(';').forEach(part => {
    const value = part.trim()
    const separator = value.indexOf('=')
    if (separator > 0) cookies.set(value.slice(0, separator), value)
  }))
  return Array.from(cookies.values()).join('; ')
}

function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    const cookie = wx.getStorageSync(COOKIE_KEY)
    wx.request({
      url: `${API_BASE_URL}${path}`,
      method: options.method || 'GET',
      data: options.data,
      timeout: options.timeout || 8000,
      header: Object.assign({ Accept: 'application/json' }, cookie ? { Cookie: cookie } : {}, options.header || {}),
      success(response) {
        const received = cookieFromHeader(response.header, response.cookies)
        if (received) wx.setStorageSync(COOKIE_KEY, mergeCookies(cookie, received))
        if (response.statusCode >= 200 && response.statusCode < 300) resolve(response.data)
        else reject({ statusCode: response.statusCode, data: response.data })
      },
      fail: () => reject({ statusCode: 0, data: { message: '网络连接失败，请稍后重试' } })
    })
  })
}

async function csrf() {
  return request('/api/v1/auth/csrf')
}

async function write(path, data, method = 'POST') {
  const token = await csrf()
  return request(path, {
    method,
    data,
    header: { 'Content-Type': 'application/json', [token.headerName]: token.token }
  })
}

function errorMessage(error) {
  if (error.statusCode === 401 || error.statusCode === 403) return '登录状态已失效，请重新登录'
  if (error.statusCode === 429) return '操作过于频繁，请稍后再试'
  if (error.statusCode === 503) return '服务暂不可用，请稍后再试'
  if (error.data && error.data.code === 'VALIDATION_ERROR') return '请检查并完善提交的信息'
  return (error.data && error.data.message) || '操作失败，请稍后重试'
}

module.exports = { request, write, errorMessage, COOKIE_KEY, mergeCookies }
