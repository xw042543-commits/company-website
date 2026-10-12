import { request, type RequestOptions } from './http';
import { buildUniversitySearchPath, mapUniversityPage, mapUniversityProgrammePage, type UniversitySearchInput } from './universities';
import type { Result } from '../utils/result';

export function createPlanningDiscoveryService(
  requester: (options: RequestOptions) => Promise<Result<unknown>> = options => request<unknown>(options),
) {
  return {
    async search(input: UniversitySearchInput) {
      const result = await requester({ method: 'GET', path: buildUniversitySearchPath(input) });
      return result.ok ? mapUniversityPage(result.value) : result;
    },
    async programmes(slug: string, input: UniversitySearchInput, page: number) {
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
        return { ok: false as const, error: { kind: 'validation' as const, code: 'INVALID_UNIVERSITY_SLUG' } };
      }
      const query = buildUniversitySearchPath({ ...input, page, size: 12 }).split('?')[1];
      const result = await requester({ method: 'GET', path: `/api/v1/universities/${slug}/programmes?${query}` });
      return result.ok ? mapUniversityProgrammePage(result.value) : result;
    },
  };
}
