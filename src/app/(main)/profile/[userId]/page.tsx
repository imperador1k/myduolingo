
import { redirect } from "next/navigation";
import { getUserProgressById, getUnitsForUser, isFollowingUser } from "@/db/queries";
import { ACHIEVEMENTS, Achievement } from "@/constants/achievements";
import {
    Flame,
    Target,
    Heart,
    Zap,
    UserPlus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FollowButton } from "@/components/follow-button";
import { MessageForm } from "@/components/message-form";

interface Props {
    params: {
        userId: string;
    };
}

export default async function PublicProfilePage({ params }: Props) {
    const userProgress = await getUserProgressById(params.userId);
    const units = await getUnitsForUser(params.userId);
    const isFollowing = await isFollowingUser(params.userId);

    if (!userProgress) {
        redirect("/leaderboard");
    }

    // Calculate total lessons completed
    let completedLessons = 0;
    units.forEach(unit => {
        unit.lessons.forEach(lesson => {
            if (lesson.completed) completedLessons++;
        });
    });

    const streak = userProgress.streak || 0;
    // const longestStreak = userProgress.longestStreak || 0; // Not used in stats grid currently
    const totalXpEarned = userProgress.totalXpEarned || userProgress.points || 0;

    const stats = [
        { icon: <Flame className="h-6 w-6 text-orange-500" />, value: streak, label: "Streak", color: "bg-orange-50" },
        { icon: <Zap className="h-6 w-6 text-amber-500" />, value: totalXpEarned.toLocaleString(), label: "XP Total", color: "bg-amber-50" },
        { icon: <Target className="h-6 w-6 text-green-500" />, value: completedLessons, label: "Lições", color: "bg-green-50" },
        { icon: <Heart className="h-6 w-6 text-rose-500" />, value: userProgress.hearts, label: "Corações", color: "bg-rose-50" },
    ];

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
                    {userProgress.userImageSrc ? (
                        <img
                            src={userProgress.userImageSrc}
                            alt="Avatar"
                            className="h-full w-full rounded-full object-cover"
                        />
                    ) : (
                        "🧑‍🎓"
                    )}
                </div>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-slate-700">
                        {userProgress.userName || "Estudante"}
                    </h1>
                    <p className="text-slate-500">@{userProgress.userName?.toLowerCase().replace(" ", "") || "estudante"}</p>

                    <div className="mt-4 flex flex-col gap-2 w-full max-w-[300px]">
                        <FollowButton userId={params.userId} isFollowing={isFollowing} />
                        <MessageForm receiverId={params.userId} />
                    </div>
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
        </div>
    );
}
