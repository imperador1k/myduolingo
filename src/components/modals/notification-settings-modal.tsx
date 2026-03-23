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
            <DialogContent className="sm:max-w-md bg-white p-6 rounded-3xl border-0 shadow-2xl">
                <DialogHeader>
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 mb-4">
                        <Settings className="h-8 w-8 text-slate-500" />
                    </div>
                    <DialogTitle className="text-2xl font-black text-center text-slate-700">
                        Preferências
                    </DialogTitle>
                    <DialogDescription className="text-center text-slate-500 text-base">
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
