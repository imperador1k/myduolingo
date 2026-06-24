"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  Send,
  ArrowLeft,
  PlayCircle,
  Lightbulb,
  MapPin,
  Target,
  ChevronRight,
  Info,
} from "lucide-react";
import { DynamicNPC } from "../components/dynamic-npc";
import { Button } from "@/components/ui/button";

const MOCK_NPC_BASE = "/npc/base_body.png";
const MOCK_NPC_CLOTHES: string[] = [];

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function SurvivalChatClient({
  sessionId,
  scenario,
}: {
  sessionId: string;
  scenario: any;
}) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGrammarCorrect, setIsGrammarCorrect] = useState<boolean | null>(
    null,
  );
  const [isMissionCompleted, setIsMissionCompleted] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  // Onboarding state
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [mounted, setMounted] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startSession = async () => {
    setHasStarted(true);
    setIsLoading(true);

    // AI first move
    try {
      const res = await fetch("/api/practice/survival", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          message: "[SYSTEM_INIT]",
        }),
      });

      if (!res.ok) throw new Error("API Error");
      const data = await res.json();

      setMessages([{ role: "assistant", content: data.message }]);
    } catch (error) {
      console.error(error);
      setMessages([
        { role: "assistant", content: "Oops, a minha IA está offline..." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/practice/survival", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          message: userMsg,
        }),
      });

      if (!res.ok) throw new Error("API Error");

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.message },
      ]);
      setIsGrammarCorrect(data.isGrammarCorrect);

      if (data.missionAccomplished) {
        setIsMissionCompleted(true);
      }
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Oops, a minha IA está offline..." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-slate-50 dark:bg-slate-950 font-sans overflow-hidden">
      {/* Onboarding Overlay */}
      {showOnboarding &&
        mounted &&
        createPortal(
          <div className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-slate-950 w-full max-w-2xl rounded-3xl p-6 md:p-10 shadow-[0_0_60px_-15px_rgba(225,29,72,0.3)] border border-rose-900/50 flex flex-col items-center relative max-h-[85vh] overflow-hidden">
              {/* Chaotic Background Pattern */}
              <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-rose-900 via-slate-900 to-black"></div>

              {/* Progress Bar */}
              <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-900">
                <div
                  className="h-full bg-rose-600 transition-all duration-500 ease-out shadow-[0_0_10px_rgba(225,29,72,0.8)]"
                  style={{
                    width: `${(onboardingStep / (scenario.hint ? 3 : 2)) * 100}%`,
                  }}
                ></div>
              </div>

              <h2 className="text-2xl md:text-3xl font-black text-slate-100 mb-6 mt-4 text-center uppercase tracking-wider relative z-10 drop-shadow-[0_2px_10px_rgba(225,29,72,0.5)] shrink-0">
                {scenario.title}
              </h2>

              <div className="w-full relative min-h-[160px] flex-1 overflow-y-auto custom-scrollbar flex flex-col z-10 py-2 px-1">
                {onboardingStep === 1 && (
                  <div className="w-full my-auto animate-in slide-in-from-right-8 fade-in duration-300">
                    <div className="flex justify-center mb-4">
                      <div className="p-4 bg-slate-900 border border-slate-700 rounded-full animate-pulse shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                        <MapPin className="w-8 h-8 text-slate-300" />
                      </div>
                    </div>
                    <h3 className="text-sm uppercase tracking-widest font-bold text-slate-500 mb-2 text-center">
                      Situação Crítica
                    </h3>
                    <p className="text-slate-200 font-medium leading-relaxed text-center text-lg">
                      {scenario.storyContext || scenario.description}
                    </p>
                  </div>
                )}

                {onboardingStep === 2 && (
                  <div className="w-full my-auto animate-in slide-in-from-right-8 fade-in duration-300">
                    <div className="flex justify-center mb-4">
                      <div className="p-4 bg-rose-950/50 border border-rose-900/50 rounded-full">
                        <Target className="w-8 h-8 text-rose-500" />
                      </div>
                    </div>
                    <h3 className="text-sm uppercase tracking-widest font-bold text-rose-500 mb-2 text-center">
                      O Teu Alvo
                    </h3>
                    <p className="text-rose-200 font-bold text-center text-xl bg-rose-950/30 p-4 rounded-2xl border-2 border-rose-900/50 shadow-inner">
                      {scenario.userRole}
                    </p>
                  </div>
                )}

                {onboardingStep === 3 && (
                  <div className="w-full my-auto animate-in slide-in-from-right-8 fade-in duration-300">
                    <div className="flex justify-center mb-2">
                      <div className="p-3 bg-amber-950/40 border border-amber-900/50 rounded-full animate-[bounce_2s_infinite]">
                        <Lightbulb className="w-8 h-8 text-amber-500" />
                      </div>
                    </div>
                    <h3 className="text-sm uppercase tracking-widest font-bold text-amber-500 mb-2 text-center">
                      Instinto de Sobrevivência
                    </h3>
                    <div className="text-amber-200 font-medium text-center text-lg bg-amber-950/20 p-5 rounded-2xl border-2 border-amber-900/40 shadow-inner">
                      {scenario.hint}
                    </div>
                  </div>
                )}
              </div>

              <div className="w-full flex mt-6 pt-6 border-t border-slate-800 relative z-10 shrink-0">
                {onboardingStep < (scenario.hint ? 3 : 2) ? (
                  <Button
                    onClick={() => setOnboardingStep((s) => s + 1)}
                    className="w-full h-14 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-black text-lg border-2 border-slate-700 border-b-4 active:border-b-2 active:translate-y-[2px] transition-all uppercase tracking-widest"
                  >
                    Continuar
                    <ChevronRight className="w-6 h-6 ml-1" />
                  </Button>
                ) : (
                  <Button
                    onClick={() => setShowOnboarding(false)}
                    className="w-full h-14 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-lg border-2 border-rose-800 border-b-4 active:border-b-2 active:translate-y-[2px] transition-all uppercase tracking-widest shadow-[0_0_20px_rgba(225,29,72,0.4)] group"
                  >
                    <PlayCircle className="w-6 h-6 mr-2 group-hover:scale-110 transition-transform" />
                    Ir para a Zona
                  </Button>
                )}
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* Header */}
      <header className="flex items-center p-4 border-b border-rose-200 dark:border-rose-900/50 bg-white dark:bg-slate-950 shrink-0 shadow-sm relative z-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="text-slate-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 hover:text-rose-600 dark:hover:text-rose-400 shrink-0"
        >
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <div className="ml-3 flex-1 min-w-0">
          <h1 className="text-xl md:text-2xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide truncate">
            {scenario.title}
          </h1>
          <p className="text-xs md:text-sm font-bold text-rose-500 truncate">
            {scenario.description}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            setOnboardingStep(1);
            setShowOnboarding(true);
          }}
          className="ml-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 hover:text-rose-600 dark:hover:text-rose-400 shrink-0"
          title="Ver Missão"
        >
          <Info className="w-6 h-6" />
        </Button>
      </header>

      {/* Main Content Area: NPC View (Top) + Chat (Bottom) */}
      <main className="flex-1 overflow-hidden flex flex-col md:flex-row relative">
        {/* Left/Top: NPC Canvas */}
        <div className="flex-1 bg-slate-100 dark:bg-[#0a0a0a] border-b border-rose-200 dark:border-rose-900/50 md:border-b-0 md:border-r flex items-center justify-center relative overflow-hidden shrink-0 min-h-[220px] max-h-[35vh] md:max-h-none md:min-h-[300px]">
          {/* Chaotic overlay grid/gradient */}
          <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-rose-500 via-transparent to-transparent"></div>
          <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

          <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-slate-200 dark:from-[#0a0a0a] to-transparent z-10"></div>
          <div className="relative z-20 w-full max-w-sm drop-shadow-2xl">
            <DynamicNPC
              baseImage={MOCK_NPC_BASE}
              clothes={MOCK_NPC_CLOTHES}
              isGrammarCorrect={isGrammarCorrect}
            />
          </div>
        </div>

        {/* Right/Bottom: Chat Area */}
        <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950 max-h-full">
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar flex flex-col gap-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex w-full ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] px-5 py-3 rounded-2xl border-b-4 ${
                    msg.role === "user"
                      ? "bg-slate-800 dark:bg-slate-800 border-slate-900 dark:border-black text-white rounded-tr-sm shadow-md"
                      : "bg-white dark:bg-slate-900 border-rose-200 dark:border-rose-900/50 text-slate-800 dark:text-slate-200 rounded-tl-sm shadow-sm"
                  }`}
                >
                  <p className="text-lg font-bold">{msg.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex w-full justify-start">
                <div className="bg-white dark:bg-slate-900 border-b-4 border-rose-200 dark:border-rose-900/50 rounded-2xl rounded-tl-sm px-5 py-3 shadow-sm">
                  <div className="flex gap-1.5 items-center h-6">
                    <div
                      className="w-2 h-2 rounded-full bg-rose-400 animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 rounded-full bg-rose-400 animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 rounded-full bg-rose-400 animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Chat Input or Victory Banner */}
          <div className="p-4 bg-white dark:bg-slate-950 border-t border-rose-200 dark:border-rose-900/50 relative z-10">
            {isMissionCompleted ? (
              <div className="flex flex-col items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-6 py-3 rounded-xl font-black text-lg uppercase tracking-widest border-2 border-green-300 dark:border-green-800 shadow-sm">
                  🎉 Sobreviveste!
                </div>
                <Button
                  onClick={() => router.push("/practice/survival")}
                  className="w-full h-14 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-black text-lg border-2 border-slate-900 border-b-4 active:border-b-2 active:translate-y-[2px] transition-all uppercase tracking-widest"
                >
                  Voltar à Segurança
                </Button>
              </div>
            ) : !hasStarted && messages.length === 0 ? (
              <Button
                onClick={startSession}
                disabled={isLoading}
                className="w-full h-14 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-lg border-2 border-rose-800 border-b-4 active:border-b-2 active:translate-y-[2px] transition-all uppercase tracking-widest shadow-[0_0_20px_rgba(225,29,72,0.4)] group animate-pulse hover:animate-none"
              >
                <PlayCircle className="w-6 h-6 mr-2 group-hover:scale-110 transition-transform" />
                {isLoading ? "A Ligar..." : "Começar Missão"}
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="A tua resposta..."
                  className="flex-1 min-w-0 h-14 bg-slate-100 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl px-4 text-lg font-bold text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-rose-400 dark:focus:border-rose-600 transition-colors shadow-inner"
                  disabled={isLoading || showOnboarding}
                />
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading || showOnboarding}
                  className="h-14 w-14 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white border-2 border-rose-800 border-b-4 active:border-b-2 active:translate-y-[2px] transition-all p-0 flex items-center justify-center shrink-0 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                >
                  <Send className="w-6 h-6 ml-1" strokeWidth={2.5} />
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
