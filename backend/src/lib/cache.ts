// Simple in-memory TTL cache. Keyed by string. Concurrent calls for the same
// key share a single in-flight promise to avoid duplicate scrapes.
//
// Bounded: a hard cap on entries protects against unbounded growth (one entry
// per scraped URL, but a misbehaving caller could blow this up otherwise).
// Eviction is FIFO-by-insertion (Map iteration order) once the cap is hit;
// expired entries are also removed lazily on access.

type Entry<T> = { value: T; expiresAt: number };

const MAX_ENTRIES = 256;

const store = new Map<string, Entry<unknown>>();
const inflight = new Map<string, Promise<unknown>>();

function evictIfNeeded() {
  if (store.size <= MAX_ENTRIES) return;
  // Drop oldest insertion(s) until under the cap.
  const overflow = store.size - MAX_ENTRIES;
  let i = 0;
  for (const k of store.keys()) {
    if (i++ >= overflow) break;
    store.delete(k);
  }
}

export async function getCached<T>(
  key: string,
  ttlMs: number,
  loader: () => Promise<T>,
): Promise<T> {
  const now = Date.now();
  const hit = store.get(key);
  if (hit) {
    if (hit.expiresAt > now) return hit.value as T;
    // Expired — drop so cacheStats() reflects only live entries.
    store.delete(key);
  }

  const pending = inflight.get(key);
  if (pending) return pending as Promise<T>;

  const p = (async () => {
    try {
      const value = await loader();
      store.set(key, { value, expiresAt: Date.now() + ttlMs });
      evictIfNeeded();
      return value;
    } finally {
      inflight.delete(key);
    }
  })();
  inflight.set(key, p);
  return p as Promise<T>;
}

export function clearCache(): number {
  const n = store.size;
  store.clear();
  inflight.clear();
  return n;
}

export function cacheStats() {
  return { entries: store.size, inflight: inflight.size };
}
