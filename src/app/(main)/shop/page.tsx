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
            <header className="sticky top-0 z-50 mb-8 flex items-center justify-between bg-white/85 pb-4 pt-6 px-1 md:px-4 backdrop-blur-md border-b-2 border-stone-200">
                <h1 className="text-3xl font-black tracking-tight text-stone-700">Loja</h1>
                <div className="flex items-center gap-2 rounded-2xl bg-amber-100 px-5 py-2.5 border-2 border-amber-300 border-b-4 cursor-default transition-all hover:-translate-y-0.5">
                    <span className="text-amber-500 drop-shadow-sm font-black text-xl">⚡</span>
                    <span className="font-black tracking-widest text-amber-600 shadow-sm text-sm uppercase">{userProgress.points} XP</span>
                </div>
            </header>

            {/* Mascot Lottie — swap JSON later */}
            <LottieBlock className="w-28 h-28 md:w-40 md:h-40 mx-auto -mb-2" />

            {/* Inventory & Hearts Dashboard (Os Teus Itens) */}
            <div className="mb-12 space-y-6">
                <h2 className="text-lg font-black uppercase tracking-widest text-stone-400 mb-6 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center border-2 border-stone-200 border-b-4"><Zap className="w-4 h-4 fill-stone-400 text-stone-400" /></div>
                    Os Teus Itens
                </h2>

                {/* Hearts Dashboard */}
                <div className="flex flex-col items-center justify-between rounded-[2rem] border-2 border-rose-200 border-b-8 bg-white p-6 md:p-8 shadow-sm sm:flex-row transition-all hover:shadow-md hover:-translate-y-1 overflow-hidden relative">
                    {/* Decorative Blur */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-rose-100 rounded-full blur-3xl opacity-50 -z-10 translate-x-10 -translate-y-10" />
                    
                    <h3 className="mb-4 text-xl md:text-2xl font-black text-stone-700 sm:mb-0">Vidas Atuais</h3>
                    <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <Heart
                                key={i}
                                className={cn(
                                    "h-8 w-8 md:h-10 md:w-10 transition-all duration-300",
                                    i <= (userProgress.hearts || 0) 
                                        ? "fill-rose-500 text-rose-500 drop-shadow-md hover:scale-110 active:scale-95 cursor-pointer" 
                                        : "fill-stone-100 text-stone-200 stroke-2",
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* XP Boost */}
                    <div className="flex flex-col items-center justify-center rounded-[2rem] border-2 border-purple-200 border-b-8 bg-purple-50 p-6 md:p-8 shadow-sm transition-transform hover:-translate-y-1 hover:border-b-[10px] hover:mb-[-2px] cursor-default relative overflow-hidden">
                        <Zap className="mb-3 h-10 w-10 text-purple-500 fill-purple-200 drop-shadow-sm relative z-10" />
                        <p className="text-4xl font-black text-purple-600 drop-shadow-sm relative z-10">{userProgress.xpBoostLessons || 0}</p>
                        <p className="mt-2 text-xs font-black uppercase tracking-widest text-purple-400 relative z-10">Boosts de XP</p>
                    </div>
                    {/* Escudos */}
                    <div className="flex flex-col items-center justify-center rounded-[2rem] border-2 border-sky-200 border-b-8 bg-sky-50 p-6 md:p-8 shadow-sm transition-transform hover:-translate-y-1 hover:border-b-[10px] hover:mb-[-2px] cursor-default relative overflow-hidden">
                        <Shield className="mb-3 h-10 w-10 text-sky-500 fill-sky-200 drop-shadow-sm relative z-10" />
                        <p className="text-4xl font-black text-sky-600 drop-shadow-sm relative z-10">{userProgress.heartShields || 0}</p>
                        <p className="mt-2 text-xs font-black uppercase tracking-widest text-sky-400 relative z-10">Escudos</p>
                    </div>
                    {/* Freezes */}
                    <div className="flex flex-col items-center justify-center rounded-[2rem] border-2 border-cyan-200 border-b-8 bg-cyan-50 p-6 md:p-8 shadow-sm transition-transform hover:-translate-y-1 hover:border-b-[10px] hover:mb-[-2px] cursor-default relative overflow-hidden">
                        <Snowflake className="mb-3 h-10 w-10 text-cyan-500 fill-cyan-200 drop-shadow-sm relative z-10" />
                        <p className="text-4xl font-black text-cyan-600 drop-shadow-sm relative z-10">{userProgress.streakFreezes || 0}</p>
                        <p className="mt-2 text-xs font-black uppercase tracking-widest text-cyan-400 relative z-10">Freezes</p>
                    </div>
                </div>
            </div>

            {/* Shop Items Storefront */}
            <div>
                <h2 className="text-lg font-black uppercase tracking-widest text-stone-400 mb-6 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center border-2 border-stone-200 border-b-4"><Zap className="w-4 h-4 fill-stone-400 text-stone-400" /></div>
                    Para Comprar
                </h2>
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
