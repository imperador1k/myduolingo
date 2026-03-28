"use client";

import { useFormState, useFormStatus } from "react-dom";
import { authenticateVault } from "./actions";
import { ShieldAlert } from "lucide-react";

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            className="w-full mt-4 bg-sky-500 border-b-4 border-sky-600 hover:bg-sky-400 active:translate-y-[2px] active:border-b-0 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-xl rounded-2xl py-4 uppercase tracking-wider transition-all"
        >
            {pending ? "A VERIFICAR..." : "DESBLOQUEAR COFRE"}
        </button>
    );
}

const initialState = {
    error: ""
};

export default function AdminLoginVault() {
    const [state, formAction] = useFormState(authenticateVault, initialState);  

    return (
        <div className="min-h-screen bg-[#fbf9f8] flex flex-col items-center justify-center p-6 selection:bg-sky-500 selection:text-white relative overflow-hidden font-sans">
            <div className="max-w-md w-full flex flex-col items-center gap-8 z-10">
                {/* Header Dinâmico */}
                <div className="flex flex-col items-center text-center gap-3">
                    <div className="w-20 h-20 bg-stone-100 border-4 border-stone-200 border-b-8 rounded-3xl flex items-center justify-center shadow-sm">
                        <ShieldAlert className="w-10 h-10 text-sky-500" strokeWidth={3} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-stone-800 tracking-tight uppercase">
                            Acesso Restrito
                        </h1>
                        <p className="text-stone-400 font-extrabold uppercase tracking-widest text-sm mt-1">
                            Painel do Administrador
                        </p>
                    </div>
                </div>

                {/* A Bento Box Gamificada */}
                <div className="bg-white border-2 border-stone-200 border-b-8 rounded-3xl p-8 w-full">
                    <form action={formAction} className="flex flex-col gap-6">      
                        <div className="flex flex-col gap-2">
                            <label htmlFor="password" className="text-stone-400 font-extrabold uppercase text-[11px] tracking-widest ml-1">
                                Código de Segurança (Sudo)
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                placeholder="••••••••"
                                className="bg-stone-100 border-2 border-stone-200 border-b-4 rounded-2xl text-center text-3xl tracking-[0.3em] font-black text-stone-700 p-4 focus:outline-none focus:border-sky-500 focus:bg-white transition-colors placeholder:text-stone-300"
                            />
                        </div>

                        {state?.error && (
                            <div className="bg-red-100 border-2 border-red-200 border-b-4 rounded-2xl p-4 text-center">
                                <span className="text-red-500 font-black text-sm uppercase tracking-wider">
                                    {state.error}
                                </span>
                            </div>
                        )}

                        <SubmitButton />
                    </form>
                </div>
            </div>
        </div>
    );
}