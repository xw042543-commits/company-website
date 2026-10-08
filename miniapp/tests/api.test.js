const assert = require('node:assert/strict')
const test = require('node:test')

global.wx = { getStorageSync: () => '', setStorageSync: () => {} }
const { mergeCookies, errorMessage } = require('../utils/api')

test('mergeCookies preserves the session while refreshing CSRF cookie', () => {
  assert.equal(
    mergeCookies('JSESSIONID=session-1; XSRF-TOKEN=old', 'XSRF-TOKEN=new'),
    'JSESSIONID=session-1; XSRF-TOKEN=new'
  )
})

test('errorMessage turns backend statuses into actionable Chinese messages', () => {
  assert.equal(errorMessage({ statusCode: 401 }), '登录状态已失效，请重新登录')
  assert.equal(errorMessage({ statusCode: 429 }), '操作过于频繁，请稍后再试')
  assert.equal(errorMessage({ statusCode: 0, data: { message: '离线' } }), '离线')
})
