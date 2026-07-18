CREATE TABLE "presentation_favorite" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"presentation_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "presentation_favorite_unique" UNIQUE("presentation_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "presentation_favorite" ADD CONSTRAINT "presentation_favorite_presentation_id_presentation_id_fk" FOREIGN KEY ("presentation_id") REFERENCES "public"."presentation"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "presentation_favorite" ADD CONSTRAINT "presentation_favorite_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "presentation_favorite_presentationId_idx" ON "presentation_favorite" USING btree ("presentation_id");