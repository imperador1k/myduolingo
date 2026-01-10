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
        <div className={cn("flex w-full flex-col border-r h-full", activeUserId ? "hidden md:flex md:w-[300px]" : "w-full")}>
            <div className="p-4 border-b flex flex-col gap-4">
                <h1 className="text-xl font-bold text-slate-700">Mensagens</h1>

                {/* Search Input */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Pesquisar utilizador..."
                        className="w-full pl-9 pr-4 py-2 bg-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-sky-500 transition"
                    />
                    {/* Search Results Dropdown */}
                    {query && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden max-h-[300px] overflow-y-auto">
                            {loading ? (
                                <div className="p-4 flex justify-center text-slate-400">
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                </div>
                            ) : results.length === 0 ? (
                                <div className="p-4 text-center text-slate-400 text-sm">
                                    Nenhum utilizador encontrado.
                                </div>
                            ) : (
                                results.map((user) => (
                                    <div
                                        key={user.userId}
                                        onClick={() => onSelect(user.userId)}
                                        className="flex items-center gap-3 p-3 hover:bg-slate-50 cursor-pointer transition border-b border-slate-100 last:border-0"
                                    >
                                        <div className="h-8 w-8 rounded-full border border-slate-200 overflow-hidden flex-shrink-0">
                                            {user.userImageSrc ? (
                                                <img src={user.userImageSrc} alt={user.userName} className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center bg-slate-100 text-sm font-bold">
                                                    {user.userName[0]?.toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-slate-700 truncate">{user.userName}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                {conversations.length === 0 && !query && (
                    <div className="p-4 text-center text-slate-400">
                        Nenhuma conversa ainda.
                    </div>
                )}
                {conversations.map((conv) => (
                    <div
                        key={conv.partner.userId}
                        onClick={() => onSelect(conv.partner.userId)}
                        className={cn(
                            "flex items-center gap-3 p-4 hover:bg-slate-100 cursor-pointer transition border-b border-slate-50",
                            activeUserId === conv.partner.userId && "bg-sky-50 border-l-4 border-l-sky-500"
                        )}
                    >
                        <div className="h-12 w-12 rounded-full border-2 border-slate-200 overflow-hidden shrink-0">
                            {conv.partner.userImageSrc ? (
                                <img src={conv.partner.userImageSrc} alt={conv.partner.userName} className="h-full w-full object-cover" />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center bg-slate-100 text-xl">
                                    {conv.partner.userName[0]?.toUpperCase()}
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline mb-1">
                                <span className="font-bold text-slate-700 truncate">{conv.partner.userName}</span>
                                <span className="text-xs text-slate-400">
                                    {new Date(conv.lastMessage.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            <p className={cn("text-sm truncate", !conv.lastMessage.read && conv.lastMessage.senderId !== "me" ? "font-bold text-slate-800" : "text-slate-500")}>
                                {conv.lastMessage.senderId === "me" && "Tu: "} {conv.lastMessage.content}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
