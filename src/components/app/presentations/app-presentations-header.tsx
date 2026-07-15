"use client";

import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link } from "@/i18n/navigation";

import { AppStartNewModal } from "@/components/app/start/app-start-new-modal";
import { AppPresentationsSearch } from "@/components/app/app-presentations-search";
import { useAppPresentationsList } from "@/providers/app/app-presentations-list-provider";

type AppPresentationsHeaderProps = React.HTMLAttributes<HTMLDivElement>;

export function AppPresentationsHeader({
  className,
  ...props
}: AppPresentationsHeaderProps) {
  const t = useTranslations("app.presentations.header");
  const tNew = useTranslations("app.new");
  const [modalOpen, setModalOpen] = useState(false);
  const { trashItems, isTrashView, onTrashToggle } = useAppPresentationsList();
  const trashCount = trashItems.length;

  return (
    <>
      <div
        className={cn(
          "app-presentations-header flex items-center justify-between gap-4",
          className,
        )}
        {...props}
      >
        {isTrashView ? (
          <div className="app-presentations-header-trash-nav flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="app-presentations-header-back -ml-2 gap-1.5 text-xs"
              onClick={onTrashToggle}
            >
              <ArrowLeft className="size-3.5" />
              {t("back")}
            </Button>
            <span className="app-presentations-header-trash-title text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t("trash")}
            </span>
          </div>
        ) : (
          <>
            <div className="app-presentations-header-nav flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                render={<Link href="/app/start" />}
                nativeButton={false}
                className="app-presentations-header-back -ml-2 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="size-3.5" />
                {t("backToDashboard")}
              </Button>
              <span className="app-presentations-header-title text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t("title")}
              </span>
            </div>
            <div className="app-presentations-header-actions flex items-center gap-1.5">
              <AppPresentationsSearch />
              {trashCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="app-presentations-header-trash shrink-0 gap-1.5 text-xs text-muted-foreground"
                  onClick={onTrashToggle}
                >
                  <Trash2 className="size-3.5" />
                  <Badge
                    variant="secondary"
                    className="rounded-full px-1.5 py-0 text-xs"
                  >
                    {trashCount}
                  </Badge>
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                className="app-presentations-header-new shrink-0 gap-1.5 text-xs"
                onClick={() => setModalOpen(true)}
              >
                <Plus className="size-3.5" />
                <span className="hidden sm:inline">{tNew("trigger")}</span>
              </Button>
            </div>
          </>
        )}
      </div>

      {!isTrashView && (
        <AppStartNewModal open={modalOpen} onOpenChange={setModalOpen} />
      )}
    </>
  );
}
