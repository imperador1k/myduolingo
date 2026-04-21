import { ReactNode } from "react";
import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
    imageUrl: string | null;
    name: string;
    username: string;
    createdAt: Date;
    actions?: ReactNode;
    bannerColorFrom?: string;
    bannerColorTo?: string;
    isPro?: boolean;
};

export const ProfileHero = ({
    imageUrl,
    name,
    username,
    createdAt,
    actions,
    bannerColorFrom = "from-sky-400",
    bannerColorTo = "to-emerald-400",
    isPro = false
}: Props) => {
    return (
        <div className="relative w-full mb-10 pt-20 group">
            {/* Banner Background - More solid Dojo style */}
            <div className={cn(
                "absolute top-0 left-0 right-0 h-40 rounded-[3rem] shadow-sm z-0 opacity-40 transition-all duration-700 bg-gradient-to-br from-stone-100 to-stone-200 border-2 border-stone-200",
                "after:absolute after:inset-0 after:bg-gradient-to-r after:opacity-60 after:rounded-[3rem]",
                bannerColorFrom === "from-sky-400" ? "after:from-sky-100 after:to-emerald-100" : "after:from-indigo-100 after:to-purple-100"
            )} />
            
            <div className="relative z-10 w-full bg-white rounded-[3rem] border-2 border-stone-200 border-b-8 p-8 pt-24 md:pt-8 shadow-sm flex flex-col md:flex-row items-center md:items-center gap-6 md:gap-10 mt-16 md:mt-12 transition-all hover:shadow-md">
                
                {/* Avatar Bento Box breaking out */}
                <div className="absolute -top-20 flex left-1/2 max-md:-translate-x-1/2 md:left-12 md:translate-x-0">
                    <div className="flex h-32 w-32 md:h-36 md:w-36 shrink-0 items-center justify-center rounded-[2rem] md:rounded-[2.5rem] bg-white text-5xl md:text-6xl shadow-2xl ring-4 md:ring-8 ring-white overflow-hidden border-2 border-stone-100 border-b-8 shadow-stone-200/50 group-hover:scale-105 transition-all duration-500 cursor-pointer">
                        {imageUrl ? (
                            <img src={imageUrl} alt="Avatar" className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        ) : (
                            <div className="h-full w-full flex items-center justify-center bg-sky-50 text-sky-500 font-black">
                                {name[0]?.toUpperCase() || "🧑‍🎓"}
                            </div>
                        )}
                    </div>
                </div>

                {/* Content Area */}
                <div className="md:ml-[170px] w-full md:flex-1 flex flex-col items-center md:items-start text-center md:text-left mt-10 md:mt-0 min-w-0 px-2 lg:px-0">
                    <div className="flex flex-col gap-1 w-full">
                        <h1 className="text-3xl lg:text-4xl font-black text-stone-700 tracking-tight drop-shadow-sm uppercase break-words line-clamp-2 xl:line-clamp-none flex items-center justify-center md:justify-start">
                            {name || username || "Estudante"}
                            {isPro && (
                                <BadgeCheck className="h-6 w-6 lg:h-8 lg:w-8 text-amber-500 fill-amber-300 ml-2 shrink-0 inline-block" aria-hidden="true" />
                            )}
                        </h1>
                        <p className="text-stone-400 font-bold text-lg tracking-tight truncate w-full">@{username?.toLowerCase().replace(" ", "") || "estudante"}</p>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-4">
                        <div className="bg-stone-100 px-4 py-1.5 rounded-xl border-2 border-stone-200 border-b-4 flex items-center gap-2">
                             <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse shrink-0" />
                             <p className="text-[10px] font-black text-stone-500 uppercase tracking-widest leading-none truncate">
                                Membro desde {new Date(createdAt).getFullYear()}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Action Buttons Hub - Tactile and floating */}
                <div className="mt-4 md:mt-0 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 shrink-0 w-full md:w-auto flex-wrap">
                    {actions}
                </div>
            </div>
        </div>
    );
};
