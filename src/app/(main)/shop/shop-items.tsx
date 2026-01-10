"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { onRefillHearts } from "@/actions/user-progress";

type Props = {
    hearts: number;
    points: number;
};

export const ShopItems = ({ hearts, points }: Props) => {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const handleRefillHearts = () => {
        startTransition(() => {
            onRefillHearts()
                .then(() => {
                    router.refresh();
                })
                .catch(console.error);
        });
    };

    const needsRefill = hearts < 5;

    return (
        <div className="rounded-xl border-2 border-rose-200 bg-rose-50 p-4">
            <div className="flex items-center justify-between">
                <div>
                    <p className="font-bold text-slate-700">
                        {needsRefill ? "Recarga Grátis" : "Corações Cheios!"}
                    </p>
                    <p className="text-sm text-slate-500">
                        {needsRefill
                            ? `Tens ${hearts}/5 corações`
                            : "Todos os corações disponíveis"}
                    </p>
                </div>

                {needsRefill && (
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={handleRefillHearts}
                        disabled={isPending}
                    >
                        {isPending ? "A recarregar..." : "Recarregar"}
                    </Button>
                )}

                {!needsRefill && (
                    <Button variant="secondary" size="sm" disabled>
                        ✓ Cheio
                    </Button>
                )}
            </div>
        </div>
    );
};
