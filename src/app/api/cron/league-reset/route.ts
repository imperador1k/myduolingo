import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { userProgress } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { getWeeklyLeaderboardByLeague } from "@/db/queries/users";

export const dynamic = "force-dynamic";

const LEAGUE_ORDER = ["BRONZE", "SILVER", "GOLD", "PLATINUM", "DIAMOND"] as const;
type League = (typeof LEAGUE_ORDER)[number];

const PROMOTION_SPOTS = 5;
const DEMOTION_SPOTS = 5;
const MIN_SIZE_FOR_DEMOTION = 10;

interface ResetSummary {
    league: League;
    totalUsers: number;
    promoted: string[];
    demoted: string[];
}

async function processUserReset(userId: string, newLeague: League, oldLeague: League, rank: number, status: 'PROMOTED' | 'STAYED' | 'DEMOTED'): Promise<void> {
    await db
        .update(userProgress)
        .set({
            league: newLeague,
            lastWeekResult: {
                league: newLeague,
                oldLeague: oldLeague,
                rank: rank,
                status: status
            }
        })
        .where(eq(userProgress.userId, userId));
}

export async function GET(req: Request) {
    const authHeader = req.headers.get("authorization");
    const bearerSecret = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

    const isAuthorized =
        process.env.CRON_SECRET &&
        bearerSecret === process.env.CRON_SECRET;

    if (!isAuthorized) {
        console.warn("[CRON] league-reset: Unauthorized attempt.");
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("[CRON] league-reset: Starting weekly reset...");
    const startTime = Date.now();

    const summaries: ResetSummary[] = [];
    let totalPromoted = 0;
    let totalDemoted = 0;

    try {
        const reversedLeagues = [...LEAGUE_ORDER].reverse();

        for (const league of reversedLeagues) {
            const leagueIndex = LEAGUE_ORDER.indexOf(league);
            const nextLeague = LEAGUE_ORDER[leagueIndex + 1] as League | undefined;
            const prevLeague = LEAGUE_ORDER[leagueIndex - 1] as League | undefined;

            const rankedUsers = await getWeeklyLeaderboardByLeague(league);
            const totalUsers = rankedUsers.length;

            console.log(`[CRON] Processing ${league}: ${totalUsers} users`);

            const promotedIds: string[] = [];
            const demotedIds: string[] = [];

            const resetPromises = rankedUsers.map((user, index) => {
                const rank = index + 1;
                let status: 'PROMOTED' | 'STAYED' | 'DEMOTED' = 'STAYED';
                let newLeague: League = league;

                if (nextLeague && totalUsers > 0 && rank <= PROMOTION_SPOTS) {
                    status = 'PROMOTED';
                    newLeague = nextLeague;
                    promotedIds.push(user.userId);
                }
                else if (prevLeague && totalUsers >= MIN_SIZE_FOR_DEMOTION && rank > totalUsers - DEMOTION_SPOTS) {
                    status = 'DEMOTED';
                    newLeague = prevLeague;
                    demotedIds.push(user.userId);
                }

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
        console.error("[CRON] league-reset: Fatal error during reset");
        return NextResponse.json(
            { success: false, error: "Internal Server Error during league reset." },
            { status: 500 }
        );
    }
}
