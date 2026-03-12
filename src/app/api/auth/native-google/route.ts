import { NextRequest, NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";
import { clerkClient } from "@clerk/nextjs/server";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function POST(req: NextRequest) {
    try {
        const { idToken } = await req.json();

        if (!idToken) {
            return NextResponse.json({ error: "Missing idToken" }, { status: 400 });
        }

        // ── Step 1: Verify the Google ID Token ───────────────────────────
        const ticket = await googleClient.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
            return NextResponse.json({ error: "Invalid Google token" }, { status: 401 });
        }

        const { email, given_name, family_name, picture } = payload;
        console.log(`[native-google] Verified token for: ${email}`);

        // ── Step 2: Find or Create the user in Clerk ─────────────────────
        const clerk = await clerkClient();
        const userList = await clerk.users.getUserList({ emailAddress: [email] });

        let userId: string;

        if (userList.data.length > 0) {
            // Existing user
            userId = userList.data[0].id;
            console.log(`[native-google] Found existing user: ${userId}`);
        } else {
            // Create new user (no password – SSO only)
            const newUser = await clerk.users.createUser({
                emailAddress: [email],
                firstName: given_name ?? "",
                lastName: family_name ?? "",
                skipPasswordChecks: true,
                skipPasswordRequirement: true,
                // Attach Google profile picture as external account image
                ...(picture ? { profileImageUrl: picture } : {}),
            });
            userId = newUser.id;
            console.log(`[native-google] Created new user: ${userId}`);
        }

        // ── Step 3: Create a short-lived Clerk Sign-In Token (Ticket) ────
        const signInToken = await clerk.signInTokens.createSignInToken({
            userId,
            expiresInSeconds: 60, // 1 minute is plenty for the frontend to consume it
        });

        console.log(`[native-google] Sign-in ticket issued for: ${userId}`);

        return NextResponse.json({ ticket: signInToken.token });
    } catch (error: unknown) {
        console.error("[native-google] Error:", error);
        const message = error instanceof Error ? error.message : "Internal server error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
