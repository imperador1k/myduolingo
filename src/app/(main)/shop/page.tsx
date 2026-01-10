"use client";

import { Heart, Zap, Shield, Flame, Clock, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ShopItem = {
    id: number;
    icon: React.ReactNode;
    title: string;
    description: string;
    price: number;
    currency: "gems" | "hearts";
    color: string;
};

const shopItems: ShopItem[] = [
    {
        id: 1,
        icon: <Heart className="h-10 w-10 fill-rose-500 text-rose-500" />,
        title: "Recarga de Corações",
        description: "Recupera todos os teus corações",
        price: 350,
        currency: "gems",
        color: "bg-rose-50 border-rose-200",
    },
    {
        id: 2,
        icon: <Zap className="h-10 w-10 fill-amber-400 text-amber-400" />,
        title: "Dobro de XP (15min)",
        description: "Ganha XP a dobrar durante 15 minutos",
        price: 200,
        currency: "gems",
        color: "bg-amber-50 border-amber-200",
    },
    {
        id: 3,
        icon: <Shield className="h-10 w-10 fill-sky-500 text-sky-500" />,
        title: "Congelar Streak",
        description: "Protege o teu streak por um dia",
        price: 200,
        currency: "gems",
        color: "bg-sky-50 border-sky-200",
    },
    {
        id: 4,
        icon: <Flame className="h-10 w-10 fill-orange-500 text-orange-500" />,
        title: "Recuperar Streak",
        description: "Restaura um streak perdido",
        price: 400,
        currency: "gems",
        color: "bg-orange-50 border-orange-200",
    },
    {
        id: 5,
        icon: <Clock className="h-10 w-10 fill-purple-500 text-purple-500" />,
        title: "Tempo Extra",
        description: "Mais 30 segundos em exercícios cronometrados",
        price: 100,
        currency: "gems",
        color: "bg-purple-50 border-purple-200",
    },
    {
        id: 6,
        icon: <Star className="h-10 w-10 fill-green-500 text-green-500" />,
        title: "Lição Bónus",
        description: "Desbloqueia uma lição especial",
        price: 500,
        currency: "gems",
        color: "bg-green-50 border-green-200",
    },
];

const ShopItemCard = ({ item }: { item: ShopItem }) => (
    <div className={cn(
        "flex flex-col items-center rounded-xl border-2 p-6 text-center transition-all hover:shadow-md",
        item.color
    )}>
        <div className="mb-4">{item.icon}</div>
        <h3 className="mb-1 font-bold text-slate-700">{item.title}</h3>
        <p className="mb-4 text-sm text-slate-500">{item.description}</p>
        <Button variant="secondary" size="sm" className="w-full">
            <span className="mr-1">💎</span> {item.price}
        </Button>
    </div>
);

export default function ShopPage() {
    return (
        <div className="pb-12">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-700">Loja</h1>
                    <p className="text-slate-500">Gasta as tuas gemas em power-ups!</p>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-sky-100 px-4 py-2">
                    <span className="text-xl">💎</span>
                    <span className="font-bold text-sky-600">1,250</span>
                </div>
            </div>

            {/* Premium Banner */}
            <div className="mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-purple-500 to-purple-600 p-6 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="mb-2 text-xl font-bold">Duolingo Super</h2>
                        <p className="mb-4 text-sm opacity-90">
                            Corações ilimitados, sem anúncios, e muito mais!
                        </p>
                        <Button variant="super" size="sm">
                            Experimenta 7 dias grátis
                        </Button>
                    </div>
                    <span className="text-6xl">👑</span>
                </div>
            </div>

            {/* Hearts Section */}
            <div className="mb-8">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-600">Os Teus Corações</h2>
                    <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <Heart
                                key={i}
                                className={cn(
                                    "h-6 w-6",
                                    i <= 3 ? "fill-rose-500 text-rose-500" : "text-slate-200"
                                )}
                            />
                        ))}
                    </div>
                </div>
                <div className="rounded-xl border-2 border-rose-200 bg-rose-50 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-bold text-slate-700">Recarga Grátis</p>
                            <p className="text-sm text-slate-500">Pratica para ganhar corações!</p>
                        </div>
                        <Button variant="primary" size="sm">
                            Praticar
                        </Button>
                    </div>
                </div>
            </div>

            {/* Shop Items Grid */}
            <h2 className="mb-4 text-lg font-bold text-slate-600">Power-Ups</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {shopItems.map((item) => (
                    <ShopItemCard key={item.id} item={item} />
                ))}
            </div>
        </div>
    );
}
