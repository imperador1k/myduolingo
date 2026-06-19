ALTER TABLE "user_progress" ADD COLUMN "signal_registration_id" integer;
ALTER TABLE "user_progress" ADD COLUMN "signal_identity_key" text;

CREATE TABLE IF NOT EXISTS "signal_pre_keys" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"key_id" integer NOT NULL,
	"public_key" text NOT NULL
);

CREATE TABLE IF NOT EXISTS "signal_signed_pre_keys" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"key_id" integer NOT NULL,
	"public_key" text NOT NULL,
	"signature" text NOT NULL
);

DO $$ BEGIN
 ALTER TABLE "signal_pre_keys" ADD CONSTRAINT "signal_pre_keys_user_id_user_progress_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user_progress"("user_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "signal_signed_pre_keys" ADD CONSTRAINT "signal_signed_pre_keys_user_id_user_progress_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user_progress"("user_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;