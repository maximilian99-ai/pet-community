// Simple in-memory cache with TTL
interface CacheEntry {
  data: any;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();
const DEFAULT_TTL = 60000; // 1 minute in milliseconds

export const cacheGet = (key: string): any => {
  const entry = cache.get(key);
  if (!entry) return null;

  const now = Date.now();
  if (now - entry.timestamp > DEFAULT_TTL) {
    cache.delete(key);
    return null;
  }

  return entry.data;
};

export const cacheSet = (key: string, data: any, ttl: number = DEFAULT_TTL): void => {
  cache.set(key, {
    data,
    timestamp: Date.now(),
  });

  // Cleanup after TTL
  setTimeout(() => {
    cache.delete(key);
  }, ttl);
};

export const cacheClear = (pattern?: string): void => {
  if (!pattern) {
    cache.clear();
    return;
  }

  // Clear entries matching pattern
  const regex = new RegExp(pattern);
  Array.from(cache.keys())
    .filter(key => regex.test(key))
    .forEach(key => cache.delete(key));
};

export const cacheDelete = (key: string): void => {
  cache.delete(key);
};
