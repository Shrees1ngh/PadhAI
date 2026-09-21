import { ENV } from "../../config/env.js";

/**
 * In-Memory Sliding-Window Rate Limiter
 * Zero external dependencies. Enforces IP/User-based rate limits.
 */
class MemoryRateLimiter {
  constructor(options = {}) {
    this.windowMs = options.windowMs || 15 * 60 * 1000; // 15 minutes default
    this.max = options.max || 100; // max requests per window
    this.message = options.message || "Too many requests. Please slow down and try again later.";
    this.code = options.code || "RATE_LIMIT_EXCEEDED";
    this.hits = new Map();

    // Auto-cleanup stale buckets every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000).unref();
  }

  cleanup() {
    const now = Date.now();
    for (const [key, record] of this.hits.entries()) {
      if (now - record.resetTime > this.windowMs) {
        this.hits.delete(key);
      }
    }
  }

  middleware() {
    return (req, res, next) => {
      // Derive key from authenticated userId or client IP
      const key =
        req.user && req.user.id
          ? `user_${req.user.id}`
          : `ip_${req.ip || req.connection?.remoteAddress || "unknown"}`;
      const now = Date.now();

      let record = this.hits.get(key);
      if (!record || now > record.resetTime) {
        record = {
          count: 1,
          resetTime: now + this.windowMs,
        };
        this.hits.set(key, record);
      } else {
        record.count++;
      }

      const remaining = Math.max(0, this.max - record.count);
      const retryAfterSeconds = Math.ceil((record.resetTime - now) / 1000);

      res.setHeader("X-RateLimit-Limit", this.max);
      res.setHeader("X-RateLimit-Remaining", remaining);
      res.setHeader("X-RateLimit-Reset", Math.ceil(record.resetTime / 1000));

      if (record.count > this.max) {
        res.setHeader("Retry-After", retryAfterSeconds);
        return res.status(429).json({
          success: false,
          code: this.code,
          message: this.message,
          retryAfter: `${retryAfterSeconds}s`,
        });
      }

      next();
    };
  }
}

/**
 * Per-User Daily AI Quota Limiter
 * Tracks daily generation count per user (or IP fallback).
 * Users providing their own x-gemini-key bypass server-side quota.
 */
class DailyQuotaLimiter {
  constructor(options = {}) {
    this.dailyLimit = options.dailyLimit || ENV.DAILY_USER_AI_QUOTA || 50;
    this.records = new Map();

    // Reset / cleanup stale entries every hour
    setInterval(() => this.cleanup(), 60 * 60 * 1000).unref();
  }

  getTodayKey() {
    return new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'
  }

  cleanup() {
    const today = this.getTodayKey();
    for (const [compositeKey] of this.records.entries()) {
      if (!compositeKey.endsWith(`_${today}`)) {
        this.records.delete(compositeKey);
      }
    }
  }

  middleware() {
    return (req, res, next) => {
      const customKey =
        req.headers["x-gemini-key"] ||
        req.headers["x-api-key"] ||
        req.body?.apiKey;

      // Requests using user's own custom key bypass server quota limit
      if (
        customKey &&
        typeof customKey === "string" &&
        customKey.trim().length > 0 &&
        customKey !== "DEMO_MODE"
      ) {
        return next();
      }

      const userId =
        req.user && req.user.id
          ? `user_${req.user.id}`
          : `ip_${req.ip || req.connection?.remoteAddress || "unknown"}`;
      const today = this.getTodayKey();
      const trackingKey = `${userId}_${today}`;

      const currentUsage = this.records.get(trackingKey) || 0;
      if (currentUsage >= this.dailyLimit) {
        return res.status(429).json({
          success: false,
          code: "DAILY_QUOTA_EXCEEDED",
          message: `Daily AI generation quota reached (${this.dailyLimit} requests/day). Add your personal Gemini API key in Settings for unlimited access.`,
          dailyLimit: this.dailyLimit,
          usageToday: currentUsage,
        });
      }

      this.records.set(trackingKey, currentUsage + 1);
      res.setHeader("X-Daily-Quota-Limit", this.dailyLimit);
      res.setHeader(
        "X-Daily-Quota-Remaining",
        Math.max(0, this.dailyLimit - (currentUsage + 1))
      );

      next();
    };
  }
}

export const dailyQuotaLimiter = new DailyQuotaLimiter().middleware();

const memoryAiRateLimiter = new MemoryRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 60,
  message: "AI Generation rate limit reached. Please wait a few moments before requesting more AI content.",
  code: "AI_RATE_LIMIT_EXCEEDED",
}).middleware();

/**
 * Composite AI Rate Limiter:
 * Enforces per-user daily quota and sliding-window rate limit.
 * Expects authentication middleware to run prior so req.user is populated.
 */
export const aiRateLimiter = (req, res, next) => {
  dailyQuotaLimiter(req, res, (err) => {
    if (err) return next(err);
    memoryAiRateLimiter(req, res, next);
  });
};

/**
 * Rate limiter for authentication endpoints (Login / Register)
 * 20 attempts per 15 minutes to mitigate brute-force
 */
export const authRateLimiter = new MemoryRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: "Too many login/registration attempts. Please try again later.",
  code: "AUTH_RATE_LIMIT_EXCEEDED",
}).middleware();
