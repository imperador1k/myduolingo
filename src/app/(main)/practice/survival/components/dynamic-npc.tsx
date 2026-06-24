"use client";

import { motion } from "framer-motion";

interface DynamicNPCProps {
  baseImage: string;
  clothes: string[];
  isGrammarCorrect: boolean | null; // null for initial state
}

export const DynamicNPC = ({
  baseImage,
  clothes,
  isGrammarCorrect,
}: DynamicNPCProps) => {
  // Animação de erro: Um abanão horizontal rápido ("shaking head")
  const shakeAnimation = {
    x: [0, -10, 10, -10, 10, 0],
    transition: { duration: 0.4 },
  };

  // Se o isGrammarCorrect for explicitamente falso, ativamos o abanão
  const currentAnimation = isGrammarCorrect === false ? shakeAnimation : {};

  return (
    <motion.div
      className="relative w-64 h-96 mx-auto flex items-end justify-center overflow-hidden"
      animate={currentAnimation}
      // Re-trigger animation upon prop change if it stays false for consecutive mistakes
      key={Math.random()}
    >
      {/* Base Body */}
      <img
        src={baseImage}
        alt="NPC Body"
        className="absolute bottom-0 left-0 w-full h-full object-contain z-0 select-none drop-shadow-md"
        draggable={false}
      />

      {/* Roupas Sobrepostas (Paper Doll Layering) */}
      {clothes.map((clothingSrc, index) => (
        <img
          key={index}
          src={clothingSrc}
          alt={`NPC Clothing ${index}`}
          className="absolute bottom-0 left-0 w-full h-full object-contain select-none drop-shadow-sm"
          draggable={false}
          style={{ zIndex: 10 + index }} // Explicit z-indexing guarantees layering
        />
      ))}
    </motion.div>
  );
};
