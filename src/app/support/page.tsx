"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
    ArrowLeft, Loader2, MessageSquareText, ShieldAlert, Check, 
    Bot, FileText, ShieldCheck, Scale, Sparkles, UserCircle, 
    Star, Mail, Search, Zap, Copy, ExternalLink, LifeBuoy, HeartHandshake, PhoneCall,
    TerminalSquare, Activity, BookOpen, ArrowRight
} from "lucide-react";
import { useFormStatus, useFormState } from "react-dom";
import { submitSupportTicket } from "@/actions/support";
import { getLatestReviewsAction } from "@/actions/user-reviews";
import { DOCS_ARTICLES } from "@/constants/docs";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const initialState: any = {
    errors: {},
    message: "",
    success: false,
};

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            className={cn(
                "w-full py-5 rounded-2xl font-black text-xl tracking-widest text-white transition-all flex items-center justify-center outline-none uppercase shadow-sm mt-4",
                pending 
                    ? "bg-stone-300 border-stone-300 border-b-4 cursor-not-allowed translate-y-2 opacity-70 animate-pulse" 
                    : "bg-[#58CC02] border-[#46a302] border-b-8 active:border-b-0 active:translate-y-2 hover:bg-[#61da02]"
            )}
        >
            {pending ? (
                <>
                    <Loader2 className="w-6 h-6 animate-spin mr-3" />
                    A ENVIAR...
                </>
            ) : "ENVIAR MENSAGEM"}
        </button>
    );
}

export default function SupportPage() {
    const [state, formAction] = useFormState(submitSupportTicket, initialState);
    const [realReviews, setRealReviews] = useState<any[]>([]);
    
    // Smart Search State
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<typeof DOCS_ARTICLES>([]);
    const [placeholderText, setPlaceholderText] = useState("Procurar no Mural...");

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 640) {
                setPlaceholderText("Procurar...");
            } else {
                setPlaceholderText("Procurar por Ligas, XP, Ofensivas...");
            }
        };

        handleResize(); // Set initial
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        const fetchReviews = async () => {
            const reviews = await getLatestReviewsAction(5);
            setRealReviews(reviews);
        };
        fetchReviews();
    }, []);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);
        
        if (query.trim().length > 1) {
            const lowerQuery = query.toLowerCase();
            const filtered = DOCS_ARTICLES.filter(
                (article) => 
                    article.title.toLowerCase().includes(lowerQuery) || 
                    article.summary.toLowerCase().includes(lowerQuery)
            ).slice(0, 5); // Limit to top 5 results
            setSearchResults(filtered);
        } else {
            setSearchResults([]);
        }
    };

    const copyContactEmail = () => {
        navigator.clipboard.writeText("support@myduolingo.com");
        toast.success("Endereço de email copiado para a área de transferência!");
    };

    return (
        <div className="min-h-screen bg-stone-50 py-10 px-4 pb-24 font-sans">
            <div className="max-w-[1200px] mx-auto space-y-10">
                
                {/* ── Global Top Header ── */}
                <div className="flex items-center justify-between">
                    <Link href="/learn" className="inline-flex items-center gap-3 text-stone-400 hover:text-stone-600 font-extrabold uppercase tracking-widest text-sm transition-all group active:scale-95">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-stone-200 border-b-4 bg-white group-hover:bg-stone-50 transition-all shadow-sm">
                            <ArrowLeft className="w-6 h-6 text-stone-400 group-hover:text-stone-600" />
                        </div>
                        Menu
                    </Link>

                    {/* System Status Indicator */}
                    <div className="hidden sm:flex items-center gap-3 bg-white border-2 border-stone-200 border-b-4 rounded-2xl px-5 py-3 shadow-sm font-bold text-sm text-stone-600 cursor-help hover:-translate-y-1 transition-transform" title="Última verificação há 2 minutos">
                        <span className="relative flex h-3.5 w-3.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
                        </span>
                        ONLINE
                    </div>
                </div>

                {/* ── Ultra Premium Hero Banner ── */}
                <div className="relative w-full rounded-[3rem] bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-700 p-8 py-16 md:p-20 shadow-2xl border-b-[12px] border-indigo-900/40 group">
                    {/* Decorative Blobs & Grain - Contained here to avoid clipping dropdown */}
                    <div className="absolute inset-0 rounded-[3rem] overflow-hidden pointer-events-none">
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 blur-[80px] rounded-full mix-blend-overlay -translate-y-1/2 translate-x-1/3 animate-pulse duration-1000"></div>
                        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-fuchsia-400/30 blur-[60px] rounded-full mix-blend-overlay translate-y-1/3 -translate-x-1/4"></div>
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                    </div>
                    
                    <div className="relative z-20 flex flex-col items-center justify-center text-center gap-8">
                        <div className="bg-white/10 backdrop-blur-xl border border-white/20 text-white font-black tracking-widest uppercase text-xs sm:text-sm px-5 py-2.5 rounded-full flex items-center gap-2 shadow-lg">
                            <LifeBuoy className="w-4 h-4" /> Centro de Apoio ao Estudante
                        </div>
                        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight drop-shadow-xl max-w-4xl">
                            Como podemos <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-400 drop-shadow-sm">ajudar-te</span> hoje?
                        </h1>
                        
                        {/* Interactive Search Bar */}
                        <div className="w-full max-w-2xl relative mt-4">
                            <div className="relative transition-transform group-hover:scale-[1.02] duration-500 z-30">
                                <div className="absolute inset-y-0 left-5 sm:left-6 flex items-center pointer-events-none">
                                    <Search className="w-6 h-6 sm:w-7 sm:h-7 text-stone-400" />
                                </div>
                                <input 
                                    type="text"
                                    value={searchQuery}
                                    onChange={handleSearch}
                                    placeholder={placeholderText}
                                    className="w-full bg-white text-stone-800 font-bold text-lg sm:text-xl rounded-full py-5 sm:py-6 pl-14 sm:pl-16 pr-14 sm:pr-40 shadow-[0_0_40px_rgba(0,0,0,0.15)] focus:outline-none focus:ring-8 focus:ring-white/20 transition-all border-none placeholder:text-stone-400 placeholder:text-base sm:placeholder:text-lg"
                                />
                                <div className="absolute inset-y-2.5 right-2.5">
                                    <Link href="/docs" className="bg-gradient-to-b from-indigo-500 to-indigo-600 text-white font-bold rounded-full px-4 sm:px-6 py-3 hover:from-indigo-400 hover:to-indigo-500 transition-all h-full flex items-center justify-center shadow-md active:scale-95 border-b-4 border-indigo-700 aspect-square sm:aspect-auto">
                                        <span className="hidden sm:block">Ler Tudo</span>
                                        <ArrowRight className="w-5 h-5 sm:hidden" strokeWidth={3} />
                                    </Link>
                                </div>
                            </div>

                            {/* Dropdown Results */}
                            {searchQuery.trim().length > 1 && searchResults.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-4 w-full bg-white border-2 border-stone-200 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] z-[100] overflow-hidden flex flex-col text-left animate-in slide-in-from-top-4 fade-in duration-200">
                                    {searchResults.map((result) => (
                                        <Link 
                                            key={result.id} 
                                            href={"/docs/" + result.slug} 
                                            className="flex flex-col p-5 hover:bg-stone-50 border-b-2 border-stone-100 last:border-0 transition-colors group/item"
                                        >
                                            <span className="font-black text-stone-700 text-lg group-hover/item:text-[#1CB0F6] transition-colors">{result.title}</span>
                                            <span className="text-sm font-medium text-stone-500 mt-1 line-clamp-2 leading-relaxed">{result.summary}</span>
                                        </Link>
                                    ))}
                                </div>
                            )}
                            
                            {/* No Results Fallback */}
                            {searchQuery.trim().length > 1 && searchResults.length === 0 && (
                                <div className="absolute top-full left-0 right-0 mt-4 w-full bg-white border-2 border-stone-200 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] z-[100] p-8 text-center animate-in slide-in-from-top-4 fade-in duration-200">
                                    <p className="text-stone-500 font-bold text-lg">Nenhum resultado encontrado para "{searchQuery}"</p>
                                    <p className="text-stone-400 font-medium text-sm mt-1">Tenta usar termos como "XP", "Ligas", ou navega pelo Mural Central.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Prominent Docs Banner ── */}
                <Link href="/docs" className="bg-gradient-to-r from-[#58cc02] to-[#46a302] border-b-[8px] border-[#3e8e02] rounded-[2.5rem] p-8 md:p-12 mb-10 block shadow-lg hover:-translate-y-2 hover:shadow-xl transition-all duration-300 group overflow-hidden relative outline-none focus:ring-8 focus:ring-[#58cc02]/30">
                    <div className="absolute -right-10 -top-20 opacity-20 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-700 pointer-events-none">
                        <BookOpen className="w-80 h-80 text-white" />
                    </div>
                    <div className="absolute left-10 bottom-10 w-40 h-40 bg-[#d7ffb8]/20 blur-[50px] rounded-full mix-blend-overlay"></div>
                    
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div className="max-w-2xl">
                            <div className="flex items-center gap-2 text-white/90 font-black text-xs uppercase tracking-widest mb-4">
                                <Sparkles className="w-4 h-4" /> Base de Conhecimento Oficial
                            </div>
                            <h2 className="text-3xl md:text-5xl font-[1000] text-white leading-tight mb-3 drop-shadow-sm">A Enciclopédia Académica.</h2>
                            <p className="text-[#d7ffb8] font-bold text-lg lg:text-xl leading-relaxed drop-shadow-sm">
                                Tens dúvidas sobre o motor do jogo? Explora a nossa biblioteca completa de tutoriais de Corações, Ligas, Ofensivas (Streak) e muito mais.
                            </p>
                        </div>
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-[1.5rem] md:rounded-[2rem] flex items-center justify-center shrink-0 border-b-4 border-stone-200 group-hover:bg-[#d7ffb8] group-hover:border-[#b3ffc7] transition-colors shadow-sm cursor-pointer">
                            <ArrowRight className="w-8 h-8 md:w-10 md:h-10 text-[#58cc02]" strokeWidth={3} />
                        </div>
                    </div>
                </Link>

                {/* ── Advanced Bento Action Grid ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    
                    {/* 1. Bot Marco Card (Bigger Emphasis) */}
                    <div className="lg:col-span-2 xl:col-span-2 bg-[#e6ffed] border-2 border-[#b3ffc7] border-b-8 rounded-[2rem] p-8 relative overflow-hidden flex flex-col justify-center group h-full cursor-help hover:-translate-y-1 transition-transform">
                        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-emerald-400/20 rounded-full blur-3xl group-hover:bg-emerald-400/30 transition-colors"></div>
                        <div className="relative z-10 flex items-start gap-6">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-500 rounded-3xl flex items-center justify-center border-b-4 border-emerald-600 shadow-lg group-hover:scale-110 transition-transform shrink-0">
                                <Bot className="w-10 h-10 text-white" />
                            </div>
                            <div className="flex flex-col">
                                <span className="bg-emerald-200 text-emerald-800 text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full w-fit mb-2">Suporte Rápido AI</span>
                                <h3 className="text-2xl sm:text-3xl font-black text-emerald-800 mb-2 leading-tight">Fala com o Marco</h3>
                                <p className="text-emerald-700 font-medium text-base sm:text-lg leading-relaxed">
                                    Resolução instantânea em 99% das questões do dia a dia. Usa o balão de chat flutuante e tira as tuas dúvidas de forma interativa.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* 2. Direct Email Contact Card */}
                    <div className="lg:col-span-1 xl:col-span-1 bg-white border-2 border-stone-200 border-b-8 rounded-[2rem] p-8 flex flex-col h-full hover:border-[#1CB0F6] group transition-colors relative">
                        <div className="w-14 h-14 bg-[#1CB0F6]/10 rounded-2xl flex items-center justify-center mb-6 border-b-4 border-[#1CB0F6]/20">
                            <Mail className="w-7 h-7 text-[#1CB0F6]" />
                        </div>
                        <h3 className="text-xl font-black text-stone-800 mb-2">Email Direto</h3>
                        <p className="text-stone-500 font-medium text-sm mb-6 flex-grow">
                            Problemas complexos? Fala diretamente com os engenheiros humanos da plataforma.
                        </p>
                        
                        <button 
                            onClick={copyContactEmail} 
                            className="w-full bg-stone-100 hover:bg-stone-200 text-stone-600 font-bold border-2 border-stone-200 border-b-4 active:border-b-2 active:translate-y-[2px] rounded-xl py-3 px-4 flex items-center justify-center gap-2 transition-all outline-none"
                        >
                            <Copy className="w-4 h-4" /> Copiar Email
                        </button>
                    </div>

                    {/* 3. Wall of Love / Reviews - Ultra Majestic Bento Box */}
                    <Link href="/reviews" className="lg:col-span-2 md:col-span-2 xl:col-span-1 group relative outline-none">
                        <div className="h-full bg-white border-2 border-stone-200 border-b-[10px] rounded-[2.5rem] p-8 flex flex-col justify-between overflow-hidden transition-all duration-500 group-hover:-translate-y-2 group-hover:border-amber-400 group-hover:shadow-[0_20px_40px_rgba(251,191,36,0.15)] group-active:translate-y-1 group-active:border-b-4">
                            
                            {/* Animated Holographic Glow */}
                            <div className="absolute top-0 right-0 w-40 h-40 bg-amber-400/20 rounded-full blur-[60px] group-hover:bg-amber-400/40 transition-colors animate-pulse"></div>
                            <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-orange-400/10 rounded-full blur-[40px]"></div>

                            <div className="relative z-10 flex justify-between items-start">
                                <div className="space-y-1">
                                    <h3 className="text-2xl font-[1000] text-stone-800 leading-tight tracking-tight">Mural da <br/><span className="text-amber-600">Comunidade</span></h3>
                                    <p className="text-stone-400 font-bold text-xs uppercase tracking-[0.2em]">Hall of Fame</p>
                                </div>
                                <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center border-b-4 border-amber-200 group-hover:scale-110 group-hover:rotate-12 transition-transform">
                                    <Sparkles className="w-6 h-6 text-amber-600 fill-amber-600" />
                                </div>
                            </div>

                            <div className="relative z-10 mt-6 mb-8 flex items-center gap-5">
                                {/* 3D Gold Medal Badge */}
                                <div className="p-3 bg-gradient-to-b from-amber-400 to-orange-500 rounded-3xl shadow-[0_8px_0_0_#ca8a04] rotate-[-5deg] group-hover:rotate-0 transition-transform duration-500">
                                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2 px-3 border border-white/30 flex flex-col items-center">
                                        <span className="text-3xl font-black text-white leading-none">5.0</span>
                                        <div className="flex gap-0.5 mt-1">
                                            {[1,2,3,4,5].map(i => (
                                                <Star key={i} className="w-2.5 h-2.5 fill-white text-white" />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex flex-col min-w-0">
                                    <div className="flex -space-x-2 overflow-visible">
                                        {realReviews.length > 0 ? (
                                            realReviews.slice(0, 3).map((rev, i) => (
                                                <div key={rev.id} className="w-9 h-9 rounded-full border-2 border-white bg-stone-100 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                                                    {rev.userImageSrc ? (
                                                        <Image src={rev.userImageSrc} alt={rev.userName} width={36} height={36} className="object-cover" />
                                                    ) : (
                                                        <UserCircle className="w-7 h-7 text-stone-300" />
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="w-9 h-9 rounded-full border-2 border-white bg-stone-100 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                                                <UserCircle className="w-7 h-7 text-stone-300" />
                                            </div>
                                        )}
                                        {realReviews.length > 1 && (
                                            <div className="w-9 h-9 rounded-full border-2 border-white bg-amber-500 flex items-center justify-center text-[10px] font-black text-white shrink-0 shadow-sm">
                                                +{realReviews.length - 1}
                                            </div>
                                        )}
                                    </div>
                                    <span className="text-stone-500 font-bold text-xs mt-1 truncate">
                                        {realReviews.length === 1 ? "1 Aluno Avaliou" : `${realReviews.length || 0} Alunos Avaliaram`}
                                    </span>
                                </div>
                            </div>

                            <div className="relative z-10 mt-auto">
                                <div className="flex items-center justify-between bg-stone-50 group-hover:bg-amber-50 p-4 rounded-2xl border-2 border-stone-100 group-hover:border-amber-200 transition-colors">
                                    <span className="text-stone-600 group-hover:text-amber-700 font-black text-xs uppercase tracking-widest">
                                        {realReviews.length > 0 ? "Ver Avaliações" : "Dar Primeira Review"}
                                    </span>
                                    <ArrowLeft className="w-5 h-5 text-stone-400 group-hover:text-amber-500 rotate-180 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        </div>
                    </Link>

                </div>

                {/* ── Main Layout: Legal Links / API Status (Left) + Form (Middle) + FAQ (Right) ── */}
                <div className="grid grid-cols-1 lg:grid-cols-[250px_1.5fr_1.2fr] gap-8">
                    
                    {/* Left Column: Resources & Tech Specs */}
                    <div className="flex flex-col gap-6">
                        <div className="bg-white border-2 border-stone-200 border-b-8 rounded-[2rem] p-6">
                            <h3 className="text-base font-black uppercase text-stone-400 tracking-widest mb-4 flex items-center gap-2">
                                <FolderKey /> Recursos Oficiais
                            </h3>
                            <div className="flex flex-col gap-2">
                                <LegalLink href="/terms" icon={<FileText />} text="Termos de Uso" />
                                <LegalLink href="/privacy" icon={<ShieldCheck />} text="Privacidade" />
                                <LegalLink href="/licenses" icon={<Scale />} text="Licenças (EULA)" />
                                <LegalLink href="/settings/creator" icon={<UserCircle />} text="O Criador" />
                            </div>
                        </div>

                        <div className="bg-indigo-600 text-white border-b-8 border-indigo-800 rounded-[2rem] p-6 relative overflow-hidden group shadow-lg">
                            <div className="absolute opacity-10 right-[-20px] top-[-20px] text-white">
                                <TerminalSquare className="w-40 h-40" />
                            </div>
                            <h3 className="text-sm font-black text-indigo-200 uppercase tracking-widest mb-4 relative z-10 flex items-baseline gap-2">
                                <Zap className="w-4 h-4 translate-y-0.5 text-amber-300" /> Platform API
                            </h3>
                            <div className="space-y-4 relative z-10">
                                <div>
                                    <span className="text-indigo-200 text-xs font-bold block mb-1">Status do Motor IA</span>
                                    <div className="flex items-center gap-2 text-emerald-300 font-bold border-l-2 border-emerald-400 pl-3">
                                        Online (v3.0.4)
                                    </div>
                                </div>
                                <div>
                                    <span className="text-indigo-200 text-xs font-bold block mb-1">Uptime Global</span>
                                    <div className="flex items-center gap-2 text-white font-bold border-l-2 border-indigo-400 pl-3">
                                        99.98%
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Middle Column: The Support Ticket Form */}
                    <div className="bg-white border-2 border-stone-200 border-b-[10px] rounded-[2.5rem] p-8 shadow-sm h-fit">
                        {state?.success ? (
                            <div className="flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-500 bg-green-50 border-2 border-green-200 border-b-8 rounded-3xl p-10 h-full">
                                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 border-4 border-white shadow-sm ring-8 ring-green-500/10">
                                    <Check className="w-12 h-12 text-green-500 stroke-[4]" />
                                </div>
                                <h2 className="text-3xl font-extrabold text-green-700 mb-3 tracking-tight">Recebido!</h2>
                                <p className="text-green-700/80 font-medium text-lg leading-relaxed mb-8">
                                    {state.message} A nossa equipa de engenharia já colocou o teu reporte na linha de prioridade.
                                </p>
                                <Link href="/learn" className="bg-[#58CC02] text-white border-b-8 border-[#46a302] active:border-b-0 active:translate-y-2 rounded-2xl w-full py-5 font-black text-xl uppercase tracking-widest block transition-all hover:bg-[#68e003]">
                                    VOLTAR PARA A APP
                                </Link>
                            </div>
                        ) : (
                            <form action={formAction} className="flex flex-col h-full">
                                <div className="mb-8">
                                    <div className="inline-flex items-center gap-2 bg-[#1CB0F6]/10 px-3 py-1.5 rounded-xl border border-[#1CB0F6]/20 mb-4">
                                        <div className="w-2 h-2 rounded-full bg-[#1CB0F6] animate-pulse" />
                                        <span className="text-[#1CB0F6] font-bold text-xs uppercase tracking-widest">Portal Seguro</span>
                                    </div>
                                    <h2 className="text-3xl font-black text-stone-800 mb-2 leading-tight">
                                        Submeter Ticket
                                    </h2>
                                    <p className="text-stone-500 font-medium text-lg">Reporta bugs graves ou sugere melhorias profundas preenchendo os dados abaixo.</p>
                                </div>

                                {(state?.errors?.subject || state?.errors?.message) && (
                                    <div className="mb-6 p-5 bg-red-50 border-2 border-red-200 border-b-4 rounded-2xl flex items-start gap-4 animate-in slide-in-from-top-2">
                                        <div className="bg-red-100 p-2 rounded-full shrink-0 mt-0.5">
                                            <ShieldAlert className="w-5 h-5 text-red-600" />
                                        </div>
                                        <div>
                                            <h4 className="text-red-800 font-black mb-1">Ação Requerida</h4>
                                            <p className="text-red-700 font-medium text-sm leading-relaxed">{state.message || "Verifica os campos que ficaram por preencher ou incorretos."}</p>
                                        </div>
                                    </div>
                                )}

                                {/* HONEYPOT TRAP (Bot Catching) */}
                                <div className="absolute opacity-0 -z-50 select-none pointer-events-none w-0 h-0 overflow-hidden" aria-hidden="true" tabIndex={-1}>
                                    <label htmlFor="user_contact_number">Número de Telefone Pessoal</label>
                                    <input type="text" id="user_contact_number" name="user_contact_number" tabIndex={-1} autoComplete="off" />
                                </div>

                                <div className="space-y-6 flex-grow">
                                    <div className="space-y-2">
                                        <label htmlFor="subject" className="text-xs font-black uppercase text-stone-500 block tracking-widest ml-1 bg-white w-fit px-1">Título do Problema</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                id="subject"
                                                name="subject"
                                                placeholder="Resumo em 5 palavras..."
                                                className="w-full bg-stone-50 border-2 border-stone-200 border-b-4 rounded-2xl p-5 pl-12 text-stone-800 font-bold placeholder:text-stone-400 focus:outline-none focus:border-[#1CB0F6] focus:bg-white transition-all text-lg"
                                            />
                                            <Activity className="absolute top-1/2 -translate-y-1/2 left-4 w-5 h-5 text-stone-300 pointer-events-none" />
                                        </div>
                                        {state?.errors?.subject && <p className="text-red-500 font-bold text-sm ml-2 mt-1 flex items-center gap-1"><ArrowLeft className="w-3 h-3 rotate-[135deg]"/> {state.errors.subject[0]}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="message" className="text-xs font-black uppercase text-stone-500 block tracking-widest ml-1 bg-white w-fit px-1">Descrição Técnica / Passo a Passo</label>
                                        <textarea
                                            id="message"
                                            name="message"
                                            rows={5}
                                            placeholder="O que esperavas que acontecesse e o que realmente aconteceu?"
                                            className="w-full bg-stone-50 border-2 border-stone-200 border-b-4 rounded-2xl p-5 text-stone-700 font-medium placeholder:text-stone-400 focus:outline-none focus:border-[#1CB0F6] focus:bg-white resize-none text-base leading-relaxed transition-all"
                                        />
                                        {state?.errors?.message && <p className="text-red-500 font-bold text-sm ml-2 mt-1 flex items-center gap-1"><ArrowLeft className="w-3 h-3 rotate-[135deg]"/> {state.errors.message[0]}</p>}
                                    </div>
                                </div>

                                <SubmitButton />
                            </form>
                        )}
                    </div>

                    {/* Right Column: Premium Interactive FAQs */}
                    <div className="flex flex-col">
                        <div className="flex items-center justify-between mb-6 border-b-2 border-stone-200 pb-4">
                            <h2 className="text-2xl font-black text-stone-800 flex items-center gap-2">
                                <HeartHandshake className="w-6 h-6 text-rose-500" /> Autoajuda
                            </h2>
                            <span className="text-xs font-bold text-stone-400 bg-stone-200 px-2 py-1 rounded-md">FAQ's TOP 5</span>
                        </div>
                        
                        <div className="flex flex-col gap-4">
                            <FaqItem 
                                question="Como subo nas Ligas de Divisão?"
                                answer="Ganha XP (Pontos de Experiência) ao completares com sucesso as tuas lições. No fim da semana, os utilizadores na zona de promoção (luz verde) sobem à próxima Liga global."
                                icon={<ArrowLeft className="w-4 h-4 text-emerald-500 rotate-90" />}
                            />
                            <FaqItem 
                                question="Porque perdi os meus Copas (Vidas)?"
                                answer="Durante as lições guiadas, respostas incorretas penalizam o teu progresso subtraindo vidas (-1). Se perderes todas as vidas, deves praticar exercícios de revisão anteriores (Corações) ou comprá-las na Store."
                                icon={<HeartHandshake className="w-4 h-4 text-rose-500" />}
                            />
                            <FaqItem 
                                question="O que é a Ofensiva (Streak)?"
                                answer="A chama dourada mede a quantidade de dias seguidos que concluiste pelo menos uma lição. Caso não possas praticar num dia, ativa um Freeze na loja antecipadamente."
                                icon={<Zap className="w-4 h-4 text-orange-500" />}
                            />
                            <FaqItem 
                                question="Como ativo o Dark Mode nativo?"
                                answer="Esta versão está imersa numa paleta de luz adaptada aos padrões de educação. O Dark mode encontra-se em desenvolvimento fechado pelos engenheiros."
                                icon={<Bot className="w-4 h-4 text-indigo-500" />}
                            />
                        </div>
                        
                        <div className="mt-8 rounded-[2rem] bg-[#1CB0F6]/10 border-2 border-[#1CB0F6]/20 p-6 flex items-start gap-4">
                           <PhoneCall className="w-8 h-8 text-[#1CB0F6] shrink-0" />
                           <div>
                               <h4 className="font-black text-stone-800 text-lg">Suporte Prioritário</h4>
                               <p className="text-stone-600 font-medium text-sm mt-1">Garantimos resposta em até 2 horas úteis caso reportes bugs de bloqueios totais de conta.</p>
                           </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

// ── Helpers ──

function FolderKey() {
    return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="M10 4v4"/><path d="M2 8h20"/><path d="M12 16v-4"/><path d="M16 16v-4"/></svg>;
}

function LegalLink({ href, icon, text }: { href: string, icon: React.ReactNode, text: string }) {
    return (
        <Link href={href} className="flex items-center gap-3 bg-stone-50 rounded-xl p-3 border-2 border-transparent hover:border-stone-200 transition-colors group outline-none focus:border-[#1CB0F6]">
            <span className="text-stone-400 group-hover:text-[#1CB0F6] transition-colors [&>svg]:w-5 [&>svg]:h-5">
                {icon}
            </span>
            <span className="font-bold text-stone-600 group-hover:text-stone-800 transition-colors text-sm flex-grow">{text}</span>
            <ExternalLink className="w-4 h-4 text-stone-300 group-hover:text-stone-400 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
        </Link>
    );
}

function FaqItem({ question, answer, icon }: { question: string, answer: string, icon: React.ReactNode }) {
    return (
        <details className="group bg-white border-2 border-stone-200 border-b-[6px] rounded-2xl cursor-pointer hover:border-stone-300 transition-all [&_summary::-webkit-details-marker]:hidden shadow-sm overflow-hidden outline-none">
            <summary className="p-5 font-bold text-stone-800 text-lg flex items-center justify-between outline-none select-none">
                <span className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-stone-50 border border-stone-100 flex items-center justify-center shrink-0">
                        {icon}
                    </div>
                    {question}
                </span>
                <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center group-open:rotate-45 transition-transform shrink-0 border border-stone-200">
                    <span className="text-stone-400 font-black text-xl leading-none">+</span>
                </div>
            </summary>
            <div className="px-6 pb-6 text-stone-500 font-medium leading-relaxed bg-stone-50 border-t border-stone-100 italic text-base">
                {answer}
            </div>
        </details>
    );
}