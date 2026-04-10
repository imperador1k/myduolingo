import Image from "next/image";
import { currentUser } from "@clerk/nextjs/server";
import { SignOutButton } from "@clerk/nextjs";
import { EditProfileButton } from "@/components/shared/edit-profile-button";
import { NotificationToggle } from "@/components/shared/notification-toggle";
import { getUserProgress } from "@/db/queries";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Info, ChevronRight, BookOpen, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
    const user = await currentUser();
    if (!user) return redirect("/");

    const userProgress = await getUserProgress();
    if (!userProgress) return redirect("/courses");

    const formattedDate = new Intl.DateTimeFormat("pt-PT", {
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(new Date(user.createdAt));

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
                            {user.firstName ? `${user.firstName} ${user.lastName || ""}` : "Utilizador"}
                        </h2>
                        <p className="text-sm font-medium text-slate-500">
                            {user.emailAddresses[0]?.emailAddress || "Sem email"}
                        </p>
                    </div>
                </div>

                <EditProfileButton />
            </div>

            {/* Settings/Details Section */}
            <div className="mt-8">
                <h3 className="mb-4 text-xl font-bold text-slate-700">A Minha Conta</h3>
                <div className="space-y-4">
                    <div className="rounded-3xl border-2 border-slate-200 bg-white p-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-y-2 rounded-2xl bg-slate-50 p-4 transition-colors hover:bg-slate-100">
                            <span className="font-bold text-slate-700">Email</span>
                            <span className="text-sm font-medium text-slate-500">
                                {user.emailAddresses[0]?.emailAddress}
                            </span>
                        </div>
                        <div className="my-2 h-[2px] w-full bg-slate-100" />
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-y-2 rounded-2xl bg-slate-50 p-4 transition-colors hover:bg-slate-100">
                            <span className="font-bold text-slate-700">Data de Registo</span>
                            <span className="text-sm font-medium text-slate-500">
                                {formattedDate}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Notifications Panel */}
                <h3 className="mb-4 mt-8 text-xl font-bold text-slate-700">Notificações</h3>
                <div className="space-y-4">
                    <NotificationToggle initialEnabled={userProgress.notificationsEnabled} />
                </div>

                {/* Official Support & Docs */}
                <h3 className="mb-4 mt-12 text-xl font-bold text-slate-700">Apoio Estudantil</h3>
                <div className="space-y-4">
                    <Link href="/docs" className="flex items-center justify-between rounded-3xl border-2 border-[#b3ffc7] bg-[#e6ffed] shadow-sm border-b-[6px] transition-all duration-300 hover:bg-[#d7ffb8] hover:border-[#58cc02] hover:border-b-[6px] active:border-b-2 active:translate-y-1 group p-5 cursor-pointer outline-none">
                        <div className="flex items-center gap-5">
                            <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-[1.5rem] bg-white border-2 border-[#b3ffc7] shadow-sm text-[#58cc02] transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6 shrink-0">
                                <BookOpen className="h-7 w-7 sm:h-8 sm:w-8 fill-[#58cc02]/20" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-lg sm:text-xl font-black text-emerald-800 tracking-tight leading-tight mb-1">Manual & Base de Conhecimento</span>
                                <span className="text-xs sm:text-sm font-bold text-emerald-600 line-clamp-1">Tutoriais, Ligas, Corações e F.A.Q. Oficiais</span>
                            </div>
                        </div>
                        <div className="hidden sm:flex h-10 w-10 bg-white rounded-full items-center justify-center shadow-sm border border-emerald-100 group-hover:bg-[#58cc02] transition-colors shrink-0 ml-4">
                            <ArrowRight className="h-5 w-5 text-[#58cc02] group-hover:text-white transition-colors" strokeWidth={3} />
                        </div>
                    </Link>
                </div>

                {/* Extras Panel */}
                <h3 className="mb-4 mt-8 text-xl font-bold text-slate-700">Acerca de</h3>
                <div className="space-y-4">
                    <Link href="/settings/about" className="flex items-center justify-between rounded-3xl border-2 border-sky-100 bg-sky-50 shadow-sm border-b-4 transition-all hover:bg-sky-100 hover:border-b-4 active:border-b-2 active:translate-y-1 group p-4 cursor-pointer">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white border-2 border-sky-100 shadow-sm text-sky-500 transition-transform group-hover:scale-110">
                                <Info className="h-6 w-6" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-lg font-bold text-sky-800">Sobre o MyDuolingo</span>
                                <span className="text-sm font-medium text-sky-600">Versões, Termos de uso e Privacidade</span>
                            </div>
                        </div>
                        <ChevronRight className="h-6 w-6 text-sky-400 group-hover:text-sky-600 transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>
            </div>

            {/* Custom Sign Out Button */}
            <SignOutButton>
                <button className="mt-12 w-full md:w-auto bg-rose-100 text-rose-500 font-bold uppercase tracking-wide py-4 px-8 rounded-2xl border-b-4 border-rose-200 hover:bg-rose-200 hover:border-rose-300 active:border-b-0 active:translate-y-1 transition-all">
                    Terminar Sessão
                </button>
            </SignOutButton>
        </div>
    );
}
