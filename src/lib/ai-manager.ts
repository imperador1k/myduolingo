import { GoogleGenerativeAI } from "@google/generative-ai";

export async function generateTextWithFallback(
    prompt: string, 
    systemInstruction?: string,
    generationConfig?: any
): Promise<string> {
    // 1. Find all environment variables that start with 'GEMINI_API_KEY_'
    let keys = Object.keys(process.env)
        .filter(k => k.startsWith("GEMINI_API_KEY_"))
        .map(k => process.env[k])
        .filter((k): k is string => !!k);
    
    // Add the singular key as a fallback if present
    if (process.env.GEMINI_API_KEY && !keys.includes(process.env.GEMINI_API_KEY)) {
        keys.push(process.env.GEMINI_API_KEY);
    }

    if (keys.length === 0) {
        throw new Error("CRITICAL: No Gemini keys found in environment variables.");
    }

    // 2. Shuffle keys to distribute load (Round-Robin logic)
    const shuffledKeys = keys.sort(() => 0.5 - Math.random());

    let lastError: any;

    for (const key of shuffledKeys) {
        try {
            const genAI = new GoogleGenerativeAI(key);
            
            // We default to "gemini-2.5-flash" here as it's the latest and active on most new keys.
            const model = genAI.getGenerativeModel({
                model: "gemini-2.5-flash",
                systemInstruction: systemInstruction,
                generationConfig: generationConfig
            });

            const result = await model.generateContent(prompt);
            return result.response.text();
        } catch (error: any) {
            console.warn(`[AI Manager] Key failed, attempting fallback... Error: ${error?.message || "Unknown error"}`);
            lastError = error;
            // If it's a 429 (Rate Limit) or 404 (Model not found for this key), we continue to the next key.
            // You can add stricter status checks here if needed.
        }
    }

    console.error("[AI Manager] CRITICAL: ALL keys exhausted or failed.");
    throw lastError;
}
