"use client";

import { useSignIn, useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Eye, EyeOff, Flame, Trophy, TrendingUp, Sparkles } from "lucide-react";

// Animation configuration for staggered children entry
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.15,
    },
  },
};

// Card spring transition variants
const cardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 15 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 180, damping: 20 },
  },
};

// Individual child items variant within card
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
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

  interface ClerkError {
    errors?: Array<{
      code: string;
      message: string;
      meta?: { paramName?: string };
    }>;
  }

  // Translates Clerk internal errors to Portuguese friendly errors
  const translateError = (err: unknown) => {
    const errorObj = err as ClerkError;
    const error = errorObj.errors?.[0];
    if (!error) return "Ocorreu um erro inesperado.";

    switch (error.code) {
      case "form_identifier_not_found":
      case "form_password_incorrect":
        return "Email ou palavra-passe incorretos.";
      case "user_already_signed_in":
        return "Já tens uma sessão ativa. A redirecionar...";
      case "form_param_nil":
        return "Por favor, preenche todos os campos.";
      case "form_code_incorrect":
        return "Código de verificação incorreto.";
      default:
        return error.message || "Email ou palavra-passe inválidos.";
    }
  };

  // Check if session is already active
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push("/learn");
    }
  }, [isLoaded, isSignedIn, router]);

  // Handle Clerk 2FA triggers (needs second factor)
  useEffect(() => {
    if (isLoaded && signIn?.status === "needs_second_factor") {
      setStep("mfa");
    }
  }, [isLoaded, signIn?.status]);

  // Triggers card shake animation upon visual error notifications
  useEffect(() => {
    if (error && !error.includes("enviado")) {
      setIsShaking(true);
      const timer = setTimeout(() => setIsShaking(false), 500);
      return () => clearTimeout(timer);
    }
  }, [error]);

  if (!isLoaded || isSignedIn) {
    return (
      <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center bg-white overflow-hidden">
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
              alt="A carregar..."
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
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/learn",
      });
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
        setError("O login requer passos adicionais não suportados.");
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
      setError("Novo código enviado para o teu email! 📧");
    } catch (err) {
      setError(translateError(err));
    }
  };

  const mfaStrategy = signIn?.secondFactorVerification?.strategy;
  const isEmailMfa = mfaStrategy === "email_code";

  return (
    <div className="min-h-[100dvh] w-full overflow-hidden flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 relative p-4 select-none">
      {/* Background Dots Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-40 pointer-events-none z-0"></div>

      {/* Volumetric Radial Glow, changing color depending on Step */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] blur-[130px] rounded-full pointer-events-none transition-colors duration-1000 ease-in-out opacity-25 z-0"
        style={{
          backgroundColor:
            step === "mfa" ? (isEmailMfa ? "#ffc800" : "#1cb0f6") : "#58cc02",
        }}
      ></div>

      {/* Main Console Hub Wrapper */}
      <div className="relative w-[92%] sm:w-full max-w-[440px] z-10 flex flex-col items-center justify-center">
        {/* Ambient Game Satellites (Desktop only) */}
        <div className="hidden lg:block">
          {/* Satellite 1: Top Left - Flame/Streak Info */}
          <motion.div
            className="absolute -left-52 top-[5%] z-10 w-44 bg-white/70 backdrop-blur-md border border-white/80 shadow-lg border-b-4 border-b-slate-200 rounded-2xl p-3 flex items-center gap-3"
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 4.2, ease: "easeInOut" }}
          >
            <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center text-orange-500 shrink-0">
              <Flame size={18} className="fill-orange-500" />
            </div>
            <div className="min-w-0">
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-wider leading-none">
                Ofensiva
              </p>
              <p className="text-slate-700 text-xs font-black truncate mt-1">
                30 Dias 🔥
              </p>
            </div>
          </motion.div>

          {/* Satellite 2: Top Right - Trophy/League */}
          <motion.div
            className="absolute -right-52 top-[10%] z-10 w-44 bg-white/70 backdrop-blur-md border border-white/80 shadow-lg border-b-4 border-b-slate-200 rounded-2xl p-3 flex items-center gap-3"
            animate={{ y: [0, -7, 0] }}
            transition={{
              repeat: Infinity,
              duration: 4.8,
              ease: "easeInOut",
              delay: 0.6,
            }}
          >
            <div className="w-9 h-9 rounded-xl bg-yellow-100 flex items-center justify-center text-yellow-600 shrink-0">
              <Trophy size={18} className="fill-yellow-500" />
            </div>
            <div className="min-w-0">
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-wider leading-none">
                Liga
              </p>
              <p className="text-slate-700 text-xs font-black truncate mt-1">
                Diamante 👑
              </p>
            </div>
          </motion.div>

          {/* Satellite 3: Bottom Left - XP multiplier */}
          <motion.div
            className="absolute -left-56 bottom-[15%] z-10 w-48 bg-white/70 backdrop-blur-md border border-white/80 shadow-lg border-b-4 border-b-slate-200 rounded-2xl p-3 flex items-center gap-3"
            animate={{ y: [0, -10, 0] }}
            transition={{
              repeat: Infinity,
              duration: 5.2,
              ease: "easeInOut",
              delay: 1.2,
            }}
          >
            <div className="w-9 h-9 rounded-xl bg-sky-100 flex items-center justify-center text-[#1cb0f6] shrink-0">
              <TrendingUp size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-wider leading-none">
                Bónus XP
              </p>
              <p className="text-slate-700 text-xs font-black truncate mt-1">
                2.0x Ativo ⚡
              </p>
            </div>
          </motion.div>

          {/* Satellite 4: Bottom Right - Course Progress */}
          <motion.div
            className="absolute -right-56 bottom-[12%] z-10 w-48 bg-white/70 backdrop-blur-md border border-white/80 shadow-lg border-b-4 border-b-slate-200 rounded-2xl p-3 flex items-center gap-3"
            animate={{ y: [0, -9, 0] }}
            transition={{
              repeat: Infinity,
              duration: 5.6,
              ease: "easeInOut",
              delay: 1.8,
            }}
          >
            <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center text-green-500 shrink-0">
              <Sparkles size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-wider leading-none">
                Progresso
              </p>
              <p className="text-slate-700 text-xs font-black truncate mt-1">
                Inglês: 94% 🚀
              </p>
            </div>
          </motion.div>
        </div>

        {/* Central Tactile Authentication Card */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate={isShaking ? { x: [-10, 10, -10, 10, -5, 5, 0] } : "visible"}
          className="w-full bg-white border-2 border-slate-200 border-b-[8px] rounded-[2rem] p-8 lg:p-8 relative z-20 shadow-xl shadow-slate-200/40"
        >
          {/* Mascot (Marco) Overlapping Card top */}
          <motion.div
            className="w-28 h-28 lg:w-24 lg:h-24 relative -mt-20 lg:-mt-16 mx-auto mb-2 drop-shadow-lg z-30 pointer-events-none"
            animate={{ y: [-3, 3, -3] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
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
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Header */}
                <motion.div
                  variants={itemVariants}
                  className="text-center space-y-1"
                >
                  <h1 className="text-3xl lg:text-3xl font-black text-[#042c60]">
                    Entrar
                  </h1>
                  <p className="text-slate-400 font-bold text-xs sm:text-sm">
                    Inicia sessão para salvar o teu progresso
                  </p>
                </motion.div>

                {/* Horizontal Gamified Micro-Badges */}
                <motion.div
                  variants={itemVariants}
                  className="flex items-center justify-center gap-2 pt-1 pb-1"
                >
                  <div className="flex items-center gap-1 bg-orange-50 border border-orange-100 rounded-full px-2.5 py-1 text-orange-600 font-black text-[11px] sm:text-xs shadow-sm shadow-orange-100/50">
                    <Flame size={12} className="fill-orange-500 shrink-0" />
                    <span>30D</span>
                  </div>
                  <div className="flex items-center gap-1 bg-yellow-50 border border-yellow-100 rounded-full px-2.5 py-1 text-yellow-600 font-black text-[11px] sm:text-xs shadow-sm shadow-yellow-100/50">
                    <Trophy size={12} className="fill-yellow-500 shrink-0" />
                    <span>Diamante</span>
                  </div>
                  <div className="flex items-center gap-1 bg-sky-50 border border-sky-100 rounded-full px-2.5 py-1 text-[#1cb0f6] font-black text-[11px] sm:text-xs shadow-sm shadow-sky-100/50">
                    <TrendingUp size={12} className="shrink-0" />
                    <span>2.0x</span>
                  </div>
                </motion.div>

                {/* Authentication content */}
                <motion.div variants={itemVariants} className="space-y-4">
                  {/* Google Authenticator */}
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    className="w-full h-14 lg:h-12 bg-white border-2 border-slate-200 border-b-[6px] active:border-b-2 active:translate-y-[4px] transition-all rounded-2xl flex items-center justify-center gap-3 text-slate-700 font-black hover:bg-slate-50 disabled:opacity-70 text-sm sm:text-base lg:text-sm outline-none cursor-pointer"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-3 border-sky-400/30 border-t-sky-400 rounded-full animate-spin" />
                    ) : (
                      <>
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
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
                        <span>Continuar com Google</span>
                      </>
                    )}
                  </motion.button>

                  {/* Separator line */}
                  <div className="flex items-center gap-3">
                    <div className="h-[2px] flex-1 bg-slate-100" />
                    <span className="text-slate-300 font-black text-xs sm:text-sm uppercase tracking-widest">
                      ou
                    </span>
                    <div className="h-[2px] flex-1 bg-slate-100" />
                  </div>

                  {/* E-mail / Password Form */}
                  <form onSubmit={handleEmailSignIn} className="space-y-4">
                    <motion.div variants={itemVariants} className="space-y-3">
                      <input
                        type="email"
                        placeholder="Email ou utilizador"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full h-14 lg:h-12 px-5 bg-slate-50 border-2 border-slate-200 focus:bg-white focus:border-[#1cb0f6] rounded-2xl font-black text-slate-700 text-sm sm:text-base lg:text-sm focus:ring-0 outline-none transition-all"
                      />
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="Palavra-passe"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="w-full h-14 lg:h-12 px-5 bg-slate-50 border-2 border-slate-200 focus:bg-white focus:border-[#1cb0f6] rounded-2xl font-black text-slate-700 text-sm sm:text-base lg:text-sm focus:ring-0 outline-none transition-all pr-12"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          {showPassword ? (
                            <EyeOff size={20} />
                          ) : (
                            <Eye size={20} />
                          )}
                        </button>
                      </div>
                    </motion.div>

                    {/* Error Handling Area */}
                    <AnimatePresence>
                      {error && (
                        <motion.p
                          initial={{ opacity: 0, y: -8, height: 0 }}
                          animate={{ opacity: 1, y: 0, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="text-rose-500 text-xs font-black text-center bg-rose-50 p-2.5 rounded-xl border border-rose-100"
                        >
                          {error}
                        </motion.p>
                      )}
                    </AnimatePresence>

                    {/* Submit Login */}
                    <motion.button
                      variants={itemVariants}
                      whileTap={{ scale: 0.97 }}
                      type="submit"
                      disabled={isLoading || !email || !password}
                      className="w-full h-14 lg:h-12 bg-[#58cc02] text-white border-b-[6px] border-[#46a302] hover:bg-[#4eb302] active:border-b-0 active:translate-y-[6px] transition-all rounded-2xl font-black tracking-widest uppercase flex items-center justify-center text-sm sm:text-base lg:text-sm disabled:opacity-50 outline-none cursor-pointer"
                    >
                      {isLoading ? (
                        <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        "ENTRAR"
                      )}
                    </motion.button>
                  </form>

                  {/* Navigation Links */}
                  <motion.div
                    variants={itemVariants}
                    className="pt-2 text-center space-y-4"
                  >
                    <Link
                      href="/forgot-password"
                      className="text-[#1cb0f6] font-bold hover:text-sky-400 hover:underline transition-colors text-xs sm:text-sm inline-block"
                    >
                      Esqueceste-te da palavra-passe?
                    </Link>
                    <div className="h-[2px] w-full bg-slate-100" />
                    <p className="text-slate-400 font-bold text-xs sm:text-sm">
                      Ainda não tens conta?{" "}
                      <Link
                        href="/sign-up"
                        className="text-[#1cb0f6] font-bold hover:text-sky-400 hover:underline transition-colors ml-1"
                      >
                        Cria uma agora
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
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-5"
              >
                {/* MFA Header */}
                <motion.div
                  variants={itemVariants}
                  className="text-center space-y-2"
                >
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-2 ${isEmailMfa ? "bg-amber-100 text-amber-500" : "bg-sky-100 text-[#1cb0f6]"}`}
                  >
                    {isEmailMfa ? (
                      <svg
                        className="w-7 h-7"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-7 h-7"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    )}
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black text-[#042c60]">
                    {isEmailMfa ? "Verificar Email" : "Segunda Etapa"}
                  </h1>
                  <p className="text-slate-400 font-bold text-xs sm:text-sm">
                    {isEmailMfa
                      ? "Introduz o código que enviámos para o teu email"
                      : "Introduz o código de 6 dígitos do teu autenticador"}
                  </p>
                </motion.div>

                {/* MFA Code Verification Form */}
                <form onSubmit={handleMFASignIn} className="space-y-4">
                  <motion.div variants={itemVariants}>
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="000000"
                      value={code}
                      onChange={(e) =>
                        setCode(e.target.value.replace(/\D/g, ""))
                      }
                      required
                      autoFocus
                      className={`w-full h-20 lg:h-16 text-center text-4xl lg:text-3xl tracking-[0.4em] font-black bg-slate-50 border-2 border-slate-200 focus:bg-white focus:ring-0 outline-none transition-all text-slate-700 rounded-2xl ${isEmailMfa ? "focus:border-amber-400" : "focus:border-[#1cb0f6]"}`}
                    />
                  </motion.div>

                  <AnimatePresence>
                    {error && (
                      <motion.p
                        initial={{ opacity: 0, y: -8, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className={`text-xs font-black text-center p-3 rounded-xl border ${error.includes("enviado") ? "text-green-600 bg-green-50 border-green-100" : "text-rose-500 bg-rose-50 border-rose-100"}`}
                      >
                        {error}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  <motion.div variants={itemVariants} className="space-y-2">
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      type="submit"
                      disabled={isLoading || code.length < 6}
                      className={`w-full h-14 lg:h-12 border-b-[6px] rounded-2xl flex items-center justify-center font-black text-white uppercase tracking-widest shadow-sm active:border-b-0 active:translate-y-[6px] transition-all disabled:opacity-50 text-sm sm:text-base lg:text-sm outline-none cursor-pointer ${isEmailMfa ? "bg-amber-500 border-amber-600 hover:bg-amber-400" : "bg-[#1cb0f6] border-[#1899d6] hover:bg-[#1899d6]"}`}
                    >
                      {isLoading ? (
                        <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        "VERIFICAR"
                      )}
                    </motion.button>

                    {isEmailMfa && (
                      <button
                        type="button"
                        onClick={handleResendCode}
                        className="w-full py-2.5 text-[#1cb0f6] font-bold hover:text-sky-400 hover:underline transition-colors text-xs sm:text-sm outline-none"
                      >
                        Não recebeste o código? Reenviar
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setStep("login")}
                      className="w-full py-2.5 text-slate-400 font-bold hover:text-slate-600 hover:underline transition-colors text-xs sm:text-sm outline-none"
                    >
                      Voltar ao login
                    </button>
                  </motion.div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
