import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import { ClerkProvider, ClerkLoading, ClerkLoaded } from "@clerk/nextjs";
import { ptBR } from "@clerk/localizations";
import { Toaster } from "sonner";
import { OneSignalProvider } from "@/components/shared/OneSignalProvider";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { CustomToastProvider } from "@/components/ui/custom-toast";
import { FloatingMarco } from "@/components/shared/floating-marco";
import { TTSUnlocker } from "@/components/shared/tts-unlocker";
import { ReviewModal } from "@/components/modals/review-modal";
import { GlobalPresenceProvider } from "@/components/providers/global-presence-provider";
import { NativeBridge } from "@/components/providers/native-bridge";
import { NativeUpdater } from "@/components/providers/native-updater";
import { OnboardingSync } from "@/components/onboarding-sync";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const nunito = Nunito({ subsets: ["latin"] });

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://myduolingo.vercel.app";

import { getTranslations, getLocale, getMessages } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("seo");
  const locale = await getLocale();

  return {
    metadataBase: new URL(APP_URL),
    applicationName: "Faro",
    title: {
      template: "%s | Faro",
      default: t("title"),
    },
    description: t("description"),
    keywords: t("keywords").split(",").map((k) => k.trim()),
    authors: [{ name: "Faro" }],
    openGraph: {
      type: "website",
      locale: locale,
      url: APP_URL,
      siteName: "Faro",
      title: t("title"),
      description: t("description"),
      images: [
        {
          url: "/duolingo-home.png",
          width: 1200,
          height: 630,
          alt: t("title"),
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
      images: ["/duolingo-home.png"],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

import { UISoundsProvider } from "@/components/providers/ui-sound-provider";

export const dynamic = "force-dynamic";

import { Analytics } from "@vercel/analytics/react";
import { NextIntlClientProvider } from "next-intl";


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <ClerkProvider localization={ptBR}>
      <html lang={locale} suppressHydrationWarning>
        <body
          className={`${nunito.className} bg-slate-50 dark:bg-slate-950 transition-colors duration-300`}
        >
          <NextIntlClientProvider messages={messages}>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <CustomToastProvider>
                <UISoundsProvider>
                  <Toaster
                    position="top-center"
                    closeButton
                    toastOptions={{
                      classNames: {
                        toast:
                          "group flex items-center border-2 border-b-[6px] rounded-2xl p-4 sm:p-5 shadow-2xl transition-all hover:-translate-y-1 hover:shadow-xl",
                        title:
                          "text-[16px] sm:text-[17px] font-black tracking-widest uppercase text-white drop-shadow-sm",
                        description: "text-white/90 text-[14px] font-bold mt-1",
                        success: "bg-[#58cc02] border-[#58a700] text-white",
                        error: "bg-[#ff4b4b] border-[#ea2b2b] text-white",
                        info: "bg-[#1cb0f6] border-[#1899d6] text-white",
                        warning: "bg-[#ffc800] border-[#e5b400] text-white",
                        closeButton:
                          "bg-black/10 hover:bg-black/20 text-white border-2 border-transparent hover:border-black/20 rounded-xl hover:scale-110 active:scale-95 transition-all !right-4 !top-1/2 !-translate-y-1/2",
                        icon: "w-8 h-8 mr-4 text-white drop-shadow-sm",
                      },
                    }}
                  />
                  <OneSignalProvider />
                  <NativeBridge />
                  <NativeUpdater />

                  <ClerkLoading>
                    <div className="fixed inset-0 z-above-modal bg-white dark:bg-slate-950 flex items-center justify-center">
                      <LoadingScreen />
                    </div>
                  </ClerkLoading>

                  <ClerkLoaded>
                    <GlobalPresenceProvider>
                      <OnboardingSync />
                      <TTSUnlocker />
                      <ReviewModal />
                      {children}
                      <FloatingMarco />
                    </GlobalPresenceProvider>
                  </ClerkLoaded>
                </UISoundsProvider>
              </CustomToastProvider>
              <Analytics />
            </ThemeProvider>
          </NextIntlClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
