import { LottieAnimation } from "@/components/ui/lottie-animation";

export const LoadingScreen = () => {
    return (
        <div className="flex h-full w-full min-h-screen flex-col items-center justify-center bg-white z-50">
            <LottieAnimation className="w-48 h-48 lg:w-64 lg:h-64" />
            <h2 className="mt-4 text-xl font-bold tracking-wide text-slate-500 animate-pulse">
                A carregar...
            </h2>
        </div>
    );
};


