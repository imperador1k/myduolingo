import Link from "next/link";
import { ReactNode } from "react";

interface LegalLayoutProps {
    title: string;
    lastUpdated: string;
    icon: ReactNode;
    children: ReactNode;
    backHref?: string;
}

export const LegalLayout = ({ title, lastUpdated, icon, children, backHref = "/settings" }: LegalLayoutProps) => {
    return (
        <div className="min-h-screen bg-[#fbf9f8] py-12 px-4">
            <div className="max-w-3xl mx-auto">
                <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-white border-2 border-stone-200 border-b-4 rounded-2xl shadow-sm transform -rotate-3">
                            {icon}
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black text-stone-700 tracking-tight">{title}</h1>
                            <div className="mt-2 inline-block bg-stone-200 text-stone-500 font-bold text-xs px-3 py-1 rounded-full uppercase tracking-widest">
                                Atualizado: {lastUpdated}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    {children}
                </div>

                <div className="mt-12 flex justify-center md:justify-start">
                    <Link 
                        href={backHref}
                        className="bg-stone-200 text-stone-500 border-b-4 border-stone-300 active:translate-y-1 active:border-b-0 hover:bg-stone-300 rounded-2xl px-12 py-4 font-black uppercase tracking-widest text-center block w-full md:w-auto transition-all"
                    >
                        VOLTAR
                    </Link>
                </div>
            </div>
        </div>
    );
};

export const LegalSection = ({ title, children, className }: { title: string; children: ReactNode; className?: string }) => {
    return (
        <div className={`bg-white border-2 border-stone-200 border-b-8 rounded-3xl p-6 md:p-8 shadow-sm ${className || ''}`}>
            <h2 className="text-2xl font-black text-[#1CB0F6] mb-4">{title}</h2>
            <div className="text-lg text-stone-600 leading-relaxed font-medium space-y-4">
                {children}
            </div>
        </div>
    );
};
