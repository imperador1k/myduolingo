"use client";

import { useOnboardingStore } from "@/store/use-onboarding-store";
import { motion } from "framer-motion";
import Image from "next/image";
import { Users } from "lucide-react";

interface StepCourseProps {
  courses: {
    id: number;
    title: string;
    imageSrc: string;
    studentCount: number;
  }[];
}

export const StepCourse = ({ courses }: StepCourseProps) => {
  const { selectedCourse, setCourse } = useOnboardingStore();

  return (
    <div className="w-full h-full flex flex-col pt-4 max-w-2xl mx-auto">
      {/* Marco Intro Section */}
      <div className="flex items-center gap-4 mb-6 px-2">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
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
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white border-2 border-gray-200 rounded-2xl p-4 shadow-sm relative"
        >
          <p className="text-sm sm:text-base font-bold text-[#4b4b4b]">
            Estou tão entusiasmado! Qual destes idiomas queres dominar? 🌟
          </p>
          <div className="absolute left-[-10px] top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-l-2 border-b-2 border-gray-200 rotate-45" />
        </motion.div>
      </div>

      <h1 className="text-2xl sm:text-3xl font-black text-[#042c60] mb-6 px-2">
        Escolhe o teu <span className="text-[#58cc02]">Caminho</span>
      </h1>

      <div className="grid grid-cols-2 gap-4 w-full px-2">
        {courses.map((course, index) => {
          const isSelected = selectedCourse === course.id;

          return (
            <motion.button
              key={course.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * index }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCourse(course.id)}
              className={`
                relative flex flex-col items-center p-4 sm:p-6 rounded-2xl border-2 transition-all group
                ${isSelected 
                  ? "border-[#58cc02] bg-[#f7fff0] shadow-[0_4px_0_#46a302]" 
                  : "border-gray-200 bg-white shadow-[0_4px_0_#e5e5e5] hover:bg-gray-50 active:shadow-none active:translate-y-[2px]"}
              `}
            >
              {/* Badge for popular courses */}
              {course.studentCount > 100 && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-white text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-wider z-10 shadow-sm">
                  Popular
                </div>
              )}

              <div className="relative w-16 h-16 sm:w-24 sm:h-24 mb-4 transition-transform group-hover:scale-110 duration-300">
                <Image
                  src={course.imageSrc}
                  alt={course.title}
                  fill
                  priority={index < 4}
                  className="object-contain drop-shadow-md"
                />
              </div>

              <div className="text-center">
                <p className={`font-black text-base sm:text-xl mb-1 ${isSelected ? "text-[#58cc02]" : "text-[#4b4b4b]"}`}>
                  {course.title}
                </p>
                <div className="flex items-center justify-center gap-1.5 text-[#afafaf]">
                  <Users size={12} className="sm:w-4 sm:h-4" />
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-tight">
                    {course.studentCount.toLocaleString()} Alunos
                  </span>
                </div>
              </div>
              
              {isSelected && (
                <div className="absolute top-3 right-3 w-6 h-6 bg-[#58cc02] rounded-full flex items-center justify-center animate-in zoom-in duration-300 shadow-sm">
                  <svg width="12" height="8" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1.5 5.5L4.5 8.5L12.5 1.5" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
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
