"use client";

import { Trophy } from "lucide-react";
import { UnitCardIsland } from "@/components/shared/unit-card-island";
import { useLessonModalStore } from "@/store/use-lesson-modal-store";
import { motion } from "framer-motion";

type Challenge = {
    id: number;
    challengeProgress?: { completed: boolean }[];
};

type Lesson = {
    id: number;
    title: string;
    completed: boolean;
    isCurrent: boolean;
    isLocked: boolean;
    challenges?: Challenge[];
};

type Unit = {
    id: number;
    title: string;
    description: string;
    lessons: Lesson[];
    isActive: boolean;
    isCompleted: boolean;
};

export const UnitIslandFeed = ({ processedUnits, noHearts }: { processedUnits: Unit[], noHearts: boolean }) => {
    const { openModal } = useLessonModalStore();

    return (
        <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={{
                hidden: {},
                visible: {
                    transition: {
                        staggerChildren: 0.2
                    }
                }
            }}
            className="relative w-full flex flex-col items-center gap-12 sm:gap-16 pb-0"
        >
            {processedUnits.map((unit: Unit, unitIndex: number) => (
                <motion.div 
                    id={`unit-${unit.id}`} 
                    key={unit.id} 
                    variants={{
                        hidden: { opacity: 0, y: 30, scale: 0.95 },
                        visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: "easeOut" } }
                    }}
                    className="relative w-full flex flex-col items-center scroll-mt-24"
                >
                    <UnitCardIsland
                        unitIndex={unitIndex}
                        unitTitle={unit.title}
                        title={unit.title}
                        description={unit.description}
                        lessons={unit.lessons}
                        isActive={unit.isActive}
                        isCompleted={unit.isCompleted}
                        align={unitIndex % 2 === 0 ? "left" : "right"}
                        noHearts={noHearts}
                        onLessonClick={openModal}
                    />

                    {/* 🏆 Course Completion Monument on the Final Unit */}
                    {unitIndex === processedUnits.length - 1 && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5 }}
                            className="mt-8 z-10 flex flex-col items-center"
                        >
                            <div className="w-32 h-36 bg-gradient-to-t from-amber-400 to-amber-200 rounded-[2.5rem] border-4 border-amber-100 border-b-[16px] border-b-amber-500 shadow-[0_20px_40px_rgba(251,191,36,0.4)] flex flex-col items-center justify-center relative hover:-translate-y-2 transition-transform cursor-default">
                                <Trophy className="w-16 h-16 text-white drop-shadow-md animate-bounce" strokeWidth={3} />
                                <div className="absolute -top-4 -right-4 w-12 h-12 bg-white rounded-full flex flex-col items-center justify-center shadow-lg border-2 border-slate-100 rotate-12">
                                    <span className="text-xl leading-none">🌟</span>
                                </div>
                            </div>
                            <div className="mt-6 bg-white/90 backdrop-blur-md px-6 py-4 rounded-3xl border-2 border-slate-200 border-b-[6px] shadow-xl text-center relative z-10 w-max max-w-[90vw]">
                                <p className="font-black text-amber-500 uppercase tracking-[0.15em] text-sm sm:text-base">Parabéns!</p>
                                <p className="font-bold text-slate-500 text-xs sm:text-sm mt-1">Completaste este curso épico</p>
                            </div>
                        </motion.div>
                    )}
                </motion.div>
            ))}
        </motion.div>
    );
};
