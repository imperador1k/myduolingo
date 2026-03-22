"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash, Loader2 } from "lucide-react";
import { deleteLesson } from "@/actions/admin";

type Props = {
    lessonId: number;
    lessonTitle: string;
};

export const DeleteLessonButton = ({ lessonId, lessonTitle }: Props) => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        const confirmed = window.confirm(
            `Tens a certeza que queres eliminar a lição "${lessonTitle}"?\n\nEsta ação apagará todos os desafios e opções associados.`
        );

        if (!confirmed) return;

        setLoading(true);
        try {
            await deleteLesson(lessonId);
            router.refresh();
        } catch (error) {
            console.error("Failed to delete lesson:", error);
            alert("Erro ao eliminar a lição. Tenta novamente.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleDelete}
            disabled={loading}
            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Eliminar lição"
        >
            {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
                <Trash className="w-5 h-5" />
            )}
        </button>
    );
};
