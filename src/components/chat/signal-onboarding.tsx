"use client";

import { useEffect, useState } from "react";
import { getMyE2EBundle } from "@/actions/crypto";
import {
  generateMasterKeyPair,
  generateSalt,
  encryptPrivateKeyWithPIN,
  decryptPrivateKeyWithPIN,
  arrayBufferToBase64,
} from "@/lib/crypto";
import localforage from "localforage";
import { Button } from "@/components/ui/button";

export function SignalOnboarding() {
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [needsPin, setNeedsPin] = useState<"CREATE" | "UNLOCK" | null>(null);
  const [pin, setPin] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [serverBundle, setServerBundle] = useState<any>(null);

  useEffect(() => {
    async function checkState() {
      try {
        // 1. Check if we already have the private key locally
        const localKey =
          await localforage.getItem<CryptoKey>("e2e_private_key");
        if (localKey) {
          setIsInitializing(false);
          return;
        }

        // 2. Fetch from server
        const bundle = await getMyE2EBundle();
        if (bundle) {
          // Exists on server, need PIN to unlock
          setServerBundle(bundle);
          setNeedsPin("UNLOCK");
        } else {
          // Doesn't exist, need PIN to create
          setNeedsPin("CREATE");
        }
      } catch (err) {
        console.error("E2E State Check Error:", err);
        setError("Erro ao verificar estado da encriptação.");
      } finally {
        setIsInitializing(false);
      }
    }

    checkState();
  }, []);

  const handlePinSubmit = async () => {
    if (pin.length < 4) {
      setError("O PIN deve ter pelo menos 4 caracteres.");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      if (needsPin === "CREATE") {
        // Generate new Identity
        const { keyPair, publicKeyBase64, privateKeyJwk } =
          await generateMasterKeyPair();

        // Encrypt Private Key with PIN
        const salt = generateSalt(16);
        const encryptedPrivateKey = await encryptPrivateKeyWithPIN(
          privateKeyJwk,
          pin,
          salt,
        );

        // Upload to server
        const res = await fetch("/api/crypto/keys", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            e2ePublicKey: publicKeyBase64,
            e2eEncryptedPrivateKey: encryptedPrivateKey,
            e2eSalt: salt,
          }),
        });

        if (!res.ok) throw new Error("Falha ao guardar chaves no servidor.");

        // Save private key locally
        await localforage.setItem("e2e_private_key", keyPair.privateKey);
      } else if (needsPin === "UNLOCK" && serverBundle) {
        // Decrypt Private Key with PIN
        const privateKey = await decryptPrivateKeyWithPIN(
          serverBundle.encryptedPrivateKey,
          pin,
          serverBundle.salt,
        );

        // Save locally
        await localforage.setItem("e2e_private_key", privateKey);
      }

      setNeedsPin(null);
    } catch (err: any) {
      console.error("PIN processing error:", err);
      setError("PIN incorreto ou erro na encriptação.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (needsPin) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-background rounded-xl p-6 max-w-sm w-full space-y-4 shadow-xl border">
          <h3 className="font-bold text-lg text-center">
            {needsPin === "CREATE"
              ? "Criar PIN de Segurança"
              : "Desbloquear Mensagens"}
          </h3>
          <p className="text-sm text-muted-foreground text-center">
            {needsPin === "CREATE"
              ? "Para acederes às tuas mensagens E2EE noutros dispositivos, define um PIN ou Password."
              : "As tuas mensagens estão encriptadas. Insere o teu PIN para aceder a este dispositivo."}
          </p>

          <div className="space-y-2">
            <input
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              type="password"
              placeholder="Ex: 1234 ou Senh@Forte"
              value={pin}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setPin(e.target.value)
              }
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
                e.key === "Enter" && handlePinSubmit()
              }
              disabled={isProcessing}
            />
            {error && (
              <p className="text-red-500 text-xs text-center">{error}</p>
            )}
          </div>

          <Button
            className="w-full"
            onClick={handlePinSubmit}
            disabled={isProcessing || pin.length < 4}
          >
            {isProcessing
              ? "A processar..."
              : needsPin === "CREATE"
                ? "Criar Identidade Segura"
                : "Desbloquear"}
          </Button>
        </div>
      </div>
    );
  }

  if (isInitializing) {
    return (
      <div className="text-muted-foreground text-xs text-center mt-2 animate-pulse">
        A inicializar encriptação... 🔒
      </div>
    );
  }

  return null;
}
