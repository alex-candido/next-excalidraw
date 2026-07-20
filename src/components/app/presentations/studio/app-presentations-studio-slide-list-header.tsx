"use client";

import { LayoutGrid, List as ListIcon, Loader2, Plus } from "lucide-react";
import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  useAppPresentationsStudio,
  useStudioActions,
  useStudioIsWaitingSlides,
  useStudioSlides,
} from "@/providers/app/app-presentations-studio-provider";
import type { AppPresentationsStudioSlideListViewMode } from "@/components/app/presentations/studio/app-presentations-studio-slide-list-item";

interface AppPresentationsStudioSlideListHeaderProps {
  viewMode: AppPresentationsStudioSlideListViewMode;
  onViewModeChange: (mode: AppPresentationsStudioSlideListViewMode) => void;
}

// Sem título/edição da apresentação aqui — vira redundante, isso já está no
// header principal (ver app-presentations-studio-header.tsx). Este título é
// do próprio componente ("Slides · N").
export function AppPresentationsStudioSlideListHeader({
  viewMode,
  onViewModeChange,
}: AppPresentationsStudioSlideListHeaderProps) {
  const t = useTranslations("app.studio.slideList");
  const { expectedSlideCount } = useAppPresentationsStudio();
  const isGenerating = useStudioIsWaitingSlides();
  const slideCount = useStudioSlides().length;
  const { onAddSlide } = useStudioActions();

  return (
    <div className="app-presentations-studio-slide-list-header flex flex-col gap-1.5 border-b p-2.5">
      <div className="app-presentations-studio-slide-list-header-title-row flex items-center justify-between gap-1.5">
        <span className="app-presentations-studio-slide-list-header-title text-xs font-medium text-muted-foreground">
          {t("title", { count: slideCount })}
        </span>

        <div className="app-presentations-studio-slide-list-header-actions flex items-center gap-0.5">
          <div className="app-presentations-studio-slide-list-view-toggle flex rounded-md border p-0.5">
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon-xs"
              aria-label={t("viewList")}
              onClick={() => onViewModeChange("list")}
              className="app-presentations-studio-slide-list-view-list size-6"
            >
              <ListIcon className="size-3.5" />
            </Button>
            <Button
              variant={viewMode === "card" ? "secondary" : "ghost"}
              size="icon-xs"
              aria-label={t("viewCard")}
              onClick={() => onViewModeChange("card")}
              className="app-presentations-studio-slide-list-view-card size-6"
            >
              <LayoutGrid className="size-3.5" />
            </Button>
          </div>

          <Button
            variant="outline"
            size="icon-xs"
            onClick={onAddSlide}
            disabled={isGenerating}
            aria-label={t("add")}
            className="app-presentations-studio-slide-list-add size-6"
          >
            <Plus className="size-3.5" />
          </Button>
        </div>
      </div>

      {isGenerating && expectedSlideCount > 0 && (
        <Badge
          variant="outline"
          className="app-presentations-studio-slide-list-header-generating h-4.5 w-fit gap-1 rounded-full px-1.5 text-[10px] text-muted-foreground"
        >
          <Loader2 className="size-2.5 animate-spin" />
          {t("generating", { loaded: slideCount, expected: expectedSlideCount })}
        </Badge>
      )}
    </div>
  );
}
