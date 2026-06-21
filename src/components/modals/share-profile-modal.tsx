"use client";

import { Copy, Share2, QrCode, X } from "lucide-react";
import QRCode from "react-qr-code";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { useCustomToast } from "@/components/ui/custom-toast";
import { useState, useEffect } from "react";

export const ShareProfileModal = ({
  children,
  userId,
}: {
  children: React.ReactNode;
  userId: string;
}) => {
  const { toast } = useCustomToast();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  const profileLink = `https://myduolingo.vercel.app/profile/${userId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(profileLink).then(() => {
      toast("Link copiado para a área de transferência!");
    });
  };

  const handleShare = () => {
    if (!navigator.share) {
      handleCopy();
      return;
    }
    navigator
      .share({
        title: "O meu perfil no MyDuolingo",
        text: "Vem aprender idiomas comigo e acompanha a minha ofensiva!",
        url: profileLink,
      })
      .catch((err) => {
        console.log("Share failed or cancelled:", err);
      });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-sm p-0 border-0 bg-transparent shadow-none [&>button]:hidden">
        <div className="relative bg-white border-2 border-stone-200 border-b-8 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col p-8 items-center text-center">
          {/* Custom Close Button */}
          <DialogClose className="absolute right-6 top-6 h-10 w-10 flex items-center justify-center rounded-2xl bg-stone-100 text-stone-400 hover:bg-stone-200 hover:text-stone-600 transition-colors active:scale-95 z-50">
            <X className="w-5 h-5" />
          </DialogClose>

          <DialogTitle className="sr-only">Partilhar Perfil</DialogTitle>

          <div className="w-20 h-20 bg-blue-100 text-[#1CB0F6] rounded-[2rem] flex items-center justify-center mb-6 rotate-[-5deg]">
            <QrCode className="w-10 h-10" />
          </div>

          <h2 className="text-2xl font-black text-stone-800 tracking-tight mb-2">
            Partilha o Teu Perfil!
          </h2>
          <p className="text-sm font-bold text-stone-400 mb-8">
            Vem aprender idiomas comigo e acompanha a minha ofensiva no
            MyDuolingo.
          </p>

          <div className="bg-white p-4 rounded-3xl border-2 border-stone-100 shadow-sm relative group mb-8">
            <div className="absolute inset-0 bg-blue-50 rounded-3xl opacity-0 group-hover:opacity-100 transition duration-500 -z-10" />
            <QRCode value={profileLink} size={180} level="M" fgColor="#444" />
          </div>

          <div className="text-center w-full mb-8">
            <p className="text-[13px] font-bold text-stone-500 truncate max-w-full bg-stone-100 border-2 border-stone-200 rounded-2xl py-3 px-4 select-all">
              {profileLink}
            </p>
          </div>

          <div className="flex w-full gap-3">
            <button
              onClick={handleCopy}
              className="flex-1 flex flex-col items-center justify-center gap-1 bg-stone-100 text-stone-500 font-bold border-b-4 border-stone-200 py-3 rounded-2xl hover:bg-stone-200 transition-all active:translate-y-1 active:border-b-0"
            >
              <Copy className="h-5 w-5" />
              <span className="text-[10px] uppercase tracking-widest">
                Copiar
              </span>
            </button>
            <button
              onClick={handleShare}
              className="flex-[2] flex items-center justify-center gap-2 bg-[#1CB0F6] text-white font-bold border-b-4 border-[#1899D6] py-3 rounded-2xl hover:bg-[#1899D6] transition-all active:translate-y-1 active:border-b-0"
            >
              <Share2 className="h-5 w-5" />
              <span className="text-sm uppercase tracking-widest">
                Partilhar
              </span>
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
