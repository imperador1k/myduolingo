"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { useState } from "react";

export const UserSearch = () => {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();
    const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout>();

    const handleSearch = (term: string) => {
        const params = new URLSearchParams(searchParams);
        if (term) {
            params.set("q", term);
        } else {
            params.delete("q");
        }
        replace(`${pathname}?${params.toString()}`);
    };

    const handleChange = (term: string) => {
        clearTimeout(timeoutId);
        const id = setTimeout(() => {
            handleSearch(term);
        }, 500);
        setTimeoutId(id);
    };

    return (
        <div className="bg-stone-100 border-2 border-stone-200 border-b-4 rounded-2xl flex items-center px-4 py-3">
            <Search className="h-6 w-6 text-stone-400 shrink-0 mr-3" />
            <input
                className="flex-1 bg-transparent border-none outline-none text-stone-700 placeholder:text-stone-400 font-bold text-lg"
                placeholder="Procurar por nome..."
                onChange={(e) => handleChange(e.target.value)}
                defaultValue={searchParams.get("q")?.toString()}
            />
        </div>
    );
};
