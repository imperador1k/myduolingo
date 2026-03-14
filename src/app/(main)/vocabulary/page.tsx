import { getUserVocabulary } from "@/db/queries";
import { Archive } from "lucide-react";
import { VocabularyDashboard } from "./dashboard";

export default async function VocabularyPage() {
    const vocabularyList = await getUserVocabulary();

    return (
        <div className="flex flex-col gap-y-8 p-4 md:p-8 max-w-[1056px] mx-auto w-full">
            <div className="flex items-center gap-4 border-b-2 border-slate-200 pb-4">
                <div className="p-3 bg-emerald-100 rounded-2xl shadow-sm">
                    <Archive className="h-8 w-8 text-emerald-500" />
                </div>
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-800">
                        O Meu Cofre
                    </h1>
                    <p className="text-slate-500 font-medium">
                        Dá a volta aos cartões para veres a resposta!
                    </p>
                </div>
            </div>

            <VocabularyDashboard initialWords={vocabularyList} />
        </div>
    );
}
