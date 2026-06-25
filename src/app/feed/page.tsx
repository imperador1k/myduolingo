import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import FeedClient from "./feed-client";
import { getFeedPosts } from "@/actions/feed";

export default async function FeedPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const posts = await getFeedPosts(15);

  return <FeedClient initialPosts={posts} />;
}
