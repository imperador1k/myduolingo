"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { startSurvivalSession } from "@/actions/survival";
import {
  HeartPulse,
  ShieldAlert,
  Navigation,
  CheckCircle2,
  History,
  Info,
  X,
} from "lucide-react";

export function SurvivalLobbyClient({
  scenarios,
  userSessions,
}: {
  scenarios: any[];
  userSessions: any[];
}) {
  const [filterLevel, setFilterLevel] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<"ACTIVE" | "COMPLETED">(
    "ACTIVE",
  );
  const [showInfo, setShowInfo] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const completedScenarioIds = new Set(
    userSessions
      .filter((s) => s.status === "completed")
      .map((s) => s.scenarioId),
  );

  const filteredScenarios = scenarios.filter((sc) => {
    // Level filter
    if (filterLevel !== "ALL" && sc.targetLevel !== filterLevel) return false;

    // Status filter
    const isCompleted = completedScenarioIds.has(sc.id);
    if (filterStatus === "COMPLETED" && !isCompleted) return false;
    if (filterStatus === "ACTIVE" && isCompleted) return false;

    return true;
  });

  return (
    <div className="flex flex-col items-center max-w-4xl mx-auto w-full p-6 pt-12 relative">
      {/* Rules Modal Overlay */}
      {showInfo &&
        mounted &&
        createPortal(
          <div className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-slate-950 w-full max-w-2xl rounded-3xl p-8 shadow-[0_0_60px_-15px_rgba(225,29,72,0.3)] border border-rose-900/50 flex flex-col relative animate-in zoom-in-95 duration-300 overflow-hidden">
              {/* Chaotic Background Pattern */}
              <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-rose-900 via-slate-900 to-black"></div>

              <button
                onClick={() => setShowInfo(false)}
                className="absolute top-4 right-4 text-slate-500 hover:text-rose-500 transition-colors z-10"
              >
                <X className="w-6 h-6" />
              </button>
              <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="p-3 bg-rose-950/50 border border-rose-900/50 rounded-2xl">
                  <ShieldAlert className="w-8 h-8 text-rose-500" />
                </div>
                <h2 className="text-2xl font-black text-slate-100 uppercase tracking-wider">
                  Regras de Sobrevivência
                </h2>
              </div>
              <div className="space-y-5 text-slate-300 font-medium relative z-10">
                <p className="text-rose-400 font-bold">
                  Aviso: O Modo Sobrevivência não é para fracos.
                </p>
                <ul className="space-y-4 text-sm">
                  <li className="flex gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 shrink-0"></div>
                    <p>
                      <strong className="text-white">Ameaça Iminente:</strong> O
                      NPC dá sempre o primeiro passo. Prepara-te para reagir.
                    </p>
                  </li>
                  <li className="flex gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 shrink-0"></div>
                    <p>
                      <strong className="text-white">
                        Caos Controlado por IA:
                      </strong>{" "}
                      Reações imprevisíveis. Não há guiões, apenas instinto de
                      sobrevivência.
                    </p>
                  </li>
                  <li className="flex gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 shrink-0"></div>
                    <p>
                      <strong className="text-white">Julgamento Final:</strong>{" "}
                      Só o NPC decide se passas ou ficas para trás. Sê
                      persuasivo.
                    </p>
                  </li>
                </ul>
              </div>
              <Button
                onClick={() => setShowInfo(false)}
                className="w-full mt-8 h-14 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-lg border-2 border-rose-800 border-b-4 active:border-b-2 active:translate-y-[2px] transition-all relative z-10 uppercase tracking-widest shadow-[0_0_20px_rgba(225,29,72,0.4)]"
              >
                Estou Preparado
              </Button>
            </div>
          </div>,
          document.body,
        )}

      <div className="text-center mb-10 w-full animate-in slide-in-from-top-4 fade-in duration-500 relative">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-sky-100 dark:bg-sky-900/30 rounded-3xl inline-flex shadow-sm">
            <ShieldAlert className="w-12 h-12 text-sky-500" strokeWidth={2.5} />
          </div>
        </div>
        <div className="flex justify-center items-center gap-3 mb-4">
          <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-800 dark:text-slate-100">
            Modo Sobrevivência
          </h1>
          <button
            onClick={() => setShowInfo(true)}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-900/30 flex items-center justify-center transition-all"
            title="Como Funciona?"
          >
            <Info className="w-5 h-5" />
          </button>
        </div>
        <p className="text-lg text-slate-500 dark:text-slate-400 font-medium max-w-2xl mx-auto">
          Testa o teu conhecimento na vida real. Conversa com NPCs imprevisíveis
          em cenários caóticos e tenta safar-te usando apenas a língua que estás
          a aprender!
        </p>
      </div>

      {/* Filters */}
      <div className="w-full flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        <div className="flex bg-stone-100 dark:bg-slate-900 p-1.5 rounded-2xl border-2 border-stone-200 dark:border-slate-800 w-full md:w-auto">
          <button
            onClick={() => setFilterStatus("ACTIVE")}
            className={`flex-1 md:w-32 py-2 px-4 rounded-xl font-bold text-sm transition-all ${filterStatus === "ACTIVE" ? "bg-white dark:bg-slate-800 text-sky-500 shadow-sm" : "text-stone-500 dark:text-slate-400 hover:text-stone-700"}`}
          >
            Por Fazer
          </button>
          <button
            onClick={() => setFilterStatus("COMPLETED")}
            className={`flex-1 md:w-32 py-2 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${filterStatus === "COMPLETED" ? "bg-white dark:bg-slate-800 text-green-500 shadow-sm" : "text-stone-500 dark:text-slate-400 hover:text-stone-700"}`}
          >
            Concluídos{" "}
            <span className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-[10px] px-2 py-0.5 rounded-lg">
              {completedScenarioIds.size}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 custom-scrollbar">
          {["ALL", "A1", "A2", "B1", "B2", "C1", "C2"].map((level) => (
            <button
              key={level}
              onClick={() => setFilterLevel(level)}
              className={`shrink-0 px-4 py-2 rounded-xl font-bold text-sm border-2 transition-all ${
                filterLevel === level
                  ? "bg-sky-100 dark:bg-sky-900/30 border-sky-300 dark:border-sky-700 text-sky-600 dark:text-sky-400"
                  : "bg-white dark:bg-slate-900 border-stone-200 dark:border-slate-800 text-stone-500 hover:bg-stone-50"
              }`}
            >
              {level === "ALL" ? "Todos os Níveis" : level}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        {filteredScenarios.length === 0 ? (
          <div className="col-span-full py-16 flex flex-col items-center justify-center text-center opacity-70 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 border-dashed rounded-3xl">
            <Navigation
              className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4"
              strokeWidth={1.5}
            />
            <p className="text-xl font-bold text-slate-500 dark:text-slate-400">
              {filterStatus === "COMPLETED"
                ? "Ainda não concluíste nenhuma missão."
                : "Nenhuma missão disponível para estes filtros."}
            </p>
          </div>
        ) : (
          filteredScenarios.map((scenario) => {
            const isCompleted = completedScenarioIds.has(scenario.id);
            const pastSession = userSessions.find(
              (s) => s.scenarioId === scenario.id && s.status === "completed",
            );

            return (
              <div
                key={scenario.id}
                className={`bg-white dark:bg-slate-900 border-2 border-b-4 rounded-3xl p-6 flex flex-col transition-all relative overflow-hidden ${
                  isCompleted
                    ? "border-green-200 dark:border-green-900/50 opacity-90 hover:opacity-100"
                    : "border-slate-200 dark:border-slate-800 hover:border-sky-300 dark:hover:border-sky-700 hover:-translate-y-1"
                }`}
              >
                {isCompleted && (
                  <div className="absolute -right-6 -top-6 w-24 h-24 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                    <CheckCircle2
                      className="w-8 h-8 text-green-500 absolute bottom-4 left-4"
                      strokeWidth={3}
                    />
                  </div>
                )}

                <div className="flex justify-between items-start mb-4 relative z-10">
                  <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200 leading-tight pr-12">
                    {scenario.title}
                  </h2>
                  <div
                    className={`px-3 py-1 rounded-xl font-black text-xs uppercase tracking-widest shrink-0 ${
                      isCompleted
                        ? "bg-green-100 dark:bg-green-900/40 text-green-600"
                        : "bg-sky-100 dark:bg-sky-900/40 text-sky-500"
                    }`}
                  >
                    {scenario.targetLevel}
                  </div>
                </div>
                <p className="text-slate-500 dark:text-slate-400 font-medium mb-8 flex-1 leading-relaxed relative z-10">
                  {scenario.description}
                </p>

                {isCompleted ? (
                  <div className="flex gap-2">
                    <form
                      action={async () => {
                        // Restart session
                        await startSurvivalSession(scenario.id);
                      }}
                      className="flex-1"
                    >
                      <Button
                        type="submit"
                        variant="ghost"
                        className="w-full text-slate-500 border-2 border-slate-200 hover:bg-slate-50 font-bold h-12"
                      >
                        <History className="w-5 h-5 mr-2" />
                        Repetir
                      </Button>
                    </form>
                    <form
                      action={`/practice/survival/${pastSession?.id}`}
                      className="flex-1"
                    >
                      <Button
                        type="submit"
                        className="w-full bg-green-500 hover:bg-green-400 text-white border-2 border-green-600 border-b-4 active:border-b-2 active:translate-y-[2px] transition-all text-base font-bold h-12 px-0"
                      >
                        Ver Histórico
                      </Button>
                    </form>
                  </div>
                ) : (
                  <form
                    action={async () => {
                      await startSurvivalSession(scenario.id);
                    }}
                  >
                    <Button
                      type="submit"
                      className="w-full bg-sky-500 hover:bg-sky-400 text-white border-2 border-sky-600 border-b-4 active:border-b-2 active:translate-y-[2px] transition-all text-lg font-bold h-12"
                    >
                      <HeartPulse className="w-5 h-5 mr-2" />
                      Entrar no Cenário
                    </Button>
                  </form>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
