"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to Sentry
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="pt">
      <body className="antialiased">
        <div className="flex h-screen w-full flex-col items-center justify-center bg-slate-100 px-6">
          <div className="flex max-w-md flex-col items-center text-center space-y-6 bg-white p-8 rounded-2xl shadow-sm border-2 border-slate-200">
            <div className="relative h-32 w-32 grayscale opacity-80">
              <Image
                src="/mascot_sad.svg"
                alt="Erro Fatal"
                fill
                className="object-contain"
                onError={(e) => {
                  // Fallback if sad mascot doesn't exist
                  e.currentTarget.src = "/mascot.svg";
                }}
              />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
                Oops! O sistema tropeçou.
              </h1>
              <p className="text-slate-500 font-medium">
                Algo inesperado aconteceu do nosso lado. A nossa equipa mecânica (e o Sentry) já foi notificada desta anomalia.
              </p>
            </div>

            <Button
              onClick={() => reset()}
              size="lg"
              className="w-full bg-green-500 hover:bg-green-600 border-b-4 border-green-700 active:border-b-0 h-12 uppercase font-bold tracking-wide transition-all"
            >
              Tentar Novamente
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}
