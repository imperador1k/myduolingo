import { Suspense } from "react";
import Link from "next/link";
import { Star, ArrowLeft } from "lucide-react";
import Image from "next/image";
import { getLatestReviewsAction } from "@/actions/user-reviews";

import { ReviewCTA } from "./review-cta";

export const dynamic = "force-dynamic";

export default function ReviewsPage() {
    return (
        <div className="flex w-full flex-col p-6 lg:p-12 mb-[100px] max-w-[1056px] mx-auto">
            {/* ── Back Link (Synchronous) ── */}
            <div className="mb-6 flex animate-in fade-in duration-500">
                <Link href="/settings" className="inline-flex items-center gap-2 text-stone-400 hover:text-stone-600 font-bold transition-all group active:translate-x-[-4px]">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-stone-200 border-b-4 bg-white group-hover:bg-stone-50 transition-all">
                        <ArrowLeft className="w-5 h-5 text-stone-400 group-hover:text-stone-600" />
                    </div>
                    VOLTAR
                </Link>
            </div>

            <Suspense fallback={<ReviewsSkeleton />}>
                <ReviewsData />
            </Suspense>
        </div>
    );
}

async function ReviewsData() {
    const reviews = await getLatestReviewsAction(50);
    
    // Calculate global average
    const totalRating = reviews.reduce((acc: number, rev: any) => acc + rev.rating, 0);
    const average = reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : "0.0";

    return (
        <div className="animate-in fade-in duration-500">
            <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-8 mb-12 bg-white border-2 border-stone-200 border-b-8 rounded-3xl p-8 lg:p-12">
                <div className="flex-1 flex flex-col items-center text-center md:items-start md:text-left gap-4">
                    <h1 className="text-4xl md:text-5xl font-black text-stone-800 leading-tight flex items-center justify-center md:justify-start gap-2 flex-wrap">
                        O que dizem de <span className="text-[#1CB0F6] bg-sky-100 px-4 py-1 rounded-2xl ml-1">nós</span>
                        <Image src="/mascot.svg" alt="Marco" width={48} height={48} className="drop-shadow-md animate-bounce ml-2" />
                    </h1>
                    <p className="text-stone-500 font-medium text-lg leading-relaxed max-w-md">
                        A comunidade constrói o futuro da aprendizagem. Vê o que os teus amigos estão a achar da jornada.
                    </p>
                    
                    <ReviewCTA />
                </div>

                <div className="bg-white border-2 border-stone-200 border-b-8 rounded-3xl p-6 md:p-8 flex items-center gap-6 shadow-xl rotate-2 hover:rotate-0 transition-transform shrink-0">
                    <div className="text-6xl md:text-7xl font-black text-stone-800 tracking-tighter">
                        {average}
                    </div>
                    <div className="flex flex-col items-start justify-center gap-1">
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((s) => (
                                <Star key={s} className="w-6 h-6 lg:w-8 lg:h-8 fill-[#FFC800] text-[#FFC800] drop-shadow-sm" />
                            ))}
                        </div>
                        <span className="text-stone-400 font-bold uppercase tracking-widest text-sm mt-1">
                            {reviews.length} {reviews.length === 1 ? "Avaliação" : "Avaliações"}
                        </span>
                    </div>
                </div>
            </div>

            {/* The Grid */}
            {reviews.length === 0 ? (
                <div className="w-full text-center py-20 flex flex-col items-center opacity-60">
                    <Star className="w-20 h-20 fill-stone-200 text-stone-200 mb-4" />
                    <p className="text-stone-500 font-bold text-xl">Ainda não há reviews.</p>
                    <p className="text-stone-400 font-medium">Sê o primeiro a contar-nos a tua experiência!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {reviews.map((review: any) => (
                        <div 
                            key={review.id} 
                            className="bg-white border-2 border-stone-200 border-b-8 rounded-3xl p-5 sm:p-6 relative flex flex-col gap-4 animate-in zoom-in-95 duration-500 hover:-translate-y-1 transition-transform group overflow-hidden"
                        >
                            <div className="flex flex-col gap-3 w-full">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 relative shrink-0 rounded-full border-4 border-stone-100 overflow-hidden bg-stone-50 group-hover:border-[#1CB0F6]/20 transition-colors">
                                        <Image 
                                            src={review.userImageSrc} 
                                            alt={review.userName} 
                                            fill 
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="font-bold text-stone-800 text-lg truncate leading-tight">
                                            {review.userName}
                                        </span>
                                        <span className="text-stone-400 text-xs sm:text-sm font-medium">
                                            {new Date(review.createdAt || new Date()).toLocaleDateString('pt-PT', { month: '2-digit', year: 'numeric' })}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="flex gap-0.5 shrink-0 bg-yellow-50 w-fit px-2 py-1.5 rounded-xl border border-yellow-100">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <Star 
                                            key={s} 
                                            className={`w-4 h-4 drop-shadow-sm ${s <= review.rating ? "fill-[#FFC800] text-[#FFC800]" : "fill-stone-200 text-stone-200"}`} 
                                        />
                                    ))}
                                </div>
                            </div>
                            
                            <div className="relative mt-2">
                                <span className="text-5xl text-stone-200 font-serif absolute -top-4 -left-2 opacity-50 z-0">"</span>
                                <p className="text-stone-600 font-medium italic text-lg leading-relaxed relative z-10 pl-4 py-2">
                                    {review.comment}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// --- SKELETON FALLBACK ---
const ReviewsSkeleton = () => {
    return (
        <div className="animate-in fade-in duration-500 w-full">
            {/* Header / CTA Skeleton */}
            <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-8 mb-12 bg-white border-2 border-stone-200 border-b-8 rounded-3xl p-8 lg:p-12 animate-pulse">
                <div className="flex-1 flex flex-col items-center md:items-start w-full gap-4">
                    <div className="h-12 w-3/4 bg-stone-200 rounded-xl" />
                    <div className="h-12 w-1/2 bg-stone-200 rounded-xl" />
                    <div className="h-6 w-full max-w-md bg-stone-200 rounded-lg mt-2" />
                    <div className="h-[52px] w-[200px] bg-stone-200 rounded-2xl mt-4" />
                </div>
                <div className="bg-stone-100 border-2 border-stone-200 rounded-3xl p-6 md:p-8 flex items-center gap-6 shadow-sm shrink-0 w-full md:w-[320px] h-[140px]" />
            </div>

            {/* Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="bg-white border-2 border-stone-200 border-b-8 rounded-3xl p-5 sm:p-6 relative flex flex-col gap-4 animate-pulse">
                        <div className="flex flex-col gap-3 w-full">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-stone-200 shrink-0" />
                                <div className="flex flex-col gap-2">
                                    <div className="h-5 w-24 bg-stone-200 rounded-md" />
                                    <div className="h-4 w-16 bg-stone-200 rounded-md" />
                                </div>
                            </div>
                            <div className="w-24 h-6 bg-stone-200 rounded-xl" />
                        </div>
                        <div className="relative mt-2 space-y-2">
                            <div className="h-4 w-full bg-stone-200 rounded-md" />
                            <div className="h-4 w-5/6 bg-stone-200 rounded-md" />
                            <div className="h-4 w-4/6 bg-stone-200 rounded-md" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
