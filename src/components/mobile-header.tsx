import { getUserProgress } from "@/db/queries";
import { Button } from "@/components/ui/button";
import { InfinityIcon, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export const MobileHeader = async () => {
    const userProgress = await getUserProgress();

    if (!userProgress) {
        return null; // Or generic header
    }

    return (
        <nav className="lg:hidden px-4 h-[50px] flex items-center justify-between bg-white border-b fixed top-0 w-full z-50">
            {/* Active Course */}
            <Link href="/courses">
                <Button variant="ghost" size="sm" className="gap-2">
                    {userProgress.activeCourse ? (
                        <Image
                            src={userProgress.activeCourse.imageSrc}
                            alt={userProgress.activeCourse.title}
                            className="rounded-md border"
                            width={32}
                            height={32}
                        />
                    ) : (
                        <div className="h-8 w-8 rounded-md bg-slate-200" />
                    )}
                </Button>
            </Link>

            {/* Stats */}
            <div className="flex items-center gap-x-4">
                {/* XP */}
                <div className="flex items-center gap-x-1">
                    <Image src="/raio_duolingo.png" height={22} width={22} alt="XP" />
                    <span className="text-amber-500 font-bold">{userProgress.points}</span>
                </div>

                {/* Streak */}
                <Link href="/shop" className="flex items-center gap-x-1">
                    <Image src="/flame_duolingo.png" height={22} width={22} alt="Streak" className={userProgress.streak > 0 ? "" : "grayscale"} />
                    <span className="text-amber-500 font-bold">{userProgress.streak}</span>
                </Link>

                {/* Hearts */}
                <Link href="/shop" className="flex items-center gap-x-1">
                    <Image src="/duolingo_heart.jpg" height={22} width={22} alt="Hearts" />
                    <span className="text-rose-500 font-bold">
                        {userProgress.hearts === 5 ? 5 : userProgress.hearts}
                    </span>
                </Link>
            </div>
        </nav>
    );
};
