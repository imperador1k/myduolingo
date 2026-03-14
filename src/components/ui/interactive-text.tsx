"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { X, Loader2, BookmarkPlus, BookmarkCheck } from "lucide-react";
import { toast } from "sonner";
import { getWordTranslation, saveWordToVault } from "@/actions/vocabulary";

interface InteractiveTextProps {
    text?: string | null;
    language?: string;
    className?: string;
}

interface TranslationResult {
    translation: string;
    explanation: string;
    isAlreadySaved: boolean;
}

export const InteractiveText = ({ text, language = "English", className }: InteractiveTextProps) => {
    const [selectedWord, setSelectedWord] = useState<string | null>(null);
    const [translationData, setTranslationData] = useState<TranslationResult | null>(null);
    const [translationCache, setTranslationCache] = useState<Record<string, TranslationResult>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [savedWords, setSavedWords] = useState<Set<string>>(new Set());
    const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0 });
    const containerRef = useRef<HTMLDivElement>(null);
    const overlayContentRef = useRef<HTMLDivElement>(null);

    // Close overlay
    const closeOverlay = useCallback(() => {
        setSelectedWord(null);
        setTranslationData(null);
    }, []);

    // Lock body scroll on mobile when overlay is open
    useEffect(() => {
        if (selectedWord) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [selectedWord]);

    // Escape key to close
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") closeOverlay();
        };
        if (selectedWord) {
            document.addEventListener("keydown", handleKey);
        }
        return () => document.removeEventListener("keydown", handleKey);
    }, [selectedWord, closeOverlay]);

    if (!text) return null;

    const handleWordClick = (word: string, e: React.MouseEvent<HTMLSpanElement>) => {
        e.stopPropagation();

        const rect = e.currentTarget.getBoundingClientRect();
        const containerRect = containerRef.current?.getBoundingClientRect();

        if (containerRect) {
            setPopoverPos({
                top: rect.bottom - containerRect.top + 10,
                left: rect.left - containerRect.left + rect.width / 2,
            });
        }

        setSelectedWord(word);

        // Client cache hit
        if (translationCache[word]) {
            setTranslationData(translationCache[word]);
            setIsLoading(false);
            return;
        }

        // Fetch (DB-first on server, then AI fallback)
        setTranslationData(null);
        setIsLoading(true);

        getWordTranslation(word, text, language)
            .then((data) => {
                const result: TranslationResult = {
                    translation: data.translation,
                    explanation: data.explanation,
                    isAlreadySaved: data.isAlreadySaved,
                };
                setTranslationData(result);
                setTranslationCache((prev) => ({ ...prev, [word]: result }));
                if (data.isAlreadySaved) {
                    setSavedWords((prev) => new Set(prev).add(word));
                }
            })
            .catch(() => {
                toast.error("Erro ao traduzir a palavra.");
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    const handleSaveToVault = async () => {
        if (!selectedWord || !translationData || savedWords.has(selectedWord)) return;

        setIsSaving(true);
        try {
            await saveWordToVault(
                selectedWord,
                translationData.translation,
                text,
                language,
                translationData.explanation
            );
            setSavedWords((prev) => new Set(prev).add(selectedWord));
            // Update cache
            setTranslationCache((prev) => ({
                ...prev,
                [selectedWord]: { ...translationData, isAlreadySaved: true },
            }));
            setTranslationData((prev) => prev ? { ...prev, isAlreadySaved: true } : prev);
            toast.success("Palavra guardada no Cofre! ⭐");
        } catch {
            toast.error("Erro ao guardar palavra.");
        } finally {
            setIsSaving(false);
        }
    };

    const isWordSaved = selectedWord ? savedWords.has(selectedWord) || (translationData?.isAlreadySaved ?? false) : false;

    // Tokenize: words vs separators
    const tokens = text.split(/([ \n\t\r.,;!?¿¡"'()[\]{}:—–\-]+)/);

    return (
        <div ref={containerRef} className={cn("relative inline leading-relaxed", className)}>
            {tokens.map((token, i) => {
                const isWord = /^[a-zA-Z0-9\u00C0-\u00FF]+$/.test(token);

                if (isWord) {
                    return (
                        <span
                            key={i}
                            onClick={(e) => handleWordClick(token, e)}
                            className={cn(
                                "cursor-pointer border-b-2 border-dashed border-slate-300 transition-all duration-200 rounded-sm px-0.5 inline",
                                "hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50",
                                selectedWord === token && "border-emerald-500 text-emerald-600 bg-emerald-50/60"
                            )}
                        >
                            {token}
                        </span>
                    );
                }

                return <span key={i}>{token}</span>;
            })}

            {/* ═══════════ OVERLAY ═══════════ */}
            {selectedWord && (
                <>
                    {/* Invisible backdrop — closes on click */}
                    <div
                        className="fixed inset-0 z-40 bg-black/10 backdrop-blur-[1px] md:bg-transparent md:backdrop-blur-none"
                        onClick={closeOverlay}
                    />

                    {/* ── MOBILE: Bottom Sheet ── */}
                    <div
                        ref={overlayContentRef}
                        className={cn(
                            "fixed bottom-0 left-0 w-full z-50 md:hidden",
                            "bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.12)]",
                            "p-6 pb-8",
                            "animate-in slide-in-from-bottom duration-300 ease-out"
                        )}
                    >
                        {/* Drag indicator */}
                        <div className="flex justify-center mb-4">
                            <div className="w-10 h-1 bg-slate-300 rounded-full" />
                        </div>

                        <OverlayContent
                            word={selectedWord}
                            data={translationData}
                            isLoading={isLoading}
                            isSaving={isSaving}
                            isSaved={isWordSaved}
                            onSave={handleSaveToVault}
                            onClose={closeOverlay}
                        />
                    </div>

                    {/* ── DESKTOP: Glassmorphism Floating Card ── */}
                    <div
                        ref={overlayContentRef}
                        className={cn(
                            "absolute z-50 hidden md:block",
                            "bg-white/95 backdrop-blur-md border border-slate-200/80",
                            "rounded-2xl p-5 w-72 shadow-xl",
                            "animate-in fade-in zoom-in-95 duration-200 ease-out"
                        )}
                        style={{
                            top: `${popoverPos.top}px`,
                            left: `${popoverPos.left}px`,
                            transform: "translateX(-50%)",
                        }}
                    >
                        {/* Arrow */}
                        <div className="absolute -top-[6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-white/95 backdrop-blur-md border-l border-t border-slate-200/80 rotate-45" />

                        <OverlayContent
                            word={selectedWord}
                            data={translationData}
                            isLoading={isLoading}
                            isSaving={isSaving}
                            isSaved={isWordSaved}
                            onSave={handleSaveToVault}
                            onClose={closeOverlay}
                        />
                    </div>
                </>
            )}
        </div>
    );
};

/* ═══════════ Shared Content Component ═══════════ */

interface OverlayContentProps {
    word: string;
    data: TranslationResult | null;
    isLoading: boolean;
    isSaving: boolean;
    isSaved: boolean;
    onSave: () => void;
    onClose: () => void;
}

const OverlayContent = ({ word, data, isLoading, isSaving, isSaved, onSave, onClose }: OverlayContentProps) => (
    <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
            <h4 className="text-2xl font-black text-slate-800 tracking-tight">
                {word}
            </h4>
            <button
                onClick={(e) => { e.stopPropagation(); onClose(); }}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
            >
                <X className="h-4 w-4" />
            </button>
        </div>

        {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="h-7 w-7 text-emerald-500 animate-spin mb-2" />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">
                    A traduzir...
                </p>
            </div>
        ) : data ? (
            <>
                {/* Translation */}
                <p className="text-lg font-bold text-emerald-500 mb-1">
                    {data.translation}
                </p>

                {/* Explanation */}
                {data.explanation && (
                    <p className="text-sm text-slate-600 leading-relaxed mb-4">
                        {data.explanation}
                    </p>
                )}

                {/* Save Button */}
                <Button
                    onClick={(e) => { e.stopPropagation(); onSave(); }}
                    disabled={isSaving || isSaved}
                    className={cn(
                        "w-full font-bold rounded-xl h-11 transition-all text-sm",
                        isSaved
                            ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-default hover:bg-slate-100"
                            : "bg-emerald-500 hover:bg-emerald-600 text-white shadow-md hover:shadow-lg active:scale-[0.98]"
                    )}
                >
                    {isSaving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : isSaved ? (
                        <span className="flex items-center gap-1.5">
                            <BookmarkCheck className="h-4 w-4" />
                            Guardado ✅
                        </span>
                    ) : (
                        <span className="flex items-center gap-1.5">
                            <BookmarkPlus className="h-4 w-4" />
                            Guardar no Cofre
                        </span>
                    )}
                </Button>
            </>
        ) : (
            <p className="text-sm font-medium text-slate-500 py-4 text-center">
                Erro ao carregar tradução.
            </p>
        )}
    </div>
);
