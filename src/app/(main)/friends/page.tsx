import { Suspense } from "react";
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

export default function FriendsPage({ searchParams }: Props) {
    return (
        <Suspense fallback={<FriendsSkeleton />}>
            <FriendsData searchParams={searchParams} />
        </Suspense>
    );
}

async function FriendsData({ searchParams }: Props) {
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

// --- SKELETON FALLBACK ---
const FriendsSkeleton = () => {
    return (
        <div className="max-w-4xl mx-auto w-full p-4 sm:p-8 pb-24 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <h1 className="text-4xl font-extrabold text-stone-800">Amigos</h1>
            </div>

            {/* Tactile Tab Switcher Skeleton */}
            <div className="bg-stone-200 p-1.5 rounded-2xl flex items-center max-w-3xl w-full mx-auto mb-10 overflow-hidden shadow-inner h-[56px] animate-pulse"></div>

            {/* Feed Tab Activity Skeleton */}
            <div className="space-y-4 max-w-3xl mx-auto">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white border-2 border-stone-200 border-b-8 rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden shadow-sm">
                        <div className="flex items-center gap-5 w-full">
                            <div className="w-14 h-14 rounded-2xl bg-stone-200 shrink-0 border-2 border-white shadow-sm ring-1 ring-stone-100 animate-pulse" />
                            <div className="flex-1 space-y-2">
                                <div className="h-5 w-3/4 bg-stone-200 rounded-lg animate-pulse" />
                                <div className="h-4 w-1/3 bg-stone-100 rounded-md animate-pulse" />
                            </div>
                        </div>
                        <div className="shrink-0 w-full h-12 sm:w-[160px] bg-stone-100 border-2 border-stone-200 border-b-4 rounded-xl animate-pulse" />
                    </div>
                ))}
            </div>
        </div>
    );
};
