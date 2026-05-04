"use client";

import { motion } from "framer-motion";
import { HappyStarLottie } from "@/components/ui/lottie-animation";

export const StepPlacementResult = () => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center sm:justify-start sm:pt-6 text-center px-4 max-w-xl mx-auto">
      {/* Celebratory Animation */}
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 mb-2 sm:mb-4"
      >
        <HappyStarLottie className="w-full h-full" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-2 sm:space-y-3"
      >
        <div className="space-y-0.5">
          <h2 className="text-2xl sm:text-3xl font-black text-[#042c60] leading-tight">
            Incrível! 🏆
          </h2>
          <p className="text-lg sm:text-xl font-black text-[#58cc02]">
            Já tens algum <span className="underline decoration-4 underline-offset-4">poder</span> acumulado!
          </p>
        </div>
        
        <div className="bg-white border-4 border-[#e5e5e5] rounded-3xl p-4 sm:p-6 shadow-[0_6px_0_#e5e5e5] relative overflow-hidden group hover:translate-y-[-2px] transition-transform">
          {/* Subtle background glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-transparent to-yellow-50/50 opacity-0 group-hover:opacity-100 transition-opacity" />
          
          <p className="text-base sm:text-lg font-bold text-gray-600 relative z-10">
            Com base nos teus conhecimentos, o Marco decidiu colocar-te na <span className="text-sky-500 font-black">Secção 2</span>.
          </p>
          
          <div className="mt-3 flex items-center justify-center gap-2 relative z-10">
            <span className="bg-amber-100 text-amber-600 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
              Atalho Ativado
            </span>
            <span className="bg-green-100 text-green-600 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
              +50 XP Bónus
            </span>
          </div>
        </div>

        <p className="text-sm sm:text-base font-bold text-gray-400 animate-pulse pt-2">
          Estás pronto para o próximo nível? 🚀
        </p>
      </motion.div>
    </div>
  );
};
