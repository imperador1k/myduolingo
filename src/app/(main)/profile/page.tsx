import { redirect } from "next/navigation";
import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { getUserProgress, getUnits } from "@/db/queries";
import { Button } from "@/components/ui/button";
import {
    Settings,
    LogOut,
    Trophy,
    Flame,
    Target,
    BookOpen,
    Award,
    Share2,
    ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

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

    const stats = [
        { icon: <Flame className="h-6 w-6 text-orange-500" />, value: "0", label: "Streak", color: "bg-orange-50" },
        { icon: <Trophy className="h-6 w-6 text-amber-500" />, value: userProgress.points.toLocaleString(), label: "XP Total", color: "bg-amber-50" },
        { icon: <Target className="h-6 w-6 text-green-500" />, value: completedLessons, label: "Lições", color: "bg-green-50" },
        { icon: <Award className="h-6 w-6 text-purple-500" />, value: userProgress.hearts, label: "Corações", color: "bg-purple-50" },
    ];

    const achievements = [
        { icon: "🔥", title: "Streak de 7 dias", unlocked: false },
        { icon: "⭐", title: "Primeira Lição", unlocked: completedLessons > 0 },
        { icon: "💎", title: "100 XP", unlocked: userProgress.points >= 100 },
        { icon: "🎯", title: "10 Lições", unlocked: completedLessons >= 10 },
        { icon: "👑", title: "500 XP", unlocked: userProgress.points >= 500 },
        { icon: "🌟", title: "1000 XP", unlocked: userProgress.points >= 1000 },
    ];

    const menuItems = [
        { icon: <Settings className="h-5 w-5" />, label: "Definições", href: "#" },
        { icon: <Share2 className="h-5 w-5" />, label: "Convidar Amigos", href: "#" },
        { icon: <BookOpen className="h-5 w-5" />, label: "Histórico de Lições", href: "#" },
    ];

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
                <Link href="#" className="hidden sm:flex">
                    <Button variant="ghost" size="icon">
                        <Settings className="h-5 w-5" />
                    </Button>
                </Link>
            </div>

            {/* League Badge */}
            <div className="mb-8 flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 p-4 text-white">
                <span className="text-4xl">💎</span>
                <div>
                    <p className="text-sm opacity-80">Liga Atual</p>
                    <p className="text-xl font-bold">
                        {userProgress.points >= 1000 ? "Diamante" :
                            userProgress.points >= 500 ? "Ouro" :
                                userProgress.points >= 100 ? "Prata" : "Bronze"}
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

            {/* Achievements */}
            <div className="mb-8">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-600">Conquistas</h2>
                    <span className="text-sm text-slate-400">
                        {achievements.filter(a => a.unlocked).length}/{achievements.length}
                    </span>
                </div>
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
                    {achievements.map((achievement, i) => (
                        <div
                            key={i}
                            className={cn(
                                "flex flex-col items-center rounded-xl border-2 p-3 text-center",
                                achievement.unlocked
                                    ? "border-amber-200 bg-amber-50"
                                    : "border-slate-200 bg-slate-100 opacity-50"
                            )}
                        >
                            <span className="text-2xl">{achievement.icon}</span>
                            <p className="mt-1 text-xs font-bold text-slate-600">
                                {achievement.title}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Menu */}
            <div className="space-y-2">
                {menuItems.map((item, i) => (
                    <Link
                        key={i}
                        href={item.href}
                        className="flex w-full items-center gap-4 rounded-xl border-2 border-slate-100 p-4 text-left transition-all hover:border-slate-200 hover:bg-slate-50"
                    >
                        <span className="text-slate-500">{item.icon}</span>
                        <span className="flex-1 font-bold text-slate-600">{item.label}</span>
                        <ChevronRight className="h-5 w-5 text-slate-400" />
                    </Link>
                ))}
            </div>

            {/* Logout */}
            <form action="/api/auth/signout" method="POST">
                <Button
                    type="submit"
                    variant="ghost"
                    className="mt-6 w-full text-rose-500 hover:bg-rose-50 hover:text-rose-600"
                >
                    <LogOut className="mr-2 h-5 w-5" />
                    Terminar Sessão
                </Button>
            </form>
        </div>
    );
}
