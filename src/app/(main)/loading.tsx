import { LottieAnimation } from "@/components/ui/lottie-animation";

export default function MainLoading() {
    return (
        <div className="h-[80vh] w-full flex flex-col items-center justify-center">
            <div className="w-40 h-40 drop-shadow-md">
                <LottieAnimation className="w-full h-full" />
            </div>
            <p className="text-slate-500 font-bold mt-4 animate-pulse">
                A preparar a tua jornada...
            </p>
        </div>
    );
}
