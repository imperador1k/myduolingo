"use client";

import Link from "next/link";
import { useUISounds } from "@/hooks/use-ui-sounds";

export const PracticeButton = () => {
    const { playReward } = useUISounds();

    return (
        <Link
            href="/lesson?clinic=true"
            onClick={() => playReward()}
            className="group flex items-center justify-between rounded-2xl border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-5 shadow-sm transition-all hover:shadow-md hover:border-green-300 hover:-translate-y-0.5"
        >
            <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-2xl group-hover:scale-110 transition-transform">
                    🩺
                </div>
                <div>
                    <p className="font-bold text-green-700">Praticar para ganhar vidas ❤️</p>
                    <p className="text-xs text-green-500">Corrige os teus erros e ganha +1 coração</p>
                </div>
            </div>
            <span className="text-green-400 text-xl group-hover:translate-x-1 transition-transform">→</span>
        </Link>
    );
};
