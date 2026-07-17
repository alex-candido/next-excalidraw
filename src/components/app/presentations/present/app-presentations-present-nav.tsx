"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";

import { AppPresentationsPresentExit } from "@/components/app/presentations/present/app-presentations-present-exit";
import { AppPresentationsPresentFullscreenToggle } from "@/components/app/presentations/present/app-presentations-present-fullscreen-toggle";
import { AppPresentationsPresentThemeToggle } from "@/components/app/presentations/present/app-presentations-present-theme-toggle";
import { Button } from "@/components/ui/button";
import { useAppPresentationsPresent } from "@/providers/app/app-presentations-present-provider";

function AppPresentationsPresentNavDivider() {
  return <div className="app-presentations-present-nav-divider h-4 w-px shrink-0 bg-border" />;
}

export function AppPresentationsPresentNav() {
  const t = useTranslations("app.present.nav");
  const { currentIndex, totalSlides, hasPrevious, hasNext, onPrevious, onNext } =
    useAppPresentationsPresent();

  return (
    <div className="app-presentations-present-nav absolute inset-x-0 bottom-4 z-20 flex justify-center">
      <div className="app-presentations-present-nav-pill flex items-center gap-1.5 rounded-full border bg-background/95 px-2 py-1.5 shadow-lg backdrop-blur-sm">
        <AppPresentationsPresentExit />

        <AppPresentationsPresentNavDivider />

        <Button
          variant="ghost"
          size="icon-sm"
          disabled={!hasPrevious}
          onClick={onPrevious}
          aria-label={t("previous")}
          className="app-presentations-present-nav-previous rounded-full"
        >
          <ChevronLeft className="size-4" />
        </Button>
        <span className="app-presentations-present-nav-counter min-w-16 text-center text-xs text-muted-foreground">
          {t("counter", { current: Math.max(currentIndex, 0) + 1, total: totalSlides })}
        </span>
        <Button
          variant="ghost"
          size="icon-sm"
          disabled={!hasNext}
          onClick={onNext}
          aria-label={t("next")}
          className="app-presentations-present-nav-next rounded-full"
        >
          <ChevronRight className="size-4" />
        </Button>

        <AppPresentationsPresentNavDivider />

        <AppPresentationsPresentFullscreenToggle />
        <AppPresentationsPresentThemeToggle />
      </div>
    </div>
  );
}
