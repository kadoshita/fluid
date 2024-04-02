CREATE TABLE IF NOT EXISTS "categories" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"added_at" timestamp DEFAULT now() NOT NULL,
	"enabled" boolean DEFAULT false NOT NULL,
	"account_id" uuid NOT NULL,
	CONSTRAINT "categories_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "records" (
	"id" uuid PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"url" text NOT NULL,
	"domain" text NOT NULL,
	"category_id" uuid NOT NULL,
	"image" text,
	"added_at" timestamp DEFAULT now() NOT NULL,
	"account_id" uuid NOT NULL,
	CONSTRAINT "records_url_unique" UNIQUE("url")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "categories_name_idx" ON "categories" ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "categories_account_id_idx" ON "categories" ("account_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "records_title_idx" ON "records" ("title");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "records_url_idx" ON "records" ("url");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "records_domain_idx" ON "records" ("domain");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "records_account_id_idx" ON "records" ("account_id");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "records" ADD CONSTRAINT "records_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
