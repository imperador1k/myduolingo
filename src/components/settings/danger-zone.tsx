"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { AlertCircle } from "lucide-react";

export const DangerZone = () => {
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [confirmationText, setConfirmationText] = useState("");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const isConfirmed = confirmationText === "CONFIRMO";

    const handleDelete = () => {
        if (!isConfirmed) return;
        // TODO: Call server action to delete user data
        console.log("Delete account triggered");
    };

    const handleClose = () => {
        setIsDeleteModalOpen(false);
        setConfirmationText("");
    };

    const modalContent = (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity"
                onClick={handleClose}
            />
            
            {/* Modal Content */}
            <div className="relative w-full max-w-md bg-white border-2 border-slate-200 border-b-8 rounded-[2rem] p-6 sm:p-8 text-center shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Decorative background glowing circle */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-red-100 rounded-full opacity-50 blur-xl"></div>
                
                <div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-red-100 border-4 border-red-50 mb-6 shadow-sm">
                    <AlertCircle className="h-12 w-12 text-red-600" strokeWidth={2.5} />
                </div>
                
                <h2 className="text-3xl font-black text-slate-800 mb-3 tracking-tight">
                    Apagar Conta?
                </h2>
                
                <p className="text-slate-500 font-medium mb-6 leading-relaxed">
                    Esta ação é <span className="font-bold text-red-500">irreversível</span>. Vais perder instantaneamente todo o teu progresso, XP, ligas e histórico.
                </p>

                <div className="bg-slate-50 border-2 border-slate-100 rounded-2xl p-5 mb-8 text-left shadow-inner">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                        Para confirmar, escreve <span className="text-red-500">CONFIRMO</span>
                    </label>
                    <input 
                        type="text"
                        value={confirmationText}
                        onChange={(e) => setConfirmationText(e.target.value)}
                        placeholder="CONFIRMO"
                        className="w-full bg-white border-2 border-slate-200 rounded-xl px-4 py-3 text-base font-bold text-slate-700 outline-none focus:border-red-400 focus:ring-4 focus:ring-red-100 transition-all font-mono placeholder:text-slate-300"
                    />
                </div>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={handleDelete}
                        disabled={!isConfirmed}
                        className={`w-full font-black uppercase tracking-wider py-4 rounded-2xl border-b-4 transition-all ${
                            isConfirmed 
                                ? "bg-red-500 text-white border-red-700 hover:bg-red-400 active:translate-y-1 active:border-b-0 shadow-lg shadow-red-200" 
                                : "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-70"
                        }`}
                    >
                        Sim, Apagar Conta
                    </button>
                    <button
                        onClick={handleClose}
                        className="w-full bg-white text-slate-500 font-bold uppercase tracking-wider py-4 rounded-2xl border-2 border-slate-200 border-b-4 hover:bg-slate-50 hover:text-slate-600 active:translate-y-1 active:border-b-0 transition-all"
                    >
                        Manter a minha conta
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="mt-12 bg-red-50/50 border-2 border-red-100 rounded-3xl p-6 md:p-8 mb-12">
            <h3 className="text-xl font-black text-red-600 mb-2">Zona de Perigo</h3>
            <p className="text-sm font-medium text-red-500/80 mb-6 max-w-md">
                Atenção: Ao apagares a tua conta, perdes todo o XP, Ligas e o teu lugar no MyDuolingo. Esta ação é irreversível.
            </p>

            <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="bg-white text-red-600 border-2 border-red-200 border-b-6 font-black uppercase tracking-wider rounded-2xl px-6 py-4 hover:bg-red-50 active:translate-y-1 active:border-b-0 transition-all w-full md:w-auto"
            >
                🗑️ APAGAR A MINHA CONTA
            </button>

            {isDeleteModalOpen && mounted && createPortal(modalContent, document.body)}
        </div>
    );
};
