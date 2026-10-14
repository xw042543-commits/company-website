import assert from 'node:assert/strict';
import test from 'node:test';

import { canonicalStudyLevel, normalizeStudyLevelOptions, studyLevelNameZh, uniqueStudyLevelNamesZh } from '../miniprogram/utils/study-level-display';

test('normalizes every supported study-level alias to one Chinese name', () => {
  const cases = [
    ['Foundation', '预科'], ['预科', '预科'], ['Diploma', '大专'], ['文凭', '大专'], ['大专', '大专'],
    ['Bachelor', '本科'], ['本科', '本科'], ['Master', '硕士'], ['硕士', '硕士'],
    ['Doctor', '博士'], ['Doctorate', '博士'], ['Doctoral Degree', '博士'], ['PhD', '博士'], ['博士', '博士'],
  ];
  for (const [code, expected] of cases) assert.equal(studyLevelNameZh({ code }), expected);
  assert.equal(canonicalStudyLevel({ code: 'DOCTOR' }), 'doctorate');
});

test('maps labels before deduplicating summaries and filter options', () => {
  assert.deepEqual(uniqueStudyLevelNamesZh([{ code: 'DIPLOMA' }, { nameZh: '文凭' }, { nameZh: '大专' }]), ['大专']);
  assert.deepEqual(normalizeStudyLevelOptions([
    { code: 'DIPLOMA', nameZh: '文凭', nameEn: 'Diploma' },
    { code: 'diploma', nameZh: '大专', nameEn: 'Diploma' },
    { code: 'DOCTOR', nameZh: 'DOCTOR', nameEn: 'Doctor' },
  ]), [
    { code: 'DIPLOMA', nameZh: '大专', nameEn: 'Diploma' },
    { code: 'DOCTOR', nameZh: '博士', nameEn: 'Doctor' },
  ]);
});
