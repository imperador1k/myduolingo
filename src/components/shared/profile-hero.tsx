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
        <div className="relative w-full mb-8 pt-16 group">
            {/* Banner Background */}
            <div className={cn(
                "absolute top-0 left-0 right-0 h-32 rounded-[2rem] shadow-sm z-0 blur-sm opacity-50 transition-all duration-700 group-hover:blur-none group-hover:opacity-100 bg-gradient-to-r",
                bannerColorFrom,
                bannerColorTo
            )} />
            
            <div className="relative z-10 w-full bg-white rounded-[2rem] border-b-4 border-slate-200 p-6 pt-16 sm:pt-6 shadow-xl flex flex-col md:flex-row items-center sm:items-end gap-6 md:gap-8 mt-16 sm:mt-12">
                
                {/* Avatar breaking out of the box */}
                <div className="absolute -top-16 left-1/2 sm:left-10 -translate-x-1/2 sm:translate-x-0">
                    <div className="flex h-32 w-32 shrink-0 items-center justify-center rounded-full bg-white text-6xl shadow-xl ring-8 ring-white overflow-hidden border-4 border-sky-100 group-hover:border-amber-200 transition-colors duration-500 cursor-pointer">
                        {imageUrl ? (
                            <img src={imageUrl} alt="Avatar" className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        ) : "🧑‍🎓"}
                    </div>
                </div>

                {/* Content Area */}
                <div className="sm:ml-[160px] w-full flex flex-col items-center sm:items-start text-center sm:text-left mt-2 sm:mt-0">
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight truncate w-full max-w-[250px] sm:max-w-full">
                        {name || username || "Estudante"}
                    </h1>
                    <p className="text-slate-500 font-extrabold mb-1">@{username?.toLowerCase().replace(" ", "") || "estudante"}</p>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-md w-fit mx-auto sm:mx-0">
                        Membro desde {new Date(createdAt).getFullYear()}
                    </p>
                </div>

                {/* Action Buttons Hub */}
                <div className="mt-4 sm:mt-0 flex flex-wrap items-center justify-center gap-3 sm:ml-auto w-full sm:w-auto">
                    {actions}
                </div>
            </div>
        </div>
    );
};
