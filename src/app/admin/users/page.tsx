import { clerkClient } from "@clerk/nextjs/server";
import Image from "next/image";
import { Users, Shield, UserIcon } from "lucide-react";
import { DeleteUserButton } from "@/components/admin/delete-user-button";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
    const client = await clerkClient();
    const { data: users } = await client.users.getUserList({
        limit: 100,
        orderBy: "-created_at",
    });

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-violet-500/10 p-3 rounded-xl border border-violet-500/20">
                        <Users className="w-6 h-6 text-violet-500" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Gestão de Utilizadores</h1>
                        <p className="text-slate-500 font-medium">
                            {users.length} utilizador{users.length !== 1 ? "es" : ""} registado{users.length !== 1 ? "s" : ""} na plataforma.
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mt-4">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b-2 border-slate-100 text-[10px] uppercase tracking-widest text-slate-400 font-black">
                                <th className="px-6 py-4">Utilizador</th>
                                <th className="px-6 py-4">Email</th>
                                <th className="px-6 py-4">Função</th>
                                <th className="px-6 py-4">Membro desde</th>
                                <th className="px-6 py-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {users.map((user) => {
                                const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ") || "Utilizador Anónimo";
                                const email = user.emailAddresses?.[0]?.emailAddress ?? "—";
                                const role = (user.publicMetadata as any)?.role as string | undefined;
                                const isAdmin = role === "admin";
                                const joinedDate = new Date(user.createdAt).toLocaleDateString("pt-PT", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                });

                                return (
                                    <tr key={user.id} className="hover:bg-slate-50/80 transition-colors group">
                                        {/* Avatar & Name */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-100 border border-slate-200 shrink-0 relative shadow-sm">
                                                    {user.imageUrl ? (
                                                        <Image
                                                            src={user.imageUrl}
                                                            alt={fullName}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                            <UserIcon className="w-5 h-5" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-700">{fullName}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 mt-0.5 tracking-wider">{user.id}</p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Email */}
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-medium text-slate-500">{email}</span>
                                        </td>

                                        {/* Role Badge */}
                                        <td className="px-6 py-4">
                                            {isAdmin ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-[10px] font-black uppercase tracking-widest border border-indigo-200">
                                                    <Shield className="w-3 h-3" />
                                                    Admin
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-widest border border-slate-200">
                                                    <UserIcon className="w-3 h-3" />
                                                    Utilizador
                                                </span>
                                            )}
                                        </td>

                                        {/* Join Date */}
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-medium text-slate-400">{joinedDate}</span>
                                        </td>
                                        
                                        {/* Actions */}
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                                                {!isAdmin && (
                                                    <DeleteUserButton userId={user.id} userName={fullName} />
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {users.length === 0 && (
                    <div className="p-16 flex flex-col items-center justify-center text-center gap-4">
                        <div className="bg-slate-100 p-4 rounded-full">
                            <Users className="w-8 h-8 text-slate-300" />
                        </div>
                        <div>
                            <p className="text-slate-600 font-bold text-lg">Nenhum utilizador encontrado</p>
                            <p className="text-slate-400 text-sm mt-1">A plataforma ainda não tem utilizadores registados.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
