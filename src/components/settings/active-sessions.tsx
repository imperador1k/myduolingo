"use client";

import { useUser, useSession } from "@clerk/nextjs";
import {
  Monitor,
  Smartphone,
  Globe,
  LogOut,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { SessionWithActivitiesResource } from "@clerk/types";

import { revokeDeviceSession } from "@/actions/user-actions";

export const ActiveSessions = () => {
  const { user, isLoaded } = useUser();
  const { session: currentSession } = useSession();
  const [sessions, setSessions] = useState<SessionWithActivitiesResource[]>([]);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);

  useEffect(() => {
    if (user) {
      user
        .getSessions()
        .then((fetchedSessions) => {
          setSessions(fetchedSessions);
          setIsLoadingSessions(false);
        })
        .catch((err) => {
          console.error("Error fetching sessions:", err);
          setIsLoadingSessions(false);
        });
    }
  }, [user]);

  if (!isLoaded || isLoadingSessions) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-stone-300" />
      </div>
    );
  }

  const handleRevoke = async (sessionId: string) => {
    const session = sessions?.find((s) => s.id === sessionId);
    if (!session) return;

    setRevokingId(sessionId);
    try {
      await revokeDeviceSession(sessionId);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      toast.success("Sessão revogada com sucesso!");
    } catch (error: any) {
      console.error(error);
      const msg =
        error?.errors?.[0]?.longMessage ||
        error?.message ||
        "Erro ao revogar sessão.";
      toast.error(msg);
    } finally {
      setRevokingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <h4 className="text-lg font-black text-stone-800 flex items-center gap-2">
        <Monitor className="w-5 h-5 text-[#1CB0F6]" />
        Dispositivos Ativos
      </h4>
      <p className="text-sm font-bold text-stone-400">
        Estes são os dispositivos que têm sessão iniciada na tua conta. Se vires
        algum que não reconheças, podes terminar a sessão remotamente.
      </p>

      <div className="flex flex-col gap-3 mt-2">
        {sessions?.map((session) => {
          const isCurrent = session.id === currentSession?.id;
          const browser =
            session.latestActivity?.browserName || "Browser Desconhecido";
          const os =
            session.latestActivity?.deviceType || "Sistema Desconhecido";
          const ip = session.latestActivity?.ipAddress || "IP Desconhecido";
          const isMobile =
            session.latestActivity?.isMobile ||
            os.includes("Android") ||
            os.includes("iOS") ||
            os.toLowerCase() === "mobile";

          const Icon = isMobile ? Smartphone : Monitor;

          return (
            <div
              key={session.id}
              className={cn(
                "flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 rounded-2xl border-2 border-stone-200 bg-white gap-4 transition-all hover:shadow-sm",
                isCurrent && "border-[#1CB0F6] bg-blue-50/30",
              )}
            >
              <div className="flex items-start gap-4 min-w-0 w-full sm:w-auto">
                <div
                  className={cn(
                    "p-3 rounded-xl border-2 shrink-0",
                    isCurrent
                      ? "bg-blue-100 border-blue-200 text-blue-500"
                      : "bg-stone-50 border-stone-100 text-stone-400",
                  )}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex flex-col gap-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-stone-700">{os}</span>
                    {isCurrent && (
                      <span className="bg-[#58CC02] text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-lg shrink-0">
                        Este Dispositivo
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-stone-400">
                    <Globe className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">
                      {browser} • {ip}
                    </span>
                  </div>
                  <div className="text-[11px] font-bold text-stone-400 mt-1">
                    Última atividade:{" "}
                    {session.lastActiveAt
                      ? new Date(session.lastActiveAt).toLocaleString()
                      : "Desconhecido"}
                  </div>
                </div>
              </div>

              {!isCurrent && (
                <button
                  onClick={() => handleRevoke(session.id)}
                  disabled={revokingId === session.id}
                  className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-2 bg-white text-rose-500 font-black uppercase text-xs tracking-wider px-4 py-3 rounded-xl border-2 border-rose-200 border-b-4 hover:bg-rose-50 active:translate-y-1 active:border-b-2 transition-all disabled:opacity-50"
                >
                  {revokingId === session.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <LogOut className="w-4 h-4" />
                      Desconectar
                    </>
                  )}
                </button>
              )}

              {isCurrent && (
                <div className="hidden sm:flex items-center justify-center p-3 text-emerald-500">
                  <ShieldCheck className="w-6 h-6" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
