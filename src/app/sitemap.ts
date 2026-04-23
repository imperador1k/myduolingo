import type { MetadataRoute } from "next";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://myduolingo.vercel.app";

/**
 * Generates a dynamic sitemap for public-facing routes only.
 * Private, auth-protected routes are intentionally excluded to preserve crawl budget.
 */
export default function sitemap(): MetadataRoute.Sitemap {
    return [
        {
            url: APP_URL,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 1.0,
        },
        {
            url: `${APP_URL}/support`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.5,
        },
        {
            url: `${APP_URL}/privacy`,
            lastModified: new Date(),
            changeFrequency: "yearly",
            priority: 0.3,
        },
        {
            url: `${APP_URL}/terms`,
            lastModified: new Date(),
            changeFrequency: "yearly",
            priority: 0.3,
        },
        {
            url: `${APP_URL}/licenses`,
            lastModified: new Date(),
            changeFrequency: "yearly",
            priority: 0.2,
        },
    ];
}
