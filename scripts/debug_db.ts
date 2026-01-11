
import { db } from "@/db/drizzle";
import { userProgress } from "@/db/schema";
import { eq } from "drizzle-orm";

async function main() {
    console.log("Starting DB Debug...");
    try {
        // Hardcoded user ID from the error message for reproduction
        const userId = "user_37wUA3PNVtYAYJjzkiM8mrnVVGp";

        console.log(`Fetching progress for user: ${userId}`);
        const data = await db.query.userProgress.findFirst({
            where: eq(userProgress.userId, userId),
            with: {
                activeCourse: true,
            },
        });
        console.log("Query success!");
        console.log(JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("Query failed with error:");
        console.error(error);
    }
    process.exit(0);
}

main();
