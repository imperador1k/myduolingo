"use client";

import { useOnboardingStore } from "@/store/use-onboarding-store";
import { motion } from "framer-motion";
import Image from "next/image";

const MOTIVATIONS = [
  { id: "travel", title: "Viagens", description: "Preparar para novas aventuras", icon: "✈️", color: "#3b82f6" },
  { id: "career", title: "Carreira", description: "Impulsionar o meu currículo", icon: "💼", color: "#f59e0b" },
  { id: "brain", title: "Exercício Mental", description: "Manter a mente afiada", icon: "🧠", color: "#8b5cf6" },
  { id: "fun", title: "Diversão", description: "Aprender por puro prazer", icon: "😎", color: "#ec4899" },
];

export const StepMotivation = () => {
  const { motivation, setMotivation } = useOnboardingStore();

  return (
    <div className="w-full h-full flex flex-col pt-4 max-w-2xl mx-auto px-2">
      {/* Marco Intro Section */}
      <div className="flex items-center gap-4 mb-8">
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0"
        >
          <Image
            src="/marco.png"
            alt="Marco"
            fill
            className="object-contain"
          />
        </motion.div>
        
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="relative bg-white border-2 border-gray-200 rounded-2xl p-4 shadow-sm"
        >
          <p className="text-sm sm:text-base font-bold text-[#4b4b4b]">
            Boa escolha! Agora diz-me, o que te trouxe até aqui? 🧐
          </p>
          <div className="absolute left-[-10px] top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-l-2 border-b-2 border-gray-200 rotate-45" />
        </motion.div>
      </div>

      <h1 className="text-2xl sm:text-3xl font-black text-[#042c60] mb-6 text-left px-2">
        Qual é o teu <span className="text-sky-500">objetivo</span>?
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full">
        {MOTIVATIONS.map((item, index) => {
          const isSelected = motivation === item.id;

          return (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setMotivation(item.id)}
              className={`
                group relative flex items-start gap-4 p-4 sm:p-5 rounded-2xl border-2 transition-all text-left
                ${isSelected 
                  ? "border-[#58cc02] bg-[#f7fff0] shadow-[0_4px_0_#46a302]" 
                  : "border-gray-200 bg-white shadow-[0_4px_0_#e5e5e5] hover:bg-gray-50 active:shadow-none active:translate-y-[2px]"}
              `}
            >
              <div 
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center text-2xl sm:text-3xl shrink-0 transition-transform group-hover:scale-110"
                style={{ backgroundColor: `${item.color}15` }}
              >
                {item.icon}
              </div>

              <div className="flex flex-col">
                <span className={`font-black text-base sm:text-lg ${isSelected ? "text-[#58cc02]" : "text-[#4b4b4b]"}`}>
                  {item.title}
                </span>
                <span className="text-xs sm:text-sm font-bold text-gray-400">
                  {item.description}
                </span>
              </div>
              
              {isSelected && (
                <div className="absolute top-4 right-4 w-6 h-6 bg-[#58cc02] rounded-full flex items-center justify-center animate-in zoom-in duration-300">
                  <svg width="14" height="10" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1.5 5.5L4.5 8.5L12.5 1.5" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
