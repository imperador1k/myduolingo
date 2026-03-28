"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { onSearchUsers } from "@/actions/user-actions";
import { Search, Loader2 } from "lucide-react";

type Conversation = {
    partner: {
        userId: string;
        userName: string;
        userImageSrc: string | null;
    };
    lastMessage: {
        id: number;
        content: string;
        createdAt: Date;
        read: boolean;
        senderId: string;
    };
    unreadCount: number;
};

type Props = {
    conversations: Conversation[];
};

export const ChatSidebar = ({ conversations }: Props) => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const activeUserId = searchParams.get("userId");

    const [query, setQuery] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchUsers = async () => {
            if (!query) {
                setResults([]);
                return;
            }
            setLoading(true);
            const data = await onSearchUsers(query);
            setResults(data);
            setLoading(false);
        };

        const timeoutId = setTimeout(fetchUsers, 500);
        return () => clearTimeout(timeoutId);
    }, [query]);

    const onSelect = (userId: string) => {
        const params = new URLSearchParams(searchParams);
        params.set("userId", userId);
        router.push(`${pathname}?${params.toString()}`);
        setQuery(""); // Clear search after selection
        setResults([]);
    };

    return (
        <div className={cn("flex w-full flex-col bg-slate-50 h-full", activeUserId ? "hidden md:flex md:w-[360px]" : "w-full")}>
            <div className="p-4 md:p-5 border-b-2 border-slate-200 bg-white flex flex-col gap-4 md:gap-5 z-20 shadow-sm relative">
                <h1 className="text-xl font-black text-slate-700 uppercase tracking-widest hidden md:block">Inbox</h1>
                <h1 className="text-xl font-black text-slate-700 uppercase tracking-widest md:hidden mt-2 text-center">Mensagens</h1>

                {/* Massive Tactile Action Button */}
                <button className="w-full bg-[#58cc02] hover:bg-[#46a302] active:bg-[#46a302] text-white font-black text-[15px] uppercase tracking-widest py-3.5 rounded-2xl border-2 border-transparent border-b-[6px] hover:border-b-[6px] active:border-b-0 active:translate-y-[6px] transition-all flex items-center justify-center gap-2 shadow-sm" style={{ borderBottomColor: '#46a302' }}>
                    Nova Mensagem
                </button>

                {/* Search Input */}
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 font-bold" />
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Pesquisar utilizador..."
                        className="w-full pl-11 pr-4 py-3 bg-slate-100 rounded-2xl text-[15px] font-bold text-slate-700 placeholder:text-slate-400 border-2 border-slate-200 border-b-[4px] outline-none focus:bg-white focus:border-sky-400 transition-all"
                    />
                    {/* Search Results Dropdown */}
                    {query && (
                        <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.15)] border-2 border-slate-200 border-b-[6px] z-50 overflow-hidden max-h-[300px] overflow-y-auto">
                            {loading ? (
                                <div className="p-6 flex justify-center text-sky-400">
                                    <Loader2 className="h-6 w-6 animate-spin" />
                                </div>
                            ) : results.length === 0 ? (
                                <div className="p-6 text-center text-slate-400 font-bold text-sm">
                                    Nenhum utilizador encontrado.
                                </div>
                            ) : (
                                results.map((user) => (
                                    <div
                                        key={user.userId}
                                        onClick={() => onSelect(user.userId)}
                                        className="flex items-center gap-4 p-4 hover:bg-slate-50 active:bg-slate-100 cursor-pointer transition border-b-2 border-slate-100 last:border-b-0"
                                    >
                                        <div className="h-10 w-10 rounded-[12px] border-2 border-slate-200 overflow-hidden flex-shrink-0 bg-slate-100">
                                            {user.userImageSrc ? (
                                                <img src={user.userImageSrc} alt={user.userName} className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center text-sm font-black text-slate-400">
                                                    {user.userName[0]?.toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[15px] font-black text-slate-700 truncate">{user.userName}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 pb-[120px] md:pb-4 flex flex-col gap-3 custom-scrollbar">
                {conversations.length === 0 && !query && (
                    <div className="p-8 text-center bg-white rounded-2xl border-2 border-slate-200 border-b-4 mt-4">
                        <span className="text-4xl">📭</span>
                        <h3 className="text-lg font-black text-slate-700 mt-4">Caixa de Entrada Vazia</h3>
                        <p className="text-sm font-bold text-slate-400 mt-2">Começa uma nova conversa pesquisando amigos.</p>
                    </div>
                )}
                {conversations.filter(conv => conv.partner).map((conv) => {
                    const isActive = activeUserId === conv.partner.userId;
                    
                    return (
                        <div
                            key={conv.partner.userId}
                            onClick={() => onSelect(conv.partner.userId)}
                            className={cn(
                                "flex items-start gap-4 p-4 rounded-2xl border-2 border-b-4 cursor-pointer transition-all hover:-translate-y-1 active:translate-y-1 active:border-b-2",
                                isActive 
                                    ? "bg-sky-400 border-sky-500 border-b-sky-600 text-white shadow-md shadow-sky-200/50" 
                                    : "bg-white border-slate-200 hover:bg-slate-50"
                            )}
                        >
                            <div className={cn(
                                "h-14 w-14 rounded-[16px] border-2 overflow-hidden shrink-0 flex items-center justify-center shadow-sm",
                                isActive ? "border-sky-300 bg-sky-300" : "border-slate-200 bg-slate-100"
                            )}>
                                {conv.partner.userImageSrc ? (
                                    <img src={conv.partner.userImageSrc} alt={conv.partner.userName} className="h-full w-full object-cover rounded-[14px]" />
                                ) : (
                                    <span className={cn("text-xl font-black", isActive ? "text-sky-600" : "text-slate-400")}>
                                        {conv.partner.userName?.[0]?.toUpperCase()}
                                    </span>
                                )}
                            </div>
                            
                            <div className="flex-1 min-w-0 flex flex-col pt-0.5">
                                <div className="flex justify-between items-baseline mb-1">
                                    <span className={cn("truncate text-[15px] font-black", isActive ? "text-white" : "text-slate-700")}>
                                        {conv.partner.userName}
                                    </span>
                                    <span className={cn("text-xs font-bold", isActive ? "text-sky-100" : "text-slate-400")}>
                                        {new Date(conv.lastMessage.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center pr-1 mt-1">
                                    <p className={cn(
                                        "text-[13px] font-bold truncate mr-3", 
                                        isActive ? "text-sky-100" : (conv.unreadCount > 0 && conv.lastMessage.senderId !== "me" ? "text-slate-800" : "text-slate-400")
                                    )}>
                                        {conv.lastMessage.senderId === "me" && "Tu: "} {conv.lastMessage.content}
                                    </p>
                                    {conv.unreadCount > 0 && (
                                        <div className={cn(
                                            "flex h-6 min-w-[24px] items-center justify-center rounded-xl px-2 text-[11px] font-black shadow-sm",
                                            isActive ? "bg-white text-sky-500" : "bg-sky-500 text-white"
                                        )}>
                                            {conv.unreadCount > 99 ? "99+" : conv.unreadCount}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
