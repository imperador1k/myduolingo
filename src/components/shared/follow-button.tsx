"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { onFollow, onUnfollow } from "@/actions/user-actions";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
    userId: string;
    isFollowing: boolean;
    className?: string;
};

export const FollowButton = ({ userId, isFollowing, className }: Props) => {
    const [pending, startTransition] = useTransition();

    const onClick = () => {
        startTransition(() => {
            if (isFollowing) {
                onUnfollow(userId);
            } else {
                onFollow(userId);
            }
        });
    };

    if (isFollowing) {
        return (
            <button
                className={cn(
                    "bg-rose-500 text-white border-rose-600 border-b-4 rounded-xl px-4 py-2 font-bold text-sm hover:bg-rose-500/90 active:translate-y-1 active:border-b-0 transition-all flex items-center justify-center gap-2 whitespace-nowrap shadow-sm",
                    className || "w-full"
                )}
                onClick={onClick}
                disabled={pending}
            >
                {pending && <Loader2 className="w-4 h-4 animate-spin text-white" />}
                Deixar de seguir
            </button>
        );
    }

    return (
        <Button
            variant="primary"
            className={cn("w-full transition-all text-sm", className)}
            onClick={onClick}
            disabled={pending}
        >
            {pending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            Seguir
        </Button>
    );
};
