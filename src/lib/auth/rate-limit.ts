/**
 * In-memory fixed-window rate limiter.
 *
 * Suitable for protecting the login endpoint against brute force on a single
 * server instance. For multi-instance/serverless deployments, swap the store
 * for a shared backend (e.g. Upstash Redis) behind the same interface.
 */

interface Window {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Window>();

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export function rateLimit(
  key: string,
  limit = 5,
  windowMs = 60_000
): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1, retryAfterSeconds: 0 };
  }

  if (existing.count >= limit) {
    return {
      success: false,
      remaining: 0,
      retryAfterSeconds: Math.ceil((existing.resetAt - now) / 1000),
    };
  }

  existing.count += 1;
  return {
    success: true,
    remaining: limit - existing.count,
    retryAfterSeconds: 0,
  };
}

// Opportunistically evict expired buckets to bound memory.
function sweep() {
  const now = Date.now();
  for (const [key, win] of buckets) {
    if (win.resetAt <= now) buckets.delete(key);
  }
}

if (typeof setInterval !== "undefined") {
  const timer = setInterval(sweep, 5 * 60_000);
  // Do not keep the event loop alive solely for the sweeper.
  if (typeof timer === "object" && "unref" in timer) {
    (timer as { unref: () => void }).unref();
  }
}
