import Link from "next/link";
import { Button } from "@/components/ui/button";
import { auth } from "@clerk/nextjs/server";
import Image from "next/image";

export default async function Home() {
  const { userId } = await auth();

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Header */}
      <header className="mx-auto flex w-full max-w-[988px] items-center justify-between px-4 py-4 lg:px-0">
        <div className="flex items-center gap-2">
          {/* Using the mascot SVG if available, otherwise just text/emoji for now unless they have logo.svg */}
          <Image src="/mascot.svg" alt="Mascot" width={40} height={40} />
          <h1 className="text-2xl font-extrabold tracking-wide text-green-600">
            duolingo
          </h1>
        </div>
        {/* User didn't want the language selector or site language dropdown. 
            Login button is typically absent on this specific landing view in the screenshot 
            (it has "Já tenho uma conta" below), but good to keep if user wants to access it top right.
            Screenshot shows "IDIOMA DO SITE: PORTUGUÊS". User said "não quero o footer... nem o idioma do site".
            So header is just Logo.
        */}
      </header>

      {/* Main Content */}
      <main className="flex flex-1 flex-col items-center justify-center gap-10 px-4 py-10 lg:flex-row lg:gap-24 lg:px-0">

        {/* Left side - Hero Video */}
        <div className="relative h-[300px] w-[300px] lg:h-[420px] lg:w-[420px]">
          <video
            src="/duolingo_home.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="object-contain h-full w-full"
          />
        </div>

        {/* Right side - CTA */}
        <div className="flex w-full flex-col items-center gap-6 lg:items-center text-center max-w-[400px]">
          <h1 className="text-3xl font-bold text-slate-700 lg:text-[32px] leading-tight">
            O jeito grátis, divertido e eficaz de aprender um idioma!
          </h1>

          <div className="flex w-full flex-col gap-3">
            {userId ? (
              <Link href="/learn" className="w-full">
                <Button size="lg" className="w-full bg-green-500 hover:bg-green-600 text-white font-bold uppercase tracking-wide border-b-4 border-green-700 h-12 rounded-xl">
                  Continuar curso
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/sign-up" className="w-full">
                  <Button size="lg" className="w-full bg-green-500 hover:bg-green-600 text-white font-bold uppercase tracking-wide border-b-4 border-green-700 h-12 rounded-xl">
                    Comece agora
                  </Button>
                </Link>
                <Link href="/sign-in" className="w-full">
                  <Button variant="ghost" size="lg" className="w-full bg-white text-blue-500 hover:bg-slate-50 font-bold uppercase tracking-wide border-2 border-slate-200 border-b-4 h-12 rounded-xl active:border-b-2 hover:text-blue-600">
                    Já tenho uma conta
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Footer - minimal or empty as requested (user said "nao quero o footer") */}
    </div>
  );
}
