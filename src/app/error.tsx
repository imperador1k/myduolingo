"use client";

import { StarAngryLottie } from "@/components/ui/lottie-animation";
import { RefreshCw } from "lucide-react";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <div className="h-screen flex flex-col items-center justify-center bg-slate-50 px-4">
            <div className="w-56 h-56 mb-6 drop-shadow-lg">
                <StarAngryLottie className="w-full h-full" />
            </div>

            <h1 className="text-3xl font-black text-slate-800 text-center">
                Oops! Os nossos servidores tropeçaram.
            </h1>
            <p className="text-slate-500 mt-2 text-center max-w-md leading-relaxed">
                Algo correu mal, mas não te preocupes — a nossa equipa de estrelas zangadas já foi notificada.
            </p>

            {error.digest && (
                <p className="mt-3 text-xs font-mono text-slate-400 bg-slate-100 px-3 py-1 rounded-lg">
                    ID: {error.digest}
                </p>
            )}

            <button
                onClick={reset}
                className="mt-8 py-4 px-8 text-lg font-bold bg-sky-500 hover:bg-sky-400 text-white rounded-2xl border-b-4 border-sky-600 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2"
            >
                <RefreshCw className="h-5 w-5" />
                Tentar Novamente
            </button>
        </div>
    );
}
