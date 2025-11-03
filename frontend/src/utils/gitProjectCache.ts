export interface GitProjectCacheEnvelope<T> {
  v: number; // schema/version for invalidation
  ts: number; // saved timestamp (ms)
  ttl: number; // milliseconds
  data: T;
  label: string; // Human-readable label for UI
  repoId: string;
}

const CACHE_PREFIX = "ch:gitproject:";
const SCHEMA_VERSION = 1;
const DEFAULT_TTL = 1000 * 60 * 60 * 24; // 1 day (24 hours)

function keyFor(repoId: string) {
  return `${CACHE_PREFIX}${repoId}`;
}

/**
 * Load cached analysis for a specific repository
 */
export function loadGitProjectCache<T>(repoId: string): {
  data: T;
  label: string;
  timestamp: number;
} | null {
  try {
    const raw = localStorage.getItem(keyFor(repoId));
    if (!raw) return null;

    const env: GitProjectCacheEnvelope<T> = JSON.parse(raw);

    // Check version and TTL
    if (env.v !== SCHEMA_VERSION) {
      localStorage.removeItem(keyFor(repoId));
      return null;
    }

    if (Date.now() - env.ts > env.ttl) {
      localStorage.removeItem(keyFor(repoId));
      return null;
    }

    return {
      data: env.data,
      label: env.label,
      timestamp: env.ts,
    };
  } catch {
    return null;
  }
}

/**
 * Save analysis to cache for a specific repository
 * This will overwrite any existing cache for this repo
 */
export function saveGitProjectCache<T>(
  repoId: string,
  data: T,
  ttl = DEFAULT_TTL
): number {
  try {
    const timestamp = Date.now();
    const label = new Date(timestamp).toLocaleString();

    const env: GitProjectCacheEnvelope<T> = {
      v: SCHEMA_VERSION,
      ts: timestamp,
      ttl,
      data,
      label,
      repoId,
    };

    // Save the analysis data (overwrites existing)
    localStorage.setItem(keyFor(repoId), JSON.stringify(env));

    console.log(
      `[GitProjectCache] Saved analysis for ${repoId} at ${timestamp}`
    );
    return timestamp;
  } catch (error) {
    console.error("[GitProjectCache] Failed to save analysis:", error);
    return Date.now();
  }
}

/**
 * Clear cached analysis for a specific repository
 */
export function clearGitProjectCache(repoId: string): void {
  try {
    localStorage.removeItem(keyFor(repoId));
    console.log(`[GitProjectCache] Cleared cache for ${repoId}`);
  } catch (error) {
    console.error("[GitProjectCache] Failed to clear cache:", error);
  }
}

/**
 * Check if cache exists for a repository
 */
export function hasGitProjectCache(repoId: string): boolean {
  const cache = loadGitProjectCache(repoId);
  return cache !== null;
}

/**
 * Get cache timestamp for a repository
 */
export function getGitProjectCacheTimestamp(repoId: string): number | null {
  const cache = loadGitProjectCache(repoId);
  return cache ? cache.timestamp : null;
}
