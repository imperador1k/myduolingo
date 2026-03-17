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
        <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
                className="w-full rounded-xl border-2 border-slate-200 pl-10 pr-4 py-2 focus:border-sky-500 focus:outline-none"
                placeholder="Encontrar amigos..."
                onChange={(e) => handleChange(e.target.value)}
                defaultValue={searchParams.get("q")?.toString()}
            />
        </div>
    );
};
