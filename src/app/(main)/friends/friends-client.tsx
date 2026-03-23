"use client";

import { useState } from "react";
import Link from "next/link";
import QRCode from "react-qr-code";
import { Copy, Share2, Search, Users, QrCode } from "lucide-react";
import { cn } from "@/lib/utils";
import { UserSearch } from "@/components/shared/user-search";
import { FollowButton } from "@/components/shared/follow-button";
import { useCustomToast } from "@/components/ui/custom-toast";

type UserData = {
    userId: string;
    userName: string;
    userImageSrc: string | null;
};

type FollowRelation = {
    follower?: UserData;
    following?: UserData;
};

type Props = {
    currentUserId: string;
    currentUserName: string;
    query?: string;
    searchResults: UserData[];
    suggestions: UserData[];
    followers: FollowRelation[];
    following: FollowRelation[];
};

export const FriendsClient = ({
    currentUserId,
    currentUserName,
    query,
    searchResults,
    suggestions,
    followers,
    following
}: Props) => {
    // If there is an active search query, immediately jump to 'search' tab.
    const [activeTab, setActiveTab] = useState<'search' | 'my-code' | 'social'>(query ? 'search' : 'search');
    const { toast } = useCustomToast();

    const profileLink = `https://myduolingo.vercel.app/profile/${currentUserId}`;

    const handleCopy = () => {
        if (!profileLink) return;
        navigator.clipboard.writeText(profileLink).then(() => {
            toast("Link copiado para a área de transferência!");
        });
    };

    const handleShare = () => {
        if (!navigator.share || !profileLink) {
            handleCopy();
            return;
        }
        navigator.share({
            title: `Adiciona-me no MyDuolingo`,
            text: `Vem aprender idiomas comigo e acompanha a minha ofensiva!`,
            url: profileLink,
        }).catch((err) => {
            // Usually triggers if the user cancels the native share sheet
            console.log("Share failed or cancelled:", err);
        });
    };

    // Pre-calculate Social graphs for fast O(1) checks
    const followingSet = new Set(
        following
            .filter((f) => f.following !== null && f.following !== undefined)
            .map((f) => f.following!.userId)
    );
    const followerSet = new Set(
        followers
            .filter((f) => f.follower !== null && f.follower !== undefined)
            .map((f) => f.follower!.userId)
    );

    const isMutual = (id: string) => followingSet.has(id) && followerSet.has(id);
    const amIFollowing = (id: string) => followingSet.has(id);

    // Reusable Renderer for a single User Row
    const renderUser = (user: UserData, amFollowingVal: boolean, isFollowerVal: boolean) => (
        <div key={user.userId} className="flex items-center justify-between gap-3 bg-white p-3 rounded-2xl border-2 border-slate-100 shadow-sm transition-all hover:border-slate-300">
            <Link href={`/profile/${user.userId}`} className="flex items-center gap-3 hover:opacity-75 transition truncate">
                <div className="h-12 w-12 shrink-0 rounded-full border-2 border-slate-100 bg-slate-50 overflow-hidden shadow-sm flex items-center justify-center">
                    {user.userImageSrc ? (
                        <img src={user.userImageSrc} alt={user.userName} className="h-full w-full object-cover" />
                    ) : (
                        <span className="text-xl">🧑‍🎓</span>
                    )}
                </div>
                <div className="truncate">
                    <span className="font-bold text-slate-700 truncate block">{user.userName}</span>
                    {isMutual(user.userId) ? (
                        <span className="text-[10px] font-bold text-emerald-500 bg-emerald-100 px-2 py-0.5 rounded-md mt-0.5 inline-block uppercase tracking-wider">Mutuo</span>
                    ) : isFollowerVal ? (
                        <span className="text-[10px] font-bold text-sky-500 bg-sky-100 px-2 py-0.5 rounded-md mt-0.5 inline-block uppercase tracking-wider">Segue-te</span>
                    ) : null}
                </div>
            </Link>
            <div className="w-[140px] shrink-0">
                <FollowButton userId={user.userId} isFollowing={amFollowingVal} />
            </div>
        </div>
    );

    return (
        <div className="flex flex-col gap-6 p-4 sm:p-6 pb-24 max-w-4xl mx-auto w-full">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">Social Hub</h1>

            {/* Sticky Tab Navigation */}
            <div className="sticky top-0 z-10 flex items-center justify-between gap-2 rounded-2xl bg-white p-2 shadow-sm border-2 border-slate-200 overflow-x-auto hide-scrollbar">
                <TabButton 
                    id="search" 
                    icon={<Search className="w-5 h-5" />} 
                    label="Procurar" 
                    active={activeTab === 'search'} 
                    onClick={() => setActiveTab('search')} 
                />
                <TabButton 
                    id="my-code" 
                    icon={<QrCode className="w-5 h-5" />} 
                    label="O Meu Código" 
                    active={activeTab === 'my-code'} 
                    onClick={() => setActiveTab('my-code')} 
                />
                <TabButton 
                    id="social" 
                    icon={<Users className="w-5 h-5" />} 
                    label="Amigos" 
                    active={activeTab === 'social'} 
                    onClick={() => setActiveTab('social')} 
                />
            </div>

            {/* TAB CONTENT: SEARCH (DISCOVERY) */}
            {activeTab === 'search' && (
                <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="rounded-3xl bg-white border-2 border-slate-200 p-2 shadow-sm relative">
                        {/* Wrapper to inject the magnifying glass into the existing UserSearch */}
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 z-10" />
                            <div className="[&>div>input]:pl-12 [&>div>input]:rounded-2xl [&>div>input]:border-0 [&>div>input]:bg-transparent [&>div>input]:shadow-none">
                                <UserSearch />
                            </div>
                        </div>
                    </div>

                    {query ? (
                        <div className="flex flex-col gap-4">
                            <h2 className="text-xl font-bold text-slate-600">Resultados para "{query}"</h2>
                            {searchResults.length === 0 ? (
                                <div className="p-8 text-center rounded-3xl border-2 border-dashed border-slate-200 bg-white">
                                    <p className="text-slate-500 font-medium">Ninguém encontrado.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {searchResults.map((user) => renderUser(user, amIFollowing(user.userId), followerSet.has(user.userId)))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4 mt-2">
                            <h2 className="text-xl font-bold text-slate-600 flex items-center gap-2">
                                <span className="text-2xl">✨</span> Sugestões para ti
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {suggestions.filter(s => s.userId !== currentUserId).map((user) => 
                                    renderUser(user, amIFollowing(user.userId), followerSet.has(user.userId))
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* TAB CONTENT: MY CODE */}
            {activeTab === 'my-code' && (
                <div className="flex flex-col items-center justify-center gap-8 py-8 animate-in fade-in zoom-in-95 duration-300">
                    <div className="relative p-8 bg-white rounded-[2rem] shadow-xl border-4 border-slate-100 flex flex-col items-center">
                        <div className="absolute -top-6 bg-sky-500 text-white font-black px-6 py-2 rounded-full shadow-md tracking-wider uppercase">
                            @{currentUserName}
                        </div>
                        <div className="mt-4 bg-white p-4 rounded-xl border-2 border-slate-50">
                            <QRCode
                                value={profileLink || "https://myduolingo.com"}
                                size={220}
                                level="M"
                                fgColor="#334155" // slate-700
                            />
                        </div>
                        <p className="mt-6 text-slate-500 font-medium text-center max-w-[200px]">
                            Lê o código com a câmara para encontrar o meu perfil!
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-sm">
                        <button
                            onClick={handleCopy}
                            className="flex-1 flex items-center justify-center gap-2 bg-white text-slate-600 font-bold border-2 border-slate-200 py-4 px-6 rounded-2xl hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95 w-full"
                        >
                            <Copy className="h-5 w-5" />
                            Copiar Link
                        </button>
                        <button
                            onClick={handleShare}
                            className="flex-1 flex items-center justify-center gap-2 bg-sky-500 text-white font-bold border-b-4 border-sky-600 py-4 px-6 rounded-2xl hover:bg-sky-400 hover:border-b-sky-500 transition-all active:translate-y-1 active:border-b-0 w-full"
                        >
                            <Share2 className="h-5 w-5" />
                            Partilhar
                        </button>
                    </div>
                </div>
            )}

            {/* TAB CONTENT: SOCIAL GRAPHS (FOLLOWERS/FOLLOWING) */}
            {activeTab === 'social' && (
                <div className="grid gap-8 md:grid-cols-2 animate-in fade-in slide-in-from-right-4 duration-300">
                    {/* Following */}
                    <div className="flex flex-col gap-4">
                        <h2 className="text-xl font-bold text-slate-600 px-2">A Seguir ({followingSet.size})</h2>
                        {following.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 px-6 rounded-3xl border-2 border-dashed border-slate-200 bg-white text-center text-slate-400">
                                <Search className="h-8 w-8 mb-4 text-slate-300" />
                                <p className="font-medium">Não estás a seguir ninguém.</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {following.filter((f) => f.following).map((f) => 
                                    renderUser(f.following!, true, followerSet.has(f.following!.userId))
                                )}
                            </div>
                        )}
                    </div>

                    {/* Followers */}
                    <div className="flex flex-col gap-4">
                        <h2 className="text-xl font-bold text-slate-600 px-2">Seguidores ({followerSet.size})</h2>
                        {followers.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 px-6 rounded-3xl border-2 border-dashed border-slate-200 bg-white text-center text-slate-400">
                                <Users className="h-8 w-8 mb-4 text-slate-300" />
                                <p className="font-medium">Ainda não tens seguidores.</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {followers.filter((f) => f.follower).map((f) => 
                                    renderUser(f.follower!, amIFollowing(f.follower!.userId), true)
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const TabButton = ({
    id,
    icon,
    label,
    active,
    onClick
}: {
    id: string;
    icon: React.ReactNode;
    label: string;
    active: boolean;
    onClick: () => void;
}) => (
    <button
        onClick={onClick}
        className={cn(
            "flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm sm:text-base font-bold rounded-xl whitespace-nowrap transition-all",
            active 
                ? "bg-slate-100 text-slate-800 shadow-sm" 
                : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
        )}
    >
        {icon}
        <span className="hidden sm:inline">{label}</span>
    </button>
);
