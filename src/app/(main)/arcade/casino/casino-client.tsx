"use client";

import { useState } from "react";
import {
  Coins,
  Zap,
  ShieldQuestion,
  ChevronLeft,
  Volume2,
  VolumeX,
  Swords,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

type GameState = "LOBBY" | "DOUBLE_OR_NOTHING" | "WORD_SNIPER";

export default function CasinoClient() {
  const [gameState, setGameState] = useState<GameState | "WORD_SNIPER">(
    "LOBBY",
  );
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Mock Currency
  const [arcadeCoins, setArcadeCoins] = useState(1500);

  // MOCK: Double or Nothing State
  const [donPot, setDonPot] = useState(0);
  const [donWordIndex, setDonWordIndex] = useState(0);
  const [donBuyIn, setDonBuyIn] = useState<10 | 50 | 100>(50);
  const [activeWords, setActiveWords] = useState<any[]>([]);

  // We have 6 mock words
  const mockWords = [
    { en: "Cat", pt: "Gato", options: ["Gato", "Cão", "Rato", "Pato"] },
    { en: "Apple", pt: "Maçã", options: ["Pera", "Maçã", "Uva", "Banana"] },
    {
      en: "To run",
      pt: "Correr",
      options: ["Andar", "Saltar", "Correr", "Nadar"],
    },
    {
      en: "Always",
      pt: "Sempre",
      options: ["Nunca", "Sempre", "Às vezes", "Hoje"],
    },
    {
      en: "Ephemeral",
      pt: "Efémero",
      options: ["Efémero", "Eterno", "Forte", "Longo"],
    },
    {
      en: "Serendipity",
      pt: "Serendipidade",
      options: ["Serendipidade", "Tristeza", "Azar", "Destino"],
    },
  ];

  // MOCK: Word Sniper State
  const [wsCards, setWsCards] = useState<any[]>([]); // { id, text, type: 'en'|'pt', pairId }
  const [wsSelected, setWsSelected] = useState<number | null>(null);
  const [wsMatched, setWsMatched] = useState<number[]>([]);
  const wsBuyIn = 200;

  const mockSniperPairs = [
    { id: 1, en: "Car", pt: "Carro" },
    { id: 2, en: "House", pt: "Casa" },
    { id: 3, en: "Book", pt: "Livro" },
    { id: 4, en: "Water", pt: "Água" },
    { id: 5, en: "Sun", pt: "Sol" },
    { id: 6, en: "Moon", pt: "Lua" },
    { id: 7, en: "Fire", pt: "Fogo" },
    { id: 8, en: "Tree", pt: "Árvore" },
  ];

  const handleStartDoubleOrNothing = () => {
    if (arcadeCoins < donBuyIn) return;

    // Determine words based on bet size:
    // 10 Coins -> 2 words
    // 50 Coins -> 4 words
    // 100 Coins -> 6 words
    const numWords = donBuyIn === 10 ? 2 : donBuyIn === 50 ? 4 : 6;
    setActiveWords(mockWords.slice(0, numWords));

    setArcadeCoins((prev) => prev - donBuyIn);
    setDonPot(donBuyIn * 2);
    setDonWordIndex(0);
    setGameState("DOUBLE_OR_NOTHING");
  };

  const handleDonAnswer = (answer: string) => {
    const correct = activeWords[donWordIndex].pt === answer;
    if (correct) {
      if (donWordIndex === activeWords.length - 1) {
        // You beat the game!
        setArcadeCoins((prev) => prev + donPot * 2);
        setGameState("LOBBY");
      } else {
        setDonPot((prev) => prev * 2);
        setDonWordIndex((prev) => prev + 1);
      }
    } else {
      // Lose everything
      setDonPot(0);
      setGameState("LOBBY");
    }
  };

  const handleCashOut = () => {
    setArcadeCoins((prev) => prev + donPot);
    setGameState("LOBBY");
  };

  const handleStartWordSniper = () => {
    if (arcadeCoins < wsBuyIn) return;
    setArcadeCoins((prev) => prev - wsBuyIn);

    const cards: any[] = [];
    mockSniperPairs.forEach((pair) => {
      cards.push({
        id: `${pair.id}-en`,
        text: pair.en,
        type: "en",
        pairId: pair.id,
      });
      cards.push({
        id: `${pair.id}-pt`,
        text: pair.pt,
        type: "pt",
        pairId: pair.id,
      });
    });
    // Shuffle
    cards.sort(() => Math.random() - 0.5);

    setWsCards(cards);
    setWsSelected(null);
    setWsMatched([]);
    setGameState("WORD_SNIPER");
  };

  const handleWsCardClick = (index: number) => {
    const card = wsCards[index];
    if (wsMatched.includes(card.pairId)) return;

    if (wsSelected === index) {
      setWsSelected(null);
      return;
    }

    if (wsSelected === null) {
      setWsSelected(index);
    } else {
      const selected = wsCards[wsSelected];
      if (selected.pairId === card.pairId && selected.type !== card.type) {
        // Match!
        const newMatched = [...wsMatched, card.pairId];
        setWsMatched(newMatched);
        setWsSelected(null);
        if (newMatched.length === mockSniperPairs.length) {
          // Win!
          setArcadeCoins((prev) => prev + wsBuyIn * 3);
          setGameState("LOBBY");
        }
      } else {
        // Wrong match -> just deselect for now (or penalize time if we had a state for it)
        setWsSelected(null);
      }
    }
  };

  const handleSniperTimeout = () => {
    // Lose
    setGameState("LOBBY");
  };

  return (
    <div className="flex-1 flex flex-col relative w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Link href="/arcade">
          <button className="h-12 w-12 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors">
            <ChevronLeft className="w-6 h-6 text-slate-600 dark:text-slate-300" />
          </button>
        </Link>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-yellow-400 text-yellow-950 font-black px-4 py-2 rounded-full border-2 border-yellow-600 shadow-[2px_2px_0_0_#ca8a04]">
            <Coins className="w-5 h-5 fill-yellow-600" />
            <span>{arcadeCoins} AC</span>
          </div>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="h-12 w-12 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
          >
            {soundEnabled ? (
              <Volume2 className="w-5 h-5 text-slate-600 dark:text-slate-300" />
            ) : (
              <VolumeX className="w-5 h-5 text-slate-600 dark:text-slate-300" />
            )}
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {gameState === "LOBBY" && (
          <motion.div
            key="lobby"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex-1"
          >
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-6xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 drop-shadow-[0_4px_4px_rgba(0,0,0,0.3)]">
                Neon Casino
              </h1>
              <p className="text-slate-500 dark:text-slate-400 font-bold mt-4">
                Aposta as tuas moedas em desafios de conhecimento.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Double or Nothing */}
              <div className="bg-slate-900 border-[4px] border-cyan-500 rounded-none p-6 shadow-[8px_8px_0_0_#06b6d4] flex flex-col group transition-transform hover:-translate-y-2 relative overflow-hidden">
                <div className="absolute top-[-50px] right-[-50px] w-40 h-40 bg-cyan-500/20 rounded-full blur-3xl group-hover:bg-cyan-500/40 transition-colors"></div>
                <div className="h-24 w-24 bg-cyan-500 border-b-[6px] border-cyan-700 flex items-center justify-center rounded-[1.5rem] mb-6 shadow-inner">
                  <ShieldQuestion
                    className="w-12 h-12 text-white"
                    strokeWidth={2.5}
                  />
                </div>
                <h2 className="text-2xl font-black text-white uppercase tracking-wider mb-2">
                  Double or Nothing
                </h2>
                <p className="text-cyan-100/70 font-medium mb-8">
                  Acerta na tradução em 5s e dobra o pote. Erras e perdes tudo.
                  Consegues aguentar a pressão?
                </p>
                <div className="mt-auto">
                  <div className="flex gap-2 mb-4 justify-between items-center">
                    <span className="text-xs font-black text-cyan-400 uppercase tracking-widest">
                      Buy-in:
                    </span>
                    <div className="flex bg-slate-800 rounded-lg p-1 border-2 border-cyan-800">
                      {[10, 50, 100].map((val) => (
                        <button
                          key={val}
                          onClick={() => setDonBuyIn(val as any)}
                          className={`px-3 py-1 text-xs font-black rounded-md transition-colors ${donBuyIn === val ? "bg-cyan-500 text-slate-900" : "text-cyan-600 hover:text-cyan-400"}`}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="text-xs font-black text-cyan-500 mb-2 uppercase tracking-widest text-center">
                    {donBuyIn === 10
                      ? "2 Palavras (Risco Baixo)"
                      : donBuyIn === 50
                        ? "4 Palavras (Risco Médio)"
                        : "6 Palavras (Hardcore)"}
                  </div>
                  <button
                    onClick={handleStartDoubleOrNothing}
                    disabled={arcadeCoins < donBuyIn}
                    className="w-full h-14 bg-cyan-400 hover:bg-cyan-300 text-cyan-950 font-black uppercase tracking-widest text-lg border-b-[6px] border-cyan-600 active:border-b-0 active:translate-y-[6px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Jogar
                  </button>
                </div>
              </div>

              {/* Word Sniper */}
              <div className="bg-slate-900 border-[4px] border-pink-500 rounded-none p-6 shadow-[8px_8px_0_0_#ec4899] flex flex-col group transition-transform hover:-translate-y-2 relative overflow-hidden">
                <div className="absolute top-[-50px] right-[-50px] w-40 h-40 bg-pink-500/20 rounded-full blur-3xl group-hover:bg-pink-500/40 transition-colors"></div>

                <div className="h-24 w-24 bg-pink-500 border-b-[6px] border-pink-700 flex items-center justify-center rounded-[1.5rem] mb-6 shadow-inner">
                  <Swords className="w-12 h-12 text-white" strokeWidth={2.5} />
                </div>
                <h2 className="text-2xl font-black text-white uppercase tracking-wider mb-2">
                  Word Sniper
                </h2>
                <p className="text-pink-100/70 font-medium mb-8">
                  Combina 16 palavras em 15 segundos. Tudo ou nada. Velocidade é
                  a chave.
                </p>
                <div className="mt-auto">
                  <div className="text-xs font-black text-pink-400 mb-2 uppercase tracking-widest">
                    Buy-in: {wsBuyIn} Coins
                  </div>
                  <button
                    onClick={handleStartWordSniper}
                    disabled={arcadeCoins < wsBuyIn}
                    className="w-full h-14 bg-pink-500 hover:bg-pink-400 text-white font-black uppercase tracking-widest text-lg border-b-[6px] border-pink-700 active:border-b-0 active:translate-y-[6px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Jogar
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {gameState === "DOUBLE_OR_NOTHING" && (
          <motion.div
            key="don"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="flex-1 flex flex-col items-center justify-center max-w-xl mx-auto w-full py-10"
          >
            {/* The Pot */}
            <div className="text-center mb-12">
              <div className="text-cyan-500 font-black uppercase tracking-widest mb-2 text-sm">
                Prémio Atual
              </div>
              <div className="text-6xl font-black text-white drop-shadow-[0_4px_0_#06b6d4]">
                {donPot} AC
              </div>
            </div>

            {/* The Question */}
            <div className="w-full bg-slate-900 border-[4px] border-cyan-500 rounded-none p-8 mb-8 shadow-[8px_8px_0_0_#06b6d4] relative">
              <div className="absolute top-0 left-0 w-full h-2 bg-slate-800">
                <motion.div
                  className="h-full bg-cyan-400"
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: 5, ease: "linear" }}
                  onAnimationComplete={() => handleDonAnswer("TIMEOUT_FAIL")}
                  key={`timer-${donWordIndex}`}
                />
              </div>
              <div className="text-center mt-4">
                <p className="text-slate-400 font-bold uppercase tracking-widest mb-2 text-sm">
                  O que significa?
                </p>
                <h2 className="text-4xl font-black text-white">
                  {activeWords[donWordIndex]?.en}
                </h2>
              </div>
            </div>

            {/* Options */}
            <div className="grid grid-cols-2 gap-4 w-full">
              {activeWords[donWordIndex]?.options.map(
                (opt: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => handleDonAnswer(opt)}
                    className="h-16 bg-slate-800 hover:bg-cyan-900 text-white font-black text-xl border-[4px] border-slate-700 hover:border-cyan-500 transition-colors shadow-[4px_4px_0_0_#334155] hover:shadow-[4px_4px_0_0_#06b6d4] active:translate-y-1 active:shadow-none"
                  >
                    {opt}
                  </button>
                ),
              )}
            </div>

            {/* Cash Out */}
            {donWordIndex > 0 && (
              <button
                onClick={handleCashOut}
                className="mt-12 h-14 px-8 bg-yellow-400 hover:bg-yellow-300 text-yellow-950 font-black uppercase tracking-widest text-lg border-[4px] border-yellow-600 active:border-b-[4px] active:translate-y-1 transition-all shadow-[4px_4px_0_0_#ca8a04]"
              >
                Levantar {donPot} AC (Desistir)
              </button>
            )}
          </motion.div>
        )}

        {gameState === "WORD_SNIPER" && (
          <motion.div
            key="sniper"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="flex-1 flex flex-col items-center max-w-3xl mx-auto w-full py-10"
          >
            <div className="w-full mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-pink-500 font-black uppercase tracking-widest text-sm">
                  Tempo Restante
                </span>
                <span className="text-pink-500 font-black uppercase tracking-widest text-sm">
                  Prémio: {wsBuyIn * 3} AC
                </span>
              </div>
              <div className="w-full h-4 bg-slate-900 border-[4px] border-pink-500 rounded-none shadow-[4px_4px_0_0_#ec4899] relative">
                <motion.div
                  className="h-full bg-pink-400"
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: 15, ease: "linear" }}
                  onAnimationComplete={handleSniperTimeout}
                />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 w-full">
              {wsCards.map((card, i) => {
                const isMatched = wsMatched.includes(card.pairId);
                const isSelected = wsSelected === i;

                return (
                  <button
                    key={i}
                    onClick={() => handleWsCardClick(i)}
                    disabled={isMatched}
                    className={`
                      h-24 md:h-32 font-black text-lg md:text-xl border-[4px] transition-all active:scale-95
                      ${
                        isMatched
                          ? "bg-slate-800 border-slate-700 text-slate-600 shadow-none opacity-50"
                          : isSelected
                            ? "bg-pink-600 border-pink-300 text-white shadow-[0_0_20px_rgba(236,72,153,0.8)] scale-105 z-10"
                            : "bg-slate-900 border-pink-500 text-white shadow-[4px_4px_0_0_#ec4899] hover:bg-slate-800"
                      }
                    `}
                  >
                    {card.text}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
