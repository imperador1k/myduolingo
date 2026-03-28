"use client";

import React, { useState } from "react";
import Link from "next/link";
import QRCode from "react-qr-code";
import { Copy, Share2 } from "lucide-react";
import { UserSearch } from "@/components/shared/user-search";
import { FollowButton } from "@/components/shared/follow-button";
import { cn } from "@/lib/utils";
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
    const [activeTab, setActiveTab] = useState<'following' | 'followers' | 'search' | 'my-code'>(query ? 'search' : 'following');
    const { toast } = useCustomToast();

    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const profileLink = `${baseUrl}/profile/${currentUserId}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(profileLink);
        toast("Link do perfil copiado para a área de transferência.");
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Segue-me!`,
                    text: `Junta-te a mim e vamos aprender juntos!`,
                    url: profileLink,
                });
            } catch (err) {
                console.log("Erro a partilhar", err);
            }
        } else {
            handleCopy();
        }
    };

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

    const renderUser = (user: UserData, amFollowingVal: boolean, isFollowerVal: boolean) => (
        <div key={user.userId} className="bg-white border-2 border-stone-200 border-b-4 rounded-2xl p-4 mb-3 flex items-center gap-4 transition-all hover:-translate-y-1 hover:border-stone-300">
            <Link href={`/profile/${user.userId}`} className="flex-1 flex items-center gap-4 min-w-0 hover:opacity-80 transition">
                <div className="h-14 w-14 rounded-full border-4 border-amber-400 shrink-0 bg-stone-100 flex items-center justify-center overflow-hidden">
                    {user.userImageSrc ? (
                        <img src={user.userImageSrc} alt={user.userName} className="h-full w-full object-cover" />
                    ) : (
                        <span className="text-2xl font-black text-stone-300">{user.userName[0]?.toUpperCase() || "👤"}</span>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-black text-stone-700 text-lg truncate">{user.userName}</p>
                    <div className="flex items-center gap-2 truncate">
                        <span className="font-bold text-stone-400 text-sm">@{user.userName.toLowerCase().replace(/\s/g, '')}</span>
                        <span className="flex items-center gap-1 text-sm font-bold text-orange-500">
                            <span className="text-base">🔥</span> 12 Dias
                        </span>
                    </div>
                </div>
            </Link>
            <div className="w-32 shrink-0">
                <FollowButton userId={user.userId} isFollowing={amFollowingVal} />
            </div>
        </div>
    );

    const followingUsers = following
        .filter(f => f.following)
        .map(f => f.following!);
    const followerUsers = followers
        .filter(f => f.follower)
        .map(f => f.follower!);

    return (
        <div className="max-w-3xl mx-auto w-full p-4 sm:p-6 pb-24">
            <h1 className="text-3xl font-black text-stone-700 mb-6">Amigos</h1>
            
            <div className="flex flex-wrap gap-4 mb-8">
                <button
                    onClick={() => setActiveTab('following')}
                    className={cn(
                        "px-4 py-2 font-bold uppercase rounded-xl transition-all border-2",
                        activeTab === 'following'
                            ? "bg-[#1CB0F6] text-white border-[#0092d6] border-b-4 active:translate-y-1 active:border-b-2 mb-[4px] active:mb-[6px]"
                            : "bg-transparent text-stone-500 hover:bg-stone-100 border-transparent"
                    )}
                >
                    A Seguir
                </button>
                <button
                    onClick={() => setActiveTab('followers')}
                    className={cn(
                        "px-4 py-2 font-bold uppercase rounded-xl transition-all border-2",
                        activeTab === 'followers'
                            ? "bg-[#1CB0F6] text-white border-[#0092d6] border-b-4 active:translate-y-1 active:border-b-2 mb-[4px] active:mb-[6px]"
                            : "bg-transparent text-stone-500 hover:bg-stone-100 border-transparent"
                    )}
                >
                    Seguidores
                </button>
                <button
                    onClick={() => setActiveTab('search')}
                    className={cn(
                        "px-4 py-2 font-bold uppercase rounded-xl transition-all border-2",
                        activeTab === 'search'
                            ? "bg-[#1CB0F6] text-white border-[#0092d6] border-b-4 active:translate-y-1 active:border-b-2 mb-[4px] active:mb-[6px]"
                            : "bg-transparent text-stone-500 hover:bg-stone-100 border-transparent"
                    )}
                >
                    Encontrar Amigos
                </button>
                <button
                    onClick={() => setActiveTab('my-code')}
                    className={cn(
                        "px-4 py-2 font-bold uppercase rounded-xl transition-all border-2",
                        activeTab === 'my-code'
                            ? "bg-[#1CB0F6] text-white border-[#0092d6] border-b-4 active:translate-y-1 active:border-b-2 mb-[4px] active:mb-[6px]"
                            : "bg-transparent text-stone-500 hover:bg-stone-100 border-transparent"
                    )}
                >
                    O Meu Código
                </button>
            </div>

            {activeTab === 'search' && (
                <div className="flex flex-col gap-4">
                    <UserSearch />
                    {query && (
                        <div className="mt-4">
                            <h2 className="text-xl font-bold text-stone-600 mb-4">Resultados para "{query}"</h2>
                            {searchResults.length === 0 ? (
                                <p className="text-stone-500 font-bold text-center py-6">Ninguém encontrado.</p>
                            ) : (
                                searchResults.map((user) => renderUser(user, amIFollowing(user.userId), followerSet.has(user.userId)))
                            )}
                        </div>
                    )}
                    {!query && suggestions.length > 0 && (
                        <div className="mt-4">
                            <h2 className="text-xl font-black uppercase text-stone-400 tracking-widest mb-4">Sugestões</h2>
                            {suggestions.filter(s => s.userId !== currentUserId).map((user) => 
                                renderUser(user, amIFollowing(user.userId), followerSet.has(user.userId))
                            )}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'following' && (
                <div>
                    {followingUsers.length === 0 ? (
                        <p className="text-stone-500 font-bold text-center py-6">Não estás a seguir ninguém.</p>
                    ) : (
                        followingUsers.map((user) => renderUser(user, amIFollowing(user.userId), followerSet.has(user.userId)))
                    )}
                </div>
            )}

            {activeTab === 'followers' && (
                <div>
                    {followerUsers.length === 0 ? (
                        <p className="text-stone-500 font-bold text-center py-6">Ainda não tens seguidores.</p>
                    ) : (
                        followerUsers.map((user) => renderUser(user, amIFollowing(user.userId), followerSet.has(user.userId)))
                    )}
                </div>
            )}

            {activeTab === 'my-code' && (
                <div className="flex flex-col items-center justify-center p-8 bg-white border-2 border-stone-200 border-b-4 rounded-2xl">
                    <h2 className="text-xl font-bold text-stone-700 mb-6">Convida Amigos</h2>
                    <div className="bg-white p-4 rounded-2xl border-4 border-stone-200 mb-8 max-w-fit shadow-sm">
                        <QRCode
                            value={profileLink}
                            size={200}
                            className="h-auto max-w-full"
                            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                        />
                    </div>
                    
                    <p className="text-stone-500 font-bold text-center mb-8 px-4">
                        A partilha de conhecimento é mais divertida! Mostra o teu código aos teus amigos para eles te adicionarem.
                    </p>

                    <div className="flex gap-4 w-full sm:w-auto">
                        <button
                            onClick={handleCopy}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-stone-100 text-stone-600 font-bold uppercase rounded-xl border-2 border-stone-200 border-b-4 active:translate-y-1 active:border-b-2 transition-all hover:bg-stone-200"
                        >
                            <Copy className="w-5 h-5" />
                            Copiar
                        </button>
                        <button
                            onClick={handleShare}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-[#58CC02] text-white font-bold uppercase rounded-xl border-2 border-[#58AA02] border-b-4 active:translate-y-1 active:border-b-2 transition-all hover:bg-[#46A302]"
                        >
                            <Share2 className="w-5 h-5" />
                            Partilhar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
