"use client";

import { motion } from "framer-motion";
import { DuoAnimationLottie } from "@/components/ui/lottie-animation";

export const StepGetReady = () => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center sm:justify-start sm:pt-6 text-center px-4 overflow-hidden relative">
      {/* Background Decor (Sky Particles) */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: [0.1, 0.3, 0.1], 
              scale: [1, 1.3, 1],
              y: [0, 30, 0],
              x: [0, -15, 0]
            }}
            transition={{ 
              duration: 4 + i, 
              repeat: Infinity, 
              delay: i * 0.7 
            }}
            className="absolute rounded-full bg-sky-400/20"
            style={{
              width: Math.random() * 120 + 60,
              height: Math.random() * 120 + 60,
              right: `${Math.random() * 100}%`,
              bottom: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      {/* Glow Effect behind Mascot */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-sky-200/20 blur-[80px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ y: 50, opacity: 0, scale: 0.5 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 15 }}
        className="w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 mb-8 shrink-0 z-10"
      >
        <motion.div
          animate={{ 
            y: [0, -15, 0],
            rotate: [0, 2, 0, -2, 0]
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="w-full h-full"
        >
          <DuoAnimationLottie className="w-full h-full drop-shadow-[0_15px_25px_rgba(56,189,248,0.4)]" />
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, type: "spring", stiffness: 150 }}
        className="max-w-[90%] sm:max-w-md flex flex-col gap-4 z-10"
      >
        <h2 className="text-3xl sm:text-4xl font-black text-[#042c60] leading-tight">
          Estás preparado para <br />
          <motion.span 
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-sky-400 text-4xl sm:text-5xl inline-block mt-1"
          >
            alavancar
          </motion.span> <br className="sm:hidden" />
          o teu sucesso?
        </h2>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="bg-white/50 backdrop-blur-sm border-2 border-sky-100 rounded-2xl p-4 shadow-sm"
        >
          <p className="text-base sm:text-lg font-bold text-gray-500 leading-relaxed italic">
            "Preparei algo especial para ti. Vamos começar a tua jornada épica! 🚀"
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};
