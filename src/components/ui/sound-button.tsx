"use client";

import { useCallback } from "react";
import useSound from "use-sound";
import { Button, type ButtonProps } from "@/components/ui/button";

type SoundButtonProps = ButtonProps & {
    soundSrc?: string;
};

/**
 * A <Button> wrapper that plays an optional sound on click.
 * Falls back silently if the sound file doesn't exist.
 */
export const SoundButton = ({
    soundSrc = "/click_button.mp3",
    onClick,
    children,
    ...props
}: SoundButtonProps) => {
    const [playClick] = useSound(soundSrc, { volume: 0.4 });

    const handleClick = useCallback(
        (e: React.MouseEvent<HTMLButtonElement>) => {
            try {
                playClick();
            } catch {
                // Sound file may not exist yet — fail silently
            }
            onClick?.(e);
        },
        [playClick, onClick]
    );

    return (
        <Button onClick={handleClick} {...props}>
            {children}
        </Button>
    );
};
