"use client";

import { useState, useTransition, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Zap, Shield, Snowflake, Sparkles, Heart, Infinity } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    onRefillHearts,
    onBuyOneHeart,
    onBuyXpBoost,
    onBuyHeartShield,
    onBuyStreakFreeze
} from "@/actions/user-progress";
import { useUISounds } from "@/hooks/use-ui-sounds";
import { PurchaseSuccessModal } from "@/components/modals/purchase-success-modal";
import { usePurchaseStore } from "@/store/use-purchase-store";
import { useProModalStore } from "@/store/use-pro-modal-store";

type Props = {
    hearts: number;
    points: number;
    xpBoostLessons: number;
    heartShields: number;
    streakFreezes: number;
    isPro: boolean;
};

type PurchasePopup = {
    show: boolean;
    icon: string;
    title: string;
    description: string;
    color: string;
};

export const ShopItems = ({ hearts, points, xpBoostLessons, heartShields, streakFreezes, isPro }: Props) => {
    const router = useRouter();
    const { isOpen, data: popupData, open: openPopup, close: closePopupStore } = usePurchaseStore();
    const { openModal: openProModal } = useProModalStore();
    
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [confirmModal, setConfirmModal] = useState<{
        show: boolean;
        action: () => Promise<any>;
        popupData: { icon: string; title: string; description: string; color: string };
        errorMapping: Record<string, string>;
        cost: number;
        itemName: string;
    } | null>(null);

    const { playWhoosh, playReward } = useUISounds();

    const closePopup = () => {
        closePopupStore();
        router.refresh();
    };

    const initiatePurchase = (
        action: () => Promise<any>,
        popupData: { icon: string; title: string; description: string; color: string },
        errorMapping: Record<string, string>,
        cost: number,
        itemName: string
    ) => {
        playWhoosh();
        setConfirmModal({
            show: true,
            action,
            popupData,
            errorMapping,
            cost,
            itemName
        });
    };

    const confirmPurchase = () => {
        if (!confirmModal) return;

        const { action, popupData, errorMapping } = confirmModal;

        setError(null);
        startTransition(() => {
            action()
                .then((result) => {
                    if (result && 'message' in result && !result.success) {
                        setError(result.message);
                    } else {
                        // Success!
                        playReward();
                        // Delay opening the popup slightly to ensure revalidation doesn't clash with state
                        setTimeout(() => {
                            openPopup(popupData);
                        }, 100);
                    }
                })
                .catch((err) => {
                    console.error(err);
                    setError("Ocorreu um erro ao processar a compra.");
                })
                .finally(() => {
                    setConfirmModal(null);
                });
        });
    };

    const canBuyOneHeart = points >= 20 && hearts < 5;
    const canRefill = points >= 100 && hearts === 0;
    const canBuyXpBoost = points >= 150;
    const canBuyHeartShield = points >= 100;
    const canBuyStreakFreeze = points >= 300;

    return (
        <>
            {/* Purchase Confirmation Modal (Portaled for Global Blur) */}
            {confirmModal && typeof document !== "undefined" && createPortal(
                <div className="fixed inset-0 z-[999] flex items-center justify-center bg-stone-900/60 backdrop-blur-md animate-in fade-in duration-300 px-4">
                    <div className="w-full max-w-[420px] rounded-[2.5rem] bg-white p-8 md:p-10 shadow-2xl animate-in zoom-in-95 duration-300 border-2 border-stone-200 border-b-8 relative overflow-hidden">
                        {/* Decorative background element */}
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-50 rounded-full blur-3xl opacity-50" />
                        
                        <div className="relative z-10">
                            <h2 className="mb-4 text-3xl font-black text-stone-700 tracking-tight text-center leading-tight">
                                Confirmar Compra
                            </h2>
                            <p className="mb-10 text-stone-500 font-bold text-center text-lg md:text-xl leading-relaxed">
                                Queres gastar <span className="font-black text-amber-500 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200 shadow-sm">{confirmModal.cost} XP</span> para comprar 
                                <br/>
                                <span className="font-black text-stone-700 block mt-2 text-2xl uppercase tracking-tight">{confirmModal.itemName}</span>?
                            </p>

                            <div className="flex flex-col gap-4">
                                <button
                                    onClick={confirmPurchase}
                                    disabled={isPending}
                                    className="w-full h-16 md:h-20 bg-[#58cc02] text-white text-xl font-black rounded-2xl border-2 border-transparent border-b-8 border-b-[#46a302] hover:bg-[#61da02] active:border-b-0 active:translate-y-2 active:mb-[-8px] transition-all uppercase tracking-widest flex items-center justify-center gap-3 shadow-sm disabled:opacity-50"
                                >
                                    {isPending ? "A PROCESSAR..." : "COMPRAR"}
                                </button>
                                <button
                                    onClick={() => setConfirmModal(null)}
                                    className="w-full h-14 md:h-16 bg-white text-stone-400 text-lg font-black rounded-2xl border-2 border-stone-200 border-b-6 hover:bg-stone-50 hover:text-stone-600 active:border-b-0 active:translate-y-1 active:mb-[-4px] transition-all uppercase tracking-widest flex items-center justify-center shadow-sm"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Gamified Purchase Success Modal (Now Persistent via Global Store) */}
            <PurchaseSuccessModal
                isOpen={isOpen}
                onClose={closePopup}
                icon={popupData?.icon || ""}
                title={popupData?.title || ""}
                description={popupData?.description || ""}
                color={popupData?.color || "bg-sky-100"}
            />

            <div className="space-y-6">
                {/* Error Message */}
                {error && (
                    <div className="rounded-2xl bg-rose-100 p-4 text-center sm:text-lg font-bold text-rose-600 shadow-sm border-2 border-rose-200 animate-in slide-in-from-top-4">
                        ❌ {error}
                    </div>
                )}

                {/* Active Power-ups Banner */}
                {(xpBoostLessons > 0 || heartShields > 0 || streakFreezes > 0) ? (
                    <div className="rounded-[2rem] border-2 border-emerald-200 border-b-8 bg-emerald-50 p-6 md:p-8 shadow-sm transition-all mb-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-200 rounded-full blur-3xl opacity-30 -z-10 translate-x-10 -translate-y-10" />
                        <h3 className="mb-6 font-black text-emerald-700 flex items-center gap-2 text-lg md:text-xl uppercase tracking-widest">
                            <Sparkles className="h-6 w-6 text-emerald-500 animate-pulse" />
                            Aura Ativa
                        </h3>
                        <div className="flex flex-wrap gap-4 relative z-10">
                            {xpBoostLessons > 0 && (
                                <div className="flex items-center gap-3 rounded-2xl bg-white border-2 border-purple-200 border-b-4 px-5 py-3 shadow-sm transition-transform hover:-translate-y-0.5">
                                    <div className="bg-purple-50 border-2 border-purple-100 p-2 text-purple-600 rounded-xl"><Zap className="h-5 w-5 fill-purple-200" /></div>
                                    <span className="text-sm md:text-base font-bold text-stone-600">{xpBoostLessons} Lições de <span className="text-purple-600 font-black uppercase tracking-wider text-xs md:text-sm">XP Duplo</span></span>
                                </div>
                            )}
                            {heartShields > 0 && (
                                <div className="flex items-center gap-3 rounded-2xl bg-white border-2 border-sky-200 border-b-4 px-5 py-3 shadow-sm transition-transform hover:-translate-y-0.5">
                                    <div className="bg-sky-50 border-2 border-sky-100 p-2 text-sky-600 rounded-xl"><Shield className="h-5 w-5 fill-sky-200" /></div>
                                    <span className="text-sm md:text-base font-bold text-stone-600">{heartShields} <span className="text-sky-600 font-black uppercase tracking-wider text-xs md:text-sm">Escudos Protetores</span></span>
                                </div>
                            )}
                            {streakFreezes > 0 && (
                                <div className="flex items-center gap-3 rounded-2xl bg-white border-2 border-cyan-200 border-b-4 px-5 py-3 shadow-sm transition-transform hover:-translate-y-0.5">
                                    <div className="bg-cyan-50 border-2 border-cyan-100 p-2 text-cyan-600 rounded-xl"><Snowflake className="h-5 w-5 fill-cyan-200" /></div>
                                    <span className="text-sm md:text-base font-bold text-stone-600">{streakFreezes} <span className="text-cyan-600 font-black uppercase tracking-wider text-xs md:text-sm">Dias Congelados</span></span>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="text-center italic text-stone-400 py-6 mb-8 text-sm md:text-base font-bold bg-stone-50 rounded-[2rem] border-2 border-dashed border-stone-200">
                        Nenhum power-up ativo no momento.
                    </div>
                )}

                {/* ===== SUPER PRO BANNER ===== */}
                <div 
                    onClick={openProModal}
                    className="relative mb-8 flex w-full cursor-pointer flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden rounded-[2rem] border-2 border-amber-200 border-b-8 bg-gradient-to-tr from-amber-400 via-yellow-200 to-amber-500 p-6 md:p-8 shadow-sm transition-all hover:-translate-y-1 hover:border-b-[10px] active:translate-y-2 active:border-b-0 group"
                >
                    {/* Shimmer sweep animation overlay */}
                    <div className="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-[150%] animate-[shimmer_3s_infinite_ease-in-out_2s] skew-x-12" />

                    <div className="relative z-10 flex items-center gap-6">
                        <div className="flex shrink-0 items-center justify-center -mt-2 group-hover:-translate-y-2 transition-transform duration-500">
                            <img src="/mascot.svg" alt="Mascote PRO" className="w-24 h-24 md:w-28 md:h-28 drop-shadow-xl" />
                        </div>
                        <div className="flex flex-col text-stone-800">
                            <span className="text-2xl md:text-3xl font-black tracking-tight drop-shadow-sm flex items-center gap-2">
                                Liga o SUPER PRO <Sparkles className="h-6 w-6 text-amber-100 fill-amber-100 animate-pulse" />
                            </span>
                            <span className="text-base font-bold text-amber-900/80 leading-snug mt-1">
                                Corações ilimitados e sem anúncios! Chega ao topo hoje.
                            </span>
                        </div>
                    </div>
                    <button className="relative z-10 shrink-0 h-14 md:h-16 px-8 rounded-2xl bg-white text-amber-500 font-black uppercase tracking-widest border-2 border-transparent border-b-4 border-b-amber-200 group-hover:bg-amber-50 shadow-sm transition-colors text-lg flex items-center justify-center">
                        VER VANTAGENS
                    </button>
                    {/* Simple keyframes for the shimmer animation are added locally using styled-jsx */}
                    <style jsx>{`
                        @keyframes shimmer {
                            100% { transform: translateX(150%) skewX(12deg); }
                        }
                    `}</style>
                </div>

                {/* BENTO BOX STOREFRONT ITEMS */}
                <div className="grid grid-cols-1 gap-6">
                    
                    {/* PRO Hearts State */}
                    {isPro && (
                        <div className="flex w-full flex-col md:flex-row md:items-center justify-between gap-6 rounded-[2rem] border-2 border-b-8 border-rose-200 bg-rose-50/60 p-6 md:p-8 cursor-default overflow-hidden group relative">
                             <div className="absolute top-0 right-0 w-32 h-32 bg-rose-100 rounded-full blur-3xl opacity-50 -z-10 translate-x-10 -translate-y-10" />
                             <div className="flex items-center gap-6">
                                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[1.5rem] border-2 border-b-4 border-rose-100 bg-rose-50 group-hover:rotate-12 transition-transform">
                                    <Infinity className="h-10 w-10 text-rose-500" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-2xl font-black text-stone-700 tracking-tight">Vidas Infinitas</span>
                                    <span className="text-base text-stone-500 font-medium mt-1">És um utilizador PRO! Erra à vontade e aprende sem limites.</span>
                                </div>
                            </div>
                            <div className="shrink-0 text-center py-4 px-8 font-black uppercase tracking-[0.2em] text-white bg-rose-500 rounded-2xl border-2 border-transparent border-b-4 border-b-rose-700 shadow-sm">
                                ATIVO
                            </div>
                        </div>
                    )}

                    {/* Buy 1 Heart */}
                    {!isPro && hearts < 5 && (
                        <div className="flex w-full flex-col md:flex-row md:items-center justify-between gap-6 rounded-[2rem] border-2 border-b-8 border-stone-200 bg-white p-6 md:p-8 shadow-sm transition-all hover:border-b-[10px] hover:mb-[-2px] group">
                            <div className="flex items-center gap-6">
                                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[1.5rem] border-2 border-b-4 border-rose-200 bg-rose-50 shadow-inner group-hover:-translate-y-1 transition-transform">
                                    <Heart className="h-10 w-10 fill-rose-500 text-rose-500 drop-shadow-sm" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-2xl font-black text-stone-700 tracking-tight">+1 Coração</span>
                                    <span className="text-base text-stone-500 font-medium leading-snug mt-1">Recupera uma vida para continuares a jogar e a aprender.</span>
                                </div>
                            </div>
                            <button
                                disabled={!canBuyOneHeart || isPending}
                                onClick={() => initiatePurchase(onBuyOneHeart, { icon: "❤️", title: "+1 Coração!", description: "O teu coração foi adicionado com sucesso.", color: "bg-rose-100" }, { "not_enough_xp": "Precisas de 20 XP" }, 20, "+1 Coração")}
                                className={cn("shrink-0 h-16 md:h-20 min-w-[200px] px-8 py-4 font-black rounded-2xl text-lg md:text-xl uppercase tracking-widest transition-all flex items-center justify-center gap-3", canBuyOneHeart ? "bg-[#58cc02] text-white border-2 border-transparent border-b-8 border-b-[#46a302] hover:bg-[#61da02] active:border-b-0 active:translate-y-2 active:mb-[-8px] shadow-sm" : "bg-stone-200 text-stone-400 border-2 border-transparent border-b-4 border-b-stone-300 pointer-events-none")}
                            >
                                <span className={cn(canBuyOneHeart ? "drop-shadow-sm" : "")}>COMPRAR</span>
                                <span className={cn("text-xl md:text-2xl drop-shadow-sm font-black", canBuyOneHeart ? "text-amber-300" : "text-stone-300 grayscale")}>⚡ 20</span>
                            </button>
                        </div>
                    )}

                    {/* Refill All Hearts */}
                    {!isPro && hearts === 0 && (
                        <div className="flex w-full flex-col md:flex-row md:items-center justify-between gap-6 rounded-[2rem] border-2 border-b-8 border-stone-200 bg-white p-6 md:p-8 shadow-sm transition-all hover:border-b-[10px] hover:mb-[-2px] group">
                            <div className="flex items-center gap-6">
                                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[1.5rem] border-2 border-b-4 border-amber-200 bg-amber-50 shadow-inner group-hover:-translate-y-1 transition-transform">
                                    <Heart className="h-10 w-10 text-amber-500 fill-amber-500 drop-shadow-sm" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-2xl font-black text-stone-700 tracking-tight">Recarga Total</span>
                                    <span className="text-base text-stone-500 font-medium leading-snug mt-1">Enche os teus 5 corações instantaneamente.</span>
                                </div>
                            </div>
                            <button
                                disabled={!canRefill || isPending}
                                onClick={() => initiatePurchase(onRefillHearts, { icon: "💖", title: "Corações Cheios!", description: "A tua vida foi totalmente restaurada.", color: "bg-rose-100" }, { "not_enough_xp": "Precisas de 100 XP" }, 100, "Recarga Completa")}
                                className={cn("shrink-0 h-16 md:h-20 min-w-[200px] px-8 py-4 font-black rounded-2xl text-lg md:text-xl uppercase tracking-widest transition-all flex items-center justify-center gap-3", canRefill ? "bg-[#58cc02] text-white border-2 border-transparent border-b-8 border-b-[#46a302] hover:bg-[#61da02] active:border-b-0 active:translate-y-2 active:mb-[-8px] shadow-sm" : "bg-stone-200 text-stone-400 border-2 border-transparent border-b-4 border-b-stone-300 pointer-events-none")}
                            >
                                <span className={cn(canRefill ? "drop-shadow-sm" : "")}>COMPRAR</span>
                                <span className={cn("text-xl md:text-2xl drop-shadow-sm font-black", canRefill ? "text-amber-300" : "text-stone-300 grayscale")}>⚡ 100</span>
                            </button>
                        </div>
                    )}

                    {/* Max Hearts Reached State */}
                    {!isPro && hearts === 5 && (
                        <div className="flex w-full flex-col md:flex-row md:items-center justify-between gap-6 rounded-[2rem] border-2 border-b-8 border-rose-200 bg-rose-50/60 p-6 md:p-8 cursor-default opacity-80 decoration-rose-200 grayscale-[20%]">
                             <div className="flex items-center gap-6">
                                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[1.5rem] border-2 border-b-4 border-rose-100 bg-rose-50">
                                    <Heart className="h-10 w-10 fill-rose-500 text-rose-500" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-2xl font-black text-stone-700 tracking-tight">Corações Cheios</span>
                                    <span className="text-base text-stone-500 font-medium mt-1">As tuas vidas estão no máximo. Vai praticar!</span>
                                </div>
                            </div>
                            <div className="shrink-0 text-center py-4 px-8 font-black uppercase tracking-[0.2em] text-rose-400 bg-rose-100 rounded-2xl border-2 border-dashed border-rose-200 border-b-4">
                                NO MÁXIMO
                            </div>
                        </div>
                    )}

                    {/* XP Boost */}
                    <div className="flex w-full flex-col md:flex-row md:items-center justify-between gap-6 rounded-[2rem] border-2 border-b-8 border-stone-200 bg-white p-6 md:p-8 shadow-sm transition-all hover:border-b-[10px] hover:mb-[-2px] group">
                        <div className="flex items-center gap-6">
                            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[1.5rem] border-2 border-b-4 border-purple-200 bg-purple-50 shadow-inner group-hover:-translate-y-1 transition-transform">
                                <Zap className="h-10 w-10 text-purple-600 fill-purple-300 drop-shadow-sm" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-2xl font-black text-stone-700 tracking-tight">XP Duplo</span>
                                <span className="text-base text-stone-500 font-medium mt-1">+5 lições consecutivas com recompensa dupla (20 XP).</span>
                            </div>
                        </div>
                        <button
                            disabled={!canBuyXpBoost || isPending}
                            onClick={() => initiatePurchase(onBuyXpBoost, { icon: "⚡", title: "XP Duplo Ativado!", description: "As tuas próximas 5 lições darão XP em dobro!", color: "bg-purple-100" }, { "not_enough_xp": "Precisas de 150 XP" }, 150, "XP Duplo")}
                            className={cn("shrink-0 h-16 md:h-20 min-w-[200px] px-8 py-4 font-black rounded-2xl text-lg md:text-xl uppercase tracking-widest transition-all flex items-center justify-center gap-3", canBuyXpBoost ? "bg-[#58cc02] text-white border-2 border-transparent border-b-8 border-b-[#46a302] hover:bg-[#61da02] active:border-b-0 active:translate-y-2 active:mb-[-8px] shadow-sm" : "bg-stone-200 text-stone-400 border-2 border-transparent border-b-4 border-b-stone-300 pointer-events-none")}
                        >
                            <span className={cn(canBuyXpBoost ? "drop-shadow-sm" : "")}>COMPRAR</span>
                            <span className={cn("text-xl md:text-2xl drop-shadow-sm font-black", canBuyXpBoost ? "text-amber-300" : "text-stone-300 grayscale")}>⚡ 150</span>
                        </button>
                    </div>

                    {/* Heart Shield */}
                    <div className="flex w-full flex-col md:flex-row md:items-center justify-between gap-6 rounded-[2rem] border-2 border-b-8 border-stone-200 bg-white p-6 md:p-8 shadow-sm transition-all hover:border-b-[10px] hover:mb-[-2px] group">
                        <div className="flex items-center gap-6">
                            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[1.5rem] border-2 border-b-4 border-sky-200 bg-sky-50 shadow-inner group-hover:-translate-y-1 transition-transform">
                                <Shield className="h-10 w-10 text-sky-600 fill-sky-300 drop-shadow-sm" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-2xl font-black text-stone-700 tracking-tight">Escudo Protetor</span>
                                <span className="text-base text-stone-500 font-medium mt-1">Protege a perda de 1 coração durante um erro na lição.</span>
                            </div>
                        </div>
                        <button
                            disabled={!canBuyHeartShield || isPending}
                            onClick={() => initiatePurchase(onBuyHeartShield, { icon: "🛡️", title: "Escudo Adquirido!", description: "Tens agora um Escudo Protetor no teu Inventário.", color: "bg-sky-100" }, { "not_enough_xp": "Precisas de 100 XP" }, 100, "Escudo de Coração")}
                            className={cn("shrink-0 h-16 md:h-20 min-w-[200px] px-8 py-4 font-black rounded-2xl text-lg md:text-xl uppercase tracking-widest transition-all flex items-center justify-center gap-3", canBuyHeartShield ? "bg-[#58cc02] text-white border-2 border-transparent border-b-8 border-b-[#46a302] hover:bg-[#61da02] active:border-b-0 active:translate-y-2 active:mb-[-8px] shadow-sm" : "bg-stone-200 text-stone-400 border-2 border-transparent border-b-4 border-b-stone-300 pointer-events-none")}
                        >
                            <span className={cn(canBuyHeartShield ? "drop-shadow-sm" : "")}>COMPRAR</span>
                            <span className={cn("text-xl md:text-2xl drop-shadow-sm font-black", canBuyHeartShield ? "text-amber-300" : "text-stone-300 grayscale")}>⚡ 100</span>
                        </button>
                    </div>

                    {/* Streak Freeze */}
                    <div className="flex w-full flex-col md:flex-row md:items-center justify-between gap-6 rounded-[2rem] border-2 border-b-8 border-stone-200 bg-white p-6 md:p-8 shadow-sm transition-all hover:border-b-[10px] hover:mb-[-2px] group">
                        <div className="flex items-center gap-6">
                            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[1.5rem] border-2 border-b-4 border-cyan-200 bg-cyan-50 shadow-inner group-hover:-translate-y-1 transition-transform">
                                <Snowflake className="h-10 w-10 text-cyan-600 fill-cyan-300 drop-shadow-sm" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-2xl font-black text-stone-700 tracking-tight">Congelação</span>
                                <span className="text-base text-stone-500 font-medium mt-1">Protege a tua ofensiva (streak) de ser interrompida por um dia.</span>
                            </div>
                        </div>
                        <button
                            disabled={!canBuyStreakFreeze || isPending}
                            onClick={() => initiatePurchase(onBuyStreakFreeze, { icon: "❄️", title: "Freeze Adquirido!", description: "A tua Streak está protegida contra acidentes! 🔥", color: "bg-cyan-100" }, { "not_enough_xp": "Precisas de 300 XP" }, 300, "Streak Freeze")}
                            className={cn("shrink-0 h-16 md:h-20 min-w-[200px] px-8 py-4 font-black rounded-2xl text-lg md:text-xl uppercase tracking-widest transition-all flex items-center justify-center gap-3", canBuyStreakFreeze ? "bg-[#58cc02] text-white border-2 border-transparent border-b-8 border-b-[#46a302] hover:bg-[#61da02] active:border-b-0 active:translate-y-2 active:mb-[-8px] shadow-sm" : "bg-stone-200 text-stone-400 border-2 border-transparent border-b-4 border-b-stone-300 pointer-events-none")}
                        >
                            <span className={cn(canBuyStreakFreeze ? "drop-shadow-sm" : "")}>COMPRAR</span>
                            <span className={cn("text-xl md:text-2xl drop-shadow-sm font-black", canBuyStreakFreeze ? "text-amber-300" : "text-stone-300 grayscale")}>⚡ 300</span>
                        </button>
                    </div>

                </div>

                {/* Footer Tip */}
                <div className="mt-10 rounded-[2rem] border-2 border-amber-300 border-b-4 bg-amber-100 p-8 text-center shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-32 h-32 bg-amber-200 rounded-full blur-3xl opacity-50 -z-10 -translate-x-10 -translate-y-10" />
                    <p className="font-black tracking-widest text-amber-600 uppercase flex items-center justify-center gap-2 mb-2 text-sm md:text-base">
                        💡 Ganha XP nas lições!
                    </p>
                    <p className="text-sm md:text-base text-amber-700/80 font-bold max-w-lg mx-auto leading-relaxed">+10 XP por cada resposta correta (+20 XP com <span className="text-purple-600 font-black">XP Duplo</span>).</p>
                </div>
            </div>
        </>
    );
};
