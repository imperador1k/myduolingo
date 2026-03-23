"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Zap, Shield, Snowflake, Sparkles, Heart } from "lucide-react";
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

type Props = {
    hearts: number;
    points: number;
    xpBoostLessons: number;
    heartShields: number;
    streakFreezes: number;
};

type PurchasePopup = {
    show: boolean;
    icon: string;
    title: string;
    description: string;
    color: string;
};

export const ShopItems = ({ hearts, points, xpBoostLessons, heartShields, streakFreezes }: Props) => {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [popup, setPopup] = useState<PurchasePopup | null>(null);
    const [confirmModal, setConfirmModal] = useState<{
        show: boolean;
        action: () => Promise<any>;
        popupData: { icon: string; title: string; description: string; color: string };
        errorMapping: Record<string, string>;
        cost: number;
        itemName: string;
    } | null>(null);

    const { playWhoosh, playReward } = useUISounds();

    const showPurchasePopup = (icon: string, title: string, description: string, color: string) => {
        setPopup({ show: true, icon, title, description, color });
    };

    const closePopup = () => {
        setPopup(null);
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
                    if ('error' in result) {
                        setError(errorMapping[result.error] || "Erro desconhecido");
                    } else {
                        playReward();
                        showPurchasePopup(popupData.icon, popupData.title, popupData.description, popupData.color);
                    }
                })
                .catch(console.error)
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
            {/* Purchase Confirmation Modal */}
            {confirmModal && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="mx-4 w-full max-w-sm rounded-[2rem] bg-white p-8 shadow-2xl animate-in zoom-in-95 duration-300 border-b-4 border-slate-200">
                        <h2 className="mb-2 text-2xl font-extrabold text-slate-800 tracking-tight text-center">
                            Confirmar Compra
                        </h2>
                        <p className="mb-8 text-slate-500 font-medium text-center text-lg leading-snug">
                            Queres gastar <span className="font-extrabold text-amber-500">{confirmModal.cost} XP</span> para comprar <span className="font-extrabold text-slate-700">{confirmModal.itemName}</span>?
                        </p>

                        <div className="flex flex-col gap-3">
                            <Button
                                variant="primary"
                                size="lg"
                                className="w-full h-12 text-lg rounded-xl uppercase tracking-wider"
                                onClick={confirmPurchase}
                            >
                                Comprar
                            </Button>
                            <Button
                                variant="secondary"
                                size="lg"
                                className="w-full h-12 text-lg rounded-xl uppercase tracking-wider bg-slate-50 border-2 border-slate-200 text-slate-500 hover:bg-slate-100"
                                onClick={() => setConfirmModal(null)}
                            >
                                Cancelar
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Gamified Purchase Success Modal */}
            <PurchaseSuccessModal
                isOpen={!!popup?.show}
                onClose={closePopup}
                icon={popup?.icon || ""}
                title={popup?.title || ""}
                description={popup?.description || ""}
                color={popup?.color || "bg-sky-100"}
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
                    <div className="rounded-[2rem] border-2 border-emerald-200 bg-emerald-50 p-6 ring-4 ring-emerald-500/20 shadow-sm transition-all mb-8 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-[200%] skew-x-[45deg] animate-[progress-indeterminate_3s_infinite] opacity-50" />
                        <h3 className="mb-4 font-extrabold text-emerald-700 flex items-center gap-2 text-xl tracking-tight">
                            <Sparkles className="h-6 w-6 text-emerald-500 animate-pulse" />
                            Aura Ativa
                        </h3>
                        <div className="flex flex-wrap gap-4 relative z-10">
                            {xpBoostLessons > 0 && (
                                <div className="flex items-center gap-3 rounded-2xl bg-white border-2 border-purple-100 px-5 py-3 shadow-md transition-transform hover:-translate-y-1">
                                    <div className="bg-purple-100 p-2 rounded-xl"><Zap className="h-6 w-6 text-purple-500 fill-purple-200" /></div>
                                    <span className="text-base font-bold text-slate-700">{xpBoostLessons} Lições de <span className="text-purple-600 font-extrabold">XP Duplo</span></span>
                                </div>
                            )}
                            {heartShields > 0 && (
                                <div className="flex items-center gap-3 rounded-2xl bg-white border-2 border-sky-100 px-5 py-3 shadow-md transition-transform hover:-translate-y-1">
                                    <div className="bg-sky-100 p-2 rounded-xl"><Shield className="h-6 w-6 text-sky-500 fill-sky-200" /></div>
                                    <span className="text-base font-bold text-slate-700">{heartShields} <span className="text-sky-600 font-extrabold">Escudos Protetores</span></span>
                                </div>
                            )}
                            {streakFreezes > 0 && (
                                <div className="flex items-center gap-3 rounded-2xl bg-white border-2 border-cyan-100 px-5 py-3 shadow-md transition-transform hover:-translate-y-1">
                                    <div className="bg-cyan-100 p-2 rounded-xl"><Snowflake className="h-6 w-6 text-cyan-500 fill-cyan-200" /></div>
                                    <span className="text-base font-bold text-slate-700">{streakFreezes} <span className="text-cyan-600 font-extrabold">Dias Congelados</span></span>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="text-center italic text-slate-400 py-4 mb-8 text-sm font-medium bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                        Nenhum power-up ativo no momento.
                    </div>
                )}

                {/* BENTO BOX STOREFRONT ITEMS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Buy 1 Heart */}
                    {hearts < 5 && (
                        <div className="flex w-full flex-col justify-between rounded-[2rem] border-2 border-b-8 border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-slate-300 hover:shadow-md hover:-translate-y-1 group">
                            <div className="flex items-start gap-4 mb-6">
                                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-rose-100 shadow-inner group-hover:scale-110 transition-transform">
                                    <Heart className="h-8 w-8 fill-rose-500 text-rose-500 drop-shadow-sm" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xl font-extrabold text-slate-800 tracking-tight">+1 Coração</span>
                                    <span className="text-base text-slate-500 font-medium leading-snug mt-1">Recupera uma vida para continuares a jogar e aprender.</span>
                                </div>
                            </div>
                            <button
                                disabled={!canBuyOneHeart || isPending}
                                onClick={() => initiatePurchase(onBuyOneHeart, { icon: "❤️", title: "+1 Coração!", description: "O teu coração foi adicionado com sucesso.", color: "bg-rose-100" }, { "not_enough_xp": "Precisas de 20 XP" }, 20, "+1 Coração")}
                                className={cn("flex w-full items-center justify-center gap-3 rounded-2xl py-4 font-extrabold text-lg transition-all disabled:pointer-events-none mt-auto", canBuyOneHeart ? "border-2 border-b-4 border-green-600 bg-green-500 text-white active:border-b-2 active:translate-y-[2px] shadow-sm hover:bg-green-400" : "border-2 border-b-4 border-gray-400 bg-gray-300 text-gray-500")}
                            >
                                <span className="tracking-wide">COMPRAR POR 20</span>
                                <span className={cn("text-xl drop-shadow-md", canBuyOneHeart ? "text-amber-300" : "text-gray-400 grayscale")}>⚡</span>
                            </button>
                        </div>
                    )}

                    {/* Refill All Hearts */}
                    {hearts === 0 && (
                        <div className="flex w-full flex-col justify-between rounded-[2rem] border-2 border-b-8 border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-slate-300 hover:shadow-md hover:-translate-y-1 group">
                            <div className="flex items-start gap-4 mb-6">
                                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-amber-100 shadow-inner group-hover:scale-110 transition-transform">
                                    <Heart className="h-8 w-8 text-amber-500 fill-amber-500 drop-shadow-sm" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xl font-extrabold text-slate-800 tracking-tight">Recarga Total</span>
                                    <span className="text-base text-slate-500 font-medium leading-snug mt-1">Enche os teus 5 corações instantaneamente.</span>
                                </div>
                            </div>
                            <button
                                disabled={!canRefill || isPending}
                                onClick={() => initiatePurchase(onRefillHearts, { icon: "💖", title: "Corações Cheios!", description: "A tua vida foi totalmente restaurada.", color: "bg-rose-100" }, { "not_enough_xp": "Precisas de 100 XP" }, 100, "Recarga Completa")}
                                className={cn("flex w-full items-center justify-center gap-3 rounded-2xl py-4 font-extrabold text-lg transition-all disabled:pointer-events-none mt-auto", canRefill ? "border-2 border-b-4 border-amber-600 bg-amber-500 text-white active:border-b-2 active:translate-y-[2px] shadow-sm hover:bg-amber-400" : "border-2 border-b-4 border-gray-400 bg-gray-300 text-gray-500")}
                            >
                                <span className="tracking-wide">COMPRAR POR 100</span>
                                <span className={cn("text-xl drop-shadow-md", canRefill ? "text-amber-200" : "text-gray-400 grayscale")}>⚡</span>
                            </button>
                        </div>
                    )}

                    {/* Max Hearts Reached State */}
                    {hearts === 5 && (
                        <div className="flex w-full flex-col justify-between rounded-[2rem] border-2 border-b-8 border-rose-100 bg-rose-50/60 p-6 shadow-inner opacity-90 cursor-default">
                             <div className="flex items-start gap-4 mb-6">
                                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-rose-100">
                                    <Heart className="h-8 w-8 fill-rose-500 text-rose-500" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xl font-extrabold text-slate-800 tracking-tight">Corações Cheios</span>
                                    <span className="text-base text-slate-500 font-medium mt-1">As tuas vidas estão no máximo. Vai praticar!</span>
                                </div>
                            </div>
                            <div className="w-full text-center py-4 font-black uppercase tracking-[0.2em] text-rose-400 bg-rose-100/50 rounded-2xl border-2 border-dashed border-rose-200">
                                NO MÁXIMO
                            </div>
                        </div>
                    )}

                    {/* XP Boost */}
                    <div className="flex w-full flex-col justify-between rounded-[2rem] border-2 border-b-8 border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-slate-300 hover:shadow-md hover:-translate-y-1 group">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-purple-100 shadow-inner group-hover:scale-110 transition-transform">
                                <Zap className="h-8 w-8 text-purple-600 fill-purple-300 drop-shadow-sm" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xl font-extrabold text-slate-800 tracking-tight">XP Duplo</span>
                                <span className="text-base text-slate-500 font-medium mt-1">+5 lições consecutivas com recompensa dupla (20 XP).</span>
                            </div>
                        </div>
                        <button
                            disabled={!canBuyXpBoost || isPending}
                            onClick={() => initiatePurchase(onBuyXpBoost, { icon: "⚡", title: "XP Duplo Ativado!", description: "As tuas próximas 5 lições darão XP em dobro!", color: "bg-purple-100" }, { "not_enough_xp": "Precisas de 150 XP" }, 150, "XP Duplo")}
                            className={cn("flex w-full items-center justify-center gap-3 rounded-2xl py-4 font-extrabold text-lg transition-all disabled:pointer-events-none mt-auto", canBuyXpBoost ? "border-2 border-b-4 border-green-600 bg-green-500 text-white active:border-b-2 active:translate-y-[2px] shadow-sm hover:bg-green-400" : "border-2 border-b-4 border-gray-400 bg-gray-300 text-gray-500")}
                        >
                            <span className="tracking-wide">COMPRAR POR 150</span>
                            <span className={cn("text-xl drop-shadow-md", canBuyXpBoost ? "text-amber-300" : "text-gray-400 grayscale")}>⚡</span>
                        </button>
                    </div>

                    {/* Heart Shield */}
                    <div className="flex w-full flex-col justify-between rounded-[2rem] border-2 border-b-8 border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-slate-300 hover:shadow-md hover:-translate-y-1 group md:col-span-2 lg:col-span-1">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-sky-100 shadow-inner group-hover:scale-110 transition-transform">
                                <Shield className="h-8 w-8 text-sky-600 fill-sky-300 drop-shadow-sm" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xl font-extrabold text-slate-800 tracking-tight">Escudo Protetor</span>
                                <span className="text-base text-slate-500 font-medium mt-1">Protege a perda de 1 coração durante um erro na lição.</span>
                            </div>
                        </div>
                        <button
                            disabled={!canBuyHeartShield || isPending}
                            onClick={() => initiatePurchase(onBuyHeartShield, { icon: "🛡️", title: "Escudo Adquirido!", description: "Tens agora um Escudo Protetor no teu Inventário.", color: "bg-sky-100" }, { "not_enough_xp": "Precisas de 100 XP" }, 100, "Escudo de Coração")}
                            className={cn("flex w-full items-center justify-center gap-3 rounded-2xl py-4 font-extrabold text-lg transition-all disabled:pointer-events-none mt-auto", canBuyHeartShield ? "border-2 border-b-4 border-green-600 bg-green-500 text-white active:border-b-2 active:translate-y-[2px] shadow-sm hover:bg-green-400" : "border-2 border-b-4 border-gray-400 bg-gray-300 text-gray-500")}
                        >
                            <span className="tracking-wide">COMPRAR POR 100</span>
                            <span className={cn("text-xl drop-shadow-md", canBuyHeartShield ? "text-amber-300" : "text-gray-400 grayscale")}>⚡</span>
                        </button>
                    </div>

                    {/* Streak Freeze */}
                    <div className="flex w-full flex-col justify-between rounded-[2rem] border-2 border-b-8 border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-slate-300 hover:shadow-md hover:-translate-y-1 group md:col-span-2 lg:col-span-1">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-cyan-100 shadow-inner group-hover:scale-110 transition-transform">
                                <Snowflake className="h-8 w-8 text-cyan-600 fill-cyan-300 drop-shadow-sm" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xl font-extrabold text-slate-800 tracking-tight">Congelação (Freeze)</span>
                                <span className="text-base text-slate-500 font-medium mt-1">Protege a tua ofensiva (streak) de ser interrompida por um dia.</span>
                            </div>
                        </div>
                        <button
                            disabled={!canBuyStreakFreeze || isPending}
                            onClick={() => initiatePurchase(onBuyStreakFreeze, { icon: "❄️", title: "Freeze Adquirido!", description: "A tua Streak está protegida contra acidentes! 🔥", color: "bg-cyan-100" }, { "not_enough_xp": "Precisas de 300 XP" }, 300, "Streak Freeze")}
                            className={cn("flex w-full items-center justify-center gap-3 rounded-2xl py-4 font-extrabold text-lg transition-all disabled:pointer-events-none mt-auto", canBuyStreakFreeze ? "border-2 border-b-4 border-green-600 bg-green-500 text-white active:border-b-2 active:translate-y-[2px] shadow-sm hover:bg-green-400" : "border-2 border-b-4 border-gray-400 bg-gray-300 text-gray-500")}
                        >
                            <span className="tracking-wide">COMPRAR POR 300</span>
                            <span className={cn("text-xl drop-shadow-md", canBuyStreakFreeze ? "text-amber-300" : "text-gray-400 grayscale")}>⚡</span>
                        </button>
                    </div>

                </div>

                {/* Footer Tip */}
                <div className="mt-10 rounded-[2rem] border-2 border-slate-100 bg-slate-50 p-8 text-center shadow-sm">
                    <p className="font-extrabold text-slate-700 flex items-center justify-center gap-2 mb-2 text-lg">
                        💡 Ganha XP nas lições!
                    </p>
                    <p className="text-base text-slate-500 font-medium">+10 XP por cada resposta correta (+20 XP com <span className="text-purple-600 font-bold">XP Duplo</span>).</p>
                </div>
            </div>
        </>
    );
};
