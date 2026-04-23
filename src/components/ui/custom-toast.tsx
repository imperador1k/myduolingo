"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { CheckCircle2, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastState = {
    isOpen: boolean;
    message: string;
};

type ToastContextType = {
    toast: (message: string) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function CustomToastProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<ToastState>({ isOpen: false, message: "" });
    
    // Auto-dismiss logic
    useEffect(() => {
        if (state.isOpen) {
            const timer = setTimeout(() => {
                setState((prev) => ({ ...prev, isOpen: false }));
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [state.isOpen]);

    const showToast = (message: string) => {
        setState({ isOpen: false, message: "" }); // Reset if already open
        setTimeout(() => setState({ isOpen: true, message }), 50);
    };

    return (
        <ToastContext.Provider value={{ toast: showToast }}>
            {children}
            {/* Premium App-like Custom Toast */}
            <div className={cn(
                "fixed bottom-6 left-1/2 -translate-x-1/2 z-toast transition-all duration-300 pointer-events-none",
                state.isOpen ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
            )}>
                <div className="pointer-events-auto flex items-center gap-3 bg-white px-5 py-4 rounded-3xl shadow-lg border-2 border-slate-100 border-b-4 border-b-slate-200 min-w-[320px]">
                    <div className="flex items-center justify-center shrink-0 w-8 h-8 rounded-full bg-green-100 text-green-500">
                        <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <p className="flex-1 font-bold text-slate-700">{state.message}</p>
                    <button 
                        onClick={() => setState(prev => ({ ...prev, isOpen: false }))}
                        className="p-1 -mr-2 text-slate-400 hover:text-rose-500 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </ToastContext.Provider>
    );
}

export const useCustomToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error("useCustomToast must be used within CustomToastProvider");
    return context;
};
