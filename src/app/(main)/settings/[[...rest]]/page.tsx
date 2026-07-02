import { Suspense } from "react";
import Image from "next/image";
import { currentUser } from "@clerk/nextjs/server";
import { EditProfileButton } from "@/components/shared/edit-profile-button";
import { NotificationToggle } from "@/components/shared/notification-toggle";
import { InAppNotificationToggle } from "@/components/settings/in-app-notification-toggle";
import { getUserProgress } from "@/db/queries";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Book,
  FileText,
  Shield,
  FileCheck,
  Mail,
  CalendarDays,
} from "lucide-react";
import { DangerZone } from "@/components/settings/danger-zone";
import { SignOutZone } from "@/components/settings/sign-out-zone";
import { SubscriptionCard } from "@/components/settings/subscription-card";
import { checkSubscription } from "@/lib/subscription";
import { E2ESettings } from "@/components/settings/e2e-settings";
import { ActiveSessions } from "@/components/settings/active-sessions";
import { ConnectedAccounts } from "@/components/settings/connected-accounts";
import { ThemeToggle } from "@/components/settings/theme-toggle";
import { LanguageToggle } from "@/components/settings/language-toggle";
import { SoundToggle } from "@/components/settings/sound-toggle";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

export default function SettingsPage() {
  const t = useTranslations("settings");

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 flex flex-col gap-8 pb-24">
      <h1 className="text-3xl md:text-4xl font-black text-stone-800 dark:text-slate-100 tracking-tight animate-in fade-in duration-500">
        {t("title")}
      </h1>

      <Suspense fallback={<SettingsSkeleton />}>
        <SettingsData />
      </Suspense>
    </div>
  );
}

async function SettingsData() {
  const t = await getTranslations("settings");
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
      <div className="bg-white dark:bg-slate-900 border-2 border-sky-200 border-b-8 rounded-[2.5rem] p-6 md:p-10 flex flex-col md:flex-row md:items-center justify-between relative overflow-hidden gap-6 shadow-sm group hover:shadow-md hover:-translate-y-1 transition-all">
        <div className="absolute top-0 right-0 w-64 h-64 bg-sky-50 rounded-full blur-3xl opacity-60 z-0 translate-x-10 -translate-y-10 group-hover:scale-110 transition-transform duration-700" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-50 rounded-full blur-3xl opacity-60 z-0 -translate-x-10 translate-y-10" />

        <div className="flex items-center gap-4 sm:gap-6 min-w-0 z-10">
          <div className="relative h-20 w-20 md:h-28 md:w-28 shrink-0 overflow-hidden rounded-[1.8rem] md:rounded-[2.2rem] border-4 border-white shadow-lg bg-stone-100 dark:bg-slate-800 group-hover:rotate-3 group-hover:scale-105 transition-all duration-500 ring-4 ring-sky-50">
            <Image
              src={user.imageUrl}
              alt="Avatar"
              fill
              className="object-cover"
            />
          </div>
          <div className="flex flex-col min-w-0">
            <h2 className="text-2xl sm:text-3xl font-black text-stone-700 dark:text-slate-200 truncate tracking-tight drop-shadow-sm">
              {user.firstName
                ? `${user.firstName} ${user.lastName || ""}`
                : t("user_placeholder")}
            </h2>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <p className="text-xs sm:text-sm font-black text-stone-400 dark:text-slate-500 dark:text-slate-400 truncate uppercase tracking-[0.2em]">
                {t("online_status")}
              </p>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 z-10 w-full md:w-auto">
          <EditProfileButton />
        </div>
      </div>

      <div>
        <h3 className="text-xl font-black text-stone-800 dark:text-slate-100 mb-4">
          {t("my_account")}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-white dark:bg-slate-900 border-2 border-stone-200 dark:border-slate-800 border-b-8 rounded-[2.5rem] p-6 md:p-8 flex flex-col justify-center items-center text-center sm:items-start sm:text-left gap-2 group hover:-translate-y-1 hover:shadow-md transition-all overflow-hidden relative">
            <div className="absolute -right-6 -bottom-6 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-500">
              <Mail className="w-32 h-32 text-stone-800 dark:text-slate-100" />
            </div>
            <div className="p-3 bg-indigo-50 border-2 border-indigo-100 text-indigo-500 rounded-2xl mb-2 group-hover:scale-110 group-hover:rotate-[-5deg] transition-transform shadow-sm relative z-10">
              <Mail className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 dark:text-slate-500 dark:text-slate-400 relative z-10">
              {t("email_address")}
            </span>
            <span className="text-lg sm:text-xl font-black text-stone-700 dark:text-slate-200 break-all w-full relative z-10">
              {user.emailAddresses[0]?.emailAddress}
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 border-2 border-stone-200 dark:border-slate-800 border-b-8 rounded-[2.5rem] p-6 md:p-8 flex flex-col justify-center items-center text-center sm:items-start sm:text-left gap-2 group hover:-translate-y-1 hover:shadow-md transition-all overflow-hidden relative">
            <div className="absolute -right-6 -bottom-6 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-500">
              <CalendarDays className="w-32 h-32 text-stone-800 dark:text-slate-100" />
            </div>
            <div className="p-3 bg-emerald-50 border-2 border-emerald-100 text-emerald-500 rounded-2xl mb-2 group-hover:scale-110 group-hover:rotate-[5deg] transition-transform shadow-sm relative z-10">
              <CalendarDays className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 dark:text-slate-500 dark:text-slate-400 relative z-10">
              {t("member_since")}
            </span>
            <span className="text-lg sm:text-xl font-black text-stone-700 dark:text-slate-200 relative z-10">
              {formattedDate}
            </span>
          </div>
        </div>
      </div>

      <div>
        <SubscriptionCard isPro={isPro} />
      </div>

      <div>
        <h3 className="text-xl font-black text-stone-800 dark:text-slate-100 mb-4">
          {t("notifications")}
        </h3>
        <div className="bg-white dark:bg-slate-900 border-2 border-stone-200 dark:border-slate-800 border-b-8 rounded-[2rem] p-6 md:p-8 flex flex-col gap-4">
          <NotificationToggle
            initialEnabled={userProgress.notificationsEnabled}
          />
          <InAppNotificationToggle />
          <hr className="border-2 border-stone-100 dark:border-slate-800 rounded-full" />
          <SoundToggle />
        </div>
      </div>

      <div>
        <ThemeToggle />
        <LanguageToggle />
      </div>

      <div className="flex flex-col gap-6">
        <E2ESettings />
        <div className="bg-white dark:bg-slate-900 border-2 border-stone-200 dark:border-slate-800 border-b-8 rounded-[2rem] p-6 md:p-8 flex flex-col gap-8">
          <ActiveSessions />
          <hr className="border-2 border-stone-100 dark:border-slate-800 rounded-full" />
          <ConnectedAccounts />
        </div>
      </div>

      <div>
        <h3 className="text-xl font-black text-stone-800 dark:text-slate-100 mb-4">
          {t("support_legal")}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/docs"
            className="bg-white dark:bg-slate-900 border-2 border-stone-200 dark:border-slate-800 border-b-6 rounded-2xl p-5 flex items-center gap-4 hover:-translate-y-1 hover:shadow-md transition-all cursor-pointer group"
          >
            <Book className="h-6 w-6 text-stone-400 dark:text-slate-500 dark:text-slate-400 group-hover:text-[#1CB0F6] transition-colors shrink-0" />
            <span className="font-bold text-stone-700 dark:text-slate-200">
              {t("support_manual")}
            </span>
          </Link>
          <Link
            href="/terms"
            className="bg-white dark:bg-slate-900 border-2 border-stone-200 dark:border-slate-800 border-b-6 rounded-2xl p-5 flex items-center gap-4 hover:-translate-y-1 hover:shadow-md transition-all cursor-pointer group"
          >
            <FileText className="h-6 w-6 text-stone-400 dark:text-slate-500 dark:text-slate-400 group-hover:text-[#1CB0F6] transition-colors shrink-0" />
            <span className="font-bold text-stone-700 dark:text-slate-200">
              {t("terms_of_use")}
            </span>
          </Link>
          <Link
            href="/privacy"
            className="bg-white dark:bg-slate-900 border-2 border-stone-200 dark:border-slate-800 border-b-6 rounded-2xl p-5 flex items-center gap-4 hover:-translate-y-1 hover:shadow-md transition-all cursor-pointer group"
          >
            <Shield className="h-6 w-6 text-stone-400 dark:text-slate-500 dark:text-slate-400 group-hover:text-[#1CB0F6] transition-colors shrink-0" />
            <span className="font-bold text-stone-700 dark:text-slate-200">
              {t("privacy_policy")}
            </span>
          </Link>
          <Link
            href="/licenses"
            className="bg-white dark:bg-slate-900 border-2 border-stone-200 dark:border-slate-800 border-b-6 rounded-2xl p-5 flex items-center gap-4 hover:-translate-y-1 hover:shadow-md transition-all cursor-pointer group"
          >
            <FileCheck className="h-6 w-6 text-stone-400 dark:text-slate-500 dark:text-slate-400 group-hover:text-[#1CB0F6] transition-colors shrink-0" />
            <span className="font-bold text-stone-700 dark:text-slate-200">
              {t("licenses")}
            </span>
          </Link>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-8">
        <SignOutZone />
        <DangerZone />
      </div>
    </div>
  );
}

const SettingsSkeleton = () => {
  const t = useTranslations("settings");
  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500">
      <div className="bg-white dark:bg-slate-900 border-2 border-stone-200 dark:border-slate-800 border-b-8 rounded-[2rem] p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between relative overflow-hidden gap-6 animate-pulse">
        <div className="flex items-center gap-x-6">
          <div className="h-20 w-20 md:h-24 md:w-24 rounded-full bg-stone-200 dark:bg-slate-700 shrink-0" />
          <div className="flex flex-col gap-2">
            <div className="h-6 w-48 bg-stone-200 dark:bg-slate-700 rounded-lg" />
            <div className="h-4 w-32 bg-stone-200 dark:bg-slate-700 rounded-md" />
          </div>
        </div>
        <div className="w-full md:w-32 h-12 bg-stone-200 dark:bg-slate-700 rounded-xl" />
      </div>
      <div>
        <div className="h-6 w-40 bg-stone-200 dark:bg-slate-700 rounded-lg mb-4 animate-pulse" />
        <div className="bg-white dark:bg-slate-900 border-2 border-stone-200 dark:border-slate-800 border-b-8 rounded-[2rem] p-6 md:p-8 flex flex-col gap-4 animate-pulse">
          <div className="h-16 w-full bg-stone-200 dark:bg-slate-700 rounded-2xl" />
          <div className="h-16 w-full bg-stone-200 dark:bg-slate-700 rounded-2xl" />
        </div>
      </div>
      <div>
        <div className="bg-white dark:bg-slate-900 border-2 border-stone-200 dark:border-slate-800 border-b-8 rounded-[2rem] p-6 md:p-8 animate-pulse h-[240px]" />
      </div>
      <div>
        <div className="h-6 w-32 bg-stone-200 dark:bg-slate-700 rounded-lg mb-4 animate-pulse" />
        <div className="bg-white dark:bg-slate-900 border-2 border-stone-200 dark:border-slate-800 border-b-8 rounded-[2rem] p-6 md:p-8 animate-pulse h-[100px]" />
      </div>
      <div>
        <div className="bg-white dark:bg-slate-900 border-2 border-stone-200 dark:border-slate-800 rounded-[1rem] p-4 animate-pulse h-[120px]" />
      </div>
      <div>
        <div className="h-6 w-48 bg-stone-200 dark:bg-slate-700 rounded-lg mb-4 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-20 bg-white dark:bg-slate-900 border-2 border-stone-200 dark:border-slate-800 border-b-6 rounded-2xl p-5 animate-pulse flex items-center gap-4"
            >
              <div className="w-6 h-6 rounded-md bg-stone-200 dark:bg-slate-700" />
              <div className="h-4 w-32 bg-stone-200 dark:bg-slate-700 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
