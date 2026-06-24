"use client";

import { useState } from "react";
import { ChevronLeft, Trash2, BookmarkCheck, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

// Mock Data for now (until we fetch from Supabase)
const MOCK_SAVED = [
  {
    id: "1",
    title: "O Primeiro Computador",
    category: "TECHNOLOGY",
    body: "Sabias que o primeiro computador eletrónico, o ENIAC, pesava mais de 27 toneladas e ocupava uma sala inteira? Foi construído em 1945 e era usado para cálculos militares complexos durante a Segunda Guerra Mundial.",
    language: "PT",
    level: "B1",
    author: "HistóriaTech",
    savedAt: "Há 2 horas",
    bgClass: "from-sky-100 to-sky-50 dark:from-sky-900 dark:to-sky-950",
  },
  {
    id: "3",
    title: "Polvos Têm 3 Corações",
    category: "SCIENCE",
    body: "Os polvos são criaturas incríveis: têm três corações e o seu sangue é azul. Dois corações bombeiam sangue para as guelras, enquanto o terceiro bombeia para o resto do corpo.",
    language: "PT",
    level: "B2",
    author: "BioMundo",
    savedAt: "Ontem",
    bgClass:
      "from-emerald-100 to-emerald-50 dark:from-emerald-900 dark:to-emerald-950",
  },
];

export default function SavedPostsClient() {
  const router = useRouter();
  const [savedPosts, setSavedPosts] = useState(MOCK_SAVED);

  const handleRemove = (id: string) => {
    // Optimistic UI Removal
    setSavedPosts(savedPosts.filter((p) => p.id !== id));
    // Here we will call: await toggleSave(id)
  };

  return (
    <div className="min-h-screen bg-stone-100 dark:bg-slate-950 text-slate-900 dark:text-white font-sans selection:bg-sky-500/30">
      {/* Duolingo gamified background pattern (Light & Dark) */}
      <div
        className="fixed inset-0 hidden dark:block opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      ></div>
      <div
        className="fixed inset-0 block dark:hidden opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 2px 2px, black 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      ></div>

      <div className="max-w-2xl mx-auto p-4 md:p-8 relative z-10 pb-24">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-3 bg-slate-800 rounded-2xl hover:bg-slate-700 transition-all active:scale-95 border-b-4 border-slate-900 active:border-b-0 active:translate-y-1"
          >
            <ChevronLeft className="w-6 h-6 text-slate-300" />
          </button>
          <div>
            <h1 className="text-3xl font-black flex items-center gap-2">
              <BookmarkCheck className="w-8 h-8 text-amber-500" />
              Cofre de Conhecimento
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              As tuas curiosidades guardadas para reveres mais tarde.
            </p>
          </div>
        </div>

        {/* Posts Grid */}
        {savedPosts.length === 0 ? (
          <div className="text-center py-20 bg-white/50 dark:bg-slate-900/50 rounded-[32px] border-4 border-slate-300 dark:border-slate-800 border-dashed backdrop-blur-sm">
            <BookmarkCheck className="w-16 h-16 text-slate-400 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">O teu cofre está vazio!</h3>
            <p className="text-slate-500 dark:text-slate-500 mb-6 max-w-sm mx-auto">
              Volta ao Feed e clica no ícone de guardar para guardares os factos
              mais interessantes aqui.
            </p>
            <button
              onClick={() => router.push("/feed")}
              className="bg-sky-500 hover:bg-sky-400 text-white font-black py-3 px-8 rounded-2xl transition-all active:scale-95 border-b-4 border-sky-600 active:border-b-0 active:translate-y-1"
            >
              Explorar Feed
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {savedPosts.map((post, i) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`bg-gradient-to-br ${post.bgClass} p-6 rounded-[32px] border-4 border-white/10 shadow-xl relative group overflow-hidden`}
              >
                {/* Abstract Shape */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/50 dark:bg-white/5 rounded-full blur-2xl"></div>

                <div className="flex items-start justify-between gap-4 mb-4 relative z-10">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold px-2 py-1 bg-black/5 dark:bg-white/20 backdrop-blur-md rounded-lg text-slate-800 dark:text-white">
                        {post.category} • {post.level}
                      </span>
                      <span className="text-xs font-medium text-slate-500 dark:text-white/60">
                        {post.savedAt}
                      </span>
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white drop-shadow-md">
                      {post.title}
                    </h2>
                  </div>

                  <button
                    onClick={() => handleRemove(post.id)}
                    className="p-3 bg-white/50 dark:bg-white/10 backdrop-blur-md rounded-2xl hover:bg-rose-500 hover:text-white text-slate-500 dark:text-white/50 transition-all border-b-4 border-black/10 dark:border-black/20 hover:border-rose-700 active:scale-95 active:border-b-0 active:translate-y-1 shrink-0"
                    title="Remover do Cofre"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <p className="text-slate-700 dark:text-slate-100/90 font-medium leading-relaxed relative z-10 text-[15px]">
                  {post.body}
                </p>

                <div className="mt-6 flex items-center justify-between relative z-10 pt-4 border-t border-black/10 dark:border-white/10">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 border-2 border-white dark:border-white/20 flex items-center justify-center">
                      <span className="text-xs font-bold text-slate-800 dark:text-white">
                        {post.author.charAt(0)}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-slate-700 dark:text-white/80">
                      @{post.author}
                    </span>
                  </div>

                  <button className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 dark:text-white/70 dark:hover:text-white transition-colors">
                    Ler original <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
