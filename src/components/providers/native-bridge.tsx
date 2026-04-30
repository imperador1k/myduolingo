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
        // --- Tauri Desktop Handler ---
        if ((window as any).__TAURI_INTERNALS__) {
            console.log("[NativeBridge] Tauri Desktop environment detected.");
            
            // Listen for deep link events (single instance intercept)
            const { listen } = await import('@tauri-apps/api/event');
            listen<string[]>('app-instance-opened', (event) => {
                const url = event.payload.find(arg => arg.startsWith('myduolingo://'));
                if (url) {
                    const fakeUrl = new URL(url.replace('myduolingo://', 'https://placeholder.com/'));
                    const path = '/' + fakeUrl.pathname.replace(/^\/+/, '');
                    const targetUrl = `${window.location.origin}${path}${fakeUrl.search}${fakeUrl.hash}`;
                    console.log(`[NativeBridge] Tauri OAuth bounce → full reload: ${targetUrl}`);
                    window.location.href = targetUrl;
                }
            });

            // Listen for direct deep link opens
            const { onOpenUrl } = await import('@tauri-apps/plugin-deep-link');
            onOpenUrl((urls) => {
                const url = urls[0];
                if (url && url.startsWith('myduolingo://')) {
                    const fakeUrl = new URL(url.replace('myduolingo://', 'https://placeholder.com/'));
                    const path = '/' + fakeUrl.pathname.replace(/^\/+/, '');
                    const targetUrl = `${window.location.origin}${path}${fakeUrl.search}${fakeUrl.hash}`;
                    console.log(`[NativeBridge] Tauri OAuth bounce → full reload: ${targetUrl}`);
                    window.location.href = targetUrl;
                }
            });
        }

        // --- Capacitor Mobile Handler ---
        if (Capacitor.isNativePlatform()) {
            await App.addListener('appUrlOpen', async (data) => {
                console.log("[NativeBridge] App opened with URL:", data.url);
                
                Browser.close().catch(() => {});
                
                if (data.url.startsWith('myduolingo://')) {
                    const fakeUrl = new URL(data.url.replace('myduolingo://', 'https://placeholder.com/'));
                    const path = '/' + fakeUrl.pathname.replace(/^\/+/, '');
                    const targetUrl = `${window.location.origin}${path}${fakeUrl.search}${fakeUrl.hash}`;
                    console.log(`[NativeBridge] OAuth bounce → full reload: ${targetUrl}`);
                    window.location.href = targetUrl;
                    return;
                }

                try {
                    const url = new URL(data.url);
                    window.location.href = url.pathname + url.search + url.hash;
                } catch {
                    console.error("[NativeBridge] Failed to parse URL:", data.url);
                }
            });
        }
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
