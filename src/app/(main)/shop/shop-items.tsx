"use client";

import { useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Zap,
  Shield,
  Snowflake,
  Heart,
  Infinity,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  onRefillHearts,
  onBuyOneHeart,
  onBuyXpBoost,
  onBuyHeartShield,
  onBuyStreakFreeze,
} from "@/actions/user-progress";
import { useUISounds } from "@/hooks/use-ui-sounds";
import { PurchaseSuccessModal } from "@/components/modals/purchase-success-modal";
import { usePurchaseStore } from "@/store/use-purchase-store";
import { useProModalStore } from "@/store/use-pro-modal-store";
import { useTranslations } from "next-intl";
import useSound from "use-sound";
import { haptics } from "@/lib/haptics";

type Props = {
  hearts: number;
  points: number;
  xpBoostLessons: number;
  heartShields: number;
  streakFreezes: number;
  isPro: boolean;
};

export const ShopItems = ({
  hearts,
  points,
  xpBoostLessons,
  heartShields,
  streakFreezes,
  isPro,
}: Props) => {
  const t = useTranslations("shop");
  const router = useRouter();
  const {
    isOpen,
    data: popupData,
    open: openPopup,
    close: closePopupStore,
  } = usePurchaseStore();
  const { openModal: openProModal } = useProModalStore();

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<any>(null);

  const { playWhoosh, playReward } = useUISounds();
  const [playChaching] = useSound("/sounds/chaching.mp3", { volume: 0.5 });

  const closePopup = () => {
    closePopupStore();
    router.refresh();
  };

  const initiatePurchase = (
    action: () => Promise<any>,
    popupData: any,
    errorMapping: Record<string, string>,
    cost: number,
    itemName: string,
  ) => {
    playWhoosh();
    haptics.light();
    setConfirmModal({
      show: true,
      action,
      popupData,
      errorMapping,
      cost,
      itemName,
    });
  };

  const confirmPurchase = () => {
    if (!confirmModal) return;
    const { action, popupData } = confirmModal;
    setError(null);
    startTransition(() => {
      action()
        .then((result: any) => {
          if (result && "message" in result && !result.success) {
            haptics.error();
            setError(result.message);
          } else {
            haptics.success();
            playChaching();
            playReward();
            setTimeout(() => openPopup(popupData), 100);
          }
        })
        .catch((err: any) => {
          console.error(err);
          setError(t("error_processing"));
        })
        .finally(() => setConfirmModal(null));
    });
  };

  const canBuyOneHeart = points >= 20 && hearts < 5;
  const canRefill = points >= 100 && hearts === 0;
  const canBuyXpBoost = points >= 150;
  const canBuyHeartShield = points >= 100;
  const canBuyStreakFreeze = points >= 300;

  return (
    <>
      {confirmModal &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-above-modal flex items-center justify-center bg-stone-900/60 backdrop-blur-md animate-in fade-in duration-300 px-4">
            <div className="w-full max-w-[420px] rounded-[2.5rem] bg-white dark:bg-slate-900 p-8 md:p-10 shadow-2xl animate-in zoom-in-95 duration-300 border-2 border-stone-200 dark:border-slate-800 border-b-8 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-50 rounded-full blur-3xl opacity-50" />
              <div className="relative z-10">
                <h2 className="mb-4 text-3xl font-black text-stone-700 dark:text-slate-200 tracking-tight text-center leading-tight">
                  {t("confirm_purchase")}
                </h2>
                <p className="mb-10 text-stone-500 dark:text-slate-400 font-bold text-center text-lg md:text-xl leading-relaxed">
                  {t.rich("spend_xp_confirm", {
                    cost: confirmModal.cost,
                    itemName: confirmModal.itemName,
                    span: (chunks) => (
                      <span className="font-black text-amber-500 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200 shadow-sm">
                        {chunks}
                      </span>
                    ),
                    itemSpan: (chunks) => (
                      <span className="font-black text-stone-700 dark:text-slate-200 block mt-2 text-2xl uppercase tracking-tight">
                        {chunks}
                      </span>
                    ),
                  })}
                </p>
                <div className="flex flex-col gap-4">
                  <button
                    onClick={confirmPurchase}
                    disabled={isPending}
                    className="w-full h-16 md:h-20 bg-[#58cc02] text-white text-xl font-black rounded-2xl border-2 border-transparent border-b-8 border-b-[#46a302] hover:bg-[#61da02] active:border-b-0 active:translate-y-2 active:mb-[-8px] transition-all uppercase tracking-widest flex items-center justify-center gap-3 shadow-sm disabled:opacity-50"
                  >
                    {isPending ? t("processing") : t("buy")}
                  </button>
                  <button
                    onClick={() => setConfirmModal(null)}
                    className="w-full h-14 md:h-16 bg-white dark:bg-slate-900 text-stone-400 dark:text-slate-500 dark:text-slate-400 text-lg font-black rounded-2xl border-2 border-stone-200 dark:border-slate-800 border-b-6 hover:bg-stone-50 dark:bg-slate-950 hover:text-stone-600 dark:text-slate-300 active:border-b-0 active:translate-y-1 active:mb-[-4px] transition-all uppercase tracking-widest flex items-center justify-center shadow-sm"
                  >
                    {t("cancel")}
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
      <PurchaseSuccessModal
        isOpen={isOpen}
        onClose={closePopup}
        icon={popupData?.icon || ""}
        title={popupData?.title || ""}
        description={popupData?.description || ""}
        color={popupData?.color || "bg-sky-100"}
      />
      <div className="space-y-6">
        {error && (
          <div className="rounded-2xl bg-rose-100 p-4 text-center sm:text-lg font-bold text-rose-600 shadow-sm border-2 border-rose-200 animate-in slide-in-from-top-4">
            ❌ {t("error_prefix", { error })}
          </div>
        )}
        <div className="flex flex-col w-full">
          {!isPro && hearts < 5 && (
            <div className="flex w-full flex-col md:flex-row md:items-center justify-between gap-4 py-6 border-b-2 border-stone-100 dark:border-slate-800 last:border-b-0 group">
              <div className="flex items-center gap-6">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[1.2rem] border-2 border-b-4 border-rose-200 bg-rose-50 shadow-inner group-hover:-translate-y-1 transition-transform">
                  <Heart className="h-10 w-10 fill-rose-500 text-rose-500 drop-shadow-sm" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold text-stone-700 dark:text-slate-200">
                    {t("heart_title")}
                  </span>
                  <span className="text-sm text-stone-500 dark:text-slate-400 font-medium mt-1 leading-snug md:max-w-xs">
                    {t("heart_desc")}
                  </span>
                </div>
              </div>
              <button
                disabled={!canBuyOneHeart || isPending}
                onClick={() =>
                  initiatePurchase(
                    onBuyOneHeart,
                    {
                      icon: "❤️",
                      title: t("heart_title"),
                      description: t("heart_success"),
                      color: "bg-rose-100",
                    },
                    { not_enough_xp: t("need_xp", { amount: 20 }) },
                    20,
                    t("heart_title"),
                  )
                }
                className={cn(
                  "w-full md:w-auto shrink-0 h-14 min-w-[180px] px-6 font-black rounded-xl text-base uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                  canBuyOneHeart
                    ? "bg-[#58cc02] text-white border-2 border-transparent border-b-4 border-b-[#46a302] hover:bg-[#61da02] active:border-b-0 active:translate-y-1 active:mb-[-4px] shadow-sm"
                    : "bg-stone-200 dark:bg-slate-700 text-stone-400 dark:text-slate-500 dark:text-slate-400 border-2 border-transparent border-b-4 border-b-stone-300 dark:border-b-slate-700 pointer-events-none",
                )}
              >
                <span>{t("buy")}</span>
                <span
                  className={cn(
                    "text-lg drop-shadow-sm font-black flex items-center",
                    canBuyOneHeart
                      ? "text-amber-300"
                      : "text-stone-300 grayscale",
                  )}
                >
                  ⚡ 20
                </span>
              </button>
            </div>
          )}
          {!isPro && hearts === 0 && (
            <div className="flex w-full flex-col md:flex-row md:items-center justify-between gap-4 py-6 border-b-2 border-stone-100 dark:border-slate-800 last:border-b-0 group">
              <div className="flex items-center gap-6">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[1.2rem] border-2 border-b-4 border-amber-200 bg-amber-50 shadow-inner group-hover:-translate-y-1 transition-transform">
                  <Heart className="h-10 w-10 text-amber-500 fill-amber-500 drop-shadow-sm" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold text-stone-700 dark:text-slate-200">
                    {t("refill_title")}
                  </span>
                  <span className="text-sm text-stone-500 dark:text-slate-400 font-medium mt-1 leading-snug md:max-w-xs">
                    {t("refill_desc")}
                  </span>
                </div>
              </div>
              <button
                disabled={!canRefill || isPending}
                onClick={() =>
                  initiatePurchase(
                    onRefillHearts,
                    {
                      icon: "💖",
                      title: t("refill_success_title"),
                      description: t("refill_success"),
                      color: "bg-rose-100",
                    },
                    { not_enough_xp: t("need_xp", { amount: 100 }) },
                    100,
                    t("refill_title"),
                  )
                }
                className={cn(
                  "w-full md:w-auto shrink-0 h-14 min-w-[180px] px-6 font-black rounded-xl text-base uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                  canRefill
                    ? "bg-amber-500 text-white border-2 border-transparent border-b-4 border-b-amber-600 hover:bg-amber-400 active:border-b-0 active:translate-y-1 active:mb-[-4px] shadow-sm"
                    : "bg-stone-200 dark:bg-slate-700 text-stone-400 dark:text-slate-500 dark:text-slate-400 border-2 border-transparent border-b-4 border-b-stone-300 dark:border-b-slate-700 pointer-events-none",
                )}
              >
                <span>{t("buy")}</span>
                <span
                  className={cn(
                    "text-lg drop-shadow-sm font-black flex items-center",
                    canRefill ? "text-amber-200" : "text-stone-300 grayscale",
                  )}
                >
                  ⚡ 100
                </span>
              </button>
            </div>
          )}
          {!isPro && hearts === 5 && (
            <div className="flex w-full flex-col md:flex-row md:items-center justify-between gap-4 py-6 border-b-2 border-stone-100 dark:border-slate-800 last:border-b-0 opacity-70 grayscale-[20%]">
              <div className="flex items-center gap-6">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[1.2rem] border-2 border-b-4 border-stone-200 dark:border-slate-800 bg-stone-50 dark:bg-slate-950 shadow-inner">
                  <Heart className="h-10 w-10 fill-rose-300 text-rose-300" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold text-stone-700 dark:text-slate-200">
                    {t("hearts_full")}
                  </span>
                  <span className="text-sm text-stone-500 dark:text-slate-400 font-medium mt-1 leading-snug md:max-w-xs">
                    {t("hearts_full_desc")}
                  </span>
                </div>
              </div>
              <div className="w-full md:w-auto shrink-0 h-14 min-w-[180px] px-6 font-black rounded-xl text-sm uppercase tracking-widest flex items-center justify-center bg-stone-200 dark:bg-slate-700 text-stone-400 dark:text-slate-500 dark:text-slate-400 border-2 border-transparent border-b-4 border-b-stone-300 dark:border-b-slate-700 cursor-not-allowed">
                {t("maxed")}
              </div>
            </div>
          )}
          {isPro && (
            <div className="flex w-full flex-col md:flex-row md:items-center justify-between gap-4 py-6 border-b-2 border-stone-100 dark:border-slate-800 last:border-b-0">
              <div className="flex items-center gap-6">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[1.2rem] border-2 border-b-4 border-rose-200 bg-rose-50 shadow-inner">
                  <Infinity className="h-10 w-10 text-rose-500 stroke-[3]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold text-stone-700 dark:text-slate-200">
                    {t("infinite_hearts")}
                  </span>
                  <span className="text-sm text-stone-500 dark:text-slate-400 font-medium mt-1 leading-snug md:max-w-xs">
                    {t("pro_desc")}
                  </span>
                </div>
              </div>
              <div className="w-full md:w-auto shrink-0 h-14 min-w-[180px] px-6 font-black rounded-xl text-sm uppercase tracking-widest flex items-center justify-center bg-rose-500 text-white border-2 border-transparent border-b-4 border-b-rose-700 shadow-sm cursor-default">
                {t("pro_active")}
              </div>
            </div>
          )}
          <div className="flex w-full flex-col md:flex-row md:items-center justify-between gap-4 py-6 border-b-2 border-stone-100 dark:border-slate-800 last:border-b-0 group">
            <div className="flex items-center gap-6">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[1.2rem] border-2 border-b-4 border-purple-200 bg-purple-50 shadow-inner group-hover:-translate-y-1 transition-transform">
                <Zap className="h-10 w-10 text-purple-500 fill-purple-300 drop-shadow-sm" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-stone-700 dark:text-slate-200">
                  {t("xp_boost")}
                </span>
                <span className="text-sm text-stone-500 dark:text-slate-400 font-medium mt-1 leading-snug md:max-w-xs">
                  {t("xp_boost_desc")}
                </span>
              </div>
            </div>
            <button
              disabled={!canBuyXpBoost || isPending}
              onClick={() =>
                initiatePurchase(
                  onBuyXpBoost,
                  {
                    icon: "⚡",
                    title: t("xp_boost_success_title"),
                    description: t("xp_boost_success_desc"),
                    color: "bg-purple-100",
                  },
                  { not_enough_xp: t("need_xp", { amount: 150 }) },
                  150,
                  t("xp_boost"),
                )
              }
              className={cn(
                "w-full md:w-auto shrink-0 h-14 min-w-[180px] px-6 font-black rounded-xl text-base uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                canBuyXpBoost
                  ? "bg-purple-500 text-white border-2 border-transparent border-b-4 border-b-purple-700 hover:bg-purple-400 active:border-b-0 active:translate-y-1 active:mb-[-4px] shadow-sm"
                  : "bg-stone-200 dark:bg-slate-700 text-stone-400 dark:text-slate-500 dark:text-slate-400 border-2 border-transparent border-b-4 border-b-stone-300 dark:border-b-slate-700 pointer-events-none",
              )}
            >
              <span>{t("buy")}</span>
              <span
                className={cn(
                  "text-lg drop-shadow-sm font-black flex items-center",
                  canBuyXpBoost ? "text-amber-300" : "text-stone-300 grayscale",
                )}
              >
                ⚡ 150
              </span>
            </button>
          </div>
          <div className="flex w-full flex-col md:flex-row md:items-center justify-between gap-4 py-6 border-b-2 border-stone-100 dark:border-slate-800 last:border-b-0 group">
            <div className="flex items-center gap-6">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[1.2rem] border-2 border-b-4 border-sky-200 bg-sky-50 shadow-inner group-hover:-translate-y-1 transition-transform">
                <Shield className="h-10 w-10 text-sky-500 fill-sky-300 drop-shadow-sm" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-stone-700 dark:text-slate-200">
                  {t("shield")}
                </span>
                <span className="text-sm text-stone-500 dark:text-slate-400 font-medium mt-1 leading-snug md:max-w-xs">
                  {t("shield_desc")}
                </span>
              </div>
            </div>
            <button
              disabled={!canBuyHeartShield || isPending}
              onClick={() =>
                initiatePurchase(
                  onBuyHeartShield,
                  {
                    icon: "🛡️",
                    title: t("shield_success_title"),
                    description: t("shield_success"),
                    color: "bg-sky-100",
                  },
                  { not_enough_xp: t("need_xp", { amount: 100 }) },
                  100,
                  t("shield"),
                )
              }
              className={cn(
                "w-full md:w-auto shrink-0 h-14 min-w-[180px] px-6 font-black rounded-xl text-base uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                canBuyHeartShield
                  ? "bg-sky-500 text-white border-2 border-transparent border-b-4 border-b-sky-600 hover:bg-sky-400 active:border-b-0 active:translate-y-1 active:mb-[-4px] shadow-sm"
                  : "bg-stone-200 dark:bg-slate-700 text-stone-400 dark:text-slate-500 dark:text-slate-400 border-2 border-transparent border-b-4 border-b-stone-300 dark:border-b-slate-700 pointer-events-none",
              )}
            >
              <span>{t("buy")}</span>
              <span
                className={cn(
                  "text-lg drop-shadow-sm font-black flex items-center",
                  canBuyHeartShield
                    ? "text-amber-300"
                    : "text-stone-300 grayscale",
                )}
              >
                ⚡ 100
              </span>
            </button>
          </div>
          <div className="flex w-full flex-col md:flex-row md:items-center justify-between gap-4 py-6 border-b-2 border-stone-100 dark:border-slate-800 last:border-b-0 group">
            <div className="flex items-center gap-6">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[1.2rem] border-2 border-b-4 border-cyan-200 bg-cyan-50 shadow-inner group-hover:-translate-y-1 transition-transform">
                <Snowflake className="h-10 w-10 text-cyan-500 fill-cyan-300 drop-shadow-sm" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-stone-700 dark:text-slate-200">
                  {t("freeze")}
                </span>
                <span className="text-sm text-stone-500 dark:text-slate-400 font-medium mt-1 leading-snug md:max-w-xs">
                  {t("freeze_desc")}
                </span>
              </div>
            </div>
            <button
              disabled={!canBuyStreakFreeze || isPending}
              onClick={() =>
                initiatePurchase(
                  onBuyStreakFreeze,
                  {
                    icon: "❄️",
                    title: t("freeze_success_title"),
                    description: t("freeze_success"),
                    color: "bg-cyan-100",
                  },
                  { not_enough_xp: t("need_xp", { amount: 300 }) },
                  300,
                  t("freeze"),
                )
              }
              className={cn(
                "w-full md:w-auto shrink-0 h-14 min-w-[180px] px-6 font-black rounded-xl text-base uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                canBuyStreakFreeze
                  ? "bg-cyan-500 text-white border-2 border-transparent border-b-4 border-b-cyan-600 hover:bg-cyan-400 active:border-b-0 active:translate-y-1 active:mb-[-4px] shadow-sm"
                  : "bg-stone-200 dark:bg-slate-700 text-stone-400 dark:text-slate-500 dark:text-slate-400 border-2 border-transparent border-b-4 border-b-stone-300 dark:border-b-slate-700 pointer-events-none",
              )}
            >
              <span>{t("buy")}</span>
              <span
                className={cn(
                  "text-lg drop-shadow-sm font-black flex items-center",
                  canBuyStreakFreeze
                    ? "text-amber-300"
                    : "text-stone-300 grayscale",
                )}
              >
                ⚡ 300
              </span>
            </button>
          </div>
        </div>
        <div className="pt-10">
          <div
            onClick={isPro ? () => router.push("/settings") : openProModal}
            className={cn(
              "relative flex w-full cursor-pointer flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden rounded-[2rem] border-2 border-b-[6px] p-6 md:p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md active:scale-95 group",
              isPro
                ? "border-rose-200 bg-rose-50 dark:bg-rose-950/30 dark:border-rose-900"
                : "border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-900",
            )}
          >
            <div className="relative z-10 flex items-center gap-6">
              <div
                className={cn(
                  "flex h-16 w-16 shrink-0 items-center justify-center rounded-[1rem] border-2 border-b-4",
                  isPro
                    ? "bg-rose-100 border-rose-200 dark:bg-rose-900/30 dark:border-rose-800"
                    : "bg-amber-100 border-amber-200 dark:bg-amber-900/30 dark:border-amber-800",
                )}
              >
                <Sparkles
                  className={cn(
                    "h-8 w-8",
                    isPro
                      ? "text-rose-500 fill-rose-500"
                      : "text-amber-500 fill-amber-500",
                  )}
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xl md:text-2xl font-black text-stone-800 dark:text-slate-100 tracking-tight">
                  {isPro ? t("pro_subscription") : t("ad_free_title")}
                </span>
                <span className="text-sm font-bold leading-snug mt-1 text-stone-500 dark:text-slate-400">
                  {isPro ? t("pro_thanks") : t("ad_free_desc")}
                </span>
              </div>
            </div>
            <button
              className={cn(
                "relative z-10 w-full md:w-auto shrink-0 h-12 px-6 rounded-xl font-black uppercase tracking-widest border-2 border-transparent border-b-4 shadow-sm text-sm flex items-center justify-center transition-transform group-hover:scale-105",
                isPro
                  ? "bg-rose-500 text-white border-b-rose-700 hover:bg-rose-400"
                  : "bg-amber-500 text-white border-b-amber-700 hover:bg-amber-400",
              )}
            >
              {isPro ? t("manage_plan") : t("learn_more")}
            </button>
          </div>
        </div>
        <div className="mt-12 rounded-[2.5rem] border-2 border-amber-300 border-b-[10px] bg-amber-100 p-10 text-center shadow-sm relative overflow-hidden transition-transform hover:scale-[1.01]">
          <div className="absolute top-0 left-0 w-48 h-48 bg-amber-200 rounded-full blur-3xl opacity-50 -z-10 -translate-x-10 -translate-y-10" />
          <p className="font-black tracking-widest text-amber-600 uppercase flex items-center justify-center gap-2 mb-2 text-sm md:text-base">
            💡 {t("gain_xp")}
          </p>
          <p className="text-sm md:text-base text-amber-700/80 font-bold max-w-lg mx-auto leading-relaxed">
            {t.rich("xp_tip", {
              span: (chunks) => (
                <span className="text-purple-600 font-black">{chunks}</span>
              ),
            })}
          </p>
        </div>
      </div>
    </>
  );
};
