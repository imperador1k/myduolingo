"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { App } from "@capacitor/app";
import { Browser } from "@capacitor/browser";
import { Capacitor } from "@capacitor/core";
import { syncNativeLanguage } from "@/actions/user-progress";
import { useTranslations } from "next-intl";
import { usePreferencesStore } from "@/store/use-preferences-store";

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
  const t = useTranslations("providers");

  const nativeLanguage = usePreferencesStore((state) => state.nativeLanguage);
  const setPreference = usePreferencesStore((state) => state.setPreference);

  useEffect(() => {
    // ── Native Language Sync ─────────────────────────────────────────
    const syncLang = async () => {
      const currentLang = navigator.language.split("-")[0];

      if (currentLang !== nativeLanguage) {
        try {
          const res = await syncNativeLanguage(currentLang);
          if (res?.success) {
            setPreference("nativeLanguage", currentLang);
            if (process.env.NODE_ENV !== "production") {
              console.log(t("native_bridge_sync_success"), currentLang);
            }
          }
        } catch (e) {
          // ignore if user is not logged in yet
        }
      }
    };
    syncLang();
  }, [t, nativeLanguage, setPreference]);

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
          console.log(t("tauri_env_detected"));

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
                console.log(t("tauri_bounce_to"), targetUrl);
              window.location.href = targetUrl;
            }
          }
        });

        // Listen for direct deep link opens
        onOpenUrlTauri((urls) => {
          if (process.env.NODE_ENV !== "production")
            console.log(t("tauri_deep_link_received"), urls);
          const url = urls.find((u) => u.startsWith("myduolingo://"));
          if (url) {
            const currentOrigin = window.location.origin;
            const pathAndSearch = url.replace("myduolingo://", "");
            const targetUrl = `${currentOrigin}/${pathAndSearch}`;

            if (window.location.href !== targetUrl) {
              if (process.env.NODE_ENV !== "production")
                console.log(t("tauri_bounce_to"), targetUrl);
              window.location.href = targetUrl;
            }
          }
        });
      }

      // --- Capacitor Mobile Handler ---
      if (Capacitor.isNativePlatform()) {
        await App.addListener("appUrlOpen", async (data) => {
          if (process.env.NODE_ENV !== "production")
            console.log(t("capacitor_app_opened"), data.url);

          Browser.close().catch(() => {});

          if (data.url.startsWith("myduolingo://")) {
            const fakeUrl = new URL(
              data.url.replace("myduolingo://", "https://placeholder.com/"),
            );
            const path = "/" + fakeUrl.pathname.replace(/^\/+/, "");
            const targetUrl = `${window.location.origin}${path}${fakeUrl.search}${fakeUrl.hash}`;
            if (process.env.NODE_ENV !== "production")
              console.log(t("capacitor_oauth_bounce"));
            window.location.href = targetUrl;
            return;
          }

          try {
            const url = new URL(data.url);
            window.location.href = url.pathname + url.search + url.hash;
          } catch {
            console.error(t("capacitor_url_parse_error"), data.url);
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
  }, [pathname, t]);

  return null;
}
