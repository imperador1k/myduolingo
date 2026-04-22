import "dotenv/config";
import { sql } from "drizzle-orm";
import { db } from "../src/db/drizzle";

async function main() {
  console.log("Adding last_week_result column to user_progress...");
  try {
    await db.execute(
      sql`ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS last_week_result jsonb;`
    );
    console.log("Successfully added last_week_result column.");
  } catch (error) {
    console.error("Error adding column:", error);
  }
  process.exit(0);
}

main();
