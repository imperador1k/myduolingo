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
import "./globals.css";

const nunito = Nunito({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MyDuolingo — Aprende Idiomas com IA",
  description: "Plataforma gamificada para aprender idiomas com feedback instantâneo de Inteligência Artificial, lições adaptativas e um sistema de vocabulário com repetição espaçada.",
  openGraph: {
    title: "MyDuolingo — Aprende Idiomas com IA",
    description: "Aprende novos idiomas com IA contextual, flashcards dinâmicos e lições gamificadas que se adaptam ao teu nível.",
    type: "website",
    locale: "pt_PT",
    siteName: "MyDuolingo",
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
            
            {/* Always render children to preserve client-side state during server refreshes */}
            <ClerkLoading>
              <div className="fixed inset-0 z-[999] bg-white flex items-center justify-center">
                <LoadingScreen />
              </div>
            </ClerkLoading>

            <ClerkLoaded>
              <TTSUnlocker />
              <ReviewModal />
            </ClerkLoaded>

            {children}
            <FloatingMarco />
            
          </CustomToastProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}

