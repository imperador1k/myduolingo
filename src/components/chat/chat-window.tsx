"use client";

import { sendMessage, markAsRead, toggleReaction } from "@/actions/messages";
import { useRef, useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { 
    Send, 
    Image as ImageIcon, 
    X, 
    FileText, 
    Download, 
    ChevronLeft, 
    CheckCheck, 
    Users, 
    Loader2,
    Reply,
    Smile
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { useRealtimeMessages } from "./use-realtime-messages";
import { toast } from "sonner";
import { EmptyLottie } from "@/app/(main)/messages/empty-lottie";
import Link from "next/link";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { UploadButton } from "./upload-button";
import { GifSelector } from "./gif-selector";
import { motion, AnimatePresence } from "framer-motion";
import { useLongPress } from "@/hooks/use-long-press";
import dynamic from "next/dynamic";
import { MessageItem } from "./message-item";

type Props = {
    userId: string;
    conversationId: string;
    partner: {
        userId: string;
        userName: string;
        userImageSrc: string | null;
    } | null;
    participants: {
        userId: string;
        userName: string | null;
        userImageSrc: string | null;
    }[];
    isGroup?: boolean;
    groupName?: string | null;
    initialMessages: any[];
};

export const ChatWindow = ({ userId, conversationId, partner, participants, isGroup, groupName, initialMessages }: Props) => {
    const { messages, addOptimisticMessage, isPartnerOnline, isPartnerTyping, trackTyping } = useRealtimeMessages(initialMessages, userId, conversationId);
    const bottomRef = useRef<HTMLDivElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const formRef = useRef<HTMLFormElement>(null);
    const [showGifPicker, setShowGifPicker] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isSending, setIsSending] = useState(false);
    const [replyingTo, setReplyingTo] = useState<any>(null);
    const [activeMenuId, setActiveMenuId] = useState<number | null>(null);
    const [mounted, setMounted] = useState(false);
    const [highlightedId, setHighlightedId] = useState<number | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Emojis for quick reactions
    const QUICK_EMOJIS = ["❤️", "🔥", "😂", "🙌", "✅"];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setActiveMenuId(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (trackTyping) {
            trackTyping(true);
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => {
                trackTyping(false);
            }, 2000);
        }
    };

    const scrollToBottom = (force = false) => {
        if (!scrollRef.current || !bottomRef.current) return;

        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 200;

        if (force || isNearBottom) {
            bottomRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    // Special initial scroll
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (bottomRef.current) {
                bottomRef.current.scrollIntoView({ behavior: 'auto' });
            }
        }, 100);
        return () => clearTimeout(timeoutId);
    }, [conversationId]);

    // Handle auto-scrolling when messages change
    useEffect(() => {
        if (messages.length === 0) return;
        
        const lastMessage = messages[messages.length - 1];
        const isFromMe = lastMessage?.senderId === userId;
        
        // Only force scroll if the message was sent by me
        // Otherwise, only scroll if the user is already near the bottom
        scrollToBottom(isFromMe);
        
        // Mark as read when messages change or conversation opens
        if (conversationId) {
            markAsRead(conversationId).catch(console.error);
        }
    }, [messages.length, conversationId, userId]); // Depend on messages.length to avoid scrolling on reactions

    const handleSubmit = async (formData: FormData) => {
        const content = formData.get("content")?.toString();
        if (!content || isSending) return;
        
        setIsSending(true);
        const optimisticId = `temp-${Date.now()}`;
        
        // Optimistic UI update
        addOptimisticMessage({
            id: optimisticId,
            senderId: userId,
            conversationId,
            content: content,
            type: "text",
            createdAt: new Date(),
            read: false,
        });

        formRef.current?.reset();
        if (trackTyping) trackTyping(false);
        setTimeout(scrollToBottom, 50);
        
        try {
            await sendMessage(conversationId, content, undefined, replyingTo?.id);
            setReplyingTo(null);
        } catch (error) {
            toast.error("Erro ao enviar mensagem");
        } finally {
            setIsSending(false);
        }
    };

    const onReaction = async (messageId: number, emoji: string) => {
        try {
            await toggleReaction(messageId, emoji);
            setActiveMenuId(null);
        } catch (error) {
            toast.error("Erro ao reagir");
        }
    };

    const handleSendGif = async (gif: any) => {
        const gifUrl = gif.images.fixed_height.url;
        setShowGifPicker(false);
        
        const optimisticId = `temp-${Date.now()}`;
        addOptimisticMessage({
            id: optimisticId,
            senderId: userId,
            conversationId,
            content: gifUrl,
            type: "image",
            createdAt: new Date(),
            read: false,
        });
        setTimeout(scrollToBottom, 50);

        try {
            await sendMessage(conversationId, gifUrl, gifUrl); // gif as image
        } catch (error) {
            toast.error("Erro ao enviar GIF");
        }
    };

    const handleUploadComplete = async (url: string, type: "image" | "file", fileName: string) => {
        const optimisticId = `temp-${Date.now()}`;
        addOptimisticMessage({
            id: optimisticId,
            senderId: userId,
            conversationId,
            content: url,
            type: type,
            fileName: fileName,
            createdAt: new Date(),
            read: false,
        });
        setTimeout(scrollToBottom, 50);

        try {
            await sendMessage(conversationId, url, type === "image" ? url : undefined);
        } catch (error) {
            toast.error("Erro no upload");
        }
    };

    const isGif = (content: string) => content.includes("giphy.com/media");

    const truncate = (text: string, length: number = 60) => {
        if (!text) return "";
        return text.length > length ? text.substring(0, length) + "..." : text;
    };
    
    const formatTimestamp = (dateString: string | Date) => {
        if (!mounted) return "";
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const scrollToMessage = (messageId: number) => {
        const element = document.getElementById(`msg-${messageId}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setHighlightedId(messageId);
            setTimeout(() => setHighlightedId(null), 2000);
        } else {
            toast.info("Mensagem original já não está visível");
        }
    };

    const lastMyMessageIndex = [...messages].reverse().findIndex((m) => m.senderId === userId);
    const actualLastMyMessageIndex = lastMyMessageIndex !== -1 ? messages.length - 1 - lastMyMessageIndex : -1;

    return (
        <div className="flex flex-col h-full w-full bg-white relative">
            {/* Image Modal */}
            <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
                <DialogContent className="max-w-5xl w-full h-full sm:h-auto sm:max-h-[95vh] p-0 bg-transparent border-none shadow-none flex items-center justify-center overflow-visible [&>button]:hidden">
                    <DialogTitle className="sr-only">Visualizador de Imagem</DialogTitle>
                    {selectedImage && (
                        <div className="relative flex flex-col items-center justify-center w-full h-full p-4 sm:p-10 animate-in fade-in zoom-in duration-300">
                            <div className="relative max-w-full flex justify-center">
                                <div className="absolute -top-12 right-0 sm:-right-6 sm:-top-6 flex gap-3 z-[60]">
                                    <a 
                                        href={selectedImage} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="bg-slate-900/60 hover:bg-slate-900/80 backdrop-blur-xl text-white p-3.5 rounded-full transition-all border-2 border-white/20 shadow-2xl hover:scale-110 active:scale-95"
                                    >
                                        <Download className="w-5 h-5 sm:w-6 sm:h-6" />
                                    </a>
                                    <button 
                                        onClick={() => setSelectedImage(null)}
                                        className="bg-slate-900/60 hover:bg-rose-500/90 backdrop-blur-xl text-white p-3.5 rounded-full transition-all border-2 border-white/20 shadow-2xl hover:scale-110 active:scale-95"
                                    >
                                        <X className="w-5 h-5 sm:w-6 sm:h-6" />
                                    </button>
                                </div>
                                <div className="relative max-w-full rounded-[24px] sm:rounded-[32px] overflow-hidden border-4 border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.5)] bg-slate-900/50 backdrop-blur-sm">
                                    <img
                                        src={selectedImage}
                                        alt="Enlarged media"
                                        className="w-full h-auto object-contain max-h-[75dvh] sm:max-h-[80vh]"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Arcade Header */}
            <div className="h-20 flex items-center justify-between px-6 bg-white z-20 w-full border-b-2 border-stone-100 relative shrink-0">
                <div className="flex items-center gap-4">
                    <Link href="/messages" className="md:hidden">
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl border-2 border-transparent hover:bg-stone-100 active:translate-y-1">
                            <ChevronLeft className="h-6 w-6 text-stone-400" />
                        </Button>
                    </Link>

                    <div className="flex items-center gap-x-4 group">
                        <div className="relative h-12 w-12 shrink-0 flex items-center justify-center rounded-[18px] border-2 border-stone-200 bg-stone-50 overflow-visible shadow-sm transition-all group-hover:border-[#1CB0F6]">
                            {isGroup ? (
                                <div className="flex -space-x-3 items-center h-full w-full justify-center">
                                    {(participants || []).slice(0, 2).map((p, idx) => (
                                        <div 
                                            key={p.userId} 
                                            className={cn(
                                                "h-8 w-8 rounded-full border-2 border-white overflow-hidden bg-stone-100 shadow-sm relative shrink-0",
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
                                    {(participants || []).length > 2 && (
                                        <div className="h-8 w-8 rounded-full border-2 border-white bg-stone-50 flex items-center justify-center text-[8px] font-black text-stone-500 z-20 shadow-sm shrink-0">
                                            +{(participants || []).length - 2}
                                        </div>
                                    )}
                                </div>
                            ) : partner?.userImageSrc ? (
                                <img src={partner.userImageSrc} alt={partner.userName} className="h-full w-full object-cover rounded-[16px]" />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center text-xl font-black text-stone-400 uppercase">
                                    {partner?.userName?.[0] || "?"}
                                </div>
                            )}
                            {isPartnerOnline && !isGroup && (
                                <span className="w-3.5 h-3.5 bg-[#58CC02] rounded-full border-2 border-white absolute -bottom-1 -right-1 z-10 shadow-sm"></span>
                            )}
                        </div>
                        <div className="flex flex-col">
                            <h2 className="font-black text-stone-800 text-lg tracking-tight leading-none">
                                {isGroup ? groupName : partner?.userName}
                            </h2>
                            <span className={cn("text-[11px] font-black uppercase tracking-widest mt-1", (isPartnerOnline || isGroup) ? "text-[#58CC02]" : "text-stone-300")}>
                                {isGroup ? "Conversa de Grupo" : (isPartnerOnline ? "Online" : "Offline")}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Message Canvas */}
            <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 bg-[#f8fafc] min-h-0 scrollbar-hide"
            >
                {messages.length === 0 && (
                    <div className="flex-1 flex flex-col items-center justify-center text-stone-400 gap-4 mt-8 opacity-60">
                        <div className="text-6xl animate-bounce">👋</div>
                        <p className="font-black text-xl text-stone-600">Diz olá!</p>
                    </div>
                )}
                {messages.map((msg, i) => (
                    <MessageItem
                        key={msg.id || i}
                        msg={msg}
                        i={i}
                        userId={userId}
                        actualLastMyMessageIndex={actualLastMyMessageIndex}
                        activeMenuId={activeMenuId}
                        setActiveMenuId={setActiveMenuId}
                        highlightedId={highlightedId}
                        setReplyingTo={setReplyingTo}
                        onReaction={onReaction}
                        scrollToMessage={scrollToMessage}
                        setSelectedImage={setSelectedImage}
                        truncate={truncate}
                        formatTimestamp={formatTimestamp}
                    />
                ))}
                
                {isPartnerTyping && (
                    <div className="self-start flex items-center px-4 py-3 bg-white border-2 border-stone-200 border-b-4 rounded-tl-md rounded-[1.2rem] shadow-sm animate-pulse mt-2">
                        <div className="flex gap-1.5 items-center">
                            <span className="w-2 h-2 bg-stone-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                            <span className="w-2 h-2 bg-stone-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                            <span className="w-2 h-2 bg-stone-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                        </div>
                    </div>
                )}
                
                <div ref={bottomRef} />
            </div>

            {/* Input Console (Action Bar) */}
            <div className="bg-white border-t-2 border-stone-100 p-4 md:p-6 pb-[calc(1rem+env(safe-area-inset-bottom))] shrink-0 relative z-20">
                
                {/* Reply Banner */}
                <AnimatePresence>
                    {replyingTo && (
                        <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="max-w-5xl mx-auto mb-4 overflow-hidden"
                        >
                            <div className="bg-stone-50 border-2 border-stone-200 rounded-2xl flex items-center justify-between p-3 gap-3">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="w-1 h-8 bg-[#1CB0F6] rounded-full shrink-0" />
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-[10px] font-black uppercase tracking-[0.1em] text-[#1CB0F6]">A responder a uma mensagem</span>
                                        <p className="text-sm font-bold text-stone-600 truncate">{truncate(replyingTo.content)}</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setReplyingTo(null)}
                                    className="h-10 w-10 bg-stone-100 rounded-xl flex items-center justify-center hover:bg-stone-200 transition-all shrink-0"
                                >
                                    <X className="h-4 w-4 text-stone-500" />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {showGifPicker && (
                    <div className="absolute bottom-24 left-6 right-6 sm:right-auto sm:left-6 z-[200] bg-white p-4 rounded-[2.5rem] shadow-2xl border-2 border-stone-200 border-b-[8px] h-[400px] w-auto sm:w-[320px] overflow-hidden flex flex-col">
                        <div className="flex justify-between items-center mb-4 shrink-0">
                            <span className="font-black text-xs text-stone-400 uppercase tracking-[0.2em] pl-2">GIPHY VAULT</span>
                            <button onClick={() => setShowGifPicker(false)} className="h-8 w-8 bg-stone-50 rounded-full flex items-center justify-center hover:bg-stone-100 transition-all">
                                <X className="h-4 w-4 text-stone-400" />
                            </button>
                        </div>
                        <div className="flex-1 min-h-0">
                            <GifSelector onSelect={handleSendGif} />
                        </div>
                    </div>
                )}

                <form action={handleSubmit} ref={formRef} className="flex gap-4 items-center w-full max-w-5xl mx-auto">
                    <div className="flex-1 flex items-center gap-3 bg-stone-100 border-2 border-stone-200 border-b-4 rounded-[2rem] px-4 py-3 focus-within:border-[#1CB0F6] focus-within:bg-blue-50/50 transition-all group">
                        <UploadButton onUploadComplete={handleUploadComplete} />
                        <button
                            type="button"
                            onClick={() => setShowGifPicker(!showGifPicker)}
                            className="bg-transparent rounded-full h-10 w-10 flex items-center justify-center transition-all shrink-0 text-stone-400 hover:bg-stone-50 hover:text-[#1CB0F6]"
                        >
                            <ImageIcon className="h-6 w-6" />
                        </button>
                        
                        <input
                            name="content"
                            disabled={isSending}
                            placeholder="Escrever mensagem..."
                            onChange={handleInputChange}
                            className="flex-1 bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-[15px] font-bold text-stone-700 placeholder:text-stone-400 h-10 w-full disabled:opacity-50"
                            autoComplete="off"
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        disabled={isSending}
                        className="h-14 px-8 rounded-[1.5rem] bg-[#58CC02] hover:bg-[#4eb801] active:translate-y-1 active:border-b-0 text-white font-black text-sm uppercase tracking-widest border-b-4 border-[#46a302] transition-all flex items-center justify-center gap-3 shadow-xl shrink-0 disabled:bg-stone-200 disabled:border-stone-300 disabled:text-stone-400"
                    >
                        {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5 drop-shadow-sm" />}
                        <span className="hidden md:inline">{isSending ? "A enviar..." : "Enviar"}</span>
                    </button>
                </form>
            </div>
        </div>
    );
};
