import { redirect } from "next/navigation";
import { getUserProgress } from "@/db/queries";
import { Heart, Zap, Shield, Snowflake } from "lucide-react";
import { cn } from "@/lib/utils";
import { ShopItems } from "./shop-items";
import { PracticeButton } from "./practice-button";
import { LottieBlock } from "@/components/ui/lottie-block";

export const dynamic = "force-dynamic";

export default async function ShopPage() {
    const userProgress = await getUserProgress();

    if (!userProgress) {
        redirect("/courses");
    }

    return (
        <div className="mx-auto max-w-3xl pb-12 px-4 sm:px-6">
            {/* Sticky Header */}
            <div className="sticky top-0 z-20 mb-8 flex items-center justify-between bg-white/90 pb-4 pt-6 backdrop-blur-md">
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">Loja</h1>
                <div className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 px-5 py-2.5 shadow-lg shadow-amber-500/30 transition-transform hover:scale-105 cursor-default border border-amber-300">
                    <span className="text-amber-50 drop-shadow-md">⚡</span>
                    <span className="font-bold tracking-wide text-white drop-shadow-md">{userProgress.points} XP</span>
                </div>
            </div>

            {/* Mascot Lottie — swap JSON later */}
            <LottieBlock className="w-28 h-28 md:w-40 md:h-40 mx-auto -mb-2" />

            {/* Inventory & Hearts Dashboard (Os Teus Itens) */}
            <div className="mb-12 space-y-6">
                <h2 className="text-xl font-bold tracking-tight text-slate-700">Os Teus Itens</h2>

                {/* Hearts Dashboard */}
                <div className="flex flex-col items-center justify-between rounded-2xl border-2 border-rose-100 bg-gradient-to-br from-white to-rose-50/50 p-6 shadow-sm sm:flex-row transition-all hover:shadow-md">
                    <h3 className="mb-4 text-lg font-bold text-slate-700 sm:mb-0">Vidas Atuais</h3>
                    <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <Heart
                                key={i}
                                className={cn(
                                    "h-8 w-8 transition-all duration-300",
                                    i <= (userProgress.hearts || 0) 
                                        ? "fill-rose-500 text-rose-500 drop-shadow-sm hover:scale-110 active:scale-95 cursor-pointer" 
                                        : "fill-slate-200 text-slate-200",
                                    i <= (userProgress.hearts || 0) ? "animate-pulse" : "" 
                                )}
                            />
                        ))}
                    </div>
                </div>

                {/* Heart Clinic — Practice to earn hearts */}
                {(userProgress.hearts || 0) < 5 && (
                    <PracticeButton />
                )}
                {/* Inventory Cards */}
                <div className="grid grid-cols-3 gap-4">
                    {/* XP Boost */}
                    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-purple-100 bg-gradient-to-b from-purple-50/80 to-purple-100/30 p-4 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md cursor-default">
                        <Zap className="mb-2 h-8 w-8 text-purple-500 drop-shadow-sm" />
                        <p className="text-3xl font-black text-purple-600 drop-shadow-sm">{userProgress.xpBoostLessons || 0}</p>
                        <p className="mt-1 text-xs font-bold uppercase tracking-widest text-purple-400">Boosts</p>
                    </div>
                    {/* Escudos */}
                    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-sky-100 bg-gradient-to-b from-sky-50/80 to-sky-100/30 p-4 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md cursor-default">
                        <Shield className="mb-2 h-8 w-8 text-sky-500 drop-shadow-sm" />
                        <p className="text-3xl font-black text-sky-600 drop-shadow-sm">{userProgress.heartShields || 0}</p>
                        <p className="mt-1 text-xs font-bold uppercase tracking-widest text-sky-400">Escudos</p>
                    </div>
                    {/* Freezes */}
                    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-cyan-100 bg-gradient-to-b from-cyan-50/80 to-cyan-100/30 p-4 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md cursor-default">
                        <Snowflake className="mb-2 h-8 w-8 text-cyan-500 drop-shadow-sm" />
                        <p className="text-3xl font-black text-cyan-600 drop-shadow-sm">{userProgress.streakFreezes || 0}</p>
                        <p className="mt-1 text-xs font-bold uppercase tracking-widest text-cyan-400">Freezes</p>
                    </div>
                </div>
            </div>

            {/* Shop Items Storefront */}
            <div>
                <h2 className="mb-6 text-xl font-bold tracking-tight text-slate-700">Para Comprar</h2>
                <ShopItems
                    hearts={userProgress.hearts || 0}
                    points={userProgress.points || 0}
                    xpBoostLessons={userProgress.xpBoostLessons || 0}
                    heartShields={userProgress.heartShields || 0}
                    streakFreezes={userProgress.streakFreezes || 0}
                />
            </div>
        </div>
    );
}
