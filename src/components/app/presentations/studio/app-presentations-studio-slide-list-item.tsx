"use client";

import { Copy, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AppPresentationsStudioSlideListItemProps {
  order: number;
  title: string;
  thumbnail?: string;
  selected: boolean;
  onSelect: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export function AppPresentationsStudioSlideListItem({
  order,
  title,
  thumbnail,
  selected,
  onSelect,
  onDuplicate,
  onDelete,
}: AppPresentationsStudioSlideListItemProps) {
  const t = useTranslations("app.studio.slideList.item");

  return (
    <div
      className={cn(
        "app-presentations-studio-slide-list-item relative flex flex-col gap-1.5 rounded-xl border border-transparent bg-card p-2 ring-1 ring-foreground/10 transition-all hover:ring-foreground/20",
        selected && "border-primary ring-2 ring-primary",
      )}
    >
      <button
        type="button"
        role="radio"
        aria-checked={selected}
        aria-label={title}
        onClick={onSelect}
        className="app-presentations-studio-slide-list-item-select absolute inset-0 z-0 rounded-xl"
      />

      <div className="app-presentations-studio-slide-list-item-thumbnail pointer-events-none relative z-10 aspect-video w-full overflow-hidden rounded-md border bg-muted">
        {thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnail}
            alt={title}
            className="app-presentations-studio-slide-list-item-thumbnail-image size-full object-cover"
          />
        ) : null}
        <Badge
          variant="secondary"
          className="app-presentations-studio-slide-list-item-order absolute left-1.5 top-1.5"
        >
          {order + 1}
        </Badge>
      </div>

      <span className="app-presentations-studio-slide-list-item-title pointer-events-none relative z-10 line-clamp-2 text-xs text-muted-foreground">
        {title}
      </span>

      <div className="app-presentations-studio-slide-list-item-actions absolute right-1.5 top-1.5 z-20 flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={onDuplicate}
          aria-label={t("duplicate")}
          className="bg-background/80 backdrop-blur-sm"
        >
          <Copy className="size-3" />
        </Button>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={onDelete}
          aria-label={t("delete")}
          className="bg-background/80 text-muted-foreground backdrop-blur-sm hover:text-destructive"
        >
          <Trash2 className="size-3" />
        </Button>
      </div>
    </div>
  );
}
