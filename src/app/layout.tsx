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
import "./globals.css";

const nunito = Nunito({ subsets: ["latin"] });

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://myduolingo.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  applicationName: "MyDuolingo",
  title: {
    template: "%s | MyDuolingo",
    default: "MyDuolingo — Aprende Línguas a Jogar",
  },
  description:
    "Aprende novos idiomas de forma divertida, interativa e gamificada. Compete em ligas semanais, ganha XP e junta-te aos teus amigos!",
  keywords: [
    "aprender idiomas",
    "aprender inglês",
    "gamificação",
    "línguas online",
    "duolingo português",
    "aprender línguas grátis",
  ],
  authors: [{ name: "MyDuolingo" }],
  openGraph: {
    type: "website",
    locale: "pt_PT",
    url: APP_URL,
    siteName: "MyDuolingo",
    title: "MyDuolingo — Aprende Línguas a Jogar",
    description:
      "Aprende novos idiomas de forma divertida, interativa e gamificada. Compete em ligas semanais, ganha XP e junta-te aos teus amigos!",
    images: [
      {
        url: "/duolingo-home.png",
        width: 1200,
        height: 630,
        alt: "MyDuolingo — Aprende Línguas a Jogar",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MyDuolingo — Aprende Línguas a Jogar",
    description:
      "Aprende novos idiomas de forma divertida, interativa e gamificada. Compete em ligas semanais, ganha XP e junta-te aos teus amigos!",
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


export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider localization={ptBR}>
      <html lang="pt">
        <body className={`${nunito.className} bg-slate-50`}>
          <CustomToastProvider>
            <Toaster richColors />
            <OneSignalProvider />
            
            <ClerkLoading>
              <div className="fixed inset-0 z-above-modal bg-white flex items-center justify-center">
                <LoadingScreen />
              </div>
            </ClerkLoading>

            <ClerkLoaded>
              <GlobalPresenceProvider>
                  <TTSUnlocker />
                  <ReviewModal />
                  {children}
                  <FloatingMarco />
              </GlobalPresenceProvider>
            </ClerkLoaded>

          </CustomToastProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}

