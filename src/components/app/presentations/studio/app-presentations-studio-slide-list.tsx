"use client";

import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";

import { AppPresentationsStudioSlideListHeader } from "@/components/app/presentations/studio/app-presentations-studio-slide-list-header";
import { AppPresentationsStudioSlideListItem } from "@/components/app/presentations/studio/app-presentations-studio-slide-list-item";
import { Button } from "@/components/ui/button";
import { useAppPresentationsStudio } from "@/providers/app/app-presentations-studio-provider";

export function AppPresentationsStudioSlideList() {
  const t = useTranslations("app.studio.slideList");
  const { slides, activeSlideId, onSelectSlide, onAddSlide, onDuplicateSlide, onDeleteSlide } =
    useAppPresentationsStudio();

  return (
    <aside className="app-presentations-studio-slide-list flex h-[calc(100vh-5.5rem)]! w-56 shrink-0 flex-col rounded-xl border bg-background">
      <AppPresentationsStudioSlideListHeader />
      <div className="app-presentations-studio-slide-list-items flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-3">
        {slides.map((slide) => (
          <AppPresentationsStudioSlideListItem
            key={slide.id}
            order={slide.order}
            title={slide.title}
            thumbnail={slide.thumbnail}
            selected={slide.id === activeSlideId}
            onSelect={() => onSelectSlide(slide.id)}
            onDuplicate={() => onDuplicateSlide(slide.id)}
            onDelete={() => onDeleteSlide(slide.id)}
          />
        ))}
        <Button
          variant="outline"
          onClick={onAddSlide}
          className="app-presentations-studio-slide-list-add w-full gap-1.5 border-dashed text-muted-foreground hover:text-foreground"
        >
          <Plus className="size-4" />
          {t("add")}
        </Button>
      </div>
    </aside>
  );
}
