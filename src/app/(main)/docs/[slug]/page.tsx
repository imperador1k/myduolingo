"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DOCS_ARTICLES } from "@/constants/docs";
import * as LucideIcons from "lucide-react";

function DynamicIcon({ name, className }: { name: string, className?: string }) {
    const Icon = (LucideIcons as any)[name] || LucideIcons.FileText;
    return <Icon className={className} />;
}

export default function ArticlePage({ params }: { params: { slug: string } }) {
    const [feedbackGiven, setFeedbackGiven] = useState(false);

    const article = useMemo(() => {
        return DOCS_ARTICLES.find((a) => a.slug === params.slug);
    }, [params.slug]);

    if (!article) {
        notFound();
    }

    const relatedArticles = useMemo(() => {
        return DOCS_ARTICLES.filter(
            (a) => a.category === article.category && a.slug !== article.slug
        ).slice(0, 3);
    }, [article]);

    const handleFeedback = (isHelpful: boolean) => {
        // TODO: Connect to Server Action handleArticleFeedback(article.slug, isHelpful) to store in DB for the /admin dashboard
        console.log(`Feedback submitted for ${article.slug}: Helpful? ${isHelpful}`);
        setFeedbackGiven(true);
    };

    return (
        <div className="max-w-6xl mx-auto py-10 px-4 flex flex-col lg:flex-row gap-10">
            
            {/* ── MAIN CONTENT (Left) ── */}
            <div className="flex-1 flex flex-col">
                
                {/* Back Link (Mobile Friendly & Tactile) */}
                <Link 
                    href="/docs" 
                    className="group flex items-center gap-2 text-stone-500 font-black text-sm uppercase tracking-widest mb-6 hover:text-[#58cc02] transition-colors w-fit"
                >
                    <div className="w-8 h-8 rounded-xl bg-white border-2 border-stone-200 border-b-4 flex items-center justify-center group-hover:border-[#58cc02] group-hover:text-[#58cc02] transition-all group-active:translate-y-1 group-active:border-b-0">
                        <LucideIcons.ArrowLeft className="w-5 h-5" />
                    </div>
                    Voltar para a Base de Conhecimento
                </Link>

                {/* ── Juicy Hero Banner ── */}
                <div className="bg-[#58cc02] text-white border-2 border-[#46a302] border-b-8 rounded-[2rem] p-8 md:p-12 mb-8 relative overflow-hidden shadow-sm shadow-[#58cc02]/20">
                    <div className="absolute right-[-10%] top-[-20%] opacity-20 pointer-events-none">
                        <DynamicIcon name={article.icon} className="w-80 h-80 -rotate-12" />
                    </div>
                    
                    <div className="relative z-10">
                        {/* Breadcrumbs */}
                        <div className="flex items-center gap-2 text-white/80 font-black text-xs uppercase tracking-widest mb-8">
                            <Link href="/docs" className="hover:text-white transition-colors bg-white/10 px-3 py-1.5 rounded-xl border border-white/20">
                                AJUDA
                            </Link> 
                            <span>/</span> 
                            <span className="bg-white/10 px-3 py-1.5 rounded-xl border border-white/20">{article.category}</span>
                        </div>

                        <div className="mb-6">
                            <DynamicIcon name={article.icon} className="w-16 h-16 text-white drop-shadow-md -rotate-6" />
                        </div>
                        
                        <h1 className="text-4xl md:text-5xl font-[1000] text-white leading-tight drop-shadow-sm">
                            {article.title}
                        </h1>
                        
                        <p className="text-[#d7ffb8] font-bold text-lg md:text-xl mt-4 max-w-2xl">
                            {article.summary}
                        </p>
                    </div>
                </div>

                {/* ── The Reading Canvas (Rich Typography) ── */}
                <div className="bg-white border-2 border-stone-200 border-b-8 rounded-[2rem] p-8 md:p-12 mb-8 shadow-sm">
                    <div 
                        className="text-stone-700 font-medium text-lg md:text-xl leading-loose
                                   [&>p]:mb-6 last:[&>p]:mb-0
                                   [&>ul]:list-none [&>ul]:pl-0 [&>ul]:mb-8
                                   [&>ul>li]:relative [&>ul>li]:pl-8 [&>ul>li]:mb-4
                                   [&>ul>li::before]:content-[''] [&>ul>li::before]:absolute [&>ul>li::before]:left-0 [&>ul>li::before]:top-2.5 
                                   [&>ul>li::before]:w-3.5 [&>ul>li::before]:h-3.5 [&>ul>li::before]:bg-[#58cc02] [&>ul>li::before]:rounded-full [&>ul>li::before]:shadow-sm
                                   [&>strong]:text-stone-900 [&>strong]:font-[1000]
                                   [&>em]:text-stone-500 [&>em]:font-bold
                                   [&>a]:text-[#58cc02] [&>a]:underline [&>a]:decoration-2 [&>a]:underline-offset-4 [&>a:hover]:text-[#46a302]"
                        dangerouslySetInnerHTML={{ __html: article.content }} 
                    />
                </div>

                {/* ── The Feedback Engine ── */}
                <div className="bg-[#d7ffb8]/30 border-2 border-[#d7ffb8] border-b-8 rounded-[2rem] p-8 lg:p-12 text-center flex flex-col items-center justify-center transition-all">
                    {!feedbackGiven ? (
                        <div className="animate-in fade-in zoom-in duration-300 w-full">
                            <h3 className="text-xl md:text-2xl font-[1000] text-[#46a302] mb-8">
                                Este artigo ajudou-te a dominar o jogo?
                            </h3>
                            <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 w-full max-w-lg mx-auto">
                                <button 
                                    onClick={() => handleFeedback(true)}
                                    className="flex-1 flex items-center justify-center gap-3 bg-white text-stone-700 border-2 border-stone-200 border-b-[6px] rounded-2xl px-6 py-5 font-[1000] text-lg uppercase hover:bg-[#58CC02] hover:text-white hover:border-[#46a302] active:translate-y-2 active:border-b-0 transition-all shadow-sm outline-none group"
                                >
                                    <span className="text-2xl group-hover:scale-125 transition-transform">👍</span> SIM
                                </button>
                                <button 
                                    onClick={() => handleFeedback(false)}
                                    className="flex-1 flex items-center justify-center gap-3 bg-white text-stone-700 border-2 border-stone-200 border-b-[6px] rounded-2xl px-6 py-5 font-[1000] text-lg uppercase hover:bg-[#ea2b2b] hover:text-white hover:border-[#b21c1c] active:translate-y-2 active:border-b-0 transition-all shadow-sm outline-none group"
                                >
                                    <span className="text-2xl group-hover:scale-125 transition-transform">👎</span> NÃO
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="animate-in slide-in-from-bottom-4 fade-in duration-500 flex flex-col items-center">
                            <div className="w-16 h-16 bg-[#58CC02] text-white rounded-full flex items-center justify-center mb-6 shadow-md border-b-4 border-[#46a302]">
                                <LucideIcons.Check className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-[1000] text-[#46a302] mb-2">
                                Obrigado pelo teu feedback! 💚
                            </h3>
                            <p className="text-[#46a302]/70 font-bold">
                                A nossa equipa de Produto agradece (e a tua Ofensiva também).
                            </p>
                        </div>
                    )}
                </div>

            </div>

            {/* ── STICKY SIDEBAR (Right) ── */}
            <div className="w-full lg:w-80 shrink-0">
                <div className="sticky top-6 flex flex-col gap-6">
                    <h3 className="text-xl font-[1000] text-stone-800 border-b-2 border-stone-100 pb-4">
                        Também na secção <br/>
                        <span className="text-[#58cc02]">{article.category}</span>
                    </h3>
                    
                    {relatedArticles.length > 0 ? (
                        <div className="flex flex-col gap-4">
                            {relatedArticles.map(related => (
                                <Link 
                                    key={related.id} 
                                    href={`/docs/${related.slug}`}
                                    className="bg-stone-50 hover:bg-stone-100 border-2 border-stone-200 border-b-4 rounded-2xl p-5 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-sm transition-all group"
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-8 h-8 rounded-xl bg-white border-2 border-stone-200 flex items-center justify-center group-hover:border-emerald-200 transition-colors">
                                            <DynamicIcon name={related.icon} className="w-4 h-4 text-stone-500 group-hover:text-[#58cc02] transition-colors" />
                                        </div>
                                    </div>
                                    <h4 className="font-black text-stone-700 text-lg mb-1 group-hover:text-stone-900 transition-colors leading-tight">
                                        {related.title}
                                    </h4>
                                    <p className="text-sm font-medium text-stone-500 line-clamp-2">
                                        {related.summary}
                                    </p>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-stone-50 border-2 border-dashed border-stone-200 rounded-2xl p-6 text-center">
                            <p className="text-stone-400 font-bold text-sm">Este é atualmente o único artigo soberano desta categoria.</p>
                        </div>
                    )}
                    
                    {/* Back to Hub Button */}
                    <Link href="/docs" className="bg-white border-2 border-stone-200 border-b-4 rounded-2xl p-4 text-center font-black text-[#58cc02] hover:bg-stone-50 hover:border-emerald-300 active:translate-y-1 active:border-b-2 transition-all mt-4 flex items-center justify-center gap-2">
                        <LucideIcons.ArrowLeft className="w-5 h-5" /> Explorar Tudo
                    </Link>
                </div>
            </div>

        </div>
    );
}
