"use client";

import { Grid } from "@giphy/react-components";
import { gf } from "@/lib/giphy";
import { useState } from "react";

type Props = {
    onSelect: (gif: any) => void;
};

export const GifSelector = ({ onSelect }: Props) => {
    const [search, setSearch] = useState("");

    // Simple inline debounce implementation if useDebounce is missing or complex
    // But Grid fetchGifs prop is a function.

    const fetchGifs = (offset: number) => {
        if (!search) {
            return gf.trending({ offset, limit: 10 });
        }
        return gf.search(search, { offset, limit: 10 });
    };

    return (
        <div className="flex flex-col gap-3 w-full h-full min-h-0">
            <input
                className="p-3 border-2 border-slate-200 border-b-4 rounded-xl w-full bg-slate-100 focus:bg-white transition outline-none focus:border-sky-400 font-bold text-slate-700 placeholder:text-slate-400 text-sm shrink-0"
                placeholder="Pesquisar GIF..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
            <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden custom-scrollbar bg-slate-50 rounded-xl border-2 border-slate-200 relative">
                <Grid
                    width={typeof window !== 'undefined' ? (window.innerWidth < 640 ? window.innerWidth - 64 : 316) : 316}
                    columns={2}
                    fetchGifs={fetchGifs}
                    key={search}
                    onGifClick={(gif, e) => {
                        e.preventDefault();
                        onSelect(gif);
                    }}
                    noLink
                />
            </div>
        </div>
    );
};
