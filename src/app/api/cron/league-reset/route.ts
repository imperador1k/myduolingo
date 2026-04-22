import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { userProgress } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { getWeeklyLeaderboardByLeague } from "@/db/queries/users";

export const dynamic = "force-dynamic";

// Ordered progression path. BRONZE is lowest, DIAMOND is highest.
const LEAGUE_ORDER = ["BRONZE", "SILVER", "GOLD", "PLATINUM", "DIAMOND"] as const;
type League = (typeof LEAGUE_ORDER)[number];

// How many users get promoted/demoted per cycle.
const PROMOTION_SPOTS = 5;
const DEMOTION_SPOTS = 5;
// Minimum league size before demotion kicks in (avoids punishing tiny groups).
const MIN_SIZE_FOR_DEMOTION = 10;

interface ResetSummary {
    league: League;
    totalUsers: number;
    promoted: string[];
    demoted: string[];
}

/**
 * Bulk-updates the `league` column and sets the `lastWeekResult` for a list of user IDs.
 * Because each user has a different rank, we update them individually using Promise.all 
 * for simplicity since user base is currently small. If large, we'd use a single transaction.
 */
async function processUserReset(userId: string, newLeague: League, oldLeague: League, rank: number, status: 'PROMOTED' | 'STAYED' | 'DEMOTED'): Promise<void> {
    await db
        .update(userProgress)
        .set({ 
            league: newLeague,
            lastWeekResult: {
                league: newLeague, // We show them their NEW league in the modal
                oldLeague: oldLeague, // Keep track of where they came from
                rank: rank,
                status: status
            }
        })
        .where(eq(userProgress.userId, userId));
}

export async function GET(req: Request) {
    // ── Security Guard ────────────────────────────────────────────────────────
    // Vercel Cron Jobs inject: `Authorization: Bearer <CRON_SECRET>` automatically.
    // For manual testing, we also accept: `?secret=<CRON_SECRET>` as a query param.
    const { searchParams } = new URL(req.url);
    const querySecret = searchParams.get("secret");
    const authHeader = req.headers.get("authorization");
    const bearerSecret = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

    const isAuthorized =
        process.env.CRON_SECRET &&
        (querySecret === process.env.CRON_SECRET || bearerSecret === process.env.CRON_SECRET);

    if (!isAuthorized) {
        console.warn("[CRON] league-reset: Unauthorized attempt.");
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ── Reset Logic ──────────────────────────────────────────────────────────
    console.log("[CRON] league-reset: Starting weekly reset...");
    const startTime = Date.now();

    const summaries: ResetSummary[] = [];
    let totalPromoted = 0;
    let totalDemoted = 0;

    try {
        // IMPORTANT: Reverse the order (Diamond -> Bronze) to prevent cascading updates.
        const reversedLeagues = [...LEAGUE_ORDER].reverse();

        for (const league of reversedLeagues) {
            const leagueIndex = LEAGUE_ORDER.indexOf(league);
            const nextLeague = LEAGUE_ORDER[leagueIndex + 1] as League | undefined;
            const prevLeague = LEAGUE_ORDER[leagueIndex - 1] as League | undefined;

            // Fetch the sorted weekly ranking for this specific league tier
            const rankedUsers = await getWeeklyLeaderboardByLeague(league);
            const totalUsers = rankedUsers.length;

            console.log(`[CRON] Processing ${league}: ${totalUsers} users`);

            const promotedIds: string[] = [];
            const demotedIds: string[] = [];

            // Process each user based on their rank
            const resetPromises = rankedUsers.map((user, index) => {
                const rank = index + 1;
                let status: 'PROMOTED' | 'STAYED' | 'DEMOTED' = 'STAYED';
                let newLeague: League = league;

                // Promotion: Top N users move up (except DIAMOND — already max)
                if (nextLeague && totalUsers > 0 && rank <= PROMOTION_SPOTS) {
                    status = 'PROMOTED';
                    newLeague = nextLeague;
                    promotedIds.push(user.userId);
                } 
                // Demotion: Bottom N users move down (except BRONZE — already min)
                else if (prevLeague && totalUsers >= MIN_SIZE_FOR_DEMOTION && rank > totalUsers - DEMOTION_SPOTS) {
                    status = 'DEMOTED';
                    newLeague = prevLeague;
                    demotedIds.push(user.userId);
                }

                // Update the user with their result
                return processUserReset(user.userId, newLeague, league, rank, status);
            });

            await Promise.all(resetPromises);

            console.log(`[CRON] ${league}: ${promotedIds.length} promoted, ${demotedIds.length} demoted`);

            summaries.push({ league, totalUsers, promoted: promotedIds, demoted: demotedIds });
            totalPromoted += promotedIds.length;
            totalDemoted += demotedIds.length;
        }

        const elapsed = Date.now() - startTime;
        console.log(`[CRON] league-reset: Completed in ${elapsed}ms. Promoted: ${totalPromoted}, Demoted: ${totalDemoted}`);

        return NextResponse.json({
            success: true,
            elapsedMs: elapsed,
            promoted: totalPromoted,
            demoted: totalDemoted,
            summaries,
        });
    } catch (error) {
        console.error("[CRON] league-reset: Fatal error during reset:", error);
        return NextResponse.json(
            { success: false, error: "Internal Server Error during league reset." },
            { status: 500 }
        );
    }
}
