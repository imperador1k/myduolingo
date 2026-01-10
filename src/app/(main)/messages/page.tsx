
import { getMessages } from "@/db/queries";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default async function MessagesPage() {
    const messages = await getMessages();

    return (
        <div className="flex flex-col gap-6 p-6 pb-20">
            <h1 className="text-2xl font-bold text-slate-700">Mensagens</h1>
            <div className="flex flex-col gap-2">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500">
                        <p className="text-4xl mb-4">✉️</p>
                        <p className="font-bold">Caixa de entrada vazia</p>
                        <p className="text-sm text-slate-400">Ninguém te enviou mensagens ainda.</p>
                    </div>
                ) : (
                    messages.map((m: any) => (
                        <div key={m.id} className="rounded-xl border-2 p-4 bg-white hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="h-10 w-10 rounded-full bg-slate-100 overflow-hidden border">
                                    {m.sender && m.sender.userImageSrc ? (
                                        <img src={m.sender.userImageSrc} alt="" className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center bg-slate-100 text-xl">🧑‍🎓</div>
                                    )}
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-bold text-slate-700">{m.sender ? m.sender.userName : "Desconhecido"}</span>
                                    <span className="text-xs text-slate-400">
                                        {new Date(m.createdAt).toLocaleDateString("pt-PT", {
                                            day: 'numeric',
                                            month: 'short',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </span>
                                </div>
                            </div>
                            <p className="text-slate-600 pl-14">{m.content}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
