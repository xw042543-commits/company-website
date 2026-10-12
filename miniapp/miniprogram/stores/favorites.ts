const STORAGE_KEY = 'udajo:favorite-universities:v1';

export interface FavoriteStorage {
  getStorageSync(key: string): unknown;
  setStorageSync(key: string, value: unknown): void;
}

export function parseFavoriteSlugs(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return [...new Set(raw.filter((value): value is string => (
    typeof value === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)
  )))];
}

export function createFavoriteStore(storage: FavoriteStorage) {
  const read = () => parseFavoriteSlugs(storage.getStorageSync(STORAGE_KEY));
  return {
    list: read,
    has(slug: string): boolean { return read().includes(slug); },
    toggle(slug: string): boolean {
      const favorites = read();
      const next = favorites.includes(slug)
        ? favorites.filter((value) => value !== slug)
        : [...favorites, slug];
      storage.setStorageSync(STORAGE_KEY, next);
      return next.includes(slug);
    },
  };
}

export const favoriteUniversities = createFavoriteStore({
  getStorageSync: (key) => typeof wx.getStorageSync === 'function' ? wx.getStorageSync(key) : [],
  setStorageSync: (key, value) => {
    if (typeof wx.setStorageSync === 'function') wx.setStorageSync(key, value);
  },
});
