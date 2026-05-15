import { LRUCache } from "lru-cache";

const rateMap = new LRUCache<string, number[]>({ max: 500 });

export function checkRateLimit(userId: string, maxPerSecond = 10): boolean {
  const now = Date.now();
  const window = 1000;
  const hits = (rateMap.get(userId) ?? []).filter((t) => now - t < window);
  if (hits.length >= maxPerSecond) return false;
  rateMap.set(userId, [...hits, now]);
  return true;
}
