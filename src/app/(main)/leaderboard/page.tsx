import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/db/drizzle";
import { userProgress } from "@/db/schema";
import { desc } from "drizzle-orm";
import { Trophy, Star, Crown, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { TedyLottie } from "@/components/ui/lottie-animation";
import { LottieBlock } from "@/components/ui/lottie-block";

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
        <div className="flex flex-col gap-6 p-4 sm:p-8 pb-24 max-w-[1000px] mx-auto w-full font-sans">
            {/* Header Bento Box */}
            <header className="relative bg-white rounded-[3rem] border-2 border-stone-200 border-b-8 p-10 flex flex-col items-center justify-center text-center overflow-hidden shadow-sm">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-50 rounded-full blur-3xl opacity-50" />
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-sky-50 rounded-full blur-3xl opacity-50" />
                
                <div className="relative z-10 flex flex-col items-center">
                    <div className="h-28 w-28 md:h-32 md:w-32 mb-6">
                        <TedyLottie className="h-full w-full drop-shadow-xl" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-stone-700 tracking-tight leading-tight uppercase">
                        Liga Diamante
                    </h1>
                    <div className="h-2 w-16 bg-amber-400 rounded-full my-4" />
                    <p className="text-lg md:text-xl text-stone-400 font-bold max-w-md mx-auto leading-relaxed">
                        Compete com os melhores e sobe ao topo do mundo!
                    </p>
                </div>
            </header>

            {/* Top 3 Podium Cards */}
            {topUsers.length >= 3 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                    {/* 2nd Place */}
                    <PodiumCard 
                        user={topUsers[1]} 
                        rank={2} 
                        isCurrentUser={topUsers[1].userId === userId} 
                        color="bg-slate-50 border-slate-200"
                        icon={<Star className="h-6 w-6 text-slate-400 fill-slate-200" />}
                    />
                    {/* 1st Place - Center & Larger */}
                    <PodiumCard 
                        user={topUsers[0]} 
                        rank={1} 
                        isCurrentUser={topUsers[0].userId === userId} 
                        color="bg-amber-50 border-amber-200"
                        featured
                        icon={<Crown className="h-10 w-10 text-amber-500 fill-amber-200" />}
                    />
                    {/* 3rd Place */}
                    <PodiumCard 
                        user={topUsers[2]} 
                        rank={3} 
                        isCurrentUser={topUsers[2].userId === userId} 
                        color="bg-orange-50 border-orange-200"
                        icon={<Star className="h-6 w-6 text-orange-400 fill-orange-200" />}
                    />
                </div>
            )}

            {/* List */}
            <div className="flex flex-col gap-5 mt-4">
                {topUsers.map((user: any, index: number) => {
                    const isCurrentUser = user.userId === userId;
                    
                    // Skip Top 3 if podium is rendered
                    if (topUsers.length >= 3 && index < 3) return null;

                    return (
                        <div
                            key={user.userId}
                            className={cn(
                                "group bg-white rounded-[2.5rem] p-5 flex items-center gap-4 border-2 border-stone-200 border-b-8 hover:bg-stone-50 transition-all active:translate-y-1 active:border-b-0 active:mb-[8px]",
                                isCurrentUser && "bg-sky-50 border-sky-300 shadow-sky-100"
                            )}
                        >
                            <div className="flex items-center justify-center min-w-[50px]">
                                <span className={cn(
                                    "font-black text-2xl tracking-tighter w-10 h-10 flex items-center justify-center rounded-xl",
                                    isCurrentUser ? "text-sky-500 bg-sky-100 border-2 border-sky-200" : "text-stone-300"
                                )}>
                                    {index + 1}
                                </span>
                            </div>
                            
                            <div className="h-16 w-16 rounded-[1.25rem] border-2 border-stone-200 overflow-hidden bg-stone-100 flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                                {user.userImageSrc ? (
                                    <img src={user.userImageSrc} alt={user.userName} className="h-full w-full object-cover" />
                                ) : (
                                    <div className="flex justify-center items-center h-full w-full font-black text-stone-400 text-xl">
                                        {user.userName[0]?.toUpperCase()}
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 flex flex-col px-2 min-w-0">
                                <span className={cn("font-black text-stone-700 text-lg sm:text-xl tracking-tight leading-none truncate", isCurrentUser && "text-sky-700")}>
                                    {user.userName}
                                </span>
                                <div className="flex items-center gap-2 mt-1">
                                    {isCurrentUser && (
                                        <span className="text-[10px] font-black text-sky-500 uppercase tracking-widest animate-pulse whitespace-nowrap">
                                            Tu
                                        </span>
                                    )}
                                    {/* Mobile XP Badge */}
                                    <div className="flex sm:hidden items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                                        <Zap className="h-3 w-3 text-amber-500 fill-amber-300" />
                                        <span className="font-extrabold text-stone-700 text-xs tracking-tighter">
                                            {user.points} XP
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Desktop XP Badge */}
                            <div className="hidden sm:flex bg-amber-100 rounded-2xl px-5 py-2.5 border-2 border-amber-200 border-b-4 items-center gap-2 group-hover:scale-110 transition-transform">
                                <Zap className="h-5 w-5 text-amber-500 fill-amber-300" />
                                <span className="font-black text-stone-700 text-2xl tracking-tighter leading-none">
                                    {user.points}
                                </span>
                                <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest -mb-1">XP</span>
                            </div>
                        </div>
                    );
                })}

                {topUsers.length === 0 && (
                    <div className="bg-white rounded-[3rem] border-2 border-stone-200 border-b-8 p-20 text-center flex flex-col items-center justify-center gap-6 shadow-sm overflow-hidden relative">
                        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#e5e7eb_2px,transparent_2px)] [background-size:24px_24px]"></div>
                        <LottieBlock className="h-48 w-48 relative z-10" />
                        <div className="relative z-10">
                            <h2 className="text-3xl font-black text-stone-700 tracking-tight uppercase">Deserto Absoluto</h2>
                            <p className="text-stone-400 font-bold text-lg mt-2 max-w-xs mx-auto">A classificação está vazia. Sê o primeiro a dominar!</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// Helper Podium Card Component
const PodiumCard = ({ user, rank, isCurrentUser, color, featured, icon }: { user: any; rank: number; isCurrentUser: boolean; color: string; featured?: boolean; icon: React.ReactNode }) => {
    return (
        <div className={cn(
            "flex flex-col items-center p-6 rounded-[3rem] border-2 border-b-8 transition-all group relative",
            color,
            featured ? "md:scale-110 md:z-10 shadow-xl py-10" : "shadow-md mt-4",
            isCurrentUser && "ring-4 ring-sky-500 ring-offset-4 ring-offset-stone-50"
        )}>
            {/* Rank Badge Indicator */}
            <div className={cn(
                "absolute -top-6 flex items-center justify-center border-2 border-b-4 rounded-2xl px-4 py-1.5 font-black text-lg shadow-lg group-hover:-translate-y-2 transition-transform",
                rank === 1 ? "bg-amber-400 border-amber-600 text-white" : rank === 2 ? "bg-slate-300 border-slate-500 text-white" : "bg-orange-400 border-orange-600 text-white"
            )}>
                {rank}º LUGAR
            </div>

            <div className={cn(
                "relative mb-4",
                featured ? "h-28 w-28" : "h-20 w-20"
            )}>
                <div className="absolute inset-0 bg-white rounded-[2rem] border-2 border-stone-100 shadow-inner -z-10" />
                <div className={cn(
                    "h-full w-full rounded-[1.75rem] border-2 border-stone-200 overflow-hidden bg-stone-100 shadow-sm group-hover:scale-110 transition-transform",
                    isCurrentUser && "border-sky-300"
                )}>
                    {user.userImageSrc ? (
                        <img src={user.userImageSrc} alt={user.userName} className="h-full w-full object-cover" />
                    ) : (
                        <div className="flex justify-center items-center h-full w-full font-black text-stone-400 text-3xl uppercase">
                            {user.userName[0]}
                        </div>
                    )}
                </div>
                {/* Visual Icon Accent (Crown/Star) */}
                <div className="absolute -bottom-2 -right-2 bg-white rounded-xl p-1.5 border-2 border-stone-100 shadow-md group-hover:rotate-12 transition-transform">
                    {icon}
                </div>
            </div>

            <h3 className={cn(
                "text-2xl font-black text-stone-700 tracking-tight text-center leading-tight truncate w-full",
                featured && "text-3xl",
                isCurrentUser && "text-sky-700"
            )}>
                {user.userName}
            </h3>
            
            <div className="mt-4 flex flex-col items-center gap-1">
                <div className="flex items-center gap-1.5">
                    <Zap className={cn("h-5 w-5 fill-amber-300", rank === 1 ? "text-amber-500" : "text-amber-400")} />
                    <span className="text-3xl font-black text-stone-700 tracking-tighter">{user.points}</span>
                </div>
                <span className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] -mt-1">PONTOS XP</span>
            </div>

            {isCurrentUser && (
                <div className="mt-4 bg-sky-500 text-white px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest animate-pulse">
                    Tu estás aqui
                </div>
            )}
        </div>
    );
};
