"use client";

import Image from "next/image";
import { useTransition } from "react";
import { X, Heart, Sparkles, BadgeCheck, Crown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useProModalStore } from "@/store/use-pro-modal-store";
import { cn } from "@/lib/utils";
import { createStripeUrl } from "@/actions/user-subscription";

const BENEFITS = [
    {
        icon: Heart,
        iconColor: "text-rose-500 fill-rose-500",
        title: "Corações Ilimitados",
        description: "Nunca mais pares de aprender por causa de erros.",
    },
    {
        icon: Sparkles,
        iconColor: "text-purple-500 fill-purple-300",
        title: "Prática com IA Ilimitada",
        description: "Treina com a nossa inteligência artificial sem restrições.",
    },
    {
        icon: BadgeCheck,
        iconColor: "text-amber-500 fill-amber-300",
        title: "Badge VIP",
        description: "Mostra a tua dedicação nos grupos e no perfil.",
    },
] as const;

export const ProModal = () => {
    const { isOpen, closeModal } = useProModalStore();
    const [isPending, startTransition] = useTransition();

    if (!isOpen) return null;

    const onClickSubscribe = () => {
        startTransition(() => {
            createStripeUrl()
                .then((response) => {
                    if ("data" in response && response.data) {
                        // Redirect to Stripe Checkout or Billing Portal
                        window.location.href = response.data;
                    } else if ("success" in response && !response.success && "message" in response) {
                        toast.error(response.message);
                    }
                })
                .catch(() => toast.error("Ocorreu um erro ao processar. Tenta novamente mais tarde."));
        });
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-[110] bg-black/70 backdrop-blur-md animate-in fade-in duration-300"
                onClick={closeModal}
                aria-hidden="true"
            />

            {/* Modal */}
            <div
                role="dialog"
                aria-modal="true"
                aria-label="Upgrade para PRO"
                className="fixed left-1/2 top-1/2 z-[120] flex max-h-[95vh] w-[94%] max-w-md -translate-x-1/2 -translate-y-1/2 flex-col animate-in zoom-in-95 fade-in duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]"
            >
                <div className="relative flex flex-col overflow-hidden rounded-[2rem] border-2 border-amber-300 border-b-8 bg-white shadow-2xl">

                    {/* Scrollable Content Area */}
                    <div className="custom-scrollbar overflow-y-auto flex-1">
                        {/* ===== Gold Hero Section ===== */}
                        <div className="relative overflow-hidden px-6 pb-6 pt-10 text-center gold-shimmer-bg">
                            {/* Animated gold gradient background */}
                            <div
                                className="absolute inset-0 -z-10 bg-gradient-to-tr from-amber-400 via-yellow-200 to-amber-500"
                                style={{ backgroundSize: "200% 200%" }}
                            />
                            {/* Shimmer overlay */}
                            <div className="absolute inset-0 -z-[5] gold-shimmer-sweep" />
                            {/* Decorative blurs */}
                            <div className="absolute -top-10 -left-10 h-40 w-40 rounded-full bg-yellow-300 blur-3xl opacity-40" />
                            <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-amber-300 blur-3xl opacity-40" />

                            {/* Close button */}
                            <button
                                onClick={closeModal}
                                className="absolute right-4 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-xl bg-white/30 text-amber-700 backdrop-blur-sm transition-all hover:bg-white/50 active:scale-90"
                                aria-label="Fechar modal"
                            >
                                <X className="h-5 w-5" />
                            </button>

                            {/* Mascot with Crown */}
                            <div className="relative mx-auto mb-4 h-24 w-24">
                                <Image
                                    src="/mascot.svg"
                                    alt="Marco PRO"
                                    fill
                                    className="object-contain drop-shadow-lg pro-mascot-float"
                                />
                                {/* Crown badge */}
                                <div className="absolute -right-1 -top-1 flex h-9 w-9 items-center justify-center rounded-full border-2 border-amber-500 bg-gradient-to-br from-yellow-300 to-amber-400 shadow-lg pro-badge-pulse">
                                    <Crown className="h-4.5 w-4.5 fill-white text-white" />
                                </div>
                            </div>

                            {/* Title */}
                            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-amber-900 drop-shadow-sm">
                                Torna-te <span className="text-white drop-shadow-[0_2px_4px_rgba(180,80,0,0.5)]">PRO</span>
                            </h2>
                            <p className="mx-auto mt-2 max-w-xs text-xs md:text-sm font-bold text-amber-800/80">
                                Desbloqueia o teu superpoder e acelera a tua aprendizagem.
                            </p>
                        </div>

                        {/* ===== Benefits List ===== */}
                        <div className="space-y-3 px-6 py-5">
                            {BENEFITS.map((benefit, index) => (
                                <div
                                    key={benefit.title}
                                    className={cn(
                                        "flex items-start gap-4 rounded-2xl border-2 border-stone-100 bg-stone-50/50 p-3.5 transition-all hover:border-stone-200 hover:bg-stone-50",
                                        "animate-in slide-in-from-bottom-4 fade-in fill-mode-backwards"
                                    )}
                                    style={{ animationDelay: `${150 + index * 100}ms`, animationDuration: "400ms" }}
                                >
                                    {/* Chunky green checkmark */}
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-2 border-emerald-200 border-b-4 bg-emerald-50">
                                        <benefit.icon className={cn("h-4.5 w-4.5", benefit.iconColor)} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm md:text-base font-black tracking-tight text-stone-700">
                                            {benefit.title}
                                        </span>
                                        <span className="mt-0.5 text-xs md:text-sm font-medium text-stone-500 leading-tight">
                                            {benefit.description}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ===== Sticky Footer Action Area ===== */}
                    <div className="border-t border-stone-100 bg-white px-6 pb-6 pt-4">
                        <button
                            onClick={onClickSubscribe}
                            disabled={isPending}
                            className="group relative flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-amber-200 border-b-8 bg-white py-4 text-lg md:text-xl font-black uppercase tracking-widest text-amber-600 shadow-sm transition-all hover:scale-[1.02] hover:shadow-md active:translate-y-1 active:border-b-2 active:shadow-none disabled:pointer-events-none disabled:opacity-70"
                        >
                            {isPending ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <Crown className="h-6 w-6 fill-amber-400 text-amber-500 transition-transform group-hover:rotate-12" />
                            )}
                            {isPending ? "A CARREGAR..." : "SUBSCREVER PRO"}
                        </button>

                        {/* Dismiss */}
                        <button
                            onClick={closeModal}
                            className="mt-3 w-full py-2 text-center text-xs font-bold uppercase tracking-widest text-stone-400 transition-all hover:text-stone-600 active:scale-95"
                        >
                            Talvez mais tarde
                        </button>
                    </div>
                </div>
            </div>

            {/* Scoped CSS Animations & Custom Scrollbar */}
            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #f1f1f1;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #e2e2e2;
                }

                .gold-shimmer-sweep {
                    background: linear-gradient(
                        105deg,
                        transparent 30%,
                        rgba(255, 255, 255, 0.35) 45%,
                        rgba(255, 255, 255, 0.05) 55%,
                        transparent 70%
                    );
                    background-size: 300% 100%;
                    animation: shimmer-move 3.5s ease-in-out infinite;
                }

                @keyframes shimmer-move {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }

                .pro-mascot-float {
                    animation: mascot-float 3s ease-in-out infinite;
                }

                @keyframes mascot-float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-6px); }
                }

                .pro-badge-pulse {
                    animation: badge-pulse 2s ease-in-out infinite;
                }

                @keyframes badge-pulse {
                    0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.4); }
                    50% { transform: scale(1.08); box-shadow: 0 0 0 8px rgba(245, 158, 11, 0); }
                }
            `}</style>
        </>
    );
};
