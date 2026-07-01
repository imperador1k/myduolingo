"use client";

import { useTranslations } from "next-intl";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Trophy,
  Crown,
  Gem,
  Zap,
  TrendingUp,
  TrendingDown,
  X,
  Lightbulb,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePreferencesStore } from "@/store/use-preferences-store";

const STORAGE_KEY = "hasSeenLeagueModal";

const LEAGUES_INFO = [
  {
    key: "BRONZE",
    label: "Bronze",
    icon: Shield,
    color: "text-orange-500 fill-orange-200",
    bg: "bg-orange-50 border-orange-200",
  },
  {
    key: "SILVER",
    label: "Prata",
    icon: Shield,
    color: "text-slate-500 dark:text-slate-400 fill-slate-200",
    bg: "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800",
  },
  {
    key: "GOLD",
    label: "Ouro",
    icon: Trophy,
    color: "text-amber-500 fill-amber-200",
    bg: "bg-amber-50 border-amber-200",
  },
  {
    key: "PLATINUM",
    label: "Platina",
    icon: Gem,
    color: "text-teal-500 fill-teal-200",
    bg: "bg-teal-50 border-teal-200",
  },
  {
    key: "DIAMOND",
    label: "Diamante",
    icon: Crown,
    color: "text-sky-500 fill-sky-200",
    bg: "bg-sky-50 border-sky-200",
  },
];

type Props = {
  trigger?: React.ReactNode;
};

export function LeagueInfoModal({ trigger }: Props) {
  const t = useTranslations("leaderboard");
  const [isOpen, setIsOpen] = useState(false);
  // Track if we are mounted on the client (required for createPortal)
  const [mounted, setMounted] = useState(false);

  const hasSeenModal = usePreferencesStore((state) => state.hasSeenLeagueModal);
  const setPreference = usePreferencesStore((state) => state.setPreference);

  useEffect(() => {
    setMounted(true);
    if (!hasSeenModal) {
      const t = setTimeout(() => setIsOpen(true), 800);
      return () => clearTimeout(t);
    }
  }, [hasSeenModal]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setPreference("hasSeenLeagueModal", true);
  }, [setPreference]);

  const handleOpen = useCallback(() => setIsOpen(true), []);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const triggerEl = trigger ? (
    <span onClick={handleOpen} className="cursor-pointer">
      {trigger}
    </span>
  ) : (
    <button
      onClick={handleOpen}
      aria-label={t("trigger_aria")}
      className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm border-2 border-white/30 border-b-4 border-b-black/10 text-white transition-all hover:bg-white/30 active:translate-y-0.5"
    >
      <Info className="h-4 w-4" />
    </button>
  );

  // Render the portal only on the client, directly into document.body
  const portal = mounted
    ? createPortal(
        <AnimatePresence>
          {isOpen && (
            <>
              {/* ── Backdrop — z-[9999] ensures it covers sidebar & everything ── */}
              <motion.div
                key="league-backdrop"
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-supreme"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={handleClose}
              />

              {/* ── Modal panel — z-[10000] sits on top of backdrop ── */}
              <motion.div
                key="league-panel"
                className="fixed inset-0 flex items-center justify-center p-4 sm:p-6 pointer-events-none z-supreme"
              >
                <motion.div
                  className="relative w-full max-w-md max-h-[90dvh] overflow-y-auto rounded-[2.5rem] bg-white dark:bg-slate-900 border-2 border-stone-200 dark:border-slate-800 border-b-[12px] shadow-2xl pointer-events-auto"
                  initial={{ opacity: 0, y: 40, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 24, scale: 0.96 }}
                  transition={{ type: "spring", stiffness: 320, damping: 28 }}
                >
                  {/* Custom Close */}
                  <button
                    onClick={handleClose}
                    className="absolute right-5 top-5 z-10 flex h-9 w-9 items-center justify-center rounded-xl bg-stone-100 dark:bg-slate-800 text-stone-400 dark:text-slate-500 dark:text-slate-400 border-2 border-stone-200 dark:border-slate-800 border-b-4 hover:bg-stone-200 dark:hover:bg-slate-700 dark:bg-slate-700 hover:text-stone-600 dark:text-slate-300 active:border-b-0 active:translate-y-0.5 transition-all focus:outline-none"
                    aria-label={t("close")}
                  >
                    <X className="h-5 w-5 stroke-[2.5]" />
                  </button>

                  <div className="p-7 md:p-9 flex flex-col gap-6">
                    {/* Header */}
                    <div className="text-center pt-2">
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-amber-50 border-2 border-amber-200 border-b-4 shadow-sm">
                        <Trophy className="h-8 w-8 text-amber-500 fill-amber-200" />
                      </div>
                      <h2 className="text-2xl md:text-3xl font-black text-stone-700 dark:text-slate-200 tracking-tight uppercase">
                        {t.rich("title", { br: () => <br /> })}
                      </h2>
                      <div className="h-1.5 w-12 bg-amber-400 rounded-full mx-auto mt-4" />
                    </div>

                    {/* Section 1 — Regras */}
                    <div className="rounded-[2rem] border-2 border-stone-100 bg-stone-50/60 p-5 flex flex-col gap-3">
                      <h3 className="font-black text-stone-700 dark:text-slate-200 text-sm uppercase tracking-widest">
                        {t("rules_title")}
                      </h3>
                      <RuleItem
                        icon={
                          <Zap className="h-5 w-5 text-amber-500 fill-amber-300" />
                        }
                        text={t("rule_1")}
                      />
                      <RuleItem
                        icon={
                          <TrendingUp className="h-5 w-5 text-emerald-500" />
                        }
                        text={t("rule_2")}
                      />
                      <RuleItem
                        icon={
                          <TrendingDown className="h-5 w-5 text-rose-500" />
                        }
                        text={t("rule_3")}
                      />
                    </div>

                    {/* Section 2 — Ligas */}
                    <div className="rounded-[2rem] border-2 border-stone-100 bg-stone-50/60 p-5 flex flex-col gap-2">
                      <h3 className="font-black text-stone-700 dark:text-slate-200 text-sm uppercase tracking-widest mb-1">
                        {t("leagues_title")}
                      </h3>
                      <div className="flex flex-col gap-2">
                        {LEAGUES_INFO.map((league, index) => {
                          const Icon = league.icon;
                          return (
                            <div
                              key={league.key}
                              className={cn(
                                "flex items-center gap-3 px-4 py-2.5 rounded-2xl border-2",
                                league.bg,
                              )}
                            >
                              <Icon
                                className={cn("h-5 w-5 shrink-0", league.color)}
                              />
                              <span className="font-black text-stone-700 dark:text-slate-200 text-sm">
                                {index + 1}. Liga{" "}
                                {t(`league_names.${league.key.toLowerCase()}`)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Section 3 — Dica de Ouro */}
                    <div className="rounded-[2rem] border-2 border-amber-200 bg-amber-50 p-5 flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-slate-900 border-2 border-amber-200 border-b-4 shadow-sm">
                        <Lightbulb className="h-5 w-5 text-amber-500 fill-amber-200" />
                      </div>
                      <div>
                        <p className="font-black text-amber-700 text-sm uppercase tracking-widest">
                          {t("pro_tip_title")}
                        </p>
                        <p className="text-stone-600 dark:text-slate-300 font-bold text-sm mt-1 leading-relaxed">
                          {t.rich("pro_tip_body", {
                            span: (chunks) => (
                              <span className="text-amber-600">{chunks}</span>
                            ),
                          })}
                        </p>
                      </div>
                    </div>

                    {/* CTA */}
                    <button
                      onClick={handleClose}
                      className="w-full py-4 rounded-2xl bg-emerald-500 border-2 border-emerald-400 border-b-6 border-b-emerald-700 text-white font-black text-sm uppercase tracking-widest hover:bg-emerald-600 active:translate-y-1 active:border-b-2 transition-all"
                    >
                      {t("cta")}
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body,
      )
    : null;

  return (
    <>
      {triggerEl}
      {portal}
    </>
  );
}

// ─── Helper ───────────────────────────────────────────────────────────────────
function RuleItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-slate-900 border-2 border-stone-200 dark:border-slate-800 shadow-sm mt-0.5">
        {icon}
      </div>
      <p className="text-stone-600 dark:text-slate-300 font-bold text-sm leading-relaxed pt-1">
        {text}
      </p>
    </div>
  );
}
