interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export class SimpleCache<K extends string, V> {
  private store = new Map<K, CacheEntry<V>>();
  private ttlMs: number;
  private maxSize: number;

  constructor(ttlSeconds = 60, maxSize = 100) {
    this.ttlMs = ttlSeconds * 1000;
    this.maxSize = maxSize;
  }

  get(key: K): V | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value;
  }

  set(key: K, value: V): void {
    if (this.store.size >= this.maxSize) {
      const oldestKey = this.store.keys().next().value;
      if (oldestKey) this.store.delete(oldestKey);
    }
    this.store.set(key, {
      value,
      expiresAt: Date.now() + this.ttlMs,
    });
  }

  invalidate(key: K): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}

export const searchCache = new SimpleCache<string, unknown[]>(30, 500);
export const latestPostsCache = new SimpleCache<string, unknown[]>(30, 10);
export const categoriesCache = new SimpleCache<string, string[]>(60, 10);
export const tagsCache = new SimpleCache<string, string[]>(120, 10);

/** Reset all caches — primarily for testing. */
export function resetAllCaches() {
  searchCache.clear();
  latestPostsCache.clear();
  categoriesCache.clear();
  tagsCache.clear();
}
