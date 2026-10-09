import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { randomBytes } from 'node:crypto';

const fixture = process.env.COMMUNITY_SEED_FIXTURE ? JSON.parse(readFileSync(process.env.COMMUNITY_SEED_FIXTURE, 'utf8')) : {
  marker: 'isolated-community-load-v1', baseUrl: 'http://127.0.0.1:18080', runId: 'synthetic-run',
  accounts: Array.from({ length: 5000 }, (_, i) => ({ id: String(i + 1), token: `synthetic-token-${i}` })),
  postIds: ['1', '2'], sentinelBody: 'isolated-community-load:synthetic-run',
};
function load(env = {}, data = fixture) {
  const calls = [];
  const execution = { scenario: { name: 'reads', iterationInTest: 0 }, vu: { idInTest: 1 } };
  // The same artifact runs in a VM with only k6's external boundary replaced; no network is used.
  const source = readFileSync(new URL('./community-capacity.js', import.meta.url), 'utf8')
    .replace(/^import .*;$/gm, '').replace(/export const /g, 'const ')
    .replace(/export function /g, 'function ').replace(/export default function/g, 'function run');
  const response = { status: 200, json: () => ({ body: data.sentinelBody }) };
  const context = {
    __ENV: { COMMUNITY_LOAD_ISOLATED: 'yes', COMMUNITY_LOAD_FIXTURE: '/private/tmp/synthetic.json', ...env },
    open: () => JSON.stringify(data), exec: execution,
    SharedArray: function (_name, factory) { return factory(); },
    randomBytes: size => Uint8Array.from(randomBytes(size)).buffer,
    http: Object.fromEntries(['get', 'post', 'put'].map(method => [method, (...args) => {
      calls.push({ method, args }); return response;
    }])),
    check: (value, checks) => Object.values(checks).every(fn => fn(value)),
    fail: message => { throw new Error(message); },
  };
  const script = new vm.Script(`${source}\n;({options,setup,run});`);
  return { artifact: script.runInNewContext(context), calls, execution, response };
}

test('production, redirects, and unacknowledged targets are rejected before any HTTP call', () => {
  for (const url of ['https://yangdoujiao.com', 'http://localhost:18080', 'http://127.0.0.1:8080',
    'http://127.0.0.1:18080@yangdoujiao.com', 'http://127.0.0.1:18080/']) {
    assert.throws(() => load({ COMMUNITY_LOAD_BASE_URL: url }), /isolated|loopback/i);
  }
  assert.throws(() => load({ COMMUNITY_LOAD_ISOLATED: '' }), /isolated/i);
});
test('fixture must contain exactly 5000 distinct synthetic credentials', () => {
  assert.throws(() => load({}, { ...fixture, accounts: fixture.accounts.slice(0, 4999) }), /5000/);
  assert.throws(() => load({}, { ...fixture, accounts: fixture.accounts.map(() => fixture.accounts[0]) }), /distinct/);
  assert.throws(() => load({}, { ...fixture, marker: 'production' }), /isolated/i);
});
test('setup verifies a read-only database sentinel before allowing writes', () => {
  const { artifact, calls, response } = load();
  response.json = () => ({ body: 'some other database' });
  assert.throws(() => artifact.setup(), /sentinel/i);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].method, 'get');
  assert.equal(calls[0].args[1].redirects, 0);
});
test('capacity model preserves both exact arrival rates and percentile thresholds', () => {
  const { artifact } = load();
  assert.deepEqual(JSON.parse(JSON.stringify(artifact.options)), {
    scenarios: {
      reads: { executor: 'constant-arrival-rate', rate: 100, timeUnit: '1s', duration: '10m', preAllocatedVUs: 400, maxVUs: 500 },
      writes: { executor: 'constant-arrival-rate', rate: 20, timeUnit: '1s', duration: '10m', preAllocatedVUs: 100, maxVUs: 200 },
    }, thresholds: { http_req_failed: ['rate<0.01'], http_req_duration: ['p(95)<500', 'p(99)<1000'] },
  });
});
test('mixed workload uses safe route labels and distinct idempotency keys', () => {
  const { artifact, calls, execution } = load();
  const setupData = artifact.setup(); calls.length = 0;
  for (let i = 0; i < 10; i++) { execution.scenario.iterationInTest = i; artifact.run(setupData); }
  execution.scenario.name = 'writes';
  for (let i = 0; i < 10; i++) { execution.scenario.iterationInTest = i; artifact.run(setupData); }
  assert.ok(calls.some(c => c.args[0].includes('sort=latest')));
  assert.ok(calls.some(c => c.args[0].includes('sort=hot')));
  assert.ok(calls.some(c => c.method === 'get' && /\/posts\/[1-9][0-9]*$/.test(c.args[0])));
  assert.ok(calls.some(c => c.method === 'post' && c.args[0].endsWith('/comments')));
  assert.ok(calls.some(c => c.method === 'put' && c.args[0].endsWith('/like')));
  assert.ok(calls.some(c => c.method === 'post' && c.args[0].endsWith('/posts')));
  const writes = calls.filter(c => c.method === 'post');
  const keys = writes.map(c => c.args[2].headers['Idempotency-Key']);
  assert.equal(new Set(keys).size, writes.length);
  for (const key of keys) assert.match(key, /^[A-Za-z0-9._:-]{1,64}$/);
  for (const c of calls) {
    const params = c.args[c.method === 'get' ? 1 : 2];
    assert.equal(params.redirects, 0);
    assert.ok(params.tags.name.startsWith('/api/v1/community/'));
    assert.ok(!params.tags.name.match(/\/\d+/));
    assert.match(params.headers['X-Forwarded-For'], /^198\.18\./);
  }
});

test('two executions of one fixture never reuse POST keys under identical VU assignment', () => {
  const executionKeys = [];
  for (let run = 0; run < 2; run++) {
    const { artifact, calls, execution } = load();
    const setupData = artifact.setup(); calls.length = 0;
    execution.scenario.name = 'writes';
    for (let i = 0; i < 12000; i++) {
      execution.scenario.iterationInTest = i;
      execution.vu.idInTest = (i % 100) + 1;
      artifact.run(setupData);
    }
    const keys = calls.filter(c => c.method === 'post').map(c => c.args[2].headers['Idempotency-Key']);
    assert.equal(keys.length, 7200);
    assert.equal(new Set(keys).size, 7200);
    keys.forEach(key => assert.match(key, /^[A-Za-z0-9._:-]{1,64}$/));
    executionKeys.push(new Set(keys));
    // Another VU VM receives the same setup result, without generating its own execution nonce.
    const otherVU = load(); otherVU.execution.scenario.name = 'writes';
    for (let i = 12000; i < 12010; i++) {
      otherVU.execution.scenario.iterationInTest = i; otherVU.artifact.run(setupData);
    }
    const otherKey = otherVU.calls.find(c => c.method === 'post').args[2].headers['Idempotency-Key'];
    assert.equal(otherKey.split(':')[0], keys[0].split(':')[0]);
  }
  assert.equal([...executionKeys[0]].filter(key => executionKeys[1].has(key)).length, 0);
});

test('full arrival profile distributes real interactions and reads threads that grow', t => {
  const data = { ...fixture, postIds: Array.from({ length: 1000 }, (_, i) => String(i + 1)) };
  const { artifact, calls, execution } = load({}, data);
  const setupData = artifact.setup(); calls.length = 0;
  execution.scenario.name = 'writes';
  for (let i = 0; i < 12000; i++) { execution.scenario.iterationInTest = i; artifact.run(setupData); }
  const comments = calls.filter(c => c.method === 'post' && c.args[0].endsWith('/comments'));
  const likes = calls.filter(c => c.method === 'put');
  const posts = calls.filter(c => c.method === 'post' && c.args[0].endsWith('/posts'));
  assert.deepEqual([comments.length, likes.length, posts.length], [4800, 4800, 2400]);
  const target = c => new URL(c.args[0]).pathname.split('/')[5];
  const users = new Map();
  for (const c of calls) {
    const account = c.args[2].headers.Authorization;
    const operations = users.get(account) || new Set();
    operations.add(c.method === 'put' ? 'like' : c.args[0].endsWith('/comments') ? 'comment' : 'post');
    users.set(account, operations);
  }
  assert.equal(users.size, 5000);
  assert.ok([...users.values()].filter(operations => operations.size > 1).length >= 3500);
  assert.ok(new Set(comments.map(target)).size >= 900);
  assert.ok(new Set(likes.map(target)).size >= 900);
  assert.equal(new Set(likes.map(c => `${c.args[2].headers.Authorization}:${target(c)}`)).size, 4800);
  const growingThreads = new Set(comments.map(target)); calls.length = 0;
  execution.scenario.name = 'reads';
  for (let i = 0; i < 60000; i++) { execution.scenario.iterationInTest = i; artifact.run(setupData); }
  const commentReads = calls.filter(c => c.args[0].includes('/comments?'));
  assert.deepEqual([
    calls.filter(c => c.args[0].includes('sort=latest')).length,
    calls.filter(c => c.args[0].includes('sort=hot')).length,
    calls.filter(c => /\/posts\/[1-9][0-9]*$/.test(c.args[0])).length,
    commentReads.length,
  ], [24000, 18000, 12000, 6000]);
  assert.ok(new Set(commentReads.map(target)).size >= 900);
  assert.ok(commentReads.filter(c => growingThreads.has(target(c))).length >= 5700);
  t.diagnostic(JSON.stringify({
    writeAccounts: users.size,
    multiOperationAccounts: [...users.values()].filter(operations => operations.size > 1).length,
    commentTargets: growingThreads.size, likeTargets: new Set(likes.map(target)).size,
    uniqueLikePairs: new Set(likes.map(c => `${c.args[2].headers.Authorization}:${target(c)}`)).size,
    commentReadTargets: new Set(commentReads.map(target)).size,
    growingThreadReads: commentReads.filter(c => growingThreads.has(target(c))).length,
  }));
});
