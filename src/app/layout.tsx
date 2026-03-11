import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ptBR } from "@clerk/localizations";
import { Toaster } from "sonner";
import { OneSignalProvider } from "@/components/OneSignalProvider";
import "./globals.css";

const nunito = Nunito({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MyDuolingo - Aprende como um Guerreiro",
  description: "Melhor jeito de tornar poliglota",
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
        <body className={nunito.className}>
          <Toaster />
          <OneSignalProvider />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
