"use client";
import { useEffect, useState } from "react";
import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";
import { Capacitor } from "@capacitor/core";
import { LottieAnimation } from "@/components/ui/lottie-animation";

/**
 * SSO Callback Page — handles two scenarios:
 *
 * 1. Opened INSIDE the Capacitor WebView (after deep link bounce):
 *    AuthenticateWithRedirectCallback processes the Clerk token.
 *    The sign-in attempt exists in this context because the user clicked
 *    "Continue with Google" in the WebView's <SignIn /> component.
 *
 * 2. Opened in Chrome (external browser during OAuth redirect chain):
 *    Clerk redirects here after Google auth. We bounce back to the app
 *    via deep link so the WebView can process the token.
 */
export default function SSOCallbackPage() {
    const [isBouncing, setIsBouncing] = useState(false);

    useEffect(() => {
        // Inside Capacitor WebView → let AuthenticateWithRedirectCallback handle it
        if (Capacitor.isNativePlatform()) return;

        // In Chrome (external browser) → bounce back to the native app.
        // We check for Clerk-specific query params to confirm this is an OAuth callback.
        const params = window.location.search;
        const hash = window.location.hash;
        const hasOAuthParams = params.includes('__clerk') || hash.includes('__clerk');

        if (!hasOAuthParams) return;

        setIsBouncing(true);
        console.log("[SSO Callback] Bouncing to native app with params:", params);

        // Send the full query string + hash to the native app
        const deepLink = `myduolingo://sso-callback${params}${hash}`;
        window.location.href = deepLink;

        // Fallback for users on web (not native) — show a message after 3s
        const timeout = setTimeout(() => {
            const el = document.getElementById("fallback-msg");
            if (el) el.style.display = "block";
        }, 3000);

        return () => clearTimeout(timeout);
    }, []);

    if (isBouncing) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-white flex-col gap-4">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-500 border-t-transparent" />
                <p className="text-slate-500 font-bold">A voltar para a App...</p>
                <p id="fallback-msg" className="text-xs text-slate-400 hidden mt-4 text-center px-6">
                    Se a aplicação não abrir automaticamente, fecha esta janela e volta à aplicação.
                </p>
            </div>
        );
    }

    // Normal flow: inside the WebView, let Clerk process the OAuth token
    return (
        <div className="flex h-full w-full min-h-screen flex-col items-center justify-center bg-white z-50 fixed inset-0">
            <AuthenticateWithRedirectCallback 
                signUpForceRedirectUrl="/learn" 
                signInForceRedirectUrl="/learn" 
            />
            
            <div className="relative flex flex-col items-center justify-center w-full max-w-md p-8 text-center animate-in fade-in duration-500">
                <div className="mb-6 relative">
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
                    A garantir a segurança da tua conta.
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
