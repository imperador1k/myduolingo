import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getUserAnalytics } from "@/db/queries";
import { DashboardClient } from "./dashboard-client";

export default function AnalyticsPage() {
    return (
        <div className="flex w-full flex-col px-6 py-6 pb-24 md:pb-6 max-w-[1056px] mx-auto min-h-screen">
            <div className="mb-6 flex flex-col gap-y-2 animate-in fade-in duration-500">
                <h1 className="text-3xl font-extrabold text-neutral-800">
                    Estatísticas
                </h1>
                <p className="text-lg text-neutral-500">
                    Acompanha o teu domínio do idioma.
                </p>
            </div>
            
            <Suspense fallback={<AnalyticsSkeleton />}>
                <AnalyticsData />
            </Suspense>
        </div>
    );
}

async function AnalyticsData() {
    const analyticsData = await getUserAnalytics();

    if (!analyticsData) {
        redirect("/learn");
    }

    return (
        <div className="animate-in fade-in duration-500">
            <DashboardClient data={analyticsData} />
        </div>
    );
}

// --- SKELETON FALLBACK ---
const AnalyticsSkeleton = () => {
    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-500 w-full">
            {/* Top Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-stone-100 border-2 border-stone-200 border-b-8 rounded-2xl h-32 animate-pulse" />
                ))}
            </div>

            {/* Main Chart Skeleton */}
            <div className="bg-stone-100 border-2 border-stone-200 border-b-8 rounded-3xl h-[400px] animate-pulse" />

            {/* Bottom Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-stone-100 border-2 border-stone-200 border-b-8 rounded-2xl h-[300px] animate-pulse" />
                <div className="bg-stone-100 border-2 border-stone-200 border-b-8 rounded-2xl h-[300px] animate-pulse" />
            </div>
        </div>
    );
};
