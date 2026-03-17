import Link from "next/link";
import { DrunkenOwlLottie } from "@/components/ui/lottie-animation";
import { Home } from "lucide-react";

export default function NotFound() {
    return (
        <div className="h-screen flex flex-col items-center justify-center bg-slate-50 px-4">
            <div className="w-64 h-64 mb-6 drop-shadow-lg">
                <DrunkenOwlLottie className="w-full h-full" />
            </div>

            <h1 className="text-3xl font-black text-slate-800 text-center">
                Erro 404 — Estás perdido?
            </h1>
            <p className="text-slate-500 mt-2 text-center max-w-md leading-relaxed">
                A nossa coruja bebeu um copo a mais e não consegue encontrar esta página.
            </p>

            <Link
                href="/learn"
                className="mt-8 py-4 px-8 text-lg font-bold bg-emerald-500 hover:bg-emerald-400 text-white rounded-2xl border-b-4 border-emerald-600 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2"
            >
                <Home className="h-5 w-5" />
                Voltar ao Caminho Seguro
            </Link>
        </div>
    );
}
