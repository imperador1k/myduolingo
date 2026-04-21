import { getFollowers, getFollowing, searchUsers, getTopUsers, getFeedActivities } from "@/db/queries";
import { getUserProgress } from "@/db/queries";
import { FriendsClient } from "./friends-client";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

type Props = {
    searchParams: {
        q?: string;
    };
};

export default async function FriendsPage({ searchParams }: Props) {
    const userProgress = await getUserProgress();
    
    if (!userProgress) {
        redirect("/courses");
    }

    const followers = await getFollowers();
    const following = await getFollowing();
    const query = searchParams.q;
    
    // Discovery Engine
    const searchResults = query ? await searchUsers(query) : [];
    const suggestionsResponse = await getTopUsers(8); // Fetch top users as suggestions
    
    // Serialize data payload to strip Drizzle specific prototype traits if any
    const safeSearchResults = searchResults.map(u => ({
        userId: u.userId,
        userName: u.userName,
        userImageSrc: u.userImageSrc
    }));

    const safeSuggestions = suggestionsResponse.map(u => ({
        userId: u.userId,
        userName: u.userName,
        userImageSrc: u.userImageSrc
    }));

    const rawFeedActivities = await getFeedActivities();
    // Serialize to pass to Client Component safely
    const safeFeedActivities = rawFeedActivities.map(fa => ({
        id: fa.id,
        userId: fa.userId,
        type: fa.type,
        metadata: fa.metadata,
        createdAt: fa.createdAt ? fa.createdAt.toISOString() : new Date().toISOString(),
        user: {
            userName: fa.user.userName,
            userImageSrc: fa.user.userImageSrc,
            isPro: fa.user.isPro
        },
        highFiveCount: fa.highFiveCount,
        hasHighFived: fa.hasHighFived
    }));

    return (
        <FriendsClient 
            currentUserId={userProgress.userId}
            currentUserName={userProgress.userName}
            query={query}
            searchResults={safeSearchResults}
            suggestions={safeSuggestions}
            followers={followers as any}
            following={following as any}
            feedActivities={safeFeedActivities}
        />
    );
}

