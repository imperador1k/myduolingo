import { checkSubscription } from "@/lib/subscription";
import { Lock, Crown } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function PracticeLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const isPro = await checkSubscription();

    if (!isPro) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 max-w-[1056px] mx-auto w-full">
                <div className="bg-white rounded-[2rem] border-2 border-stone-200 border-b-8 p-8 md:p-12 flex flex-col items-center text-center space-y-6 md:max-w-xl transition-all">
                    <div className="w-24 h-24 bg-stone-100 rounded-full flex items-center justify-center border-b-4 border-stone-200 shadow-inner relative">
                        <Image src="/mascot.svg" alt="Mascot" width={60} height={60} className="opacity-50 grayscale" />
                        <div className="absolute -bottom-2 -right-2 bg-stone-400 rounded-full p-2 border-2 border-white">
                            <Lock className="h-6 w-6 text-white" strokeWidth={3} />
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        <h2 className="text-3xl md:text-4xl font-black text-stone-700 tracking-tight">Prática com IA Bloqueada</h2>
                        <p className="text-lg font-medium text-stone-500 leading-relaxed max-w-md mx-auto">
                            Eleva o teu nível com o plano <span className="font-bold text-amber-500">MyDuolingo PRO</span> e acede à nossa Inteligência Artificial sem limites.
                        </p>
                    </div>

                    <div className="w-full pt-6">
                        <Link href="/shop" className="w-full">
                            <Button className="w-full h-14 bg-amber-400 hover:bg-amber-300 border-b-4 border-amber-500 active:border-b-0 active:translate-y-1 text-white font-black uppercase tracking-widest text-lg flex items-center justify-center gap-2 rounded-2xl transition-all">
                                <Crown className="w-6 h-6 fill-white" />
                                DESBLOQUEAR PRO
                            </Button>
                        </Link>
                        <Link href="/learn" className="w-full block mt-4">
                            <Button variant="ghost" className="w-full h-12 text-stone-400 hover:text-stone-500 hover:bg-stone-100 font-bold uppercase tracking-widest rounded-2xl transition-colors">
                                Voltar Atrás
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
