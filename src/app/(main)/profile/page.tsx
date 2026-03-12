import { redirect } from "next/navigation";
import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { SignOutButton } from "@clerk/nextjs";
import { getUserProgress, getUnits } from "@/db/queries";
import { ACHIEVEMENTS, Achievement } from "@/constants/achievements";
import { Button } from "@/components/ui/button";
import {
    Settings,
    LogOut,
    Flame,
    Target,
    Heart,
    Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LottieBlock } from "@/components/ui/lottie-block";

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
        { icon: <Flame className="h-6 w-6 text-orange-500" />, value: streak, label: "Streak", color: "bg-orange-50 border-orange-100" },
        { icon: <Zap className="h-6 w-6 text-amber-500" />, value: totalXpEarned.toLocaleString(), label: "XP Total", color: "bg-amber-50 border-amber-100" },
        { icon: <Target className="h-6 w-6 text-green-500" />, value: completedLessons, label: "Lições", color: "bg-green-50 border-green-100" },
        { icon: <Heart className="h-6 w-6 text-rose-500" />, value: userProgress.hearts, label: "Corações", color: "bg-rose-50 border-rose-100" },
    ];

    const achievements = ACHIEVEMENTS.map((achievement: Achievement) => ({
        ...achievement,
        unlocked: achievement.condition(userProgress),
    }));

    const unlockedCount = achievements.filter(a => a.unlocked).length;

    return (
        <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 pb-28">

            {/* Celebration Lottie */}
            <LottieBlock className="w-24 h-24 md:w-32 md:h-32 mx-auto -mb-4" />

            {/* Profile Header */}
            <div className="relative mb-8 flex flex-col items-center text-center sm:flex-row sm:text-left pt-4">
                <div className="mb-4 flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-green-100 text-5xl shadow-lg ring-4 ring-white sm:mb-0 sm:mr-6">
                    {user.imageUrl ? (
                        <img
                            src={user.imageUrl}
                            alt="Avatar"
                            className="h-full w-full rounded-full object-cover"
                        />
                    ) : (
                        "🧑‍🎓"
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <h1 className="text-2xl font-bold text-slate-700 truncate">
                        {user.firstName || user.username || "Estudante"}
                    </h1>
                    <p className="text-slate-500">@{user.username || "estudante"}</p>
                    <p className="text-sm text-slate-400">
                        Membro desde {new Date(user.createdAt).toLocaleDateString("pt-PT", { month: "long", year: "numeric" })}
                    </p>
                </div>

                {/* Settings icon — top-right corner of header */}
                <Link href="/settings" className="absolute top-4 right-0">
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl">
                        <Settings className="h-6 w-6" />
                    </Button>
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {stats.map((stat, i) => (
                    <div
                        key={i}
                        className={cn(
                            "flex flex-col items-center rounded-2xl border-2 p-4 transition-all",
                            stat.color
                        )}
                    >
                        {stat.icon}
                        <p className="mt-2 text-xl font-bold text-slate-700">{stat.value}</p>
                        <p className="text-xs text-slate-500">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* XP Balance */}
            <div className="mb-8 flex items-center justify-between rounded-2xl border-2 border-amber-100 bg-amber-50 px-5 py-4">
                <div>
                    <p className="text-sm text-amber-600">Saldo de XP</p>
                    <p className="text-2xl font-bold text-amber-700">{userProgress.points} XP</p>
                </div>
                <Link href="/shop">
                    <Button variant="primary" size="sm">Loja</Button>
                </Link>
            </div>

            {/* Achievements */}
            <div className="mb-10">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-600">🏆 Conquistas</h2>
                    <span className="rounded-full bg-slate-100 px-3 py-0.5 text-sm font-semibold text-slate-500">
                        {unlockedCount}/{achievements.length}
                    </span>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {achievements.map((achievement, i) => (
                        <div
                            key={i}
                            className={cn(
                                "flex flex-col items-center rounded-2xl border-2 p-3 text-center transition-all",
                                achievement.unlocked
                                    ? "border-amber-200 bg-amber-50"
                                    : "border-slate-200 bg-slate-100 opacity-40"
                            )}
                        >
                            <span className={cn("text-3xl", !achievement.unlocked && "grayscale")}>{achievement.icon}</span>
                            <p className="mt-1 text-sm font-bold text-slate-700">{achievement.title}</p>
                            <p className="text-xs text-slate-400">{achievement.description}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
                <Link href="/settings" className="w-full">
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 rounded-2xl border-2 border-slate-200 bg-white py-6 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                    >
                        <Settings className="h-5 w-5 text-slate-400" />
                        Definições
                    </Button>
                </Link>

                <SignOutButton redirectUrl="/">
                    <button className="flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-rose-200 bg-white px-12 py-4 text-base font-bold text-rose-500 transition-all hover:bg-rose-50 hover:border-rose-300 active:scale-[0.98]">
                        <LogOut className="h-5 w-5" />
                        Terminar Sessão
                    </button>
                </SignOutButton>
            </div>
        </div>
    );
}
