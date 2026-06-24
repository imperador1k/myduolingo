import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import FeedClient from "./feed-client";

export default async function FeedPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return <FeedClient />;
}
