import { getPracticeHistory } from "@/actions/practice";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { ArrowLeft, History, Bot } from "lucide-react";
import Link from "next/link";
import { HistoryList } from "./history-list";
import { checkSubscription } from "@/lib/subscription";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/learn");
  }

  const isPro = await checkSubscription();
  if (!isPro) {
    // Redireciona não-PRO de volta para a prática
    redirect("/practice");
  }

  const history = await getPracticeHistory();

  return (
    <div className="flex flex-col min-h-screen pb-20">
      {/* ── 3D Banner Header ── */}
      <div className="p-4 sm:p-6 w-full max-w-5xl mx-auto mt-4">
        <div className="relative bg-gradient-to-br from-sky-400 via-indigo-500 to-purple-500 rounded-[2.5rem] p-8 md:p-10 shadow-xl overflow-hidden border-4 border-sky-300 border-b-[10px] flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-[url('/img/pattern.svg')] opacity-10 mix-blend-overlay"></div>

          {/* Back Button */}
          <Link
            href="/practice"
            className="absolute top-6 left-6 flex items-center justify-center h-12 w-12 bg-white/20 hover:bg-white/30 text-white rounded-2xl transition-all active:scale-95 z-20 border-2 border-white/20 backdrop-blur-sm shadow-sm"
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>

          <div className="flex flex-col md:flex-row items-center gap-6 relative z-10 mt-12 md:mt-0 md:ml-20">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-md text-white rounded-[2rem] flex items-center justify-center rotate-[-5deg] border-4 border-white/30 shadow-lg shrink-0">
              <History className="w-10 h-10" />
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white uppercase drop-shadow-md">
                Histórico
              </h1>
              <p className="text-white/90 font-bold text-lg mt-1 drop-shadow-sm">
                Relembra e revê o teu treino com a Inteligência Artificial.
              </p>
            </div>
          </div>

          <div className="relative z-10 flex justify-center md:justify-end shrink-0">
            <div className="flex flex-col items-center bg-white/20 backdrop-blur-sm px-6 py-4 rounded-[2rem] border-4 border-white/30 shadow-lg border-b-[8px]">
              <span className="text-white/80 font-black text-[10px] uppercase tracking-[0.2em] mb-1">
                Sessões Realizadas
              </span>
              <span className="text-white font-black text-5xl tracking-tighter leading-none">
                {history.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="bg-sky-100 p-8 rounded-[2rem] border-4 border-sky-200 border-b-8 mb-8 shadow-sm">
              <Bot className="h-16 w-16 text-sky-400" strokeWidth={2.5} />
            </div>
            <h2 className="text-2xl font-black text-stone-700 tracking-tight uppercase mb-3">
              Sem histórico ainda
            </h2>
            <p className="text-stone-500 font-bold max-w-sm mx-auto mb-8">
              Complete exercícios na Área de Prática para construíres o teu
              arquivo de aprendizagem.
            </p>
            <Link href="/practice">
              <button className="bg-[#1CB0F6] hover:bg-[#1899D6] text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest border-b-4 border-[#1899D6] active:border-b-0 active:translate-y-1 transition-all shadow-sm">
                Começar a Praticar
              </button>
            </Link>
          </div>
        ) : (
          <HistoryList history={history} />
        )}
      </div>
    </div>
  );
}
