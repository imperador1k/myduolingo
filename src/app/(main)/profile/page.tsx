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

export default async function ProfilePage() {
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
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 pb-28">

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
                            <Button variant="sidebarOutline" className="gap-2 px-6 rounded-2xl w-full sm:w-auto hover:bg-slate-100 hover:text-slate-700 hover:border-slate-300 border-2 bg-white text-slate-600 border-slate-200">
                                <Share2 className="h-5 w-5" /> 
                                <span className="uppercase tracking-wide font-black">Partilhar</span>
                            </Button>
                        </ShareProfileModal>
                        <Link href="/settings" className="w-full sm:w-auto">
                            <Button variant="primary" className="gap-2 px-6 rounded-2xl w-full">
                                <Settings className="h-5 w-5" />
                                <span className="uppercase tracking-wide font-black">Definições</span>
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
            <div className="mb-12 relative flex items-center justify-between overflow-hidden rounded-[2rem] border-b-4 border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 px-8 py-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="absolute right-[-10%] top-[-50%] w-48 h-48 bg-amber-200 rounded-full blur-3xl opacity-50" />
                <div className="relative z-10 flex flex-col gap-1">
                    <p className="text-sm font-black uppercase tracking-widest text-amber-600">O Teu Cofre</p>
                    <div className="flex items-center gap-3">
                        <Zap className="w-8 h-8 text-amber-500 fill-amber-500 animate-pulse" />
                        <p className="text-4xl font-black text-amber-700 drop-shadow-sm">{userProgress.points}</p>
                    </div>
                </div>
                <Link href="/shop" className="relative z-10">
                    <Button variant="super" size="lg" className="px-8 rounded-2xl uppercase tracking-widest font-black shadow-lg">Visitar Loja</Button>
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
        </div>
    );
}

