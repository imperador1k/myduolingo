
import { UserProfile } from "@clerk/nextjs";

export default function SettingsPage() {
    return (
        <div className="flex flex-col items-center justify-center p-6">
            <h1 className="mb-6 text-2xl font-bold text-slate-700">Definições de Perfil</h1>
            <UserProfile path="/settings" routing="path" />
        </div>
    );
}
