"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import {
    Home, BookOpen, Dumbbell, GraduationCap, 
    User, BarChart, Trophy, Archive, 
    Users, Bell, Mail, ShoppingBag, Settings, Search,
    Gamepad2, Target
} from "lucide-react";

export function CommandMenu() {
    const [open, setOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };
        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    const runCommand = (command: () => void) => {
        setOpen(false);
        command();
    };

    if (!open) return null;

    return (
        <Command.Dialog 
            open={open} 
            onOpenChange={setOpen}
            label="Menu de Navegação Global"
            className="fixed inset-0 z-overlay flex items-start justify-center px-4 py-4 md:py-[15vh] bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300"
        >
            <div className="w-full max-w-xl bg-white/95 backdrop-blur-xl rounded-[2rem] shadow-[0_0_50px_-12px_rgba(0,0,0,0.25)] overflow-hidden border-2 border-slate-200/60 antialiased font-sans flex flex-col animate-in zoom-in-95 slide-in-from-top-4 duration-300">
                <div className="flex items-center border-b-2 border-slate-100/80 px-4 py-2 bg-slate-50/50">
                    <Search className="w-6 h-6 text-slate-400 mr-3 shrink-0" />
                    <Command.Input 
                        autoFocus
                        placeholder="Pesquisa rápida... (Aprender, Loja, Perfil)" 
                        className="w-full flex-1 bg-transparent py-4 outline-none text-slate-800 placeholder:text-slate-400 font-bold text-lg"
                    />
                    <div className="hidden md:flex items-center gap-1 ml-2">
                        <kbd className="px-2 py-1 bg-slate-100 border-2 border-b-4 border-slate-200 rounded-lg text-[10px] font-black text-slate-500 uppercase">ESC</kbd>
                    </div>
                </div>
                
                <Command.List className="max-h-[60vh] md:max-h-[450px] overflow-y-auto p-3 custom-scrollbar">
                    <Command.Empty className="py-12 text-center flex flex-col items-center gap-3">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                            <Search className="w-8 h-8 text-slate-300" />
                        </div>
                        <div>
                            <p className="text-slate-800 font-bold text-lg">Nada encontrado por aqui</p>
                            <p className="text-slate-500 font-medium text-sm">Tenta pesquisar por "Loja" ou "Estatísticas"</p>
                        </div>
                    </Command.Empty>

                    <div className="flex flex-col gap-2">
                        <Command.Group heading="Aprender" className="text-[11px] font-black text-slate-400 uppercase tracking-[0.1em] px-3 py-3">
                            <CommandItem onSelect={() => runCommand(() => router.push("/learn"))} icon={<Home className="w-5 h-5" />} color="text-sky-500" bgColor="bg-sky-50">Início / Aprender</CommandItem>
                            <CommandItem onSelect={() => runCommand(() => router.push("/practice"))} icon={<Dumbbell className="w-5 h-5" />} color="text-emerald-500" bgColor="bg-emerald-50">Praticar AI</CommandItem>
                            <CommandItem onSelect={() => runCommand(() => router.push("/courses"))} icon={<BookOpen className="w-5 h-5" />} color="text-amber-500" bgColor="bg-amber-50">Meus Cursos</CommandItem>
                            <CommandItem onSelect={() => runCommand(() => router.push("/arcade"))} icon={<Gamepad2 className="w-5 h-5" />} color="text-pink-500" bgColor="bg-pink-50">Arcade / Jogos</CommandItem>
                            <CommandItem onSelect={() => runCommand(() => router.push("/evaluation"))} icon={<GraduationCap className="w-5 h-5" />} color="text-indigo-500" bgColor="bg-indigo-50">Avaliação</CommandItem>
                        </Command.Group>

                        <Command.Group heading="O Teu Progresso" className="text-[11px] font-black text-slate-400 uppercase tracking-[0.1em] px-3 py-3 mt-2">
                            <CommandItem onSelect={() => runCommand(() => router.push("/profile"))} icon={<User className="w-5 h-5" />} color="text-orange-500" bgColor="bg-orange-50">O meu Perfil</CommandItem>
                            <CommandItem onSelect={() => runCommand(() => router.push("/analytics"))} icon={<BarChart className="w-5 h-5" />} color="text-purple-500" bgColor="bg-purple-50">Estatísticas Detalhadas</CommandItem>
                            <CommandItem onSelect={() => runCommand(() => router.push("/leaderboard"))} icon={<Trophy className="w-5 h-5" />} color="text-yellow-500" bgColor="bg-yellow-50">Ranking / Classificação</CommandItem>
                            <CommandItem onSelect={() => runCommand(() => router.push("/quests"))} icon={<Target className="w-5 h-5" />} color="text-rose-500" bgColor="bg-rose-50">Missões / Quests</CommandItem>
                            <CommandItem onSelect={() => runCommand(() => router.push("/vocabulary"))} icon={<Archive className="w-5 h-5" />} color="text-rose-500" bgColor="bg-rose-50">Cofre de Vocabulário</CommandItem>
                        </Command.Group>

                        <Command.Group heading="Comunidade & Configurações" className="text-[11px] font-black text-slate-400 uppercase tracking-[0.1em] px-3 py-3 mt-2">
                            <CommandItem onSelect={() => runCommand(() => router.push("/friends"))} icon={<Users className="w-5 h-5" />} color="text-blue-500" bgColor="bg-blue-50">Amigos & Desafios</CommandItem>
                            <CommandItem onSelect={() => runCommand(() => router.push("/notifications"))} icon={<Bell className="w-5 h-5" />} color="text-pink-500" bgColor="bg-pink-50">Notificações</CommandItem>
                            <CommandItem onSelect={() => runCommand(() => router.push("/messages"))} icon={<Mail className="w-5 h-5" />} color="text-cyan-500" bgColor="bg-cyan-50">Mensagens Privadas</CommandItem>
                            <CommandItem onSelect={() => runCommand(() => router.push("/shop"))} icon={<ShoppingBag className="w-5 h-5" />} color="text-violet-500" bgColor="bg-violet-50">Loja de Itens</CommandItem>
                            <CommandItem onSelect={() => runCommand(() => router.push("/settings"))} icon={<Settings className="w-5 h-5" />} color="text-slate-600" bgColor="bg-slate-100">Definições da Conta</CommandItem>
                        </Command.Group>
                    </div>
                </Command.List>

                <div className="bg-slate-50 border-t-2 border-slate-100 p-3 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <div className="flex items-center gap-4 ml-2">
                        <span className="flex items-center gap-1.5"><kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded shadow-sm">↑↓</kbd> Navegar</span>
                        <span className="flex items-center gap-1.5"><kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded shadow-sm">ENTER</kbd> Selecionar</span>
                    </div>
                    <span className="mr-2">Duolingo Smart Search</span>
                </div>
            </div>
        </Command.Dialog>
    );
}

function CommandItem({ children, onSelect, icon, color, bgColor }: { children: React.ReactNode, onSelect: () => void, icon?: React.ReactNode, color: string, bgColor: string }) {
    return (
        <Command.Item 
            onSelect={onSelect}
            className="flex items-center gap-4 px-4 py-3 text-base font-extrabold text-slate-600 rounded-2xl cursor-pointer transition-all outline-none aria-selected:bg-slate-100 aria-selected:text-slate-900 data-[selected=true]:bg-slate-100 data-[selected=true]:text-slate-900 group"
        >
            <div className={`w-12 h-12 rounded-xl ${bgColor} flex items-center justify-center ${color} transition-transform group-aria-selected:scale-110 group-data-[selected=true]:scale-110 shadow-sm border border-black/5`}>
                {icon}
            </div>
            <div className="flex-1 flex flex-col">
                <span>{children}</span>
            </div>
            <div className="opacity-0 group-aria-selected:opacity-100 group-data-[selected=true]:opacity-100 transition-opacity">
                <kbd className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-black text-slate-400">↵</kbd>
            </div>
        </Command.Item>
    );
}
