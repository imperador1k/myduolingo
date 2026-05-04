"use client";

import { useSignUp } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { useOnboardingStore } from "@/store/use-onboarding-store";

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

export default function CustomSignUp() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const { isOnboardingComplete } = useOnboardingStore();
  const [isHydrated, setIsHydrated] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Handle zustand hydration and onboarding protection
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated && !isOnboardingComplete) {
      router.push("/onboarding");
    }
  }, [isHydrated, isOnboardingComplete, router]);

  const handleGoogleSignUp = async () => {
    if (!isLoaded) return;
    try {
      await signUp.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/learn",
      });
    } catch (err) {
      console.error("Erro no registro com Google:", err);
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    
    setIsLoading(true);
    try {
      await signUp.create({
        emailAddress: email,
        password,
      });
      
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
    } catch (err) {
      console.error("Erro no registro:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Prevent flicker during hydration check
  if (!isHydrated || !isOnboardingComplete) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-white">
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-24 h-24 relative"
        >
          <Image src="/marco.png" alt="Loading" fill className="object-contain grayscale" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center bg-[#f7f7f7] lg:bg-slate-50 p-4 sm:p-6 overflow-hidden relative">
      
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-[#58cc02] lg:bg-transparent opacity-[0.03] lg:opacity-100" />
      
      {/* Background Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0.1, 0.2, 0.1],
              scale: [1, 1.2, 1],
              y: [0, -100, 0],
              x: [0, 50, 0]
            }}
            transition={{ 
              duration: 15 + i * 2, 
              repeat: Infinity, 
              ease: "linear",
              delay: i * 1.5
            }}
            className="absolute rounded-full bg-[#58cc02]/20"
            style={{
              width: Math.random() * 200 + 100,
              height: Math.random() * 200 + 100,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      {/* Main Floating Card */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-5xl bg-white rounded-[2.5rem] lg:rounded-[3rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] overflow-hidden flex flex-col lg:row relative z-10"
      >
        <div className="flex flex-col lg:flex-row w-full">
          {/* Left Side (Desktop Only) */}
          <div className="hidden lg:flex lg:w-5/12 bg-[#58cc02] p-12 flex-col items-center justify-center text-white text-center relative overflow-hidden">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
              className="absolute -bottom-10 -right-10 w-64 h-64 border-[30px] border-white/5 rounded-full"
            />
            
            <div className="relative z-10">
              <motion.div
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="w-56 h-56 relative mb-8 mx-auto"
              >
                <Image
                  src="/marco.png"
                  alt="Marco"
                  fill
                  className="object-contain drop-shadow-2xl"
                />
              </motion.div>
              <h2 className="text-4xl font-black mb-4 tracking-tight leading-tight">Cria o teu <br /> perfil!</h2>
              <p className="text-white/90 font-bold text-lg max-w-[240px] mx-auto leading-relaxed">
                Junta-te a uma comunidade de milhões! 🦉
              </p>
            </div>
          </div>

          {/* Right Side: Auth Flow */}
          <div className="w-full lg:w-7/12 p-8 sm:p-12 md:p-16 flex flex-col justify-center bg-white relative">
            
            {/* Mascot for Mobile */}
            <div className="lg:hidden flex flex-col items-center mb-8">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="w-24 h-24 relative"
              >
                <Image src="/marco.png" alt="Marco" fill className="object-contain" />
              </motion.div>
            </div>

            <div className="w-full max-w-sm mx-auto space-y-8">
              
              {/* Header section */}
              <motion.div variants={itemVariants} className="text-center space-y-2">
                <h1 className="text-3xl font-black text-[#042c60]">Criar conta</h1>
                <p className="text-slate-400 font-bold text-base">Começa a tua jornada épica hoje</p>
              </motion.div>

              <div className="space-y-6">
                {/* Google Button */}
                <motion.button
                  variants={itemVariants}
                  whileTap={{ scale: 0.96 }}
                  onClick={handleGoogleSignUp}
                  className="group w-full h-14 bg-white border-2 border-slate-200 border-b-4 rounded-2xl flex items-center justify-center gap-3 font-bold text-slate-700 hover:bg-slate-50 active:border-b-2 active:translate-y-[2px] transition-all"
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  <span className="text-sm sm:text-base">Registrar com Google</span>
                </motion.button>

                {/* OR Divider */}
                <motion.div variants={itemVariants} className="flex items-center gap-4">
                  <div className="h-[2px] flex-1 bg-slate-100" />
                  <span className="text-slate-300 font-black text-sm uppercase tracking-widest">ou</span>
                  <div className="h-[2px] flex-1 bg-slate-100" />
                </motion.div>

                {/* Form */}
                <form onSubmit={handleEmailSignUp} className="space-y-4">
                  <motion.div variants={itemVariants} className="space-y-3">
                    <input
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full h-14 px-6 bg-slate-100/50 border-2 border-slate-200 rounded-2xl font-bold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#1cb0f6] focus:bg-white transition-all text-base"
                    />
                    <input
                      type="password"
                      placeholder="Palavra-passe"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full h-14 px-6 bg-slate-100/50 border-2 border-slate-200 rounded-2xl font-bold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#1cb0f6] focus:bg-white transition-all text-base"
                    />
                  </motion.div>

                  <motion.button
                    variants={itemVariants}
                    whileTap={{ scale: 0.96 }}
                    type="submit"
                    disabled={isLoading || !email || !password}
                    className="w-full h-14 bg-[#58cc02] border-b-4 border-[#46a302] rounded-2xl flex items-center justify-center font-black text-white uppercase tracking-[0.2em] shadow-lg hover:bg-[#4eb302] active:border-b-0 active:translate-y-[4px] transition-all disabled:opacity-50 text-sm sm:text-base"
                  >
                    {isLoading ? (
                      <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      "CRIAR CONTA"
                    )}
                  </motion.button>
                </form>

                {/* Links */}
                <motion.div variants={itemVariants} className="pt-4 text-center space-y-6">
                  <p className="text-slate-500 font-bold text-sm sm:text-base">
                    Já tens conta?{" "}
                    <Link href="/sign-in" className="text-sky-500 hover:text-sky-600 underline underline-offset-4 decoration-2 transition-colors">
                      Inicia sessão
                    </Link>
                  </p>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
