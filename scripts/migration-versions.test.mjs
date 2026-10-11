import assert from 'node:assert/strict';
import test from 'node:test';
import { readdirSync } from 'node:fs';

const migrations = new URL('../backend/src/main/resources/db/migration/', import.meta.url);

test('Flyway migration versions are unique', () => {
  const names = readdirSync(migrations).filter((name) => /^V\d+__.+\.sql$/.test(name));
  const byVersion = new Map();

  for (const name of names) {
    const version = name.match(/^V(\d+)__/)?.[1];
    assert.ok(version, `invalid migration filename: ${name}`);
    const siblings = byVersion.get(version) ?? [];
    siblings.push(name);
    byVersion.set(version, siblings);
  }

  const duplicates = [...byVersion.entries()].filter(([, files]) => files.length > 1);
  assert.deepEqual(duplicates, [], `duplicate Flyway versions: ${JSON.stringify(duplicates)}`);
});
