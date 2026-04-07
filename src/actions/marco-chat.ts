"use server";

import { generateTextWithFallback } from "@/lib/ai-manager";

export async function askMarco(question: string, contextLanguage: string): Promise<string> {
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
