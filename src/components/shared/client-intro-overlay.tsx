"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { DuoAnimationLottie } from "@/components/ui/lottie-animation";
import { Button } from "@/components/ui/button";
import { haptics } from "@/lib/haptics";
import { useUISounds } from "@/hooks/use-ui-sounds";
import confetti from "canvas-confetti";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { Volume2, VolumeX, Moon, Sun } from "lucide-react";
import { usePreferencesStore } from "@/store/use-preferences-store";

const INTRO_STEP_KEY = "introStep";

const LANGUAGES = [
  { code: "pt", name: "Português", flag: "🇵🇹" },
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "it", name: "Italiano", flag: "🇮🇹" },
  { code: "ja", name: "日本語", flag: "🇯🇵" },
  { code: "ar", name: "العربية", flag: "🇸🇦" },
  { code: "uk", name: "Українська", flag: "🇺🇦" },
  { code: "hi", name: "हिन्दी", flag: "🇮🇳" },
];

export const ClientIntroOverlay = () => {
  const t = useTranslations("intro");
  const locale = useLocale();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { playClick, playWhoosh, playReward, isMuted, toggleMute } =
    useUISounds();
  const [isVisible, setIsVisible] = useState(false);
  const [step, setStep] = useState(1);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  // Define steps explicitly for TypeScript
  const totalSteps = 4;
  const currentFullText = t(`step${step}` as any);

  const hasSeenIntro = usePreferencesStore(
    (state) => state.hasSeenIntroOverlay,
  );
  const setPreference = usePreferencesStore((state) => state.setPreference);

  useEffect(() => {
    // Check if it's the first time
    if (!hasSeenIntro) {
      setIsVisible(true);
      const savedStep = sessionStorage.getItem(INTRO_STEP_KEY);
      if (savedStep) {
        setStep(parseInt(savedStep, 10));
      }
    }
  }, [hasSeenIntro]);

  // Typewriter effect
  useEffect(() => {
    if (!isVisible) return;

    let i = 0;
    setIsTyping(true);
    setDisplayedText("");

    // Audio for typing blips (we create a short sound or just type silently if none available)
    // Actually, playing an audio element quickly can be laggy. We'll do it silently or play a pop.

    // Typwriter effect sound could be too noisy, we just play a whoosh on new step
    if (i === 0) {
      playWhoosh();
    }

    const intervalId = setInterval(() => {
      setDisplayedText(currentFullText.slice(0, i + 1));
      i++;
      if (i >= currentFullText.length) {
        clearInterval(intervalId);
        setIsTyping(false);
      }
    }, 15); // Faster typing speed to prevent slow feeling

    return () => clearInterval(intervalId);
  }, [step, currentFullText, isVisible]);

  const changeLanguage = (langCode: string) => {
    if (langCode === locale) return;
    document.cookie = `NEXT_LOCALE=${langCode}; path=/; max-age=31536000`;
    sessionStorage.setItem(INTRO_STEP_KEY, String(step));
    router.refresh();
  };

  const handleNext = () => {
    // Prevent advancing if the user clicks a settings button (stop propagation is used below but just in case)
    haptics.light();
    playClick();

    if (isTyping) {
      // Skip typing animation
      setDisplayedText(currentFullText);
      setIsTyping(false);
    } else {
      // Go to next step or finish
      if (step < totalSteps) {
        const nextStep = step + 1;
        setStep(nextStep);
        sessionStorage.setItem(INTRO_STEP_KEY, String(nextStep));
      } else {
        haptics.success();
        playReward();
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#FFC800", "#58CC02", "#1CB0F6"],
        });
        finishIntro();
      }
    }
  };

  const handleBack = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (step > 1) {
      haptics.light();
      playClick();
      const prevStep = step - 1;
      setStep(prevStep);
      sessionStorage.setItem(INTRO_STEP_KEY, String(prevStep));
    }
  };

  const finishIntro = () => {
    setPreference("hasSeenIntroOverlay", true);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
        transition={{ duration: 0.5 }}
        className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center p-6 overflow-hidden ${theme === "dark" ? "bg-slate-900" : "bg-slate-50"}`}
        onClick={handleNext} // Clicking anywhere advances the text
      >
        {/* Animated Radial Background for cinematic feel */}
        {theme === "dark" ? (
          <motion.div
            className="absolute inset-0 z-0 opacity-60"
            animate={{
              background: [
                "radial-gradient(circle at 50% 50%, #064e3b 0%, #0f172a 100%)",
                "radial-gradient(circle at 50% 50%, #075985 0%, #0f172a 100%)",
                "radial-gradient(circle at 50% 50%, #4c1d95 0%, #0f172a 100%)",
                "radial-gradient(circle at 50% 50%, #064e3b 0%, #0f172a 100%)",
              ],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          />
        ) : (
          <motion.div
            className="absolute inset-0 z-0 opacity-50"
            animate={{
              background: [
                "radial-gradient(circle at 50% 50%, #dcfce7 0%, #f8fafc 100%)",
                "radial-gradient(circle at 50% 50%, #e0f2fe 0%, #f8fafc 100%)",
                "radial-gradient(circle at 50% 50%, #f3e8ff 0%, #f8fafc 100%)",
                "radial-gradient(circle at 50% 50%, #dcfce7 0%, #f8fafc 100%)",
              ],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          />
        )}

        {/* Star Particles Layer */}
        {theme === "dark" && (
          <div className="absolute inset-0 z-0 bg-[url('/bg-stars.svg')] opacity-20 animate-pulse pointer-events-none" />
        )}

        {/* Top Navigation Controls */}
        <div className="absolute top-8 left-8 right-8 z-50 flex items-center justify-between pointer-events-none">
          <div className="pointer-events-auto">
            {step > 1 && (
              <Button
                variant="ghost"
                className="text-stone-400 hover:text-stone-600 dark:text-slate-500 dark:hover:text-slate-300 font-bold uppercase tracking-widest text-sm"
                onClick={handleBack}
              >
                ← Voltar
              </Button>
            )}
          </div>
          <div className="pointer-events-auto">
            <Button
              variant="ghost"
              className="text-stone-400 hover:text-stone-600 dark:text-slate-500 dark:hover:text-slate-300 font-bold uppercase tracking-widest text-sm"
              onClick={(e) => {
                e.stopPropagation();
                finishIntro();
              }}
            >
              {t("skip")}
            </Button>
          </div>
        </div>

        {/* Content Container - Fixed for desktop centering */}
        <div className="relative z-20 flex flex-col items-center justify-center w-full max-w-lg min-h-[400px] gap-6 mt-12">
          {/* Speech Bubble */}
          <motion.div
            key={step} // re-animate slightly when step changes
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: "spring", damping: 12, stiffness: 100 }}
            className="relative bg-white dark:bg-slate-800 border-4 border-stone-200 dark:border-slate-700 rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] w-full min-h-[140px] sm:min-h-[160px] flex items-center justify-center text-center"
          >
            {/* The little tail of the bubble pointing down */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-white dark:bg-slate-800 border-b-4 border-r-4 border-stone-200 dark:border-slate-700 rotate-45" />

            <p className="text-xl sm:text-2xl font-black text-stone-800 dark:text-slate-100 leading-relaxed tracking-tight">
              {displayedText}
              {isTyping && (
                <span className="inline-block w-2 h-6 ml-1 bg-green-500 animate-pulse" />
              )}
            </p>
          </motion.div>

          {/* Mascot with Glow */}
          <motion.div
            className="relative w-40 h-40 sm:w-56 sm:h-56 mt-2"
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          >
            <div className="absolute inset-0 bg-green-500/20 blur-3xl rounded-full" />
            <DuoAnimationLottie className="w-full h-full relative z-10 drop-shadow-2xl" />
          </motion.div>

          {/* Setup Settings (Only on Step 1) */}
          {step === 1 && !isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative z-30 w-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border-2 border-stone-200 dark:border-slate-700 rounded-3xl p-4 shadow-xl flex flex-col gap-4 mt-2 mb-4"
              onClick={(e) => e.stopPropagation()} // Prevent advancing when clicking settings
            >
              <div className="flex items-center justify-between gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 font-bold text-stone-500 dark:text-slate-400"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                >
                  {theme === "dark" ? (
                    <Sun className="w-4 h-4 mr-2" />
                  ) : (
                    <Moon className="w-4 h-4 mr-2" />
                  )}
                  Tema: {theme === "dark" ? "Escuro" : "Claro"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 font-bold text-stone-500 dark:text-slate-400"
                  onClick={toggleMute}
                >
                  {isMuted ? (
                    <VolumeX className="w-4 h-4 mr-2" />
                  ) : (
                    <Volume2 className="w-4 h-4 mr-2" />
                  )}
                  Som: {isMuted ? "Off" : "On"}
                </Button>
              </div>

              <div className="grid grid-cols-5 gap-2 max-h-32 overflow-y-auto pr-1">
                {LANGUAGES.map((lang) => {
                  const isActive = locale === lang.code;
                  return (
                    <Button
                      key={lang.code}
                      onClick={() => changeLanguage(lang.code)}
                      variant={isActive ? "secondary" : "ghost"}
                      className={`h-auto py-2 flex flex-col gap-1 rounded-xl transition-all ${
                        isActive
                          ? "bg-[#1CB0F6]/10 text-[#1CB0F6] border-2 border-[#1CB0F6]/30 dark:bg-sky-900/40 dark:text-sky-400 dark:border-sky-700"
                          : "border-2 border-transparent hover:border-stone-200 dark:hover:border-slate-700"
                      }`}
                    >
                      <span className="text-xl">{lang.flag}</span>
                    </Button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Call to action hint */}
          <div className="h-10 mt-2">
            {!isTyping && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="text-sm font-bold text-stone-400 dark:text-slate-400 uppercase tracking-widest text-center"
              >
                {step === totalSteps
                  ? t("next")
                  : "Toca em qualquer lado para continuar"}
              </motion.p>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
