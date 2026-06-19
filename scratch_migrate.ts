import { db } from "./src/db/drizzle";
import { sql } from "drizzle-orm";

async function main() {
  try {
    console.log("Adding columns to user_progress...");
    await db.execute(sql`
      ALTER TABLE user_progress 
      ADD COLUMN IF NOT EXISTS e2e_public_key text,
      ADD COLUMN IF NOT EXISTS e2e_encrypted_private_key text,
      ADD COLUMN IF NOT EXISTS e2e_salt text;
    `);

    console.log("Creating conversation_keys table...");
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS conversation_keys (
        id serial PRIMARY KEY,
        conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
        user_id text NOT NULL REFERENCES user_progress(user_id) ON DELETE CASCADE,
        encrypted_room_key text NOT NULL
      );
    `);

    console.log("Schema migration complete!");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    process.exit(0);
  }
}

main();
