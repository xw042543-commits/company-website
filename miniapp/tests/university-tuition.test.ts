import assert from 'node:assert/strict';
import test from 'node:test';

import { universityMedianTuitionZh, type ProgrammeTuition } from '../miniprogram/utils/university-tuition';

const tuition = (input: Partial<ProgrammeTuition>): ProgrammeTuition => ({
  tuitionMin: null,
  tuitionMax: null,
  tuitionCurrency: '',
  tuitionFeePeriod: '',
  tuitionTotalRmbMin: null,
  tuitionTotalRmbMax: null,
  ...input,
});

test('uses the median of each comparable programme fee midpoint', () => {
  const result = universityMedianTuitionZh([
    tuition({ tuitionMin: 80_000, tuitionMax: 100_000, tuitionCurrency: 'MYR', tuitionFeePeriod: 'TOTAL_PROGRAM' }),
    tuition({ tuitionMin: 50_000, tuitionMax: 70_000, tuitionCurrency: 'MYR', tuitionFeePeriod: 'TOTAL_PROGRAM' }),
    tuition({ tuitionMin: 120_000, tuitionMax: 120_000, tuitionCurrency: 'MYR', tuitionFeePeriod: 'TOTAL_PROGRAM' }),
  ]);
  assert.equal(result, '专业总学费中位数：RM 90,000（基于 3 个有有效学费数据的专业，实际费用以学校最新公布为准）');
});

test('does not mix currencies or fee periods and selects the largest comparable group', () => {
  const result = universityMedianTuitionZh([
    tuition({ tuitionMin: 20_000, tuitionCurrency: 'MYR', tuitionFeePeriod: 'PER_YEAR' }),
    tuition({ tuitionMin: 30_000, tuitionCurrency: 'MYR', tuitionFeePeriod: 'PER_YEAR' }),
    tuition({ tuitionMin: 8_000, tuitionCurrency: 'MYR', tuitionFeePeriod: 'PER_SEMESTER' }),
    tuition({ tuitionMin: 100_000, tuitionCurrency: 'CNY', tuitionFeePeriod: 'PER_YEAR' }),
  ]);
  assert.equal(result, '专业年学费中位数：RM 25,000（基于 2 个有有效学费数据的专业，实际费用以学校最新公布为准）');
});

test('uses normalized total RMB tuition when source fee fields are unavailable', () => {
  const result = universityMedianTuitionZh([
    tuition({ tuitionTotalRmbMin: 100_000, tuitionTotalRmbMax: 120_000 }),
    tuition({ tuitionTotalRmbMin: 140_000, tuitionTotalRmbMax: 160_000 }),
  ]);
  assert.equal(result, '专业总学费中位数：人民币 ¥130,000（基于 2 个有有效学费数据的专业，实际费用以学校最新公布为准）');
});

test('explains when a university has no comparable published tuition', () => {
  assert.equal(universityMedianTuitionZh([tuition({})]), '暂无可计算的专业学费数据，请咨询最新费用');
});
