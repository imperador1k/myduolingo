"use client";

import { motion } from "framer-motion";
import { UserPlus } from "lucide-react";

export const StepSignUp = () => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center sm:justify-start sm:pt-6 text-center px-4 max-w-xl mx-auto">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-20 h-20 sm:w-24 sm:h-24 bg-sky-100 text-sky-500 rounded-2xl flex items-center justify-center mb-6 sm:mb-8"
      >
        <UserPlus size={40} className="sm:w-12 sm:h-12" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="max-w-md"
      >
        <h2 className="text-2xl sm:text-3xl font-black text-[#042c60] leading-tight mb-3 sm:mb-4">
          Tudo pronto para salvar o teu <span className="text-sky-500">progresso</span>!
        </h2>
        
        <p className="text-base sm:text-lg font-bold text-gray-500 mb-6 sm:mb-8">
          Cria o teu perfil agora para começares a tua aventura e nunca mais parares de aprender.
        </p>

        <div className="flex flex-col gap-3">
            <div className="h-12 sm:h-14 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 font-bold">
                [Fluxo de Autenticação Integrado aqui]
            </div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">
                Ao clicar em continuar, o Marco criará a tua conta!
            </p>
        </div>
      </motion.div>
    </div>
  );
};
