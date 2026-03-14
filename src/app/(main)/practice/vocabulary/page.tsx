import { redirect } from "next/navigation";
import { getWeakVocabulary } from "@/db/queries";
import { VocabularySprint } from "@/components/vocabulary-sprint";
import { Archive } from "lucide-react";
import Link from "next/link";

export const metadata = {
    title: "Treino de Vocabulário | MyDuolingo",
    description: "Treina as tuas palavras mais fracas no Sprint de Vocabulário.",
};

const VocabularyPracticePage = async () => {
    const weakWords = await getWeakVocabulary();

    if (weakWords.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <div className="bg-slate-100 p-8 rounded-full mb-6">
                    <Archive className="h-16 w-16 text-slate-400" />
                </div>
                <h2 className="text-2xl font-bold text-slate-700 mb-2">
                    Não tens palavras fracas!
                </h2>
                <p className="text-slate-500 max-w-sm mx-auto font-medium mb-6">
                    Volta ao modo aprender para caçares mais palavras e depois volta aqui para as treinares.
                </p>
                <Link
                    href="/vocabulary"
                    className="font-bold text-lg px-8 py-4 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white shadow-md transition-all active:scale-95"
                >
                    Voltar ao Cofre
                </Link>
            </div>
        );
    }

    return <VocabularySprint words={weakWords} />;
};

export default VocabularyPracticePage;
