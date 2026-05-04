"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export const StepWelcome = () => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center sm:justify-start sm:pt-6 px-4 text-center overflow-hidden">
      {/* Background Decor (Juicy Particles) */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: [0.2, 0.5, 0.2], 
              scale: [1, 1.2, 1],
              y: [0, -20, 0],
              x: [0, 10, 0]
            }}
            transition={{ 
              duration: 3 + i, 
              repeat: Infinity, 
              delay: i * 0.5 
            }}
            className="absolute rounded-full bg-[#58cc02]/10"
            style={{
              width: Math.random() * 100 + 50,
              height: Math.random() * 100 + 50,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="relative w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 mb-6 shrink-0 z-10"
      >
        {/* Floating Animation for Marco */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="w-full h-full"
        >
          <Image
            src="/marco.png"
            alt="Marco Mascot"
            fill
            className="object-contain drop-shadow-[0_10px_15px_rgba(88,204,2,0.3)]"
          />
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
        className="relative w-full max-w-sm z-10"
      >
        {/* Speech Bubble with Elastic Pop */}
        <div className="bg-white border-4 border-[#e5e5e5] rounded-[2.5rem] p-6 sm:p-8 shadow-[0_8px_0_#e5e5e5] relative mb-6">
          <h1 className="text-2xl sm:text-3xl font-black text-[#042c60] leading-tight">
            Olá! Eu sou o <br />
            <span className="text-[#58cc02] text-4xl sm:text-5xl inline-block mt-2 hover:scale-110 transition-transform cursor-default">Marco!</span>
          </h1>
          
          {/* Bubble Tail */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-white border-l-4 border-t-4 border-[#e5e5e5] rotate-45" />
        </div>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-lg sm:text-xl font-bold text-gray-500 px-4 leading-relaxed"
        >
          Vou ajudar-te a dominar um <span className="text-sky-500">novo idioma</span> com confiança. 
          <span className="inline-block animate-bounce ml-1">✨</span>
        </motion.p>
      </motion.div>
    </div>
  );
};
