import { redirect } from "next/navigation";
import { getUserAnalytics } from "@/db/queries";
import { DashboardClient } from "./dashboard-client";

const AnalyticsPage = async () => {
    const analyticsData = await getUserAnalytics();

    if (!analyticsData) {
        redirect("/learn");
    }

    return (
        <div className="flex w-full flex-col px-6 py-6 pb-24 md:pb-6 max-w-[1056px] mx-auto min-h-screen">
            <div className="mb-6 flex flex-col gap-y-2">
                <h1 className="text-3xl font-extrabold text-neutral-800">
                    Estatísticas
                </h1>
                <p className="text-lg text-neutral-500">
                    Acompanha o teu domínio do idioma.
                </p>
            </div>
            
            <DashboardClient data={analyticsData} />
        </div>
    );
};

export default AnalyticsPage;
