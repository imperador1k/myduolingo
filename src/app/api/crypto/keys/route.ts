import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db/drizzle";
import { userProgress } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { e2ePublicKey, e2eEncryptedPrivateKey, e2eSalt } = body;

    if (!e2ePublicKey || !e2eEncryptedPrivateKey || !e2eSalt) {
      return new NextResponse("Invalid Key Escrow payload", { status: 400 });
    }

    // Save the User's Key Escrow bundle
    await db
      .update(userProgress)
      .set({
        e2ePublicKey,
        e2eEncryptedPrivateKey,
        e2eSalt,
      })
      .where(eq(userProgress.userId, userId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[CRYPTO_KEYS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
