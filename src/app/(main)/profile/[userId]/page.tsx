import { redirect } from "next/navigation";
import { getUserProgressById, getUnitsForUser, isFollowingUser } from "@/db/queries";
import { ACHIEVEMENTS, Achievement } from "@/constants/achievements";
import { Flame, Target, Heart, Zap, MessageSquareText } from "lucide-react";
import { FollowButton } from "@/components/shared/follow-button";
import { ProfileHero } from "@/components/shared/profile-hero";
import { AchievementsList } from "@/components/shared/achievements-list";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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
            <ProfileHero 
                imageUrl={userProgress.userImageSrc}
                name={userProgress.userName || "Estudante"}
                username={userProgress.userName || "estudante"}
                createdAt={new Date()} // Using a fallback since public profiles don't expose clerk join date natively yet.
                bannerColorFrom="from-sky-400"
                bannerColorTo="from-emerald-400"
                actions={
                    <div className="flex w-full sm:w-auto items-center gap-3">
                        <div className="flex-1 sm:w-36">
                            <FollowButton userId={params.userId} isFollowing={isFollowing} />
                        </div>
                        <div className="flex-1 sm:w-auto">
                            <Link href={`/messages?userId=${params.userId}`} className="w-full block">
                                <Button variant="secondary" className="w-full gap-2 rounded-2xl px-6">
                                    <MessageSquareText className="h-5 w-5" />
                                    <span>Enviar Mensagem</span>
                                </Button>
                            </Link>
                        </div>
                    </div>
                }
            />

            {/* Stats Bento Grid */}
            <div className="mb-12 grid grid-cols-2 gap-4 sm:grid-cols-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
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

            {/* Active Course Context Segment */}
            <div className="mb-12 rounded-[2rem] border-2 border-slate-200 bg-white p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 shadow-sm hover:shadow-md transition-all">
                <div className="p-4 bg-sky-100 rounded-2xl border-4 border-sky-50 shadow-inner">
                    <img 
                        src={userProgress.activeCourse?.imageSrc || "/es.svg"} 
                        alt="Course Flag" 
                        className="h-16 w-20 object-cover rounded-lg shadow-sm"
                    />
                </div>
                <div className="flex-1 text-center md:text-left flex flex-col gap-2">
                    <h3 className="font-extrabold text-slate-500 uppercase tracking-widest text-sm">Curso Ativo</h3>
                    <p className="font-black text-2xl text-slate-700">
                        A estudar {userProgress.activeCourse?.title || "Um Novo Idioma"}
                    </p>
                    
                    {/* Fake Progress Bar to represent where they are */}
                    <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden mt-2 relative border border-slate-200">
                        <div className="absolute inset-y-0 left-0 bg-sky-400 w-2/3 rounded-full transition-all duration-1000 ease-out" />
                    </div>
                </div>
            </div>

            {/* Gamified Achievements List */}
            <AchievementsList achievements={achievements} userProgress={userProgress} />
        </div>
    );
}
