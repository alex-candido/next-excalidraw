"use client";

import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAppPresentationsOutline } from "@/providers/app/app-presentations-outline-provider";

interface AppPresentationsOutlineBottomBarProps {
  className?: string;
}

export function AppPresentationsOutlineBottomBar({ className }: AppPresentationsOutlineBottomBarProps) {
  const t = useTranslations("app.outline.hero");
  const { outlines, onGenerate, isGenerating } = useAppPresentationsOutline();
  const count = outlines.length;

  return (
    <div
      className={cn(
        "app-presentations-outline-bottom-bar sticky bottom-0 z-10 border-t bg-background/95 px-4 py-3 backdrop-blur-sm",
        className,
      )}
    >
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-4">
        <p className="app-presentations-outline-bottom-bar-subtitle text-sm text-muted-foreground">
          {t("subtitle", { count })}
        </p>
        <Button
          className="app-presentations-outline-bottom-bar-generate gap-1.5"
          onClick={onGenerate}
          disabled={isGenerating}
        >
          {isGenerating ? t("generating") : t("generate")}
          {!isGenerating && <ArrowRight className="size-4" />}
        </Button>
      </div>
    </div>
  );
}
