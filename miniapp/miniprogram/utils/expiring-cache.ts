interface CacheEntry<T> { readonly value: T; readonly expiresAt: number }

export interface ExpiringCache<T> {
  get(key: string): T | null;
  set(key: string, value: T): void;
  clear(): void;
}

export function createExpiringCache<T>(ttlMs: number, now: () => number = Date.now): ExpiringCache<T> {
  if (!Number.isFinite(ttlMs) || ttlMs <= 0) throw new Error('Invalid cache TTL');
  const entries = new Map<string, CacheEntry<T>>();
  return {
    get(key) {
      const entry = entries.get(key);
      if (!entry) return null;
      if (entry.expiresAt <= now()) { entries.delete(key); return null; }
      return entry.value;
    },
    set(key, value) { entries.set(key, { value, expiresAt: now() + ttlMs }); },
    clear() { entries.clear(); },
  };
}
