"use client";

import { motion } from "framer-motion";

export const LivingBackground = () => {
    return (
        <div className="fixed inset-0 pointer-events-none -z-20 overflow-hidden bg-white">
            {/* 
                Performance Note: Large blurs are expensive on mobile GPUs.
                We use CSS variables to scale down effects on smaller screens.
            */}
            <style jsx>{`
                .glow-orb {
                    will-change: transform, opacity;
                    filter: blur(var(--blur-radius, 120px));
                }
                @media (max-width: 768px) {
                    .glow-orb {
                        --blur-radius: 40px;
                    }
                }
            `}</style>

            {/* Soft Glowing Orbs */}
            <motion.div 
                animate={{ 
                    x: [0, 50, -30, 0],
                    y: [0, -100, 50, 0],
                    scale: [1, 1.2, 0.9, 1]
                }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="glow-orb absolute top-[10%] left-[10%] w-[500px] h-[500px] bg-emerald-100/30 rounded-full"
            />
            <motion.div 
                animate={{ 
                    x: [0, -80, 40, 0],
                    y: [0, 120, -60, 0],
                    scale: [1, 0.8, 1.1, 1]
                }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear", delay: 2 }}
                className="glow-orb absolute bottom-[15%] right-[5%] w-[600px] h-[600px] bg-blue-100/20 rounded-full"
            />
            <motion.div 
                animate={{ 
                    x: [0, 100, -50, 0],
                    y: [0, 50, 100, 0],
                    opacity: [0.3, 0.6, 0.3]
                }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="glow-orb absolute top-[40%] right-[20%] w-[400px] h-[400px] bg-amber-100/10 rounded-full"
            />

            {/* Subtle Gradient Meshes */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white via-transparent to-transparent opacity-80" />
            
            {/* Grain Overlay - optimized with low opacity */}
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        </div>
    );
};
