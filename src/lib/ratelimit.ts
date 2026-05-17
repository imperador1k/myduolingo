import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
    : null;

const mockLimit = {
    limit: async () => ({ success: true, remaining: 999, reset: 0 }),
};

export const aiRateLimit = redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, "1 m"),
        analytics: true,
        prefix: "@upstash/ratelimit/ai",
    })
    : mockLimit;

export const gameplayRateLimit = redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(30, "10 s"),
        analytics: true,
        prefix: "@upstash/ratelimit/gameplay",
    })
    : mockLimit;

export const aiTutorRateLimit = redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(20, "10 m"),
        analytics: true,
        prefix: "@upstash/ratelimit/ai-tutor",
    })
    : mockLimit;

export const emailRateLimit = redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(10, "1 h"),
        analytics: true,
        prefix: "@upstash/ratelimit/email",
    })
    : mockLimit;
