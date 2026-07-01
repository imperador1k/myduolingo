"use client";

import { useSignIn, useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Eye, EyeOff, X } from "lucide-react";
import { useTranslations } from "next-intl";

// Animation configuration for staggered children entry
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

// Card pop transition
const cardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8, y: 30 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 180, damping: 20 },
  },
};

// Individual child items variant within card
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 220, damping: 20 },
  },
};

export default function CustomSignIn() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const { isSignedIn } = useUser();
  const [step, setStep] = useState<"login" | "mfa">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const router = useRouter();
  const t = useTranslations("Auth");

  interface ClerkError {
    errors?: Array<{
      code: string;
      message: string;
      meta?: { paramName?: string };
    }>;
  }

  const translateError = (err: unknown) => {
    const errorObj = err as ClerkError;
    const error = errorObj.errors?.[0];
    if (!error) return t("error_unexpected");

    switch (error.code) {
      case "form_identifier_not_found":
      case "form_password_incorrect":
        return t("error_invalid_credentials");
      case "user_already_signed_in":
        return t("error_already_signed_in");
      case "form_param_nil":
        return t("error_fill_all_fields");
      case "form_code_incorrect":
        return t("error_invalid_code");
      default:
        return error.message || t("error_invalid_credentials_default");
    }
  };

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push("/learn");
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    if (isLoaded && signIn?.status === "needs_second_factor") {
      setStep("mfa");
    }
  }, [isLoaded, signIn?.status]);

  useEffect(() => {
    if (error && !error.includes("enviado") && !error.includes("sent")) {
      setIsShaking(true);
      const timer = setTimeout(() => setIsShaking(false), 500);
      return () => clearTimeout(timer);
    }
  }, [error]);

  if (!isLoaded || isSignedIn) {
    return (
      <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center bg-sky-50 dark:bg-slate-900 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-6"
        >
          <motion.div
            className="w-32 h-32 relative"
            animate={{ y: [-5, 5, -5] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          >
            <Image
              src="/marco.png"
              alt={t("loading")}
              fill
              className="object-contain"
            />
          </motion.div>
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                className="w-3 h-3 bg-[#58cc02] rounded-full"
              />
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  const handleGoogleSignIn = async () => {
    if (!isLoaded) return;
    setIsLoading(true);
    try {
      const isTauriEnv =
        typeof window !== "undefined" &&
        navigator.userAgent.includes("TauriDesktop");

      if (
        typeof window !== "undefined" &&
        ((window as any).Capacitor?.isNativePlatform() || isTauriEnv)
      ) {
        const authUrl = `${window.location.origin}/mobile-auth?mode=sign-in${isTauriEnv ? "&desktop=true" : ""}`;

        if ((window as any).Capacitor?.isNativePlatform()) {
          const { Browser } = await import("@capacitor/browser");
          await Browser.open({ url: authUrl, windowName: "_system" });
          setTimeout(() => setIsLoading(false), 3000);
        } else if (isTauriEnv) {
          const { openUrl } = await import("@tauri-apps/plugin-opener");
          await openUrl(authUrl);
          setTimeout(() => setIsLoading(false), 3000);
        }
      } else {
        await signIn.authenticateWithRedirect({
          strategy: "oauth_google",
          redirectUrl: "/sso-callback",
          redirectUrlComplete: "/learn",
        });
      }
    } catch (err) {
      console.error("Erro na autenticação com Google:", err);
      setIsLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || !signIn) return;

    setIsLoading(true);
    setError("");
    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/learn");
        router.refresh();
      } else if (result.status === "needs_second_factor") {
        setStep("mfa");
      } else {
        setError(t("error_unsupported_mfa"));
      }
    } catch (err) {
      console.error("Erro no login:", err);
      const msg = translateError(err);
      setError(msg);

      const errObj = err as ClerkError;
      if (errObj.errors?.[0]?.code === "user_already_signed_in") {
        setTimeout(() => router.push("/learn"), 1500);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleMFASignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || !signIn) return;

    setIsLoading(true);
    setError("");
    try {
      const strategy = signIn.secondFactorVerification?.strategy;
      const result = await signIn.attemptSecondFactor({
        strategy:
          (strategy as "phone_code" | "email_code" | "totp" | "backup_code") ||
          "totp",
        code,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/learn");
        router.refresh();
      }
    } catch (err) {
      console.error("Erro no 2FA:", err);
      setError(translateError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!isLoaded || !signIn) return;
    try {
      await signIn.prepareSecondFactor({ strategy: "email_code" });
      setError(t("new_code_sent"));
    } catch (err) {
      setError(translateError(err));
    }
  };

  const mfaStrategy = signIn?.secondFactorVerification?.strategy;
  const isEmailMfa = mfaStrategy === "email_code";

  return (
    <div className="min-h-[100dvh] w-full overflow-hidden flex flex-col items-center justify-center bg-sky-50 dark:bg-slate-900 relative p-4 sm:p-6 select-none">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#1cb0f6_1.5px,transparent_1.5px)] [background-size:32px_32px] opacity-[0.15] dark:opacity-[0.05] pointer-events-none z-0"></div>

      {/* Main Form Container */}
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate={isShaking ? { x: [-10, 10, -10, 10, -5, 5, 0] } : "visible"}
        className="w-full max-w-[420px] bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 border-b-[8px] rounded-[2.5rem] p-8 sm:p-10 relative z-20 shadow-2xl shadow-sky-900/5"
      >
        {/* Playful Mascot Top */}
        <motion.div
          className="w-32 h-32 absolute -top-[70px] left-1/2 -translate-x-1/2 z-30 drop-shadow-xl pointer-events-none"
          animate={{ y: [-4, 4, -4], rotate: [-2, 2, -2] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        >
          <Image
            src="/marco.png"
            alt="Mascote Marco"
            fill
            priority
            className="object-contain"
          />
        </motion.div>

        <AnimatePresence mode="wait">
          {step === "login" ? (
            <motion.div
              key="login-form-view"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6 pt-8"
            >
              {/* Header Title */}
              <motion.div
                variants={itemVariants}
                className="text-center space-y-2"
              >
                <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-wide">
                  {t("sign_in_title")}
                </h1>
                <p className="text-slate-400 font-bold text-sm">
                  {t("sign_in_subtitle")}
                </p>
              </motion.div>

              {/* Form Content */}
              <motion.div variants={itemVariants} className="space-y-4">
                {/* Google Button - Gamified 3D */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="relative w-full h-14 bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 border-b-[6px] active:border-b-2 active:translate-y-[4px] rounded-2xl flex items-center justify-center gap-3 font-bold text-slate-700 dark:text-white text-base transition-all hover:bg-slate-50 dark:hover:bg-slate-600 disabled:opacity-60"
                >
                  {isLoading ? (
                    <div className="w-6 h-6 border-4 border-sky-400/30 border-t-sky-400 rounded-full animate-spin" />
                  ) : (
                    <>
                      <svg className="w-6 h-6" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      <span className="uppercase tracking-widest">
                        {t("sign_in_google")}
                      </span>
                    </>
                  )}
                </button>

                <div className="flex items-center gap-4 my-2">
                  <div className="flex-1 h-[2px] bg-slate-100 dark:bg-slate-700 rounded-full"></div>
                  <span className="text-xs font-black text-slate-300 dark:text-slate-500 uppercase tracking-widest">
                    {t("or_separator")}
                  </span>
                  <div className="flex-1 h-[2px] bg-slate-100 dark:bg-slate-700 rounded-full"></div>
                </div>

                <form onSubmit={handleEmailSignIn} className="space-y-4">
                  {/* Email Input */}
                  <motion.div variants={itemVariants} className="space-y-2">
                    <input
                      type="email"
                      placeholder={t("email_placeholder")}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full h-14 px-5 bg-slate-100 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:border-[#1cb0f6] rounded-2xl font-bold text-slate-700 dark:text-white text-base outline-none transition-all placeholder:text-slate-400 placeholder:font-bold"
                    />
                  </motion.div>

                  {/* Password Input */}
                  <motion.div variants={itemVariants} className="space-y-2">
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder={t("password_placeholder")}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full h-14 px-5 bg-slate-100 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:border-[#1cb0f6] rounded-2xl font-bold text-slate-700 dark:text-white text-base outline-none transition-all placeholder:text-slate-400 placeholder:font-bold pr-14"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-1"
                      >
                        {showPassword ? (
                          <EyeOff size={22} />
                        ) : (
                          <Eye size={22} />
                        )}
                      </button>
                    </div>
                    <div className="flex justify-end pt-1">
                      <Link
                        href="/forgot-password"
                        className="text-xs font-black text-[#1cb0f6] hover:text-[#1899d6] transition-colors"
                      >
                        {t("forgot_password")}
                      </Link>
                    </div>
                  </motion.div>

                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, scale: 0.9 }}
                        animate={{ opacity: 1, height: "auto", scale: 1 }}
                        exit={{ opacity: 0, height: 0, scale: 0.9 }}
                        className="overflow-hidden"
                      >
                        <div className="bg-rose-100 dark:bg-rose-500/10 border-2 border-rose-200 dark:border-rose-500/20 rounded-2xl p-4 flex items-center justify-center">
                          <p className="text-rose-500 dark:text-rose-400 text-sm font-black text-center">
                            {error}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Primary Submit Button - Gamified Green */}
                  <motion.button
                    variants={itemVariants}
                    type="submit"
                    disabled={isLoading || !email || !password}
                    className="relative w-full h-14 bg-[#58cc02] border-2 border-[#58cc02] border-b-[6px] active:border-b-2 active:translate-y-[4px] rounded-2xl flex items-center justify-center text-white font-black text-base uppercase tracking-widest transition-all hover:bg-[#46a302] hover:border-[#46a302] disabled:opacity-50 mt-4"
                  >
                    {isLoading ? t("signing_in_button") : t("sign_in_button")}
                  </motion.button>
                </form>

                <motion.div
                  variants={itemVariants}
                  className="text-center pt-4"
                >
                  <p className="text-slate-400 font-bold text-sm">
                    {t("no_account_yet")}{" "}
                    <Link
                      href="/sign-up"
                      className="text-[#1cb0f6] hover:text-[#1899d6] font-black uppercase tracking-widest ml-1"
                    >
                      {t("sign_up_now")}
                    </Link>
                  </p>
                </motion.div>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="mfa-form-view"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, scale: 0.9 }}
              className="space-y-6 pt-8"
            >
              <motion.div
                variants={itemVariants}
                className="text-center space-y-3"
              >
                <div
                  className={`w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4 border-b-4 ${isEmailMfa ? "bg-amber-100 text-amber-500 border-amber-200" : "bg-sky-100 text-[#1cb0f6] border-sky-200"}`}
                >
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d={
                        isEmailMfa
                          ? "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          : "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      }
                    />
                  </svg>
                </div>
                <h1 className="text-2xl font-black text-slate-800 dark:text-white">
                  {isEmailMfa ? t("mfa_email_title") : t("mfa_totp_title")}
                </h1>
                <p className="text-slate-400 font-bold text-sm">
                  {isEmailMfa
                    ? t("mfa_subtitle_email")
                    : t("mfa_subtitle_totp")}
                </p>
              </motion.div>

              <form onSubmit={handleMFASignIn} className="space-y-5">
                <motion.div variants={itemVariants}>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="000000"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    required
                    autoFocus
                    className={`w-full h-20 text-center text-4xl tracking-[0.3em] font-black bg-slate-100 dark:bg-slate-900 border-2 rounded-2xl focus:bg-white dark:focus:bg-slate-800 focus:ring-0 outline-none transition-all text-slate-800 dark:text-white ${isEmailMfa ? "border-amber-200 focus:border-amber-400" : "border-slate-200 focus:border-[#1cb0f6]"}`}
                  />
                </motion.div>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <p
                        className={`text-sm font-black text-center p-4 rounded-2xl border-2 ${error.includes("enviado") || error.includes("sent") ? "text-green-500 bg-green-50 border-green-200" : "text-rose-500 bg-rose-50 border-rose-200"}`}
                      >
                        {error}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.div variants={itemVariants} className="space-y-3 pt-2">
                  <button
                    type="submit"
                    disabled={isLoading || code.length < 6}
                    className={`relative w-full h-14 border-2 border-b-[6px] active:border-b-2 active:translate-y-[4px] rounded-2xl flex items-center justify-center font-black text-white uppercase tracking-widest transition-all disabled:opacity-50 ${isEmailMfa ? "bg-amber-500 border-amber-600 hover:bg-amber-400" : "bg-[#1cb0f6] border-[#1899d6] hover:bg-[#4dd0e1]"}`}
                  >
                    {isLoading ? (
                      <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      t("verify_button")
                    )}
                  </button>

                  {isEmailMfa && (
                    <button
                      type="button"
                      onClick={handleResendCode}
                      className="w-full py-3 text-[#1cb0f6] font-black uppercase tracking-widest hover:text-sky-400 transition-colors text-sm"
                    >
                      {t("resend_code_prompt")}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setStep("login")}
                    className="w-full py-3 text-slate-400 font-black uppercase tracking-widest hover:text-slate-600 transition-colors text-sm"
                  >
                    {t("forgot_pwd_back")}
                  </button>
                </motion.div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
