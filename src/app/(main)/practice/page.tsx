import { Suspense } from "react";
import {
  Dumbbell,
  Mic,
  PenTool,
  BookOpen,
  Headphones,
  HeartPulse,
  Bot,
  History,
  Sparkles,
  Lock,
  ShieldAlert,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getUserProgress } from "@/db/queries";
import { checkSubscription } from "@/lib/subscription";
import { PracticeHeader } from "@/components/practice/practice-header";

export const dynamic = "force-dynamic";

export default function PracticePage() {
  return (
    <div className="flex flex-col gap-8 px-4 sm:px-6 py-8 max-w-[1056px] mx-auto w-full">
      {/* ── Header (Client Component with Modal) ── */}
      <PracticeHeader />

      <Suspense fallback={<PracticeSkeleton />}>
        <PracticeData />
      </Suspense>
    </div>
  );
}

async function PracticeData() {
  const userProgress = await getUserProgress();
  const hasFullHearts = userProgress?.hearts === 5;
  const isPro = await checkSubscription();

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500">
      {/* ── Clínica de Corações ── */}
      <div>
        {hasFullHearts ? (
          <div className="bg-white dark:bg-slate-900 rounded-xl border-2 border-stone-200 dark:border-slate-800 border-b-8 p-10 flex flex-col items-center text-center space-y-4 opacity-50 grayscale">
            <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center shadow-inner">
              <HeartPulse
                className="h-10 w-10 text-rose-300"
                strokeWidth={2.5}
              />
            </div>
            <div>
              <h3 className="text-2xl font-black text-stone-400 dark:text-slate-500 dark:text-slate-400">
                Clínica de Corações
              </h3>
              <p className="mt-2 font-medium text-stone-400 dark:text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Tens as vidas no máximo! Volta aqui quando precisares de
                recuperar corações.
              </p>
            </div>
          </div>
        ) : (
          <Link href="/lesson?clinic=true">
            <div className="bg-white dark:bg-slate-900 rounded-xl border-2 border-stone-200 dark:border-slate-800 border-b-8 p-10 flex flex-col items-center text-center space-y-4 transition-all active:translate-y-1 active:border-b-4 hover:bg-stone-50 dark:bg-slate-950 cursor-pointer">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center border-b-4 border-red-200">
                <HeartPulse
                  className="h-10 w-10 text-red-500 animate-pulse"
                  strokeWidth={3}
                />
              </div>
              <div>
                <h3 className="text-2xl font-black text-stone-700 dark:text-slate-200">
                  Clínica de Corações
                </h3>
                <p className="mt-2 font-medium text-stone-500 dark:text-slate-400 max-w-sm mx-auto">
                  Recupera vidas a rever os exercícios que erraste recentemente.
                </p>
              </div>
              <div className="pt-2">
                <span className="inline-flex items-center gap-2 bg-red-500 text-white px-6 py-3 rounded-2xl font-bold uppercase tracking-widest border-b-4 border-red-600">
                  Praticar para ganhar +1 ❤️
                </span>
              </div>
            </div>
          </Link>
        )}
      </div>

      {/* ── 2x2 Skills Grid & Conversação Fluída OR Paywall ── */}
      {isPro ? (
        <>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Writing Card */}
            <Link
              href="/practice/writing"
              className="group text-left bg-white dark:bg-slate-900 rounded-xl border-2 border-stone-200 dark:border-slate-800 border-b-8 p-8 flex gap-6 items-start transition-all active:translate-y-1 active:border-b-4 hover:bg-stone-50 dark:bg-slate-950"
            >
              <div className="w-16 h-16 rounded-full flex items-center justify-center border-b-4 bg-[#1cb0f6] border-[#1899d6] shrink-0 group-hover:-translate-y-1 transition-transform">
                <PenTool className="h-8 w-8 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-xl font-black text-stone-700 dark:text-slate-200">
                  Escrita
                </h3>
                <p className="mt-2 text-stone-500 dark:text-slate-400 font-medium leading-relaxed">
                  Recebe um tema e escreve um texto. A AI vai corrigir a tua
                  gramática e ortografia.
                </p>
              </div>
            </Link>

            {/* Speaking Card */}
            <Link
              href="/practice/speaking"
              className="group text-left bg-white dark:bg-slate-900 rounded-xl border-2 border-stone-200 dark:border-slate-800 border-b-8 p-8 flex gap-6 items-start transition-all active:translate-y-1 active:border-b-4 hover:bg-stone-50 dark:bg-slate-950"
            >
              <div className="w-16 h-16 rounded-full flex items-center justify-center border-b-4 bg-[#ff4b4b] border-[#ea2b2b] shrink-0 group-hover:-translate-y-1 transition-transform">
                <Mic className="h-8 w-8 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-xl font-black text-stone-700 dark:text-slate-200">
                  Fala
                </h3>
                <p className="mt-2 text-stone-500 dark:text-slate-400 font-medium leading-relaxed">
                  Recebe uma pergunta e responde falando. A AI vai analisar a
                  tua resposta e dar dicas.
                </p>
              </div>
            </Link>

            {/* Reading Card */}
            <Link
              href="/practice/reading"
              className="group text-left bg-white dark:bg-slate-900 rounded-xl border-2 border-stone-200 dark:border-slate-800 border-b-8 p-8 flex gap-6 items-start transition-all active:translate-y-1 active:border-b-4 hover:bg-stone-50 dark:bg-slate-950"
            >
              <div className="w-16 h-16 rounded-full flex items-center justify-center border-b-4 bg-[#58cc02] border-[#46a302] shrink-0 group-hover:-translate-y-1 transition-transform">
                <BookOpen className="h-8 w-8 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-xl font-black text-stone-700 dark:text-slate-200">
                  Leitura
                </h3>
                <p className="mt-2 text-stone-500 dark:text-slate-400 font-medium leading-relaxed">
                  Lê um texto gerado pela AI e debate sobre o tema. Melhora a
                  tua compreensão.
                </p>
              </div>
            </Link>

            {/* Listening Card */}
            <Link
              href="/practice/listening"
              className="group text-left bg-white dark:bg-slate-900 rounded-xl border-2 border-stone-200 dark:border-slate-800 border-b-8 p-8 flex gap-6 items-start transition-all active:translate-y-1 active:border-b-4 hover:bg-stone-50 dark:bg-slate-950"
            >
              <div className="w-16 h-16 rounded-full flex items-center justify-center border-b-4 bg-[#ce82ff] border-[#a552c9] shrink-0 group-hover:-translate-y-1 transition-transform">
                <Headphones className="h-8 w-8 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-xl font-black text-stone-700 dark:text-slate-200">
                  Escuta
                </h3>
                <p className="mt-2 text-stone-500 dark:text-slate-400 font-medium leading-relaxed">
                  Ouve um áudio gerado pela AI e analisa o conteúdo. Treina o
                  teu ouvido.
                </p>
              </div>
            </Link>

            {/* Survival Mode Card */}
            <Link
              href="/practice/survival"
              className="group text-left bg-white dark:bg-slate-900 rounded-xl border-2 border-stone-200 dark:border-slate-800 border-b-8 p-8 flex gap-6 items-start transition-all active:translate-y-1 active:border-b-4 hover:bg-stone-50 dark:bg-slate-950 md:col-span-2 lg:col-span-1"
            >
              <div className="w-16 h-16 rounded-full flex items-center justify-center border-b-4 bg-slate-800 border-slate-950 shrink-0 group-hover:-translate-y-1 transition-transform">
                <ShieldAlert className="h-8 w-8 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-xl font-black text-stone-700 dark:text-slate-200 flex items-center gap-2">
                  Modo Sobrevivência{" "}
                  <span className="bg-sky-500 text-white text-[10px] px-2 py-0.5 rounded-md uppercase tracking-wider">
                    Novo
                  </span>
                </h3>
                <p className="mt-2 text-stone-500 dark:text-slate-400 font-medium leading-relaxed">
                  Enfrenta cenários caóticos com NPCs reais num roleplay
                  imersivo por chat!
                </p>
              </div>
            </Link>
          </div>

          {/* ── Novidade: Conversação Fluída ── */}
          <div className="bg-stone-100 dark:bg-slate-800 rounded-3xl p-8 sm:p-12 relative border-2 border-stone-200 dark:border-slate-800 overflow-hidden flex flex-col md:flex-row items-center gap-8 mt-4">
            <div className="flex-1 text-center md:text-left z-10">
              <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-600 px-4 py-1.5 rounded-xl font-bold text-sm mb-4 uppercase tracking-wider">
                <Sparkles className="w-4 h-4" /> Novidade
              </div>
              <h3 className="text-3xl font-black text-stone-800 dark:text-slate-100 mb-3">
                Pratica Conversação Fluída
              </h3>
              <p className="text-stone-500 dark:text-slate-400 font-medium text-lg max-w-md mb-8">
                Simula conversas do dia a dia com a nossa Inteligência
                Artificial por voz, sem interrupções.
              </p>
              <Link href="/practice/conversation">
                <span className="inline-block bg-[#58cc02] text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest border-b-8 border-[#46a302] active:border-b-4 active:translate-y-1 transition-all hover:bg-[#61da02]">
                  COMEÇAR AGORA
                </span>
              </Link>
            </div>
            {/* Decorative background element replacing image */}
            <div className="w-48 h-48 md:w-64 md:h-64 bg-indigo-200 rounded-full opacity-20 absolute -right-10 -bottom-10 blur-3xl pointer-events-none"></div>
            <div className="hidden md:flex w-48 h-48 shrink-0 bg-white dark:bg-slate-900 rounded-[2rem] border-4 border-stone-200 dark:border-slate-800 shadow-xl items-center justify-center rotate-6 relative z-10">
              <div className="absolute inset-0 flex items-center justify-center gap-2">
                <div
                  className="w-4 h-12 bg-sky-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                ></div>
                <div
                  className="w-4 h-20 bg-indigo-500 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                ></div>
                <div
                  className="w-4 h-16 bg-purple-500 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                ></div>
                <div
                  className="w-4 h-8 bg-pink-500 rounded-full animate-bounce"
                  style={{ animationDelay: "450ms" }}
                ></div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-gradient-to-br from-[#0F172A] via-[#1E1B4B] to-[#312E81] rounded-[2.5rem] p-8 sm:p-14 border-4 border-indigo-900/50 border-b-[12px] flex flex-col items-center text-center mt-4 shadow-[0_20px_50px_rgba(49,46,129,0.5)] relative overflow-hidden group">
          {/* Cosmic Background Effects */}
          <div className="absolute inset-0 bg-[url('/sparkles.svg')] opacity-30 mix-blend-color-dodge pointer-events-none"></div>
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-500 rounded-full mix-blend-screen blur-[100px] opacity-20 pointer-events-none"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-fuchsia-500 rounded-full mix-blend-screen blur-[100px] opacity-20 pointer-events-none"></div>

          <div className="w-32 h-32 bg-gradient-to-br from-indigo-900 to-slate-900 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-[inset_0_-4px_10px_rgba(0,0,0,0.5)] border-4 border-indigo-800 relative z-10 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">
            <div className="absolute inset-0 bg-indigo-500 opacity-20 blur-xl animate-pulse rounded-full"></div>
            <Lock className="w-14 h-14 text-indigo-400" strokeWidth={2.5} />
          </div>

          <h3 className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 via-white to-fuchsia-200 mb-4 relative z-10 drop-shadow-lg uppercase tracking-tight">
            Prática com IA Bloqueada
          </h3>
          <p className="text-indigo-200/80 font-bold text-lg max-w-xl mb-10 relative z-10 leading-relaxed">
            Eleva o teu nível com o plano MyDuolingo PRO e acede à nossa
            Inteligência Artificial sem limites. A derradeira experiência de
            aprendizagem.
          </p>

          <div className="flex flex-col gap-4 text-left bg-black/30 backdrop-blur-md p-8 rounded-[2rem] border-2 border-white/10 mb-12 w-full max-w-lg relative z-10 shadow-xl">
            <div className="flex items-center gap-4 bg-white/5 p-3 rounded-2xl border border-white/5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-400 to-red-500 flex items-center justify-center shrink-0 shadow-lg">
                <HeartPulse className="w-5 h-5 text-white" strokeWidth={3} />
              </div>
              <span className="font-black text-white tracking-wide">
                Vidas Ilimitadas
              </span>
            </div>
            <div className="flex items-center gap-4 bg-white/5 p-3 rounded-2xl border border-white/5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center shrink-0 shadow-lg">
                <Bot className="w-5 h-5 text-white" strokeWidth={3} />
              </div>
              <span className="font-black text-white tracking-wide">
                Prática Ilimitada com IA
              </span>
            </div>
            <div className="flex items-center gap-4 bg-white/5 p-3 rounded-2xl border border-white/5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0 shadow-lg">
                <Sparkles className="w-5 h-5 text-white" strokeWidth={3} />
              </div>
              <span className="font-black text-white tracking-wide">
                Experiência Sem Anúncios
              </span>
            </div>
          </div>

          <Link href="/shop" className="w-full sm:w-auto relative z-10">
            <span className="inline-flex w-full min-w-[280px] bg-gradient-to-r from-fuchsia-600 to-indigo-600 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest border-b-8 border-indigo-900 active:border-b-0 active:translate-y-[8px] transition-all hover:brightness-110 shadow-[0_0_30px_rgba(79,70,229,0.5)] justify-center text-lg animate-pulse hover:animate-none">
              DESBLOQUEAR PRO
            </span>
          </Link>
        </div>
      )}
    </div>
  );
}

// --- SKELETON FALLBACK ---
const PracticeSkeleton = () => {
  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500">
      {/* Clínica de Corações Skeleton */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border-2 border-stone-200 dark:border-slate-800 border-b-8 p-10 flex flex-col items-center text-center space-y-4">
        <div className="w-20 h-20 bg-stone-200 dark:bg-slate-700 rounded-full animate-pulse" />
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-48 bg-stone-200 dark:bg-slate-700 rounded-lg animate-pulse" />
          <div className="h-4 w-64 bg-stone-200 dark:bg-slate-700 rounded-md animate-pulse" />
        </div>
        <div className="pt-2">
          <div className="h-[48px] w-[240px] bg-stone-200 dark:bg-slate-700 rounded-2xl animate-pulse" />
        </div>
      </div>

      {/* 2x2 Skills Grid Skeleton */}
      <div className="grid gap-6 md:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-900 rounded-xl border-2 border-stone-200 dark:border-slate-800 border-b-8 p-8 flex gap-6 items-start"
          >
            <div className="w-16 h-16 rounded-full bg-stone-200 dark:bg-slate-700 animate-pulse shrink-0" />
            <div className="flex-1 space-y-3">
              <div className="h-6 w-32 bg-stone-200 dark:bg-slate-700 rounded-lg animate-pulse" />
              <div className="h-4 w-full bg-stone-200 dark:bg-slate-700 rounded-md animate-pulse" />
              <div className="h-4 w-3/4 bg-stone-200 dark:bg-slate-700 rounded-md animate-pulse" />
            </div>
          </div>
        ))}
      </div>

      {/* Conversação Fluída Skeleton */}
      <div className="bg-stone-50 dark:bg-slate-950 rounded-3xl p-8 sm:p-12 relative border-2 border-stone-200 dark:border-slate-800 overflow-hidden flex flex-col md:flex-row items-center gap-8 mt-4">
        <div className="flex-1 text-center md:text-left z-10 space-y-4 flex flex-col items-center md:items-start">
          <div className="w-24 h-8 bg-stone-200 dark:bg-slate-700 rounded-xl animate-pulse" />
          <div className="w-64 h-10 bg-stone-200 dark:bg-slate-700 rounded-lg animate-pulse" />
          <div className="w-full max-w-md h-16 bg-stone-200 dark:bg-slate-700 rounded-md animate-pulse" />
          <div className="w-48 h-[56px] bg-stone-200 dark:bg-slate-700 rounded-2xl animate-pulse mt-4" />
        </div>
        <div className="hidden md:flex w-48 h-48 shrink-0 bg-stone-200 dark:bg-slate-700 rounded-[2rem] animate-pulse relative z-10" />
      </div>
    </div>
  );
};
