"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { createPortal } from "react-dom";
import { useUISounds } from "@/hooks/use-ui-sounds";

export const SupportCard = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const { playReward } = useUISounds();

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }
        
        return () => {
            document.body.style.overflow = "auto";
        };
    }, [isOpen]);

    const onSupportClick = () => {
        playReward();
        setIsOpen(true);
    };

    const modalContent = isOpen ? (
        <div className="fixed inset-0 z-[99999] flex animate-in fade-in zoom-in-95 duration-200 bg-stone-900/60 backdrop-blur-sm p-4 sm:p-6 md:p-12 items-center justify-center">
            <div className="bg-white w-full h-full max-w-5xl max-h-[800px] rounded-3xl border-2 border-stone-200 shadow-2xl flex flex-col overflow-hidden relative">
                {/* Browser Header */}
                <div className="bg-stone-100 border-b-2 border-stone-200 px-4 py-3 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2">
                        <div className="h-8 bg-stone-200 rounded-full flex items-center px-3 gap-2">
                            <span>🔒</span>
                            <span className="text-xs text-stone-500 font-bold hidden sm:block">Pagamento Seguro (BMC)</span>
                        </div>
                    </div>
                    <button 
                        onClick={() => setIsOpen(false)}
                        className="w-8 h-8 bg-stone-200 hover:bg-stone-300 rounded-full flex items-center justify-center text-stone-500 transition-colors cursor-pointer"
                    >
                        <X className="w-5 h-5 stroke-[3px]" />
                    </button>
                </div>
                {/* Iframe content */}
                <div className="w-full h-full bg-stone-50 flex-1 relative overflow-hidden rounded-b-3xl flex justify-center items-center">
                    <iframe 
                        // The /widget/page/ endpoint is specifically allowed in iframes by BMC
                        src="https://www.buymeacoffee.com/widget/page/imperador1k?description=Support%20me%20on%20Buy%20me%20a%20coffee!&color=%23FFDD00" 
                        className="w-full h-full max-w-[500px] absolute !border-none"
                        title="Buy Me A Coffee"
                    />
                </div>
            </div>
        </div>
    ) : null;

    return (
        <div className="mt-12 pt-8 border-t-2 border-stone-200">
            <h2 className="text-2xl font-black text-black mb-6">Apoia o Projeto</h2>
            
            <div className="bg-gradient-to-br from-[#FFEA00]/20 to-[#FFDD00]/40 border-2 border-[#FFDD00] border-b-8 rounded-3xl p-8 text-center transition-all hover:-translate-y-1">
                <div className="text-6xl mb-4">☕</div>
                
                <h3 className="text-xl font-black text-stone-800 mb-2">
                    Paga um café ao Miguel!
                </h3>
                
                <p className="text-stone-600 font-medium mb-6">
                    Esta app é mantida com muito amor e cafeína. Se estás a gostar de aprender, ajuda a manter os servidores ligados!
                </p>
                
                <button 
                    onClick={onSupportClick}
                    className="block w-full bg-[#FFDD00] text-yellow-900 border-2 border-yellow-400 border-b-8 active:translate-y-2 active:border-b-0 hover:bg-[#FFEA00] rounded-2xl py-4 font-black text-lg transition-all text-center uppercase cursor-pointer"
                >
                    APOIAR O DESENVOLVEDOR
                </button>
            </div>

            {mounted && createPortal(modalContent, document.body)}
        </div>
    );
};
