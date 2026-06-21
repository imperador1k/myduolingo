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
          "bg-rose-500 text-white border-rose-600 border-b-4 rounded-[1.2rem] sm:rounded-[1.5rem] font-black uppercase tracking-widest text-[12px] sm:text-sm hover:bg-rose-400 hover:border-rose-500 active:translate-y-1 active:border-b-0 transition-all flex items-center justify-center gap-2 whitespace-nowrap shadow-sm h-full",
          className || "w-full",
        )}
        onClick={onClick}
        disabled={pending}
      >
        {pending && <Loader2 className="w-5 h-5 animate-spin text-white" />}
        Deixar de Seguir
      </button>
    );
  }

  return (
    <button
      className={cn(
        "bg-[#1CB0F6] text-white border-[#1899D6] border-b-4 rounded-[1.2rem] sm:rounded-[1.5rem] font-black uppercase tracking-widest text-[12px] sm:text-sm hover:bg-[#1899D6] hover:border-[#1380B4] active:translate-y-1 active:border-b-0 transition-all flex items-center justify-center gap-2 whitespace-nowrap shadow-sm h-full",
        className || "w-full",
      )}
      onClick={onClick}
      disabled={pending}
    >
      {pending && <Loader2 className="w-5 h-5 animate-spin mr-2 text-white" />}
      Seguir
    </button>
  );
};
