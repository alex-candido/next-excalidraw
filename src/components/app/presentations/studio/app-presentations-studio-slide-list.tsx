"use client";

import {
  closestCenter,
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  horizontalListSortingStrategy,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";

import { AppPresentationsStudioSlideListHeader } from "@/components/app/presentations/studio/app-presentations-studio-slide-list-header";
import { AppPresentationsStudioSlideListItem } from "@/components/app/presentations/studio/app-presentations-studio-slide-list-item";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useStudioActions, useStudioActiveSlideId, useStudioSlides } from "@/providers/app/app-presentations-studio-provider";

function useSlideListState() {
  const slides = useStudioSlides();
  const activeSlideId = useStudioActiveSlideId();
  const {
    onSelectSlide,
    onAddSlide,
    onReorderSlides,
    onDuplicateSlide,
    onToggleHiddenSlide,
    onDeleteSlide,
  } = useStudioActions();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
  );
  const slideIds = slides.map((slide) => slide.id);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      onReorderSlides(String(active.id), String(over.id));
    }
  };

  return {
    slides,
    activeSlideId,
    slideIds,
    sensors,
    handleDragEnd,
    onSelectSlide,
    onAddSlide,
    onDuplicateSlide,
    onToggleHiddenSlide,
    onDeleteSlide,
  };
}

/** Desktop — aside vertical, sempre antes do Canvas no DOM (a partir de md) */
export function AppPresentationsStudioSlideList() {
  const t = useTranslations("app.studio.slideList");
  const {
    slides,
    activeSlideId,
    slideIds,
    sensors,
    handleDragEnd,
    onSelectSlide,
    onAddSlide,
    onDuplicateSlide,
    onToggleHiddenSlide,
    onDeleteSlide,
  } = useSlideListState();

  return (
    <aside className="app-presentations-studio-slide-list hidden h-[calc(100vh-5.5rem)]! w-56 shrink-0 flex-col rounded-xl border bg-background md:flex">
      <AppPresentationsStudioSlideListHeader />
      <ScrollArea className="app-presentations-studio-slide-list-items min-h-0 flex-1">
        <div className="flex flex-col gap-2 p-3">
          <DndContext
            id="app-presentations-studio-slide-list"
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={slideIds} strategy={verticalListSortingStrategy}>
              {slides.map((slide) => (
                <AppPresentationsStudioSlideListItem
                  key={slide.id}
                  id={slide.id}
                  order={slide.order}
                  title={slide.title}
                  thumbnail={slide.thumbnail}
                  isHidden={slide.isHidden}
                  selected={slide.id === activeSlideId}
                  onSelect={() => onSelectSlide(slide.id)}
                  onDuplicate={() => onDuplicateSlide(slide.id)}
                  onToggleHidden={() => onToggleHiddenSlide(slide.id)}
                  onDelete={() => onDeleteSlide(slide.id)}
                />
              ))}
            </SortableContext>
          </DndContext>
          <Button
            variant="outline"
            onClick={onAddSlide}
            className="app-presentations-studio-slide-list-add w-full gap-1.5 border-dashed text-muted-foreground hover:text-foreground"
          >
            <Plus className="size-4" />
            {t("add")}
          </Button>
        </div>
      </ScrollArea>
    </aside>
  );
}

/** Mobile — faixa horizontal no fluxo normal, sempre depois do Canvas no DOM (abaixo de md) */
export function AppPresentationsStudioSlideListMobile() {
  const t = useTranslations("app.studio.slideList");
  const {
    slides,
    activeSlideId,
    slideIds,
    sensors,
    handleDragEnd,
    onSelectSlide,
    onAddSlide,
    onDuplicateSlide,
    onToggleHiddenSlide,
    onDeleteSlide,
  } = useSlideListState();

  return (
    <div className="app-presentations-studio-slide-list-mobile flex shrink-0 items-center gap-2 overflow-x-auto rounded-xl border bg-background p-2 md:hidden">
      <DndContext
        id="app-presentations-studio-slide-list-mobile"
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={slideIds} strategy={horizontalListSortingStrategy}>
          {slides.map((slide) => (
            <div key={slide.id} className="w-32 shrink-0">
              <AppPresentationsStudioSlideListItem
                id={slide.id}
                order={slide.order}
                title={slide.title}
                thumbnail={slide.thumbnail}
                isHidden={slide.isHidden}
                selected={slide.id === activeSlideId}
                onSelect={() => onSelectSlide(slide.id)}
                onDuplicate={() => onDuplicateSlide(slide.id)}
                onToggleHidden={() => onToggleHiddenSlide(slide.id)}
                onDelete={() => onDeleteSlide(slide.id)}
              />
            </div>
          ))}
        </SortableContext>
      </DndContext>
      <Button
        variant="outline"
        size="icon"
        onClick={onAddSlide}
        aria-label={t("add")}
        className="app-presentations-studio-slide-list-add-mobile w-16 shrink-0 border-dashed text-muted-foreground hover:text-foreground"
      >
        <Plus className="size-4" />
      </Button>
    </div>
  );
}
