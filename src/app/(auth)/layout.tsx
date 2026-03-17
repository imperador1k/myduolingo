import Image from "next/image";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 gap-6">
            <div className="flex items-center gap-2 mb-4">
                <Image src="/mascot.svg" alt="Mascot" width={50} height={50} />
                <h1 className="text-3xl font-extrabold tracking-wide text-green-600">
                    myduolingo
                </h1>
            </div>
            {children}
        </div>
    );
}
