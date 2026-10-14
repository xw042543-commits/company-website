import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const migrationPath = new URL("../backend/src/main/resources/db/migration/V41__repair_private_malaysia_programme_basic_info.sql", import.meta.url);
const auditPath = new URL("../docs/data/audits/basic-info-private-c-2026-10-14.json", import.meta.url);

test("task C audit covers every published programme in the five assigned universities", async () => {
  const audit = JSON.parse(await readFile(auditPath, "utf8"));
  assert.equal(audit.publishedProgrammesChecked, 173);
  assert.equal(audit.records.length, 173);
  assert.equal(new Set(audit.records.map((record) => record.programmeCode)).size, 173);
  const counts = Object.fromEntries([...new Set(audit.records.map((record) => record.universitySlug))]
    .map((slug) => [slug, audit.records.filter((record) => record.universitySlug === slug).length]));
  assert.deepEqual(counts, { segi: 3, utar: 79, nilai: 41, mahsa: 4, help: 46 });
  assert.ok(audit.records.every((record) => record.fieldsChecked.length === 9));
});

test("V41 changes basic information only and protects the expected production scope", async () => {
  const sql = await readFile(migrationPath, "utf8");
  const facts = [...sql.matchAll(/^    \('UTAR_BACHELOR_\d{3}',/gm)];
  assert.equal(facts.length, 78);
  assert.match(sql, /published_count > 0 AND \(published_count <> 79 OR matched_count <> 78\)/);
  assert.match(sql, /total_count > 0 AND total_count <> 173/);
  assert.doesNotMatch(sql, /SET\s+(?:name|description)_(?:zh|en)\s*=/i);
  assert.doesNotMatch(sql, /section_type[^\n]*'(?:CURRICULUM|CAREER_OPPORTUNITIES)'/i);
  assert.match(sql, /'ADMISSIONS'/);
});
