"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { AppDashboardNewModal } from "@/components/app/dashboard/app-dashboard-new-modal";
import { AppPresentationsSearch } from "@/components/app/app-presentations-search";

export function AppPresentationsHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const t = useTranslations("app.presentations.header");
  const tNew = useTranslations("app.new");
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div
        className={cn(
          "app-presentations-header flex items-center justify-between gap-4",
          className,
        )}
        {...props}
      >
        <span className="app-presentations-header-title text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {t("title")}
        </span>
        <div className="app-presentations-header-actions flex items-center gap-1.5">
          <AppPresentationsSearch />
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
      </div>

      <AppDashboardNewModal open={modalOpen} onOpenChange={setModalOpen} />
    </>
  );
}
