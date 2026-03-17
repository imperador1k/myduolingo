"use client";

import Image from "next/image";
import { useUser, SignOutButton, useClerk } from "@clerk/nextjs";
import { Loader, Settings } from "lucide-react";

export default function SettingsPage() {
    const { user, isLoaded } = useUser();
    const { openUserProfile } = useClerk();

    if (!isLoaded) {
        return (
            <div className="flex h-full w-full items-center justify-center p-6 mt-12">
                <Loader className="h-10 w-10 animate-spin text-slate-400" />
            </div>
        );
    }

    if (!user) return null;

    const formattedDate = user.createdAt
        ? new Intl.DateTimeFormat("pt-PT", {
              day: "numeric",
              month: "long",
              year: "numeric",
          }).format(new Date(user.createdAt))
        : "Data desconhecida";

    return (
        <div className="mx-auto max-w-3xl p-4 sm:p-6 pb-24">
            <h1 className="mb-8 text-3xl font-extrabold tracking-tight text-slate-800">Definições</h1>

            {/* Header Card */}
            <div className="flex flex-col md:flex-row md:items-center gap-6 rounded-3xl border-2 border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
                <div className="flex items-center gap-x-6">
                    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border-4 border-emerald-100 bg-slate-100 shadow-sm">
                        <Image
                            src={user.imageUrl}
                            alt="Avatar"
                            fill
                            className="object-cover"
                        />
                    </div>
                    <div className="flex flex-col">
                        <h2 className="text-2xl font-bold text-slate-700">
                            {user.fullName || user.firstName || "Utilizador"}
                        </h2>
                        <p className="text-sm font-medium text-slate-500">
                            {user.primaryEmailAddress?.emailAddress || "Sem email"}
                        </p>
                    </div>
                </div>

                <button
                    onClick={() => openUserProfile()}
                    className="mt-2 md:mt-0 md:ml-auto flex shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-100 px-5 py-3 font-bold text-slate-600 transition-colors hover:bg-slate-200 active:scale-95"
                >
                    <Settings className="h-5 w-5" />
                    Editar Perfil
                </button>
            </div>

            {/* Settings/Details Section */}
            <div className="mt-8">
                <h3 className="mb-4 text-xl font-bold text-slate-700">A Minha Conta</h3>
                
                <div className="space-y-4">
                    {/* Information container */}
                    <div className="rounded-3xl border-2 border-slate-200 bg-white p-2">
                        {/* Email Row */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-y-2 rounded-2xl bg-slate-50 p-4 transition-colors hover:bg-slate-100">
                            <span className="font-bold text-slate-700">Email</span>
                            <span className="text-sm font-medium text-slate-500">
                                {user.primaryEmailAddress?.emailAddress}
                            </span>
                        </div>
                        
                        <div className="my-2 h-[2px] w-full bg-slate-100" />
                        
                        {/* Date Joined Row */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-y-2 rounded-2xl bg-slate-50 p-4 transition-colors hover:bg-slate-100">
                            <span className="font-bold text-slate-700">Data de Registo</span>
                            <span className="text-sm font-medium text-slate-500">
                                {formattedDate}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom Sign Out Button */}
            <SignOutButton>
                <button className="mt-8 w-full md:w-auto bg-rose-100 text-rose-500 font-bold uppercase tracking-wide py-4 px-8 rounded-2xl border-b-4 border-rose-200 hover:bg-rose-200 hover:border-rose-300 active:border-b-0 active:translate-y-1 transition-all">
                    Terminar Sessão
                </button>
            </SignOutButton>
        </div>
    );
}
