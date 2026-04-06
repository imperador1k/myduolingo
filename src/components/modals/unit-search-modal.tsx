"use client";

import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Search, Compass, ChevronRight } from "lucide-react";
import { useUISounds } from "@/hooks/use-ui-sounds";
import { cn } from "@/lib/utils";

export type SearchableUnit = {
    id: number;
    title: string;
    order: number;
};

interface UnitSearchModalProps {
    units: SearchableUnit[];
}

export const UnitSearchModal = ({ units }: UnitSearchModalProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const router = useRouter();
    const { playClick } = useUISounds();
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'm') {
                e.preventDefault();
                setIsOpen(prev => !prev);
            }
            if (e.key === 'Escape' && isOpen) {
                setIsOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 100);
        } else {
            setSearchQuery("");
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const filteredUnits = units.filter(unit => 
        unit.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        `capitulo ${unit.order}`.includes(searchQuery.toLowerCase()) ||
        `capítulo ${unit.order}`.includes(searchQuery.toLowerCase())
    );

    const handleSelect = (id: number) => {
        playClick();
        setIsOpen(false);
        // Navigate or smooth scroll
        const element = document.getElementById(`unit-${id}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        } else {
            router.push(`/learn#unit-${id}`);
        }
    };

    const modalContent = (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-start justify-center pt-[15vh] px-4 animate-in fade-in duration-200">
            {/* Click outside to close */}
            <div className="absolute inset-0 cursor-pointer" onClick={() => setIsOpen(false)}></div>
            
            <div className="relative w-full max-w-xl bg-white rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border-2 border-stone-200 border-b-[8px] flex flex-col overflow-hidden animate-in zoom-in-95 slide-in-from-top-4 duration-300">
                {/* Header Input */}
                <div className="flex items-center px-4 py-3 bg-stone-50 border-b-2 border-stone-200 shadow-sm relative z-10">
                    <Search className="w-8 h-8 text-stone-400 mr-3 shrink-0" strokeWidth={3} />
                    <input
                        ref={inputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Pesquisar um Capítulo..."
                        className="w-full h-12 bg-transparent text-xl font-black text-stone-700 placeholder:text-stone-300 outline-none"
                    />
                    <kbd className="hidden sm:inline-block px-2 py-1 bg-white border-2 border-stone-200 border-b-4 rounded-xl text-[10px] uppercase font-black text-stone-400 ml-2 shrink-0">ESC</kbd>
                </div>

                {/* Results Area */}
                <div className="flex flex-col max-h-[50vh] overflow-y-auto p-4 custom-scrollbar gap-3 bg-[#f3f6f8]">
                    {filteredUnits.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center opacity-80">
                            <Compass className="w-12 h-12 text-stone-300 mb-4" strokeWidth={1.5} />
                            <p className="text-lg font-bold text-stone-500">Nenhum capítulo encontrado</p>
                        </div>
                    ) : (
                        filteredUnits.map(unit => (
                            <div 
                                key={unit.id}
                                onClick={() => handleSelect(unit.id)}
                                className="group bg-white border-2 border-stone-200 border-b-4 rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:-translate-y-1 hover:border-sky-300 hover:shadow-md active:translate-y-0 active:border-b-2 transition-all"
                            >
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-sky-500 uppercase tracking-widest mb-1">
                                        Capítulo {unit.order}
                                    </span>
                                    <span className="text-lg font-extrabold text-stone-700">
                                        {unit.title}
                                    </span>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center group-hover:bg-sky-100 group-hover:text-sky-500 transition-colors shrink-0">
                                    <ChevronRight strokeWidth={3} className="text-stone-400 group-hover:text-sky-500 transition-colors" />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );

    if (typeof document === "undefined") return null;
    return createPortal(modalContent, document.body);
};
