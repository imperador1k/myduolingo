import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { getUserProgress } from "@/db/queries";
import { Heart, Zap, Shield, Flame, Clock, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { ShopItems } from "./shop-items";

export default async function ShopPage() {
    const user = await currentUser();
    const userProgress = await getUserProgress();

    if (!user || !userProgress) {
        redirect("/courses");
    }

    return (
        <div className="pb-12">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-700">Loja</h1>
                    <p className="text-slate-500">Gasta as tuas gemas em power-ups!</p>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-sky-100 px-4 py-2">
                    <span className="text-xl">💎</span>
                    <span className="font-bold text-sky-600">{userProgress.points}</span>
                </div>
            </div>

            {/* Premium Banner */}
            <div className="mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-purple-500 to-purple-600 p-6 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="mb-2 text-xl font-bold">Duolingo Super</h2>
                        <p className="mb-4 text-sm opacity-90">
                            Corações ilimitados, sem anúncios, e muito mais!
                        </p>
                        <button className="rounded-xl bg-amber-400 px-4 py-2 font-bold text-white shadow-md transition hover:bg-amber-500">
                            Experimenta 7 dias grátis
                        </button>
                    </div>
                    <span className="text-6xl">👑</span>
                </div>
            </div>

            {/* Hearts Section */}
            <div className="mb-8">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-600">Os Teus Corações</h2>
                    <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <Heart
                                key={i}
                                className={cn(
                                    "h-6 w-6",
                                    i <= userProgress.hearts ? "fill-rose-500 text-rose-500" : "text-slate-200"
                                )}
                            />
                        ))}
                    </div>
                </div>

                <ShopItems
                    hearts={userProgress.hearts}
                    points={userProgress.points}
                />
            </div>

            {/* Power-ups Info */}
            <h2 className="mb-4 text-lg font-bold text-slate-600">Power-Ups</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="flex flex-col items-center rounded-xl border-2 border-rose-200 bg-rose-50 p-6 text-center">
                    <Heart className="h-10 w-10 fill-rose-500 text-rose-500" />
                    <h3 className="mb-1 mt-4 font-bold text-slate-700">Recarga de Corações</h3>
                    <p className="mb-4 text-sm text-slate-500">Recupera todos os teus corações</p>
                    <p className="text-xs text-slate-400">Pratica para ganhar grátis!</p>
                </div>

                <div className="flex flex-col items-center rounded-xl border-2 border-amber-200 bg-amber-50 p-6 text-center">
                    <Zap className="h-10 w-10 fill-amber-400 text-amber-400" />
                    <h3 className="mb-1 mt-4 font-bold text-slate-700">Dobro de XP</h3>
                    <p className="mb-4 text-sm text-slate-500">Ganha XP a dobrar durante 15 minutos</p>
                    <p className="text-xs text-slate-400">Em breve!</p>
                </div>

                <div className="flex flex-col items-center rounded-xl border-2 border-sky-200 bg-sky-50 p-6 text-center">
                    <Shield className="h-10 w-10 fill-sky-500 text-sky-500" />
                    <h3 className="mb-1 mt-4 font-bold text-slate-700">Congelar Streak</h3>
                    <p className="mb-4 text-sm text-slate-500">Protege o teu streak por um dia</p>
                    <p className="text-xs text-slate-400">Em breve!</p>
                </div>
            </div>
        </div>
    );
}
