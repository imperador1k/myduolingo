"use client";

import { useState, useTransition } from "react";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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

    // Language flags mapping
    const flags: Record<string, string> = {
        "Português": "🇵🇹",
        "Espanhol": "🇪🇸",
        "Francês": "🇫🇷",
        "Italiano": "🇮🇹",
        "Alemão": "🇩🇪",
        "Japonês": "🇯🇵",
    };

    return (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
                <button
                    key={course.id}
                    onClick={() => handleSelect(course.id)}
                    disabled={isPending}
                    className={cn(
                        "flex items-center gap-4 rounded-xl border-2 p-4 transition-all hover:bg-slate-50",
                        selectedCourse === course.id
                            ? "border-green-500 bg-green-50"
                            : "border-slate-200 hover:border-green-300",
                        isPending && "opacity-50 cursor-not-allowed"
                    )}
                >
                    <span className="text-4xl">{flags[course.title] || "🌍"}</span>
                    <div className="flex-1 text-left">
                        <h3 className="font-bold text-slate-700">{course.title}</h3>
                    </div>
                    {selectedCourse === course.id && (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500">
                            <Check className="h-5 w-5 text-white" />
                        </div>
                    )}
                </button>
            ))}
        </div>
    );
};
