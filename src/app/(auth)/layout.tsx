export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-green-400 to-green-500">
            {children}
        </div>
    );
}
