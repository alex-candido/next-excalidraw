"use client";

import {
  closestCenter,
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { OutlineType } from "@/lib/drizzle/schema/outline";
import { cn } from "@/lib/utils";
import { useOutlineActions, useOutlineOutlines } from "@/providers/app/app-presentations-outline-provider";

import {
  AppPresentationsOutlineCard,
  FAMILY_STYLE,
  REPRESENTATION_META,
} from "@/components/app/presentations/outline/app-presentations-outline-card";

export function AppPresentationsOutlineList() {
  const t = useTranslations("app.outline.list");
  const outlines = useOutlineOutlines();
  const { onReorder, onAdd } = useOutlineActions();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
  );

  const counts = outlines.reduce(
    (acc, item) => {
      if (item.type === OutlineType.cover) acc.cover += 1;
      else if (item.type === OutlineType.closing) acc.closing += 1;
      else acc.content += 1;
      return acc;
    },
    { cover: 0, content: 0, closing: 0 },
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      onReorder(String(active.id), String(over.id));
    }
  };

  function handleStoryboardClick(id: string) {
    setExpandedId(id);
    cardRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  return (
    <div className="app-presentations-outline-list flex flex-col gap-4">
      {/* Storyboard — sequência inteira num relance antes do detalhe de cada
          cena (ver mockup aprovado, conversa 2026-07-18). Clicar expande e
          rola até o card correspondente. */}
      {outlines.length > 0 && (
        <div className="app-presentations-outline-storyboard flex flex-col gap-2">
          <span className="text-xs font-medium text-muted-foreground">{t("storyboard")}</span>
          <div className="app-presentations-outline-storyboard-carousel-wrapper relative">
            <Carousel opts={{ align: "start", dragFree: true }}>
              <CarouselContent className="-ml-2 cursor-grab pb-1 active:cursor-grabbing">
                {outlines.map((item) => {
                  const meta = REPRESENTATION_META[item.representation];
                  const style = FAMILY_STYLE[meta.family];
                  const Icon = meta.icon;
                  return (
                    <CarouselItem key={item.id} className="basis-auto pl-2">
                      <button
                        type="button"
                        onClick={() => handleStoryboardClick(item.id)}
                        className={cn(
                          "app-presentations-outline-storyboard-item flex cursor-pointer flex-col items-center gap-1.5 rounded-lg border p-2.5 transition-colors",
                          expandedId === item.id ? "border-foreground/30 bg-muted/40" : "border-transparent hover:bg-muted/30",
                        )}
                      >
                        <div className={cn("flex size-9 items-center justify-center rounded-full ring-1", style.bg, style.ring)}>
                          <Icon className={cn("size-4", style.icon)} />
                        </div>
                        <span className="w-16 truncate text-center text-[0.65rem] text-muted-foreground">
                          {item.title || String(item.order + 1)}
                        </span>
                      </button>
                    </CarouselItem>
                  );
                })}
              </CarouselContent>
            </Carousel>
            <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-background to-transparent" />
          </div>
        </div>
      )}

      <div className="app-presentations-outline-list-summary flex items-center justify-between gap-3 text-xs text-muted-foreground">
        <span>{t("summary", { count: outlines.length })}</span>
        <span>
          {t("breakdown", {
            cover: counts.cover,
            content: counts.content,
            closing: counts.closing,
          })}
        </span>
      </div>

      <DndContext
        id="app-presentations-outline-list"
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={outlines.map((item) => item.id)} strategy={verticalListSortingStrategy}>
          <div className="app-presentations-outline-list-items flex flex-col gap-3">
            {outlines.map((item) => (
              <AppPresentationsOutlineCard
                key={item.id}
                id={item.id}
                isExpanded={expandedId === item.id}
                onToggleExpand={() => setExpandedId(expandedId === item.id ? null : item.id)}
                cardRef={(el) => { cardRefs.current[item.id] = el; }}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <Button
        variant="outline"
        onClick={onAdd}
        className="app-presentations-outline-list-add w-full gap-1.5 border-dashed text-muted-foreground hover:text-foreground"
      >
        <Plus className="size-4" />
        {t("add")}
      </Button>
    </div>
  );
}
