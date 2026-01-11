
import { getFollowers, getFollowing, searchUsers } from "@/db/queries";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { UserSearch } from "@/components/user-search";
import { FollowButton } from "@/components/follow-button";

type Props = {
    searchParams: {
        q?: string;
    };
};

export default async function FriendsPage({ searchParams }: Props) {
    const followers = await getFollowers();
    const following = await getFollowing();
    const query = searchParams.q;
    const searchResults = query ? await searchUsers(query) : [];

    const followingSet = new Set(following.map(f => f.following.userId));
    const followerSet = new Set(followers.map(f => f.follower.userId));

    const isMutual = (id: string) => followingSet.has(id) && followerSet.has(id);
    const amIFollowing = (id: string) => followingSet.has(id);

    return (
        <div className="flex flex-col gap-6 p-6 pb-20">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold text-slate-700">Amigos</h1>
                <UserSearch />
            </div>

            {/* Search Results */}
            {query && (
                <div className="flex flex-col gap-4 rounded-xl border-2 border-sky-200 bg-sky-50 p-4">
                    <h2 className="text-xl font-bold text-slate-600">Resultados para "{query}"</h2>
                    {searchResults.length === 0 ? (
                        <p className="text-slate-400">Ninguém encontrado.</p>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {searchResults.map((user: any) => (
                                <div key={user.userId} className="flex items-center justify-between gap-3 bg-white p-3 rounded-xl border-2">
                                    <Link href={`/profile/${user.userId}`} className="flex items-center gap-3 hover:opacity-75 transition">
                                        <div className="h-10 w-10 rounded-full border-2 border-slate-200 overflow-hidden">
                                            {user.userImageSrc ? (
                                                <img src={user.userImageSrc} alt={user.userName} className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center bg-slate-100 text-xl">🧑‍🎓</div>
                                            )}
                                        </div>
                                        <div>
                                            <span className="font-bold text-slate-700">{user.userName}</span>
                                            {isMutual(user.userId) && (
                                                <div className="text-xs font-bold text-sky-500 bg-sky-100 px-2 py-0.5 rounded-md inline-block ml-2">
                                                    Amigo
                                                </div>
                                            )}
                                        </div>
                                    </Link>
                                    <div className="w-[160px]">
                                        <FollowButton userId={user.userId} isFollowing={amIFollowing(user.userId)} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <div className="grid gap-6 md:grid-cols-2">
                {/* Following */}
                <div className="flex flex-col gap-4 rounded-xl border-2 p-4">
                    <h2 className="text-xl font-bold text-slate-600">A Seguir ({following.length})</h2>
                    {following.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center text-slate-400">
                            <p>Não estás a seguir ninguém.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {following.map((f: any) => (
                                <div key={f.following.userId} className="flex items-center justify-between gap-3">
                                    <Link href={`/profile/${f.following.userId}`} className="flex items-center gap-3 hover:opacity-75 transition">
                                        <div className="h-10 w-10 rounded-full border-2 border-slate-200 overflow-hidden">
                                            {f.following.userImageSrc ? (
                                                <img src={f.following.userImageSrc} alt={f.following.userName} className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center bg-slate-100 text-xl">🧑‍🎓</div>
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-700">{f.following.userName}</div>
                                            {isMutual(f.following.userId) && (
                                                <div className="text-xs font-bold text-sky-500 bg-sky-100 px-2 py-0.5 rounded-md mt-1 w-fit">
                                                    Amigo
                                                </div>
                                            )}
                                        </div>
                                    </Link>
                                    <div className="w-[160px]">
                                        <FollowButton userId={f.following.userId} isFollowing={true} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Followers */}
                <div className="flex flex-col gap-4 rounded-xl border-2 p-4">
                    <h2 className="text-xl font-bold text-slate-600">Seguidores ({followers.length})</h2>
                    {followers.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center text-slate-400">
                            <p>Ainda não tens seguidores.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {followers.map((f: any) => (
                                <div key={f.follower.userId} className="flex items-center justify-between gap-3">
                                    <Link href={`/profile/${f.follower.userId}`} className="flex items-center gap-3 hover:opacity-75 transition">
                                        <div className="h-10 w-10 rounded-full border-2 border-slate-200 overflow-hidden">
                                            {f.follower.userImageSrc ? (
                                                <img src={f.follower.userImageSrc} alt={f.follower.userName} className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center bg-slate-100 text-xl">🧑‍🎓</div>
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-700">{f.follower.userName}</div>
                                            {isMutual(f.follower.userId) && (
                                                <div className="text-xs font-bold text-sky-500 bg-sky-100 px-2 py-0.5 rounded-md mt-1 w-fit">
                                                    Amigo
                                                </div>
                                            )}
                                        </div>
                                    </Link>
                                    <div className="w-[160px]">
                                        <FollowButton userId={f.follower.userId} isFollowing={amIFollowing(f.follower.userId)} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
