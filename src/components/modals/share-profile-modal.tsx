"use client";

import { Copy, Share2, QrCode } from "lucide-react";
import QRCode from "react-qr-code";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useCustomToast } from "@/components/ui/custom-toast";
import { useState, useEffect } from "react";

export const ShareProfileModal = ({ children, username }: { children: React.ReactNode; username: string }) => {
    const { toast } = useCustomToast();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) return null;

    const profileLink = `https://myduolingo.vercel.app/profile/${username}`;

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
        navigator.share({
            title: 'O meu perfil no MyDuolingo',
            text: 'Vem aprender idiomas comigo e acompanha a minha ofensiva!',
            url: profileLink,
        }).catch(err => {
            console.log("Share failed or cancelled:", err);
        });
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="max-w-md p-0 border-0 bg-transparent shadow-none gap-0">
                <div className="bg-white rounded-[2rem] border-b-4 border-slate-200 shadow-xl overflow-hidden flex flex-col items-center">
                    <DialogHeader className="w-full bg-sky-50 p-6 border-b-2 border-sky-100 flex flex-col items-center justify-center">
                        <DialogTitle className="text-2xl font-bold text-sky-500 flex items-center gap-2">
                            <QrCode className="w-6 h-6" /> Partilha o Teu Perfil!
                        </DialogTitle>
                    </DialogHeader>

                    <div className="flex flex-col items-center justify-center gap-6 p-8 w-full">
                        <div className="bg-white p-4 rounded-xl border-2 border-slate-100 shadow-sm relative group">
                            <div className="absolute inset-0 bg-sky-50 rounded-xl opacity-0 group-hover:opacity-100 transition duration-500 -z-10" />
                            <QRCode
                                value={profileLink}
                                size={200}
                                level="M"
                                fgColor="#334155" // slate-700
                            />
                        </div>

                        <div className="text-center w-full">
                            <p className="text-sm font-bold text-slate-700 truncate max-w-[280px] mx-auto bg-slate-50 border-2 border-slate-100 rounded-lg py-2 px-4 select-all">
                                {profileLink}
                            </p>
                        </div>

                        <div className="flex w-full gap-4 mt-2">
                            <button
                                onClick={handleCopy}
                                className="flex-1 flex flex-col items-center justify-center gap-2 bg-slate-100 text-slate-600 font-bold border-2 border-slate-200 py-3 px-4 rounded-2xl hover:bg-slate-200 transition-all active:scale-95"
                            >
                                <Copy className="h-5 w-5" />
                                <span className="text-xs uppercase tracking-wider">Copiar</span>
                            </button>
                            <button
                                onClick={handleShare}
                                className="flex-1 flex flex-col items-center justify-center gap-2 bg-sky-500 text-white font-bold border-b-4 border-sky-600 py-3 px-4 rounded-2xl hover:bg-sky-400 hover:border-b-sky-500 transition-all active:translate-y-1 active:border-b-0"
                            >
                                <Share2 className="h-5 w-5" />
                                <span className="text-xs uppercase tracking-wider">Partilhar</span>
                            </button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
