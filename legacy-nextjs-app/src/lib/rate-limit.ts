type Bucket = { count: number; resetAt: number };

// In-memory, per-instance only — fine for local dev / a single small deploy.
// A multi-instance production deployment needs a shared store (e.g. Upstash
// Redis) instead, since each instance would otherwise track its own counts.
// Stale buckets for keys that are never hit again just sit here until the
// process restarts; not worth a cleanup scheduler at this traffic volume.
const buckets = new Map<string, Bucket>();

export function rateLimit(key: string, limit: number, windowMs: number): { allowed: boolean } {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now >= bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }

  if (bucket.count >= limit) {
    return { allowed: false };
  }

  bucket.count += 1;
  return { allowed: true };
}
