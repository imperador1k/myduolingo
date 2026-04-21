"use client";

import { useTransition } from "react";
import { createStripeUrl } from "@/actions/user-subscription";
import { toast } from "sonner";
import { Crown, Settings, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
    isPro: boolean;
};

export const SubscriptionCard = ({ isPro }: Props) => {
    const [isPending, startTransition] = useTransition();

    const onClick = () => {
        startTransition(() => {
            createStripeUrl()
                .then((response) => {
                    if ("data" in response && response.data) {
                        window.location.href = response.data;
                    } else if ("success" in response && !response.success && "message" in response) {
                        toast.error(response.message);
                    }
                })
                .catch(() => toast.error("Ocorreu um erro ao processar. Tenta novamente mais tarde."));
        });
    };

    return (
        <div>
            <h3 className="text-xl font-black text-stone-800 mb-4">Subscrição</h3>
            
            {isPro ? (
                // PRO CARD
                <div className="bg-white border-2 border-amber-300 border-b-8 rounded-[2rem] p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden transition-all">
                    {/* Shimmer background hint */}
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-50 to-yellow-50/50 -z-10" />

                    <div className="flex flex-col">
                        <h4 className="text-xl font-black text-amber-600 flex items-center gap-2">
                            MyDuolingo PRO
                            <Crown className="h-5 w-5 fill-amber-400 text-amber-500" />
                        </h4>
                        <p className="mt-2 text-sm font-bold text-stone-500 max-w-md leading-relaxed">
                            Estás atualmente no plano PRO com acesso a Corações Ilimitados e Prática com IA.
                        </p>
                    </div>

                    <button
                        onClick={onClick}
                        disabled={isPending}
                        className={cn(
                            "group relative flex shrink-0 items-center justify-center gap-2 rounded-2xl border-2 border-stone-200 border-b-6 bg-stone-100 px-6 py-4 font-black uppercase tracking-widest text-stone-600 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-stone-200 hover:shadow-md active:translate-y-1 active:border-b-2 active:shadow-none disabled:pointer-events-none disabled:opacity-70",
                        )}
                    >
                        {isPending ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <Settings className="h-5 w-5 text-stone-500 transition-transform group-hover:rotate-45" />
                        )}
                        {isPending ? "A CARREGAR..." : "GERIR SUBSCRIÇÃO"}
                    </button>
                </div>
            ) : (
                // FREE CARD
                <div className="bg-white border-2 border-stone-200 border-b-8 rounded-[2rem] p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all hover:border-stone-300">
                    <div className="flex flex-col">
                        <h4 className="text-xl font-black text-stone-700">
                            Plano Grátis
                        </h4>
                        <p className="mt-2 text-sm font-bold text-stone-500 max-w-md leading-relaxed">
                            Faz upgrade para o PRO para desbloqueares Corações Ilimitados e funcionalidades de IA exclusivas.
                        </p>
                    </div>

                    <button
                        onClick={onClick}
                        disabled={isPending}
                        className="group relative flex shrink-0 items-center justify-center gap-2 rounded-2xl border-2 border-amber-200 border-b-6 bg-amber-50 px-6 py-4 font-black uppercase tracking-widest text-amber-600 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-amber-100 hover:border-amber-300 hover:shadow-md active:translate-y-1 active:border-b-2 active:shadow-none disabled:pointer-events-none disabled:opacity-70"
                    >
                        {isPending ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <Crown className="h-5 w-5 fill-amber-400 text-amber-500 transition-transform group-hover:scale-110" />
                        )}
                        {isPending ? "A CARREGAR..." : "FAZER UPGRADE"}
                    </button>
                </div>
            )}
        </div>
    );
};
