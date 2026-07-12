"use client";

import { Maximize, Minimize } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { useAppPresentationsPresent } from "@/providers/app/app-presentations-present-provider";

export function AppPresentationsPresentFullscreenToggle() {
  const t = useTranslations("app.present.actions");
  const { isFullscreen, onToggleFullscreen } = useAppPresentationsPresent();

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={onToggleFullscreen}
      aria-label={isFullscreen ? t("fullscreenExit") : t("fullscreenEnter")}
      className="app-presentations-present-fullscreen-toggle rounded-full"
    >
      {isFullscreen ? <Minimize className="size-3.5" /> : <Maximize className="size-3.5" />}
    </Button>
  );
}
