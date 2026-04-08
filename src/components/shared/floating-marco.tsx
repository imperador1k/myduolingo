"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { X, Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { askMarco } from "@/actions/marco-chat";
import ReactMarkdown from "react-markdown";
import Link from "next/link";

type Message = {
    id: string;
    role: "user" | "marco";
    content: string;
};

const SLASH_COMMANDS = [
    { cmd: "/suporte", icon: "🛠️", desc: "Reportar um erro", color: "blue" },
    { cmd: "/cultura", icon: "🌍", desc: "Curiosidade cultural", color: "purple" },
    { cmd: "/dica", icon: "🧠", desc: "Dica de estudo rápida", color: "yellow" },
    { cmd: "/traduzir", icon: "🗣️", desc: "Traduzir...", color: "green" },
];

export const FloatingMarco = () => {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-scroll to bottom of chat
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading, isOpen]);

    // CRITICAL: Route Protection (Moved after hooks to avoid "Rendered more hooks" error)
    if (
        pathname === "/" ||
        pathname.startsWith("/login") ||
        pathname.startsWith("/register") ||
        pathname.startsWith("/sign-in") ||
        pathname.startsWith("/sign-up") ||
        pathname.startsWith("/lesson") ||
        pathname.startsWith("/evaluation") ||
        pathname.startsWith("/practice") ||
        pathname.startsWith("/admin") ||
        pathname.startsWith("/arcade")
    ) {
        return null;
    }

    const handleSend = async (overrideInput?: string) => {
        const textToSend = overrideInput || input;
        if (!textToSend.trim() || isLoading) return;

        setInput("");
        
        const newMessage: Message = { id: Date.now().toString(), role: "user", content: textToSend };
        setMessages((prev) => [...prev, newMessage]);
        setIsLoading(true);

        try {
            const contextLanguage = "Vários Idiomas"; // You can make this dynamic if needed
            const response = await askMarco(textToSend, contextLanguage);
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

    const handleCommandClick = (cmd: typeof SLASH_COMMANDS[0]) => {
        setInput(cmd.cmd + " ");
        inputRef.current?.focus();
    };

    const renderUserMessage = (text: string) => {
        const foundCmd = SLASH_COMMANDS.find(c => text.startsWith(c.cmd));
        if (!foundCmd) return text;
        const rest = text.slice(foundCmd.cmd.length).trim();
        return (
            <>
                <span className="inline-block bg-white/20 text-white font-bold px-2 py-0.5 rounded-md mr-1 shadow-sm">
                    {foundCmd.cmd}
                </span>
                {rest}
            </>
        );
    };

    return (
        <>
            {/* The Trigger Button (FAB) */}
            <div
                className={cn(
                    "fixed z-50 bottom-32 right-4 md:bottom-10 md:right-10 flex flex-col items-end pointer-events-none transition-all duration-300 transform",
                    isOpen ? "scale-0 opacity-0" : "scale-100 opacity-100"
                )}
            >
                <button
                    onClick={() => setIsOpen(true)}
                    className="pointer-events-auto w-16 h-16 bg-[#58CC02] rounded-full border-2 border-[#46A302] border-b-8 flex items-center justify-center text-white shadow-[0_10px_25px_rgba(88,204,2,0.4)] hover:-translate-y-1 hover:shadow-[0_15px_35px_rgba(88,204,2,0.5)] active:translate-y-2 active:border-b-0 active:shadow-none transition-all duration-200 group cursor-pointer relative"
                    aria-label="Abrir chat do Marco"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="none" className="w-8 h-8 text-white group-hover:scale-110 transition-transform duration-200 relative z-10">
                        <path d="M12 2C6.477 2 2 6.002 2 10.942c0 2.805 1.455 5.3 3.75 6.953l-1.373 3.658a.498.498 0 0 0 .638.64l3.774-1.424A10.82 10.82 0 0 0 12 19.884c5.523 0 10-4.002 10-8.942S17.523 2 12 2zM15.5 13h-7a.5.5 0 0 1 0-1h7a.5.5 0 0 1 0 1zm0-3h-7a.5.5 0 0 1 0-1h7a.5.5 0 0 1 0 1z" />
                        <path d="M19.5 2.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" className="animate-pulse" fill="#FFDC80" />
                    </svg>

                    <span className="absolute top-0 right-0 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF4B4B] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-[#FF4B4B] border-2 border-white shadow-sm"></span>
                    </span>
                </button>
            </div>

            {/* The Bento Box Chat */}
            <div
                className={cn(
                    "pointer-events-auto z-50 origin-bottom-right transition-all duration-300 ease-out transform",
                    "fixed inset-x-0 bottom-0 w-full h-[85vh] rounded-t-3xl border-t-8 border-stone-200 bg-[#fbf9f8] shadow-2xl flex flex-col",
                    "md:fixed md:bottom-10 md:right-10 md:left-auto md:w-[420px] md:h-[650px] md:rounded-3xl md:border-2 md:border-stone-200 md:border-b-8 overflow-hidden",
                    isOpen ? "scale-100 opacity-100 translate-y-0" : "scale-95 opacity-0 translate-y-20 pointer-events-none"
                )}
            >
                {/* Header */}
                <div className="bg-[#58CC02] border-b-4 border-[#46a302] px-4 py-3 flex items-center justify-between shadow-sm relative z-20 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center overflow-hidden border-2 border-white/20 shadow-sm relative">
                            <Image 
                                src="/marco.png" 
                                alt="Marco" 
                                fill
                                className="object-contain p-1"
                            />
                        </div>
                        <div className="text-white font-black tracking-wide text-lg">
                            MARCO <span className="text-xs opacity-80">(BETA)</span>
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
                        <div className="flex flex-col items-center justify-center text-center mt-8 md:mt-12 space-y-4 animate-in fade-in zoom-in-95 duration-700">
                            <div className="relative w-24 h-24 md:w-32 md:h-32 mb-2">
                                {/* Subtle bouncing shadow */}
                                <div className="absolute inset-x-4 -bottom-2 h-3 bg-stone-300/50 rounded-[100%] blur-sm animate-pulse" />
                                {/* Floating avatar */}
                                <Image 
                                    src="/marco.png" 
                                    alt="Marco" 
                                    fill
                                    className="object-contain drop-shadow-xl animate-[bounce_3s_ease-in-out_infinite]"
                                />
                            </div>
                            <h3 className="font-extrabold text-2xl text-stone-700">Salut! 🥖</h3>
                            
                            <div className="mt-6 w-full max-w-sm mx-auto bg-stone-50 border-2 border-stone-200 rounded-2xl p-4 text-left">
                                <h4 className="text-sm font-bold text-stone-400 uppercase tracking-wider mb-3">Como usar o Marco:</h4>
                                
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="bg-blue-100 text-blue-600 font-bold px-2 py-1 rounded-lg text-xs border-b-2 border-blue-200">/suporte</span> 
                                    <span className="text-sm font-bold text-stone-600">Reportar um erro</span>
                                </div>
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="bg-purple-100 text-purple-600 font-bold px-2 py-1 rounded-lg text-xs border-b-2 border-purple-200">/cultura</span> 
                                    <span className="text-sm font-bold text-stone-600">Curiosidade cultural</span>
                                </div>
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="bg-amber-100 text-amber-600 font-bold px-2 py-1 rounded-lg text-xs border-b-2 border-amber-200">/dica</span> 
                                    <span className="text-sm font-bold text-stone-600">Dica de estudo</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="bg-[#ddf4ff] text-[#1CB0F6] font-bold px-2 py-1 rounded-lg text-xs border-b-2 border-[#1CB0F6]/20">/traduzir</span> 
                                    <span className="text-sm font-bold text-stone-600">Traduzir frase</span>
                                </div>
                            </div>
                        </div>
                    )}
                    {messages.map((msg) => (
                        <div key={msg.id} className={cn("flex w-full", msg.role === "user" ? "justify-end" : "justify-start")}>
                            <div
                                className={cn(
                                    msg.role === "user"
                                        ? "bg-[#58CC02] border-[#46a302] border-b-4 text-white rounded-2xl rounded-tr-none px-4 py-3 max-w-[85%] font-medium"
                                        : "bg-white border-2 border-stone-200 border-b-4 rounded-2xl rounded-tl-none px-4 py-3 max-w-[85%] text-stone-700 shadow-sm font-medium whitespace-pre-wrap prose prose-sm prose-stone"
                                )}
                            >
                                    {msg.role === "user" ? renderUserMessage(msg.content) : (
                                        <ReactMarkdown
                                            components={{
                                                a: ({ node, ...props }) => {
                                                    if (props.href === "/support" && props.children?.toString() === "ABRIR TICKET DE SUPORTE") {
                                                        return (
                                                            <Link 
                                                                href="/support" 
                                                                className="block mt-4 bg-[#ea2b2b] text-white font-black text-center py-3 px-6 rounded-2xl border-2 border-[#b21c1c] border-b-[6px] active:translate-y-1 active:border-b-0 transition-all no-underline w-full shadow-sm"
                                                            >
                                                                🛠️ CONTACTAR O MIGUEL
                                                            </Link>
                                                        );
                                                    }
                                                    return <a {...props} className="text-[#1CB0F6] hover:underline font-bold" />;
                                                }
                                            }}
                                        >
                                            {msg.content}
                                        </ReactMarkdown>
                                    )}
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
                <div className="p-4 bg-white border-t-2 border-stone-100 flex flex-col shrink-0 mb-safe relative">
                    {/* Slash Commands Pop-over */}
                    {input === "/" && (
                        <div className="absolute bottom-full left-4 mb-2 bg-white border-2 border-stone-200 rounded-2xl shadow-xl overflow-hidden z-30 w-64 animate-in slide-in-from-bottom-2 fade-in">
                            {SLASH_COMMANDS.map((cmd) => (
                                <button
                                    key={cmd.cmd}
                                    onClick={() => handleCommandClick(cmd)}
                                    className="flex items-center gap-3 p-3 hover:bg-stone-50 text-left w-full transition-colors border-b-2 border-stone-100 last:border-0 outline-none"
                                >
                                    <span className="text-xl">{cmd.icon}</span>
                                    <div className="flex flex-col">
                                        <span className="font-extrabold text-stone-700">{cmd.cmd}</span>
                                        <span className="text-stone-400 font-bold text-xs">{cmd.desc}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                    
                    <div className="flex items-center gap-3 relative">
                        <div className="flex-1 relative">
                            <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Escreve a tua dúvida..."
                            className="w-full bg-stone-100 border-2 border-stone-200 border-b-4 rounded-2xl px-4 py-3 text-stone-700 font-bold focus:outline-none focus:border-[#58CC02] focus:ring-4 focus:ring-[#58CC02]/20 focus:bg-white transition-all pr-12"
                        />
                    </div>
                    <button
                        onClick={() => handleSend()}
                        disabled={!input.trim() || isLoading}
                        className={cn(
                            "w-12 h-12 rounded-full flex items-center justify-center transition-all outline-none shrink-0",
                            input.trim() && !isLoading
                                ? "bg-[#58CC02] border-2 border-[#46A302] border-b-4 text-white active:translate-y-1 active:border-b-0 shadow-sm"
                                : "bg-stone-200 border-2 border-stone-300 border-b-4 text-stone-400 cursor-not-allowed"
                        )}
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-1" />}
                    </button>
                    </div>
                </div>
            </div>
        </>
    );
};
