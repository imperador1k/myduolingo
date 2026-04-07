"use server";

import { generateTextWithFallback } from "@/lib/ai-manager";

export async function getErrorExplanation(
    question: string,
    userAnswer: string,
    correctAnswer: string,
    targetLanguage: string
): Promise<string> {
    const prompt = `You are Marco, a friendly and encouraging language tutor. 
The user is learning ${targetLanguage}. 
The question was: '${question}'. 
The user incorrectly answered: '${userAnswer}'. 
The correct answer is: '${correctAnswer}'. 
Explain briefly (maximum 2 short sentences) WHY the user's answer is wrong and why the correct answer is right. Use simple terms. 
Respond in Portuguese (the user's native language).`;

    try {
        const text = await generateTextWithFallback(
            prompt,
            "You are Marco, an empathetic language tutor helping Portuguese speakers learn new languages."
        );
        return text;
    } catch (error) {
        console.error("[Ai Tutor Error]:", error);
        return "Desculpa, a minha inteligência artificial teve um soluço. Continua a praticar, vais conseguir!";
    }
}
