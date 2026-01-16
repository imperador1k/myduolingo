"use client";

import { useState, useTransition } from "react";
import { Check, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { onSelectCourse } from "@/actions/user-progress";

type Course = {
    id: number;
    title: string;
    imageSrc: string;
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

    const getLanguageData = (title: string) => {
        return languageData[title] || {
            flag: "🌍",
            gradient: "from-sky-400 to-blue-500",
            greeting: "Hello!",
            nativeName: title
        };
    };

    return (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => {
                const data = getLanguageData(course.title);
                const isSelected = selectedCourse === course.id;
                const isActive = activeCourseId === course.id;

                return (
                    <button
                        key={course.id}
                        onClick={() => handleSelect(course.id)}
                        disabled={isPending}
                        className={cn(
                            "group relative overflow-hidden rounded-2xl border-2 p-5 transition-all duration-300",
                            "hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]",
                            isSelected
                                ? "border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg shadow-green-500/20"
                                : "border-slate-200 bg-white hover:border-slate-300",
                            isPending && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        {/* Gradient background decoration */}
                        <div
                            className={cn(
                                "absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-20 blur-2xl transition-opacity",
                                `bg-gradient-to-br ${data.gradient}`,
                                isSelected ? "opacity-40" : "group-hover:opacity-30"
                            )}
                        />

                        <div className="relative flex items-center gap-4">
                            {/* Flag with animation */}
                            <div className={cn(
                                "flex h-16 w-16 items-center justify-center rounded-xl text-4xl transition-transform",
                                "bg-gradient-to-br from-slate-50 to-slate-100 shadow-inner",
                                "group-hover:scale-110 group-hover:rotate-3"
                            )}>
                                {data.flag}
                            </div>

                            {/* Course info */}
                            <div className="flex-1 text-left">
                                <h3 className="font-bold text-slate-700 text-lg">{course.title}</h3>
                                <p className="text-sm text-slate-400 italic">{data.nativeName}</p>
                                <p className={cn(
                                    "mt-1 text-xs font-medium",
                                    isSelected ? "text-green-600" : "text-slate-500"
                                )}>
                                    {data.greeting}
                                </p>
                            </div>

                            {/* Status indicator */}
                            {isSelected && (
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500 shadow-lg shadow-green-500/30">
                                    <Check className="h-5 w-5 text-white" />
                                </div>
                            )}
                        </div>

                        {/* Active course badge */}
                        {isActive && (
                            <div className="absolute -right-1 -top-1 flex items-center gap-1 rounded-bl-xl rounded-tr-xl bg-gradient-to-r from-amber-400 to-orange-400 px-3 py-1 text-xs font-bold text-white shadow-lg">
                                <Sparkles className="h-3 w-3" />
                                ATIVO
                            </div>
                        )}
                    </button>
                );
            })}
        </div>
    );
};
