import { Suspense } from "react";
import { getCourses, getUserProgress } from "@/db/queries";
import { CoursesList } from "./courses-list";
import { BookOpen, Flame, Target, Trophy, Sparkles } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export const dynamic = "force-dynamic";

export default function CoursesPage() {
    return (
        <div className="pb-12 px-4 lg:px-0 max-w-[1056px] mx-auto pt-6 space-y-10">
            {/* Gamified Worlds Header (Synchronous) */}
            <div className="flex flex-col items-center justify-center text-center gap-4 mb-10 mt-4">
                <div className="h-28 w-28 bg-sky-100 rounded-[2rem] border-4 border-sky-200 border-b-[8px] shadow-sm flex items-center justify-center mb-2 animate-in zoom-in duration-500 relative">
                    <span className="text-6xl drop-shadow-md">🌍</span>
                    {/* Passport detail */}
                    <div className="absolute -bottom-2 -right-2 bg-amber-400 border-2 border-amber-500 rounded-lg p-1.5 shadow-md rotate-12">
                        <span className="text-xl">🛂</span>
                    </div>
                </div>
                <h1 className="text-4xl lg:text-5xl font-black text-slate-700 tracking-tight uppercase">
                    Os Teus Mundos
                </h1>
                <p className="text-lg text-slate-500 font-bold max-w-xl">
                    Escolhe a tua próxima aventura linguística.
                </p>
            </div>

            <Suspense fallback={<CoursesSkeleton />}>
                <CoursesData />
            </Suspense>
        </div>
    );
}

async function CoursesData() {
    const courses = await getCourses();
    const userProgress = await getUserProgress();

    const activeCourse = courses.find(c => c.id === userProgress?.activeCourseId);

    return (
        <>
            {/* Active Course Card (if any) */}
            {userProgress?.activeCourseId && activeCourse && (
                <div className="flex flex-col gap-4 mb-4 animate-in fade-in duration-500">
                    <h2 className="text-xl font-black text-slate-700 uppercase tracking-widest pl-2 flex items-center gap-2">
                        <span className="text-2xl drop-shadow-sm">🔥</span> O Teu Percurso
                    </h2>
                    <Link href="/learn" className="block w-full" prefetch>
                        <div className="w-full bg-white rounded-[32px] border-2 border-slate-200 border-b-[10px] p-6 lg:p-8 flex flex-col md:flex-row items-center gap-6 lg:gap-8 transition-transform hover:-translate-y-1 active:translate-y-1 active:border-b-[2px] cursor-pointer shadow-sm relative group overflow-hidden">
                            
                            {/* Left: Landmark Illustration */}
                            <div className="shrink-0 relative w-24 h-24 lg:w-32 lg:h-32 bg-sky-50 border-2 border-sky-100 rounded-[2rem] flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform duration-300">
                                {activeCourse.imageSrc && activeCourse.imageSrc.startsWith("http") ? (
                                    <Image src={activeCourse.imageSrc} alt={activeCourse.title} fill className="object-cover rounded-2xl" />
                                ) : activeCourse.imageSrc ? (
                                    <Image src={activeCourse.imageSrc} alt={activeCourse.title} width={80} height={80} className="object-cover drop-shadow-xl" />
                                ) : (
                                    <span className="text-6xl drop-shadow-xl inline-block -rotate-6">🚌</span>
                                )}
                            </div>

                            {/* Center: Title & Progress Bar */}
                            <div className="flex-1 flex flex-col justify-center items-center md:items-start text-center md:text-left gap-2 w-full">
                                <h2 className="text-4xl lg:text-5xl font-black text-slate-700 uppercase tracking-tight">
                                    {activeCourse.title}
                                </h2>
                                
                                <div className="w-full max-w-sm flex flex-col gap-2 mt-2">
                                    <div className="flex-1 h-5 w-full bg-slate-100 rounded-full border-2 border-slate-200 overflow-hidden relative">
                                        <div className="absolute top-0 left-0 h-full bg-[#58cc02] rounded-full w-[45%]" />
                                        <div className="absolute top-1 left-2 h-[4px] bg-white/20 rounded-full w-[40%]" />
                                    </div>
                                    <span className="text-[13px] font-black text-slate-400 uppercase tracking-widest items-center flex gap-1">
                                        <Flame className="w-4 h-4 text-orange-400 fill-orange-400 inline-block mb-0.5" /> 
                                        O teu foco diário
                                    </span>
                                </div>
                            </div>

                            {/* Right: Giant Continuar Button */}
                            <div className="shrink-0 mt-4 md:mt-0 w-full md:w-auto relative z-20">
                                <button className="w-full md:w-auto px-8 lg:px-12 py-4 rounded-2xl bg-[#58cc02] text-white font-black text-xl lg:text-2xl tracking-widest uppercase border-2 border-transparent border-b-[8px] flex items-center justify-center shadow-sm pointer-events-none" style={{ borderBottomColor: '#46a302' }}>
                                    Continuar
                                </button>
                            </div>

                        </div>
                    </Link>
                </div>
            )}

            {/* All Courses Grid */}
            <div className="flex flex-col gap-3 animate-in fade-in duration-500">
                <CoursesList
                    courses={courses}
                    activeCourseId={userProgress?.activeCourseId || undefined}
                />
            </div>
        </>
    );
}

// --- SKELETON FALLBACK ---
const CoursesSkeleton = () => {
    return (
        <div className="animate-in fade-in duration-500 w-full space-y-10">
            {/* Active Course Card Skeleton */}
            <div className="flex flex-col gap-4 mb-4">
                <div className="h-6 w-48 bg-stone-200 rounded-md animate-pulse pl-2" />
                <div className="w-full bg-white rounded-[32px] border-2 border-stone-200 border-b-[10px] p-6 lg:p-8 flex flex-col md:flex-row items-center gap-6 lg:gap-8 shadow-sm">
                    {/* Left: Landmark Illustration Skeleton */}
                    <div className="shrink-0 relative w-24 h-24 lg:w-32 lg:h-32 bg-stone-100 rounded-[2rem] border-2 border-stone-200 flex items-center justify-center animate-pulse" />

                    {/* Center: Title & Progress Bar Skeleton */}
                    <div className="flex-1 flex flex-col justify-center items-center md:items-start text-center md:text-left gap-4 w-full">
                        <div className="h-10 w-48 bg-stone-200 rounded-xl animate-pulse" />
                        <div className="w-full max-w-sm flex flex-col gap-2 mt-2">
                            <div className="flex-1 h-5 w-full bg-stone-200 rounded-full animate-pulse" />
                            <div className="h-4 w-32 bg-stone-200 rounded-md animate-pulse" />
                        </div>
                    </div>

                    {/* Right: Button Skeleton */}
                    <div className="shrink-0 mt-4 md:mt-0 w-full md:w-auto">
                        <div className="w-full md:w-[200px] h-16 rounded-2xl bg-stone-200 border-b-[8px] border-stone-300 animate-pulse" />
                    </div>
                </div>
            </div>

            {/* All Courses Grid Skeleton */}
            <div className="flex flex-col gap-3">
                <div className="pt-6 grid grid-cols-2 lg:grid-cols-[repeat(auto-fill,minmax(210px,1fr))] gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="pt-6 pb-8 px-3 rounded-2xl border-2 border-stone-200 border-b-4 bg-stone-50 flex flex-col items-center min-h-[220px] animate-pulse">
                            <div className="w-[80px] h-[80px] rounded-2xl bg-stone-200 mb-6 drop-shadow-md border-b-4 border-stone-300" />
                            <div className="h-5 w-24 bg-stone-200 rounded-md" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

