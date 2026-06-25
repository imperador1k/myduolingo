import { Suspense } from "react";
import { redirect } from "next/navigation";
import { checkSubscription } from "@/lib/subscription";
import CasinoClient from "./casino-client";
import { Lock, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function CasinoPage() {
  const isPro = await checkSubscription();

  return (
    <div className="flex flex-col min-h-screen text-slate-900 dark:text-slate-100 p-4 md:p-8">
      {!isPro ? (
        <div className="flex-1 flex flex-col items-center justify-center max-w-lg mx-auto text-center space-y-6">
          <div className="w-24 h-24 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center shadow-inner relative">
            <Lock className="w-10 h-10 text-slate-400 dark:text-slate-500" />
            <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-yellow-900 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full shadow-md border-2 border-yellow-500">
              PRO
            </div>
          </div>
          <h1 className="text-3xl font-black tracking-tight uppercase">
            Acesso Restrito
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            O Casino 8-Bit é uma funcionalidade exclusiva para membros PRO. Faz
            o upgrade para testares a tua sorte (e o teu cérebro) com as Arcade
            Coins!
          </p>
          <Link href="/shop" className="w-full">
            <Button className="w-full h-14 rounded-2xl bg-yellow-400 hover:bg-yellow-500 text-yellow-950 font-black text-lg uppercase tracking-widest border-b-4 border-yellow-600 active:border-b-0 active:translate-y-1 transition-all shadow-md">
              <Sparkles className="w-5 h-5 mr-2" />
              Tornar-me PRO
            </Button>
          </Link>
          <Link href="/arcade" className="w-full">
            <Button
              variant="ghost"
              className="w-full h-14 rounded-2xl text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 font-bold uppercase tracking-widest"
            >
              Voltar ao Arcade
            </Button>
          </Link>
        </div>
      ) : (
        <Suspense
          fallback={
            <div className="flex-1 flex items-center justify-center">
              <div className="animate-pulse w-16 h-16 bg-pink-500 rounded-full"></div>
            </div>
          }
        >
          <CasinoClient />
        </Suspense>
      )}
    </div>
  );
}
