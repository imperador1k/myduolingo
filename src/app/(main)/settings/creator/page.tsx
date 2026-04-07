import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Github, Linkedin, Instagram, Code2, Globe2, Dumbbell, Coffee, BookOpen, Gamepad2, Layout } from "lucide-react";

export default function CreatorPage() {
    return (
        <div className="flex flex-col items-center justify-center py-6 px-4">
            <div className="relative z-10 max-w-3xl w-full mx-auto">
                <Link href="/settings/about" className="inline-flex items-center gap-2 text-stone-400 hover:text-stone-600 font-bold mb-6 transition-all group active:translate-x-[-4px]">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-stone-200 border-b-4 bg-white group-hover:bg-stone-50 transition-all">
                        <ArrowLeft className="w-5 h-5 text-stone-400 group-hover:text-stone-600" />
                    </div>
                    VOLTAR
                </Link>

                <div className="bg-white border-2 border-stone-200 border-b-8 rounded-3xl p-6 md:p-10 relative overflow-hidden shadow-sm flex flex-col gap-6">
                    {/* Background decorations */}
                    <div className="absolute -top-32 -right-32 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl pointer-events-none" />

                    {/* Top Hero Section */}
                    <div className="bg-stone-50 border-2 border-stone-200 border-b-4 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-8 relative z-10">
                        {/* Avatar */}
                        <div className="relative shrink-0 mt-4 md:mt-0">
                            <div className="w-36 h-36 rounded-full border-4 border-[#1CB0F6] ring-8 ring-[#1CB0F6]/20 shadow-xl overflow-hidden bg-stone-100 flex items-center justify-center">
                                <Image 
                                    src="/creator.jpg" 
                                    alt="Miguel Santos" 
                                    width={144}
                                    height={144}
                                    className="object-cover w-full h-full"
                                    priority
                                />
                            </div>
                            <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-[#1CB0F6] text-white font-black text-xs px-4 py-1.5 rounded-full uppercase border-2 border-white shadow-sm whitespace-nowrap tracking-wider">
                                DEUS DO CÓDIGO
                            </div>
                        </div>

                        {/* Intro */}
                        <div className="text-center md:text-left flex-1 mt-4 md:mt-0">
                            <h1 className="text-3xl md:text-4xl font-black text-stone-800 tracking-tight">Miguel Santos</h1>
                            <p className="text-stone-500 font-bold mt-1 text-lg flex items-center justify-center md:justify-start gap-2">
                                <Code2 className="w-5 h-5 text-purple-500" />
                                Software Engineer
                            </p>
                            <p className="text-stone-600 font-medium leading-relaxed mt-3">
                                Estudante de Engenharia Informática 💻 Criador imbatível de experiências SaaS e fascinado por arquitetura de software. Programo com mais café no sangue do que água! ☕
                            </p>
                        </div>
                    </div>

                    {/* Bento Grid layout */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                        
                        {/* Box 1: Tech Stack */}
                        <div className="bg-blue-50 border-2 border-blue-200 border-b-4 rounded-3xl p-6 flex flex-col hover:-translate-y-1 transition-transform">
                            <h2 className="text-blue-800 font-black text-xl mb-4 flex items-center gap-2">
                                <Layout className="w-6 h-6" /> TECH STACK
                            </h2>
                            <div className="flex flex-wrap gap-2">
                                {["Next.js", "React", "TypeScript", "TailwindCSS", "Node.js", "Python", "SQL"].map((tech) => (
                                    <span key={tech} className="bg-white border-2 border-blue-200 text-blue-700 font-bold px-3 py-1.5 rounded-xl shadow-sm text-sm">
                                        {tech}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Box 2: Idiomas */}
                        <div className="bg-emerald-50 border-2 border-emerald-200 border-b-4 rounded-3xl p-6 flex flex-col hover:-translate-y-1 transition-transform">
                            <h2 className="text-emerald-800 font-black text-xl mb-4 flex items-center gap-2">
                                <Globe2 className="w-6 h-6" /> IDIOMAS
                            </h2>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between bg-white border-2 border-emerald-200 p-3 rounded-2xl shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">🇵🇹</span>
                                        <span className="font-bold text-stone-700">Português</span>
                                    </div>
                                    <span className="bg-emerald-100 text-emerald-700 font-black text-xs px-2 py-1 rounded-lg">NATIVO</span>
                                </div>
                                <div className="flex items-center justify-between bg-white border-2 border-emerald-200 p-3 rounded-2xl shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">🇬🇧</span>
                                        <span className="font-bold text-stone-700">Inglês</span>
                                    </div>
                                    <span className="bg-emerald-100 text-emerald-700 font-black text-xs px-2 py-1 rounded-lg">FLUENTE</span>
                                </div>
                            </div>
                        </div>

                        {/* Box 3: Hobbies */}
                        <div className="bg-orange-50 border-2 border-orange-200 border-b-4 rounded-3xl p-6 md:col-span-2 hover:-translate-y-1 transition-transform">
                            <h2 className="text-orange-800 font-black text-xl mb-4 flex items-center gap-2">
                                <Gamepad2 className="w-6 h-6" /> HOBBIES & LIFESTYLE
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-white border-2 border-orange-200 rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-2 shadow-sm">
                                    <Dumbbell className="w-8 h-8 text-orange-500" />
                                    <span className="font-bold text-stone-700">Ginásio</span>
                                </div>
                                <div className="bg-white border-2 border-orange-200 rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-2 shadow-sm">
                                    <Gamepad2 className="w-8 h-8 text-orange-500" />
                                    <span className="font-bold text-stone-700">Gaming</span>
                                </div>
                                <div className="bg-white border-2 border-orange-200 rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-2 shadow-sm">
                                    <Coffee className="w-8 h-8 text-orange-500" />
                                    <span className="font-bold text-stone-700">Café</span>
                                </div>
                                <div className="bg-white border-2 border-orange-200 rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-2 shadow-sm">
                                    <BookOpen className="w-8 h-8 text-orange-500" />
                                    <span className="font-bold text-stone-700">Pesquisa</span>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Fun Stats */}
                    <div className="bg-stone-800 border-b-4 border-stone-900 rounded-3xl p-6 relative z-10 flex flex-wrap items-center justify-around gap-4 text-white shadow-md hover:bg-stone-700 transition-colors cursor-default">
                        <div className="text-center">
                            <span className="block text-3xl font-black text-[#1CB0F6] mb-1">2005</span>
                            <span className="text-stone-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider">Ano Nascim.</span>
                        </div>
                        <div className="h-10 w-px bg-stone-700 hidden sm:block"></div>
                        <div className="text-center">
                            <span className="block text-3xl font-black text-[#58CC02] mb-1">1M+</span>
                            <span className="text-stone-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider">Linhas de Código 👀</span>
                        </div>
                        <div className="h-10 w-px bg-stone-700 hidden sm:block"></div>
                        <div className="text-center">
                            <span className="block text-3xl font-black text-rose-500 mb-1">0</span>
                            <span className="text-stone-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider">Horas de Sono 😂</span>
                        </div>
                    </div>

                    {/* Social Links Form */}
                    <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
                        <a href="https://github.com/imperador1k" target="_blank" rel="noopener noreferrer" className="bg-stone-800 text-white border-b-4 border-stone-900 hover:bg-stone-700 active:translate-y-1 active:border-b-0 rounded-2xl p-4 font-bold flex justify-center items-center gap-2 transition-all">
                            <Github className="w-5 h-5" />
                            <span>GITHUB</span>
                        </a>

                        <a href="https://www.linkedin.com/in/miguel-santos-159900282/" target="_blank" rel="noopener noreferrer" className="bg-[#0A66C2] text-white border-b-4 border-[#004182] hover:bg-[#004182]/90 active:translate-y-1 active:border-b-0 rounded-2xl p-4 font-bold flex justify-center items-center gap-2 transition-all">
                            <Linkedin className="w-5 h-5" />
                            <span>LINKEDIN</span>
                        </a>
                        
                        <a href="https://instagram.com/miguelsantos.pr" target="_blank" rel="noopener noreferrer" className="bg-gradient-to-tr from-[#FFDC80] via-[#F56040] to-[#C13584] text-white border-b-4 border-[#833AB4] hover:opacity-90 active:translate-y-1 active:border-b-0 rounded-2xl p-4 font-bold flex justify-center items-center gap-2 transition-all">
                            <Instagram className="w-5 h-5" />
                            <span>INSTA</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
