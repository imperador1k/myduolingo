import { redirect } from "next/navigation";
import Link from "next/link";
import { getTopUsers, getUserProgress } from "@/db/queries";
import { cn } from "@/lib/utils";

export default async function LeaderboardPage() {
    const userProgress = await getUserProgress();
    const topUsers = await getTopUsers(20);

    if (!userProgress) {
        redirect("/courses");
    }

    // Find current user rank
    const currentUserRank = topUsers.findIndex(u => u.userId === userProgress.userId) + 1;

    // Top 3 for podium
    const podium = topUsers.slice(0, 3);
    const rest = topUsers.slice(3);

    return (
        <div className="pb-12">
            {/* Header */}
            <div className="mb-6 text-center">
                <h1 className="text-2xl font-bold text-slate-700">🏆 Classificação</h1>
                <p className="text-slate-500">Os melhores estudantes</p>
            </div>

            {/* Podium */}
            <div className="mb-8 flex items-end justify-center gap-2">
                {/* 2nd Place */}
                {podium[1] && (
                    <Link
                        href={`/profile/${podium[1].userId}`}
                        className="flex flex-col items-center hover:scale-105 transition-transform"
                    >
                        <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-full border-4 border-slate-300 bg-slate-100 shadow-lg">
                            {podium[1].userImageSrc ? (
                                <img
                                    src={podium[1].userImageSrc}
                                    alt=""
                                    className="h-full w-full rounded-full object-cover"
                                />
                            ) : (
                                <span className="text-2xl">🧑‍🎓</span>
                            )}
                        </div>
                        <div className="flex h-20 w-20 flex-col items-center justify-center rounded-t-xl bg-gradient-to-b from-slate-300 to-slate-400 text-white">
                            <span className="text-2xl font-bold">🥈</span>
                            <span className="text-xs font-bold">{podium[1].points} XP</span>
                        </div>
                        <p className="mt-1 max-w-[80px] truncate text-xs font-bold text-slate-600">{podium[1].userName}</p>
                    </Link>
                )}

                {/* 1st Place */}
                {podium[0] && (
                    <Link
                        href={`/profile/${podium[0].userId}`}
                        className="flex flex-col items-center hover:scale-105 transition-transform"
                    >
                        <div className="mb-2 flex h-20 w-20 items-center justify-center rounded-full border-4 border-amber-400 bg-amber-100 shadow-xl">
                            {podium[0].userImageSrc ? (
                                <img
                                    src={podium[0].userImageSrc}
                                    alt=""
                                    className="h-full w-full rounded-full object-cover"
                                />
                            ) : (
                                <span className="text-3xl">🧑‍🎓</span>
                            )}
                        </div>
                        <div className="flex h-28 w-24 flex-col items-center justify-center rounded-t-xl bg-gradient-to-b from-amber-400 to-amber-500 text-white">
                            <span className="text-3xl font-bold">🥇</span>
                            <span className="text-sm font-bold">{podium[0].points} XP</span>
                        </div>
                        <p className="mt-1 max-w-[96px] truncate text-sm font-bold text-slate-700">{podium[0].userName}</p>
                    </Link>
                )}

                {/* 3rd Place */}
                {podium[2] && (
                    <Link
                        href={`/profile/${podium[2].userId}`}
                        className="flex flex-col items-center hover:scale-105 transition-transform"
                    >
                        <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-full border-4 border-orange-300 bg-orange-100 shadow-lg">
                            {podium[2].userImageSrc ? (
                                <img
                                    src={podium[2].userImageSrc}
                                    alt=""
                                    className="h-full w-full rounded-full object-cover"
                                />
                            ) : (
                                <span className="text-xl">🧑‍🎓</span>
                            )}
                        </div>
                        <div className="flex h-16 w-16 flex-col items-center justify-center rounded-t-xl bg-gradient-to-b from-orange-400 to-orange-500 text-white">
                            <span className="text-xl font-bold">🥉</span>
                            <span className="text-xs font-bold">{podium[2].points} XP</span>
                        </div>
                        <p className="mt-1 max-w-[64px] truncate text-xs font-bold text-slate-600">{podium[2].userName}</p>
                    </Link>
                )}
            </div>

            {/* Your Rank */}
            {currentUserRank > 0 && (
                <Link
                    href={`/profile/${userProgress.userId}`}
                    className="mb-6 block rounded-xl border-2 border-green-200 bg-green-50 p-4 hover:bg-green-100 transition-colors"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl font-bold text-green-600">#{currentUserRank}</span>
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                                {userProgress.userImageSrc ? (
                                    <img
                                        src={userProgress.userImageSrc}
                                        alt=""
                                        className="h-full w-full rounded-full object-cover"
                                    />
                                ) : (
                                    <span className="text-lg">🧑‍🎓</span>
                                )}
                            </div>
                            <div>
                                <p className="font-bold text-slate-700">{userProgress.userName || "Tu"}</p>
                                <p className="text-xs text-slate-500">A tua posição</p>
                            </div>
                        </div>
                        <span className="font-bold text-amber-500">{userProgress.points} XP</span>
                    </div>
                </Link>
            )}

            {/* Rest of Rankings */}
            {rest.length > 0 && (
                <div className="space-y-2">
                    {rest.map((user, index) => {
                        const rank = index + 4;
                        const isCurrentUser = user.userId === userProgress.userId;

                        return (
                            <Link
                                href={`/profile/${user.userId}`}
                                key={user.userId}
                                className={cn(
                                    "flex items-center justify-between rounded-xl border-2 p-3 hover:bg-slate-50 transition-colors",
                                    isCurrentUser ? "border-green-200 bg-green-50" : "border-slate-100 bg-white"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="w-8 text-center font-bold text-slate-400">#{rank}</span>
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                                        {user.userImageSrc ? (
                                            <img
                                                src={user.userImageSrc}
                                                alt=""
                                                className="h-full w-full rounded-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-lg">🧑‍🎓</span>
                                        )}
                                    </div>
                                    <span className={cn(
                                        "font-bold",
                                        isCurrentUser ? "text-green-600" : "text-slate-700"
                                    )}>
                                        {user.userName}
                                    </span>
                                </div>
                                <span className="font-bold text-amber-500">{user.points} XP</span>
                            </Link>
                        );
                    })}
                </div>
            )}

            {/* Empty State */}
            {topUsers.length === 0 && (
                <div className="rounded-xl border-2 border-dashed border-slate-200 p-8 text-center">
                    <span className="text-4xl">🏆</span>
                    <p className="mt-2 font-bold text-slate-600">Ainda não há classificação</p>
                    <p className="text-sm text-slate-500">Completa lições para aparecer aqui!</p>
                </div>
            )}
        </div>
    );
}
