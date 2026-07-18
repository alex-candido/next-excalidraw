"use client";

import { RotateCcw, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AppPresentationsTrashToolbarProps {
  onRestoreAll?: () => void;
  onEmptyTrash?: () => void;
  className?: string;
}

export function AppPresentationsTrashToolbar({
  onRestoreAll,
  onEmptyTrash,
  className,
}: AppPresentationsTrashToolbarProps) {
  const t = useTranslations("app.presentations.trash.toolbar");

  return (
    <div
      className={cn(
        "app-presentations-trash-toolbar flex items-center gap-2",
        className,
      )}
    >
      <Button
        variant="outline"
        size="sm"
        className="app-presentations-trash-toolbar-restore gap-1.5 text-xs"
        onClick={onRestoreAll}
      >
        <RotateCcw className="size-3.5" />
        {t("restoreAll")}
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="app-presentations-trash-toolbar-empty gap-1.5 text-xs text-destructive hover:text-destructive"
        onClick={onEmptyTrash}
      >
        <Trash2 className="size-3.5" />
        {t("empty")}
      </Button>
    </div>
  );
}
