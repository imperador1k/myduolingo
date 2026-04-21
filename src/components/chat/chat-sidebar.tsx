"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { onSearchUsers } from "@/actions/user-actions";
import { Search, Loader2, Users, UserPlus, BadgeCheck } from "lucide-react";
import { CreateGroupModal } from "@/components/modals/create-group-modal";
import { NewChatModal } from "@/components/modals/new-chat-modal";
import { useGlobalPresence } from "@/components/providers/global-presence-provider";

type Conversation = {
    id: string;
    name: string | null;
    isGroup: boolean;
    partner: {
        userId: string;
        userName: string;
        userImageSrc: string | null;
        isPro?: boolean;
    } | null;
    participants: {
        userId: string;
        userName: string | null;
        userImageSrc: string | null;
        isPro?: boolean;
    }[];
    lastMessage: {
        id: number;
        content: string;
        createdAt: Date;
        senderId: string;
        read: boolean;
    } | null;
    unreadCount: number;
    updatedAt: Date;
};

type Props = {
    conversations: Conversation[];
};

export const ChatSidebar = ({ conversations }: Props) => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const activeConversationId = searchParams.get("conversationId");
    const { isPartnerOnline } = useGlobalPresence();

    const [query, setQuery] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
    const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);

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

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Handle selecting an existing conversation
    const onSelectConversation = (id: string) => {
        const params = new URLSearchParams(searchParams);
        params.set("conversationId", id);
        params.delete("userId"); // Clean up old param if exists
        router.push(`${pathname}?${params.toString()}`);
    };

    // Handle selecting a user from search (Nova Mensagem)
    const onSelectUser = async (userId: string) => {
        setQuery("");
        setResults([]);
        
        // Intelligent DM creation (Server Action will find existing if it exists)
        try {
            const { createConversation } = await import("@/actions/messages");
            const conversationId = await createConversation([userId], false);
            
            const params = new URLSearchParams(searchParams);
            params.set("conversationId", conversationId);
            router.push(`${pathname}?${params.toString()}`);
        } catch (error) {
            console.error("Erro ao iniciar conversa:", error);
        }
    };

    return (
        <div className={cn("flex w-full flex-col bg-stone-50/50 h-full", activeConversationId ? "hidden md:flex md:w-[380px]" : "w-full")}>
            <CreateGroupModal isOpen={isGroupModalOpen} onClose={() => setIsGroupModalOpen(false)} />
            <NewChatModal isOpen={isNewChatModalOpen} onClose={() => setIsNewChatModalOpen(false)} />
            
            <div className="p-6 border-b-2 border-stone-100 bg-white flex flex-col gap-6 z-20 relative">
                <h1 className="text-2xl font-black text-stone-800 tracking-tight">Conversas</h1>

                {/* Tactile Action Buttons Row */}
                <div className="flex gap-3">
                    <button 
                        onClick={() => setIsNewChatModalOpen(true)}
                        className="flex-1 bg-[#58CC02] hover:bg-[#4eb801] active:translate-y-1 active:border-b-0 text-white font-black text-sm uppercase tracking-widest py-3 rounded-xl border-b-4 border-[#46a302] transition-all flex items-center justify-center gap-2 shadow-sm"
                    >
                        <UserPlus className="w-4 h-4" />
                        NOVA MENSAGEM
                    </button>
                    <button 
                        onClick={() => setIsGroupModalOpen(true)}
                        className="bg-white text-[#1CB0F6] border-2 border-blue-200 border-b-4 rounded-xl px-4 flex items-center justify-center hover:bg-blue-50 active:translate-y-1 active:border-b-0 transition-all shadow-sm"
                    >
                        <Users className="w-5 h-5" />
                    </button>
                </div>

                {/* Search Input */}
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
                    <input
                        id="chat-search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Pesquisar..."
                        className="w-full pl-11 pr-4 py-3 bg-stone-100 rounded-2xl text-[15px] font-bold text-stone-700 placeholder:text-stone-400 border-2 border-stone-200 border-b-[4px] outline-none focus:bg-white focus:border-[#1CB0F6] transition-all"
                    />
                    {/* Search Results Dropdown */}
                    {query && (
                        <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.15)] border-2 border-stone-200 border-b-[6px] z-50 overflow-hidden max-h-[300px] overflow-y-auto">
                            {loading ? (
                                <div className="p-6 flex justify-center text-[#1CB0F6]">
                                    <Loader2 className="h-6 w-6 animate-spin" />
                                </div>
                            ) : results.length === 0 ? (
                                <div className="p-6 text-center text-stone-400 font-bold text-sm">
                                    Nenhum utilizador encontrado.
                                </div>
                            ) : (
                                results.map((user) => (
                                    <div
                                        key={user.userId}
                                        onClick={() => onSelectUser(user.userId)}
                                        className="flex items-center gap-4 p-4 hover:bg-stone-50 active:bg-stone-100 cursor-pointer transition border-b-2 border-stone-100 last:border-b-0"
                                    >
                                        <div className="h-10 w-10 rounded-[12px] border-2 border-stone-200 overflow-hidden flex-shrink-0 bg-stone-100">
                                            {user.userImageSrc ? (
                                                <img src={user.userImageSrc} alt={user.userName} className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center text-sm font-black text-stone-400">
                                                    {user.userName[0]?.toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[15px] font-black text-stone-800 truncate">{user.userName}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 pb-[120px] md:pb-4 flex flex-col gap-3 scrollbar-hide">
                {conversations.length === 0 && !query && (
                    <div className="p-8 text-center bg-white rounded-2xl border-2 border-stone-200 border-b-4 mt-4">
                        <span className="text-4xl">📭</span>
                        <h3 className="text-lg font-black text-stone-700 mt-4">Vazio</h3>
                        <p className="text-sm font-bold text-stone-400 mt-2">Pesquisa amigos para começar.</p>
                    </div>
                )}
                {conversations.map((conv: Conversation) => {
                    const isActive = activeConversationId === conv.id;
                    const displayName = conv.isGroup ? conv.name : conv.partner?.userName;
                    
                    return (
                        <div
                            key={conv.id}
                            onClick={() => onSelectConversation(conv.id)}
                            className={cn(
                                "flex items-start gap-4 p-4 rounded-2xl border-2 border-b-4 cursor-pointer transition-all hover:-translate-y-1 active:translate-y-1 active:border-b-2",
                                isActive 
                                    ? "bg-blue-50 border-[#1CB0F6] border-b-[#1CB0F6] text-stone-800 shadow-md shadow-blue-100/50" 
                                    : "bg-white border-stone-200 hover:bg-stone-50"
                            )}
                        >
                            {/* Avatar Logic */}
                            <div className={cn(
                                "h-14 w-14 shrink-0 relative flex items-center justify-center",
                            )}>
                                {conv.isGroup ? (
                                    <div className="flex -space-x-4 items-center h-full w-full justify-center">
                                        {conv.participants.slice(0, 2).map((p, idx) => (
                                            <div 
                                                key={p.userId} 
                                                className={cn(
                                                    "h-10 w-10 rounded-full border-2 border-white overflow-hidden bg-stone-100 shadow-sm relative shrink-0",
                                                    idx === 1 && "z-10"
                                                )}
                                            >
                                                {p.userImageSrc ? (
                                                    <img src={p.userImageSrc} alt={p.userName || ""} className="h-full w-full object-cover" />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center text-[10px] font-black text-stone-400">
                                                        {p.userName?.[0] || "?"}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                        {conv.participants.length > 2 && (
                                            <div className="h-10 w-10 rounded-full border-2 border-white bg-stone-50 flex items-center justify-center text-[10px] font-black text-stone-500 z-20 shadow-sm shrink-0">
                                                +{conv.participants.length - 2}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className={cn(
                                        "h-14 w-14 rounded-[16px] border-2 overflow-hidden shrink-0 flex items-center justify-center shadow-sm",
                                        isActive ? "border-[#1CB0F6] bg-white" : "border-stone-200 bg-stone-100"
                                    )}>
                                        {conv.partner?.userImageSrc ? (
                                            <img src={conv.partner.userImageSrc} alt={conv.partner.userName} className="h-full w-full object-cover rounded-[14px]" />
                                        ) : (
                                            <span className={cn("text-xl font-black", isActive ? "text-[#1CB0F6]" : "text-stone-400")}>
                                                {conv.partner?.userName?.[0]?.toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                )}
                                {!conv.isGroup && conv.partner && isPartnerOnline(conv.partner.userId) && (
                                    <span className="w-3.5 h-3.5 bg-[#58CC02] rounded-full border-2 border-white absolute -bottom-0.5 -right-0.5 z-10 shadow-sm"></span>
                                )}
                            </div>
                            
                            <div className="flex-1 min-w-0 flex flex-col pt-0.5">
                                <div className="flex justify-between items-baseline mb-1">
                                    <span className={cn("truncate text-[15px] font-black flex items-center", isActive ? "text-[#1CB0F6]" : "text-stone-800")}>
                                        <span className="truncate">{displayName}</span>
                                        {!conv.isGroup && conv.partner?.isPro && (
                                            <BadgeCheck className="h-4 w-4 text-amber-500 fill-amber-300 ml-1 shrink-0 inline-block" aria-hidden="true" />
                                        )}
                                    </span>
                                    <span className={cn("text-xs font-bold", isActive ? "text-[#1CB0F6]/70" : "text-stone-400")}>
                                        {mounted && conv.lastMessage ? new Date(conv.lastMessage.createdAt).toLocaleDateString() : (mounted ? "Novo" : "")}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center pr-1 mt-1">
                                    <p className={cn(
                                        "text-[13px] font-bold truncate mr-3", 
                                        isActive ? "text-stone-600" : (conv.unreadCount > 0 && conv.lastMessage?.senderId !== "me" ? "text-stone-900" : "text-stone-400")
                                    )}>
                                        {conv.lastMessage ? (
                                            <>
                                                {conv.lastMessage.senderId === "me" && "Tu: "} {conv.lastMessage.content}
                                            </>
                                        ) : (
                                            "Começa uma conversa!"
                                        )}
                                    </p>
                                    {conv.unreadCount > 0 && (
                                        <div className={cn(
                                            "flex h-6 min-w-[24px] items-center justify-center rounded-xl px-2 text-[11px] font-black shadow-sm",
                                            isActive ? "bg-[#1CB0F6] text-white" : "bg-[#1CB0F6] text-white"
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
