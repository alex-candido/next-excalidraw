"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

interface AppPresentationsOutlineHeroProps {
  title: string;
  count: number;
  onGenerate?: () => void;
  isGenerating?: boolean;
  className?: string;
}

export function AppPresentationsOutlineHero({
  title,
  count,
  onGenerate,
  isGenerating = false,
  className,
}: AppOutlineHeroProps) {
  const t = useTranslations("app.outline.hero");

  return (
    <div
      className={cn(
        "app-outline-hero sticky top-0 z-10 border-b bg-background/95 px-4 py-4 backdrop-blur-sm",
        className,
      )}
    >
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-3">
        <Button
          variant="ghost"
          size="sm"
          render={<Link href="/app/presentations" />}
          nativeButton={false}
          className="app-outline-hero-back -ml-2 w-fit gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          {t("back")}
        </Button>

        <div className="flex items-end justify-between gap-4">
          <div className="flex min-w-0 flex-col gap-1">
            <h2 className="app-outline-hero-title truncate text-xl font-semibold tracking-tight">
              {title}
            </h2>
            <p className="app-outline-hero-subtitle text-sm text-muted-foreground">
              {t("subtitle", { count })}
            </p>
          </div>

          <Button
            className="app-outline-hero-generate shrink-0 gap-1.5"
            onClick={onGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? t("generating") : t("generate")}
            {!isGenerating && <ArrowRight className="size-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
