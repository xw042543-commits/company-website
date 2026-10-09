/** Canonical PostgreSQL BIGINT identifiers, never coerced through a JS number. */
export function isCommunityId(value: unknown): value is string {
  return typeof value === 'string' && /^[1-9][0-9]{0,18}$/.test(value)
    && (value.length < 19 || value <= '9223372036854775807');
}

/** Validate the calendar as well as syntax; Date.parse alone normalizes impossible dates. */
export function isCommunityTimestamp(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const parts = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d{1,9})?(?:Z|([+-])(\d{2}):(\d{2}))$/.exec(value);
  if (!parts) return false;
  const [year, month, day, hour, minute, second] = parts.slice(1, 7).map(Number);
  if (year === undefined || month === undefined || day === undefined || hour === undefined || minute === undefined || second === undefined) return false;
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1];
  const offsetHour = Number(parts[8] ?? 0), offsetMinute = Number(parts[9] ?? 0);
  return year >= 1 && days !== undefined && day >= 1 && day <= days && hour <= 23 && minute <= 59 && second <= 59
    && offsetHour <= 18 && offsetMinute <= 59 && (offsetHour !== 18 || offsetMinute === 0) && Number.isFinite(Date.parse(value));
}
