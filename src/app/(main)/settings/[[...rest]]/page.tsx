import { Suspense } from "react";
import Image from "next/image";
import { currentUser } from "@clerk/nextjs/server";
import { SignOutButton } from "@clerk/nextjs";
import { EditProfileButton } from "@/components/shared/edit-profile-button";
import { NotificationToggle } from "@/components/shared/notification-toggle";
import { getUserProgress } from "@/db/queries";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Book, FileText, Shield, FileCheck } from "lucide-react";
import { DangerZone } from "@/components/settings/danger-zone";
import { SubscriptionCard } from "@/components/settings/subscription-card";
import { checkSubscription } from "@/lib/subscription";

export const dynamic = "force-dynamic";

export default function SettingsPage() {
    return (
        <div className="max-w-4xl mx-auto py-10 px-4 flex flex-col gap-8 pb-24">
            <h1 className="text-3xl md:text-4xl font-black text-stone-800 tracking-tight animate-in fade-in duration-500">
                Definições
            </h1>

            <Suspense fallback={<SettingsSkeleton />}>
                <SettingsData />
            </Suspense>
        </div>
    );
}

async function SettingsData() {
    const user = await currentUser();
    if (!user) return redirect("/");

    const userProgress = await getUserProgress();
    if (!userProgress) return redirect("/courses");

    const isPro = await checkSubscription();

    const formattedDate = new Intl.DateTimeFormat("pt-PT", {
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(new Date(user.createdAt));

    return (
        <div className="flex flex-col gap-8 animate-in fade-in duration-500">
            {/* The "Player Passport" (Profile Section) */}
            <div className="bg-white border-2 border-stone-200 border-b-8 rounded-[2rem] p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between relative overflow-hidden gap-6">
                <div className="flex items-center gap-x-6">
                    <div className="relative h-20 w-20 md:h-24 md:w-24 shrink-0 overflow-hidden rounded-full border-4 border-emerald-100 shadow-xl bg-stone-100">
                        <Image
                            src={user.imageUrl}
                            alt="Avatar"
                            fill
                            className="object-cover"
                        />
                    </div>
                    <div className="flex flex-col">
                        <h2 className="text-2xl font-bold text-stone-700">
                            {user.firstName ? `${user.firstName} ${user.lastName || ""}` : "Utilizador"}
                        </h2>
                        <p className="text-sm font-bold text-stone-400">
                            {user.emailAddresses[0]?.emailAddress || "Sem email"}
                        </p>
                    </div>
                </div>

                <div className="flex shrink-0">
                    <EditProfileButton />
                </div>
            </div>

            {/* Account Details (Engraved Look) */}
            <div>
                <h3 className="text-xl font-black text-stone-800 mb-4">A Minha Conta</h3>
                <div className="bg-white border-2 border-stone-200 border-b-8 rounded-[2rem] p-6 md:p-8 flex flex-col gap-4">
                    <div className="bg-stone-50 border-2 border-stone-200 rounded-2xl p-4 flex justify-between items-center">
                        <span className="font-bold text-stone-500">Email</span>
                        <span className="font-bold text-stone-800 break-all ml-4">
                            {user.emailAddresses[0]?.emailAddress}
                        </span>
                    </div>
                    <div className="bg-stone-50 border-2 border-stone-200 rounded-2xl p-4 flex justify-between items-center">
                        <span className="font-bold text-stone-500">Registo</span>
                        <span className="font-bold text-stone-800">
                            {formattedDate}
                        </span>
                    </div>
                </div>
            </div>

            {/* Subscription Management */}
            <div>
                <SubscriptionCard isPro={isPro} />
            </div>

            {/* Notifications & Preferences */}
            <div>
                <h3 className="text-xl font-black text-stone-800 mb-4">Notificações</h3>
                <div className="bg-white border-2 border-stone-200 border-b-8 rounded-[2rem] p-6 md:p-8 flex flex-col gap-4">
                    <NotificationToggle initialEnabled={userProgress.notificationsEnabled} />
                </div>
            </div>

            {/* Support & Legal (The Compliance Grid) */}
            <div>
                <h3 className="text-xl font-black text-stone-800 mb-4">Suporte & Legal</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Link href="/docs" className="bg-white border-2 border-stone-200 border-b-6 rounded-2xl p-5 flex items-center gap-4 hover:-translate-y-1 hover:shadow-md transition-all cursor-pointer group">
                        <Book className="h-6 w-6 text-stone-400 group-hover:text-[#1CB0F6] transition-colors shrink-0" />
                        <span className="font-bold text-stone-700">Manual de Apoio</span>
                    </Link>
                    <Link href="/terms" className="bg-white border-2 border-stone-200 border-b-6 rounded-2xl p-5 flex items-center gap-4 hover:-translate-y-1 hover:shadow-md transition-all cursor-pointer group">
                        <FileText className="h-6 w-6 text-stone-400 group-hover:text-[#1CB0F6] transition-colors shrink-0" />
                        <span className="font-bold text-stone-700">Termos de Uso</span>
                    </Link>
                    <Link href="/privacy" className="bg-white border-2 border-stone-200 border-b-6 rounded-2xl p-5 flex items-center gap-4 hover:-translate-y-1 hover:shadow-md transition-all cursor-pointer group">
                        <Shield className="h-6 w-6 text-stone-400 group-hover:text-[#1CB0F6] transition-colors shrink-0" />
                        <span className="font-bold text-stone-700">Política de Privacidade</span>
                    </Link>
                    <Link href="/licenses" className="bg-white border-2 border-stone-200 border-b-6 rounded-2xl p-5 flex items-center gap-4 hover:-translate-y-1 hover:shadow-md transition-all cursor-pointer group">
                        <FileCheck className="h-6 w-6 text-stone-400 group-hover:text-[#1CB0F6] transition-colors shrink-0" />
                        <span className="font-bold text-stone-700">Licenças</span>
                    </Link>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col gap-8">
                <SignOutButton>
                    <button className="w-full md:w-auto mx-auto block bg-white text-rose-500 border-2 border-rose-200 border-b-6 rounded-2xl px-8 py-4 font-black uppercase tracking-wider hover:bg-rose-50 active:translate-y-1 active:border-b-0 transition-all text-center">
                        Terminar Sessão
                    </button>
                </SignOutButton>

                <DangerZone />
            </div>
        </div>
    );
}

// --- SKELETON FALLBACK ---
const SettingsSkeleton = () => {
    return (
        <div className="flex flex-col gap-8 animate-in fade-in duration-500">
            {/* Player Passport Skeleton */}
            <div className="bg-white border-2 border-stone-200 border-b-8 rounded-[2rem] p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between relative overflow-hidden gap-6 animate-pulse">
                <div className="flex items-center gap-x-6">
                    <div className="h-20 w-20 md:h-24 md:w-24 rounded-full bg-stone-200 shrink-0" />
                    <div className="flex flex-col gap-2">
                        <div className="h-6 w-48 bg-stone-200 rounded-lg" />
                        <div className="h-4 w-32 bg-stone-200 rounded-md" />
                    </div>
                </div>
                <div className="w-full md:w-32 h-12 bg-stone-200 rounded-xl" />
            </div>

            {/* Account Details Skeleton */}
            <div>
                <div className="h-6 w-40 bg-stone-200 rounded-lg mb-4 animate-pulse" />
                <div className="bg-white border-2 border-stone-200 border-b-8 rounded-[2rem] p-6 md:p-8 flex flex-col gap-4 animate-pulse">
                    <div className="h-16 w-full bg-stone-200 rounded-2xl" />
                    <div className="h-16 w-full bg-stone-200 rounded-2xl" />
                </div>
            </div>

            {/* Subscription Skeleton */}
            <div>
                <div className="bg-white border-2 border-stone-200 border-b-8 rounded-[2rem] p-6 md:p-8 animate-pulse h-[240px]" />
            </div>

            {/* Notifications Skeleton */}
            <div>
                <div className="h-6 w-32 bg-stone-200 rounded-lg mb-4 animate-pulse" />
                <div className="bg-white border-2 border-stone-200 border-b-8 rounded-[2rem] p-6 md:p-8 animate-pulse h-[100px]" />
            </div>

            {/* Support & Legal Skeleton */}
            <div>
                <div className="h-6 w-48 bg-stone-200 rounded-lg mb-4 animate-pulse" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-20 bg-white border-2 border-stone-200 border-b-6 rounded-2xl p-5 animate-pulse flex items-center gap-4">
                            <div className="w-6 h-6 rounded-md bg-stone-200" />
                            <div className="h-4 w-32 bg-stone-200 rounded-md" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
