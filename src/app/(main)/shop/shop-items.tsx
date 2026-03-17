"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Zap, Shield, Snowflake, X, Sparkles, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    onRefillHearts,
    onBuyOneHeart,
    onBuyXpBoost,
    onBuyHeartShield,
    onBuyStreakFreeze
} from "@/actions/user-progress";
import { useUISounds } from "@/hooks/use-ui-sounds";

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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="mx-4 w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
                        <h2 className="mb-2 text-2xl font-bold text-slate-700">
                            Confirmar Compra
                        </h2>
                        <p className="mb-6 text-slate-500">
                            Queres gastar <span className="font-bold text-amber-500">{confirmModal.cost} XP</span> para comprar <span className="font-bold text-slate-700">{confirmModal.itemName}</span>?
                        </p>

                        <div className="flex gap-4">
                            <Button
                                variant="secondary"
                                size="lg"
                                className="w-full"
                                onClick={() => setConfirmModal(null)}
                            >
                                Cancelar
                            </Button>
                            <Button
                                variant="primary"
                                size="lg"
                                className="w-full"
                                onClick={confirmPurchase}
                            >
                                Confirmar
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Purchase Success Popup */}
            {popup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className={`mx-4 w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl animate-bounce`}>
                        <button
                            onClick={closePopup}
                            className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        <div className={`mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full ${popup.color}`}>
                            <span className="text-4xl">{popup.icon}</span>
                        </div>

                        <h2 className="mb-2 text-2xl font-bold text-slate-700">
                            {popup.title}
                        </h2>
                        <p className="mb-6 text-slate-500">
                            {popup.description}
                        </p>

                        <Button
                            variant="primary"
                            size="lg"
                            className="w-full"
                            onClick={closePopup}
                        >
                            Fixe! 🎉
                        </Button>
                    </div>
                </div>
            )}

            <div className="space-y-6">
                {/* Error Message */}
                {error && (
                    <div className="rounded-2xl bg-rose-100 p-4 text-center sm:text-lg font-bold text-rose-600 shadow-sm border-2 border-rose-200">
                        ❌ {error}
                    </div>
                )}

                {/* Active Power-ups Banner */}
                {(xpBoostLessons > 0 || heartShields > 0 || streakFreezes > 0) ? (
                    <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-5 ring-4 ring-emerald-500/20 shadow-sm transition-all mb-8">
                        <h3 className="mb-4 font-bold text-emerald-700 flex items-center gap-2 text-lg">
                            <Sparkles className="h-5 w-5" />
                            Aura Ativa
                        </h3>
                        <div className="flex flex-wrap gap-3">
                            {xpBoostLessons > 0 && (
                                <div className="flex items-center gap-2 rounded-xl bg-white border-2 border-purple-100 px-4 py-2 shadow-sm">
                                    <Zap className="h-5 w-5 text-purple-500" />
                                    <span className="text-sm font-bold text-slate-700">{xpBoostLessons} Lições de <span className="text-purple-600">XP Duplo</span></span>
                                </div>
                            )}
                            {heartShields > 0 && (
                                <div className="flex items-center gap-2 rounded-xl bg-white border-2 border-sky-100 px-4 py-2 shadow-sm">
                                    <Shield className="h-5 w-5 text-sky-500" />
                                    <span className="text-sm font-bold text-slate-700">{heartShields} <span className="text-sky-600">Escudos Protetores</span></span>
                                </div>
                            )}
                            {streakFreezes > 0 && (
                                <div className="flex items-center gap-2 rounded-xl bg-white border-2 border-cyan-100 px-4 py-2 shadow-sm">
                                    <Snowflake className="h-5 w-5 text-cyan-500" />
                                    <span className="text-sm font-bold text-slate-700">{streakFreezes} <span className="text-cyan-600">Dias Congelados</span></span>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="text-center italic text-slate-400 py-4 mb-8 text-sm">
                        Nenhum power-up ativo no momento.
                    </div>
                )}

                {/* STOREFRONT ITEMS */}
                <div className="space-y-4">
                    
                    {/* Buy 1 Heart */}
                    {hearts < 5 && (
                        <div className="flex w-full items-center justify-between rounded-2xl border-2 border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-slate-300">
                            <div className="flex items-center gap-4">
                                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-rose-100">
                                    <Heart className="h-7 w-7 fill-rose-500 text-rose-500" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-lg font-bold text-slate-700">+1 Coração</span>
                                    <span className="text-sm text-slate-500">Recupera uma vida para jogares.</span>
                                </div>
                            </div>
                            <button
                                disabled={!canBuyOneHeart || isPending}
                                onClick={() => initiatePurchase(
                                    onBuyOneHeart,
                                    { icon: "❤️", title: "+1 Coração!", description: "O teu coração foi adicionado.", color: "bg-rose-100" },
                                    { "not_enough_xp": "Precisas de 20 XP" },
                                    20,
                                    "+1 Coração"
                                )}
                                className={cn(
                                    "flex min-w-[90px] items-center justify-center gap-2 rounded-xl py-3 px-5 font-bold transition-all disabled:pointer-events-none",
                                    canBuyOneHeart 
                                        ? "border-2 border-b-4 border-green-600 bg-green-500 text-white active:border-b-2 active:translate-y-[2px]" 
                                        : "border-2 border-b-4 border-gray-400 bg-gray-300 text-gray-500"
                                )}
                            >
                                <span className="text-[1.1rem]">20</span>
                                <span className={cn(
                                    "text-lg drop-shadow-sm",
                                    canBuyOneHeart ? "text-amber-300" : "text-gray-400 grayscale"
                                )}>⚡</span>
                            </button>
                        </div>
                    )}

                    {/* Refill All Hearts */}
                    {hearts === 0 && (
                        <div className="flex w-full items-center justify-between rounded-2xl border-2 border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-slate-300 gap-4">
                            <div className="flex items-center gap-4">
                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-amber-100">
                                    <Heart className="h-7 w-7 text-amber-500 fill-amber-500" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-lg font-bold text-slate-700">Recarga Total</span>
                                    <span className="text-sm text-slate-500 hidden sm:block">Enche os teus 5 corações.</span>
                                </div>
                            </div>
                            <button
                                disabled={!canRefill || isPending}
                                onClick={() => initiatePurchase(
                                    onRefillHearts,
                                    { icon: "💖", title: "Corações Cheios!", description: "5 corações recarregados.", color: "bg-rose-100" },
                                    { "not_enough_xp": "Precisas de 100 XP" },
                                    100,
                                    "Recarga Completa"
                                )}
                                className={cn(
                                    "flex min-w-[90px] items-center justify-center gap-2 rounded-xl py-3 px-5 font-bold transition-all disabled:pointer-events-none shrink-0",
                                    canRefill
                                        ? "border-2 border-b-4 border-amber-600 bg-amber-500 text-white active:border-b-2 active:translate-y-[2px]" 
                                        : "border-2 border-b-4 border-gray-400 bg-gray-300 text-gray-500"
                                )}
                            >
                                <span className="text-[1.1rem]">100</span>
                                <span className={cn(
                                    "text-lg drop-shadow-sm",
                                    canRefill ? "text-amber-200" : "text-gray-400 grayscale"
                                )}>⚡</span>
                            </button>
                        </div>
                    )}

                    {/* Max Hearts Reached State */}
                    {hearts === 5 && (
                        <div className="flex w-full items-center justify-between rounded-2xl border-2 border-rose-100 bg-rose-50/60 p-4 shadow-sm opacity-80 cursor-default">
                             <div className="flex items-center gap-4">
                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-rose-100">
                                    <Heart className="h-7 w-7 fill-rose-500 text-rose-500" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-lg font-bold text-slate-700">Corações Cheios</span>
                                    <span className="text-sm text-slate-500">As tuas vidas estão no máximo.</span>
                                </div>
                            </div>
                            <div className="px-4 font-black uppercase text-sm tracking-widest text-rose-400">Máximo</div>
                        </div>
                    )}

                    {/* XP Boost */}
                    <div className="flex w-full items-center justify-between rounded-2xl border-2 border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-slate-300 gap-4">
                        <div className="flex items-center gap-4">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-purple-100">
                                <Zap className="h-7 w-7 text-purple-500 fill-purple-200" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-lg font-bold text-slate-700">XP Duplo</span>
                                <span className="text-sm text-slate-500 hidden sm:block">+5 lições com recompensa dupla (20 XP).</span>
                            </div>
                        </div>
                        <button
                            disabled={!canBuyXpBoost || isPending}
                            onClick={() => initiatePurchase(
                                onBuyXpBoost,
                                { icon: "⚡", title: "XP Duplo Ativado!", description: "Próximas 5 lições dão 20 XP por certo!", color: "bg-purple-100" },
                                { "not_enough_xp": "Precisas de 150 XP" },
                                150,
                                "XP Duplo"
                            )}
                            className={cn(
                                "flex min-w-[90px] items-center justify-center gap-2 rounded-xl py-3 px-5 font-bold transition-all disabled:pointer-events-none shrink-0",
                                canBuyXpBoost 
                                    ? "border-2 border-b-4 border-green-600 bg-green-500 text-white active:border-b-2 active:translate-y-[2px]" 
                                    : "border-2 border-b-4 border-gray-400 bg-gray-300 text-gray-500"
                            )}
                        >
                            <span className="text-[1.1rem]">150</span>
                            <span className={cn(
                                "text-lg drop-shadow-sm",
                                canBuyXpBoost ? "text-amber-300" : "text-gray-400 grayscale"
                            )}>⚡</span>
                        </button>
                    </div>

                    {/* Heart Shield */}
                    <div className="flex w-full items-center justify-between rounded-2xl border-2 border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-slate-300 gap-4">
                        <div className="flex items-center gap-4">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-sky-100">
                                <Shield className="h-7 w-7 text-sky-500 fill-sky-200" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-lg font-bold text-slate-700">Escudo Protetor</span>
                                <span className="text-sm text-slate-500 hidden sm:block">Protege 1 erro nas tuas lições.</span>
                            </div>
                        </div>
                        <button
                            disabled={!canBuyHeartShield || isPending}
                            onClick={() => initiatePurchase(
                                onBuyHeartShield,
                                { icon: "🛡️", title: "Escudo Adquirido!", description: "Protege 1 coração no próximo erro.", color: "bg-sky-100" },
                                { "not_enough_xp": "Precisas de 100 XP" },
                                100,
                                "Escudo de Coração"
                            )}
                            className={cn(
                                "flex min-w-[90px] items-center justify-center gap-2 rounded-xl py-3 px-5 font-bold transition-all disabled:pointer-events-none shrink-0",
                                canBuyHeartShield 
                                    ? "border-2 border-b-4 border-green-600 bg-green-500 text-white active:border-b-2 active:translate-y-[2px]" 
                                    : "border-2 border-b-4 border-gray-400 bg-gray-300 text-gray-500"
                            )}
                        >
                            <span className="text-[1.1rem]">100</span>
                            <span className={cn(
                                "text-lg drop-shadow-sm",
                                canBuyHeartShield ? "text-amber-300" : "text-gray-400 grayscale"
                            )}>⚡</span>
                        </button>
                    </div>

                    {/* Streak Freeze */}
                    <div className="flex w-full items-center justify-between rounded-2xl border-2 border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-slate-300 gap-4">
                        <div className="flex items-center gap-4">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-cyan-100">
                                <Snowflake className="h-7 w-7 text-cyan-500 fill-cyan-200" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-lg font-bold text-slate-700">Congelação</span>
                                <span className="text-sm text-slate-500 hidden sm:block">Protege a tua streak por um dia inteiro.</span>
                            </div>
                        </div>
                        <button
                            disabled={!canBuyStreakFreeze || isPending}
                            onClick={() => initiatePurchase(
                                onBuyStreakFreeze,
                                { icon: "❄️", title: "Freeze Adquirido!", description: "Protege a tua streak por 1 dia.", color: "bg-cyan-100" },
                                { "not_enough_xp": "Precisas de 300 XP" },
                                300,
                                "Streak Freeze"
                            )}
                            className={cn(
                                "flex min-w-[90px] items-center justify-center gap-2 rounded-xl py-3 px-5 font-bold transition-all disabled:pointer-events-none shrink-0",
                                canBuyStreakFreeze 
                                    ? "border-2 border-b-4 border-green-600 bg-green-500 text-white active:border-b-2 active:translate-y-[2px]" 
                                    : "border-2 border-b-4 border-gray-400 bg-gray-300 text-gray-500"
                            )}
                        >
                            <span className="text-[1.1rem]">300</span>
                            <span className={cn(
                                "text-lg drop-shadow-sm",
                                canBuyStreakFreeze ? "text-amber-300" : "text-gray-400 grayscale"
                            )}>⚡</span>
                        </button>
                    </div>

                </div>

                {/* Footer Tip */}
                <div className="mt-8 rounded-2xl border-2 border-slate-100 bg-slate-50/50 p-6 text-center text-slate-500 shadow-sm">
                    <p className="font-bold text-slate-700 flex items-center justify-center gap-2 mb-2">
                        💡 Ganha XP nas lições!
                    </p>
                    <p className="text-sm">+10 XP por cada resposta correta (+20 XP com Boost).</p>
                </div>
            </div>
        </>
    );
};
