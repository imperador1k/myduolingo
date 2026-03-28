"use client";

import { useVoiceTutor } from "@/hooks/use-voice-tutor";
import { Mic, PhoneOff, Loader2, Square, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type CallRoomClientProps = {
    activeLanguage: string;
};

export function CallRoomClient({ activeLanguage }: CallRoomClientProps) {
    const router = useRouter();
    const {
        isRecording,
        isSpeaking,
        userTranscript,
        aiResponse,
        status,
        toggleRecording,
    } = useVoiceTutor(activeLanguage);

    return (
        <div className="min-h-screen bg-[#fbf9f8] text-slate-800 flex flex-col items-center font-sans overflow-hidden p-4 sm:p-6 lg:p-8">
            
            {/* Header */}
            <header className="w-full max-w-4xl flex items-center justify-between mb-8 z-10">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-700 tracking-tight flex items-center gap-2">
                    <MessageCircle className="text-[#1CB0F6] w-8 h-8" />
                    Conversa
                </h1>
                <div className="bg-white px-4 py-2 rounded-2xl border-2 border-stone-200 border-b-4 text-sm font-bold text-[#1cb0f6] uppercase tracking-wider shadow-sm">
                    {activeLanguage}
                </div>
            </header>

            {/* Main Bento Layout */}
            <main className="w-full max-w-4xl flex flex-col lg:flex-row gap-6 lg:gap-8 flex-1">
                
                {/* Left Side: The AI Orb Model Bento */}
                <div className="w-full lg:w-1/2 flex flex-col items-center justify-center bg-white border-2 border-stone-200 border-b-8 rounded-3xl p-8 relative shadow-sm h-[300px] lg:h-auto">
                    {/* Ripple Rings Background */}
                    <div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-3xl pointer-events-none">
                        {isRecording && (
                            <div className="absolute w-[300px] h-[300px] bg-[#58CC02] rounded-full opacity-10 animate-ping" style={{ animationDuration: '2s' }} />
                        )}
                        {isSpeaking && (
                            <div className="absolute w-[250px] h-[250px] bg-[#1CB0F6] rounded-full opacity-10 animate-pulse" />
                        )}
                    </div>

                    <div className="relative w-48 h-48 sm:w-64 sm:h-64 flex items-center justify-center">
                        {/* Gamified AI Character / Orb */}
                        <div 
                            className={cn(
                                "relative w-40 h-40 sm:w-56 sm:h-56 rounded-[40px] rotate-3 transition-all duration-500 ease-in-out border-4 border-white shadow-[0_10px_0_rgba(0,0,0,0.1)] flex items-center justify-center",
                                "bg-gradient-to-br from-[#1CB0F6] to-[#1899D6]",
                                isSpeaking && "scale-110 shadow-[0_20px_40px_rgba(28,176,246,0.4)] animate-bounce",
                                isRecording && "scale-95 grayscale-[20%] opacity-80",
                                !isSpeaking && !isRecording && status === "idle" && "hover:rotate-6 hover:scale-105"
                            )}
                        >
                            {/* Face representation */}
                            <div className="flex gap-4 sm:gap-6 -rotate-3 transition-all duration-300">
                                <div className={cn("w-6 h-8 sm:w-8 sm:h-12 bg-white rounded-full", isSpeaking && "h-4 sm:h-6")} />
                                <div className={cn("w-6 h-8 sm:w-8 sm:h-12 bg-white rounded-full", isSpeaking && "h-4 sm:h-6")} />
                            </div>
                            {/* Mouth */}
                            <div className={cn(
                                "absolute bottom-10 w-8 h-4 bg-white rounded-full -rotate-3 transition-all duration-200",
                                isSpeaking && "w-12 h-10 rounded-[20px]",
                                isRecording && "w-16 h-2 rounded-full"
                            )} />
                        </div>
                    </div>
                </div>

                {/* Right Side: Chat Feed & Controls Bento */}
                <div className="w-full lg:w-1/2 flex flex-col gap-6 h-full">
                    
                    {/* Transcripts Board - Bento */}
                    <div className="flex-1 bg-white border-2 border-stone-200 border-b-8 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col gap-6 min-h-[300px] justify-between relative overflow-hidden">
                        
                        {/* Tutor Message */}
                        <div className="flex flex-col gap-2 w-full">
                            <span className="text-xs font-black text-stone-400 uppercase ml-2">Professor IA</span>
                            <div className={cn(
                                "bg-stone-100 border-2 border-stone-200 rounded-3xl rounded-tl-sm p-4 text-stone-700 text-lg font-bold w-fit max-w-[90%] transition-all",
                                status === "thinking" && "animate-pulse"
                            )}>
                                {status === "thinking" ? (
                                    <span className="flex items-center gap-2">
                                        <Loader2 className="w-5 h-5 animate-spin text-[#1cb0f6]" />
                                        A pensar...
                                    </span>
                                ) : (
                                    aiResponse || "..."
                                )}
                            </div>
                        </div>

                        {/* User Transcript */}
                        <div className="flex flex-col gap-2 w-full items-end mt-4">
                            <span className="text-xs font-black text-stone-400 uppercase mr-2 overflow-hidden text-right">Tu</span>
                            <div className={cn(
                                "bg-[#1CB0F6]/10 border-2 border-[#1CB0F6]/20 text-[#1899D6] rounded-3xl rounded-tr-sm p-4 text-lg font-bold w-fit max-w-[90%] min-h-[60px] flex items-center justify-end text-right transition-opacity",
                                !userTranscript && !isRecording && "opacity-0"
                            )}>
                                {userTranscript || (isRecording ? "A ouvir... fala livremente!" : "")}
                            </div>
                        </div>

                    </div>

                    {/* Control Panel - Bento */}
                    <div className="bg-white border-2 border-stone-200 border-b-8 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
                        
                        <button
                            onClick={toggleRecording}
                            className={cn(
                                "w-full flex items-center justify-center gap-3 py-4 sm:py-5 rounded-2xl text-lg sm:text-xl font-black uppercase tracking-wider transition-all duration-150 active:border-b-0 active:translate-y-[4px] select-none text-white",
                                isRecording 
                                    ? "bg-rose-500 border-b-4 border-rose-600 animate-pulse hover:bg-rose-400" 
                                    : "bg-[#58CC02] border-b-4 border-[#58A700] hover:bg-[#46A302]"
                            )}
                        >
                            {isRecording ? (
                                <>
                                    <Square className="w-6 h-6 fill-current" />
                                    Parar e Enviar
                                </>
                            ) : (
                                <>
                                    <Mic className="w-7 h-7" />
                                    Tocar para Falar
                                </>
                            )}
                        </button>

                        <button
                            onClick={() => router.back()}
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-md font-bold uppercase tracking-wider text-rose-500 bg-transparent border-2 border-stone-200 hover:bg-stone-50 active:translate-y-[2px] transition-all"
                        >
                            <PhoneOff className="w-5 h-5" />
                            Terminar Sessão
                        </button>
                    </div>

                </div>
            </main>
        </div>
    );
}
