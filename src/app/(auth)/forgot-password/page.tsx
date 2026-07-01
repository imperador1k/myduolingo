"use client";

import { useSignIn, useAuth } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { ArrowLeft, Mail, Key, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { useTranslations } from "next-intl";

export default function ForgotPasswordPage() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const { isSignedIn } = useAuth();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1); // 1: Email, 2: Code, 3: Password
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const t = useTranslations("Auth");

  interface ClerkError {
    errors?: Array<{
      code: string;
      message: string;
      meta?: { paramName?: string };
    }>;
  }

  // Helper to translate Clerk errors
  const translateError = (err: unknown) => {
    const errorObj = err as ClerkError;
    const error = errorObj.errors?.[0];
    if (!error) return t("error_unexpected");

    console.log("Clerk Error:", error.code, error.message);

    switch (error.code) {
      case "form_identifier_not_found":
        return t("error_account_not_found");
      case "form_password_pwned":
        return t("error_password_pwned");
      case "form_password_length_too_short":
        return t("error_password_length_too_short");
      case "verification_failed":
        return t("error_invalid_code_check_email");
      case "form_param_format_invalid":
        if (error.meta?.paramName === "code")
          return t("error_code_format_invalid");
        return t("error_invalid_format");
      case "form_param_nil":
        return t("error_fill_all_fields");
      case "session_exists":
        return t("error_session_exists");
      default:
        if (error.message.toLowerCase().includes("is invalid"))
          return t("error_invalid_code");
        return error.message;
    }
  };

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push("/learn");
    }
  }, [isLoaded, isSignedIn, router]);

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || !signIn) return;

    setIsLoading(true);
    setError("");
    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: email,
      });
      setStep(2);
    } catch (err) {
      setError(translateError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || !signIn) return;

    setIsLoading(true);
    setError("");
    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code,
        password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/learn");
      }
    } catch (err) {
      const errorMsg = translateError(err);
      setError(errorMsg);

      // If code is invalid, send them back to step 2
      const errObj = err as ClerkError;
      if (
        errObj.errors?.[0]?.code === "verification_failed" ||
        errObj.errors?.[0]?.message.toLowerCase().includes("invalid")
      ) {
        setStep(2);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formVariants: Variants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
  };

  const itemVariants: Variants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 260, damping: 20 },
    },
  };

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden bg-sky-50 font-nunito">
      {/* Background Animated Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ x: [-50, 50, -50], y: [-50, 50, -50] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-10 -left-20 w-[400px] h-[400px] bg-sky-300/40 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{ x: [50, -50, 50], y: [50, -50, 50] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-10 -right-20 w-[500px] h-[500px] bg-[#58cc02]/20 rounded-full blur-[120px]"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-[2.5rem] lg:rounded-[3rem] p-6 sm:p-12 lg:p-14 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)] border-b-[8px] border-slate-200 dark:border-slate-800 z-10 mt-24"
      >
        {/* Floating Mascot */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[120px] lg:-top-[140px] left-1/2 -translate-x-1/2 w-48 h-48 lg:w-56 lg:h-56 drop-shadow-2xl z-20 pointer-events-none"
        >
          <Image src="/marco.png" alt="Marco" fill className="object-contain" />
        </motion.div>

        {/* Back Button */}
        <button
          onClick={() => {
            if (step === 1) router.back();
            else setStep(step - 1);
            setError("");
          }}
          className="absolute top-6 left-6 p-3 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 dark:bg-slate-800 rounded-2xl transition-colors group z-20"
        >
          <ArrowLeft
            size={24}
            className="group-hover:-translate-x-1 transition-transform"
          />
        </button>

        <div className="w-full relative z-10 pt-4">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                variants={formVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="space-y-8"
              >
                <motion.div
                  variants={itemVariants}
                  className="text-center space-y-3"
                >
                  <div className="w-16 h-16 bg-sky-100 text-[#1cb0f6] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                    <Mail size={32} />
                  </div>
                  <h1 className="text-3xl font-black text-[#042c60]">
                    {t("forgot_pwd_title")}
                  </h1>
                  <p className="text-slate-400 font-bold text-base">
                    {t("forgot_pwd_email_desc")}
                  </p>
                </motion.div>

                <form onSubmit={handleRequestCode} className="space-y-6">
                  <motion.div variants={itemVariants} className="relative">
                    <input
                      type="email"
                      placeholder={t("email_placeholder")}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full h-16 px-6 bg-slate-100 dark:bg-slate-800 border-2 border-transparent rounded-2xl font-bold text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-[#1cb0f6] focus:bg-white focus:dark:bg-slate-900 transition-all text-lg"
                    />
                  </motion.div>

                  <AnimatePresence>
                    {error && (
                      <motion.p
                        initial={{ opacity: 0, y: -10, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-rose-500 text-sm font-bold text-center bg-rose-50 p-3 rounded-xl border border-rose-100"
                      >
                        {error}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  <motion.div variants={itemVariants}>
                    <button
                      disabled={isLoading || !email}
                      className="w-full h-16 bg-[#1cb0f6] border-b-[6px] border-[#1899d6] rounded-2xl flex items-center justify-center font-extrabold text-white uppercase tracking-widest shadow-sm hover:bg-[#1899d6] active:border-b-0 active:translate-y-[6px] transition-all disabled:opacity-50 text-lg"
                    >
                      {isLoading ? (
                        <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        t("send_code_button")
                      )}
                    </button>
                  </motion.div>
                </form>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                variants={formVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="space-y-8"
              >
                <motion.div
                  variants={itemVariants}
                  className="text-center space-y-3"
                >
                  <div className="w-16 h-16 bg-amber-100 text-amber-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                    <Key size={32} />
                  </div>
                  <h1 className="text-3xl font-black text-[#042c60]">
                    {t("forgot_pwd_code_title")}
                  </h1>
                  <p className="text-slate-400 font-bold text-base">
                    {t.rich("forgot_pwd_code_desc_rich", {
                      email: email,
                      highlight: (chunks) => (
                        <span className="text-[#1cb0f6]">{chunks}</span>
                      ),
                    })}
                  </p>
                </motion.div>

                <div className="space-y-6">
                  <motion.div variants={itemVariants}>
                    <input
                      type="text"
                      placeholder="000000"
                      value={code}
                      onChange={(e) =>
                        setCode(e.target.value.replace(/\D/g, ""))
                      }
                      required
                      maxLength={6}
                      className="w-full h-24 text-center text-5xl tracking-[0.5em] font-black bg-slate-100 dark:bg-slate-800 border-2 border-transparent rounded-2xl focus:bg-white focus:dark:bg-slate-900 focus:ring-0 outline-none transition-all text-slate-700 dark:text-slate-200 focus:border-amber-400"
                    />
                  </motion.div>

                  <AnimatePresence>
                    {error && (
                      <motion.p
                        initial={{ opacity: 0, y: -10, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-rose-500 text-sm font-bold text-center bg-rose-50 p-3 rounded-xl border border-rose-100"
                      >
                        {error}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  <motion.div variants={itemVariants}>
                    <button
                      onClick={() => {
                        if (code.length === 6) {
                          setStep(3);
                          setError("");
                        }
                      }}
                      disabled={isLoading || code.length !== 6}
                      className="w-full h-16 bg-amber-500 border-b-[6px] border-amber-600 rounded-2xl flex items-center justify-center font-extrabold text-white uppercase tracking-widest shadow-sm hover:bg-amber-600 active:border-b-0 active:translate-y-[6px] transition-all disabled:opacity-50 text-lg"
                    >
                      {isLoading
                        ? t("verifying_button")
                        : t("verify_code_button")}
                    </button>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <p className="text-center text-sm font-bold text-slate-400 pt-2">
                      {t("resend_code_prompt")}{" "}
                      <button
                        onClick={handleRequestCode}
                        className="text-[#1cb0f6] hover:underline"
                      >
                        {t("resend_code")}
                      </button>
                    </p>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                variants={formVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="space-y-8"
              >
                <motion.div
                  variants={itemVariants}
                  className="text-center space-y-3"
                >
                  <div className="w-16 h-16 bg-green-100 text-[#58cc02] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                    <ShieldCheck size={32} />
                  </div>
                  <h1 className="text-3xl font-black text-[#042c60]">
                    {t("forgot_pwd_new_title")}
                  </h1>
                  <p className="text-slate-400 font-bold text-base">
                    {t("forgot_pwd_new_desc")}
                  </p>
                </motion.div>

                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (password !== confirmPassword) {
                      setError(t("password_mismatch"));
                      return;
                    }
                    handleResetPassword(e);
                  }}
                  className="space-y-6"
                >
                  <motion.div variants={itemVariants} className="space-y-4">
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder={t("password_placeholder")}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoFocus
                        className="w-full h-16 px-6 bg-slate-100 dark:bg-slate-800 border-2 border-transparent rounded-2xl font-bold text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-[#58cc02] focus:bg-white focus:dark:bg-slate-900 transition-all text-lg pr-14"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff size={24} />
                        ) : (
                          <Eye size={24} />
                        )}
                      </button>
                    </div>

                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder={t("confirm_password_label")}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="w-full h-16 px-6 bg-slate-100 dark:bg-slate-800 border-2 border-transparent rounded-2xl font-bold text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-[#58cc02] focus:bg-white focus:dark:bg-slate-900 transition-all text-lg"
                    />
                  </motion.div>

                  <AnimatePresence>
                    {error && (
                      <motion.p
                        initial={{ opacity: 0, y: -10, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-rose-500 text-sm font-bold text-center bg-rose-50 p-3 rounded-xl border border-rose-100"
                      >
                        {error}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  <motion.div variants={itemVariants}>
                    <button
                      disabled={
                        isLoading || password.length < 8 || !confirmPassword
                      }
                      className="w-full h-16 bg-[#58cc02] border-b-[6px] border-[#46a302] rounded-2xl flex items-center justify-center font-extrabold text-white uppercase tracking-widest shadow-sm hover:bg-[#4eb302] active:border-b-0 active:translate-y-[6px] transition-all disabled:opacity-50 text-lg"
                    >
                      {isLoading ? (
                        <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        t("reset_password_button")
                      )}
                    </button>
                  </motion.div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
