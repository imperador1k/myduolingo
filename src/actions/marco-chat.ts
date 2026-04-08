"use server";

import { auth } from "@clerk/nextjs/server";
import { generateTextWithFallback } from "@/lib/ai-manager";
import { aiTutorRateLimit } from "@/lib/ratelimit";

export async function askMarco(question: string, contextLanguage: string): Promise<string> {
    const { userId } = await auth();
    
    if (!userId) {
        return "S'il te plaît... precisas de fazer login para falar comigo!";
    }

    // 🛡️ ANTI-ABUSE: Limit the AI usage to protect billing
    const { success } = await aiTutorRateLimit.limit(userId);
    if (!success) {
        return "Oh la la! Estás a encher-me de perguntas muito rápido. Preciso de beber um cafézinho, volta daqui a uns minutos! ☕";
    }

    const systemPrompt = `És o Marco, um tutor de idiomas muito simpático, divertido e com um sotaque imaginário (és uma mascote com um bigode francês). 
O utilizador tem uma dúvida rápida sobre o idioma: ${contextLanguage}. 
Sê extremamente direto, útil e usa humor leve. Responde no máximo em 2 parágrafos curtos. 
Responde em Português.`;

    try {
        const responseText = await generateTextWithFallback(
            question,
            systemPrompt,
            { temperature: 0.7 }
        );

        return responseText;
    } catch (error) {
        console.error("[Marco Chat Error]:", error);
        return "Zut alors! O meu bigode enrolou-se e perdi a ligação à internet. Tenta perguntar outra vez daqui a bocado!";
    }
}
