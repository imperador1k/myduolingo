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
        <div className="flex flex-col gap-2 w-[320px] h-[400px]">
            <input
                className="p-2 border rounded-md w-full bg-slate-100 focus:bg-white transition outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="Pesquisar GIF..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
            <div className="flex-1 overflow-y-auto overflow-x-hidden">
                <Grid
                    width={300}
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
