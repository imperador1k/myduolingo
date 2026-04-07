import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Github, Linkedin, Instagram } from "lucide-react";

export default function CreatorPage() {
    return (
        <div className="flex flex-col items-center justify-center py-6 px-4">
            <div className="relative z-10 max-w-2xl w-full mx-auto">
                <Link href="/settings/about" className="inline-flex items-center gap-2 text-stone-400 hover:text-stone-600 font-bold mb-6 transition-all group active:translate-x-[-4px]">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-stone-200 border-b-4 bg-white group-hover:bg-stone-50 transition-all">
                        <ArrowLeft className="w-5 h-5 text-stone-400 group-hover:text-stone-600" />
                    </div>
                    VOLTAR
                </Link>

                <div className="bg-white border-2 border-stone-200 border-b-8 rounded-3xl p-8 md:p-12 relative overflow-hidden text-center shadow-sm">
                    {/* Background decorations */}
                    <div className="absolute -top-32 -right-32 w-64 h-64 bg-yellow-400/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-purple-400/10 rounded-full blur-3xl pointer-events-none" />

                    {/* Avatar Hero */}
                    <div className="flex justify-center relative z-10 mt-4 mb-4">
                        <div className="relative">
                            <div className="w-32 h-32 rounded-full border-4 border-yellow-400 ring-8 ring-yellow-400/20 shadow-xl overflow-hidden bg-stone-100 flex items-center justify-center">
                                <Image 
                                    src="https://res.cloudinary.com/deh4rfb3l/image/upload/v1774616395/20260222_110325_cmtd45.jpg" 
                                    alt="Miguel Santos" 
                                    width={128}
                                    height={128}
                                    className="object-cover w-full h-full"
                                />
                            </div>
                            <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-yellow-900 font-black text-xs px-3 py-1 rounded-full uppercase border-2 border-white shadow-sm whitespace-nowrap">
                                LVL 99 DEV
                            </div>
                        </div>
                    </div>

                    {/* Typography */}
                    <div className="relative z-10">
                        <h1 className="text-3xl font-black text-stone-800 mt-6 tracking-tight">Miguel Santos</h1>
                        <p className="text-stone-500 font-medium mt-1">Criador & Arquiteto Software 💻</p>
                    </div>

                    {/* Lore Box */}
                    <div className="relative z-10 bg-stone-50 border-2 border-stone-100 rounded-2xl p-6 mt-8 text-left shadow-inner">
                        <p className="text-stone-600 leading-relaxed font-medium mb-4">
                            Boas! 👋 Nasci a <strong>26 de Maio de 2005</strong> e estou neste momento na linha da frente a tirar a licenciatura em <strong>Engenharia Informática</strong>.
                        </p>
                        <p className="text-stone-600 leading-relaxed font-medium">
                            Sou completamente apaixonado por criar coisas do absoluto zero. O que mais me faz vibrar neste mundo da tecnologia é desenvolver software autêntico, <span className="italic">SaaS</span> (Software as a Service) potentes, e esmiuçar como funcionam os sistemas operativos por dentro. Construí esta plataforma para unir uma interface brutal a algo que realmente ajuda quem quer estudar. Espero que curtam usá-la tanto quanto eu curti programá-la! 🚀
                        </p>
                    </div>

                    {/* Social Links Form */}
                    <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
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
                            <span>INSTAGRAM</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
