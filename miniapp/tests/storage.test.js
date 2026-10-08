const assert = require('node:assert/strict')
const test = require('node:test')

const values = new Map()
global.wx = {
  getStorageSync: key => values.get(key),
  setStorageSync: (key, value) => values.set(key, value)
}
let session = { authenticated: true, userId: 1 }
global.getApp = () => ({ globalData: { session } })

const storage = require('../utils/storage')

test('upsert keeps newest item first and replaces an existing item', () => {
  storage.upsert('plans', { id: '1', value: 'first' })
  storage.upsert('plans', { id: '2', value: 'second' })
  storage.upsert('plans', { id: '1', value: 'updated' })
  assert.deepEqual(storage.read('plans'), [
    { id: '2', value: 'second' },
    { id: '1', value: 'updated' }
  ])
})

test('remove only deletes the selected item', () => {
  storage.remove('plans', '2')
  assert.deepEqual(storage.read('plans'), [{ id: '1', value: 'updated' }])
})

test('local fallback data is isolated between signed-in accounts', () => {
  storage.write('favorites', [{ id: 10 }])
  session = { authenticated: true, userId: 2 }
  assert.deepEqual(storage.read('favorites'), [])
  storage.write('favorites', [{ id: 20 }])
  session = { authenticated: true, userId: 1 }
  assert.deepEqual(storage.read('favorites'), [{ id: 10 }])
})
