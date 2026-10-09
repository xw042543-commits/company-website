import type { Result } from './result.ts';
import { isCommunityId } from './community-validation';

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const POSITIVE_INTEGER = /^[1-9]\d*$/;

export function communityPostRoute(id: string): Result<string> {
  if (!isCommunityId(id)) return invalidRoute();
  return { ok: true, value: `/pages/circle-detail/index?id=${encodeURIComponent(id)}` };
}
export function communityComposeRoute(): Result<string> { return { ok: true, value: '/pages/circle-compose/index' }; }
export function communityMeRoute(): Result<string> { return { ok: true, value: '/pages/circle-me/index' }; }
export function communityFeedRoute(): Result<string> { return { ok: true, value: '/pages/circle/index' }; }

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
  if (!SLUG.test(slug)) return invalidRoute();

  let id: string;
  if (typeof programmeId === 'number') {
    if (!Number.isSafeInteger(programmeId) || programmeId <= 0) return invalidRoute();
    id = String(programmeId);
  } else {
    id = programmeId.trim();
    if (!POSITIVE_INTEGER.test(id)) return invalidRoute();
  }

  return {
    ok: true,
    value: `/pages/programme-detail/index?universitySlug=${encodeURIComponent(slug)}&programmeId=${encodeURIComponent(id)}`,
  };
}
