
import { getFollowers, getFollowing } from "@/db/queries";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default async function FriendsPage() {
    const followers = await getFollowers();
    const following = await getFollowing();

    return (
        <div className="flex flex-col gap-6 p-6 pb-20">
            <h1 className="text-2xl font-bold text-slate-700">Amigos</h1>
            <div className="grid gap-6 md:grid-cols-2">
                {/* Following */}
                <div className="flex flex-col gap-4 rounded-xl border-2 p-4">
                    <h2 className="text-xl font-bold text-slate-600">A Seguir ({following.length})</h2>
                    {following.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center text-slate-400">
                            <p>Não estás a seguir ninguém.</p>
                            <Link href="/leaderboard" className="mt-2 text-sky-500 hover:underline font-bold">Encontrar pessoas</Link>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {following.map((f: any) => (
                                <Link key={f.following.userId} href={`/profile/${f.following.userId}`} className="flex items-center gap-3 rounded-xl border-2 border-transparent p-2 hover:bg-slate-100 transition-colors">
                                    <div className="h-12 w-12 rounded-full border-2 border-slate-200 overflow-hidden">
                                        {f.following.userImageSrc ? (
                                            <img src={f.following.userImageSrc} alt={f.following.userName} className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center bg-slate-100 text-xl">🧑‍🎓</div>
                                        )}
                                    </div>
                                    <span className="font-bold text-slate-700">{f.following.userName}</span>
                                </Link>
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
                        <div className="flex flex-col gap-2">
                            {followers.map((f: any) => (
                                <Link key={f.follower.userId} href={`/profile/${f.follower.userId}`} className="flex items-center gap-3 rounded-xl border-2 border-transparent p-2 hover:bg-slate-100 transition-colors">
                                    <div className="h-12 w-12 rounded-full border-2 border-slate-200 overflow-hidden">
                                        {f.follower.userImageSrc ? (
                                            <img src={f.follower.userImageSrc} alt={f.follower.userName} className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center bg-slate-100 text-xl">🧑‍🎓</div>
                                        )}
                                    </div>
                                    <span className="font-bold text-slate-700">{f.follower.userName}</span>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
