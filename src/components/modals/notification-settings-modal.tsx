"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from "@/components/ui/dialog";
import { Settings, X } from "lucide-react";
import { NotificationToggle } from "@/components/shared/notification-toggle";
import { cn } from "@/lib/utils";

type Props = {
    children: React.ReactNode;
    initialEnabled: boolean;
};

export const NotificationSettingsModal = ({ children, initialEnabled }: Props) => {
    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-white p-0 rounded-[2.5rem] border-2 border-stone-200 border-b-[12px] shadow-2xl overflow-hidden group [&>button:last-child]:hidden">
                {/* Custom Close Button */}
                <DialogClose className="absolute right-6 top-6 z-50 flex h-10 w-10 items-center justify-center rounded-xl bg-stone-100 text-stone-400 border-2 border-stone-200 border-b-4 hover:bg-stone-200 hover:text-stone-600 active:border-b-0 active:translate-y-1 transition-all focus:outline-none">
                    <X className="h-6 w-6 stroke-[3]" />
                </DialogClose>

                <div className="p-8 md:p-10">
                    {/* Decorative background element */}
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-50 rounded-full blur-3xl opacity-60" />
                    
                    <DialogHeader className="relative z-10">
                        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[2.5rem] bg-emerald-50 border-2 border-emerald-100 border-b-6 mb-8 shadow-sm group-hover:scale-110 transition-all duration-500">
                            <Settings className="h-12 w-12 text-emerald-500 animate-[spin_6s_linear_infinite]" />
                        </div>
                        <DialogTitle className="text-3xl md:text-4xl font-black text-center text-stone-700 tracking-tight leading-tight uppercase">
                            Preferências
                        </DialogTitle>
                        <div className="h-2 w-16 bg-emerald-400 rounded-full mx-auto my-6" />
                        <DialogDescription className="text-center text-stone-500 font-bold text-lg md:text-xl leading-relaxed px-2">
                            Personaliza a forma como o <span className="text-emerald-600">MyDuolingo</span> comunica contigo.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="mt-10 flex flex-col gap-6 relative z-10">
                        <div className="rounded-[2rem] border-2 border-stone-100 bg-stone-50/50 p-6 md:p-8">
                            <NotificationToggle initialEnabled={initialEnabled} />
                        </div>
                        
                        <p className="text-center text-stone-400 text-sm font-bold px-4">
                            Podes alterar estas definições a qualquer momento para pausar os lembretes.
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
