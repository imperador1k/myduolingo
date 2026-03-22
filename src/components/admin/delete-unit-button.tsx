"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash, Loader2 } from "lucide-react";
import { deleteUnit } from "@/actions/admin";

type Props = {
    unitId: number;
    unitTitle: string;
};

export const DeleteUnitButton = ({ unitId, unitTitle }: Props) => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        const confirmed = window.confirm(
            `Tens a certeza que queres eliminar a unidade "${unitTitle}" e todo o seu conteúdo?\n\nEsta ação apagará todas as lições e desafios associados.`
        );

        if (!confirmed) return;

        setLoading(true);
        try {
            await deleteUnit(unitId);
            router.refresh();
        } catch (error) {
            console.error("Failed to delete unit:", error);
            alert("Erro ao eliminar a unidade. Tenta novamente.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleDelete}
            disabled={loading}
            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Eliminar unidade"
        >
            {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
                <Trash className="w-5 h-5" />
            )}
        </button>
    );
};
