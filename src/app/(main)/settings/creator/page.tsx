"use client";

import Link from "next/link";
import Image from "next/image";
import { 
    ArrowLeft, 
    Github, 
    Linkedin, 
    Instagram, 
    Code2, 
    Globe2, 
    Dumbbell, 
    Coffee, 
    BookOpen, 
    Gamepad2, 
    Layout, 
    Sparkles, 
    MessageSquare,
    Zap,
    Cpu,
    Compass
} from "lucide-react";

import { TiltCard } from "@/components/animations/tilt-card";
import { Counter } from "@/components/animations/counter";

export default function CreatorPage() {
    return (
        <div className="w-full space-y-12">
                
                {/* Back Button */}
                <div className="flex px-2 md:px-0">
                    <Link href="/settings" className="inline-flex items-center gap-3 text-stone-400 hover:text-stone-600 font-black uppercase tracking-widest text-sm transition-all group active:translate-x-[-4px]">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-stone-200 border-b-4 bg-white group-hover:bg-stone-50 transition-all shadow-sm">
                            <ArrowLeft className="w-6 h-6 text-stone-400 group-hover:text-stone-600" />
                        </div>
                        Definições
                    </Link>
                </div>

                {/* 1. The Player Passport (Static Tactile Card) */}
                <div className="bg-white border-2 border-stone-200 border-b-8 rounded-[2.5rem] p-8 md:p-12 relative shadow-2xl flex flex-col md:flex-row items-center justify-between gap-10 group/card cursor-default hover:-translate-y-1 transition-all duration-300">
                    {/* Internal Decoration */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-stone-50 rounded-full -mr-20 -mt-20 z-0 opacity-50" />
                    
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-12 w-full">
                        {/* Avatar Assembly */}
                        <div className="relative shrink-0">
                            <div className="w-40 h-40 md:w-48 md:h-48 rounded-[2.5rem] border-4 border-white shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden bg-stone-100 flex items-center justify-center">
                                <Image 
                                    src="https://res.cloudinary.com/deh4rfb3l/image/upload/q_auto,f_auto,w_500/v1774616395/20260222_110325_cmtd45.jpg" 
                                    alt="Miguel Santos" 
                                    fill
                                    className="object-cover"
                                    priority
                                />
                            </div>
                            {/* Repositioned Badge: Pinned to corner, no bounce */}
                            <div className="absolute -top-3 -right-3 bg-[#1CB0F6] border-2 border-white px-4 py-1.5 rounded-xl shadow-lg z-20">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="w-3 h-3 text-[#FFC800] fill-[#FFC800]" />
                                    <span className="font-black text-white text-[10px] uppercase tracking-widest whitespace-nowrap">DEUS DO CÓDIGO</span>
                                </div>
                            </div>
                        </div>

                        {/* Name & Title */}
                        <div className="text-center md:text-left flex-1 space-y-4">
                            <div>
                                <h1 className="text-5xl md:text-6xl font-black text-stone-800 tracking-tighter leading-tight drop-shadow-sm">Miguel Santos</h1>
                                <div className="flex items-center justify-center md:justify-start gap-3 mt-2">
                                    <div className="bg-purple-100 text-purple-600 border border-purple-200 px-3 py-1 rounded-lg font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
                                        <Code2 className="w-3.5 h-3.5" /> Software Engineer
                                    </div>
                                    <div className="bg-stone-100 text-stone-500 border border-stone-200 px-3 py-1 rounded-lg font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
                                        <Zap className="w-3.5 h-3.5" /> Fullstack Architect
                                    </div>
                                </div>
                            </div>
                            <p className="text-stone-500 font-bold text-xl leading-relaxed max-w-2xl">
                                Estudante de Engenharia Informática 💻 Criador de experiências digitais imersivas e fascinado por arquitetura moderna. Programo com mais café no sangue do que água! ☕
                            </p>
                        </div>
                    </div>
                </div>

                {/* 2. Content Bentos Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Bento: Tech Stack */}
                    <div className="lg:col-span-2 bg-[#fffcf0] border-2 border-[#ffecb3] border-b-8 rounded-[2.5rem] p-8 md:p-10 shadow-xl group hover:border-[#ffe18a] transition-all">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-12 h-12 bg-[#FFC800] rounded-2xl flex items-center justify-center border-b-4 border-yellow-600 shadow-md">
                                <Cpu className="w-6 h-6 text-white" />
                            </div>
                            <h2 className="text-2xl font-black text-stone-800 tracking-tight">Tech Stack Core</h2>
                        </div>
                        <div className="flex flex-wrap gap-4">
                            {[
                                { name: "Next.js 14", color: "bg-white text-stone-900 border-stone-200" },
                                { name: "React", color: "bg-sky-50 text-sky-600 border-sky-200" },
                                { name: "TypeScript", color: "bg-blue-50 text-blue-600 border-blue-200" },
                                { name: "Tailwind", color: "bg-cyan-50 text-cyan-600 border-cyan-200" },
                                { name: "Drizzle", color: "bg-emerald-50 text-emerald-600 border-emerald-200" },
                                { name: "PostgreSQL", color: "bg-indigo-50 text-indigo-600 border-indigo-200" },
                                { name: "Node.js", color: "bg-green-50 text-green-600 border-green-200" },
                                { name: "Python", color: "bg-yellow-50 text-yellow-700 border-yellow-200" },
                            ].map((tech) => (
                                <div key={tech.name} className={`${tech.color} border-2 border-b-4 px-6 py-3 rounded-2xl font-black text-sm tracking-wide shadow-sm hover:-translate-y-1 hover:shadow-md transition-all cursor-pointer flex items-center gap-2 group/pill`}>
                                    <div className="w-2 h-2 rounded-full bg-current opacity-30 group-hover/pill:animate-ping" />
                                    {tech.name}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Bento: Idiomas */}
                    <div className="bg-[#f0fdf4] border-2 border-[#bbf7d0] border-b-8 rounded-[2.5rem] p-8 shadow-xl">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center border-b-4 border-emerald-700 shadow-md">
                                <Globe2 className="w-6 h-6 text-white" />
                            </div>
                            <h2 className="text-2xl font-black text-stone-800 tracking-tight">Idiomas</h2>
                        </div>
                        <div className="space-y-4">
                            {[
                                { lang: "Português", level: "NATIVO", flag: "🇵🇹" },
                                { lang: "Inglês", level: "FLUENTE", flag: "🇬🇧" },
                                { lang: "Espanhol", level: "BÁSICO", flag: "🇪🇸" }
                            ].map((i) => (
                                <div key={i.lang} className="bg-white border-2 border-emerald-100 border-b-4 p-4 rounded-2xl flex items-center justify-between hover:scale-[1.02] transition-transform">
                                    <div className="flex items-center gap-4">
                                        <span className="text-3xl">{i.flag}</span>
                                        <span className="font-black text-stone-700">{i.lang}</span>
                                    </div>
                                    <span className="bg-emerald-100 text-emerald-700 font-extrabold text-[10px] px-3 py-1 rounded-lg">
                                        {i.level}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Bento: Hobbies (Full Width) */}
                    <div className="lg:col-span-3 bg-[#f5f3ff] border-2 border-[#ddd6fe] border-b-8 rounded-[2.5rem] p-8 md:p-10 shadow-xl">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-12 h-12 bg-purple-500 rounded-2xl flex items-center justify-center border-b-4 border-purple-700 shadow-md">
                                <Gamepad2 className="w-6 h-6 text-white" />
                            </div>
                            <h2 className="text-2xl font-black text-stone-800 tracking-tight">Interface Humana & Hobbies</h2>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                            {[
                                { name: "Ginásio", icon: Dumbbell, color: "text-rose-500 bg-rose-50 border-rose-100" },
                                { name: "Gaming", icon: Gamepad2, color: "text-indigo-500 bg-indigo-50 border-indigo-100" },
                                { name: "Café", icon: Coffee, color: "text-amber-700 bg-amber-50 border-amber-100" },
                                { name: "Dev", icon: Code2, color: "text-blue-500 bg-blue-50 border-blue-100" },
                                { name: "Pesquisa", icon: BookOpen, color: "text-emerald-500 bg-emerald-50 border-emerald-100" },
                                { name: "Exploração", icon: Compass, color: "text-sky-500 bg-sky-50 border-sky-100" },
                            ].map((h) => (
                                <div key={h.name} className={`${h.color} group border-2 border-b-8 p-6 rounded-[2rem] flex flex-col items-center gap-3 hover:-translate-y-2 hover:shadow-xl active:translate-y-1 active:border-b-0 transition-all cursor-pointer`}>
                                    <h.icon className="w-10 h-10 transition-transform group-hover:scale-110" />
                                    <span className="font-black text-stone-700 text-xs uppercase tracking-widest">{h.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 3. The Black Stats Console */}
                <div className="bg-stone-950 border-2 border-stone-800 border-b-[12px] rounded-[2.5rem] p-10 md:p-16 shadow-2xl relative overflow-hidden">
                    {/* Glowing effect */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-1 bg-[#1CB0F6]/20 blur-2xl" />
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center relative z-10">
                        <div className="space-y-2 group">
                            <p className="font-black text-stone-500 text-xs uppercase tracking-[0.2em] group-hover:text-[#1CB0F6] transition-colors">Ano de Lançamento</p>
                            <Counter value={2005} className="text-6xl md:text-8xl font-black text-white tracking-tighter" />
                        </div>
                        <div className="space-y-2 group">
                            <p className="font-black text-stone-500 text-xs uppercase tracking-[0.2em] group-hover:text-[#58CC02] transition-colors">Linhas de Código</p>
                            <Counter value={1} suffix="M+" className="text-6xl md:text-8xl font-black text-white tracking-tighter" />
                        </div>
                        <div className="space-y-2 group">
                            <p className="font-black text-stone-500 text-xs uppercase tracking-[0.2em] group-hover:text-rose-500 transition-colors">Horas de Sono</p>
                            <Counter value={0} className="text-6xl md:text-8xl font-black text-white tracking-tighter" />
                        </div>
                    </div>
                </div>

                {/* 4. Tactile Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-20">
                    <a href="https://github.com/imperador1k" target="_blank" rel="noopener noreferrer" 
                       className="bg-white text-stone-800 border-2 border-stone-200 border-b-8 rounded-[1.5rem] p-6 font-black uppercase tracking-widest hover:border-stone-800 hover:bg-stone-50 active:translate-y-2 active:border-b-0 transition-all flex items-center justify-center gap-3 shadow-xl group">
                        <Github className="w-7 h-7 group-hover:scale-110 transition-transform" />
                        Github
                    </a>

                    <a href="https://www.linkedin.com/in/miguel-santos-159900282/" target="_blank" rel="noopener noreferrer" 
                       className="bg-white text-[#0A66C2] border-2 border-stone-200 border-b-8 rounded-[1.5rem] p-6 font-black uppercase tracking-widest hover:border-[#0A66C2] hover:bg-blue-50 active:translate-y-2 active:border-b-0 transition-all flex items-center justify-center gap-3 shadow-xl group">
                        <Linkedin className="w-7 h-7 group-hover:scale-110 transition-transform" />
                        LinkedIn
                    </a>

                    <a href="https://instagram.com/miguelsantos.pr" target="_blank" rel="noopener noreferrer" 
                       className="bg-white text-[#E1306C] border-2 border-stone-200 border-b-8 rounded-[1.5rem] p-6 font-black uppercase tracking-widest hover:border-[#E1306C] hover:bg-rose-50 active:translate-y-2 active:border-b-0 transition-all flex items-center justify-center gap-3 shadow-xl group">
                        <Instagram className="w-7 h-7 group-hover:scale-110 transition-transform" />
                        Instagram
                    </a>

                    <Link href="/support" 
                       className="relative bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-700 text-white border-2 border-stone-800 border-b-8 rounded-[1.5rem] p-6 font-black uppercase tracking-widest hover:brightness-110 active:translate-y-2 active:border-b-0 transition-all flex items-center justify-center gap-3 shadow-xl overflow-hidden group">
                        <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 skew-x-12" />
                        <MessageSquare className="w-7 h-7 group-hover:rotate-12 transition-transform" />
                        Instinto
                    </Link>
                </div>
            </div>
        );
}
