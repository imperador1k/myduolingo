import { createHmac, timingSafeEqual } from "crypto";

const COOKIE_MAX_AGE = 3600; // 1 hour

/**
 * Creates a signed admin vault token.
 * Format: userId:expiry:signature
 * Signature = HMAC-SHA256(userId:expiry, ADMIN_SUDO_HASH)
 */
export function createVaultToken(userId: string): string {
    const expiry = Math.floor(Date.now() / 1000) + COOKIE_MAX_AGE;
    const payload = `${userId}:${expiry}`;
    const secret = process.env.ADMIN_SUDO_HASH || "fallback-secret-do-not-use-in-production";
    const signature = createHmac("sha256", secret).update(payload).digest("hex");
    return `${payload}:${signature}`;
}

/**
 * Validates a signed admin vault token.
 * Returns the userId if valid, null otherwise.
 * Uses timing-safe comparison to prevent timing attacks.
 */
export function validateVaultToken(token: string): string | null {
    try {
        const parts = token.split(":");
        if (parts.length !== 3) return null;

        const [userId, expiryStr, signature] = parts;
        const expiry = parseInt(expiryStr, 10);

        if (isNaN(expiry) || Date.now() / 1000 > expiry) {
            return null;
        }

        const secret = process.env.ADMIN_SUDO_HASH || "fallback-secret-do-not-use-in-production";
        const expectedPayload = `${userId}:${expiry}`;
        const expectedSignature = createHmac("sha256", secret).update(expectedPayload).digest("hex");

        const a = Buffer.from(signature);
        const b = Buffer.from(expectedSignature);

        if (a.length !== b.length || !timingSafeEqual(a, b)) {
            return null;
        }

        return userId;
    } catch {
        return null;
    }
}
