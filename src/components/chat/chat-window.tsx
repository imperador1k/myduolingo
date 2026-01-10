"use client";

import { useRealtimeMessages } from "./use-realtime-messages";
import { onSendMessage } from "@/actions/user-actions";
import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Send, Image as ImageIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { GifSelector } from "./gif-selector";

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
    const messages = useRealtimeMessages(initialMessages, userId, partner.userId);
    const bottomRef = useRef<HTMLDivElement>(null);
    const formRef = useRef<HTMLFormElement>(null);
    const [showGifPicker, setShowGifPicker] = useState(false);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSubmit = async (formData: FormData) => {
        const content = formData.get("content")?.toString();
        if (!content) return;
        formRef.current?.reset();
        await onSendMessage(partner.userId, formData);
    };

    const handleSendGif = async (gif: any) => {
        // Giphy returns an object. We want gif.images.fixed_height.url or similar
        const gifUrl = gif.images.fixed_height.url;
        setShowGifPicker(false);
        const formData = new FormData();
        formData.set("content", gifUrl);
        await onSendMessage(partner.userId, formData);
    };

    const isGif = (content: string) => {
        return content.includes("giphy.com/media");
    };

    return (
        <div className="flex flex-col h-full w-full bg-white relative">
            {/* Header */}
            <div className="p-4 border-b flex items-center gap-3 shadow-sm bg-white z-10">
                <div className="h-10 w-10 rounded-full border-2 border-slate-200 overflow-hidden">
                    {partner.userImageSrc ? (
                        <img src={partner.userImageSrc} alt={partner.userName} className="h-full w-full object-cover" />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center bg-slate-100 text-xl">
                            {partner.userName[0]?.toUpperCase()}
                        </div>
                    )}
                </div>
                <h2 className="font-bold text-slate-700 text-lg">{partner.userName}</h2>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-slate-50">
                {messages.length === 0 && (
                    <div className="flex-1 flex items-center justify-center text-slate-400">
                        Diz olá a {partner.userName}!
                    </div>
                )}
                {messages.map((msg, i) => {
                    const isMe = msg.senderId === userId;
                    const isContentGif = isGif(msg.content);

                    return (
                        <div key={i} className={cn("flex w-full", isMe ? "justify-end" : "justify-start")}>
                            <div className={cn(
                                "max-w-[70%] rounded-2xl shadow-sm text-sm overflow-hidden",
                                isMe ? "bg-sky-500 text-white rounded-br-none" : "bg-white border-2 border-slate-200 text-slate-700 rounded-bl-none",
                                isContentGif ? "p-0 bg-transparent border-0 shadow-none" : "px-4 py-2"
                            )}>
                                {isContentGif ? (
                                    <img src={msg.content} alt="GIF" className="rounded-xl" />
                                ) : (
                                    msg.content
                                )}
                            </div>
                        </div>
                    );
                })}
                <div ref={bottomRef} />
            </div>

            {/* Input Area (Relative for popover) */}
            <div className="p-4 bg-white border-t relative">
                {/* GIF Picker Popover */}
                {showGifPicker && (
                    <div className="absolute bottom-20 left-4 z-50 bg-white p-4 rounded-xl shadow-2xl border border-slate-200">
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-bold text-sm text-slate-500">GIPHY</span>
                            <button onClick={() => setShowGifPicker(false)}>
                                <X className="h-4 w-4 text-slate-400 hover:text-slate-600" />
                            </button>
                        </div>
                        <GifSelector onSelect={handleSendGif} />
                    </div>
                )}

                <form action={handleSubmit} ref={formRef} className="flex gap-2">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowGifPicker(!showGifPicker)}
                        className="text-slate-400 hover:text-slate-600"
                    >
                        <ImageIcon className="h-6 w-6" />
                    </Button>
                    <input
                        name="content"
                        placeholder="Escreve uma mensagem..."
                        className="flex-1 bg-slate-100 border-2 border-transparent focus:bg-white focus:border-sky-500 rounded-xl px-4 py-3 outline-none transition"
                        autoComplete="off"
                    />
                    <Button variant="primary" size="icon" type="submit">
                        <Send className="h-5 w-5" />
                    </Button>
                </form>
            </div>
        </div>
    );
};
