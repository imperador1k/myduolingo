import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Build-Safe Redis Initialization
 * 
 * WHY: During 'next build', environment variables might be missing.
 * If we try to instantiate Redis without them, the build fails.
 */
const redis = (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
    : null;

/**
 * Fallback implementation for environments without Redis (e.g., CI/Build)
 */
const mockLimit = {
    limit: async () => ({ success: true, remaining: 999, reset: 0 }),
};

/**
 * Strict Rate Limiter for AI Generation Endpoint (CMS)
 * Protects the Gemini API Key from quota exhaustion.
 */
export const aiRateLimit = redis 
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, "1 m"), 
        analytics: true,
        prefix: "@upstash/ratelimit/ai",
    }) 
    : mockLimit;

/**
 * Generous Rate Limiter for Gameplay Actions (XP, Hearts)
 * Prevents rapid-fire bot scripting and XP farming.
 */
export const gameplayRateLimit = redis 
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(30, "10 s"),
        analytics: true,
        prefix: "@upstash/ratelimit/gameplay",
    }) 
    : mockLimit;

/**
 * Rate Limiter for AI Tutors (Marco Chat, Practice Generation)
 */
export const aiTutorRateLimit = redis 
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(20, "10 m"),
        analytics: true,
        prefix: "@upstash/ratelimit/ai-tutor",
    }) 
    : mockLimit;

