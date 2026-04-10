"use client";

import { useClerk } from "@clerk/nextjs";

export const EditProfileButton = () => {
    const { openUserProfile } = useClerk();

    return (
        <button
            onClick={() => openUserProfile()}
            className="bg-stone-100 text-stone-600 font-bold px-5 py-3 rounded-xl border-2 border-stone-200 border-b-4 hover:bg-stone-200 active:translate-y-1 active:border-b-0 transition-all uppercase tracking-wide"
        >
            Editar Perfil
        </button>
    );
};
