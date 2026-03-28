"use client";

import { useRealtimeMessages } from "./use-realtime-messages";
import { onSendMessage, onMarkMessagesAsRead } from "@/actions/user-actions";
import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Send, Image as ImageIcon, X, FileText, Download, ChevronLeft, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import dynamic from "next/dynamic";
import { UploadButton } from "./upload-button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

const GifSelector = dynamic(() => import("./gif-selector").then((mod) => mod.GifSelector), { ssr: false });

type Props = {
    userId: string;
    partner: {
        userId: string;
        userName: string;
        userImageSrc: string | null;
    };
    initialMessages: any[];
};

export const ChatWindow = ({ userId, partner, initialMessages }: Props) => {
    const { messages, addOptimisticMessage, isPartnerOnline, isPartnerTyping, trackTyping } = useRealtimeMessages(initialMessages, userId, partner.userId);
    const bottomRef = useRef<HTMLDivElement>(null);
    const formRef = useRef<HTMLFormElement>(null);
    const [showGifPicker, setShowGifPicker] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
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

    const scrollToBottom = () => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    useEffect(() => {
        // Scroll immediately, and also after a short delay to account for rendering/image loading
        scrollToBottom();
        const timeoutId = setTimeout(scrollToBottom, 150);
        
        // Mark as read if there are ANY unread messages from the partner
        // This fixes the bug where previous unread messages were ignored if the user sent a new message acting as the 'last' message
        const hasUnreadFromPartner = messages.some(msg => msg.senderId === partner.userId && !msg.read);
        if (hasUnreadFromPartner) {
            onMarkMessagesAsRead(partner.userId);
        }

        return () => clearTimeout(timeoutId);
    }, [messages, partner.userId]);

    const handleSubmit = async (formData: FormData) => {
        const content = formData.get("content")?.toString();
        if (!content) return;
        
        const optimisticId = `temp-${Date.now()}`;
        addOptimisticMessage({
            id: optimisticId,
            senderId: userId,
            receiverId: partner.userId,
            content: content,
            type: "text",
            createdAt: new Date(),
            read: false,
        });

        formRef.current?.reset();
        if (trackTyping) trackTyping(false);
        setTimeout(scrollToBottom, 50); // delay to ensure render
        
        await onSendMessage(partner.userId, formData);
    };

    const handleSendGif = async (gif: any) => {
        const gifUrl = gif.images.fixed_height.url;
        setShowGifPicker(false);
        
        const optimisticId = `temp-${Date.now()}`;
        addOptimisticMessage({
            id: optimisticId,
            senderId: userId,
            receiverId: partner.userId,
            content: gifUrl,
            type: "image",
            createdAt: new Date(),
            read: false,
        });
        setTimeout(scrollToBottom, 50);

        const formData = new FormData();
        formData.set("content", gifUrl);
        formData.set("type", "image");
        await onSendMessage(partner.userId, formData);
    };

    const handleUploadComplete = async (url: string, type: "image" | "file", fileName: string) => {
        const optimisticId = `temp-${Date.now()}`;
        addOptimisticMessage({
            id: optimisticId,
            senderId: userId,
            receiverId: partner.userId,
            content: url,
            type: type,
            fileName: fileName,
            createdAt: new Date(),
            read: false,
        });
        setTimeout(scrollToBottom, 50);

        const formData = new FormData();
        formData.set("content", url);
        formData.set("type", type);
        formData.set("fileName", fileName);
        await onSendMessage(partner.userId, formData);
    };

    const isGif = (content: string) => content.includes("giphy.com/media");

    const formatTimestamp = (dateString: string | Date) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Find the index of the last message sent by ME to render the "Visto" status
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
                                {/* Floating Action Buttons */}
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
                                
                                {/* Main Image */}
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

            {/* Bento Header */}
            <div className="p-4 flex items-center gap-4 bg-white z-20 w-full border-b-2 border-slate-100 relative pt-4 md:pt-6 px-4 md:px-6 pb-4 md:pb-5">
                {/* Back Button (Mobile Only) */}
                <Link href="/messages" className="md:hidden mr-1">
                    <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl border-2 border-transparent hover:bg-slate-100 active:border-b-0 active:translate-y-1">
                        <ChevronLeft className="h-8 w-8 text-slate-400" />
                    </Button>
                </Link>

                <Link href={`/profile/${partner.userId}`} className="flex items-center gap-x-3 md:gap-x-4 group cursor-pointer">
                    <div className="relative h-12 w-12 md:h-14 md:w-14 shrink-0 flex items-center justify-center rounded-[16px] md:rounded-[18px] border-2 border-slate-200 bg-slate-100 overflow-visible shadow-sm transition-all group-hover:opacity-80 group-hover:border-slate-300">
                        {partner.userImageSrc ? (
                            <img src={partner.userImageSrc} alt={partner.userName} className="h-full w-full object-cover rounded-[16px]" />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center text-2xl font-black text-slate-400">
                                {partner.userName[0]?.toUpperCase()}
                            </div>
                        )}
                        {isPartnerOnline && (
                            <span className="w-4 h-4 bg-emerald-500 rounded-full border-2 border-white absolute -bottom-1.5 -right-1.5 z-10 shadow-sm animate-in zoom-in duration-300"></span>
                        )}
                    </div>
                    <div className="flex flex-col transition-all group-hover:opacity-80">
                        <h2 className="font-black text-slate-700 text-xl tracking-tight leading-tight">{partner.userName}</h2>
                        <span className={cn("text-[13px] font-bold mt-0.5", isPartnerOnline ? "text-emerald-500" : "text-slate-400")}>
                            {isPartnerOnline ? "Online" : "Offline"}
                        </span>
                    </div>
                </Link>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-6 bg-slate-50 min-h-0 custom-scrollbar">
                {messages.length === 0 && (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-4 mt-8">
                        <div className="text-6xl drop-shadow-sm">👋</div>
                        <p className="font-black text-xl text-slate-600">Diz olá a {partner.userName}!</p>
                        <p className="text-sm font-bold text-slate-400 text-center max-w-[200px]">Envia uma mensagem para começar a amizade.</p>
                    </div>
                )}
                {messages.map((msg, i) => {
                    const isMe = msg.senderId === userId;
                    const isImage = msg.type === "image" || isGif(msg.content);
                    const isFile = msg.type === "file";

                    return (
                        <div key={i} className={cn("flex w-full flex-col", isMe ? "items-end" : "items-start")}>
                            <div className={cn(
                                "max-w-[85%] sm:max-w-[75%] rounded-[24px] text-[15px] overflow-hidden relative border-2 border-b-[6px] transition-all animate-in fade-in slide-in-from-bottom-2 duration-300 shadow-sm",
                                isMe 
                                    ? "bg-[#1CB0F6] text-white border-[#1CB0F6] rounded-br-[8px] self-end" 
                                    : "bg-white text-slate-700 border-slate-200 rounded-bl-[8px] self-start"
                            )}
                            style={isMe ? { borderBottomColor: '#0092d6', borderColor: '#1CB0F6' } : {}}
                            >
                                {isImage ? (
                                    <div
                                        className="relative cursor-pointer group p-1.5"
                                        onClick={() => setSelectedImage(msg.content)}
                                    >
                                        <img
                                            src={msg.content}
                                            alt="Image"
                                            className="rounded-[18px] object-cover max-h-64 min-h-[100px] w-auto bg-slate-200 transition-transform hover:scale-[1.02] border-2 border-black/10"
                                            loading="lazy"
                                        />
                                    </div>
                                ) : isFile ? (
                                    <div className="flex items-center gap-3 px-5 py-4">
                                        <FileText className={cn("h-10 w-10 drop-shadow-sm", isMe ? "text-white" : "text-slate-400")} />
                                        <div className="flex flex-col overflow-hidden">
                                            <span className="truncate font-black text-lg max-w-[150px]">{msg.fileName || "Ficheiro"}</span>
                                            <a href={msg.content} target="_blank" rel="noopener noreferrer" className={cn("text-[13px] font-bold underline flex items-center gap-1 mt-1 hover:opacity-80 transition-opacity", isMe ? "text-sky-100" : "text-sky-500")}>
                                                <Download className="h-4 w-4" /> Transferir
                                            </a>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="px-5 py-3.5 font-bold leading-relaxed">{msg.content}</div>
                                )}
                            </div>
                            
                            {/* Timestamp and Read Status */}
                            <div className={cn(
                                "flex items-center gap-1 text-[11px] font-bold mt-2 mx-1",
                                isMe ? "justify-end text-sky-500/80" : "justify-start text-slate-400"
                            )}>
                                <span>{formatTimestamp(msg.createdAt)}</span>
                                {isMe && i === actualLastMyMessageIndex && msg.read && (
                                    <span className="flex items-center gap-0.5 ml-1 text-sky-500 relative bg-sky-100 px-2 py-0.5 rounded-full">
                                        Visto
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
                
                {isPartnerTyping && (
                    <div className="flex w-full flex-col items-start fade-in-0 animate-in slide-in-from-bottom-2 duration-300 mt-2">
                        <div className="flex items-center px-5 py-4 bg-white border-2 border-slate-200 border-b-[6px] rounded-bl-[8px] rounded-[24px] shadow-sm overflow-hidden w-fit">
                            <div className="flex gap-2 items-center justify-center">
                                <span className="w-2.5 h-2.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                <span className="w-2.5 h-2.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                <span className="w-2.5 h-2.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                            </div>
                        </div>
                    </div>
                )}
                
                <div ref={bottomRef} />
            </div>

            {/* Input Area (Arcade Control Panel) */}
            <div className="p-4 pt-2 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:pb-5 sm:p-5 bg-slate-50/80 backdrop-blur-md relative shrink-0 flex flex-col items-center border-t-2 border-slate-100 z-50">
                {showGifPicker && (
                    <div className="absolute bottom-28 left-4 right-4 sm:right-auto sm:left-4 z-[200] bg-white p-3 sm:p-4 rounded-3xl shadow-2xl border-2 border-slate-200 border-b-[8px] h-[50dvh] sm:h-[480px] w-auto sm:w-[352px] flex flex-col items-center">
                        <div className="flex justify-between items-center mb-3 sm:mb-4 w-full shrink-0">
                            <span className="font-black text-[15px] text-slate-700 uppercase tracking-widest pl-2">GIPHY</span>
                            <button onClick={() => setShowGifPicker(false)} className="h-8 w-8 bg-slate-100 rounded-full flex items-center justify-center border-2 border-transparent hover:border-slate-300 active:bg-slate-200 transition-all">
                                <X className="h-4 w-4 text-slate-500" />
                            </button>
                        </div>
                        <div className="flex-1 w-full min-h-0 relative">
                            <GifSelector onSelect={handleSendGif} />
                        </div>
                    </div>
                )}

                <form action={handleSubmit} ref={formRef} className="flex gap-2 sm:gap-3 items-end w-full bg-white p-2 sm:p-3 rounded-[24px] border-2 border-slate-200 border-b-[6px] shadow-sm relative z-20">
                    <div className="flex gap-1">
                        <UploadButton onUploadComplete={handleUploadComplete} />
                        <button
                            type="button"
                            onClick={() => setShowGifPicker(!showGifPicker)}
                            className="bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-[14px] h-10 w-10 sm:h-[52px] sm:w-[52px] flex items-center justify-center transition-all border-2 border-slate-200 border-b-4 hover:border-b-4 active:border-b-0 active:translate-y-1 shrink-0"
                        >
                            <ImageIcon className="h-5 w-5 sm:h-6 sm:w-6 text-slate-500" />
                        </button>
                    </div>
                    
                    <input
                        name="content"
                        placeholder="Mensagem..."
                        onChange={handleInputChange}
                        className="flex-1 bg-slate-100 border-2 border-transparent focus:bg-white focus:border-sky-400 rounded-2xl px-3 sm:px-4 py-2 sm:py-3 pb-[10px] sm:pb-[14px] text-[14px] sm:text-[15px] font-bold text-slate-700 placeholder:text-slate-400 outline-none transition-all h-10 sm:h-[52px]"
                        autoComplete="off"
                    />
                    
                    <button 
                        type="submit" 
                        className="h-10 w-10 sm:h-[52px] sm:w-auto sm:px-6 rounded-[14px] bg-[#58cc02] hover:bg-[#46a302] active:bg-[#46a302] flex items-center justify-center transition-all border-2 border-transparent border-b-4 sm:border-b-[6px] hover:border-b-4 sm:hover:border-b-[6px] active:border-b-0 active:translate-y-1 sm:active:translate-y-[6px] shrink-0"
                        style={{ borderBottomColor: '#46a302' }}
                    >
                        <Send className="h-5 w-5 sm:h-6 sm:w-6 text-white sm:mr-1" />
                        <span className="hidden sm:inline text-white font-black text-[15px] tracking-widest uppercase">Enviar</span>
                    </button>
                </form>
            </div>
        </div>
    );
};
