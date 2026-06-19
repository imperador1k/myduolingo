"use client";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Loader2, Check } from "lucide-react";

/**
 * MobileAuthComplete — Landing page after successful Google OAuth in Chrome (desktop flow).
 *
 * Flow:
 * 1. Chrome finishes OAuth → Clerk redirects here (redirectUrlComplete)
 * 2. User is now signed in within Chrome
 * 3. We call our API to get a short-lived Clerk sign-in ticket
 * 4. We bounce to Tauri via deep link: myduolingo://desktop-auth?token=xxx
 * 5. Tauri WebView uses the ticket to create its own session
 */
export default function MobileAuthCompletePage() {
  const { isSignedIn, isLoaded } = useUser();
  const [bounced, setBounced] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;

    const params = new URLSearchParams(window.location.search);
    const isDesktop = params.get("desktop") === "true";

    // Non-desktop path: shouldn't reach here normally
    if (!isDesktop) {
      window.location.href = "/learn";
      return;
    }

    if (!isSignedIn) {
      // Auth failed somehow — go back to sign-in
      window.location.href = "/sign-in";
      return;
    }

    const getDesktopToken = async () => {
      try {
        const res = await fetch("/api/auth/desktop-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) throw new Error("Failed to get desktop token");

        const { token } = await res.json();
        // Deep link to Tauri with the ticket
        window.location.href = `myduolingo://desktop-auth?token=${token}`;

        // Show success UI to the user
        setBounced(true);
      } catch (err) {
        console.error("[MobileAuthComplete] Token error:", err);
        window.location.href = "/sign-in";
      }
    };

    getDesktopToken();
  }, [isLoaded, isSignedIn]);

  if (bounced) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white flex-col gap-4 p-6 text-center">
        <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-2">
          <Check className="h-8 w-8 text-[#58CC02]" strokeWidth={3} />
        </div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">
          Login feito com sucesso!
        </h1>
        <p className="text-slate-500 font-bold max-w-xs">
          Pode fechar esta aba.
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white flex-col gap-4 p-6 text-center">
      <Loader2 className="h-8 w-8 animate-spin text-[#58CC02]" />
      <p className="text-slate-500 font-bold">
        Login feito com sucesso, pode fechar esta aba.
      </p>
    </div>
  );
}
