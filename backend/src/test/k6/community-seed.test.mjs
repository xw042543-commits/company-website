import test, { before, beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
import { randomUUID } from 'node:crypto';

// No externally supplied target: this contract owns a new disposable container without ports.
const container = `community-seed-contract-${randomUUID().slice(0, 8)}`;
const migrations = new URL('../../main/resources/db/migration/', import.meta.url);
const seed = readFileSync(new URL('./community-seed.sql', import.meta.url), 'utf8');
let started = false;
function docker(args, input) {
  return spawnSync('docker', args, { input, encoding: 'utf8', timeout: 30000, maxBuffer: 4 * 1024 * 1024 });
}
function sql(input, database = 'community_load_test') {
  return docker(['exec', '-i', container, 'psql', '-X', '-v', 'ON_ERROR_STOP=1', '-U', 'community_load_test', '-d', database, '-At'], input);
}
function successful(result) {
  assert.equal(result.status, 0, result.stderr || result.error?.message); return result.stdout.trim();
}
before(async () => {
  successful(docker(['run', '-d', '--name', container,
    '-e', 'POSTGRES_DB=community_load_test', '-e', 'POSTGRES_USER=community_load_test',
    '-e', 'POSTGRES_PASSWORD=disposable-contract-only', 'postgres:17.11']));
  started = true;
  for (let attempt = 0; attempt < 100; attempt++) {
    // The image's temporary initialization server accepts sockets; TCP identifies the final server.
    if (docker(['exec', container, 'pg_isready', '-h', '127.0.0.1', '-U', 'community_load_test']).status === 0) return;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  assert.fail('Disposable PostgreSQL did not become ready');
});
beforeEach(() => {
  successful(sql('DROP DATABASE community_load_test WITH (FORCE); CREATE DATABASE community_load_test;', 'postgres'));
  const files = readdirSync(migrations).filter(name => /^V\d+__.*\.sql$/.test(name))
    .sort((a, b) => Number(a.match(/^V(\d+)/)[1]) - Number(b.match(/^V(\d+)/)[1]));
  assert.equal(files.length, 15);
  successful(sql(files.map(name => readFileSync(new URL(name, migrations), 'utf8')).join('\n')));
});
after(() => {
  if (started) { successful(docker(['stop', container])); successful(docker(['rm', container])); }
});

test('consultation-only business data refuses seed atomically', () => {
  successful(sql(`INSERT INTO consultation_enquiries
    (reference_code,name,contact,locale,privacy_consent,privacy_notice_version,status_updated_at)
    VALUES(gen_random_uuid(),'Synthetic refusal','synthetic-only','en',true,'synthetic',now());`));
  const result = sql(seed);
  assert.equal(result.status, 3, 'Nonempty independent business table must refuse seeding');
  assert.match(result.stderr, /non-empty|nonempty/i);
  assert.equal(successful(sql('SELECT (SELECT count(*) FROM consultation_enquiries), (SELECT count(*) FROM user_accounts);')), '1|0');
});
test('catalog-only business data refuses seed atomically', () => {
  successful(sql("INSERT INTO countries(code,name_en,continent_code) VALUES('ZZ','Synthetic refusal','TEST');"));
  assert.equal(sql(seed).status, 3);
  assert.equal(successful(sql('SELECT (SELECT count(*) FROM countries), (SELECT count(*) FROM user_accounts);')), '1|0');
});
test('unclassified future public table is rejected even when empty', () => {
  successful(sql('CREATE TABLE future_business_data(id bigint);'));
  assert.equal(sql(seed).status, 3);
  assert.equal(successful(sql('SELECT count(*) FROM user_accounts;')), '0');
});
test('missing business table is rejected instead of accepting an incomplete schema', () => {
  successful(sql('DROP TABLE consultation_enquiries;'));
  assert.equal(sql(seed).status, 3);
  assert.equal(successful(sql('SELECT count(*) FROM user_accounts;')), '0');
});
test('only migration metadata may be nonempty; fresh seed is complete and repeat is refused', () => {
  successful(sql('CREATE TABLE flyway_schema_history(installed_rank int); INSERT INTO flyway_schema_history VALUES(15);'));
  successful(sql(seed));
  assert.equal(successful(sql(`SELECT (SELECT count(*) FROM user_accounts),
    (SELECT count(*) FROM miniapp_auth_tokens),(SELECT count(*) FROM community_posts),
    (SELECT count(*) FROM community_comments),(SELECT count(*) FROM consultation_enquiries),
    (SELECT count(*) FROM flyway_schema_history);`)), '5000|5000|1000|1000|0|1');
  const fixture = JSON.parse(successful(docker(['exec', container, 'cat', '/tmp/community-load-fixture.json'])));
  assert.equal(fixture.accounts.length, 5000);
  assert.equal(new Set(fixture.accounts.map(a => a.token)).size, 5000);
  assert.equal(fixture.postIds.length, 1000);
  assert.equal(sql(seed).status, 3);
  assert.equal(successful(sql('SELECT count(*) FROM user_accounts;')), '5000');
});
test('wrong database is refused before any business access', () => {
  const result = sql(seed, 'postgres');
  assert.equal(result.status, 3);
  assert.match(result.stderr, /outside the isolated/);
});
