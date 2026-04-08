import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Initialize the Redis client using environment variables
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

/**
 * Strict Rate Limiter for AI Generation Endpoint (CMS)
 * Protects the Gemini API Key from quota exhaustion.
 * Allows 5 requests per minute per Admin.
 */
export const aiRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1 m"), 
  analytics: true,
  prefix: "@upstash/ratelimit/ai",
});

/**
 * Generous Rate Limiter for Gameplay Actions (XP, Hearts)
 * Prevents rapid-fire bot scripting and XP farming.
 * Allows 30 requests per 10 seconds per User.
 */
export const gameplayRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, "10 s"),
  analytics: true,
  prefix: "@upstash/ratelimit/gameplay",
});

/**
 * Rate Limiter for AI Tutors (Marco Chat, Practice Generation)
 * Prevents API bill exhaustion while allowing healthy usage.
 * Allows 20 messages per 10 minutes per User.
 */
export const aiTutorRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, "10 m"),
  analytics: true,
  prefix: "@upstash/ratelimit/ai-tutor",
});
