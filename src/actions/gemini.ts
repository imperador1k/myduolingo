"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY!;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
});

export const generatePracticePrompt = async (
    type: "writing" | "speaking"
): Promise<{ text: string; translation: string; hints: string[] }> => {
    try {
        const difficulty = ["iniciante", "intermediário", "avançado"][Math.floor(Math.random() * 3)];

        const randomSeed = Date.now();
        const prompt =
            type === "writing"
                ? `Gera um tópico de escrita criativo e ${difficulty} para um estudante de INGLÊS falante de português. (Seed: ${randomSeed})
                   Inclui 3 ideias de sub-tópicos ou perguntas para ajudar a desenvolver o texto.
                   Retorna APENAS um JSON no formato:
                   {
                     "text": "O tópico principal em INGLÊS",
                     "translation": "A tradução do tópico em PORTUGUÊS",
                     "hints": ["Ideia 1 em Inglês", "Ideia 2 em Inglês", "Ideia 3 em Inglês"]
                   }`
                : `Gera um tópico de conversação interessante e ${difficulty} para um estudante de INGLÊS falante de português praticar a fala. (Seed: ${randomSeed})
                   Inclui 3 perguntas de suporte para manter a conversa.
                   Retorna APENAS um JSON no formato:
                   {
                     "text": "A pergunta ou tópico principal em INGLÊS",
                     "translation": "A tradução em PORTUGUÊS",
                     "hints": ["Ideia 1 em Inglês", "Ideia 2 em Inglês", "Ideia 3 em Inglês"]
                   }`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean up markdown code blocks if present
        const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();

        return JSON.parse(cleanText);
    } catch (error) {
        console.error("Error generating prompt:", error);

        // Fallback topics if API fails
        const fallbacks = [
            {
                text: "Talk about your favorite travel destination.",
                translation: "Fala sobre o teu destino de viagem favorito.",
                hints: ["Where is it?", "Why do you like it?", "What can you do there?"],
            },
            {
                text: "Describe your daily routine.",
                translation: "Descreve a tua rotina diária.",
                hints: ["What time do you wake up?", "What do you do for work/school?", "What do you do in the evening?"],
            },
            {
                text: "What are your goals for this year?",
                translation: "Quais são os teus objetivos para este ano?",
                hints: ["Professional goals", "Personal goals", "Steps to achieve them"],
            },
            {
                text: "Talk about a movie you watched recently.",
                translation: "Fala sobre um filme que viste recentemente.",
                hints: ["What was the plot?", "Did you like the characters?", "Would you recommend it?"],
            },
            {
                text: "If you could have any superpower, what would it be?",
                translation: "Se pudesses ter um superpoder, qual seria?",
                hints: ["Flying?", "Invisibility?", "How would you use it?"]
            }
        ];

        return fallbacks[Math.floor(Math.random() * fallbacks.length)];
    }
};

export const analyzeWriting = async (
    text: string,
    prompt: string
): Promise<{
    feedback: string;
    corrections: { original: string; correction: string; explication: string }[];
    score: number;
}> => {
    try {
        const inputPrompt = `
      Aja como um professor de INGLÊS nativo.
      O aluno escreveu o seguinte texto em INGLÊS sobre o tema "${prompt}":
      "${text}"

      Analise o texto e retorne um JSON no seguinte formato:
      {
        "feedback": "Um comentário geral encorajador sobre o texto, EM PORTUGUÊS.",
        "corrections": [
          {
            "original": "Trecho com erro",
            "correction": "Trecho corrigido",
            "explication": "Explicação breve do erro (em Português)"
          }
        ],
        "score": 0 a 100 baseado na gramática e vocabulário
      }
      Se não houver erros, o array "corrections" deve estar vazio.
      Retorna APENAS o JSON. Deve ser em Português de Portugal!
    `;

        const result = await model.generateContent(inputPrompt);
        const response = await result.response;
        const responseText = response.text();
        const cleanText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();

        return JSON.parse(cleanText);
    } catch (error) {
        console.error("Error analyzing writing:", error);
        return {
            feedback: "Houve um erro ao analisar sua resposta. Tente novamente mais tarde.",
            corrections: [],
            score: 0,
        };
    }
};

export const analyzeSpeaking = async (
    transcript: string,
    prompt: string
): Promise<{
    feedback: string;
    betterWayToSay: string;
    pronunciationTips: string;
    score: number;
}> => {
    try {
        const inputPrompt = `
      Aja como um professor de INGLÊS nativo focado em conversação.
      O aluno disse (transcrição do inglês): "${transcript}"
      Sobre o tema: "${prompt}"

      Retorne um JSON no seguinte formato:
      {
        "feedback": "Comentário sobre a clareza e relevância da resposta (em Português).",
        "betterWayToSay": "Uma maneira mais natural ou nativa de expressar a mesma ideia em Inglês.",
        "pronunciationTips": "Dicas gerais de sons que costumam ser difíceis nessas palavras para falantes de português (em Português).",
        "score": 0 a 100 baseado na clareza e naturalidade
      }
      Retorna APENAS o JSON. A resposta deve ser em Português de Portugal!
    `;

        const result = await model.generateContent(inputPrompt);
        const response = await result.response;
        const responseText = response.text();
        const cleanText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();

        return JSON.parse(cleanText);
    } catch (error) {
        console.error("Error analyzing speaking:", error);
        return {
            feedback: "Não foi possível analisar o áudio.",
            betterWayToSay: "",
            pronunciationTips: "",
            score: 0,
        };
    }
};
