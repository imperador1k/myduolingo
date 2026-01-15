import { getPracticeHistory } from "@/actions/practice";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { ArrowLeft, Dumbbell } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HistoryList } from "./history-list";

export default async function HistoryPage() {
    const { userId } = await auth();

    if (!userId) {
        redirect("/learn");
    }

    const history = await getPracticeHistory();

    return (
        <div className="flex flex-col h-full bg-[#fcfcfc]">
            <div className="sticky top-0 bg-white z-10 p-6 pb-4 border-b border-slate-200">
                <div className="mx-auto max-w-[900px]">
                    <div className="flex items-center gap-4 mb-2">
                        <Link href="/practice">
                            <Button variant="ghost" size="sm" className="text-slate-500">
                                <ArrowLeft className="h-5 w-5 mr-2" />
                                Voltar
                            </Button>
                        </Link>
                    </div>
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold text-slate-700">Histórico de Prática</h1>
                        <div className="bg-slate-100 px-4 py-2 rounded-xl border border-slate-200">
                            <span className="text-sm font-bold text-slate-500 uppercase mr-2">Total:</span>
                            <span className="text-lg font-bold text-sky-500">{history.length} Sessões</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-auto p-6">
                <div className="mx-auto max-w-[900px]">
                    {history.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center text-slate-400">
                            <div className="bg-slate-100 p-8 rounded-full mb-6">
                                <Dumbbell className="h-16 w-16 opacity-50 text-slate-400" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-700 mb-2">Sem histórico ainda</h2>
                            <p className="text-slate-500 max-w-sm mx-auto">Complete exercícios de escrita ou conversação para começar a construir o seu histórico de aprendizado.</p>
                            <Link href="/practice" className="mt-6">
                                <Button size="lg" variant="primary">
                                    Começar a Praticar
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <HistoryList history={history} />
                    )}
                </div>
            </div>
        </div>
    );
}
