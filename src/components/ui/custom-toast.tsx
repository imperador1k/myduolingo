"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { CheckCircle2, X, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastVariant = "default" | "success" | "error";

type ToastState = {
    isOpen: boolean;
    message: string;
    variant: ToastVariant;
};

interface ToastFunction {
    (message: string): void;
    error: (message: string) => void;
    success: (message: string) => void;
}

type ToastContextType = {
    toast: ToastFunction;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function CustomToastProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<ToastState>({ 
        isOpen: false, 
        message: "", 
        variant: "default" 
    });
    
    // Auto-dismiss logic
    useEffect(() => {
        if (state.isOpen) {
            const timer = setTimeout(() => {
                setState((prev) => ({ ...prev, isOpen: false }));
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [state.isOpen]);

    const showToast = (message: string, variant: ToastVariant = "default") => {
        setState((prev) => ({ ...prev, isOpen: false, message: "" })); // Reset if already open
        setTimeout(() => setState({ isOpen: true, message, variant }), 50);
    };

    // Construct the composite toast function
    const toast: any = (msg: string) => showToast(msg, "default");
    toast.error = (msg: string) => showToast(msg, "error");
    toast.success = (msg: string) => showToast(msg, "success");

    const getIcon = () => {
        switch (state.variant) {
            case "success": return <CheckCircle2 className="w-5 h-5" />;
            case "error": return <AlertCircle className="w-5 h-5" />;
            default: return <Info className="w-5 h-5" />;
        }
    };

    const getIconClass = () => {
        switch (state.variant) {
            case "success": return "bg-green-100 text-green-500";
            case "error": return "bg-red-100 text-red-500";
            default: return "bg-sky-100 text-sky-500";
        }
    };

    return (
        <ToastContext.Provider value={{ toast: toast as ToastFunction }}>
            {children}
            {/* Premium App-like Custom Toast */}
            <div className={cn(
                "fixed bottom-6 left-1/2 -translate-x-1/2 z-toast transition-all duration-300 pointer-events-none",
                state.isOpen ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
            )}>
                <div className={cn(
                    "pointer-events-auto flex items-center gap-3 bg-white px-5 py-4 rounded-3xl shadow-lg border-2 border-slate-100 border-b-4 min-w-[320px]",
                    state.variant === "error" ? "border-b-red-200" : "border-b-slate-200"
                )}>
                    <div className={cn(
                        "flex items-center justify-center shrink-0 w-8 h-8 rounded-full",
                        getIconClass()
                    )}>
                        {getIcon()}
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
