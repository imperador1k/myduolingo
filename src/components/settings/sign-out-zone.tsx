"use client";

import { useTranslations } from "next-intl";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { LogOut } from "lucide-react";
import { SignOutButton, useClerk } from "@clerk/nextjs";

export const SignOutZone = ({ trigger }: { trigger?: React.ReactNode }) => {
  const t = useTranslations("settings.sign_out");
  const { signOut } = useClerk();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleClose = () => {
    setIsModalOpen(false);
  };

  const modalContent = (
    <div className="fixed inset-0 z-modal flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity"
        onClick={handleClose}
      />

      {/* Modal Content */}
      <div className="z-modal w-[92%] max-w-sm bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 border-b-8 rounded-[2rem] p-6 sm:p-8 text-center shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Decorative background glowing circle */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-sky-100 rounded-full opacity-50 blur-xl"></div>

        <div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-sky-50 border-4 border-white mb-6 shadow-sm">
          <LogOut
            className="h-10 w-10 text-sky-500 translate-x-1"
            strokeWidth={2.5}
          />
        </div>

        <h2 className="text-2xl font-black text-slate-800 mb-3 tracking-tight">
          {t("title")}
        </h2>

        <p className="text-slate-500 dark:text-slate-400 font-medium mb-8 leading-relaxed">
          {t("description")}
        </p>

        <div className="flex flex-col gap-3">
          <SignOutButton>
            <button className="w-full bg-rose-500 text-white font-black uppercase tracking-wider py-4 rounded-2xl border-2 border-rose-600 border-b-4 hover:bg-rose-400 active:translate-y-1 active:border-b-0 transition-all">
              {t("confirm")}
            </button>
          </SignOutButton>
          <button
            onClick={handleClose}
            className="w-full bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-800 border-b-4 hover:bg-slate-50 dark:bg-slate-950 hover:text-slate-600 active:translate-y-1 active:border-b-0 transition-all"
          >
            {t("cancel")}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {trigger ? (
        <div
          onClick={() => setIsModalOpen(true)}
          className="cursor-pointer w-full sm:w-auto h-11 sm:h-12 block"
        >
          {trigger}
        </div>
      ) : (
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full md:w-auto mx-auto block bg-rose-500 hover:bg-rose-400 text-white border-2 border-b-4 border-rose-600 rounded-2xl px-8 py-4 font-black uppercase tracking-wider active:translate-y-[2px] active:border-b-2 transition-all text-center"
        >
          {t("trigger_label")}
        </button>
      )}

      {isModalOpen && mounted && createPortal(modalContent, document.body)}
    </>
  );
};
