"use client";

import { Copy, Link, MoreHorizontal, Pencil, Share2, Star, Trash2 } from "lucide-react";
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

export type PresentationActionKey =
  | "share"
  | "rename"
  | "favorite"
  | "duplicate"
  | "copyLink"
  | "trash";

export const DEFAULT_PRESENTATION_ACTIONS: PresentationActionKey[] = [
  "share",
  "rename",
  "favorite",
  "duplicate",
  "copyLink",
  "trash",
];

const MAIN_ACTIONS: PresentationActionKey[] = [
  "share",
  "rename",
  "favorite",
  "duplicate",
  "copyLink",
];

const DESTRUCTIVE_ACTIONS: PresentationActionKey[] = ["trash"];

const ACTION_ICON: Record<PresentationActionKey, React.ElementType> = {
  share: Share2,
  rename: Pencil,
  favorite: Star,
  duplicate: Copy,
  copyLink: Link,
  trash: Trash2,
};

interface AppPresentationCardActionsProps {
  title: string;
  createdAtLabel: string;
  createdBy: string;
  actions?: PresentationActionKey[];
  className?: string;
}

export function AppPresentationCardActions({
  title,
  createdAtLabel,
  createdBy,
  actions = DEFAULT_PRESENTATION_ACTIONS,
  className,
}: AppPresentationCardActionsProps) {
  const t = useTranslations("app.presentations.card");

  const mainActions = MAIN_ACTIONS.filter((k) => actions.includes(k));
  const destructiveActions = DESTRUCTIVE_ACTIONS.filter((k) =>
    actions.includes(k),
  );

  return (
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
              return (
                <DropdownMenuItem
                  key={key}
                  className={`app-presentation-card-actions-${key} gap-2`}
                >
                  <Icon className="size-4" />
                  {t(`actions.${key}`)}
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
  );
}
