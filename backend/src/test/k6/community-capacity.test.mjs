import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

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
  artifact.setup(); calls.length = 0;
  for (let i = 0; i < 10; i++) { execution.scenario.iterationInTest = i; artifact.run(); }
  execution.scenario.name = 'writes';
  for (let i = 0; i < 10; i++) { execution.scenario.iterationInTest = i; artifact.run(); }
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
