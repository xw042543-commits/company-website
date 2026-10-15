export interface ProgrammeTuition {
  readonly tuitionMin: number | null;
  readonly tuitionMax: number | null;
  readonly tuitionCurrency: string;
  readonly tuitionFeePeriod: string;
  readonly tuitionTotalRmbMin: number | null;
  readonly tuitionTotalRmbMax: number | null;
}

type TuitionGroup = {
  readonly currency: string;
  readonly period: string;
  readonly values: number[];
};

const periodPriority: Readonly<Record<string, number>> = {
  TOTAL_PROGRAM: 0,
  PER_YEAR: 1,
  PER_SEMESTER: 2,
  UNKNOWN: 3,
};

export function universityMedianTuitionZh(programmes: readonly ProgrammeTuition[]): string {
  const groups = new Map<string, TuitionGroup>();
  for (const programme of programmes) {
    const currency = programme.tuitionCurrency.trim().toUpperCase();
    const period = programme.tuitionFeePeriod.trim().toUpperCase() || 'UNKNOWN';
    const value = midpoint(programme.tuitionMin, programme.tuitionMax);
    if (!currency || value === null) continue;
    const key = `${currency}:${period}`;
    const group = groups.get(key) ?? { currency, period, values: [] };
    group.values.push(value);
    groups.set(key, group);
  }

  const comparable = [...groups.values()].sort((left, right) =>
    right.values.length - left.values.length
    || (periodPriority[left.period] ?? 9) - (periodPriority[right.period] ?? 9)
    || left.currency.localeCompare(right.currency),
  )[0];
  if (comparable) {
    const amount = median(comparable.values);
    return `${periodLabel(comparable.period)}中位数：${currencyLabel(comparable.currency)} ${formatAmount(amount)}`
      + `（基于 ${comparable.values.length} 个有有效学费数据的专业，实际费用以学校最新公布为准）`;
  }

  const rmbValues = programmes
    .map(programme => midpoint(programme.tuitionTotalRmbMin, programme.tuitionTotalRmbMax))
    .filter((value): value is number => value !== null);
  if (rmbValues.length > 0) {
    return `专业总学费中位数：人民币 ¥${formatAmount(median(rmbValues))}`
      + `（基于 ${rmbValues.length} 个有有效学费数据的专业，实际费用以学校最新公布为准）`;
  }

  return '暂无可计算的专业学费数据，请咨询最新费用';
}

function midpoint(minimum: number | null, maximum: number | null): number | null {
  const min = validAmount(minimum) ? minimum : null;
  const max = validAmount(maximum) ? maximum : null;
  if (min !== null && max !== null) return (min + max) / 2;
  return min ?? max;
}

function validAmount(value: number | null): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

function median(values: readonly number[]): number {
  const ordered = [...values].sort((left, right) => left - right);
  const middle = Math.floor(ordered.length / 2);
  return ordered.length % 2 === 1
    ? ordered[middle]!
    : (ordered[middle - 1]! + ordered[middle]!) / 2;
}

function periodLabel(period: string): string {
  if (period === 'TOTAL_PROGRAM') return '专业总学费';
  if (period === 'PER_YEAR') return '专业年学费';
  if (period === 'PER_SEMESTER') return '专业每学期学费';
  return '专业学费';
}

function currencyLabel(currency: string): string {
  if (currency === 'MYR') return 'RM';
  if (currency === 'CNY' || currency === 'RMB') return '¥';
  return currency;
}

function formatAmount(value: number): string {
  const rounded = Math.round(value);
  return String(rounded).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
