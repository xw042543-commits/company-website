const KEYS = {
  favorites: 'udajo:miniapp:favorites',
  plans: 'udajo:miniapp:plans',
  consultations: 'udajo:miniapp:consultations'
}

function storageKey(kind) {
  let userId = 'anonymous'
  try {
    const session = getApp().globalData.session
    if (session && session.authenticated && session.userId) userId = String(session.userId)
  } catch (_) {}
  return `${KEYS[kind]}:${userId}`
}

function read(kind) {
  const value = wx.getStorageSync(storageKey(kind))
  return Array.isArray(value) ? value : []
}

function write(kind, items) {
  wx.setStorageSync(storageKey(kind), items)
  return items
}

function upsert(kind, item, key = 'id') {
  const items = read(kind)
  const index = items.findIndex(candidate => String(candidate[key]) === String(item[key]))
  if (index >= 0) items[index] = item
  else items.unshift(item)
  return write(kind, items)
}

function remove(kind, value, key = 'id') {
  return write(kind, read(kind).filter(item => String(item[key]) !== String(value)))
}

module.exports = { read, write, upsert, remove }
