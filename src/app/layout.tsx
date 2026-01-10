import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ptBR } from "@clerk/localizations";
import "./globals.css";

const nunito = Nunito({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MyDuolingo - Aprende línguas de graça",
  description: "Clone do Duolingo para aprendizagem de línguas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider localization={ptBR}>
      <html lang="pt">
        <body className={nunito.className}>{children}</body>
      </html>
    </ClerkProvider>
  );
}
