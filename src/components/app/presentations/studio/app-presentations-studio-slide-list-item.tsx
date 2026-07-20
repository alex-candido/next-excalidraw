"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Copy, Eye, EyeOff, GripVertical, Info, Link as LinkIcon, MoreHorizontal, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { OutlineType } from "@/lib/drizzle/schema/outline";
import { cn, resolveThumbnailSrc } from "@/lib/utils";
import {
  useStudioCanDelete,
  useStudioIsWaitingSlides,
  useStudioSlidePreviewElements,
} from "@/providers/app/app-presentations-studio-provider";

import { FAMILY_STYLE, REPRESENTATION_META, TYPE_CONFIG } from "@/components/app/presentations/outline/app-presentations-outline-card";
import { AppPresentationsStudioSlidePreview } from "@/components/app/presentations/studio/app-presentations-studio-slide-preview";

export type AppPresentationsStudioSlideListViewMode = "card" | "list";

interface AppPresentationsStudioSlideListItemProps {
  id: string;
  order: number;
  title: string;
  thumbnail?: string;
  isHidden?: boolean;
  outlineType?: number;
  representation?: number;
  viewMode?: AppPresentationsStudioSlideListViewMode;
  selected: boolean;
  onSelect: () => void;
  onDuplicate: () => void;
  onToggleHidden: () => void;
  onDelete: () => void;
}

export function AppPresentationsStudioSlideListItem({
  id,
  order,
  title,
  thumbnail,
  isHidden = false,
  outlineType,
  representation,
  viewMode = "card",
  selected,
  onSelect,
  onDuplicate,
  onToggleHidden,
  onDelete,
}: AppPresentationsStudioSlideListItemProps) {
  const t = useTranslations("app.studio.slideList.item");
  const previewElements = useStudioSlidePreviewElements(id);
  // Regra é sempre a mesma pra todo mundo (mínimo de slides), não mais por
  // posição — cover/closing arrastam livre igual qualquer outro (ver
  // app-studio-store.ts:onReorderSlides/onDeleteSlide).
  const canDelete = useStudioCanDelete();
  // Enquanto a IA ainda está gerando slides (hydrate() incremental rodando),
  // mexer na lista manualmente (arrastar/duplicar/excluir) conflita de
  // posição com o que ainda está chegando — trava tudo até terminar.
  const isGenerating = useStudioIsWaitingSlides();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, disabled: isGenerating });

  const typeConfig = TYPE_CONFIG[outlineType as keyof typeof TYPE_CONFIG];
  const meta = representation !== undefined ? REPRESENTATION_META[representation] : undefined;
  const familyStyle = meta ? FAMILY_STYLE[meta.family] : undefined;
  const isContent = outlineType === undefined || outlineType === OutlineType.content;

  const thumbnailContent = previewElements.length > 0 ? (
    <AppPresentationsStudioSlidePreview elements={previewElements} />
  ) : thumbnail ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={resolveThumbnailSrc(thumbnail)}
      alt={title}
      className="app-presentations-studio-slide-list-item-thumbnail-image size-full object-cover"
    />
  ) : null;

  const menu = (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={t("actions.menu")}
        className="app-presentations-studio-slide-list-item-actions flex size-5 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:text-foreground"
      >
        <MoreHorizontal className="size-3.5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <div className="app-presentations-studio-slide-list-item-actions-header flex flex-col gap-0.5 px-2 py-1.5">
          <span className="app-presentations-studio-slide-list-item-actions-header-title truncate text-sm font-medium text-foreground">
            {title}
          </span>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onDuplicate} disabled={isGenerating} className="app-presentations-studio-slide-list-item-duplicate gap-2">
          <Copy className="size-4" />
          {t("actions.duplicate")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onToggleHidden} className="app-presentations-studio-slide-list-item-toggle-hidden gap-2">
          {isHidden ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
          {isHidden ? t("actions.show") : t("actions.hide")}
        </DropdownMenuItem>
        <DropdownMenuItem className="app-presentations-studio-slide-list-item-copy-link gap-2">
          <LinkIcon className="size-4" />
          {t("actions.copyLink")}
        </DropdownMenuItem>
        <DropdownMenuItem className="app-presentations-studio-slide-list-item-outline-details gap-2">
          <Info className="size-4" />
          {t("actions.outlineDetails")}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={onDelete}
          disabled={!canDelete || isGenerating}
          className="app-presentations-studio-slide-list-item-delete gap-2 text-destructive focus:text-destructive"
        >
          <Trash2 className="size-4" />
          {t("actions.delete")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const dragHandle = (
    <button
      type="button"
      {...attributes}
      {...listeners}
      aria-label={t("dragHandle")}
      className="app-presentations-studio-slide-list-item-drag-handle flex size-5 shrink-0 cursor-grab touch-none items-center justify-center text-muted-foreground/40 hover:text-muted-foreground active:cursor-grabbing"
    >
      <GripVertical className={cn(viewMode === "list" ? "size-3" : "size-3.5")} />
    </button>
  );

  if (viewMode === "list") {
    return (
      <div
        ref={setNodeRef}
        style={{ transform: CSS.Transform.toString(transform), transition }}
        className={cn(
          "app-presentations-studio-slide-list-item relative flex items-center gap-2 rounded-lg border border-l-4 bg-card py-1.5 pl-1.5 pr-2 ring-1 ring-foreground/10 transition-all hover:ring-foreground/20",
          typeConfig?.border,
          selected && "border-primary! ring-2 ring-primary",
          isHidden && "opacity-50",
          isDragging && "z-10 opacity-70 shadow-lg",
        )}
      >
        {dragHandle}
        <button type="button" onClick={onSelect} className="app-presentations-studio-slide-list-item-content min-w-0 flex-1 text-left">
          <span className="block truncate text-xs font-medium">{title}</span>
        </button>
        <Badge variant="secondary" className="app-presentations-studio-slide-list-item-order shrink-0">
          {order + 1}
        </Badge>
        {isHidden && (
          <EyeOff role="img" aria-label={t("hiddenBadge")} className="app-presentations-studio-slide-list-item-hidden-icon size-3.5 shrink-0 text-muted-foreground" />
        )}
        {menu}
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "app-presentations-studio-slide-list-item relative flex gap-1.5 rounded-xl border border-l-4 bg-card p-2 ring-1 ring-foreground/10 transition-all hover:ring-foreground/20",
        typeConfig?.border,
        selected && "border-primary! ring-2 ring-primary",
        isHidden && "opacity-50",
        isDragging && "z-10 opacity-70 shadow-lg",
      )}
    >
      {dragHandle}

      <div className="app-presentations-studio-slide-list-item-content relative min-w-0 flex-1">
        <button
          type="button"
          role="radio"
          aria-checked={selected}
          aria-label={title}
          onClick={onSelect}
          className="app-presentations-studio-slide-list-item-thumbnail relative z-0 aspect-video w-full overflow-hidden rounded-md border bg-muted"
        >
          {thumbnailContent}
          <Badge
            variant="secondary"
            className="app-presentations-studio-slide-list-item-order absolute left-1.5 top-1.5"
          >
            {order + 1}
          </Badge>
          {/* Ícone de representação — mesmo vocabulário visual do Outline
              (ver app-presentations-outline-card.tsx), só pra content (capa/
              encerramento não têm representação de diagrama). */}
          {isContent && meta && familyStyle && (
            <span className={cn("app-presentations-studio-slide-list-item-representation absolute bottom-1.5 left-1.5 flex size-5 items-center justify-center rounded-full ring-1 backdrop-blur-sm", familyStyle.bg, familyStyle.ring)}>
              <meta.icon className={cn("size-3", familyStyle.icon)} />
            </span>
          )}
          {isHidden && (
            <span
              role="img"
              aria-label={t("hiddenBadge")}
              className="app-presentations-studio-slide-list-item-hidden-icon absolute bottom-1.5 right-1.5 flex size-5 items-center justify-center rounded-full bg-background/80 text-muted-foreground backdrop-blur-sm"
            >
              <EyeOff className="size-3" />
            </span>
          )}
        </button>

        <div className="absolute right-1.5 top-1.5 z-10 flex size-5 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm">
          {menu}
        </div>
      </div>
    </div>
  );
}
