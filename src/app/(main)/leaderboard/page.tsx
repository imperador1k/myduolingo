import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { getTopUsers, getUserProgress } from "@/db/queries";
import { Crown, Medal, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export default async function LeaderboardPage() {
    const user = await currentUser();
    const userProgress = await getUserProgress();
    const topUsers = await getTopUsers(10);

    if (!user || !userProgress) {
        redirect("/courses");
    }

    // Find current user's rank
    const currentUserRank = topUsers.findIndex(u => u.userId === user.id) + 1;

    const getRankIcon = (rank: number) => {
        if (rank === 1) return <Crown className="h-6 w-6 fill-amber-400 text-amber-400" />;
        if (rank === 2) return <Medal className="h-6 w-6 fill-slate-400 text-slate-400" />;
        if (rank === 3) return <Medal className="h-6 w-6 fill-amber-600 text-amber-600" />;
        return <span className="text-lg font-bold text-slate-400">{rank}</span>;
    };

    // Determine league based on points
    const getLeague = (points: number) => {
        if (points >= 1000) return { name: "Diamante", icon: "💎", color: "from-purple-500 to-purple-600" };
        if (points >= 500) return { name: "Ouro", icon: "🥇", color: "from-amber-400 to-amber-500" };
        if (points >= 100) return { name: "Prata", icon: "🥈", color: "from-slate-400 to-slate-500" };
        return { name: "Bronze", icon: "🥉", color: "from-orange-400 to-orange-500" };
    };

    const league = getLeague(userProgress.points);

    return (
        <div className="pb-12">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-700">Classificação</h1>
                    <p className="text-slate-500">Liga {league.name} • Esta Semana</p>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-purple-100 px-4 py-2">
                    <TrendingUp className="h-5 w-5 text-purple-500" />
                    <span className="font-bold text-purple-600">Top 10</span>
                </div>
            </div>

            {/* League Badge */}
            <div className="mb-8 flex items-center justify-center">
                <div className={cn(
                    "flex flex-col items-center gap-2 rounded-2xl p-6 text-white shadow-lg bg-gradient-to-b",
                    league.color
                )}>
                    <span className="text-6xl">{league.icon}</span>
                    <h2 className="text-xl font-bold">Liga {league.name}</h2>
                    <p className="text-sm opacity-80">
                        {topUsers.length > 0 ? `${topUsers.length} participantes` : "Sê o primeiro!"}
                    </p>
                </div>
            </div>

            {/* Your Position */}
            {currentUserRank > 0 && (
                <div className="mb-4 flex items-center gap-2 rounded-lg bg-sky-100 px-4 py-2">
                    <span className="text-sky-600">📍</span>
                    <p className="text-sm font-bold text-sky-600">
                        Estás em {currentUserRank}º lugar com {userProgress.points} XP
                    </p>
                </div>
            )}

            {/* Leaderboard */}
            <div className="space-y-2">
                {topUsers.length === 0 ? (
                    <div className="rounded-xl border-2 border-dashed border-slate-200 p-8 text-center">
                        <span className="text-4xl">🏆</span>
                        <p className="mt-2 font-bold text-slate-600">Ainda não há classificação</p>
                        <p className="text-sm text-slate-400">Completa lições para aparecer aqui!</p>
                    </div>
                ) : (
                    topUsers.map((rankedUser, index) => {
                        const isCurrentUser = rankedUser.userId === user.id;
                        const rank = index + 1;

                        return (
                            <div
                                key={rankedUser.id}
                                className={cn(
                                    "flex items-center gap-4 rounded-xl border-2 p-4 transition-all",
                                    isCurrentUser
                                        ? "border-sky-300 bg-sky-50"
                                        : "border-slate-100 hover:border-slate-200"
                                )}
                            >
                                {/* Rank */}
                                <div className="flex h-10 w-10 items-center justify-center">
                                    {getRankIcon(rank)}
                                </div>

                                {/* Avatar */}
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-2xl">
                                    {rankedUser.userImageSrc ? (
                                        <img
                                            src={rankedUser.userImageSrc}
                                            alt=""
                                            className="h-full w-full rounded-full object-cover"
                                        />
                                    ) : (
                                        "👤"
                                    )}
                                </div>

                                {/* Name */}
                                <div className="flex-1">
                                    <p className={cn(
                                        "font-bold",
                                        isCurrentUser ? "text-sky-600" : "text-slate-700"
                                    )}>
                                        {rankedUser.userName || "Estudante"}
                                        {isCurrentUser && <span className="ml-2 text-xs">(Tu)</span>}
                                    </p>
                                </div>

                                {/* XP */}
                                <div className="text-right">
                                    <p className="font-bold text-amber-500">{rankedUser.points.toLocaleString()} XP</p>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
