import Image from "next/image";

export const LoadingScreen = () => {
    return (
        <div className="flex h-full w-full min-h-screen flex-col items-center justify-center bg-white z-50">
            <div className="relative h-[200px] w-[200px] lg:h-[300px] lg:w-[300px]">
                <video
                    src="/duolingo_home.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="object-contain h-full w-full"
                />
            </div>
            <h2 className="mt-8 text-xl font-bold tracking-wide text-slate-500 animate-pulse">
                A carregar...
            </h2>
        </div>
    );
};
