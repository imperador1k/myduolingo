"use client";

import { useState, useTransition } from "react";
import { Check, Sparkles, Settings, Loader2, Image as ImageIcon } from "lucide-react";
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
        if (isPending || editingCourseId !== null) return; // don't select while editing

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
        <div className="space-y-12">
            {Object.entries(groupedCourses).map(([languageLabel, langCourses]) => {
                const data = getLanguageData(langCourses[0]?.title || languageLabel, languageLabel);

                return (
                    <div key={languageLabel} className="space-y-6">
                        <div className="flex items-center gap-3 pb-3 border-b-2 border-slate-100">
                            <span className="text-3xl drop-shadow-sm">{data.flag}</span>
                            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
                                Aprender {languageLabel}
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
                            {langCourses.map((course) => {
                                const isSelected = selectedCourse === course.id;
                                const isActive = activeCourseId === course.id;

                                return (
                                    <button
                                        key={course.id}
                                        onClick={() => handleSelect(course.id)}
                                        disabled={isPending}
                                        className={cn(
                                            "group relative overflow-hidden bg-white border-2 border-slate-200 rounded-2xl p-5 text-left transition-all duration-300 cursor-pointer",
                                            "hover:border-sky-400 hover:shadow-md hover:-translate-y-1 active:scale-[0.98]",
                                            isSelected && "border-green-500 bg-green-50/50 shadow-md shadow-green-500/10 hover:border-green-500",
                                            isPending && "opacity-50 cursor-not-allowed transform-none hover:shadow-none hover:border-slate-200"
                                        )}
                                    >
                                        {/* Background gradient hint */}
                                        <div
                                            className={cn(
                                                "absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-20",
                                                `bg-gradient-to-br ${data.gradient}`
                                            )}
                                        />

                                        <div className="relative flex flex-col items-start gap-4">
                                            {/* Top Row: Icon/Flag + Status Icons */}
                                            <div className="flex w-full items-start justify-between">
                                                <div 
                                                    className={cn(
                                                        "relative flex h-14 w-14 items-center justify-center rounded-xl text-3xl transition-transform duration-300 overflow-hidden",
                                                        "bg-slate-50 border border-slate-100 shadow-sm",
                                                        "group-hover:scale-110 group-hover:-rotate-3"
                                                    )}
                                                >
                                                    {course.imageSrc && course.imageSrc.startsWith("http") ? (
                                                        <img src={course.imageSrc} alt={course.title} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="drop-shadow-sm">{data.flag}</span>
                                                    )}
                                                </div>

                                                <div className="flex flex-col items-end gap-2">
                                                    {isActive && (
                                                        <div className="flex items-center gap-1 rounded-full bg-amber-100 text-amber-600 px-2 py-1 text-[10px] font-bold uppercase tracking-wider">
                                                            <Sparkles className="h-3 w-3" />
                                                            Ativo
                                                        </div>
                                                    )}
                                                    {isSelected && !isActive && (
                                                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500 shadow-sm">
                                                            <Check className="h-4 w-4 text-white" />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Bottom Row: Text Info */}
                                            <div className="flex flex-col gap-1 z-10">
                                                <h3 className="font-bold text-slate-800 text-lg leading-tight group-hover:text-sky-600 transition-colors">
                                                    {course.title}
                                                </h3>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-medium text-slate-500">
                                                        {data.nativeName}
                                                    </p>
                                                    <span className="text-slate-300 text-xs">•</span>
                                                    <p className="text-xs font-bold text-sky-500 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 transform duration-300">
                                                        {data.greeting}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Edit Button overlay */}
                                        <div className="absolute bottom-4 right-4 z-20">
                                            <Dialog open={editingCourseId === course.id} onOpenChange={(open) => setEditingCourseId(open ? course.id : null)}>
                                                <DialogTrigger asChild>
                                                    <button 
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="p-2 rounded-full bg-white border border-slate-200 shadow-sm hover:border-indigo-300 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 transition-all opacity-0 group-hover:opacity-100"
                                                    >
                                                        <Settings className="h-4 w-4" />
                                                    </button>
                                                </DialogTrigger>
                                                <DialogContent className="sm:max-w-md" onClick={(e) => e.stopPropagation()}>
                                                    <DialogHeader>
                                                        <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                                                            <Settings className="h-6 w-6 text-indigo-500" />
                                                            Editar Curso
                                                        </DialogTitle>
                                                    </DialogHeader>
                                                    <form onSubmit={(e) => handleEditSubmit(course.id, e)} className="space-y-6 mt-4">
                                                        
                                                        {/* Preview current image if exists */}
                                                        {course.imageSrc && course.imageSrc.startsWith("http") && (
                                                            <div className="flex justify-center mb-4">
                                                                <img src={course.imageSrc} alt="Preview" className="w-24 h-24 rounded-2xl object-cover border-4 border-slate-100 shadow-sm" />
                                                            </div>
                                                        )}

                                                        <div className="space-y-2">
                                                            <label htmlFor="title" className="text-sm font-bold text-slate-700">Nome do Curso</label>
                                                            <input 
                                                                type="text" 
                                                                name="title" 
                                                                id="title"
                                                                defaultValue={course.title} 
                                                                className="w-full p-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all font-medium text-slate-700"
                                                                placeholder="Ex: Espanhol para Viagens"
                                                            />
                                                        </div>

                                                        <div className="space-y-2">
                                                            <label htmlFor="file" className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                                                <ImageIcon className="h-4 w-4 text-slate-500" />
                                                                Nova Imagem (Opcional)
                                                            </label>
                                                            <div className="relative">
                                                                <input 
                                                                    type="file" 
                                                                    name="file" 
                                                                    id="file"
                                                                    accept="image/*" 
                                                                    className="w-full text-sm text-slate-500 file:mr-4 file:py-3 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 transition-colors border-2 border-dashed border-slate-200 rounded-xl p-2 cursor-pointer"
                                                                />
                                                            </div>
                                                        </div>

                                                        <button 
                                                            type="submit" 
                                                            disabled={isSaving}
                                                            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-indigo-500/30 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                                                        >
                                                            {isSaving ? (
                                                                <Loader2 className="h-5 w-5 animate-spin" />
                                                            ) : (
                                                                "Guardar Alterações"
                                                            )}
                                                        </button>
                                                    </form>
                                                </DialogContent>
                                            </Dialog>
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
