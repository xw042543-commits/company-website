interface CacheEntry<T> { readonly value: T; readonly expiresAt: number }

export interface ExpiringCache<T> {
  get(key: string): T | null;
  set(key: string, value: T): void;
  clear(): void;
}

export function createExpiringCache<T>(ttlMs: number, now: () => number = Date.now, maxEntries = 30): ExpiringCache<T> {
  if (!Number.isFinite(ttlMs) || ttlMs <= 0 || !Number.isSafeInteger(maxEntries) || maxEntries < 1) {
    throw new Error('Invalid cache configuration');
  }
  const entries = new Map<string, CacheEntry<T>>();
  return {
    get(key) {
      const entry = entries.get(key);
      if (!entry) return null;
      if (entry.expiresAt <= now()) { entries.delete(key); return null; }
      return entry.value;
    },
    set(key, value) {
      entries.delete(key);
      entries.set(key, { value, expiresAt: now() + ttlMs });
      while (entries.size > maxEntries) {
        const oldest = entries.keys().next().value as string | undefined;
        if (oldest === undefined) break;
        entries.delete(oldest);
      }
    },
    clear() { entries.clear(); },
  };
}
