import test from 'node:test';
import assert from 'node:assert/strict';
import { buildAudit, validateAuditRecord } from './programme-taxonomy-audit.mjs';

const row = overrides => ({
  universitySlug: 'um', programmeCode: 'UM_TEST', verified: true,
  nameZh: '计算机科学学士', nameEn: 'Bachelor of Computer Science', studyLevelCode: 'BACHELOR',
  categoryCode: 'COMPUTING_IT', sourceUrl: 'https://study.um.edu.my/test',
  sourceCheckedAt: '2026-10-14T08:00:00Z',
  evidence: { title: 'Bachelor of Computer Science', text: 'Bachelor of Computer Science' }, ...overrides,
});
test('accepts a complete official record', () => assert.deepEqual(validateAuditRecord(row()), []));
test('rejects subject swaps even when qualification prefixes are similar', () => {
  for (const [previous, proposed] of [
    ['BACHELOR OF SCIENCE (NUCLEAR SCIENCE)', 'Bachelor of Science with Honours (Marine Science)'],
    ['MASTER OF COMPUTING', 'Master of Accounting'],
    ['MASTER OF HEALTH SCIENCE', 'Master of Data Science'],
  ]) {
    assert.ok(validateAuditRecord(row({ universitySlug: 'ukm', sourceUrl: 'https://www.ukm.my/degree',
      current: { nameEn: previous }, nameEn: proposed })).some(error => error.includes('专业主体')));
  }
});
test('rejects date values parsed into programme titles', () => {
  assert.ok(validateAuditRecord(row({ nameEn: '2027-09-01' })).includes('缺少官网英文名称'));
});
test('rejects GPA and faculty headings instead of programme names', () => {
  for (const nameEn of ['CGPA of 3.0', 'All Faculty', 'IELTS 6.0', 'Tuition fee']) {
    assert.ok(validateAuditRecord(row({ nameEn })).some(error => error.includes('院系标题')));
  }
});
test('rejects unrelated host and deceptive host suffix', () => {
  for (const sourceUrl of ['https://example.com/programme', 'https://um.edu.my.example.com/programme']) {
    assert.ok(validateAuditRecord(row({ sourceUrl })).some(error => error.includes('官方 HTTPS')));
  }
});
test('rejects doctorate assigned to masters and certificate assigned to masters', () => {
  assert.ok(validateAuditRecord(row({ nameEn: 'Doctor of Philosophy', studyLevelCode: 'MASTER' })).some(error => error.includes('博士')));
  assert.ok(validateAuditRecord(row({ nameEn: 'Postgraduate Diploma in Education', studyLevelCode: 'MASTER' })).some(error => error.includes('文凭')));
});
test('requires evidence and a valid time for verified rows', () => {
  assert.ok(validateAuditRecord(row({ evidence: {}, sourceCheckedAt: null })).length >= 2);
});
test('refuses partial coverage and duplicate input IDs', () => {
  const snapshot = { universities: [{ slug: 'um', records: [{ programmeCode: 'UM_TEST' }, { programmeCode: 'UM_SECOND' }] }] };
  assert.throws(() => buildAudit(snapshot, [{ records: [row()] }]), /未覆盖全量/);
  assert.throws(() => buildAudit(snapshot, [{ records: [row(), row()] }]), /重复审核/);
});
test('marks identical qualifications with the same mode for review without dropping records', () => {
  const records = ['UM_ONE', 'UM_TWO'].map(programmeCode => ({ programmeCode, nameZh: '计算机科学学士',
    nameEn: 'Bachelor of Computer Science', studyLevelCode: 'BACHELOR', categoryCode: 'COMPUTING_IT', courseModeCode: 'ON_CAMPUS' }));
  const result = buildAudit({ universities: [{ slug: 'um', records }] }, [{ records: records.map(record => row({ ...record })) }]);
  assert.equal(result.records.length, 2);
  assert.equal(result.summary.duplicatePendingReview, 1);
  assert.equal(result.records.filter(record => record.verified).length, 1);
});
test('preserves distinct delivery modes when titles match', () => {
  const records = ['ON_CAMPUS', 'ONLINE'].map((courseModeCode, index) => ({ programmeCode: 'UM_MODE_' + index,
    nameZh: '计算机科学学士', nameEn: 'Bachelor of Computer Science', studyLevelCode: 'BACHELOR', categoryCode: 'COMPUTING_IT', courseModeCode }));
  const result = buildAudit({ universities: [{ slug: 'um', records }] }, [{ records: records.map(record => row({ ...record })) }]);
  assert.equal(result.summary.verified, 2);
});
test('does not deduplicate generic qualifications in distinct disciplines', () => {
  const records = ['ENGINEERING', 'EDUCATION'].map((categoryCode, index) => ({ programmeCode: 'UM_PHD_' + index,
    nameZh: '哲学博士', nameEn: 'Doctor of Philosophy', studyLevelCode: 'DOCTOR', categoryCode, courseModeCode: 'ON_CAMPUS' }));
  const result = buildAudit({ universities: [{ slug: 'um', records }] }, [{ records: records.map(record => row({ ...record })) }]);
  assert.equal(result.summary.verified, 2);
});
