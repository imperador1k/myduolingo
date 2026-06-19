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
    const isCapacitor = Capacitor.isNativePlatform();
    // Use UserAgent as the primary detection — same strategy as all other files.
    // __TAURI_INTERNALS__ is a fallback in case withGlobalTauri is enabled.
    const isTauri =
      typeof window !== "undefined" &&
      (navigator.userAgent.includes("TauriDesktop") ||
        !!(window as any).__TAURI_INTERNALS__);

    if (!isCapacitor && !isTauri) return;

    // ── Deep Link Handler ────────────────────────────────────────────
    const setupDeepLinks = async () => {
      // --- Tauri Desktop Handler ---
      if (isTauri) {
        if (process.env.NODE_ENV !== "production")
          console.log("[NativeBridge] Tauri Desktop environment detected.");

        // Listen for deep link events (single instance intercept)
        const { listen } = await import("@tauri-apps/api/event");
        const { onOpenUrl: onOpenUrlTauri } =
          await import("@tauri-apps/plugin-deep-link");

        listen<string[]>("app-instance-opened", (event) => {
          const urlArg = event.payload.find((arg) =>
            arg.startsWith("myduolingo://"),
          );
          if (urlArg) {
            const currentOrigin = window.location.origin;
            const pathAndSearch = urlArg.replace("myduolingo://", "");
            const targetUrl = `${currentOrigin}/${pathAndSearch}`;

            if (window.location.href !== targetUrl) {
              if (process.env.NODE_ENV !== "production")
                console.log("[Tauri] Bouncing to:", targetUrl);
              window.location.href = targetUrl;
            }
          }
        });

        // Listen for direct deep link opens
        onOpenUrlTauri((urls) => {
          if (process.env.NODE_ENV !== "production")
            console.log("[Tauri] Deep link received:", urls);
          const url = urls.find((u) => u.startsWith("myduolingo://"));
          if (url) {
            const currentOrigin = window.location.origin;
            const pathAndSearch = url.replace("myduolingo://", "");
            const targetUrl = `${currentOrigin}/${pathAndSearch}`;

            if (window.location.href !== targetUrl) {
              if (process.env.NODE_ENV !== "production")
                console.log("[Tauri] Bouncing to:", targetUrl);
              window.location.href = targetUrl;
            }
          }
        });
      }

      // --- Capacitor Mobile Handler ---
      if (Capacitor.isNativePlatform()) {
        await App.addListener("appUrlOpen", async (data) => {
          if (process.env.NODE_ENV !== "production")
            console.log("[NativeBridge] App opened with URL:", data.url);

          Browser.close().catch(() => {});

          if (data.url.startsWith("myduolingo://")) {
            const fakeUrl = new URL(
              data.url.replace("myduolingo://", "https://placeholder.com/"),
            );
            const path = "/" + fakeUrl.pathname.replace(/^\/+/, "");
            const targetUrl = `${window.location.origin}${path}${fakeUrl.search}${fakeUrl.hash}`;
            if (process.env.NODE_ENV !== "production")
              console.log(
                `[NativeBridge] OAuth bounce → full reload: ${targetUrl}`,
              );
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
      if (!isCapacitor) return;

      await App.addListener("backButton", () => {
        if (
          pathname !== "/learn" &&
          pathname !== "/" &&
          pathname !== "/welcome"
        ) {
          window.history.back();
        } else {
          App.exitApp();
        }
      });
    };

    setupDeepLinks();
    setupBackButton();

    return () => {
      if (isCapacitor) {
        App.removeAllListeners();
      }
    };
  }, [pathname]);

  return null;
}
