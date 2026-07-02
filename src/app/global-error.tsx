"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

const TRANSLATIONS: Record<string, { title: string; desc: string; btn: string }> = {
  ar: { title: "خطأ غير متوقع", desc: "حدث خطأ ما من جانبنا. تم إبلاغ فريقنا.", btn: "حاول مرة أخرى" },
  de: { title: "Unerwarteter Fehler", desc: "Auf unserer Seite ist etwas schiefgelaufen. Wir wurden benachrichtigt.", btn: "Erneut versuchen" },
  en: { title: "Unexpected Error", desc: "Something went wrong on our end. We have been notified.", btn: "Try Again" },
  es: { title: "Error Inesperado", desc: "Algo salió mal de nuestra parte. Nuestro equipo ha sido notificado.", btn: "Intentar de nuevo" },
  fr: { title: "Erreur Inattendue", desc: "Quelque chose s'est mal passé. Notre équipe a été notifiée.", btn: "Réessayer" },
  hi: { title: "अप्रत्याशित त्रुटि", desc: "हमारी ओर से कुछ गलत हो गया। हमें सूचित कर दिया गया है।", btn: "पुनः प्रयास करें" },
  it: { title: "Errore Inaspettato", desc: "Qualcosa è andato storto. Il nostro team è stato informato.", btn: "Riprova" },
  ja: { title: "予期せぬエラー", desc: "こちら側で問題が発生しました。チームに通知されました。", btn: "もう一度試す" },
  pt: { title: "Erro Inesperado", desc: "Ocorreu um erro no nosso sistema. A nossa equipa já foi notificada.", btn: "Tentar Novamente" },
  uk: { title: "Несподівана помилка", desc: "З нашого боку щось пішло не так. Ми вже повідомлені.", btn: "Спробувати ще раз" }
};

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [locale, setLocale] = useState("pt");

  useEffect(() => {
    // Log the error to Sentry
    Sentry.captureException(error);
    
    // Detect locale from cookie or browser
    const match = document.cookie.match(/(?:^|;) *NEXT_LOCALE=([^;]*)/);
    if (match && match[1] && TRANSLATIONS[match[1]]) {
      setLocale(match[1]);
    } else {
      const browserLang = navigator.language.split("-")[0];
      if (TRANSLATIONS[browserLang]) setLocale(browserLang);
      else setLocale("en"); // Fallback to English
    }
  }, [error]);

  const t = TRANSLATIONS[locale] || TRANSLATIONS["en"];

  return (
    <html lang={locale}>
      <body className="antialiased">
        <div className="flex h-screen w-full flex-col items-center justify-center bg-slate-100 dark:bg-slate-800 px-6">
          <div className="flex max-w-md flex-col items-center text-center space-y-6 bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border-2 border-slate-200 dark:border-slate-800">
            <div className="relative h-32 w-32 drop-shadow-md">
              <Image
                src="/mascot.svg"
                alt="MyDuolingo Icon"
                fill
                className="object-contain"
                onError={(e) => {
                  e.currentTarget.src = "/icon.png";
                }}
              />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
                {t.title}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">
                {t.desc}
              </p>
            </div>

            <Button
              onClick={() => reset()}
              size="lg"
              className="w-full bg-green-500 hover:bg-green-600 border-b-4 border-green-700 active:border-b-0 h-12 uppercase font-bold tracking-wide transition-all"
            >
              {t.btn}
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}
