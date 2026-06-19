"use client";

import { useState } from "react";
import { Lock, KeyRound, Info, X } from "lucide-react";
import { getMyE2EBundle } from "@/actions/crypto";
import { generateSalt, encryptPrivateKeyWithPIN } from "@/lib/crypto";
import localforage from "localforage";
import { toast } from "sonner";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export function E2ESettings() {
  const [isChanging, setIsChanging] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [newPin, setNewPin] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChangePin = async () => {
    if (newPin.length < 4) {
      toast.error("O PIN deve ter pelo menos 4 caracteres.");
      return;
    }

    setLoading(true);
    try {
      // 1. Get raw private key from local storage
      const rawPrivateKey =
        await localforage.getItem<CryptoKey>("e2e_private_key");
      if (!rawPrivateKey) {
        toast.error(
          "Erro: Chave privada não encontrada neste dispositivo. Desbloqueia as tuas mensagens primeiro.",
        );
        return;
      }

      // 2. Export it to JWK (the crypto lib expects JWK for PIN encryption)
      const exportedJwk = await window.crypto.subtle.exportKey(
        "jwk",
        rawPrivateKey,
      );

      // 3. Generate new salt and encrypt with NEW PIN
      const salt = generateSalt(16);
      const encryptedPrivateKey = await encryptPrivateKeyWithPIN(
        exportedJwk,
        newPin,
        salt,
      );

      // 4. Fetch the existing public key from server (so we don't overwrite it with null)
      const bundle = await getMyE2EBundle();
      if (!bundle || !bundle.publicKey) {
        throw new Error("Erro ao obter a chave pública atual.");
      }

      // 5. Upload new payload to server
      const res = await fetch("/api/crypto/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          e2ePublicKey: bundle.publicKey,
          e2eEncryptedPrivateKey: encryptedPrivateKey,
          e2eSalt: salt,
        }),
      });

      if (!res.ok) throw new Error("Erro ao guardar o novo PIN no servidor.");

      toast.success("PIN de Encriptação alterado com sucesso!");
      setIsChanging(false);
      setNewPin("");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao alterar o PIN.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3 className="text-xl font-black text-stone-800 mb-4 flex items-center gap-2">
        <Lock className="w-6 h-6 text-emerald-500" />
        Segurança & Encriptação E2EE
      </h3>
      <div className="bg-white border-2 border-stone-200 border-b-8 rounded-[2rem] p-6 md:p-8 flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 border-2 border-emerald-100 text-emerald-500 rounded-2xl shrink-0">
              <KeyRound className="w-6 h-6" />
            </div>
            <div className="flex flex-col gap-1">
              <h4 className="text-lg font-bold text-stone-800">
                Cofre de Mensagens E2EE
              </h4>
              <p className="text-sm font-medium text-stone-500">
                Gere o teu PIN de recuperação.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowInfo(true)}
            className="w-full sm:w-auto h-12 px-5 rounded-xl bg-stone-100 text-stone-500 font-black uppercase tracking-wider border-2 border-stone-200 border-b-4 hover:bg-stone-200 active:border-b-0 active:translate-y-1 transition-all flex justify-center items-center gap-2 shrink-0"
          >
            <Info className="w-5 h-5" />O que é o PIN?
          </button>
        </div>

        {/* Modal O que é o PIN */}
        <Dialog open={showInfo} onOpenChange={setShowInfo}>
          <DialogContent className="z-modal max-w-md p-0 overflow-hidden border-none bg-transparent shadow-none [&>button]:hidden">
            <div className="relative bg-white border-2 border-stone-200 border-b-8 rounded-[2rem] shadow-2xl p-6 md:p-8 max-w-md w-full">
              <button
                onClick={() => setShowInfo(false)}
                className="absolute right-4 top-4 h-10 w-10 flex items-center justify-center rounded-xl bg-white border-2 border-stone-200 border-b-4 hover:bg-stone-50 active:translate-y-1 active:border-b-0 transition-all text-stone-400"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-sky-50 border-2 border-sky-100 text-[#1CB0F6] rounded-2xl shrink-0">
                  <Info className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black text-stone-800">
                  O teu Cofre E2EE
                </h3>
              </div>
              <p className="text-sm font-bold text-stone-500 leading-relaxed mb-6">
                As tuas mensagens são protegidas de Ponta-a-Ponta (E2EE) usando
                uma <b>Chave Privada Mestra</b> que vive no teu dispositivo.
                Para que não percas o histórico ao trocar de telemóvel, nós
                fazemos um backup da tua chave na nuvem, mas{" "}
                <b>trancamos esse backup com o teu PIN</b> (Zero-Knowledge Key
                Escrow). Nós nunca sabemos qual é o teu PIN, o que significa que
                apenas tu tens a chave para o cofre.
              </p>
              <button
                onClick={() => setShowInfo(false)}
                className="w-full h-12 px-6 rounded-xl bg-[#1CB0F6] text-white font-black uppercase tracking-wider border-2 border-[#1899D6] border-b-4 active:border-b-0 active:translate-y-1 transition-all"
              >
                Entendi!
              </button>
            </div>
          </DialogContent>
        </Dialog>

        <hr className="border-2 border-stone-100 rounded-full" />

        {isChanging ? (
          <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-top-2">
            <label className="text-sm font-bold text-stone-700">
              Introduz o teu Novo PIN ou Password
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
              <input
                type="password"
                className="flex h-12 w-full rounded-xl border-2 border-stone-200 bg-white px-4 py-2 text-sm font-bold ring-offset-background placeholder:text-stone-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:border-transparent transition-all"
                placeholder="Ex: 1234 ou Senh@Forte"
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                disabled={loading}
              />
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={handleChangePin}
                  disabled={loading || newPin.length < 4}
                  className="w-full sm:w-auto h-12 px-6 rounded-xl bg-emerald-500 text-white font-black uppercase tracking-wider border-2 border-emerald-600 border-b-4 active:border-b-0 active:translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                >
                  {loading ? "A Guardar..." : "Confirmar"}
                </button>
                <button
                  onClick={() => setIsChanging(false)}
                  disabled={loading}
                  className="w-full sm:w-auto h-12 px-6 rounded-xl bg-stone-100 text-stone-500 font-black uppercase tracking-wider border-2 border-stone-200 border-b-4 active:border-b-0 active:translate-y-1 transition-all shrink-0"
                >
                  Cancelar
                </button>
              </div>
            </div>
            <p className="text-xs font-bold text-stone-400">
              Nota: Alterar o PIN não vai apagar as tuas mensagens. Apenas
              substitui o "cadeado" do teu cofre na nuvem.
            </p>
          </div>
        ) : (
          <div className="flex justify-start">
            <button
              onClick={() => setIsChanging(true)}
              className="w-full sm:w-auto h-12 px-6 rounded-xl bg-sky-500 text-white font-black uppercase tracking-wider border-2 border-sky-600 border-b-4 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2"
            >
              <Lock className="w-5 h-5" />
              Mudar o PIN de Acesso
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
