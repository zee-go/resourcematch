import type { NextApiRequest, NextApiResponse } from "next";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now > entry.resetAt) {
      store.delete(key);
    }
  }
}, 5 * 60 * 1000);

interface RateLimitOptions {
  /** Max requests per window */
  limit: number;
  /** Window duration in seconds */
  windowSeconds: number;
}

/**
 * Extract the client IP from the request.
 * Behind Cloud Run's load balancer, the LB appends the real client IP
 * to X-Forwarded-For — so the rightmost entry is the most trustworthy
 * (cannot be spoofed by the client).
 */
function getClientIp(req: NextApiRequest): string {
  const forwardedFor = req.headers["x-forwarded-for"] as string | undefined;
  if (forwardedFor) {
    const ips = forwardedFor.split(",").map((ip) => ip.trim());
    return ips[ips.length - 1] || "unknown";
  }
  return req.socket.remoteAddress || "unknown";
}

/**
 * In-memory rate limiter. Uses IP + route as the key.
 *
 * NOTE: This in-memory store is per-instance only. For multi-instance
 * Cloud Run deployments, migrate to Redis (e.g. Cloud Memorystore) or
 * a database-backed store for accurate cross-instance rate limiting.
 */
export function withRateLimit(
  options: RateLimitOptions,
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const ip = getClientIp(req);

    const key = `${ip}:${req.url}`;
    const now = Date.now();
    const entry = store.get(key);

    if (entry && now < entry.resetAt) {
      if (entry.count >= options.limit) {
        const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
        res.setHeader("Retry-After", retryAfter.toString());
        res.setHeader("X-RateLimit-Limit", options.limit.toString());
        res.setHeader("X-RateLimit-Remaining", "0");
        return res.status(429).json({
          error: "Too many requests",
          retryAfter,
        });
      }
      entry.count++;
    } else {
      store.set(key, {
        count: 1,
        resetAt: now + options.windowSeconds * 1000,
      });
    }

    const current = store.get(key)!;
    res.setHeader("X-RateLimit-Limit", options.limit.toString());
    res.setHeader(
      "X-RateLimit-Remaining",
      Math.max(0, options.limit - current.count).toString()
    );

    return handler(req, res);
  };
}
