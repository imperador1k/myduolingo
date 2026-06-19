"use client";
import { useEffect } from "react";
import { useSignIn, useSignUp, useUser } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";

export default function MobileAuthPage() {
  const { signIn, isLoaded: signInLoaded } = useSignIn();
  const { signUp, isLoaded: signUpLoaded } = useSignUp();
  const { isSignedIn, isLoaded: userLoaded } = useUser();

  useEffect(() => {
    if (!signInLoaded || !signUpLoaded || !userLoaded) return;

    const startAuth = async () => {
      const searchParams = new URLSearchParams(window.location.search);
      const isSignUp = searchParams.get("mode") === "sign-up";
      const isDesktop = searchParams.get("desktop") === "true";

      // If already signed in (Chrome has an active session), skip OAuth and get token
      if (isSignedIn && isDesktop) {
        window.location.href = `${window.location.origin}/mobile-auth-complete?desktop=true`;
        return;
      }

      // Chrome will process the OAuth at the correct callback page:
      // - desktop: /desktop-sso-callback (which forces redirect to /mobile-auth-complete)
      // - web: /sso-callback (which redirects to /learn)
      const redirectUrl = `${window.location.origin}${isDesktop ? "/desktop-sso-callback" : "/sso-callback"}`;
      const completeUrl = `${window.location.origin}/mobile-auth-complete${isDesktop ? "?desktop=true" : ""}`;

      try {
        if (isSignUp) {
          await signUp.authenticateWithRedirect({
            strategy: "oauth_google",
            redirectUrl,
            redirectUrlComplete: completeUrl,
          });
        } else {
          await signIn.authenticateWithRedirect({
            strategy: "oauth_google",
            redirectUrl,
            redirectUrlComplete: completeUrl,
          });
        }
      } catch (error) {
        console.error("Erro ao iniciar auth:", error);
      }
    };

    startAuth();
  }, [signInLoaded, signUpLoaded, userLoaded, isSignedIn, signIn, signUp]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white flex-col gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-green-500" />
      <p className="text-slate-500 font-bold">A conectar com a Google...</p>
    </div>
  );
}
