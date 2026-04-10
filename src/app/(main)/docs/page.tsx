"use client";

import { useState } from "react";
import Link from "next/link";
import { DOCS_ARTICLES, DocCategory } from "@/constants/docs";
import * as LucideIcons from "lucide-react";
import { Search, ArrowRight, LifeBuoy, Target, MessagesSquare } from "lucide-react";
import { HappyStarLottie } from "@/components/ui/lottie-animation";

function DynamicIcon({ name, className }: { name: string, className?: string }) {
    const Icon = (LucideIcons as any)[name] || LucideIcons.FileText;
    return <Icon className={className} />;
}

// Map themes to categories for a colorful bento display
const CATEGORY_THEMES: Record<DocCategory, { bg: string, border: string, text: string, iconBg: string }> = {
    "Mecânicas Base": { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", iconBg: "bg-blue-100" },
    "Gamificação & Loja": { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", iconBg: "bg-amber-100" },
    "Competição & Social": { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-700", iconBg: "bg-purple-100" },
    "Modo Arcade": { bg: "bg-rose-50", border: "border-rose-200", text: "text-rose-700", iconBg: "bg-rose-100" },
    "Conta & Configurações": { bg: "bg-stone-100", border: "border-stone-300", text: "text-stone-700", iconBg: "bg-stone-200" }
};

export default function DocsHubPage() {
    const [searchQuery, setSearchQuery] = useState("");

    const groupedArticles = DOCS_ARTICLES.reduce((acc, article) => {
        if (!acc[article.category]) acc[article.category] = [];
        acc[article.category].push(article);
        return acc;
    }, {} as Record<DocCategory, typeof DOCS_ARTICLES>);

    const categories = Object.keys(groupedArticles) as DocCategory[];

    // "Quick Answers" or Trending
    const trendingDocs = DOCS_ARTICLES.filter(a => 
        ['o-que-e-xp', 'a-ofensiva-streak', 'como-funcionam-os-coracoes'].includes(a.slug)
    );

    // Live search filtering
    const filteredDocs = searchQuery.trim().length > 1 
        ? DOCS_ARTICLES.filter(a => 
            a.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
            a.summary.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : [];

    return (
        <div className="min-h-screen bg-stone-50/50 pb-32">
            
            {/* ── Ultra Premium Hub Hero (Full Bleed) ── */}
            {/* Break out of standard layout padding and create a massive rounded bottom header */}
            <div className="relative bg-gradient-to-br from-[#58cc02] to-[#46a302] -mt-6 -mx-4 md:-max-6 lg:-mx-8 xl:-mx-12 px-6 py-16 md:px-10 md:pt-20 md:pb-32 mb-8 flex flex-col items-center text-center overflow-visible rounded-b-[3.5rem] border-b-8 border-[#3e8e02]/50 shadow-lg">
                <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-[#d7ffb8]/30 blur-[100px] rounded-full mix-blend-overlay pointer-events-none"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#b3ffc7]/30 blur-[80px] rounded-full mix-blend-overlay pointer-events-none"></div>
                
                {/* Lottie Animation Decoration - High Definition Play */}
                <div className="absolute -left-16 top-10 w-48 h-48 md:w-80 md:h-80 opacity-100 pointer-events-none rotate-12 hidden md:block z-40">
                    <HappyStarLottie className="w-full h-full filter drop-shadow-[0_20px_50px_rgba(0,0,0,0.2)]" />
                </div>
                <div className="absolute -right-20 top-24 w-40 h-40 md:w-72 md:h-72 opacity-100 pointer-events-none -rotate-12 hidden lg:block z-40">
                    <HappyStarLottie className="w-full h-full filter drop-shadow-[0_20px_50px_rgba(0,0,0,0.2)]" />
                </div>
                
                {/* ── Inner Content Wrapper (Elevated for Dropdown to beat Cards) ── */}
                <div className="max-w-4xl mx-auto relative z-30 flex flex-col items-center text-center">
                    <div className="bg-white/20 backdrop-blur-md rounded-2xl px-4 py-2 border border-white/30 flex items-center gap-2 mb-6 shadow-sm">
                        <LifeBuoy className="w-5 h-5 text-white" />
                        <span className="text-white font-black tracking-widest uppercase text-sm">Biblioteca de Apoio</span>
                    </div>
                    
                    <h1 className="text-5xl md:text-7xl font-[1000] text-white tracking-tighter leading-none mb-8 drop-shadow-sm flex flex-col items-center">
                        <div>Pesquisa, Aprende e</div>
                        <span className="inline-block mt-3 px-6 py-2 bg-white text-[#58cc02] rounded-3xl rotate-[-2deg] hover:rotate-0 transition-transform shadow-xl">
                            Domina o Jogo.
                        </span>
                    </h1>
                    
                    <p className="text-white font-extrabold text-xl md:text-2xl max-w-2xl mb-12 drop-shadow-sm leading-relaxed">
                        De dicas secretas sobre mecânicas a truques vitais para as Ligas. O teu manual de sucesso mora aqui.
                    </p>

                    {/* Dedicated Inner Search Bar */}
                    <div className="w-full max-w-3xl relative group">
                        <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none z-20">
                            <Search className="w-7 h-7 text-stone-400 group-focus-within:text-blue-500 transition-colors" />
                        </div>
                        <input 
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Pesquisa por 'Freezes', 'XP', 'Avaliações'..."
                            className="relative z-10 w-full bg-white text-stone-800 font-bold text-xl rounded-full py-6 pl-16 pr-6 shadow-[0_20px_60px_rgba(0,0,0,0.2)] focus:outline-none focus:ring-[6px] focus:ring-[#58cc02]/50 transition-all border-none placeholder:text-stone-300"
                        />

                        {/* Search Dropdown Local */}
                        {searchQuery.trim().length > 1 && (
                            <div className="absolute top-full left-0 right-0 mt-4 bg-white rounded-3xl shadow-[0_30px_60px_rgba(0,0,0,0.15)] border-2 border-stone-200 overflow-hidden z-[100] flex flex-col text-left animate-in slide-in-from-top-4">
                                {filteredDocs.length > 0 ? (
                                    filteredDocs.map(doc => (
                                        <Link key={doc.id} href={`/docs/${doc.slug}`} className="p-5 hover:bg-stone-50 border-b-2 border-stone-100 last:border-0 group/doc flex items-center gap-4">
                                            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center shrink-0 group-hover/doc:bg-emerald-100 transition-colors">
                                                <DynamicIcon name={doc.icon} className="w-6 h-6 text-[#58cc02]" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-black text-lg text-stone-800 group-hover/doc:text-[#58cc02] transition-colors">{doc.title}</span>
                                                <span className="font-medium text-stone-500 text-sm line-clamp-1">{doc.summary}</span>
                                            </div>
                                        </Link>
                                    ))
                                ) : (
                                    <div className="p-8 text-center">
                                        <p className="text-stone-500 font-bold text-lg">Não encontrámos nada para "{searchQuery}"</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Page Content Wrapper ── */}
            <div className="max-w-6xl mx-auto flex flex-col gap-12 relative">
                
                {/* ── Trending Cards (Quick Answers - Overlapping the Hero) ── */}
                <div className="-mt-20 md:-mt-32 px-4 mb-4 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {trendingDocs.map(doc => (
                            <Link 
                                key={doc.id} 
                                href={`/docs/${doc.slug}`}
                                className="bg-white rounded-[2rem] border-2 border-stone-200 border-b-8 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.05)] hover:-translate-y-2 hover:border-blue-400 group transition-all flex flex-col"
                            >
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 rounded-2xl bg-amber-100 border-b-4 border-amber-200 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <DynamicIcon name={doc.icon} className="w-6 h-6 text-amber-600" />
                                    </div>
                                    <span className="bg-stone-100 text-stone-500 font-bold text-[10px] uppercase tracking-widest px-2 py-1 rounded-lg">Popular</span>
                                </div>
                                <h3 className="font-black text-xl text-stone-800 mb-2 leading-tight group-hover:text-blue-600 transition-colors">{doc.title}</h3>
                                <p className="text-stone-500 font-medium text-sm line-clamp-2 leading-relaxed">{doc.summary}</p>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* ── NEW 2-COLUMN LAYOUT: Main Content vs Changelog ── */}
                <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-10">
                    
                    {/* LEFT COLUMN (Span 2): The Main Encyclopedia */}
                    <div className="lg:col-span-2 flex flex-col">
                        
                        {/* ── New Section: Caminho do Iniciante (Getting Started) ── */}
                        <div className="bg-white border-2 border-stone-200 border-b-8 rounded-[2.5rem] p-8 mb-12 shadow-sm flex flex-col md:flex-row items-center gap-8 group">
                            <div className="w-24 h-24 bg-[#d7ffb8] text-[#46a302] rounded-[1.5rem] flex items-center justify-center shrink-0 border-b-4 border-[#b3ffc7] rotate-[-5deg] group-hover:rotate-0 transition-transform shadow-sm">
                                <Target className="w-12 h-12" />
                            </div>
                            <div className="flex-1 text-center md:text-left">
                                <h2 className="text-2xl md:text-3xl font-[1000] text-stone-800 tracking-tight mb-2">O Caminho do Iniciante</h2>
                                <p className="text-stone-500 font-bold mb-6 text-lg">Acabaste de chegar? Segue este guia simples de 3 passos para dominares a plataforma em 5 minutos mágicos.</p>
                                
                                <div className="flex flex-col sm:flex-row flex-wrap gap-3 justify-center md:justify-start">
                                    <Link href="/docs/o-que-e-xp" className="bg-stone-100 hover:bg-[#d7ffb8] text-stone-600 hover:text-[#46a302] font-black text-[15px] px-5 py-3 border-2 border-stone-200 hover:border-[#b3ffc7] border-b-[6px] rounded-2xl transition-all active:translate-y-1 active:border-b-2 flex items-center gap-3 shadow-sm">
                                        <span className="w-6 h-6 bg-stone-200 text-stone-600 rounded-full flex items-center justify-center text-xs">1</span>
                                        Entender o XP
                                    </Link>
                                    <Link href="/docs/sistema-de-divisoes" className="bg-stone-100 hover:bg-amber-100 text-stone-600 hover:text-amber-600 font-black text-[15px] px-5 py-3 border-2 border-stone-200 hover:border-amber-200 border-b-[6px] rounded-2xl transition-all active:translate-y-1 active:border-b-2 flex items-center gap-3 shadow-sm">
                                        <span className="w-6 h-6 bg-stone-200 text-stone-600 rounded-full flex items-center justify-center text-xs">2</span>
                                        As Ligas
                                    </Link>
                                    <Link href="/docs/alterar-nome-avatar" className="bg-stone-100 hover:bg-blue-100 text-stone-600 hover:text-blue-600 font-black text-[15px] px-5 py-3 border-2 border-stone-200 hover:border-blue-200 border-b-[6px] rounded-2xl transition-all active:translate-y-1 active:border-b-2 flex items-center gap-3 shadow-sm">
                                        <span className="w-6 h-6 bg-stone-200 text-stone-600 rounded-full flex items-center justify-center text-xs">3</span>
                                        Configurar Perfil
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* ── Divider ── */}
                        <div className="flex items-center gap-4 mb-8 opacity-50">
                            <div className="h-0.5 bg-stone-300 flex-1 rounded-full"></div>
                            <span className="text-stone-500 font-black uppercase tracking-widest">Biblioteca Enciclopédica</span>
                            <div className="h-0.5 bg-stone-300 flex-1 rounded-full"></div>
                        </div>

                        {/* ── Category Bento Grid (Thematic) ── */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {categories.map((category) => {
                                const theme = CATEGORY_THEMES[category] || CATEGORY_THEMES["Conta & Configurações"];
                                return (
                                    <div key={category} className={`bg-white border-2 border-stone-200 border-b-[8px] rounded-[2.5rem] p-8 shadow-sm flex flex-col overflow-hidden relative group/card`}>
                                        <div className={`absolute -right-20 -top-20 w-64 h-64 ${theme.bg} rounded-full blur-3xl opacity-50 group-hover/card:opacity-100 transition-opacity`}></div>
                                        
                                        <div className="relative z-10">
                                            <div className="flex items-center gap-3 mb-6">
                                                <h2 className={`text-2xl font-[1000] text-stone-800 tracking-tight`}>
                                                    {category}
                                                </h2>
                                            </div>
                                            
                                            <div className="flex flex-col gap-2">
                                                {groupedArticles[category].map((article) => (
                                                    <Link 
                                                        key={article.id} 
                                                        href={`/docs/${article.slug}`}
                                                        className="flex items-center gap-4 p-3 border-2 border-transparent hover:bg-stone-50 hover:border-stone-200 hover:shadow-sm transition-all rounded-2xl group/link"
                                                    >
                                                        <div className={`w-10 h-10 ${theme.iconBg} rounded-xl flex items-center justify-center shrink-0 border border-transparent group-hover/link:${theme.border} transition-colors`}>
                                                            <DynamicIcon name={article.icon} className={`w-5 h-5 ${theme.text}`} />
                                                        </div>
                                                        <span className="text-stone-600 font-bold text-[17px] group-hover/link:text-stone-900 transition-colors leading-snug flex-1">
                                                            {article.title}
                                                        </span>
                                                        <ArrowRight className="w-5 h-5 text-stone-300 group-hover/link:text-stone-500 opacity-0 group-hover/link:opacity-100 -translate-x-2 group-hover/link:translate-x-0 transition-all" />
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* ── Mega CTA Banner ── */}
                        <div className="mt-12 bg-gradient-to-b from-blue-50 to-[#e2f5ff] rounded-[3rem] p-10 md:p-14 border-2 border-blue-200 border-b-[12px] shadow-xl flex flex-col md:flex-row items-center justify-between gap-10 relative overflow-hidden group">
                            <div className="absolute -left-10 bottom-0 opacity-[0.04] group-hover:scale-110 transition-transform duration-700">
                                <MessagesSquare className="w-80 h-80 text-blue-900" />
                            </div>
                            <div className="relative z-10 flex-1 text-center md:text-left">
                                <h2 className="text-3xl md:text-4xl font-[1000] text-blue-950 tracking-tighter mb-4 leading-tight">
                                    Ainda não encontraste <br className="hidden md:block"/> o que procuravas?
                                </h2>
                                <p className="text-blue-600 font-bold text-lg max-w-lg mb-8 leading-relaxed">
                                    A nossa equipa de suporte humano foi treinada para iluminar o teu caminho (e dorme as horas necessárias). Abre um ticket à vontade!
                                </p>
                                
                                <div className="flex flex-col sm:flex-row gap-4 items-center justify-center md:justify-start">
                                    <Link href="/support" className="bg-[#1CB0F6] text-white font-[1000] uppercase tracking-widest border-b-[6px] border-[#1899D6] hover:bg-sky-400 active:border-b-0 active:translate-y-[6px] rounded-2xl px-6 py-4 transition-all w-full sm:w-auto text-center shadow-sm text-sm">
                                        Falar com Suporte
                                    </Link>
                                    <Link href="/reviews" className="bg-white text-blue-600 font-[1000] uppercase tracking-widest border-2 border-stone-200 border-b-[6px] hover:bg-stone-50 hover:border-blue-200 active:border-b-2 active:translate-y-[4px] rounded-2xl px-6 py-4 transition-all w-full sm:w-auto text-center shadow-sm text-sm">
                                        Ler Comunidade
                                    </Link>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* RIGHT COLUMN (Span 1): Changelog Module */}
                    <div className="lg:col-span-1 relative mt-12 lg:mt-0">
                        <div className="sticky top-6 flex flex-col">
                            
                            <h2 className="text-2xl font-[1000] text-stone-800 mb-6 flex items-center gap-3 drop-shadow-sm">
                                Últimas Novidades <span className="animate-bounce inline-block">🚀</span>
                            </h2>
                            
                            <div className="flex flex-col gap-5 relative">
                                {/* Timeline Line behind cards */}
                                <div className="absolute left-[20px] top-4 bottom-4 w-1 bg-stone-200 rounded-full z-0 opacity-50"></div>

                                {/* Changelog Card 1 */}
                                <div className="bg-white border-2 border-stone-200 border-b-[6px] rounded-[1.5rem] p-6 shadow-sm hover:border-blue-300 hover:shadow-md transition-all relative z-10 group">
                                    <div className="absolute -left-3 top-[-10px] rotate-[-10deg] group-hover:rotate-0 transition-transform bg-[#1CB0F6] text-white font-black text-[10px] tracking-widest uppercase px-3 py-1 rounded-full border-2 border-white shadow-sm shadow-[#1CB0F6]/30">V 1.3.0</div>
                                    <h3 className="text-stone-800 font-[1000] text-xl mt-3 mb-2 leading-tight">O Mural do Amor Nasceu!</h3>
                                    <p className="text-stone-500 font-bold text-sm leading-relaxed mb-4">Lançámos o sistema de reviews onde a comunidade pode deixar o seu feedback tátil na plataforma. Já foste dar 5 estrelas?</p>
                                    <span className="text-stone-400 font-black text-[11px] uppercase tracking-wider">Há 2 dias</span>
                                </div>

                                {/* Changelog Card 2 */}
                                <div className="bg-white border-2 border-stone-200 border-b-[6px] rounded-[1.5rem] p-6 shadow-sm hover:border-amber-300 hover:shadow-md transition-all relative z-10 group">
                                    <div className="absolute -left-3 top-[-10px] rotate-[-10deg] group-hover:rotate-0 transition-transform bg-amber-500 text-white font-black text-[10px] tracking-widest uppercase px-3 py-1 rounded-full border-2 border-white shadow-sm shadow-amber-500/30">V 1.2.0</div>
                                    <h3 className="text-stone-800 font-[1000] text-xl mt-3 mb-2 leading-tight">O Modo Arcade Chegou!</h3>
                                    <p className="text-stone-500 font-bold text-sm leading-relaxed mb-4">Experimenta o novo Sprint de Vocabulário e os desafios táticos da Chuva de Meteoros para testares os reflexos.</p>
                                    <span className="text-stone-400 font-black text-[11px] uppercase tracking-wider">Há 1 semana</span>
                                </div>

                                {/* Changelog Card 3 */}
                                <div className="bg-white border-2 border-stone-200 border-b-[6px] rounded-[1.5rem] p-6 shadow-sm hover:border-purple-300 transition-all relative z-10 group opacity-80 hover:opacity-100">
                                    <div className="absolute -left-3 top-[-10px] rotate-[-10deg] group-hover:rotate-0 transition-transform bg-purple-500 text-white font-black text-[10px] tracking-widest uppercase px-3 py-1 rounded-full border-2 border-white shadow-sm shadow-purple-500/30">V 1.1.5</div>
                                    <h3 className="text-stone-700 font-[1000] text-xl mt-3 mb-2 leading-tight">Reformulação das Ligas</h3>
                                    <p className="text-stone-500 font-bold text-sm leading-relaxed mb-4">A Zona Vermelha de despromoção está implacável. Tira o pêndulo das costas ao fim-de-semana porque a queda é real!</p>
                                    <span className="text-stone-400 font-black text-[11px] uppercase tracking-wider">Há 3 semanas</span>
                                </div>
                                
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
