import type { MetadataRoute } from "next";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://myduolingo.vercel.app";

/**
 * Generates the robots.txt configuration.
 * Explicitly disallows all private/auth-protected routes to prevent them
 * from consuming Google's crawl budget.
 */
export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: "*",
                allow: ["/", "/support", "/privacy", "/terms", "/licenses"],
                disallow: [
                    "/admin",
                    "/admin-login",
                    "/api/",
                    "/learn",
                    "/shop",
                    "/leaderboard",
                    "/friends",
                    "/profile",
                    "/messages",
                    "/quests",
                    "/settings",
                    "/vocabulary",
                    "/practice",
                    "/arcade",
                    "/courses",
                    "/notifications",
                    "/lesson",
                    "/evaluation",
                    "/analytics",
                    "/auth-success",
                    "/sentry-example-page",
                ],
            },
        ],
        sitemap: `${APP_URL}/sitemap.xml`,
    };
}
