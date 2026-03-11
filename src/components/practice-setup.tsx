"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Shuffle, Target, CheckCircle2, Languages, Signal, Play, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { SUPPORTED_LANGUAGES } from "@/lib/constants";
import { getActiveLanguage, getUserLevelForLanguage } from "@/actions/evaluation";
import Link from "next/link";

type PracticeConfig = {
    language: string;
    level: string;
    mode: "random" | "focus";
};

type Props = {
    type: "writing" | "speaking" | "reading" | "listening";
    onStart: (config: PracticeConfig) => void;
};

export function PracticeSetup({ type, onStart }: Props) {
    const [language, setLanguage] = useState(SUPPORTED_LANGUAGES[0].value);
    const [level, setLevel] = useState("B1");
    const [mode, setMode] = useState<"random" | "focus">("random");
    const [recommendedLevel, setRecommendedLevel] = useState<{ level: string; isEvaluated: boolean } | null>(null);

    // Initial load: Fetch active language, but don't overwrite if it was already selected
    useEffect(() => {
        getActiveLanguage().then((lang) => {
            if (lang) {
                const match = SUPPORTED_LANGUAGES.find(
                    (l) => l.value.toLowerCase() === lang.toLowerCase()
                );
                if (match) setLanguage(match.value);
            }
        });
    }, []);

    // Whenever language changes, fetch the true CEFR level for that language
    useEffect(() => {
        if (!language) return;
        getUserLevelForLanguage(language).then((res) => {
            setRecommendedLevel(res);
            // Optionally, we could auto-select the level here if we wanted to:
            // setLevel(res.level);
            // But per specs, we leave the user in control and just recommend it visually!
        });
    }, [language]);

    const getIcon = () => {
        switch (type) {
            case "writing": return "✍️";
            case "speaking": return "🎙️";
            case "reading": return "📖";
            case "listening": return "🎧";
        }
    };

    const getTitle = () => {
        switch (type) {
            case "writing": return "Writing Practice";
            case "speaking": return "Speaking Practice";
            case "reading": return "Reading Comprehension";
            case "listening": return "Listening Comprehension";
        }
    };

    const getDescription = () => {
        switch (type) {
            case "writing": return "Write essays or creative texts.";
            case "speaking": return "Practice pronunciation and fluency.";
            case "reading": return "Analyze complex texts and answer questions.";
            case "listening": return "Train your ear with native audio.";
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 animate-in fade-in zoom-in duration-500">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border-2 border-slate-100 overflow-hidden">
                {/* Header */}
                <div className="bg-slate-50 p-6 text-center border-b border-slate-100">
                    <div className="text-4xl mb-2">{getIcon()}</div>
                    <h1 className="text-2xl font-bold text-slate-800">{getTitle()}</h1>
                    <p className="text-slate-500 text-sm mt-1">{getDescription()}</p>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                    {/* Language Selector */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-slate-400 flex items-center gap-2">
                            <Languages className="h-4 w-4" /> Language
                        </label>
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="w-full rounded-xl border-slate-200 p-3 text-slate-700 font-medium focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-slate-50"
                        >
                            {SUPPORTED_LANGUAGES.map((lang) => (
                                <option key={lang.value} value={lang.value}>
                                    {lang.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Level Selector */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-slate-400 flex items-center gap-2">
                            <Signal className="h-4 w-4" /> Difficulty Level
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {["A1", "A2", "B1", "B2", "C1", "C2"].map((l) => {
                                const isRecommended = recommendedLevel?.level === l;
                                const isEvaluated = recommendedLevel?.isEvaluated;
                                const showBadge = isRecommended;

                                return (
                                    <button
                                        key={l}
                                        onClick={() => setLevel(l)}
                                        className={cn(
                                            "relative p-2 rounded-lg text-sm font-bold border-2 transition-all flex flex-col items-center justify-center min-h-[56px]",
                                            level === l
                                                ? "border-sky-500 bg-sky-50 text-sky-700"
                                                : "border-slate-200 bg-white text-slate-500 hover:border-sky-200",
                                            showBadge && level !== l && "border-amber-300 bg-amber-50/20",
                                            showBadge && level === l && "border-amber-400 bg-amber-50"
                                        )}
                                    >
                                        {l}
                                        {showBadge && (
                                            <span className={cn(
                                                "absolute -top-2.5 px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider shadow-sm",
                                                isEvaluated
                                                    ? "bg-gradient-to-r from-amber-400 to-orange-500 text-white"
                                                    : "bg-slate-200 text-slate-600"
                                            )}>
                                                {isEvaluated ? "Your Level" : "Recommended"}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                        {recommendedLevel && !recommendedLevel.isEvaluated && (
                            <div className="mt-4 p-3 rounded-xl bg-sky-50/80 border border-sky-100 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-500">
                                <Sparkles className="h-5 w-5 text-sky-500 shrink-0 mt-0.5" />
                                <p className="text-xs text-sky-700/90 leading-relaxed font-medium">
                                    Not sure about your level? Take the <Link href="/evaluation" className="underline font-bold hover:text-sky-900 transition-colors">Placement Test</Link> to get an accurate AI assessment!
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Mode Toggle */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                        <button
                            onClick={() => setMode("random")}
                            className={cn(
                                "p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all",
                                mode === "random"
                                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                                    : "border-slate-200 text-slate-400 hover:border-emerald-200"
                            )}
                        >
                            <Shuffle className="h-6 w-6" />
                            <span className="text-xs font-bold">Random Topic</span>
                        </button>
                        <button
                            onClick={() => setMode("focus")}
                            className={cn(
                                "p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all",
                                mode === "focus"
                                    ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                                    : "border-slate-200 text-slate-400 hover:border-indigo-200"
                            )}
                        >
                            <Target className="h-6 w-6" />
                            <span className="text-xs font-bold">Course Focus</span>
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 pt-0">
                    <Button
                        size="lg"
                        className="w-full text-lg h-12 shadow-lg hover:scale-[1.02] transition-transform"
                        onClick={() => onStart({ language, level, mode })}
                    >
                        Start Session <Play className="ml-2 h-5 w-5 fill-current" />
                    </Button>
                    <p className="text-center text-xs text-slate-400 mt-3">
                        Generating content will consume 1 AI Cred.
                    </p>
                </div>
            </div>
        </div>
    );
}
