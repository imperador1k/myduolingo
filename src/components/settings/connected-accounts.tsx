"use client";

import { useUser } from "@clerk/nextjs";
import { Link2, Trash2, Plus, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { OAuthStrategy } from "@clerk/types";

const GoogleIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="w-6 h-6 shrink-0"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

export const ConnectedAccounts = () => {
  const { user, isLoaded } = useUser();
  const [isLinking, setIsLinking] = useState<OAuthStrategy | null>(null);
  const [isUnlinking, setIsUnlinking] = useState<string | null>(null);

  if (!isLoaded || !user) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-stone-300" />
      </div>
    );
  }

  const connectedAccounts = user.externalAccounts;
  const hasGoogle = connectedAccounts.some((acc) =>
    acc.provider.includes("google"),
  );

  const handleLink = async (strategy: OAuthStrategy) => {
    setIsLinking(strategy);
    try {
      const externalAccount = await user.createExternalAccount({
        strategy,
        redirectUrl: window.location.href,
      });
      // Redirect to the provider's authorize URL
      if (externalAccount.verification?.externalVerificationRedirectURL) {
        window.location.href =
          externalAccount.verification.externalVerificationRedirectURL.href;
      }
    } catch (error) {
      console.error("Error linking account:", error);
      toast.error("Erro ao conectar conta.");
      setIsLinking(null);
    }
  };

  const handleUnlink = async (accountId: string) => {
    setIsUnlinking(accountId);
    try {
      const accountToUnlink = user.externalAccounts.find(
        (acc) => acc.id === accountId,
      );
      if (accountToUnlink) {
        await accountToUnlink.destroy();
        toast.success("Conta desconectada com sucesso!");
      }
    } catch (error) {
      console.error("Error unlinking account:", error);
      toast.error(
        "Erro ao desconectar conta. Podes precisar de ter uma password definida primeiro.",
      );
    } finally {
      setIsUnlinking(null);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <h4 className="text-lg font-black text-stone-800 flex items-center gap-2">
        <Link2 className="w-5 h-5 text-[#1CB0F6]" />
        Contas Conectadas
      </h4>
      <p className="text-sm font-bold text-stone-400">
        Conecta contas externas para fazeres login de forma mais rápida.
      </p>

      <div className="flex flex-col gap-3 mt-2">
        {connectedAccounts.map((account) => {
          const providerName = account.provider.replace("oauth_", "");
          const formattedName =
            providerName.charAt(0).toUpperCase() + providerName.slice(1);

          return (
            <div
              key={account.id}
              className="flex items-center justify-between p-4 rounded-2xl border-2 border-stone-200 bg-white hover:shadow-sm transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 relative bg-stone-50 rounded-xl border-2 border-stone-100 flex items-center justify-center p-2">
                  {account.provider.includes("google") && <GoogleIcon />}
                </div>
                <div className="flex flex-col">
                  <span className="font-black text-stone-800">
                    {formattedName}
                  </span>
                  <span className="text-xs font-bold text-stone-400 truncate max-w-[150px] sm:max-w-xs">
                    {account.emailAddress || account.username || "Conectado"}
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleUnlink(account.id)}
                disabled={
                  isUnlinking === account.id || connectedAccounts.length === 1
                }
                className="flex items-center justify-center p-3 rounded-xl bg-white text-stone-400 border-2 border-stone-200 border-b-4 hover:bg-stone-50 hover:text-rose-500 active:translate-y-1 active:border-b-2 transition-all disabled:opacity-50 group"
                title={
                  connectedAccounts.length === 1
                    ? "Não podes remover a única forma de login."
                    : "Desconectar"
                }
              >
                {isUnlinking === account.id ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Trash2 className="w-5 h-5 group-hover:text-rose-500 transition-colors" />
                )}
              </button>
            </div>
          );
        })}

        {!hasGoogle && (
          <button
            onClick={() => handleLink("oauth_google")}
            disabled={isLinking === "oauth_google"}
            className="flex items-center justify-between p-4 rounded-2xl border-2 border-dashed border-stone-300 bg-stone-50 hover:bg-stone-100 active:bg-stone-200 transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 relative bg-white rounded-xl border-2 border-stone-200 flex items-center justify-center p-2">
                <GoogleIcon />
              </div>
              <span className="font-black text-stone-600 group-hover:text-stone-800">
                Ligar Conta Google
              </span>
            </div>
            {isLinking === "oauth_google" ? (
              <Loader2 className="w-5 h-5 animate-spin text-stone-400" />
            ) : (
              <Plus className="w-5 h-5 text-stone-400 group-hover:text-[#1CB0F6]" />
            )}
          </button>
        )}
      </div>
    </div>
  );
};
