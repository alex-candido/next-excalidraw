CREATE UNLOGGED TABLE "attachment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"presentation_id" uuid NOT NULL,
	"type" smallint NOT NULL,
	"name" text NOT NULL,
	"content" "bytea",
	"url" text,
	"mime_type" text,
	"size" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "storage_attachment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"blob_id" uuid NOT NULL,
	"record_type" smallint NOT NULL,
	"record_id" uuid NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "storage_blob" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"storage_key" text NOT NULL,
	"filename" text NOT NULL,
	"mime_type" text NOT NULL,
	"size" integer NOT NULL,
	"checksum" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "storage_blob_storage_key_unique" UNIQUE("storage_key")
);
--> statement-breakpoint
ALTER TABLE "attachment" ADD CONSTRAINT "attachment_presentation_id_presentation_id_fk" FOREIGN KEY ("presentation_id") REFERENCES "public"."presentation"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "storage_attachment" ADD CONSTRAINT "storage_attachment_blob_id_storage_blob_id_fk" FOREIGN KEY ("blob_id") REFERENCES "public"."storage_blob"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "attachment_presentationId_idx" ON "attachment" USING btree ("presentation_id");--> statement-breakpoint
CREATE INDEX "storage_attachment_blobId_idx" ON "storage_attachment" USING btree ("blob_id");--> statement-breakpoint
CREATE INDEX "storage_attachment_record_idx" ON "storage_attachment" USING btree ("record_type","record_id","name");