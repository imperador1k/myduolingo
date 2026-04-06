"use client";

import { useState, useTransition } from "react";
import { Check, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { onSelectCourse } from "@/actions/user-progress";
import { updateCourseDetails } from "@/actions/courses";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

type Course = {
    id: number;
    title: string;
    imageSrc: string;
    language: string;
};

type Props = {
    courses: Course[];
    activeCourseId?: number;
};

// Language data with flags, colors, and native greetings
const languageData: Record<string, { flag: string; gradient: string; greeting: string; nativeName: string }> = {
    "Português": { flag: "🇵🇹", gradient: "from-green-400 to-red-400", greeting: "Olá!", nativeName: "Português" },
    "Espanhol": { flag: "🇪🇸", gradient: "from-red-400 to-yellow-400", greeting: "¡Hola!", nativeName: "Español" },
    "Francês": { flag: "🇫🇷", gradient: "from-blue-400 to-red-400", greeting: "Bonjour!", nativeName: "Français" },
    "Italiano": { flag: "🇮🇹", gradient: "from-green-400 to-red-400", greeting: "Ciao!", nativeName: "Italiano" },
    "Alemão": { flag: "🇩🇪", gradient: "from-slate-700 to-yellow-400", greeting: "Hallo!", nativeName: "Deutsch" },
    "Japonês": { flag: "🇯🇵", gradient: "from-red-400 to-white", greeting: "こんにちは!", nativeName: "日本語" },
    "Inglês": { flag: "🇬🇧", gradient: "from-blue-400 to-red-400", greeting: "Hello!", nativeName: "English" },
    "Coreano": { flag: "🇰🇷", gradient: "from-blue-400 to-red-400", greeting: "안녕하세요!", nativeName: "한국어" },
    "Chinês": { flag: "🇨🇳", gradient: "from-red-400 to-yellow-400", greeting: "你好!", nativeName: "中文" },
};

export const CoursesList = ({ courses, activeCourseId }: Props) => {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [selectedCourse, setSelectedCourse] = useState<number | null>(activeCourseId || null);
    const [editingCourseId, setEditingCourseId] = useState<number | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const handleSelect = (courseId: number) => {
        if (isPending) return;

        setSelectedCourse(courseId);

        startTransition(() => {
            onSelectCourse(courseId)
                .then(() => {
                    router.push("/learn");
                })
                .catch(console.error);
        });
    };

    const handleEditSubmit = async (courseId: number, event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        
        const form = event.currentTarget;
        const formData = new FormData(form);
        const file = formData.get("file") as File;
        const title = formData.get("title") as string;
        
        if (!title.trim()) {
            toast.error("O título não pode estar vazio.");
            return;
        }

        setIsSaving(true);
        toast.loading("A guardar alterações...", { id: `edit-${courseId}` });

        try {
            await updateCourseDetails(courseId, formData);
            toast.success("Curso atualizado com sucesso!", { id: `edit-${courseId}` });
            setEditingCourseId(null);
        } catch (error) {
            toast.error("Erro ao guardar as alterações", { id: `edit-${courseId}` });
        } finally {
            setIsSaving(false);
        }
    };

    const getLanguageData = (title: string, languageName: string) => {
        return languageData[languageName] || {
            flag: "🌍",
            gradient: "from-sky-400 to-blue-500",
            greeting: "Hello!",
            nativeName: languageName
        };
    };

    // Group courses by language
    const groupedCourses = courses.reduce((acc, course) => {
        if (!acc[course.language]) {
            acc[course.language] = [];
        }
        acc[course.language].push(course);
        return acc;
    }, {} as Record<string, Course[]>);

    return (
        <div className="space-y-16">
            <h2 className="text-2xl font-black text-slate-700 uppercase tracking-widest pl-2 flex items-center gap-3 mb-2">
                <span className="text-3xl drop-shadow-sm">🧭</span> Explorar Novos Idiomas
            </h2>
            {Object.entries(groupedCourses).map(([languageLabel, langCourses]) => {
                const data = getLanguageData(langCourses[0]?.title || languageLabel, languageLabel);

                return (
                    <div key={languageLabel} className="space-y-6">
                        <div className="flex items-center gap-3 pb-3 border-b-2 border-slate-100">
                            <span className="text-3xl drop-shadow-sm">{data.flag}</span>
                            <h3 className="text-2xl font-bold text-slate-800 tracking-tight">
                                {languageLabel}
                            </h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 pt-2">
                            {langCourses.map((course) => {
                                const isSelected = selectedCourse === course.id;
                                const isActive = activeCourseId === course.id;

                                return (
                                    <button
                                        key={course.id}
                                        onClick={() => handleSelect(course.id)}
                                        disabled={isPending}
                                        className={cn(
                                            "group relative overflow-hidden bg-white border-2 border-stone-200 border-b-[8px] rounded-[32px] p-6 lg:p-8 flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-1 hover:border-b-[10px] active:translate-y-1 active:border-b-[2px] cursor-pointer shadow-sm",
                                            (isSelected || isActive) && "border-green-400 !border-b-green-500 shadow-sm shadow-green-500/10",
                                            isPending && "opacity-50 cursor-not-allowed transform-none hover:shadow-none hover:border-b-[8px]"
                                        )}
                                    >
                                        {/* Absolute Top-Right Active Checkmark */}
                                        {(isSelected || isActive) && (
                                            <div className="absolute top-6 right-6 flex h-8 w-8 items-center justify-center rounded-full bg-green-500 shadow-sm z-20 animate-in fade-in zoom-in-50 duration-300">
                                                <Check className="h-5 w-5 text-white font-bold" />
                                            </div>
                                        )}

                                        {/* Top: Vibrant Circle + Vector */}
                                        <div className="relative w-32 h-32 mb-6 flex items-center justify-center">
                                            <div className={cn(
                                                "absolute inset-0 rounded-full opacity-20 group-hover:opacity-30 transition-opacity duration-500",
                                                `bg-gradient-to-br ${data.gradient}`
                                            )} />
                                            
                                            {course.imageSrc && course.imageSrc.startsWith("http") ? (
                                                <img src={course.imageSrc} alt={course.title} className="w-24 h-24 object-cover drop-shadow-xl z-10 group-hover:scale-110 transition-transform duration-300 rounded-[20px] aspect-square" />
                                            ) : (
                                                <span className="text-[5rem] drop-shadow-xl z-10 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300">
                                                    {data.flag}
                                                </span>
                                            )}
                                        </div>

                                        {/* Middle: Title & Pill */}
                                        <div className="flex flex-col items-center gap-3 w-full mb-8 z-10">
                                            <h3 className="font-black text-slate-700 text-3xl uppercase tracking-tight group-hover:text-blue-500 transition-colors">
                                                {course.title}
                                            </h3>
                                            <div className="bg-sky-50 text-sky-500 border-2 border-sky-100 font-bold px-4 py-1.5 rounded-xl flex items-center gap-2 text-[13px] uppercase tracking-widest">
                                                <span>👨‍🎓</span> 1.2M Alunos
                                            </div>
                                        </div>

                                        {/* Bottom: Giant COMEÇAR Button */}
                                        <div className="w-full mt-auto z-10">
                                            <div className={cn(
                                                "w-full py-4 rounded-[1rem] font-black text-xl tracking-widest uppercase border-2 flex items-center justify-center shadow-sm pointer-events-none transition-colors",
                                                (isSelected || isActive) 
                                                    ? "bg-[#58cc02] text-white border-transparent border-b-[6px] border-b-[#46a302]" 
                                                    : "bg-[#1CB0F6] text-white border-transparent border-b-[6px] border-b-[#0092d6]"
                                            )}>
                                                {(isSelected || isActive) ? "Selecionado" : "Começar"}
                                            </div>
                                        </div>

                                        
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

