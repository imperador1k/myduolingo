import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
    imageUrl: string | null;
    name: string;
    username: string;
    createdAt: Date;
    actions?: ReactNode;
    bannerColorFrom?: string;
    bannerColorTo?: string;
};

export const ProfileHero = ({
    imageUrl,
    name,
    username,
    createdAt,
    actions,
    bannerColorFrom = "from-sky-400",
    bannerColorTo = "to-emerald-400"
}: Props) => {
    return (
        <div className="relative w-full mb-10 pt-20 group">
            {/* Banner Background - More solid Dojo style */}
            <div className={cn(
                "absolute top-0 left-0 right-0 h-40 rounded-[3rem] shadow-sm z-0 opacity-40 transition-all duration-700 bg-gradient-to-br from-stone-100 to-stone-200 border-2 border-stone-200",
                "after:absolute after:inset-0 after:bg-gradient-to-r after:opacity-60 after:rounded-[3rem]",
                bannerColorFrom === "from-sky-400" ? "after:from-sky-100 after:to-emerald-100" : "after:from-indigo-100 after:to-purple-100"
            )} />
            
            <div className="relative z-10 w-full bg-white rounded-[3rem] border-2 border-stone-200 border-b-8 p-8 pt-20 sm:pt-8 shadow-sm flex flex-col md:flex-row items-center sm:items-center gap-6 md:gap-10 mt-16 sm:mt-12 transition-all hover:shadow-md">
                
                {/* Avatar Bento Box breaking out */}
                <div className="absolute -top-20 left-1/2 sm:left-12 -translate-x-1/2 sm:translate-x-0">
                    <div className="flex h-36 w-36 shrink-0 items-center justify-center rounded-[2.5rem] bg-white text-6xl shadow-2xl ring-8 ring-white overflow-hidden border-2 border-stone-100 border-b-8 shadow-stone-200/50 group-hover:scale-105 transition-all duration-500 cursor-pointer">
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
                <div className="sm:ml-[170px] w-full flex flex-col items-center sm:items-start text-center sm:text-left mt-2 sm:mt-0">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-4xl font-black text-stone-700 tracking-tight leading-none truncate max-w-[280px] sm:max-w-full drop-shadow-sm uppercase">
                            {name || username || "Estudante"}
                        </h1>
                        <p className="text-stone-400 font-bold text-lg tracking-tight">@{username?.toLowerCase().replace(" ", "") || "estudante"}</p>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-4">
                        <div className="bg-stone-100 px-4 py-1.5 rounded-xl border-2 border-stone-200 border-b-4 flex items-center gap-2">
                             <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                             <p className="text-[10px] font-black text-stone-500 uppercase tracking-widest leading-none">
                                Membro desde {new Date(createdAt).getFullYear()}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Action Buttons Hub - Tactile and floating */}
                <div className="mt-6 sm:mt-0 flex flex-wrap items-center justify-center gap-4 sm:ml-auto w-full sm:w-auto">
                    {actions}
                </div>
            </div>
        </div>
    );
};
