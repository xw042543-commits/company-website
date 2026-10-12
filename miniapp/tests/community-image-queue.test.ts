import test from 'node:test';
import assert from 'node:assert/strict';
import { ImageUploadQueue } from '../miniprogram/utils/community-image-queue';

test('limits upload concurrency to two and retains selected order', async () => {
  const completions: ((id: string) => void)[] = [];
  let running = 0; let peak = 0;
  const queue = new ImageUploadQueue(async () => {
    running++; peak = Math.max(peak, running);
    const id = await new Promise<string>((resolve) => completions.push(resolve)); running--;
    return { id, width: 10, height: 10 };
  }, () => undefined);
  queue.add(['/one', '/two', '/three']);
  assert.equal(completions.length, 2);
  completions[1]!('b'.repeat(32)); await new Promise(setImmediate);
  completions[2]!('c'.repeat(32)); completions[0]!('a'.repeat(32)); await new Promise(setImmediate);
  assert.equal(peak, 2);
  assert.deepEqual(queue.imageIds(), ['a'.repeat(32), 'b'.repeat(32), 'c'.repeat(32)]);
});
test('removing an inflight image and disposing ignores late results', async () => {
  let complete!: (value: { id: string; width: number; height: number }) => void;
  let updates = 0;
  const queue = new ImageUploadQueue(() => new Promise((resolve) => { complete = resolve; }), () => { updates++; });
  queue.add(['/one']); queue.remove(queue.items[0]!.key); queue.dispose();
  const before = updates;
  complete({ id: 'a'.repeat(32), width: 10, height: 10 }); await new Promise(setImmediate);
  assert.equal(queue.items.length, 0); assert.equal(updates, before);
});
test('failed uploads block submission, retry succeeds, and a tenth selection is rejected', async () => {
  let attempts = 0;
  const queue = new ImageUploadQueue(async () => {
    if (++attempts === 1) throw new Error('network');
    return { id: 'a'.repeat(32), width: 10, height: 10 };
  }, () => undefined);
  queue.add(['/one']); await new Promise(setImmediate);
  assert.equal(queue.items[0]!.status, 'failed'); assert.equal(queue.imageIds(), null);
  queue.retry(queue.items[0]!.key); await new Promise(setImmediate);
  assert.deepEqual(queue.imageIds(), ['a'.repeat(32)]);
  assert.throws(() => queue.add(Array(9).fill('/more')));
});
test('restored recent uploads are reused while expired IDs are uploaded again', async () => {
  let uploads = 0;
  const queue = new ImageUploadQueue(async () => { uploads++; return { id: 'b'.repeat(32), width: 1, height: 1 }; }, () => undefined);
  queue.restore([{ path: '/fresh', uploaded: { id: 'a'.repeat(32), width: 1, height: 1 }, uploadedAt: Date.now() },
    { path: '/expired', uploaded: { id: 'c'.repeat(32), width: 1, height: 1 }, uploadedAt: Date.now() - 86400001 }]);
  await new Promise(setImmediate);
  assert.equal(uploads, 1); assert.deepEqual(queue.imageIds(), ['a'.repeat(32), 'b'.repeat(32)]);
});
