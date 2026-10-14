import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const migration = readFileSync(new URL(
  '../backend/src/main/resources/db/migration/V42__audit_programme_career_curriculum_shard_2.sql',
  import.meta.url,
), 'utf8');

test('shard 2 migration stays inside its published-programme partition', () => {
  assert.match(migration, /p\.status = 'PUBLISHED' AND MOD\(p\.id, 4\) = 2/g);
  assert.doesNotMatch(migration, /MOD\(p\.id, 4\) = [013]/);
  assert.doesNotMatch(migration, /UPDATE\s+programmes\b/i);
  assert.doesNotMatch(migration, /DELETE\s+FROM\b/i);
});

test('shard 2 migration only writes career and curriculum sections', () => {
  assert.match(migration, /'CAREER_OPPORTUNITIES'::varchar AS section_type/);
  assert.match(migration, /'CURRICULUM', '专业课程'/);
  assert.doesNotMatch(migration, /'ADMISSIONS'|'INTRODUCTION'|'LEARNING_OUTCOMES'/);
});

test('generated content is explicit and published verified sources cannot be overwritten', () => {
  assert.match(migration, /参考学习领域，非官方课程表/);
  assert.match(migration, /AI 辅助/);
  assert.match(migration, /'ai_generated'/);
  assert.match(migration, /WHERE \(programme_detail_sections\.source_type = 'ai_generated' OR programme_detail_sections\.status <> 'PUBLISHED'\)/);
  assert.doesNotMatch(migration, /source_type\s*=\s*'official'/);
  assert.doesNotMatch(migration, /source_type\s*=\s*'third_party'/);
});

