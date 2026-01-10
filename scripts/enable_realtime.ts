
import { db } from "../src/db/drizzle";
import { sql } from "drizzle-orm";

async function main() {
    console.log("Enabling Realtime for messages...");
    try {
        await db.execute(sql`
            begin;
            drop publication if exists supabase_realtime;
            create publication supabase_realtime for table messages, notifications;
            commit;
        `);
        console.log("Success!");
    } catch (e) {
        // If publication exists, we might need to add table
        console.log("First attempt failed, trying to alter publication...");
        try {
            await db.execute(sql`alter publication supabase_realtime add table messages, notifications;`);
            console.log("Success adding to publication!");
        } catch (e2) {
            console.error("Error enabling realtime:", e2);
        }
    }
    process.exit(0);
}
main();
