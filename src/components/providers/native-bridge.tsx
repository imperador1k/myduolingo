"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { App } from "@capacitor/app";
import { Browser } from "@capacitor/browser";
import { Capacitor } from "@capacitor/core";

/**
 * NativeBridge — Handles Android-specific behaviors:
 * 1. Deep Links: Intercepts custom scheme URLs (myduolingo://) from OAuth bounce
 * 2. Back Button: Maps hardware back button to browser history
 * 3. OAuth Interception: Catches Clerk's programmatic redirect to Google/Clerk
 *    and opens it in a Chrome Custom Tab instead of navigating the WebView away.
 *
 * WHY: The Clerk <SignIn /> component calls signIn.authenticateWithRedirect() which
 * does window.location.href = "https://accounts.clerk.dev/..." (then Google).
 * If we let the WebView navigate there, Google blocks it ("unsafe browser").
 * Instead, we intercept the navigation and open it in Chrome Custom Tab.
 * The sign-in attempt is already stored in the WebView's Clerk state, so when
 * the user returns via deep link, AuthenticateWithRedirectCallback can complete it.
 */
export function NativeBridge() {
  const router = useRouter();
  const pathname = usePathname();
  const isInterceptingRef = useRef(false);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    // ── Deep Link Handler ────────────────────────────────────────────
    const setupDeepLinks = async () => {
        await App.addListener('appUrlOpen', async (data) => {
            console.log("[NativeBridge] App opened with URL:", data.url);
            
            Browser.close().catch(() => {});
            
            if (data.url.startsWith('myduolingo://')) {
                const fakeUrl = new URL(data.url.replace('myduolingo://', 'https://placeholder.com/'));
                const path = '/' + fakeUrl.pathname.replace(/^\/+/, '');
                const searchParams = fakeUrl.search;
                
                console.log(`[NativeBridge] OAuth bounce → ${path}${searchParams}`);
                router.push(`${path}${searchParams}`);
                return;
            }

            try {
                const url = new URL(data.url);
                router.push(url.pathname + url.search);
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

    // ── OAuth Navigation Interceptor ─────────────────────────────────
    // Monkey-patches window.location to catch Clerk's programmatic redirects
    // to external OAuth providers and open them in Chrome Custom Tab instead.
    const setupOAuthInterceptor = () => {
      const originalDescriptor = Object.getOwnPropertyDescriptor(window, 'location');
      
      // We intercept assignments to window.location.href
      const originalAssign = window.location.assign.bind(window.location);
      const originalReplace = window.location.replace.bind(window.location);

      const shouldIntercept = (url: string): boolean => {
        return (
          url.includes('accounts.google.com') ||
          url.includes('clerk.accounts.dev') ||
          url.includes('.clerk.com')
        );
      };

      const interceptNavigation = async (url: string): Promise<boolean> => {
        if (!shouldIntercept(url) || isInterceptingRef.current) return false;
        
        isInterceptingRef.current = true;
        console.log("[NativeBridge] Intercepted OAuth redirect →", url.substring(0, 80) + "...");
        
        try {
          await Browser.open({ url, windowName: '_blank' });
        } catch (err) {
          console.error("[NativeBridge] Failed to open Browser:", err);
          isInterceptingRef.current = false;
          return false;
        }
        
        // Reset after a delay so user can retry if needed
        setTimeout(() => { isInterceptingRef.current = false; }, 5000);
        return true;
      };

      // Override location.assign
      window.location.assign = function(url: string) {
        interceptNavigation(url).then(intercepted => {
          if (!intercepted) originalAssign(url);
        });
      } as typeof window.location.assign;

      // Override location.replace
      window.location.replace = function(url: string) {
        interceptNavigation(url).then(intercepted => {
          if (!intercepted) originalReplace(url);
        });
      } as typeof window.location.replace;

      // Also intercept link clicks (for anchor tags)
      const handleLinkClick = async (e: MouseEvent) => {
        const anchor = (e.target as HTMLElement).closest('a');
        if (!anchor) return;
        
        if (shouldIntercept(anchor.href)) {
          e.preventDefault();
          e.stopPropagation();
          await interceptNavigation(anchor.href);
        }
      };

      document.addEventListener('click', handleLinkClick, true);

      return () => {
        // Restore originals
        window.location.assign = originalAssign;
        window.location.replace = originalReplace;
        document.removeEventListener('click', handleLinkClick, true);
      };
    };

    setupDeepLinks();
    setupBackButton();
    const cleanupOAuth = setupOAuthInterceptor();

    return () => {
      App.removeAllListeners();
      cleanupOAuth();
    };
  }, [pathname, router]);

  return null;
}
