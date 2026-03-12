"use client";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

const PROD_URL = "https://myduolingo.vercel.app";

export default function AuthSuccessPage() {
    useEffect(() => {
        const homeUrl = encodeURIComponent(`${PROD_URL}/learn`);

        // 1. Tell the Main Webview to navigate to the home page
        //    (this carries the Clerk session cookies over)
        window.location.href = `median://open/internal?url=${homeUrl}`;

        // 2. Dismiss the App Browser (Custom Tab) itself
        setTimeout(() => {
            window.location.href = "median://appbrowser/close";
        }, 100);

        // 3. Fallback for plain web browsers (PC, non-Median mobile)
        //    If we're still here after 800ms, Median bridge was not active → go home normally
        setTimeout(() => {
            if (window.location.pathname.startsWith("/auth-success")) {
                window.location.replace("/learn");
            }
        }, 800);
    }, []);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-sky-500" />
            <p className="text-slate-500 font-semibold text-lg">A preparar a tua sessão...</p>
            <p className="text-slate-400 text-sm">Serás redirecionado automaticamente.</p>
        </div>
    );
}
