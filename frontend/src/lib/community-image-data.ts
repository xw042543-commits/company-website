export interface CommunityImage { id: string; width: number; height: number; url: string; thumbnailUrl: string }
export function readCommunityImages(value: unknown, postId: string): CommunityImage[] {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid images');
  const images = (value as Record<string, unknown>)[postId] ?? [];
  if (!Array.isArray(images) || images.length > 9) throw new Error('Invalid images');
  for (const item of images) {
    if (!item || typeof item !== 'object' || typeof item.id !== 'string' || !/^[0-9a-f]{32}$/.test(item.id)
      || !Number.isInteger(item.width) || item.width < 1 || item.width > 1600 || !Number.isInteger(item.height) || item.height < 1 || item.height > 1600
      || item.url !== `/api/v1/community/images/${item.id}` || item.thumbnailUrl !== `${item.url}?thumbnail=true`) throw new Error('Invalid images');
  }
  return images;
}
