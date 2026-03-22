import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/db/drizzle";
import { userProgress } from "@/db/schema";
import { desc } from "drizzle-orm";
import { Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
    const { userId } = await auth();

    if (!userId) {
        redirect("/");
    }

    const topUsers = await db.query.userProgress.findMany({
        orderBy: [desc(userProgress.points)],
        limit: 50,
    });

    return (
        <div className="flex flex-col gap-6 p-6 pb-20 max-w-[1000px] mx-auto w-full">
            {/* Header */}
            <div className="flex flex-col items-center justify-center gap-2 mb-8 mt-4">
                <Trophy className="h-20 w-20 text-yellow-500 fill-yellow-500 animate-bounce" />
                <h1 className="text-3xl font-extrabold text-slate-700">Classificação Global</h1>
                <p className="text-slate-500 font-bold">Vê quem está a dominar a liga!</p>
            </div>

            {/* List */}
            <div className="flex flex-col gap-3">
                {topUsers.map((user, index) => {
                    const isCurrentUser = user.userId === userId;
                    
                    let RankIcon;
                    if (index === 0) RankIcon = <span className="text-3xl drop-shadow-md" title="Grau Ouro">🥇</span>;
                    else if (index === 1) RankIcon = <span className="text-3xl drop-shadow-md" title="Grau Prata">🥈</span>;
                    else if (index === 2) RankIcon = <span className="text-3xl drop-shadow-md" title="Grau Bronze">🥉</span>;
                    else RankIcon = <span className="font-extrabold text-slate-400 w-8 text-center text-lg">{index + 1}</span>;

                    return (
                        <div
                            key={user.userId}
                            className={cn(
                                "bg-white rounded-2xl p-4 flex items-center gap-4 border-2 border-slate-200 hover:bg-slate-50 transition-colors",
                                isCurrentUser && "bg-sky-50/50 border-sky-300 hover:bg-sky-50"
                            )}
                        >
                            <div className="flex items-center justify-center min-w-[40px]">
                                {RankIcon}
                            </div>
                            
                            <div className="h-14 w-14 rounded-full border-2 border-slate-200 overflow-hidden bg-slate-100 flex-shrink-0">
                                {user.userImageSrc ? (
                                    <img src={user.userImageSrc} alt={user.userName} className="h-full w-full object-cover" />
                                ) : (
                                    <div className="flex justify-center items-center h-full w-full font-bold text-slate-400">
                                        {user.userName[0]?.toUpperCase()}
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 flex flex-col">
                                <span className={cn("font-bold text-slate-700 text-lg", isCurrentUser && "text-sky-700")}>
                                    {user.userName} {isCurrentUser && <span className="text-sm font-bold text-sky-500 ml-1">(Tu)</span>}
                                </span>
                            </div>

                            <div className="font-black text-orange-500 flex items-center gap-1 text-xl drop-shadow-sm">
                                {user.points} <span className="text-sm font-bold opacity-80">XP</span>
                            </div>
                        </div>
                    );
                })}

                {topUsers.length === 0 && (
                    <div className="rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center flex flex-col items-center justify-center gap-4 text-slate-500 mt-8">
                        <Trophy className="h-12 w-12 text-slate-300" />
                        <p className="font-bold">A classificação está vazia.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
