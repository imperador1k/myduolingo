"use client";

import { useEffect, useRef } from "react";

/**
 * Em dispositivos móveis (WebViews e Browsers Nativos), a reprodução de áudio,
 * nomeadamente a API SpeechSynthesis, é rigidamente bloqueada até haver uma interação
 * real do utilizador. Este componente invisível capta o primeiro click/touch em qualquer
 * ponto da aplicação e emite um áudio "fantasma" silencioso, destrancando o motor
 * sonoro para futuras chamadas assíncronas ou programáticas.
 */
export function TTSUnlocker() {
    const hasUnlocked = useRef(false);

    useEffect(() => {
        // Função responsável pelo "Warm-up" do motor de síntese vocal
        const unlockAudio = () => {
            if (hasUnlocked.current) return;
            
            if (typeof window !== "undefined" && window.speechSynthesis) {
                // Instancia um "Olá" mas sem volume
                const utterance = new SpeechSynthesisUtterance("");
                utterance.volume = 0; // Áudio silenciado
                utterance.rate = 1;
                utterance.pitch = 1;
                
                // Dispara o speech e dá a permissão como adquirida
                window.speechSynthesis.speak(utterance);
                hasUnlocked.current = true;

                // Remove os event listeners porque só precisamos desbloquear 1 vez
                document.removeEventListener("touchstart", unlockAudio);
                document.removeEventListener("click", unlockAudio);
            }
        };

        // Escuta os primeiros eventos de toque / rato
        document.addEventListener("touchstart", unlockAudio, { once: true, passive: true });
        document.addEventListener("click", unlockAudio, { once: true, passive: true });

        // Também obriga o browser a ir buscar as vozes logo de início
        if (typeof window !== "undefined" && window.speechSynthesis) {
            window.speechSynthesis.getVoices();
            window.speechSynthesis.onvoiceschanged = () => {
                window.speechSynthesis.getVoices();
            };
        }

        return () => {
            document.removeEventListener("touchstart", unlockAudio);
            document.removeEventListener("click", unlockAudio);
        };
    }, []);

    return null;
}
