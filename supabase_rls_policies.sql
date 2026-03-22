-- Enable Row Level Security (RLS) on tables accessed directly by the client browser
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Helper function to extract Clerk User ID from the injected Supabase JWT template
CREATE OR REPLACE FUNCTION requesting_user_id() RETURNS text AS $$
  SELECT NULLIF(current_setting('request.jwt.claims', true)::json->>'sub', '')::text;
$$ LANGUAGE SQL;

-- Policy: Users can only select messages where they are the sender or receiver
CREATE POLICY "Users can view their own messages"
ON messages
FOR SELECT
USING (
  requesting_user_id() = sender_id 
  OR 
  requesting_user_id() = receiver_id
);

-- Policy: Users can only insert messages where the sender_id matches their own Clerk ID
CREATE POLICY "Users can insert their own messages"
ON messages
FOR INSERT
WITH CHECK (
  requesting_user_id() = sender_id
);

-- Note: Core tables (courses, units, lessons) are queried server-side securely via Drizzle.
-- By not creating default RLS policies here for them, Supabase blocks all client-side requests.
-- This forces all game logic traffic through your secure Next.js Server Components.
