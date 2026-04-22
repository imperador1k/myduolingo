import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getUserProgress } from "@/db/queries";
import { Heart, Zap, Shield, Snowflake, ShoppingBag, Infinity } from "lucide-react";
import { cn } from "@/lib/utils";
import { ShopItems } from "./shop-items";
import { PracticeButton } from "./practice-button";
import { SupportCard } from "./support-card";
import { checkSubscription } from "@/lib/subscription";

export const dynamic = "force-dynamic";

export default function ShopPage() {
    return (
        <div className="mx-auto max-w-[1056px] w-full pb-12 px-4 sm:px-6">
            <Suspense fallback={<ShopSkeleton />}>
                <ShopData />
            </Suspense>
        </div>
    );
}

// --- ASYNC SERVER COMPONENT FOR DATA FETCHING ---
async function ShopData() {
    const userProgressData = getUserProgress();
    const isProData = checkSubscription();

    const [userProgress, isPro] = await Promise.all([userProgressData, isProData]);

    if (!userProgress) {
        redirect("/courses");
    }

    return (
        <>
            {/* Epic ShopHeader */}
            <header className="relative w-full rounded-[2.5rem] border-2 border-sky-200 border-b-8 bg-gradient-to-tr from-sky-400 via-blue-200 to-indigo-500 p-8 md:p-12 mb-12 shadow-sm overflow-hidden flex flex-col sm:flex-row items-center sm:items-center justify-between gap-8 group cursor-default transition-all hover:shadow-md">
                {/* Decorative background blur & Shimmer */}
                <div className="absolute top-0 left-0 w-64 h-64 bg-white/40 rounded-full blur-3xl opacity-60 -z-0 -translate-x-20 -translate-y-20" />
                <div className="absolute bottom-0 right-0 w-80 h-80 bg-sky-600/20 rounded-full blur-3xl opacity-50 -z-0 translate-x-20 translate-y-20" />
                <div className="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[150%] animate-[shimmer_4s_infinite_ease-in-out] skew-x-12" />

                <div className="relative z-10 flex flex-col gap-2 w-full sm:w-auto text-center sm:text-left">
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight text-sky-900 drop-shadow-sm">Loja</h1>
                </div>

                <div className="relative z-10 flex items-center gap-6 sm:gap-8 w-full sm:w-auto justify-center sm:justify-end">
                    {/* Mascot */}
                    <div className="hidden md:flex shrink-0 transition-transform duration-500 hover:scale-110 hover:-translate-y-2">
                        <img src="/mascot.svg" alt="Mascot" className="w-32 h-32 xl:w-40 xl:h-40 drop-shadow-2xl object-contain" />
                    </div>
                    
                    {/* Premium XP Integration */}
                    <div className="flex items-center gap-3 bg-white/95 backdrop-blur-sm px-6 py-4 rounded-[1.5rem] border-2 border-sky-100 border-b-6 shadow-sm transition-transform hover:scale-[1.03] active:scale-95 cursor-default group-hover:-translate-y-1">
                        <Zap className="h-8 w-8 text-sky-500 fill-sky-400 drop-shadow-sm animate-pulse" />
                        <span className="font-black tracking-widest text-sky-600 drop-shadow-sm text-xl md:text-2xl uppercase">{userProgress.points} XP</span>
                    </div>
                </div>

            </header>

            {/* Inventory & Hearts Dashboard (Os Teus Itens) */}
            <div className="mb-14 space-y-6">
                <h2 className="text-2xl md:text-3xl font-black text-stone-700 mb-8 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center border-2 border-amber-200 border-b-4 shadow-sm"><Zap className="w-6 h-6 fill-amber-500 text-amber-500" /></div>
                    Os Teus Itens
                </h2>

                {/* Hearts Dashboard (VIP Bento) */}
                <div className="flex flex-col items-center justify-between rounded-[2.5rem] border-2 border-rose-200 border-b-[10px] bg-white p-8 md:p-10 shadow-sm sm:flex-row transition-all hover:shadow-md hover:scale-[1.01] overflow-hidden relative group">
                    {/* Decorative Blur */}
                    <div className="absolute top-0 right-0 w-48 h-48 bg-rose-100 rounded-full blur-3xl opacity-50 -z-10 translate-x-10 -translate-y-10 transition-transform group-hover:scale-110" />
                    
                    <div className="flex flex-col text-center sm:text-left mb-6 sm:mb-0">
                        <h3 className="text-2xl md:text-3xl font-black text-stone-700 tracking-tight">Vidas Atuais</h3>
                        <p className="text-stone-500 font-bold mt-1 text-lg">A tua energia para aprender.</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        {isPro ? (
                            <div className="flex items-center gap-4 bg-rose-50 px-8 py-4 rounded-2xl border-2 border-rose-200 border-b-4 shadow-sm transition-transform hover:scale-105">
                                <Infinity className="h-12 w-12 text-rose-500 stroke-[3]" />
                                <span className="text-3xl font-black text-rose-600 uppercase tracking-tighter drop-shadow-sm">Infinitas</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <Heart
                                        key={i}
                                        className={cn(
                                            "h-10 w-10 md:h-12 md:w-12 transition-all duration-300",
                                            i <= (userProgress.hearts || 0) 
                                                ? "fill-rose-500 text-rose-500 drop-shadow-md hover:scale-110 active:scale-95 cursor-pointer" 
                                                : "fill-stone-100 text-stone-200 stroke-2",
                                            i <= (userProgress.hearts || 0) ? "animate-pulse" : "" 
                                        )}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Heart Clinic — Practice to earn hearts */}
                {!isPro && (userProgress.hearts || 0) < 5 && (
                    <PracticeButton />
                )}
                
                {/* Inventory Cards (Grid VIP Bento) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                    {/* XP Boost */}
                    <div className="flex flex-col items-center justify-center rounded-[2.5rem] border-2 border-purple-200 border-b-[10px] bg-purple-50 p-8 md:p-10 shadow-sm transition-all hover:scale-[1.03] hover:-translate-y-1 cursor-default relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-purple-200 rounded-full blur-2xl opacity-50 -z-10 translate-x-5 -translate-y-5 transition-transform group-hover:scale-125" />
                        <Zap className="mb-4 h-12 w-12 text-purple-500 fill-purple-200 drop-shadow-sm relative z-10 transition-transform group-hover:scale-110 group-hover:rotate-12" />
                        <p className="text-5xl font-black text-purple-600 drop-shadow-sm relative z-10">{userProgress.xpBoostLessons || 0}</p>
                        <p className="mt-3 text-sm font-black uppercase tracking-widest text-purple-400 relative z-10">Boosts de XP</p>
                    </div>
                    {/* Escudos */}
                    <div className="flex flex-col items-center justify-center rounded-[2.5rem] border-2 border-sky-200 border-b-[10px] bg-sky-50 p-8 md:p-10 shadow-sm transition-all hover:scale-[1.03] hover:-translate-y-1 cursor-default relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-sky-200 rounded-full blur-2xl opacity-50 -z-10 translate-x-5 -translate-y-5 transition-transform group-hover:scale-125" />
                        <Shield className="mb-4 h-12 w-12 text-sky-500 fill-sky-200 drop-shadow-sm relative z-10 transition-transform group-hover:scale-110 group-hover:rotate-12" />
                        <p className="text-5xl font-black text-sky-600 drop-shadow-sm relative z-10">{userProgress.heartShields || 0}</p>
                        <p className="mt-3 text-sm font-black uppercase tracking-widest text-sky-400 relative z-10">Escudos</p>
                    </div>
                    {/* Freezes */}
                    <div className="flex flex-col items-center justify-center rounded-[2.5rem] border-2 border-cyan-200 border-b-[10px] bg-cyan-50 p-8 md:p-10 shadow-sm transition-all hover:scale-[1.03] hover:-translate-y-1 cursor-default relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-200 rounded-full blur-2xl opacity-50 -z-10 translate-x-5 -translate-y-5 transition-transform group-hover:scale-125" />
                        <Snowflake className="mb-4 h-12 w-12 text-cyan-500 fill-cyan-200 drop-shadow-sm relative z-10 transition-transform group-hover:scale-110 group-hover:rotate-12" />
                        <p className="text-5xl font-black text-cyan-600 drop-shadow-sm relative z-10">{userProgress.streakFreezes || 0}</p>
                        <p className="mt-3 text-sm font-black uppercase tracking-widest text-cyan-400 relative z-10">Freezes</p>
                    </div>
                </div>
            </div>

            {/* Shop Items Storefront */}
            <div className="mb-14">
                <h2 className="text-2xl md:text-3xl font-black text-stone-700 mb-8 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-sky-100 flex items-center justify-center border-2 border-sky-200 border-b-4 shadow-sm"><ShoppingBag className="w-6 h-6 fill-sky-500 text-sky-500" /></div>
                    Para Comprar
                </h2>
                <ShopItems
                    hearts={userProgress.hearts || 0}
                    points={userProgress.points || 0}
                    xpBoostLessons={userProgress.xpBoostLessons || 0}
                    heartShields={userProgress.heartShields || 0}
                    streakFreezes={userProgress.streakFreezes || 0}
                    isPro={isPro}
                />
            </div>

            {/* Support the Developer */}
            <div className="w-full max-w-[1056px] mx-auto">
                <SupportCard />
            </div>
        </>
    );
}

// --- SKELETON FALLBACK ---
const ShopSkeleton = () => {
    return (
        <div className="w-full animate-in fade-in duration-500">
            {/* VIP Header Skeleton */}
            <header className="w-full h-[180px] md:h-[220px] rounded-[2.5rem] border-2 border-stone-200 border-b-8 bg-stone-100 mb-12 animate-pulse" />

            {/* Inventory Skeleton */}
            <div className="mb-14 space-y-6">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-full bg-stone-100 border-2 border-stone-200 border-b-4 animate-pulse" />
                    <div className="h-10 w-48 bg-stone-200 rounded-xl animate-pulse" />
                </div>

                {/* Hearts Dashboard Skeleton */}
                <div className="h-[160px] md:h-[140px] w-full rounded-[2.5rem] border-2 border-stone-200 border-b-[10px] bg-stone-50 animate-pulse" />

                {/* Inventory Cards Skeleton (Grid) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-[220px] rounded-[2.5rem] border-2 border-stone-200 border-b-[10px] bg-stone-50 animate-pulse" />
                    ))}
                </div>
            </div>

            {/* Shop Items Skeleton */}
            <div className="mb-14">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-full bg-stone-100 border-2 border-stone-200 border-b-4 animate-pulse" />
                    <div className="h-10 w-56 bg-stone-200 rounded-xl animate-pulse" />
                </div>
                
                <div className="flex flex-col gap-6">
                     {[1, 2, 3].map((i) => (
                         <div key={i} className="h-[140px] w-full rounded-[2.5rem] border-2 border-stone-200 border-b-[10px] bg-stone-50 animate-pulse" />
                     ))}
                </div>
            </div>
        </div>
    );
};
