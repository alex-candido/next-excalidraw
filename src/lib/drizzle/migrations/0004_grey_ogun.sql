CREATE TABLE "presentation_entry" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kind" smallint NOT NULL,
	"presentation_id" uuid,
	"type" smallint NOT NULL,
	"language" smallint NOT NULL,
	"icon" text,
	"title" text,
	"description" text,
	"prompt" text NOT NULL,
	"aspect_ratio" smallint NOT NULL,
	"amount" smallint NOT NULL,
	"audience" smallint NOT NULL,
	"scenario" smallint NOT NULL,
	"theme" smallint NOT NULL,
	"status" smallint DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "presentation_entry" ADD CONSTRAINT "presentation_entry_presentation_id_presentation_id_fk" FOREIGN KEY ("presentation_id") REFERENCES "public"."presentation"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "presentation_entry_kind_idx" ON "presentation_entry" USING btree ("kind","type","language","status");