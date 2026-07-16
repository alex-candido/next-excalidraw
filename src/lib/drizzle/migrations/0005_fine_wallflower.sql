ALTER TABLE "presentation_entry" ADD COLUMN "source_suggestion_id" uuid;--> statement-breakpoint
ALTER TABLE "presentation_entry" ADD COLUMN "slide_count" smallint NOT NULL;--> statement-breakpoint
ALTER TABLE "presentation_entry" ADD COLUMN "keywords" text[];--> statement-breakpoint
ALTER TABLE "presentation_entry" ADD CONSTRAINT "presentation_entry_source_suggestion_id_presentation_entry_id_fk" FOREIGN KEY ("source_suggestion_id") REFERENCES "public"."presentation_entry"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "presentation" DROP COLUMN "type";--> statement-breakpoint
ALTER TABLE "presentation" DROP COLUMN "user_prompt";--> statement-breakpoint
ALTER TABLE "presentation" DROP COLUMN "language";--> statement-breakpoint
ALTER TABLE "presentation" DROP COLUMN "aspect_ratio";--> statement-breakpoint
ALTER TABLE "presentation" DROP COLUMN "slide_count";--> statement-breakpoint
ALTER TABLE "presentation" DROP COLUMN "amount";--> statement-breakpoint
ALTER TABLE "presentation" DROP COLUMN "audience";--> statement-breakpoint
ALTER TABLE "presentation" DROP COLUMN "scenario";--> statement-breakpoint
ALTER TABLE "presentation" DROP COLUMN "theme";--> statement-breakpoint
ALTER TABLE "presentation" DROP COLUMN "keywords";--> statement-breakpoint
ALTER TABLE "presentation_entry" ADD CONSTRAINT "presentation_entry_presentation_id_unique" UNIQUE("presentation_id");