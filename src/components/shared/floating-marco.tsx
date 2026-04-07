"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { X, Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { askMarco } from "@/actions/marco-chat";

type Message = {
    id: string;
    role: "user" | "marco";
    content: string;
};

export const FloatingMarco = () => {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // CRITICAL: Route Protection
    if (
        pathname.startsWith("/lesson") ||
        pathname.startsWith("/evaluation") ||
        pathname.startsWith("/practice") ||
        pathname.startsWith("/admin")
    ) {
        return null;
    }

    // Auto-scroll to bottom of chat
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading, isOpen]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg = input.trim();
        setInput("");
        
        const newMessage: Message = { id: Date.now().toString(), role: "user", content: userMsg };
        setMessages((prev) => [...prev, newMessage]);
        setIsLoading(true);

        try {
            const contextLanguage = "Vários Idiomas"; // You can make this dynamic if needed
            const response = await askMarco(userMsg, contextLanguage);
            const marcoMessage: Message = { id: (Date.now() + 1).toString(), role: "marco", content: response };
            setMessages((prev) => [...prev, marcoMessage]);
        } catch (error) {
            const errorMessage: Message = { id: (Date.now() + 1).toString(), role: "marco", content: "Oops! Tive um soluço mental. Podes tentar de novo?" };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="fixed z-50 bottom-6 right-6 md:bottom-10 md:right-10 flex flex-col items-end pointer-events-none">
            {/* The Trigger Button (FAB) */}
            <div
                className={cn(
                    "pointer-events-auto transition-all duration-300 transform",
                    isOpen ? "scale-0 opacity-0 absolute" : "scale-100 opacity-100 relative"
                )}
            >
                <button
                    onClick={() => setIsOpen(true)}
                    className="w-16 h-16 bg-white border-2 border-stone-200 border-b-8 rounded-full shadow-lg active:translate-y-2 active:border-b-2 hover:bg-stone-50 transition-all flex items-center justify-center relative outline-none"
                    aria-label="Abrir chat do Marco"
                >
                    {/* Placeholder for Marco's French Owl avatar */}
                    <div className="text-3xl">🦉</div>
                    <div className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse" />
                </button>
            </div>

            {/* The Bento Box Chat */}
            <div
                className={cn(
                    "pointer-events-auto origin-bottom-right transition-all duration-300 ease-out transform",
                    "fixed inset-x-0 bottom-0 w-full h-[80vh] rounded-t-3xl border-t-8 border-stone-200 bg-[#fbf9f8] shadow-2xl flex flex-col",
                    "md:relative md:inset-auto md:w-[400px] md:h-[600px] md:rounded-3xl md:border-2 md:border-stone-200 md:border-b-8 overflow-hidden",
                    isOpen ? "scale-100 opacity-100 translate-y-0" : "scale-95 opacity-0 translate-y-20 pointer-events-none"
                )}
            >
                {/* Header */}
                <div className="bg-[#1CB0F6] text-white p-4 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-2xl">
                            🦉
                        </div>
                        <div className="font-extrabold text-lg tracking-wide uppercase">
                            Marco <span className="text-white/60 text-xs">(Beta)</span>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors active:scale-95 outline-none"
                    >
                        <X className="w-6 h-6 text-white" />
                    </button>
                </div>

                {/* Chat Area */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
                    {messages.length === 0 && (
                        <div className="text-center text-stone-500 mt-10">
                            <div className="text-5xl mb-4">🇫🇷</div>
                            <h3 className="font-bold text-lg mb-2">Bonjour!</h3>
                            <p className="text-sm">Eu sou o Marco. Tens alguma dúvida sobre as tuas lições?</p>
                        </div>
                    )}
                    {messages.map((msg) => (
                        <div key={msg.id} className={cn("flex w-full", msg.role === "user" ? "justify-end" : "justify-start")}>
                            <div
                                className={cn(
                                    msg.role === "user"
                                        ? "bg-[#58CC02] border-[#46a302] border-b-4 text-white rounded-2xl rounded-tr-none px-4 py-3 max-w-[85%] font-medium"
                                        : "bg-white border-2 border-stone-200 border-b-4 rounded-2xl rounded-tl-none px-4 py-3 max-w-[85%] text-stone-700 shadow-sm font-medium whitespace-pre-wrap"
                                )}
                            >
                                {msg.content}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start w-full">
                            <div className="bg-white border-2 border-stone-200 border-b-4 rounded-2xl rounded-tl-none px-4 py-4 max-w-[85%] text-stone-700 shadow-sm flex items-center gap-2">
                                <span className="flex gap-1">
                                    <span className="w-2 h-2 bg-stone-300 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                    <span className="w-2 h-2 bg-stone-300 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                    <span className="w-2 h-2 bg-stone-300 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white border-t-2 border-stone-100 flex items-center gap-3 shrink-0">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Escreve a tua dúvida..."
                            className="w-full bg-stone-100 border-2 border-stone-200 border-b-4 rounded-2xl px-4 py-3 text-stone-700 font-bold focus:outline-none focus:border-[#1CB0F6] focus:bg-white transition-all pr-12"
                        />
                    </div>
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading}
                        className={cn(
                            "w-12 h-12 rounded-full flex items-center justify-center transition-all outline-none border-b-4 shrink-0",
                            input.trim() && !isLoading
                                ? "bg-[#1CB0F6] border-[#0092d6] text-white active:translate-y-1 active:border-b-0"
                                : "bg-stone-200 border-stone-300 text-stone-400 cursor-not-allowed"
                        )}
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-1" />}
                    </button>
                </div>
            </div>
        </div>
    );
};
