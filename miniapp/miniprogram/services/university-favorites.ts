import { getUniversityDetail, type UniversityDetail } from './universities';
import type { Result } from '../utils/result';

type DetailFetcher = (slug: string) => Promise<Result<UniversityDetail>>;
export interface FavoriteUniversityLoadResult {
  readonly items: UniversityDetail[];
  readonly unavailableCount: number;
}

export async function loadFavoriteUniversityDetails(
  slugs: readonly string[],
  fetchDetail: DetailFetcher = getUniversityDetail,
): Promise<FavoriteUniversityLoadResult> {
  const valid = [...new Set(slugs.filter((slug) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)))];
  const settled = await Promise.all(valid.map((slug) => fetchDetail(slug)));
  const items: UniversityDetail[] = [];
  let unavailableCount = 0;
  for (const result of settled) {
    if (result.ok) items.push(result.value);
    else unavailableCount++;
  }
  return { items, unavailableCount };
}