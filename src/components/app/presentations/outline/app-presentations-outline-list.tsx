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

import { Button } from "@/components/ui/button";
import { OutlineType } from "@/lib/drizzle/schema/outline";

import {
  AppPresentationsOutlineCard,
  type AppPresentationsOutlineCardItem,
} from "@/components/app/presentations/outline/app-presentations-outline-card";

interface AppPresentationsOutlineListProps {
  outlines: AppPresentationsOutlineCardItem[];
  onTitleChange: (id: string, value: string) => void;
  onDescriptionChange: (id: string, value: string) => void;
  onRepresentationChange: (id: string, value: number) => void;
  onReorder: (activeId: string, overId: string) => void;
  onRegenerate: (id: string) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
  regeneratingId?: string | null;
}

export function AppPresentationsOutlineList({
  outlines,
  onTitleChange,
  onDescriptionChange,
  onRepresentationChange,
  onReorder,
  onRegenerate,
  onDelete,
  onAdd,
  regeneratingId = null,
}: AppPresentationsOutlineListProps) {
  const t = useTranslations("app.outline.list");
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

  return (
    <div className="app-presentations-outline-list flex flex-col gap-4">
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
          <div className="app-presentations-outline-list-items flex flex-col gap-4">
            {outlines.map((item) => (
              <AppPresentationsOutlineCard
                key={item.id}
                item={item}
                onTitleChange={onTitleChange}
                onDescriptionChange={onDescriptionChange}
                onRepresentationChange={onRepresentationChange}
                onRegenerate={onRegenerate}
                onDelete={onDelete}
                isRegenerating={regeneratingId === item.id}
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
