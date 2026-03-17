import { getUserProgress } from "@/db/queries";
import { Button } from "@/components/ui/button";
import { InfinityIcon, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { TedyLottie } from "@/components/ui/lottie-animation";

export const MobileHeader = async () => {
    const userProgress = await getUserProgress();

    if (!userProgress) {
        return null;
    }

    return (
        <nav className="lg:hidden fixed top-0 w-full z-50 flex items-center justify-center gap-2 py-2 px-2 pointer-events-none">
            
            {/* XP Pill */}
            <Link href="/shop" className="pointer-events-auto">
                <div className="flex items-center gap-1.5 rounded-full bg-amber-50/90 backdrop-blur-sm border-2 border-amber-200 px-3 py-1 shadow-sm active:scale-95 transition-transform">
                    <Image src="/raio_duolingo.png" height={18} width={18} alt="XP" />
                    <span className="text-amber-600 font-extrabold text-sm">{userProgress.points}</span>
                </div>
            </Link>

            {/* Streak Pill */}
            <Link href="/shop" className="pointer-events-auto">
                <div className="flex items-center gap-1.5 rounded-full bg-orange-50/90 backdrop-blur-sm border-2 border-orange-200 px-3 py-1 shadow-sm active:scale-95 transition-transform">
                    <Image src="/flame_duolingo.png" height={18} width={18} alt="Streak" className={userProgress.streak > 0 ? "" : "grayscale opacity-50"} />
                    <span className="text-orange-600 font-extrabold text-sm">{userProgress.streak}</span>
                </div>
            </Link>

            {/* Hearts Pill */}
            <Link href="/shop" className="pointer-events-auto">
                <div className={`flex items-center gap-1.5 rounded-full backdrop-blur-sm border-2 px-3 py-1 shadow-sm active:scale-95 transition-transform ${
                    userProgress.hearts > 0 
                        ? "bg-rose-50/90 border-rose-200 text-rose-600" 
                        : "bg-slate-100 border-slate-200 text-slate-500 grayscale opacity-80"
                }`}>
                    <TedyLottie className="w-5 h-5" />
                    <span className="font-extrabold text-sm">
                        {userProgress.hearts === 5 ? 5 : userProgress.hearts}
                    </span>
                </div>
            </Link>

        </nav>
    );
};

