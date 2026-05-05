"use client";

import { useSignIn, useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";

const containerVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { 
    opacity: 1, 
    scale: 1,
    y: 0,
    transition: { 
      type: "spring", 
      stiffness: 100, 
      damping: 20,
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 260, damping: 20 }
  }
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
  const router = useRouter();

  // Helper to translate Clerk errors
  const translateError = (err: any) => {
    const error = err.errors?.[0];
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

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push("/learn");
    }
  }, [isLoaded, isSignedIn, router]);

  // Auto-detect MFA status on load (e.g. returning from Google OAuth)
  useEffect(() => {
    if (isLoaded && signIn?.status === "needs_second_factor") {
      setStep("mfa");
    }
  }, [isLoaded, signIn?.status]);

  // Prevents the "flash" of login form if already signed in or loading
  if (!isLoaded || isSignedIn) {
    return (
      <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center bg-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-6"
        >
          <div className="w-32 h-32 relative">
            <Image src="/marco.png" alt="Carregando..." fill className="object-contain animate-bounce" />
          </div>
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
    } catch (err: any) {
      console.error("Erro no login:", err);
      const msg = translateError(err);
      setError(msg);
      
      if (err.errors?.[0]?.code === "user_already_signed_in") {
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
      // Tenta o fator que estiver disponível (TOTP ou Email Code)
      const strategy = signIn.secondFactorVerification.strategy as any;
      const result = await signIn.attemptSecondFactor({
        strategy: strategy || "totp",
        code,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/learn");
        router.refresh();
      }
    } catch (err: any) {
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
    } catch (err: any) {
      setError(translateError(err));
    }
  };

  // Detect which MFA strategy is being used
  const mfaStrategy = signIn?.secondFactorVerification?.strategy;
  const isEmailMfa = mfaStrategy === "email_code";

  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center bg-[#f7f7f7] lg:bg-slate-50 p-4 sm:p-6 overflow-hidden relative">
      
      <div className="absolute inset-0 bg-[#58cc02] lg:bg-transparent opacity-[0.03] lg:opacity-100" />
      
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.1, 0.2, 0.1], scale: [1, 1.2, 1], y: [0, -100, 0], x: [0, 50, 0] }}
            transition={{ duration: 15 + i * 2, repeat: Infinity, ease: "linear", delay: i * 1.5 }}
            className="absolute rounded-full bg-[#58cc02]/20"
            style={{ width: Math.random() * 200 + 100, height: Math.random() * 200 + 100, left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
          />
        ))}
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-5xl bg-white rounded-[2.5rem] lg:rounded-[3rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] overflow-hidden flex flex-col lg:row relative z-10"
      >
        <div className="flex flex-col lg:flex-row w-full min-h-[500px]">
          {/* Left Side */}
          <div className="hidden lg:flex lg:w-5/12 bg-[#58cc02] p-12 flex-col items-center justify-center text-white text-center relative overflow-hidden transition-colors duration-500"
               style={{ backgroundColor: step === "mfa" ? (isEmailMfa ? "#ffc800" : "#1cb0f6") : "#58cc02" }}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                        className="absolute -top-10 -left-10 w-64 h-64 border-[30px] border-white/5 rounded-full" />
            
            <div className="relative z-10">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  <div className="w-56 h-56 relative mx-auto drop-shadow-2xl">
                    <Image src="/marco.png" alt="Marco" fill className="object-contain" />
                  </div>
                  <h2 className="text-4xl font-black tracking-tight leading-tight">
                    {step === "login" ? <>Bom ver-te <br /> de novo!</> : (isEmailMfa ? <>Verifica o <br /> teu Email!</> : <>Segurança <br /> Máxima!</>)}
                  </h2>
                  <p className="text-white/90 font-bold text-lg max-w-[240px] mx-auto leading-relaxed">
                    {step === "login" ? "Pronto para mais uma lição rápida e divertida? 🚀" : (isEmailMfa ? "Enviámos um código de acesso para a tua caixa de entrada. 📧" : "Insere o código do teu autenticador para continuar. 🛡️")}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Right Side */}
          <div className="w-full lg:w-7/12 p-8 sm:p-12 md:p-16 flex flex-col justify-center bg-white relative">
            <div className="w-full max-w-sm mx-auto space-y-8">
              
              <AnimatePresence mode="wait">
                {step === "login" ? (
                  <motion.div
                    key="login-step"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-8"
                  >
                    <div className="text-center space-y-2">
                      <h1 className="text-3xl font-black text-[#042c60]">Entrar</h1>
                      <p className="text-slate-400 font-bold text-base">Inicia sessão para salvar o teu progresso</p>
                    </div>

                    <div className="space-y-6">
                      <motion.button variants={itemVariants} whileTap={{ scale: 0.96 }} onClick={handleGoogleSignIn} disabled={isLoading}
                        className="group w-full h-14 bg-white border-2 border-slate-200 border-b-4 rounded-2xl flex items-center justify-center gap-3 font-bold text-slate-700 hover:bg-slate-50 active:border-b-2 active:translate-y-[2px] transition-all disabled:opacity-70"
                      >
                        {isLoading ? (
                          <div className="w-6 h-6 border-4 border-sky-400/30 border-t-sky-400 rounded-full animate-spin" />
                        ) : (
                          <>
                            <svg className="w-6 h-6" viewBox="0 0 24 24">
                              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            <span>Continuar com Google</span>
                          </>
                        )}
                      </motion.button>

                      <div className="flex items-center gap-4">
                        <div className="h-[2px] flex-1 bg-slate-100" />
                        <span className="text-slate-300 font-black text-sm uppercase tracking-widest">ou</span>
                        <div className="h-[2px] flex-1 bg-slate-100" />
                      </div>

                      <form onSubmit={handleEmailSignIn} className="space-y-4">
                        <div className="space-y-3">
                          <input type="email" placeholder="Email ou utilizador" value={email} onChange={(e) => setEmail(e.target.value)} required
                            className="w-full h-14 px-6 bg-slate-100/50 border-2 border-slate-200 rounded-2xl font-bold text-slate-700 focus:outline-none focus:border-sky-400 focus:bg-white transition-all" />
                          <div className="relative">
                            <input type={showPassword ? "text" : "password"} placeholder="Palavra-passe" value={password} onChange={(e) => setPassword(e.target.value)} required
                              className="w-full h-14 px-6 bg-slate-100/50 border-2 border-slate-200 rounded-2xl font-bold text-slate-700 focus:outline-none focus:border-sky-400 focus:bg-white transition-all pr-14" />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                          </div>
                        </div>

                        {error && (
                          <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-rose-500 text-sm font-bold text-center bg-rose-50 p-3 rounded-xl border border-rose-100">
                            {error}
                          </motion.p>
                        )}

                        <motion.button variants={itemVariants} whileTap={{ scale: 0.96 }} type="submit" disabled={isLoading || !email || !password}
                          className="w-full h-14 bg-[#58cc02] border-b-4 border-[#46a302] rounded-2xl flex items-center justify-center font-black text-white uppercase tracking-[0.2em] shadow-lg hover:bg-[#4eb302] active:border-b-0 active:translate-y-[4px] transition-all disabled:opacity-50"
                        >
                          {isLoading ? <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" /> : "ENTRAR"}
                        </motion.button>
                      </form>

                      <div className="pt-4 text-center space-y-6">
                        <Link href="/forgot-password" title="Esqueceste-te da palavra-passe?" className="text-sky-500 font-bold hover:text-sky-600 transition-colors text-sm">
                          Esqueceste-te da palavra-passe?
                        </Link>
                        <div className="h-[1px] w-full bg-slate-100" />
                        <p className="text-slate-500 font-bold text-sm">
                          Ainda não tens conta? <Link href="/onboarding" className="text-sky-500 hover:text-sky-600 underline underline-offset-4 decoration-2">Cria uma agora</Link>
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="mfa-step"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="space-y-8"
                  >
                    <div className="text-center space-y-2">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${isEmailMfa ? "bg-amber-100 text-amber-500" : "bg-sky-100 text-sky-500"}`}>
                        {isEmailMfa ? (
                          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        ) : (
                          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        )}
                      </div>
                      <h1 className="text-3xl font-black text-[#042c60]">{isEmailMfa ? "Verificar Email" : "Segunda Etapa"}</h1>
                      <p className="text-slate-400 font-bold">
                        {isEmailMfa ? "Introduz o código que enviámos para o teu email" : "Introduz o código de 6 dígitos do teu autenticador"}
                      </p>
                    </div>

                    <form onSubmit={handleMFASignIn} className="space-y-6">
                      <div className="space-y-3">
                        <input
                          type="text"
                          maxLength={6}
                          placeholder="000000"
                          value={code}
                          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                          required
                          autoFocus
                          className={`w-full h-20 text-center text-4xl tracking-[0.5em] font-black bg-slate-100/50 border-2 border-slate-200 rounded-3xl focus:outline-none focus:bg-white transition-all text-slate-700 ${isEmailMfa ? "focus:border-amber-400" : "focus:border-sky-400"}`}
                        />
                      </div>

                      {error && (
                        <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`text-sm font-bold text-center p-3 rounded-xl border ${error.includes("enviado") ? "text-green-600 bg-green-50 border-green-100" : "text-rose-500 bg-rose-50 border-rose-100"}`}>
                          {error}
                        </motion.p>
                      )}

                      <div className="space-y-3">
                        <motion.button whileTap={{ scale: 0.96 }} type="submit" disabled={isLoading || code.length < 6}
                          className={`w-full h-14 border-b-4 rounded-2xl flex items-center justify-center font-black text-white uppercase tracking-[0.2em] shadow-lg active:border-b-0 active:translate-y-[4px] transition-all disabled:opacity-50 ${isEmailMfa ? "bg-amber-500 border-amber-600 hover:bg-amber-400" : "bg-sky-500 border-sky-600 hover:bg-sky-400"}`}
                        >
                          {isLoading ? <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" /> : "VERIFICAR"}
                        </motion.button>
                        
                        {isEmailMfa && (
                          <button type="button" onClick={handleResendCode} className="w-full py-2 text-sky-500 font-bold hover:text-sky-600 transition-colors text-sm">
                            Não recebeste o código? Reenviar
                          </button>
                        )}

                        <button type="button" onClick={() => setStep("login")} className="w-full py-2 text-slate-400 font-bold hover:text-slate-600 transition-colors text-sm">
                          Voltar ao login
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
