"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Zap, Shield, Snowflake, X } from "lucide-react";
import {
    onRefillHearts,
    onBuyOneHeart,
    onBuyXpBoost,
    onBuyHeartShield,
    onBuyStreakFreeze
} from "@/actions/user-progress";

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

            <div className="space-y-4">
                {/* Error Message */}
                {error && (
                    <div className="rounded-lg bg-rose-100 p-3 text-center text-sm font-bold text-rose-600">
                        ❌ {error}
                    </div>
                )}

                {/* Active Power-ups Banner */}
                {(xpBoostLessons > 0 || heartShields > 0 || streakFreezes > 0) && (
                    <div className="rounded-xl border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-4">
                        <h3 className="mb-3 font-bold text-green-700">✨ Power-ups Ativos</h3>
                        <div className="flex flex-wrap gap-2">
                            {xpBoostLessons > 0 && (
                                <div className="flex items-center gap-2 rounded-full bg-purple-100 px-3 py-1">
                                    <Zap className="h-4 w-4 text-purple-500" />
                                    <span className="text-sm font-bold text-purple-600">{xpBoostLessons} lições</span>
                                </div>
                            )}
                            {heartShields > 0 && (
                                <div className="flex items-center gap-2 rounded-full bg-sky-100 px-3 py-1">
                                    <Shield className="h-4 w-4 text-sky-500" />
                                    <span className="text-sm font-bold text-sky-600">{heartShields} escudos</span>
                                </div>
                            )}
                            {streakFreezes > 0 && (
                                <div className="flex items-center gap-2 rounded-full bg-cyan-100 px-3 py-1">
                                    <Snowflake className="h-4 w-4 text-cyan-500" />
                                    <span className="text-sm font-bold text-cyan-600">{streakFreezes} freezes</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* HEARTS SECTION */}
                <div className="rounded-xl border-2 border-rose-100 p-4">
                    <h3 className="mb-3 font-bold text-rose-600">❤️ Corações</h3>

                    {hearts === 5 && (
                        <div className="rounded-lg bg-green-50 p-3 text-center">
                            <span className="text-2xl">✅</span>
                            <p className="font-bold text-green-600">Todos os corações cheios!</p>
                        </div>
                    )}

                    {hearts > 0 && hearts < 5 && (
                        <div className="flex items-center justify-between rounded-lg bg-rose-50 p-3">
                            <div>
                                <p className="font-bold text-slate-700">+1 Coração</p>
                                <p className="text-sm text-slate-500">Recupera um coração</p>
                            </div>
                            <Button
                                variant={canBuyOneHeart ? "primary" : "secondary"}
                                size="sm"
                                onClick={() => initiatePurchase(
                                    onBuyOneHeart,
                                    { icon: "❤️", title: "+1 Coração!", description: "O teu coração foi adicionado.", color: "bg-rose-100" },
                                    { "not_enough_xp": "Precisas de 20 XP" },
                                    20,
                                    "+1 Coração"
                                )}
                                disabled={isPending || !canBuyOneHeart}
                            >
                                <div className="flex items-center gap-2">
                                    <span>20 XP</span>
                                </div>
                            </Button>
                        </div>
                    )}

                    {hearts === 0 && (
                        <div className="flex items-center justify-between rounded-lg bg-amber-50 p-3">
                            <div>
                                <p className="font-bold text-slate-700">Recarga Completa</p>
                                <p className="text-sm text-slate-500">5 corações de uma vez</p>
                            </div>
                            <Button
                                variant={canRefill ? "super" : "secondary"}
                                size="sm"
                                onClick={() => initiatePurchase(
                                    onRefillHearts,
                                    { icon: "💖", title: "Corações Cheios!", description: "5 corações recarregados.", color: "bg-rose-100" },
                                    { "not_enough_xp": "Precisas de 100 XP" },
                                    100,
                                    "Recarga Completa"
                                )}
                                disabled={isPending || !canRefill}
                            >
                                <div className="flex items-center gap-2">
                                    <span>100 XP</span>
                                </div>
                            </Button>
                        </div>
                    )}
                </div>

                {/* POWER-UPS SECTION */}
                <div className="rounded-xl border-2 border-purple-100 p-4">
                    <h3 className="mb-3 font-bold text-purple-600">⚡ Power-Ups</h3>
                    <div className="space-y-3">

                        {/* XP Boost */}
                        <div className="flex items-center justify-between rounded-lg bg-purple-50 p-3">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                                    <Zap className="h-5 w-5 text-purple-500" />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-700">XP Duplo</p>
                                    <p className="text-xs text-slate-500">+5 lições com 20 XP</p>
                                </div>
                            </div>
                            <Button
                                variant={canBuyXpBoost ? "primary" : "secondary"}
                                size="sm"
                                onClick={() => initiatePurchase(
                                    onBuyXpBoost,
                                    { icon: "⚡", title: "XP Duplo Ativado!", description: "Próximas 5 lições dão 20 XP por certo!", color: "bg-purple-100" },
                                    { "not_enough_xp": "Precisas de 150 XP" },
                                    150,
                                    "XP Duplo"
                                )}
                                disabled={isPending || !canBuyXpBoost}
                            >
                                <div className="flex items-center gap-2">
                                    <span>150 XP</span>
                                </div>
                            </Button>
                        </div>

                        {/* Heart Shield */}
                        <div className="flex items-center justify-between rounded-lg bg-sky-50 p-3">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-100">
                                    <Shield className="h-5 w-5 text-sky-500" />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-700">Escudo de Coração</p>
                                    <p className="text-xs text-slate-500">Protege 1 erro</p>
                                </div>
                            </div>
                            <Button
                                variant={canBuyHeartShield ? "primary" : "secondary"}
                                size="sm"
                                onClick={() => initiatePurchase(
                                    onBuyHeartShield,
                                    { icon: "🛡️", title: "Escudo Adquirido!", description: "Protege 1 coração no próximo erro.", color: "bg-sky-100" },
                                    { "not_enough_xp": "Precisas de 100 XP" },
                                    100,
                                    "Escudo de Coração"
                                )}
                                disabled={isPending || !canBuyHeartShield}
                            >
                                <div className="flex items-center gap-2">
                                    <span>100 XP</span>
                                </div>
                            </Button>
                        </div>

                        {/* Streak Freeze */}
                        <div className="flex items-center justify-between rounded-lg bg-cyan-50 p-3">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-100">
                                    <Snowflake className="h-5 w-5 text-cyan-500" />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-700">Congelação</p>
                                    <p className="text-xs text-slate-500">Protege streak 1 dia</p>
                                </div>
                            </div>
                            <Button
                                variant={canBuyStreakFreeze ? "primary" : "secondary"}
                                size="sm"
                                onClick={() => initiatePurchase(
                                    onBuyStreakFreeze,
                                    { icon: "❄️", title: "Freeze Adquirido!", description: "Protege a tua streak por 1 dia.", color: "bg-cyan-100" },
                                    { "not_enough_xp": "Precisas de 300 XP" },
                                    300,
                                    "Streak Freeze"
                                )}
                                disabled={isPending || !canBuyStreakFreeze}
                            >
                                <div className="flex items-center gap-2">
                                    <span>300 XP</span>
                                </div>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Info */}
                <div className="rounded-xl border-2 border-slate-100 bg-slate-50 p-4 text-center text-sm text-slate-500">
                    <p>💡 Ganha XP completando lições!</p>
                    <p>+10 XP por resposta correta (ou +20 com boost)</p>
                </div>
            </div>
        </>
    );
};
