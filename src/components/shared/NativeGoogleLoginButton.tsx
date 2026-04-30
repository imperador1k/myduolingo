"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Capacitor } from "@capacitor/core";
import { Browser } from "@capacitor/browser";

const GoogleIcon = () => (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
);

export default function NativeGoogleLoginButton({ mode = "sign-in" }: { mode?: "sign-in" | "sign-up" }) {
    const [loading, setLoading] = useState(false);
    const [isNative, setIsNative] = useState(false);

    useEffect(() => {
        const isCapacitor = Capacitor.isNativePlatform();
        const isTauri = typeof window !== 'undefined' && !!(window as any).__TAURI_INTERNALS__;
        setIsNative(isCapacitor || isTauri);
    }, []);

    const handleLogin = async () => {
        setLoading(true);

        try {
            console.log("Iniciando Google OAuth via Browser Externo para App Nativa...");
            
            const isTauri = typeof window !== 'undefined' && !!(window as any).__TAURI_INTERNALS__;
            // Redirecionamos para a nossa página dedicada que lidará com o início do OAuth
            const authUrl = `https://myduolingo.vercel.app/mobile-auth?mode=${mode}${isTauri ? '&desktop=true' : ''}`;
            
            if (Capacitor.isNativePlatform()) {
                await Browser.open({ url: authUrl, windowName: '_system' });
                // We reset loading after 3 seconds in case they close the browser without finishing
                setTimeout(() => setLoading(false), 3000); 
            } else if (isTauri) {
                const { open } = await import('@tauri-apps/plugin-opener');
                await open(authUrl);
                setTimeout(() => setLoading(false), 3000);
            } else {
                window.location.href = authUrl;
            }
        } catch (err) {
            console.error("Erro ao abrir browser nativo:", err);
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-2 w-full">
            <button 
                onClick={handleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-50 transition-all active:scale-[0.98] disabled:opacity-70"
            >
                {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                    <GoogleIcon />
                )}
                <span>{loading ? "A processar..." : (mode === "sign-in" ? "Continuar com Google" : "Criar conta com Google")}</span>
            </button>
            
            {isNative && (
                <p className="text-center text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-widest">
                    Browser Seguro
                </p>
            )}
        </div>
    );
}
