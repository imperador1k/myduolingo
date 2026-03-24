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
        { icon: <Flame className="h-9 w-9 text-orange-500 fill-orange-200" />, value: streak, label: "Série", color: "bg-white border-stone-200 text-stone-700" },
        { icon: <Zap className="h-9 w-9 text-amber-500 fill-amber-200" />, value: totalXpEarned.toLocaleString(), label: "XP Total", color: "bg-white border-stone-200 text-stone-700" },
        { icon: <Target className="h-9 w-9 text-green-500 fill-green-200" />, value: completedLessons, label: "Lições", color: "bg-white border-stone-200 text-stone-700" },
        { icon: <Heart className="h-9 w-9 text-rose-500 fill-rose-200" />, value: userProgress.hearts, label: "Vidas", color: "bg-white border-stone-200 text-stone-700" },
    ];

    const achievements = ACHIEVEMENTS.map((achievement: Achievement) => ({
        title: achievement.title,
        description: achievement.description,
        icon: achievement.icon,
        unlocked: achievement.condition(userProgress),
    }));

    return (
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 pb-32 font-sans">
            <ProfileHero 
                imageUrl={userProgress.userImageSrc}
                name={userProgress.userName || "Estudante"}
                username={userProgress.userName || "estudante"}
                createdAt={new Date()} 
                bannerColorFrom="from-sky-500"
                bannerColorTo="from-emerald-500"
                actions={
                    <div className="flex w-full sm:w-auto items-center gap-4">
                        <div className="flex-1 sm:w-40 h-14">
                            <FollowButton userId={params.userId} isFollowing={isFollowing} />
                        </div>
                        <div className="flex-1 sm:w-auto h-14">
                            <Link href={`/messages?userId=${params.userId}`} className="w-full block h-full">
                                <Button variant="secondary" className="w-full h-full gap-2 rounded-[1.5rem] px-8 border-b-4 border-stone-300 active:border-b-0 active:translate-y-1 transition-all">
                                    <MessageSquareText className="h-6 w-6 text-stone-500" />
                                    <span className="font-black uppercase tracking-widest text-sm">Mensagem</span>
                                </Button>
                            </Link>
                        </div>
                    </div>
                }
            />

            {/* Stats Bento Grid - High Definition Dojo Style */}
            <div className="mb-14 grid grid-cols-2 gap-6 sm:grid-cols-4 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
                {stats.map((stat, i) => (
                    <div
                        key={i}
                        className={cn(
                            "group flex flex-col items-center justify-center rounded-[2.5rem] border-b-8 border-2 p-7 transition-all shadow-sm hover:shadow-md hover:-translate-y-1 active:translate-y-0 active:border-b-0 active:mb-[8px] bg-white",
                            stat.color
                        )}
                    >
                        <div className="p-3 bg-stone-50 rounded-2xl border-2 border-stone-100 mb-4 group-hover:scale-110 transition-transform">
                            {stat.icon}
                        </div>
                        <p className="text-3xl font-black text-stone-700 tracking-tighter drop-shadow-sm">{stat.value}</p>
                        <p className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] mt-2">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Active Course Context Segment - Bento Upgrade */}
            <div className="mb-14 rounded-[3rem] border-2 border-stone-200 border-b-8 bg-white p-8 md:p-10 flex flex-col md:flex-row items-center gap-8 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
                {/* Decorative background accent */}
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-sky-50 rounded-full blur-3xl opacity-40 group-hover:opacity-60 transition-opacity" />
                
                <div className="relative z-10 p-5 bg-sky-50 rounded-[2rem] border-2 border-sky-100 border-b-8 shadow-sky-200/50 group-hover:scale-105 transition-transform">
                    <img 
                        src={userProgress.activeCourse?.imageSrc || "/es.svg"} 
                        alt="Course Flag" 
                        className="h-20 w-24 object-cover rounded-xl shadow-md border-2 border-white"
                    />
                </div>
                <div className="relative z-10 flex-1 text-center md:text-left flex flex-col gap-3">
                    <div className="flex items-center justify-center md:justify-start gap-2">
                        <span className="h-1.5 w-6 bg-sky-400 rounded-full" />
                        <h3 className="font-black text-sky-500 uppercase tracking-widest text-xs">Curso Ativo</h3>
                    </div>
                    <p className="font-black text-3xl text-stone-700 tracking-tight leading-none uppercase">
                        A estudar {userProgress.activeCourse?.title || "Um Novo Idioma"}
                    </p>
                    
                    {/* Dojo Progress Bar */}
                    <div className="w-full mt-4">
                        <div className="flex justify-between items-center mb-2 px-1">
                             <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Nível de Mestria</span>
                             <span className="text-[10px] font-black text-sky-500 uppercase tracking-widest">65%</span>
                        </div>
                        <div className="w-full h-5 bg-stone-100 rounded-full overflow-hidden relative border-2 border-stone-200 shadow-inner">
                            <div className="absolute inset-y-0 left-0 bg-sky-400 w-2/3 rounded-full transition-all duration-1000 ease-out border-r-4 border-sky-500 shadow-[0_0_15px_rgba(56,189,248,0.5)]" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Gamified Achievements List */}
            <AchievementsList achievements={achievements} userProgress={userProgress} />
        </div>
    );
}
