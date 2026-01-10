"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Course = {
    id: number;
    title: string;
    flag: string;
    learners: string;
    isActive?: boolean;
};

const courses: Course[] = [
    { id: 1, title: "Português", flag: "🇵🇹", learners: "45M", isActive: true },
    { id: 2, title: "Espanhol", flag: "🇪🇸", learners: "120M" },
    { id: 3, title: "Francês", flag: "🇫🇷", learners: "80M" },
    { id: 4, title: "Italiano", flag: "🇮🇹", learners: "35M" },
    { id: 5, title: "Alemão", flag: "🇩🇪", learners: "50M" },
    { id: 6, title: "Japonês", flag: "🇯🇵", learners: "25M" },
    { id: 7, title: "Coreano", flag: "🇰🇷", learners: "20M" },
    { id: 8, title: "Chinês", flag: "🇨🇳", learners: "30M" },
    { id: 9, title: "Russo", flag: "🇷🇺", learners: "15M" },
    { id: 10, title: "Árabe", flag: "🇸🇦", learners: "10M" },
    { id: 11, title: "Holandês", flag: "🇳🇱", learners: "8M" },
    { id: 12, title: "Sueco", flag: "🇸🇪", learners: "6M" },
];

const CourseCard = ({ course, onSelect }: { course: Course; onSelect: () => void }) => (
    <button
        onClick={onSelect}
        className={cn(
            "flex items-center gap-4 rounded-xl border-2 p-4 transition-all hover:bg-slate-50",
            course.isActive
                ? "border-green-500 bg-green-50"
                : "border-slate-200 hover:border-green-300"
        )}
    >
        <span className="text-4xl">{course.flag}</span>
        <div className="flex-1 text-left">
            <h3 className="font-bold text-slate-700">{course.title}</h3>
            <p className="text-sm text-slate-500">{course.learners} aprendizes</p>
        </div>
        {course.isActive && (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500">
                <Check className="h-5 w-5 text-white" />
            </div>
        )}
    </button>
);

export default function CoursesPage() {
    const [selectedCourse, setSelectedCourse] = useState<number>(1);

    return (
        <div className="pb-12">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-700">Cursos de Idiomas</h1>
                <p className="text-slate-500">Escolhe o idioma que queres aprender</p>
            </div>

            {/* Active Course */}
            <div className="mb-8 rounded-xl border-2 border-green-500 bg-green-50 p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <span className="text-5xl">🇵🇹</span>
                        <div>
                            <p className="text-sm font-bold text-green-600">CURSO ATIVO</p>
                            <h2 className="text-xl font-bold text-slate-700">Português</h2>
                            <p className="text-sm text-slate-500">Nível 5 • 1,250 XP</p>
                        </div>
                    </div>
                    <Button variant="primary">Continuar</Button>
                </div>
            </div>

            {/* All Courses Grid */}
            <h2 className="mb-4 text-lg font-bold text-slate-600">Todos os Cursos</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {courses.map((course) => (
                    <CourseCard
                        key={course.id}
                        course={{ ...course, isActive: course.id === selectedCourse }}
                        onSelect={() => setSelectedCourse(course.id)}
                    />
                ))}
            </div>

            {/* Coming Soon */}
            <div className="mt-8 rounded-xl border-2 border-dashed border-slate-300 p-6 text-center">
                <p className="text-lg font-bold text-slate-400">🚀 Mais idiomas em breve!</p>
                <p className="text-sm text-slate-400">Hindi, Turco, Polaco, Grego...</p>
            </div>
        </div>
    );
}
