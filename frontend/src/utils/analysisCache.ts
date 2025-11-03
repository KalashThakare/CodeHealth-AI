export interface CacheEnvelope<T> {
  v: number; // schema/version for invalidation
  ts: number; // saved timestamp (ms)
  ttl: number; // milliseconds
  data: T;
  label: string; // Human-readable label for UI
}

export interface CacheMetadata {
  repoId: string;
  timestamp: number;
  label: string;
  healthScore: number;
  totalFiles: number;
}

const CACHE_PREFIX = "ch:analysis:";
const CACHE_LIST_KEY = "ch:analysis:list";
const SCHEMA_VERSION = 1;
const DEFAULT_TTL = 1000 * 60 * 60 * 24; // 1 day (24 hours)
const MAX_CACHED_ANALYSES = 2; // Keep last 2 analyses per repo

function keyFor(repoId: string, timestamp: number) {
  return `${CACHE_PREFIX}${repoId}:${timestamp}`;
}

/**
 * Get list of cached analyses for a repository
 */
export function getCachedAnalysesList(repoId: string): CacheMetadata[] {
  try {
    const listKey = `${CACHE_LIST_KEY}:${repoId}`;
    const raw = localStorage.getItem(listKey);
    if (!raw) return [];

    const list: CacheMetadata[] = JSON.parse(raw);

    // Filter out expired entries
    const now = Date.now();
    const validList = list.filter((meta) => {
      const key = keyFor(repoId, meta.timestamp);
      const cached = localStorage.getItem(key);
      if (!cached) return false;

      try {
        const env: CacheEnvelope<any> = JSON.parse(cached);
        return now - env.ts <= env.ttl && env.v === SCHEMA_VERSION;
      } catch {
        return false;
      }
    });

    // Update list if any entries were filtered
    if (validList.length !== list.length) {
      localStorage.setItem(listKey, JSON.stringify(validList));
    }

    // Sort by timestamp descending (newest first)
    return validList.sort((a, b) => b.timestamp - a.timestamp);
  } catch {
    return [];
  }
}

/**
 * Load cached analysis by timestamp
 */
export function loadCachedAnalysis<T>(
  repoId: string,
  timestamp: number
): T | null {
  try {
    const raw = localStorage.getItem(keyFor(repoId, timestamp));
    if (!raw) return null;

    const env: CacheEnvelope<T> = JSON.parse(raw);
    if (env.v !== SCHEMA_VERSION) return null;
    if (Date.now() - env.ts > env.ttl) {
      localStorage.removeItem(keyFor(repoId, timestamp));
      return null;
    }

    return env.data;
  } catch {
    return null;
  }
}

/**
 * Load the most recent cached analysis
 */
export function loadMostRecentAnalysis<T>(repoId: string): {
  data: T;
  metadata: CacheMetadata;
} | null {
  const list = getCachedAnalysesList(repoId);
  if (list.length === 0) return null;

  const mostRecent = list[0];
  const data = loadCachedAnalysis<T>(repoId, mostRecent.timestamp);

  if (data) {
    return { data, metadata: mostRecent };
  }

  return null;
}

/**
 * Save analysis to cache
 */
export function saveCachedAnalysis<T>(
  repoId: string,
  data: T,
  metadata: {
    healthScore: number;
    totalFiles: number;
  },
  ttl = DEFAULT_TTL
): number {
  try {
    const timestamp = Date.now();
    const label = new Date(timestamp).toLocaleString();

    const env: CacheEnvelope<T> = {
      v: SCHEMA_VERSION,
      ts: timestamp,
      ttl,
      data,
      label,
    };

    // Save the analysis data
    localStorage.setItem(keyFor(repoId, timestamp), JSON.stringify(env));

    // Update the list
    const listKey = `${CACHE_LIST_KEY}:${repoId}`;
    let list = getCachedAnalysesList(repoId);

    const newMetadata: CacheMetadata = {
      repoId,
      timestamp,
      label,
      healthScore: metadata.healthScore,
      totalFiles: metadata.totalFiles,
    };

    list.unshift(newMetadata);

    // Keep only MAX_CACHED_ANALYSES
    if (list.length > MAX_CACHED_ANALYSES) {
      const removed = list.splice(MAX_CACHED_ANALYSES);
      // Remove old cached data
      removed.forEach((meta) => {
        localStorage.removeItem(keyFor(repoId, meta.timestamp));
      });
    }

    localStorage.setItem(listKey, JSON.stringify(list));

    console.log(`[Cache] Saved analysis for ${repoId} at ${timestamp}`);
    return timestamp;
  } catch (error) {
    console.error("[Cache] Failed to save analysis:", error);
    return Date.now();
  }
}

/**
 * Clear specific cached analysis
 */
export function clearCachedAnalysis(repoId: string, timestamp: number): void {
  try {
    localStorage.removeItem(keyFor(repoId, timestamp));

    // Update list
    const listKey = `${CACHE_LIST_KEY}:${repoId}`;
    const list = getCachedAnalysesList(repoId);
    const filtered = list.filter((meta) => meta.timestamp !== timestamp);
    localStorage.setItem(listKey, JSON.stringify(filtered));

    console.log(`[Cache] Cleared analysis for ${repoId} at ${timestamp}`);
  } catch (error) {
    console.error("[Cache] Failed to clear analysis:", error);
  }
}

/**
 * Clear all cached analyses for a repo
 */
export function clearAllCachedAnalyses(repoId: string): void {
  try {
    const list = getCachedAnalysesList(repoId);
    list.forEach((meta) => {
      localStorage.removeItem(keyFor(repoId, meta.timestamp));
    });

    const listKey = `${CACHE_LIST_KEY}:${repoId}`;
    localStorage.removeItem(listKey);

    console.log(`[Cache] Cleared all analyses for ${repoId}`);
  } catch (error) {
    console.error("[Cache] Failed to clear all analyses:", error);
  }
}

/**
 * Get cache statistics
 */
export function getCacheStats(repoId: string): {
  count: number;
  totalSize: number;
  oldestDate: Date | null;
  newestDate: Date | null;
} {
  const list = getCachedAnalysesList(repoId);
  let totalSize = 0;

  list.forEach((meta) => {
    const key = keyFor(repoId, meta.timestamp);
    const item = localStorage.getItem(key);
    if (item) {
      totalSize += item.length;
    }
  });

  return {
    count: list.length,
    totalSize,
    oldestDate:
      list.length > 0 ? new Date(list[list.length - 1].timestamp) : null,
    newestDate: list.length > 0 ? new Date(list[0].timestamp) : null,
  };
}
