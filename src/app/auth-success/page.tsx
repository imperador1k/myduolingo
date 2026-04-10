"use client";
import { useEffect } from "react";
import { LottieAnimation } from "@/components/ui/lottie-animation";

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
        <div className="flex h-full w-full min-h-screen flex-col items-center justify-center bg-white z-50 fixed inset-0">
            <div className="relative flex flex-col items-center justify-center w-full max-w-md p-8 text-center animate-in fade-in duration-500">
                <div className="mb-6 relative">
                    {/* Glowing effect behind */}
                    <div className="absolute inset-0 bg-sky-400 opacity-20 blur-3xl rounded-full scale-150 animate-pulse"></div>
                    <LottieAnimation className="w-48 h-48 lg:w-64 lg:h-64 relative z-10" />
                </div>
                
                <h1 className="text-2xl lg:text-3xl font-black text-slate-800 tracking-tight uppercase mb-2">
                    A Autenticar...
                </h1>
                
                <div className="w-16 h-1.5 bg-slate-200 rounded-full my-4 overflow-hidden">
                    <div className="h-full bg-[#58CC02] rounded-full w-full origin-left animate-[progress_1s_ease-in-out_infinite]"></div>
                </div>
                
                <p className="text-slate-500 font-bold max-w-xs mx-auto">
                    A preparar o teu progresso na plataforma.
                </p>
                
                <style jsx>{`
                    @keyframes progress {
                        0% { transform: scaleX(0); }
                        50% { transform: scaleX(1); }
                        100% { transform: scaleX(0); transform-origin: right; }
                    }
                `}</style>
            </div>
        </div>
    );
}
