"use client";

import { useState, useEffect } from "react";
import { SignInButton, useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

// Extend window type to allow the Median callback function
declare global {
    interface Window {
        medianGoogleCallback?: (response: { idToken?: string; error?: string }) => void;
    }
}

const GoogleIcon = () => (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
);

type ButtonUIProps = {
    onClick?: () => void;
    loading?: boolean;
};

const GoogleButtonUI = ({ onClick, loading = false }: ButtonUIProps) => (
    <button
        onClick={onClick}
        disabled={loading}
        className="group flex w-full items-center justify-center gap-3 rounded-xl border-2 border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 hover:shadow-md active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
    >
        {loading ? (
            <Loader2 className="h-5 w-5 animate-spin text-slate-500" />
        ) : (
            <GoogleIcon />
        )}
        <span>{loading ? "A autenticar..." : "Continuar com Google"}</span>
    </button>
);

export default function NativeGoogleLoginButton() {
    const [isMedian, setIsMedian] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { signIn, setActive, isLoaded } = useSignIn();
    const router = useRouter();

    // Detect Median wrapper on mount (SSR-safe)
    useEffect(() => {
        if (typeof window !== "undefined") {
            setIsMedian(navigator.userAgent.toLowerCase().includes("median"));
        }
    }, []);

    // Register the global callback for the Median JS Bridge response
    useEffect(() => {
        window.medianGoogleCallback = async (response) => {
            if (!response?.idToken) {
                console.error("[NativeGoogleLogin] No idToken in response:", response);
                setError("Falha no login com Google. Tenta de novo.");
                setLoading(false);
                return;
            }

            console.log("[NativeGoogleLogin] Got native Google ID token, verifying...");

            try {
                // ── Step 1: Verify token on backend and get Clerk ticket ────
                const res = await fetch("/api/auth/native-google", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ idToken: response.idToken }),
                });

                const data = await res.json();

                if (!res.ok || !data.ticket) {
                    throw new Error(data.error || "Failed to get sign-in ticket");
                }

                console.log("[NativeGoogleLogin] Got Clerk ticket, creating session...");

                // ── Step 2: Consume the Clerk ticket to create a real session ──
                if (!isLoaded || !signIn) {
                    throw new Error("Clerk not ready");
                }

                const result = await signIn.create({
                    strategy: "ticket",
                    ticket: data.ticket,
                });

                // ── Step 3: Set the active session and redirect ─────────────
                await setActive({ session: result.createdSessionId });

                console.log("[NativeGoogleLogin] Session created! Redirecting...");
                router.replace("/learn");
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : "Erro desconhecido";
                console.error("[NativeGoogleLogin] Auth error:", message);
                setError("Erro ao autenticar. Tenta de novo.");
                setLoading(false);
            }
        };

        return () => {
            window.medianGoogleCallback = undefined;
        };
    }, [isLoaded, signIn, setActive, router]);

    const handleNativeGoogleLogin = () => {
        if (loading) return;
        setLoading(true);
        setError(null);
        // Trigger Median's native Google Sign-In. The SDK calls
        // window.medianGoogleCallback() with the result idToken.
        window.location.href = "median://socialLogin/google?callback=medianGoogleCallback";
    };

    return (
        <div className="flex flex-col gap-2 w-full">
            {isMedian ? (
                // Inside Median → trigger native Google auth via JS Bridge
                <GoogleButtonUI onClick={handleNativeGoogleLogin} loading={loading} />
            ) : (
                // Regular browser → standard Clerk web sign-in
                <SignInButton mode="modal">
                    <GoogleButtonUI />
                </SignInButton>
            )}
            {error && (
                <p className="text-center text-xs text-red-500">{error}</p>
            )}
        </div>
    );
}
