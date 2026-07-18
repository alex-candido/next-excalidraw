"use client";

import { Copy, Link, MoreHorizontal, Pencil, RotateCcw, Share2, Star, Trash2, X } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

import { AppPresentationTrashModal } from "@/components/app/presentations/app-presentation-trash-modal";
import { AppPresentationDeletePermanentlyModal } from "@/components/app/presentations/app-presentation-delete-permanently-modal";
import { AppPresentationRenameModal } from "@/components/app/presentations/app-presentation-rename-modal";

export type PresentationActionKey =
  | "share"
  | "rename"
  | "favorite"
  | "duplicate"
  | "copyLink"
  | "trash"
  | "restore"
  | "deletePermanently";

export const DEFAULT_PRESENTATION_ACTIONS: PresentationActionKey[] = [
  "share",
  "rename",
  "favorite",
  "duplicate",
  "copyLink",
  "trash",
];

export const TRASH_VIEW_ACTIONS: PresentationActionKey[] = [
  "restore",
  "deletePermanently",
];

const MAIN_ACTIONS: PresentationActionKey[] = [
  "share",
  "rename",
  "favorite",
  "duplicate",
  "copyLink",
  "restore",
];

const DESTRUCTIVE_ACTIONS: PresentationActionKey[] = ["trash", "deletePermanently"];

const ACTION_ICON: Record<PresentationActionKey, React.ElementType> = {
  share: Share2,
  rename: Pencil,
  favorite: Star,
  duplicate: Copy,
  copyLink: Link,
  trash: Trash2,
  restore: RotateCcw,
  deletePermanently: X,
};

interface AppPresentationCardActionsProps {
  title: string;
  createdAtLabel: string;
  createdBy: string;
  actions?: PresentationActionKey[];
  isFavorited?: boolean;
  onTrashConfirm?: () => void;
  onRenameConfirm?: (title: string) => void;
  onDuplicate?: () => void;
  onRestore?: () => void;
  onDeletePermanentlyConfirm?: () => void;
  onToggleFavorite?: () => void;
  className?: string;
}

export function AppPresentationCardActions({
  title,
  createdAtLabel,
  createdBy,
  actions = DEFAULT_PRESENTATION_ACTIONS,
  isFavorited = false,
  onTrashConfirm,
  onRenameConfirm,
  onDuplicate,
  onRestore,
  onDeletePermanentlyConfirm,
  onToggleFavorite,
  className,
}: AppPresentationCardActionsProps) {
  const t = useTranslations("app.presentations.card");
  const [trashModalOpen, setTrashModalOpen] = useState(false);
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [deletePermanentlyModalOpen, setDeletePermanentlyModalOpen] = useState(false);

  const mainActions = MAIN_ACTIONS.filter((k) => actions.includes(k));
  const destructiveActions = DESTRUCTIVE_ACTIONS.filter((k) => actions.includes(k));

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(
            "app-presentation-card-actions-trigger flex size-7 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm transition-opacity hover:opacity-80",
            className,
          )}
          onClick={(e) => e.stopPropagation()}
          aria-label={t("actions.menu")}
        >
          <MoreHorizontal className="size-3.5" />
        </DropdownMenuTrigger>

        <DropdownMenuContent
          className="app-presentation-card-actions-content w-56"
          align="end"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="app-presentation-card-actions-header flex flex-col gap-0.5 px-2 py-1.5">
            <span className="app-presentation-card-actions-header-title truncate text-sm font-medium text-foreground">
              {title}
            </span>
            <span className="app-presentation-card-actions-header-meta text-xs text-muted-foreground">
              {t("meta.created", { date: createdAtLabel, author: createdBy })}
            </span>
          </div>

          <DropdownMenuSeparator />

          {mainActions.length > 0 && (
            <DropdownMenuGroup>
              {mainActions.map((key) => {
                const Icon = ACTION_ICON[key];
                const isFavoriteKey = key === "favorite";
                return (
                  <DropdownMenuItem
                    key={key}
                    className={`app-presentation-card-actions-${key} gap-2`}
                    onClick={
                      key === "rename" ? () => setRenameModalOpen(true) :
                      key === "duplicate" ? onDuplicate :
                      key === "restore" ? onRestore :
                      key === "favorite" ? onToggleFavorite :
                      undefined
                    }
                  >
                    <Icon
                      className={cn(
                        "size-4",
                        isFavoriteKey && isFavorited && "fill-yellow-500 text-yellow-500",
                      )}
                    />
                    {isFavoriteKey
                      ? t(isFavorited ? "actions.unfavorite" : "actions.favorite")
                      : t(`actions.${key}`)}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuGroup>
          )}

          {destructiveActions.length > 0 && (
            <>
              {mainActions.length > 0 && <DropdownMenuSeparator />}
              {destructiveActions.map((key) => {
                const Icon = ACTION_ICON[key];
                return (
                  <DropdownMenuItem
                    key={key}
                    className={`app-presentation-card-actions-${key} gap-2 text-destructive focus:text-destructive`}
                    onClick={
                      key === "trash" ? () => setTrashModalOpen(true) :
                      key === "deletePermanently" ? () => setDeletePermanentlyModalOpen(true) :
                      undefined
                    }
                  >
                    <Icon className="size-4" />
                    {t(`actions.${key}`)}
                  </DropdownMenuItem>
                );
              })}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {actions.includes("trash") && (
        <AppPresentationTrashModal
          open={trashModalOpen}
          onOpenChange={setTrashModalOpen}
          title={title}
          onConfirm={onTrashConfirm}
        />
      )}

      {actions.includes("rename") && (
        <AppPresentationRenameModal
          open={renameModalOpen}
          onOpenChange={setRenameModalOpen}
          title={title}
          onConfirm={onRenameConfirm}
        />
      )}

      {actions.includes("deletePermanently") && (
        <AppPresentationDeletePermanentlyModal
          open={deletePermanentlyModalOpen}
          onOpenChange={setDeletePermanentlyModalOpen}
          title={title}
          onConfirm={onDeletePermanentlyConfirm}
        />
      )}
    </>
  );
}
