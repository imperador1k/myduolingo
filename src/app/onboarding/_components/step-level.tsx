"use client";

import { useOnboardingStore } from "@/store/use-onboarding-store";
import { motion } from "framer-motion";
import Image from "next/image";

export const StepLevel = () => {
  const { experienceLevel, setExperienceLevel, setStep } = useOnboardingStore();

  const handleSelect = (level: "novato" | "experiente") => {
    setExperienceLevel(level);
    
    // Auto-advance with a slight delay for the tactile click animation
    setTimeout(() => {
        if (level === "novato") setStep(7); // Skip placement test result
        if (level === "experiente") setStep(6); // Go to placement test result
    }, 400); 
  };

  return (
    <div className="w-full h-full flex flex-col pt-4 max-w-2xl mx-auto px-2">
      {/* Marco Intro Section */}
      <div className="flex items-center gap-4 mb-8">
        <motion.div
          initial={{ scale: 0, rotate: 10 }}
          animate={{ scale: 1, rotate: 0 }}
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
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white border-2 border-gray-200 rounded-2xl p-4 shadow-sm relative"
        >
          <p className="text-sm sm:text-base font-bold text-[#4b4b4b]">
            Não te preocupes, vamos encontrar o ponto de partida ideal para ti! 💪
          </p>
          <div className="absolute left-[-10px] top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-l-2 border-b-2 border-gray-200 rotate-45" />
        </motion.div>
      </div>

      <h1 className="text-2xl sm:text-3xl font-black text-[#042c60] mb-8 text-left">
        Quanto <span className="text-amber-500">sabes</span> do idioma?
      </h1>

      <div className="grid grid-cols-1 gap-4 w-full">
        {/* Option: Novato */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => handleSelect("novato")}
          className={`
            group relative flex items-center gap-5 p-6 rounded-3xl border-2 transition-all text-left
            ${experienceLevel === "novato"
              ? "border-[#58cc02] bg-[#f7fff0] shadow-[0_6px_0_#46a302]" 
              : "border-gray-200 bg-white shadow-[0_6px_0_#e5e5e5] hover:bg-gray-50 active:shadow-none active:translate-y-[2px]"}
          `}
        >
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-2xl flex items-center justify-center text-4xl sm:text-5xl shrink-0 group-hover:rotate-6 transition-transform">
            🌱
          </div>
          <div className="flex flex-col">
            <h3 className="font-black text-lg sm:text-2xl text-[#042c60] mb-1">
              Sou novo nisto
            </h3>
            <p className="text-sm sm:text-base font-bold text-gray-400">
              Vou começar do zero absoluto, passo a passo.
            </p>
          </div>
        </motion.button>

        {/* Option: Experiente */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => handleSelect("experiente")}
          className={`
            group relative flex items-center gap-5 p-6 rounded-3xl border-2 transition-all text-left
            ${experienceLevel === "experiente"
              ? "border-sky-500 bg-[#f0f9ff] shadow-[0_6px_0_#0369a1]" 
              : "border-gray-200 bg-white shadow-[0_6px_0_#e5e5e5] hover:bg-gray-50 active:shadow-none active:translate-y-[2px]"}
          `}
        >
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-sky-100 rounded-2xl flex items-center justify-center text-4xl sm:text-5xl shrink-0 group-hover:-rotate-6 transition-transform">
            ⭐
          </div>
          <div className="flex flex-col">
            <h3 className="font-black text-lg sm:text-2xl text-[#042c60] mb-1">
              Já sei um pouco
            </h3>
            <p className="text-sm sm:text-base font-bold text-gray-400">
              Quero fazer um teste de nível para saltar o básico.
            </p>
          </div>
          
          {/* Tag for the shortcut */}
          <div className="absolute -top-3 right-6 bg-sky-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">
            Atalho
          </div>
        </motion.button>
      </div>
    </div>
  );
};
