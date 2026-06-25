import SavedPostsClient from "./saved-client";
import { getSavedPosts } from "@/actions/feed";

export const metadata = {
  title: "Cofre de Conhecimento - Precioso",
};

export default async function SavedPostsPage() {
  const savedPosts = await getSavedPosts();
  return <SavedPostsClient initialSavedPosts={savedPosts} />;
}
