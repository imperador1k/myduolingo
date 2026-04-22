import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getUserVocabulary, getUserProgress } from "@/db/queries";
import Link from "next/link";
import { DuoAnimationLottie } from "@/components/ui/lottie-animation";
import { VocabularyDashboard } from "./dashboard";

export default function VocabularyPage() {
    return (
        <div className="flex flex-col gap-y-8 pb-16 pt-4 px-4 w-full max-w-[1056px] mx-auto min-h-screen">
            <Suspense fallback={<VocabularySkeleton />}>
                <VocabularyData />
            </Suspense>
        </div>
    );
}

async function VocabularyData() {
    const userProgressData = await getUserProgress();

    if (!userProgressData?.activeCourseId) {
        return redirect("/courses");
    }

    const activeLanguage = userProgressData.activeLanguage || "Idioma";
    const vocabularyList = await getUserVocabulary();

    return (
        <div className="animate-in fade-in duration-500 w-full flex flex-col gap-y-8">
            {/* ── Word Vault 3D Hero Header ── */}
            <div className="relative w-full rounded-[30px] sm:rounded-[40px] bg-gradient-to-br from-sky-400 to-sky-500 border-2 border-sky-300 border-b-[8px] sm:border-b-[12px] border-b-sky-600 p-6 sm:p-10 md:p-12 mb-8 overflow-hidden shadow-xl flex flex-col lg:flex-row items-center justify-between gap-8 sm:gap-10">
                
                {/* Decor: Ambient grid pattern */}
                <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
                
                {/* Decor: Floating 3D Orbs */}
                <div className="absolute -left-10 bottom-0 w-40 h-40 bg-white/20 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute right-20 -top-10 w-48 h-48 bg-white/20 rounded-full blur-3xl pointer-events-none" />

                <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-6 sm:gap-8 relative z-10 w-full lg:w-auto">
                    {/* Massive 3D Mascot Container */}
                    <div className="relative shrink-0">
                        <div className="bg-white p-2 sm:p-4 rounded-[32px] rounded-br-[12px] border-4 border-sky-200 border-b-[8px] border-b-sky-300 shadow-xl relative -rotate-3 hover:rotate-6 transition-transform cursor-pointer overflow-hidden w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center">
                            <DuoAnimationLottie className="w-full h-full scale-125 translate-y-2" />
                        </div>
                        {/* floating sparks & badges */}
                        <span className="absolute -top-3 -right-3 text-2xl sm:text-3xl animate-bounce drop-shadow-sm z-10">✨</span>
                        <div className="absolute -bottom-3 -left-3 bg-amber-400 text-amber-900 text-[9px] sm:text-[10px] font-black px-2.5 py-1.5 rounded-full uppercase tracking-widest border-2 border-white shadow-sm -rotate-12">
                            Mestre
                        </div>
                    </div>
                    
                    <div className="flex flex-col items-center sm:items-start gap-1">
                        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight uppercase drop-shadow-sm leading-none">
                            Cofre de Palavras
                        </h1>
                        <p className="text-sky-100 font-bold text-base sm:text-lg lg:text-xl tracking-wide max-w-md mt-2 leading-tight">
                            Já dominaste <span className="text-white font-black">{vocabularyList.length} palavras</span>! Tens a tua memória afiada hoje?
                        </p>
                        {/* Dynamic XP Tag */}
                        <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-amber-400 text-amber-900 rounded-xl border-2 border-amber-300 border-b-[4px] border-b-amber-600 shadow-sm relative overflow-hidden group cursor-default">
                            <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                            <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest opacity-80">Poder Global:</span>
                            <span className="text-sm font-black flex items-center gap-1">
                                <span className="text-lg leading-none mb-0.5">⚡</span> {userProgressData.points} XP
                            </span>
                        </div>
                    </div>
                </div>

                {/* Big Action Call */}
                <div className="relative z-10 w-full lg:w-auto flex justify-center">
                    <Link 
                        href="/learn"
                        className="w-full sm:w-auto flex flex-col items-center justify-center gap-1 px-8 sm:px-10 py-4 sm:py-5 bg-[#58CC02] text-white font-black uppercase rounded-2xl sm:rounded-3xl border-2 border-transparent border-b-[8px] sm:border-b-[10px] border-b-[#46a302] hover:translate-y-[2px] hover:border-b-[6px] sm:hover:border-b-[8px] active:translate-y-[8px] sm:active:translate-y-[10px] active:border-b-0 transition-all cursor-pointer shadow-xl group no-underline"
                    >
                        <span className="text-lg sm:text-xl tracking-[0.1em] drop-shadow-sm group-hover:scale-105 transition-transform text-center">Nova Palavra</span>
                        <span className="text-[9px] sm:text-[10px] tracking-widest text-emerald-900/40 mt-1 uppercase text-center">Expande o teu arsenal</span>
                    </Link>
                </div>
            </div>

            <VocabularyDashboard initialWords={vocabularyList} />
        </div>
    );
}

// --- SKELETON FALLBACK ---
const VocabularySkeleton = () => {
    return (
        <div className="animate-in fade-in duration-500 w-full flex flex-col gap-y-8">
            {/* Word Vault 3D Hero Header Skeleton */}
            <div className="relative w-full rounded-[30px] sm:rounded-[40px] bg-stone-200 border-2 border-stone-300 border-b-[8px] sm:border-b-[12px] border-b-stone-400 p-6 sm:p-10 md:p-12 mb-8 overflow-hidden shadow-sm flex flex-col lg:flex-row items-center justify-between gap-8 sm:gap-10 animate-pulse">
                <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-6 sm:gap-8 relative z-10 w-full lg:w-auto">
                    <div className="relative shrink-0">
                        <div className="bg-stone-300 rounded-[32px] w-28 h-28 sm:w-32 sm:h-32" />
                    </div>
                    <div className="flex flex-col items-center sm:items-start gap-3 w-full">
                        <div className="h-12 w-64 bg-stone-300 rounded-xl" />
                        <div className="h-6 w-full max-w-sm bg-stone-300 rounded-lg" />
                        <div className="h-10 w-32 bg-stone-300 rounded-xl mt-2" />
                    </div>
                </div>
                <div className="relative z-10 w-full lg:w-auto flex justify-center">
                    <div className="w-full sm:w-[240px] h-20 bg-stone-300 rounded-2xl sm:rounded-3xl" />
                </div>
            </div>

            {/* Dashboard Skeleton */}
            <div className="w-full bg-white rounded-3xl border-2 border-stone-200 p-6 mb-8 animate-pulse">
                {/* Search / Filter Skeleton */}
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    <div className="flex-1 h-14 bg-stone-200 rounded-2xl" />
                    <div className="w-full sm:w-48 h-14 bg-stone-200 rounded-2xl" />
                </div>
                {/* Grid Skeleton */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="h-32 bg-stone-100 rounded-2xl border-2 border-stone-200" />
                    ))}
                </div>
            </div>
        </div>
    );
};
