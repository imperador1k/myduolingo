"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { onFollow, onUnfollow } from "@/actions/user-actions";

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

    return (
        <Button
            variant={isFollowing ? "danger" : "primary"}
            className={className || "w-full"}
            onClick={onClick}
            disabled={pending}
        >
            {isFollowing ? "Deixar de seguir" : "Seguir"}
        </Button>
    );
};
