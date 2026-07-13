ALTER TABLE "outline" ALTER COLUMN "layout" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "outline" ALTER COLUMN "layout" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "outline" ALTER COLUMN "layout" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "presentation" ADD COLUMN "type" smallint DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "presentation" ADD COLUMN "amount" smallint DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "presentation" ADD COLUMN "audience" smallint DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "presentation" ADD COLUMN "scenario" smallint DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "presentation" ADD COLUMN "theme" smallint DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "slide" ADD COLUMN "composition" jsonb;