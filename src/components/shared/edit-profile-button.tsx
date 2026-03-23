"use client";

import { useClerk } from "@clerk/nextjs";
import { Settings } from "lucide-react";

export const EditProfileButton = () => {
    const { openUserProfile } = useClerk();

    return (
        <button
            onClick={() => openUserProfile()}
            className="mt-2 md:mt-0 md:ml-auto flex shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-100 px-5 py-3 font-bold text-slate-600 transition-colors hover:bg-slate-200 active:scale-95"
        >
            <Settings className="h-5 w-5" />
            Editar Perfil
        </button>
    );
};
