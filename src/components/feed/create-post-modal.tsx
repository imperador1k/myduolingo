"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, AlertTriangle, CheckCircle2 } from "lucide-react";
import { submitUGCPost } from "@/actions/creator";
import { HappyStarLottie } from "@/components/ui/lottie-animation";
import { cn } from "@/lib/utils";

type CreatePostModalProps = {
  isOpen: boolean;
  onClose: () => void;
  targetLanguage: string;
};

export function CreatePostModal({
  isOpen,
  onClose,
  targetLanguage,
}: CreatePostModalProps) {
  const [content, setContent] = useState("");
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    status?: string;
  } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isPending) return;

    setResult(null);
    startTransition(async () => {
      const res = await submitUGCPost(content, targetLanguage);
      setResult(res);
      if (res.success && res.status === "APPROVED") {
        setContent("");
        // Automatically close after a delay on success
        setTimeout(() => {
          setResult(null);
          onClose();
        }, 2500);
      }
    });
  };

  const handleClose = () => {
    if (!isPending) {
      setResult(null);
      setContent("");
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden relative"
            >
              {/* Header */}
              <div className="bg-sky-500 p-8 pt-10 text-white text-center relative overflow-hidden">
                <button
                  onClick={handleClose}
                  disabled={isPending}
                  className="absolute right-4 top-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors disabled:opacity-50 z-10"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Lottie Mascot */}
                <div className="relative z-10 flex justify-center -mb-2">
                  <HappyStarLottie className="w-24 h-24 drop-shadow-xl" />
                </div>

                <div className="relative z-10">
                  <h2 className="text-2xl font-black tracking-tight mt-2">
                    Criar Curiosidade
                  </h2>
                  <p className="text-sky-100 text-sm mt-2 font-medium max-w-[250px] mx-auto">
                    A nossa Inteligência Artificial vai rever e aprovar o teu
                    post!
                  </p>
                </div>

                {/* Decorative background circle */}
                <div className="absolute top-[-50%] left-[-20%] w-[140%] h-[140%] bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
              </div>

              {/* Form */}
              <div className="p-6">
                {result ? (
                  <div
                    className={cn(
                      "p-4 rounded-2xl flex flex-col items-center text-center gap-3",
                      result.success && result.status === "APPROVED"
                        ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600"
                        : result.status === "PENDING"
                          ? "bg-amber-50 dark:bg-amber-900/20 text-amber-600"
                          : "bg-rose-50 dark:bg-rose-900/20 text-rose-600",
                    )}
                  >
                    {result.success && result.status === "APPROVED" ? (
                      <CheckCircle2 className="w-12 h-12" />
                    ) : (
                      <AlertTriangle className="w-12 h-12" />
                    )}
                    <p className="font-bold">{result.message}</p>
                    {(!result.success || result.status !== "APPROVED") && (
                      <button
                        onClick={() => setResult(null)}
                        className="mt-2 text-sm font-bold underline"
                      >
                        Tentar novamente
                      </button>
                    )}
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                      <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Ex: Sabias que a Torre Eiffel pode ser 15 cm mais alta no verão?"
                        rows={4}
                        disabled={isPending}
                        maxLength={500}
                        className="w-full bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-slate-700 dark:text-slate-200 outline-none focus:border-sky-500 transition-colors resize-none disabled:opacity-50"
                      />
                      <div className="text-right text-xs font-medium text-slate-400 mt-1">
                        {content.length}/500
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isPending || content.trim().length < 10}
                      className="w-full bg-sky-500 hover:bg-sky-400 text-white rounded-2xl py-4 font-black flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 shadow-lg shadow-sky-500/30"
                    >
                      {isPending ? (
                        <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <Send className="w-5 h-5" /> Enviar para Moderação
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
