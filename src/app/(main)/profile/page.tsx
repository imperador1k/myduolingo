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
    ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
    const user = await currentUser();
    const userProgress = await getUserProgress();
    const units = await getUnits();

    if (!user || !userProgress) {
        redirect("/courses");
    }

    // Calculate total lessons completed
    let totalLessons = 0;
    let completedLessons = 0;
    units.forEach(unit => {
        unit.lessons.forEach(lesson => {
            totalLessons++;
            if (lesson.completed) completedLessons++;
        });
    });

    const streak = userProgress.streak || 0;
    const longestStreak = userProgress.longestStreak || 0;
    const totalXpEarned = userProgress.totalXpEarned || userProgress.points || 0;

    const stats = [
        { icon: <Flame className="h-6 w-6 text-orange-500" />, value: streak, label: "Streak", color: "bg-orange-50" },
        { icon: <Zap className="h-6 w-6 text-amber-500" />, value: totalXpEarned.toLocaleString(), label: "XP Total", color: "bg-amber-50" },
        { icon: <Target className="h-6 w-6 text-green-500" />, value: completedLessons, label: "Lições", color: "bg-green-50" },
        { icon: <Heart className="h-6 w-6 text-rose-500" />, value: userProgress.hearts, label: "Corações", color: "bg-rose-50" },
    ];

    // Permanent achievements - once unlocked, never lost!
    const achievements = ACHIEVEMENTS.map((achievement: Achievement) => ({
        ...achievement,
        unlocked: achievement.condition(userProgress),
    }));

    const unlockedCount = achievements.filter(a => a.unlocked).length;

    return (
        <div className="pb-12">
            {/* Profile Header */}
            <div className="mb-8 flex flex-col items-center text-center sm:flex-row sm:text-left">
                <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-green-100 text-5xl shadow-lg sm:mb-0 sm:mr-6">
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
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-slate-700">
                        {user.firstName || user.username || "Estudante"}
                    </h1>
                    <p className="text-slate-500">@{user.username || "estudante"}</p>
                    <p className="text-sm text-slate-400">
                        Membro desde {new Date(user.createdAt).toLocaleDateString("pt-PT", { month: "long", year: "numeric" })}
                    </p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {stats.map((stat, i) => (
                    <div
                        key={i}
                        className={cn(
                            "flex flex-col items-center rounded-xl border-2 p-4",
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
            <div className="mb-8 flex items-center justify-between rounded-xl border-2 border-amber-100 bg-amber-50 p-4">
                <div>
                    <p className="text-sm text-amber-600">Saldo de XP</p>
                    <p className="text-2xl font-bold text-amber-700">{userProgress.points} XP</p>
                </div>
                <Link href="/shop">
                    <Button variant="primary" size="sm">Loja</Button>
                </Link>
            </div>

            {/* Achievements */}
            <div className="mb-8">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-600">🏆 Conquistas</h2>
                    <span className="text-sm text-slate-400">
                        {unlockedCount}/{achievements.length}
                    </span>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {achievements.map((achievement, i) => (
                        <div
                            key={i}
                            className={cn(
                                "flex flex-col items-center rounded-xl border-2 p-3 text-center transition-all",
                                achievement.unlocked
                                    ? "border-amber-200 bg-amber-50"
                                    : "border-slate-200 bg-slate-100 opacity-40"
                            )}
                        >
                            <span className={cn("text-3xl", !achievement.unlocked && "grayscale")}>{achievement.icon}</span>
                            <p className="mt-1 text-sm font-bold text-slate-700">
                                {achievement.title}
                            </p>
                            <p className="text-xs text-slate-500">
                                {achievement.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Settings */}
            <Link href="/settings">
                <Button
                    variant="ghost"
                    className="w-full mb-2 text-slate-500 hover:bg-slate-50 hover:text-slate-600"
                >
                    <Settings className="mr-2 h-5 w-5" />
                    Definições
                </Button>
            </Link>

            {/* Logout */}
            <SignOutButton redirectUrl="/">
                <Button
                    variant="ghost"
                    className="w-full text-rose-500 hover:bg-rose-50 hover:text-rose-600"
                >
                    <LogOut className="mr-2 h-5 w-5" />
                    Terminar Sessão
                </Button>
            </SignOutButton>
        </div>
    );
}
