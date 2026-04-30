"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { App } from "@capacitor/app";
import { Browser } from "@capacitor/browser";
import { Capacitor } from "@capacitor/core";

/**
 * NativeBridge — Handles Android-specific behaviors:
 * 1. Deep Links: Intercepts custom scheme URLs (myduolingo://) from OAuth bounce
 * 2. Back Button: Maps hardware back button to browser history
 *
 * KEY INSIGHT: We use window.location.href (full page reload) instead of
 * router.push (SPA navigation) for OAuth callbacks. This forces the Clerk SDK
 * to re-initialize from cookies and properly process the OAuth params.
 */
export function NativeBridge() {
  const pathname = usePathname();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    // ── Deep Link Handler ────────────────────────────────────────────
    const setupDeepLinks = async () => {
        await App.addListener('appUrlOpen', async (data) => {
            console.log("[NativeBridge] App opened with URL:", data.url);
            
            Browser.close().catch(() => {});
            
            if (data.url.startsWith('myduolingo://')) {
                // Parse the deep link to extract path + params + hash
                const fakeUrl = new URL(data.url.replace('myduolingo://', 'https://placeholder.com/'));
                const path = '/' + fakeUrl.pathname.replace(/^\/+/, '');
                const search = fakeUrl.search;
                const hash = fakeUrl.hash;
                
                // Build the full WebView URL for a FULL page reload.
                // This is critical: router.push() does SPA navigation which
                // doesn't re-initialize the Clerk SDK. window.location.href
                // forces a full reload so Clerk can read the OAuth params fresh.
                const targetUrl = `${window.location.origin}${path}${search}${hash}`;
                console.log(`[NativeBridge] OAuth bounce → full reload: ${targetUrl}`);
                window.location.href = targetUrl;
                return;
            }

            // Standard App Links (https://myduolingo.vercel.app/*)
            try {
                const url = new URL(data.url);
                window.location.href = url.pathname + url.search + url.hash;
            } catch {
                console.error("[NativeBridge] Failed to parse URL:", data.url);
            }
        });
    };

    // ── Back Button Handler ──────────────────────────────────────────
    const setupBackButton = async () => {
      await App.addListener('backButton', () => {
        if (pathname !== '/learn' && pathname !== '/' && pathname !== '/welcome') {
          window.history.back();
        } else {
          App.exitApp();
        }
      });
    };

    setupDeepLinks();
    setupBackButton();

    return () => {
      App.removeAllListeners();
    };
  }, [pathname]);

  return null;
}
