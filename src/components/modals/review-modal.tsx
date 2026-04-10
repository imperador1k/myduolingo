"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useReviewModal } from "@/store/use-review-modal-store";
import { TactileStars } from "@/components/shared/tactile-stars";
import { upsertReviewAction } from "@/actions/user-reviews";
import { toast } from "sonner";
import { useUISounds } from "@/hooks/use-ui-sounds";

export const ReviewModal = () => {
    const { isOpen, close } = useReviewModal();
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [isPending, startTransition] = useTransition();
    const { playWhoosh, playStart, playPop } = useUISounds();

    const handleSubmit = () => {
        if (rating === 0) {
            toast.error("Por favor, escolhe uma classificação (estrelas).");
            return;
        }

        if (comment.trim().length < 5) {
            toast.error("Escreve um pouco mais sobre a tua experiência!");
            return;
        }

        startTransition(() => {
            upsertReviewAction(rating, comment).then((res) => {
                if (res.success) {
                    try { playStart(); } catch (e) {}
                    toast.success("Obrigado pelo teu feedback! Foi guardado com sucesso.");
                    setTimeout(() => {
                        close();
                        setRating(0);
                        setComment("");
                    }, 500);
                } else {
                    toast.error("Ocorreu um erro ao guardar a tua review.");
                }
            });
        });
    };

    const handleClose = () => {
        try { playWhoosh(); } catch(e) {}
        close();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="max-w-md w-[95vw] sm:w-full p-0 bg-transparent border-none shadow-none z-[150] outline-none [&>button]:hidden flex items-center justify-center">
                <DialogTitle className="sr-only">Avalia a tua experiência</DialogTitle>
                
                <div className="relative w-full bg-white border-2 border-stone-200 border-b-8 rounded-3xl p-6 sm:p-8 text-center flex flex-col items-center outline-none my-16">
                    
                    {/* Custom Close Button */}
                    <button 
                        onClick={handleClose}
                        className="absolute right-3 top-3 sm:right-4 sm:top-4 p-2 rounded-xl bg-stone-100 text-stone-400 hover:text-stone-600 hover:bg-stone-200 active:scale-95 transition-all z-50"
                    >
                        <X className="w-5 h-5 transition-transform hover:rotate-90 duration-300" />
                    </button>

                    {/* Mascot Head popping out the top */}
                    <div className="absolute -top-14 sm:-top-16 left-1/2 -translate-x-1/2 w-24 h-24 sm:w-28 sm:h-28 mix-blend-normal drop-shadow-xl z-[40] transition-transform hover:scale-105 hover:-translate-y-1 cursor-pointer bg-white rounded-full border-4 border-stone-200 border-b-0">
                        <Image 
                            src="/mascot.svg" 
                            alt="Marco Mascot" 
                            fill 
                            className="object-contain p-2 sm:p-3"
                        />
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-black text-stone-800 mt-10 mb-2 tracking-tight">
                        Estás a adorar a viagem?
                    </h2>
                    
                    <p className="text-stone-500 font-medium mb-6">
                        A tua opinião ajuda a construir o futuro da plataforma. O que achas até agora?
                    </p>

                    <div className="w-full flex justify-center mb-6 py-2 bg-stone-50 rounded-2xl border-2 border-stone-100">
                        <TactileStars value={rating} onChange={setRating} size="xl" />
                    </div>

                    <div className="w-full relative mb-6">
                        <textarea 
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            disabled={isPending}
                            placeholder="Adoro como a AI me ajuda a perceber..."
                            className="w-full bg-stone-50 border-2 border-stone-300 border-b-4 rounded-2xl p-4 text-stone-700 font-medium placeholder:text-stone-400 focus:outline-none focus:border-[#FFC800] focus:bg-yellow-50 focus:placeholder-yellow-600/50 transition-all resize-none min-h-[120px] text-left shadow-sm"
                        />
                        <div className="absolute top-0 right-0 w-8 h-8 rounded-tr-xl bg-gradient-to-bl from-white to-transparent opacity-50 pointer-events-none mix-blend-overlay"></div>
                    </div>

                    <Button 
                        disabled={isPending}
                        onClick={handleSubmit}
                        className="w-full bg-[#FFC800] text-yellow-950 border-2 border-yellow-500 border-b-8 rounded-2xl py-7 text-lg font-black uppercase tracking-widest hover:bg-[#ffdb4d] hover:border-yellow-400 active:border-b-2 active:translate-y-[6px] transition-all shadow-sm flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isPending ? (
                            <div className="w-6 h-6 border-4 border-yellow-900 border-t-transparent rounded-full animate-spin" />
                        ) : (
                            "Submeter Review"
                        )}
                    </Button>

                    <button 
                        disabled={isPending}
                        onClick={handleClose}
                        className="text-stone-400 font-bold mt-5 hover:text-stone-600 cursor-pointer active:scale-95 transition-all text-sm outline-none px-4 py-2 rounded-xl hover:bg-stone-50"
                    >
                        Agora não
                    </button>
                    
                </div>
            </DialogContent>
        </Dialog>
    );
};
