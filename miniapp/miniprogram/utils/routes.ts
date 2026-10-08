import type { Result } from './result.ts';

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const POSITIVE_INTEGER = /^[1-9]\d*$/;

function invalidRoute(): Result<never> {
  return {
    ok: false,
    error: { kind: 'validation', code: 'INVALID_DETAIL_ROUTE' },
  };
}

export function universityDetailRoute(slug: string): Result<string> {
  const normalized = slug.trim();
  if (!SLUG.test(normalized)) return invalidRoute();

  return {
    ok: true,
    value: `/pages/university-detail/index?slug=${encodeURIComponent(normalized)}`,
  };
}

export function programmeDetailRoute(
  universitySlug: string,
  programmeId: number | string,
): Result<string> {
  const slug = universitySlug.trim();
  const id = String(programmeId).trim();
  if (!SLUG.test(slug) || !POSITIVE_INTEGER.test(id)) return invalidRoute();

  return {
    ok: true,
    value: `/pages/programme-detail/index?universitySlug=${encodeURIComponent(slug)}&programmeId=${encodeURIComponent(id)}`,
  };
}
