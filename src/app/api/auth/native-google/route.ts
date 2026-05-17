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

        const ticket = await googleClient.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
            return NextResponse.json({ error: "Invalid Google token" }, { status: 401 });
        }

        const { email, given_name, family_name, picture } = payload;

        const clerk = await clerkClient();
        const userList = await clerk.users.getUserList({ emailAddress: [email] });

        let userId: string;

        if (userList.data.length > 0) {
            userId = userList.data[0].id;
        } else {
            const newUser = await clerk.users.createUser({
                emailAddress: [email],
                firstName: given_name ?? "",
                lastName: family_name ?? "",
                skipPasswordChecks: true,
                skipPasswordRequirement: true,
                ...(picture ? { profileImageUrl: picture } : {}),
            });
            userId = newUser.id;
        }

        const signInToken = await clerk.signInTokens.createSignInToken({
            userId,
            expiresInSeconds: 60,
        });

        return NextResponse.json({ ticket: signInToken.token });
    } catch (error) {
        console.error("[native-google] Authentication error");
        return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
    }
}
