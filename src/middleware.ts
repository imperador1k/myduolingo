import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
    "/",
    "/sign-in(.*)",
    "/sign-up(.*)",
    "/admin-login(.*)", // Crucial: explicitly mark as public
    "/auth-success(.*)",
    "/api/webhooks(.*)",
    "/api/auth/native-google",
]);

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, request) => {
    // PREVENT INFINITE LOOP: If we are already on the admin-login page, let it load!
    if (request.nextUrl.pathname.startsWith("/admin-login")) {
        return NextResponse.next();
    }

    // Military-grade Zero Trust for /admin route
    if (isAdminRoute(request)) {
        const { userId } = await auth();
        const vaultLoginUrl = new URL("/admin-login", request.url);

        // LAYER 1: Basic Clerk Authentication
        if (!userId) {
            return NextResponse.redirect(new URL("/", request.url));
        }

        // LAYER 2: Master Key (Allowlist)
        const allowedIds = process.env.ADMIN_ALLOWED_USER_IDS?.split(",").map(id => id.trim()) || [];
        if (!allowedIds.includes(userId)) {
            // Unconditionally reject bypassing the allowlist
            return NextResponse.redirect(new URL("/", request.url));
        }

        // LAYER 3: SUDO MODE (Custom Secure Cookie)
        const vaultCookie = request.cookies.get("admin_vault_session");
        if (!vaultCookie || vaultCookie.value !== "authorized") {
            // Force strict redirection to the Vault login
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
