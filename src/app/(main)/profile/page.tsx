import { Suspense } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { SignOutButton } from "@clerk/nextjs";
import { getUserProgress, getUnits } from "@/db/queries";
import { ACHIEVEMENTS, Achievement } from "@/constants/achievements";
import { Button } from "@/components/ui/button";
import { Settings, LogOut, Flame, Target, Heart, Zap, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { LottieBlock } from "@/components/ui/lottie-block";
import { AchievementsList } from "@/components/shared/achievements-list";
import { NotificationToggle } from "@/components/shared/notification-toggle";
import { ProfileHero } from "@/components/shared/profile-hero";
import { ShareProfileModal } from "@/components/modals/share-profile-modal";

export const dynamic = "force-dynamic";

export default function ProfilePage() {
    return (
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 pb-28">
            <Suspense fallback={<ProfileSkeleton />}>
                <ProfileData />
            </Suspense>
        </div>
    );
}

async function ProfileData() {
    const user = await currentUser();
    const userProgress = await getUserProgress();
    const units = await getUnits();

    if (!user || !userProgress) {
        redirect("/courses");
    }

    let completedLessons = 0;
    units.forEach(unit => {
        unit.lessons.forEach(lesson => {
            if (lesson.completed) completedLessons++;
        });
    });

    const streak = userProgress.streak || 0;
    const totalXpEarned = userProgress.totalXpEarned || userProgress.points || 0;

    const stats = [
        { icon: <Flame className="h-8 w-8 text-orange-500" />, value: streak, label: "Streak", color: "bg-orange-50 border-orange-200" },
        { icon: <Zap className="h-8 w-8 text-amber-500" />, value: totalXpEarned.toLocaleString(), label: "XP Total", color: "bg-amber-50 border-amber-200" },
        { icon: <Target className="h-8 w-8 text-green-500" />, value: completedLessons, label: "Lições", color: "bg-green-50 border-green-200" },
        { icon: <Heart className="h-8 w-8 text-rose-500" />, value: userProgress.hearts, label: "Corações", color: "bg-rose-50 border-rose-200" },
    ];

    const achievements = ACHIEVEMENTS.map((achievement: Achievement) => ({
        title: achievement.title,
        description: achievement.description,
        icon: achievement.icon,
        unlocked: achievement.condition(userProgress),
    }));

    return (
        <>
            {/* Celebration Lottie */}
            <LottieBlock className="w-24 h-24 md:w-32 md:h-32 mx-auto -mb-8 z-20 relative mix-blend-multiply" />

            <ProfileHero 
                imageUrl={user.imageUrl}
                name={user.firstName || userProgress.userName || "Estudante"}
                username={userProgress.userName || "estudante"}
                createdAt={new Date(user.createdAt)}
                bannerColorFrom="from-amber-300"
                bannerColorTo="from-rose-400 to-fuchsia-500"
                actions={
                    <>
                        <ShareProfileModal username={userProgress.userName}>
                            <div className="w-full sm:w-auto sm:min-w-[160px] flex-1 h-12 sm:h-14">
                                <Button variant="sidebarOutline" className="w-full h-full gap-2 rounded-[1.2rem] sm:rounded-[1.5rem] px-4 sm:px-6 border-2 hover:bg-slate-100 hover:text-slate-700 hover:border-slate-300 bg-white text-slate-600 border-slate-200 transition-all">
                                    <Share2 className="h-5 w-5 md:h-6 md:w-6" /> 
                                    <span className="uppercase tracking-widest font-black text-[12px] sm:text-sm">Partilhar</span>
                                </Button>
                            </div>
                        </ShareProfileModal>
                        <Link href="/settings" className="w-full sm:w-auto sm:min-w-[160px] flex-1 h-12 sm:h-14 block">
                            <Button variant="primary" className="w-full h-full gap-2 rounded-[1.2rem] sm:rounded-[1.5rem] px-4 sm:px-6 transition-all">
                                <Settings className="h-5 w-5 md:h-6 md:w-6" />
                                <span className="uppercase tracking-widest font-black text-[12px] sm:text-sm">Definições</span>
                            </Button>
                        </Link>
                    </>
                }
            />

            {/* Stats Bento Grid */}
            <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
                {stats.map((stat, i) => (
                    <div
                        key={i}
                        className={cn(
                            "flex flex-col items-center justify-center rounded-3xl border-b-4 border-2 p-6 transition-all shadow-sm hover:shadow-md hover:-translate-y-1 hover:brightness-105",
                            stat.color
                        )}
                    >
                        {stat.icon}
                        <p className="mt-3 text-2xl font-black text-slate-700 drop-shadow-sm">{stat.value}</p>
                        <p className="text-sm font-extrabold text-slate-500 uppercase tracking-widest">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* XP Balance Context Banner */}
            <div className="mb-12 relative flex flex-col sm:flex-row items-center justify-between overflow-hidden rounded-[2rem] border-b-4 border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-6 sm:px-8 sm:py-6 shadow-sm hover:shadow-md transition-shadow gap-6 sm:gap-0">
                <div className="absolute right-[-10%] top-[-50%] w-48 h-48 bg-amber-200 rounded-full blur-3xl opacity-50" />
                <div className="relative z-10 flex flex-col items-center sm:items-start gap-1">
                    <p className="text-sm font-black uppercase tracking-widest text-amber-600">O Teu Cofre</p>
                    <div className="flex items-center gap-3">
                        <Zap className="w-8 h-8 text-amber-500 fill-amber-500 animate-pulse" />
                        <p className="text-4xl font-black text-amber-700 drop-shadow-sm">{userProgress.points}</p>
                    </div>
                </div>
                <Link href="/shop" className="relative z-10 w-full sm:w-auto">
                    <Button variant="super" size="lg" className="w-full sm:w-auto px-8 rounded-2xl uppercase tracking-widest font-black shadow-lg">Visitar Loja</Button>
                </Link>
            </div>

            {/* Gamified Achievements List */}
            <AchievementsList achievements={achievements} userProgress={userProgress} />

            {/* Zone Rules Context */}
            <div className="flex flex-col gap-4 mt-8">
                <div className="rounded-3xl border-2 border-slate-200 p-6 bg-white">
                    <h3 className="font-extrabold text-slate-700 mb-4 text-lg">Zona de Perigo</h3>
                    <SignOutButton redirectUrl="/">
                        <button className="flex w-full items-center justify-center gap-3 rounded-2xl border-b-4 border-2 border-rose-200 bg-rose-50 px-12 py-5 text-sm font-black uppercase tracking-widest text-rose-500 transition-all hover:bg-rose-100 hover:border-rose-300 active:scale-95 active:border-b-2">
                            <LogOut className="h-5 w-5" />
                            Terminar Sessão do MyDuolingo
                        </button>
                    </SignOutButton>
                </div>
            </div>
        </>
    );
}

// --- SKELETON FALLBACK ---
const ProfileSkeleton = () => {
    return (
        <div className="animate-in fade-in duration-500 w-full">
            {/* Lottie Placeholder */}
            <div className="w-24 h-24 md:w-32 md:h-32 mx-auto -mb-8 z-20 relative bg-stone-200 rounded-full animate-pulse" />

            {/* Profile Hero Skeleton */}
            <div className="w-full bg-stone-100 rounded-[2rem] border-2 border-stone-200 p-6 pt-12 md:p-10 md:pt-16 mb-8 flex flex-col md:flex-row items-center md:items-start gap-6 relative overflow-hidden shadow-sm">
                <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full border-4 border-white shadow-md bg-stone-200 shrink-0 z-10 animate-pulse" />
                <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left z-10 gap-3">
                    <div className="h-8 w-48 bg-stone-200 rounded-lg animate-pulse" />
                    <div className="h-4 w-32 bg-stone-200 rounded-md animate-pulse" />
                    <div className="h-3 w-24 bg-stone-200 rounded-md animate-pulse mt-2" />
                </div>
                <div className="w-full md:w-auto shrink-0 flex flex-col sm:flex-row md:flex-col gap-3 z-10">
                    <div className="w-full sm:w-[160px] h-12 sm:h-14 bg-stone-200 rounded-[1.5rem] animate-pulse" />
                    <div className="w-full sm:w-[160px] h-12 sm:h-14 bg-stone-200 rounded-[1.5rem] animate-pulse" />
                </div>
            </div>

            {/* Stats Bento Grid Skeleton */}
            <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex flex-col items-center justify-center rounded-3xl border-b-4 border-2 border-stone-200 bg-stone-50 p-6 h-[140px] animate-pulse">
                        <div className="h-8 w-8 bg-stone-200 rounded-full mb-3" />
                        <div className="h-8 w-16 bg-stone-200 rounded-lg mb-2" />
                        <div className="h-4 w-20 bg-stone-200 rounded-md" />
                    </div>
                ))}
            </div>

            {/* XP Balance Context Banner Skeleton */}
            <div className="mb-12 flex flex-col sm:flex-row items-center justify-between rounded-[2rem] border-b-4 border-stone-200 bg-stone-50 p-6 sm:px-8 sm:py-6 shadow-sm gap-6 sm:gap-0 animate-pulse">
                <div className="flex flex-col items-center sm:items-start gap-2">
                    <div className="h-4 w-24 bg-stone-200 rounded-md" />
                    <div className="flex items-center gap-3 mt-1">
                        <div className="w-8 h-8 bg-stone-200 rounded-full" />
                        <div className="h-10 w-24 bg-stone-200 rounded-xl" />
                    </div>
                </div>
                <div className="w-full sm:w-[160px] h-[52px] bg-stone-200 rounded-2xl" />
            </div>

            {/* Achievements List Skeleton */}
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-stone-200 rounded-full animate-pulse" />
                    <div className="h-8 w-48 bg-stone-200 rounded-lg animate-pulse" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-stone-50 border-2 border-stone-200 border-b-4 rounded-2xl p-5 flex items-center gap-4 animate-pulse">
                            <div className="w-16 h-16 bg-stone-200 rounded-2xl shrink-0" />
                            <div className="flex-1 space-y-2">
                                <div className="h-5 w-32 bg-stone-200 rounded-md" />
                                <div className="h-3 w-full bg-stone-200 rounded-md" />
                                <div className="w-full h-4 bg-stone-200 rounded-full mt-2" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

