"use client";

import { Crown, Medal, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

type User = {
    rank: number;
    name: string;
    avatar: string;
    xp: number;
    isCurrentUser?: boolean;
};

// Mock leaderboard data
const leaderboardUsers: User[] = [
    { rank: 1, name: "Maria Silva", avatar: "👩‍🦰", xp: 15420 },
    { rank: 2, name: "João Santos", avatar: "👨‍🦱", xp: 14890 },
    { rank: 3, name: "Ana Costa", avatar: "👩‍🦳", xp: 13750 },
    { rank: 4, name: "Tu", avatar: "🧑", xp: 12500, isCurrentUser: true },
    { rank: 5, name: "Pedro Lima", avatar: "👨", xp: 11200 },
    { rank: 6, name: "Sofia Oliveira", avatar: "👩", xp: 10800 },
    { rank: 7, name: "Miguel Ferreira", avatar: "👦", xp: 9500 },
    { rank: 8, name: "Carla Rodrigues", avatar: "👧", xp: 8900 },
    { rank: 9, name: "Bruno Almeida", avatar: "🧔", xp: 7600 },
    { rank: 10, name: "Rita Martins", avatar: "👱‍♀️", xp: 6200 },
];

const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-6 w-6 fill-amber-400 text-amber-400" />;
    if (rank === 2) return <Medal className="h-6 w-6 fill-slate-400 text-slate-400" />;
    if (rank === 3) return <Medal className="h-6 w-6 fill-amber-600 text-amber-600" />;
    return <span className="text-lg font-bold text-slate-400">{rank}</span>;
};

const LeaderboardRow = ({ user }: { user: User }) => (
    <div
        className={cn(
            "flex items-center gap-4 rounded-xl border-2 p-4 transition-all",
            user.isCurrentUser
                ? "border-sky-300 bg-sky-50"
                : "border-slate-100 hover:border-slate-200"
        )}
    >
        {/* Rank */}
        <div className="flex h-10 w-10 items-center justify-center">
            {getRankIcon(user.rank)}
        </div>

        {/* Avatar */}
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-2xl">
            {user.avatar}
        </div>

        {/* Name */}
        <div className="flex-1">
            <p className={cn(
                "font-bold",
                user.isCurrentUser ? "text-sky-600" : "text-slate-700"
            )}>
                {user.name}
                {user.isCurrentUser && <span className="ml-2 text-xs">(Tu)</span>}
            </p>
        </div>

        {/* XP */}
        <div className="text-right">
            <p className="font-bold text-amber-500">{user.xp.toLocaleString()} XP</p>
        </div>
    </div>
);

export default function LeaderboardPage() {
    return (
        <div className="pb-12">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-700">Classificação</h1>
                    <p className="text-slate-500">Liga Diamante • Semana 3</p>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-purple-100 px-4 py-2">
                    <TrendingUp className="h-5 w-5 text-purple-500" />
                    <span className="font-bold text-purple-600">Top 10</span>
                </div>
            </div>

            {/* League Badge */}
            <div className="mb-8 flex items-center justify-center">
                <div className="flex flex-col items-center gap-2 rounded-2xl bg-gradient-to-b from-purple-500 to-purple-600 p-6 text-white shadow-lg">
                    <span className="text-6xl">💎</span>
                    <h2 className="text-xl font-bold">Liga Diamante</h2>
                    <p className="text-sm opacity-80">Termina em 3 dias</p>
                </div>
            </div>

            {/* Promotion Zone */}
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-green-100 px-4 py-2">
                <span className="text-green-600">⬆️</span>
                <p className="text-sm font-bold text-green-600">
                    Top 5 sobe para Liga Ruby
                </p>
            </div>

            {/* Leaderboard */}
            <div className="space-y-2">
                {leaderboardUsers.slice(0, 5).map((user) => (
                    <LeaderboardRow key={user.rank} user={user} />
                ))}
            </div>

            {/* Demotion Zone */}
            <div className="mb-4 mt-6 flex items-center gap-2 rounded-lg bg-rose-100 px-4 py-2">
                <span className="text-rose-600">⬇️</span>
                <p className="text-sm font-bold text-rose-600">
                    Últimos 3 descem para Liga Ouro
                </p>
            </div>

            <div className="space-y-2">
                {leaderboardUsers.slice(5).map((user) => (
                    <LeaderboardRow key={user.rank} user={user} />
                ))}
            </div>
        </div>
    );
}
