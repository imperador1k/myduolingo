import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { validateVaultToken } from "@/lib/vault-token";

const isPublicRoute = createRouteMatcher([
    "/",
    "/onboarding(.*)",
    "/sign-in(.*)",
    "/sign-up(.*)",
    "/forgot-password(.*)",
    "/admin-login(.*)",
    "/auth-success(.*)",
    "/sso-callback(.*)",
    "/mobile-auth(.*)",
    "/native-callback(.*)",
    "/api/webhooks(.*)",
    "/api/auth/native-google",
]);

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, request) => {
    if (request.nextUrl.pathname.startsWith("/admin-login")) {
        return NextResponse.next();
    }

    if (request.nextUrl.pathname.startsWith("/sign-up")) {
        const onboardingCookie = request.cookies.get("onboarding_completed");
        if (!onboardingCookie || onboardingCookie.value !== "true") {
            return NextResponse.redirect(new URL("/onboarding", request.url));
        }
    }

    if (isAdminRoute(request)) {
        const { userId } = await auth();
        const vaultLoginUrl = new URL("/admin-login", request.url);

        if (!userId) {
            return NextResponse.redirect(new URL("/", request.url));
        }

        const allowedIds = process.env.ADMIN_ALLOWED_USER_IDS?.split(",").map(id => id.trim()) || [];
        if (!allowedIds.includes(userId)) {
            return NextResponse.redirect(new URL("/", request.url));
        }

        const vaultCookie = request.cookies.get("admin_vault_session");
        if (!vaultCookie) {
            return NextResponse.redirect(vaultLoginUrl);
        }

        const vaultUserId = validateVaultToken(vaultCookie.value);
        if (!vaultUserId || vaultUserId !== userId) {
            return NextResponse.redirect(vaultLoginUrl);
        }
    }

    if (!isPublicRoute(request)) {
        await auth.protect();
    }
});

export const config = {
    matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
