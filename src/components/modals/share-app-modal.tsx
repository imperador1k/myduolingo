"use client";

import { useShareModalStore } from "@/store/use-share-modal-store";
import { shareService } from "@/lib/share";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { X, Send } from "lucide-react";
import { DuoAnimationLottie } from "@/components/ui/lottie-animation";

export const ShareAppModal = () => {
  const { isOpen, closeModal } = useShareModalStore();
  const t = useTranslations("share");

  if (!isOpen) return null;

  const onShare = async () => {
    closeModal();
    await shareService.shareApp(t("share_title"), t("share_text"));
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-modal bg-black/70 backdrop-blur-md animate-in fade-in duration-300"
        onClick={closeModal}
      />

      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 z-above-modal w-[92%] max-w-sm -translate-x-1/2 -translate-y-1/2 animate-in zoom-in-95 duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]">
        <div className="relative bg-white dark:bg-slate-900 border-2 border-[#e5e7eb] border-b-8 rounded-3xl shadow-2xl overflow-hidden flex flex-col pt-12 pb-8 px-6 text-center">
          {/* Close button */}
          <button
            onClick={closeModal}
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-xl bg-stone-50 dark:bg-slate-950 text-stone-400 dark:text-slate-500 transition-all hover:bg-stone-100 dark:hover:bg-slate-800 active:scale-90"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Visual Warning */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative mb-4">
              <DuoAnimationLottie className="w-32 h-32" />
            </div>
            <h2 className="text-2xl font-black text-stone-800 dark:text-slate-100 tracking-tight leading-tight">
              {t("modal_title")}
            </h2>
            <p className="text-stone-500 dark:text-slate-400 font-bold text-sm mt-3 px-2">
              {t("modal_description")}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 w-full">
            <Button
              onClick={onShare}
              variant="primary"
              className="bg-[#1CB0F6] hover:bg-[#1899d6] text-white border-b-4 border-[#147bb0] active:border-b-0 py-6 rounded-2xl text-lg font-black tracking-widest flex items-center gap-3"
            >
              <Send className="w-6 h-6" />
              {t("button_share")}
            </Button>

            <button
              onClick={closeModal}
              className="text-stone-400 dark:text-slate-500 font-bold uppercase tracking-widest text-sm py-4 hover:text-stone-600 dark:hover:text-slate-300 active:scale-95 transition-all mt-2"
            >
              {t("button_later")}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
