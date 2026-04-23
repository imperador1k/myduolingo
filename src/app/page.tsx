import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { auth } from "@clerk/nextjs/server";
import Image from "next/image";
import { LandingCTA } from "@/components/shared/landing-cta";
import { LottieAnimation } from "@/components/ui/lottie-animation";

export const dynamic = "force-dynamic";

/**
 * Page-level metadata overrides the global layout template.
 * This is the most important page for SEO — the title is crafted
 * to target high-intent keywords about language learning.
 */
export const metadata: Metadata = {
  title: "Aprende Inglês a Jogar — Grátis",
  description:
    "A plataforma gratuita que te ensina inglês, espanhol e outros idiomas através de lições curtas e gamificadas. Ganha XP, compete em ligas e evolui com os teus amigos.",
  alternates: {
    canonical: "/",
  },
};

export default async function Home() {
  const { userId } = await auth();

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-white">
      {/* Background Pattern */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(#e5e7eb_2px,transparent_2px)] [background-size:24px_24px] opacity-40"></div>

      {/* Floating decorative blobs for Duolingo vibe */}
      <div className="absolute -left-32 top-10 z-0 h-96 w-96 rounded-full bg-green-400/20 blur-3xl"></div>
      <div className="absolute -right-32 top-1/2 z-0 h-96 w-96 -translate-y-1/2 rounded-full bg-sky-400/15 blur-3xl"></div>

      {/* 
        Header: The logo brand name is a <span> inside a <Link>, NOT an <h1>.
        Having two <h1> tags on a page is an SEO anti-pattern. The only <h1>
        must be the primary page heading in the <main> content below.
      */}
      <header className="absolute top-0 left-0 right-0 z-50 w-full bg-transparent">
        <div className="mx-auto flex w-full max-w-[1024px] items-center justify-between px-6 py-8 lg:px-8">
          <Link href="/" className="flex items-center gap-3 active:scale-95 transition-transform cursor-pointer">
            <div className="relative h-11 w-11 overflow-hidden rounded-xl shadow-sm border-2 border-stone-100 shadow-stone-200">
              <Image src="/icon.png" alt="MyDuolingo Logo" fill className="object-cover" />
            </div>
            <span className="text-3xl font-black tracking-tight text-green-500 drop-shadow-sm">
              duolingo
            </span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center gap-12 px-6 py-12 mx-auto w-full max-w-[1024px] lg:flex-row lg:gap-20 lg:py-20 lg:px-8">
        
        {/* Left side - Lottie Hero Animation */}
        <div className="relative flex h-[320px] w-[320px] shrink-0 items-center justify-center lg:h-[480px] lg:w-[480px]">
          {/* Subtle glowing ring behind lottie */}
          <div className="absolute inset-10 rounded-full bg-green-100/60 blur-2xl"></div>
          <div className="relative z-10 w-full h-full animate-in zoom-in duration-700 ease-out fill-mode-both">
            <LottieAnimation className="h-full w-full drop-shadow-xl" />
          </div>
        </div>

        {/* Right side - CTA */}
        <div className="flex w-full max-w-[440px] flex-col items-center gap-8 text-center lg:items-center">
          {/*
            The single <h1> on this page. Optimized for the target keyword:
            "Aprende Inglês a Jogar". Broad enough to cover all languages
            but specific enough to rank for the primary use case.
          */}
          <h1 className="animate-in slide-in-from-bottom-8 fade-in duration-700 delay-100 fill-mode-both text-4xl font-extrabold tracking-tight text-slate-800 lg:text-5xl lg:leading-[1.15]">
            O jeito <span className="text-green-500 font-black">grátis</span>, divertido e eficaz de aprender um idioma!
          </h1>

          <p className="animate-in slide-in-from-bottom-6 fade-in duration-700 delay-200 fill-mode-both text-lg font-medium text-slate-500 lg:text-xl">
            Junta-te a nós e começa a aprender hoje mesmo com lições curtas e viciantes.
          </p>

          <div className="w-full mt-2 animate-in slide-in-from-bottom-6 fade-in duration-700 delay-300 fill-mode-both">
            <LandingCTA userId={userId} />
          </div>
        </div>
      </main>

    </div>
  );
}
