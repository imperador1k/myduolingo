import { redirect } from "next/navigation";
import { getUserProgress } from "@/db/queries";
import { Heart, Zap, Shield, Snowflake } from "lucide-react";
import { cn } from "@/lib/utils";
import { ShopItems } from "./shop-items";

export const dynamic = "force-dynamic";

export default async function ShopPage() {
    const userProgress = await getUserProgress();

    if (!userProgress) {
        redirect("/courses");
    }

    return (
        <div className="pb-12">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-700">Loja</h1>
                    <p className="text-slate-500">Gasta o teu XP em power-ups!</p>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2">
                    <span className="text-xl">⚡</span>
                    <span className="font-bold text-amber-600">{userProgress.points} XP</span>
                </div>
            </div>

            {/* Current Power-ups Status */}
            <div className="mb-6 grid grid-cols-3 gap-3">
                <div className="rounded-xl border-2 border-purple-100 bg-purple-50 p-3 text-center">
                    <Zap className="mx-auto h-6 w-6 text-purple-500" />
                    <p className="mt-1 text-lg font-bold text-purple-600">{userProgress.xpBoostLessons || 0}</p>
                    <p className="text-xs text-purple-400">XP Boost</p>
                </div>
                <div className="rounded-xl border-2 border-sky-100 bg-sky-50 p-3 text-center">
                    <Shield className="mx-auto h-6 w-6 text-sky-500" />
                    <p className="mt-1 text-lg font-bold text-sky-600">{userProgress.heartShields || 0}</p>
                    <p className="text-xs text-sky-400">Escudos</p>
                </div>
                <div className="rounded-xl border-2 border-cyan-100 bg-cyan-50 p-3 text-center">
                    <Snowflake className="mx-auto h-6 w-6 text-cyan-500" />
                    <p className="mt-1 text-lg font-bold text-cyan-600">{userProgress.streakFreezes || 0}</p>
                    <p className="text-xs text-cyan-400">Freezes</p>
                </div>
            </div>

            {/* Hearts Section */}
            <div className="mb-6">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-600">❤️ Corações</h2>
                    <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <Heart
                                key={i}
                                className={cn(
                                    "h-5 w-5",
                                    i <= (userProgress.hearts || 0) ? "fill-rose-500 text-rose-500" : "text-slate-200"
                                )}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Shop Items */}
            <ShopItems
                hearts={userProgress.hearts || 0}
                points={userProgress.points || 0}
                xpBoostLessons={userProgress.xpBoostLessons || 0}
                heartShields={userProgress.heartShields || 0}
                streakFreezes={userProgress.streakFreezes || 0}
            />
        </div>
    );
}
