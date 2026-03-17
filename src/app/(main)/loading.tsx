export default function MainLoading() {
    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
                {/* Header skeleton */}
                <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-slate-200 rounded-full" />
                    <div className="space-y-2 flex-1">
                        <div className="h-4 w-48 bg-slate-200 rounded-lg" />
                        <div className="h-3 w-32 bg-slate-200/70 rounded-lg" />
                    </div>
                    <div className="h-10 w-24 bg-slate-200 rounded-xl" />
                </div>

                {/* Progress bar skeleton */}
                <div className="h-3 w-full bg-slate-200 rounded-full" />

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-20 bg-slate-200 rounded-2xl" />
                    ))}
                </div>

                {/* Main content cards */}
                <div className="space-y-4 pt-2">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-slate-100">
                            <div className="h-12 w-12 bg-slate-200 rounded-xl shrink-0" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 w-3/4 bg-slate-200 rounded-lg" />
                                <div className="h-3 w-1/2 bg-slate-200/70 rounded-lg" />
                            </div>
                            <div className="h-8 w-8 bg-slate-200 rounded-full shrink-0" />
                        </div>
                    ))}
                </div>

                {/* Bottom CTA skeleton */}
                <div className="h-14 bg-slate-200 rounded-2xl mt-4" />
            </div>
        </div>
    );
}
