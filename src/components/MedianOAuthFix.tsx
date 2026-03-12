"use client";
import { useAuth } from "@clerk/nextjs";
import { useEffect } from "react";

export default function MedianOAuthFix() {
    const { isSignedIn, isLoaded } = useAuth();

    useEffect(() => {
        // Abort if not in browser or not inside the Median wrapper
        if (typeof window === "undefined" || !navigator.userAgent.includes("median")) return;

        if (isLoaded && isSignedIn) {
            // sessionStorage is unique per window tab (App Browser has its own, Main WebView has its own).
            const hasSynced = sessionStorage.getItem("median_oauth_synced");

            if (!hasSynced) {
                // Mark this specific window as synced so we don't infinitely loop
                sessionStorage.setItem("median_oauth_synced", "true");

                // Magic Median bridge command:
                // When executed inside the App Browser, dismisses it and loads the URL in the Main WebView.
                window.location.href =
                    "median://open/internal?url=" + encodeURIComponent(window.location.href);
            }
        }
    }, [isLoaded, isSignedIn]);

    return null; // Invisible component
}
