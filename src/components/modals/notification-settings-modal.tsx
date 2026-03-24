"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Settings } from "lucide-react";
import { NotificationToggle } from "@/components/shared/notification-toggle";

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
            <DialogContent className="sm:max-w-md bg-white p-6 md:p-8 rounded-[2.5rem] border-2 border-stone-200 border-b-8 shadow-2xl overflow-hidden group">
                {/* Decorative background element */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-sky-50 rounded-full blur-3xl opacity-50" />
                
                <DialogHeader className="relative z-10">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[2rem] bg-sky-50 border-2 border-sky-100 border-b-4 mb-6 shadow-sm group-hover:bounce transition-all">
                        <Settings className="h-10 w-10 text-sky-500 animate-[spin_4s_linear_infinite]" />
                    </div>
                    <DialogTitle className="text-3xl font-black text-center text-stone-700 tracking-tight leading-tight uppercase">
                        Preferências
                    </DialogTitle>
                    <div className="h-1.5 w-12 bg-sky-400 rounded-full mx-auto my-4" />
                    <DialogDescription className="text-center text-stone-500 font-bold text-lg leading-relaxed px-4">
                        Personaliza a forma como comunicamos contigo.
                    </DialogDescription>
                </DialogHeader>

                <div className="mt-6 flex flex-col gap-4">
                    <NotificationToggle initialEnabled={initialEnabled} />
                </div>
            </DialogContent>
        </Dialog>
    );
};
