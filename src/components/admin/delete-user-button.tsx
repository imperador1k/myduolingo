"use client";

import { useTransition } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { deleteUserAction } from "@/actions/admin-users";
import { toast } from "sonner";

interface DeleteUserButtonProps {
    userId: string;
    userName: string;
}

export function DeleteUserButton({ userId, userName }: DeleteUserButtonProps) {
    const [isPending, startTransition] = useTransition();

    const handleDelete = () => {
        const confirmDelete = window.confirm(
            `ATENÇÃO!\n\nEstás prestes a eliminar DEFINITIVAMENTE o utilizador "${userName}" (${userId}).\n\nIsto destruirá a sua conta Clerk e apagará o seu XP, Atividade e Ligas. Tudo!\n\nQueres mesmo prosseguir?`
        );

        if (!confirmDelete) return;

        startTransition(() => {
            deleteUserAction(userId)
                .then((result) => {
                    if (result.success) {
                        toast.success("Utilizador purgado com sucesso de todos os sistemas.");
                    } else {
                        toast.error(result.error || "Operação abortada.");
                    }
                })
                .catch(() => toast.error("Falha ao comunicar com o servidor."));
        });
    };

    return (
        <button
            onClick={handleDelete}
            disabled={isPending}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50"
            title="Eliminar utilizador"
        >
            {isPending ? <Loader2 className="w-5 h-5 animate-spin text-red-500" /> : <Trash2 className="w-5 h-5" />}
        </button>
    );
}
