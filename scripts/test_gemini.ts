import { GoogleGenerativeAI } from "@google/generative-ai";
import * as fs from "fs";
import * as path from "path";

console.log("🚀 Starting Gemini Test Script...");

async function main() {
    try {
        const envPath = path.resolve(process.cwd(), ".env.local");
        console.log(`📂 Reading .env.local from: ${envPath}`);

        if (!fs.existsSync(envPath)) {
            throw new Error(".env.local file does not exist.");
        }

        const content = fs.readFileSync(envPath, "utf-8");
        const match = content.match(/GEMINI_API_KEY=(.+)/);

        if (!match) {
            throw new Error("GEMINI_API_KEY not found in file.");
        }

        const apiKey = match[1].trim();
        console.log(`🔑 API Key found (length: ${apiKey.length})`);

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        console.log("📡 Sending request to Gemini...");
        const result = await model.generateContent("Hello friend!");
        console.log("📨 Response received!");

        const response = await result.response;
        console.log("📝 Text:", response.text());

    } catch (err: any) {
        console.error("💥 FATAL ERROR:");
        console.error(err);
    }
}

main();
