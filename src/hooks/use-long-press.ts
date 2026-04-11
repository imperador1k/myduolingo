"use client";

import { useCallback, useRef, useState } from "react";

export const useLongPress = (
    onLongPress: (e: any) => void,
    onClick: (e: any) => void,
    { delay = 500, shouldPreventDefault = true } = {}
) => {
    const [longPressTriggered, setLongPressTriggered] = useState(false);
    const timeout = useRef<NodeJS.Timeout>();
    const target = useRef<any>();

    const start = useCallback(
        (event: any) => {
            if (shouldPreventDefault && event.target) {
                event.target.addEventListener("touchend", preventDefault, {
                    passive: false
                });
                target.current = event.target;
            }
            timeout.current = setTimeout(() => {
                onLongPress(event);
                setLongPressTriggered(true);
            }, delay);
        },
        [onLongPress, delay, shouldPreventDefault]
    );

    const clear = useCallback(
        (event: any, shouldTriggerClick = true) => {
            if (timeout.current) {
                clearTimeout(timeout.current);
            }
            if (shouldTriggerClick && !longPressTriggered) {
                onClick(event);
            }
            setLongPressTriggered(false);
            if (shouldPreventDefault && target.current) {
                target.current.removeEventListener("touchend", preventDefault);
            }
        },
        [onClick, longPressTriggered, shouldPreventDefault]
    );

    const preventDefault = (event: any) => {
        if (!event.cancelable) {
            return;
        }
        event.preventDefault();
    };

    return {
        onMouseDown: (e: any) => start(e),
        onTouchStart: (e: any) => start(e),
        onMouseUp: (e: any) => clear(e),
        onMouseLeave: (e: any) => clear(e, false),
        onTouchEnd: (e: any) => clear(e)
    };
};
