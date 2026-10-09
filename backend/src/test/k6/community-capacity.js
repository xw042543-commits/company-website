import http from 'k6/http';
import { check, fail } from 'k6';
import exec from 'k6/execution';
import { SharedArray } from 'k6/data';
import { randomBytes } from 'k6/crypto';

// Deliberately pinned: no remote hostname, alternate port, credentials, path, or redirect is accepted.
const baseUrl = __ENV.COMMUNITY_LOAD_BASE_URL || 'http://127.0.0.1:18080';
if (__ENV.COMMUNITY_LOAD_ISOLATED !== 'yes' || baseUrl !== 'http://127.0.0.1:18080') {
  throw new Error('Only the acknowledged isolated loopback load-test target is allowed');
}
if (!__ENV.COMMUNITY_LOAD_FIXTURE) throw new Error('An isolated synthetic fixture is required');
const fixture = JSON.parse(open(__ENV.COMMUNITY_LOAD_FIXTURE));
if (fixture.marker !== 'isolated-community-load-v1' || fixture.baseUrl !== baseUrl
    || !/^[A-Za-z0-9-]{1,40}$/.test(fixture.runId)
    || fixture.sentinelBody !== `isolated-community-load:${fixture.runId}`) {
  throw new Error('Fixture is not from the isolated load-test database');
}
const accounts = new SharedArray('synthetic accounts', () => fixture.accounts);
delete fixture.accounts;
if (accounts.length !== 5000) throw new Error('Exactly 5000 synthetic accounts are required');
if (accounts.some(a => !/^[1-9][0-9]*$/.test(a.id) || typeof a.token !== 'string' || !a.token)
    || new Set(accounts.map(a => a.id)).size !== 5000 || new Set(accounts.map(a => a.token)).size !== 5000) {
  throw new Error('5000 distinct synthetic account IDs and credentials are required');
}
if (!Array.isArray(fixture.postIds) || fixture.postIds.length < 2
    || fixture.postIds.some(id => !/^[1-9][0-9]*$/.test(id))) throw new Error('Synthetic post IDs are required');

export const options = {
  scenarios: {
    reads: { executor: 'constant-arrival-rate', rate: 100, timeUnit: '1s', duration: '10m', preAllocatedVUs: 400, maxVUs: 500 },
    writes: { executor: 'constant-arrival-rate', rate: 20, timeUnit: '1s', duration: '10m', preAllocatedVUs: 100, maxVUs: 200 },
  },
  thresholds: { http_req_failed: ['rate<0.01'], http_req_duration: ['p(95)<500', 'p(99)<1000'] },
};

function params(index, name, key) {
  const headers = {
    Authorization: `Bearer ${accounts[index % 5000].token}`,
    'Content-Type': 'application/json',
    // Only the isolated backend trusts loopback. Synthetic benchmark addresses represent independent clients.
    'X-Forwarded-For': `198.18.${Math.floor((index % 5000) / 250)}.${(index % 250) + 1}`,
  };
  if (key) headers['Idempotency-Key'] = key;
  return { headers, tags: { name }, redirects: 0, timeout: '5s' };
}

export function setup() {
  // A read-only sentinel prevents writes through an accidental loopback tunnel to a different database.
  const response = http.get(`${baseUrl}/api/v1/community/posts/${fixture.postIds[0]}`,
    params(0, '/api/v1/community/posts/:id'));
  if (response.status !== 200 || response.json().body !== fixture.sentinelBody) {
    fail('Isolated database sentinel did not match; no writes were started');
  }
  // setup runs once per execution; its returned data is supplied unchanged to every VU.
  return { nonce: Array.from(new Uint8Array(randomBytes(16)), byte => byte.toString(16).padStart(2, '0')).join('') };
}

export default function (setupData) {
  if (!setupData || !/^[0-9a-f]{32}$/.test(setupData.nonce)) fail('Execution setup nonce is required');
  const iteration = exec.scenario.iterationInTest;
  const block = Math.floor(iteration / 10);
  // Each ten-request block retains the exact mix, while account laps rotate commands.
  const bucket = (iteration % 10 + block % 10 + Math.floor(iteration / 5000) * 3) % 10;
  // Independent per-operation ordinals visit every seeded thread, not only a bucket's residue.
  const target = ordinal => fixture.postIds[(ordinal * 37) % fixture.postIds.length];
  let response;
  if (exec.scenario.name === 'reads') {
    if (bucket < 4) response = http.get(`${baseUrl}/api/v1/community/posts?sort=latest&size=20`, params(iteration, '/api/v1/community/posts?sort=latest'));
    else if (bucket < 7) response = http.get(`${baseUrl}/api/v1/community/posts?sort=hot&size=20`, params(iteration, '/api/v1/community/posts?sort=hot'));
    else if (bucket < 9) response = http.get(`${baseUrl}/api/v1/community/posts/${target(block * 2 + bucket - 7)}`, params(iteration, '/api/v1/community/posts/:id'));
    else response = http.get(`${baseUrl}/api/v1/community/posts/${target(block)}/comments?size=20`, params(iteration, '/api/v1/community/posts/:id/comments'));
  } else {
    const key = `${setupData.nonce}:${iteration.toString(36)}`;
    if (bucket < 4) response = http.post(`${baseUrl}/api/v1/community/posts/${target(block * 4 + bucket)}/comments`, JSON.stringify({ body: 'Synthetic capacity comment' }),
      params(iteration, '/api/v1/community/posts/:id/comments', key));
    else if (bucket < 8) response = http.put(`${baseUrl}/api/v1/community/posts/${target(block * 4 + bucket - 4)}/like`, null, params(iteration, '/api/v1/community/posts/:id/like'));
    else response = http.post(`${baseUrl}/api/v1/community/posts`, JSON.stringify({ body: 'Synthetic capacity post' }),
      params(iteration, '/api/v1/community/posts', key));
  }
  check(response, { 'community request accepted': r => r.status >= 200 && r.status < 300 });
}
