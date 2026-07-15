"use client";

import { ArrowRight, Clock, Plus } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Muted } from "@/components/ui/typography";
import { Link } from "@/i18n/navigation";

import { AppStartNewModal } from "@/components/app/start/app-start-new-modal";

export function AppStartRecentsHeader() {
  const t = useTranslations("app.start.recents");
  const tNew = useTranslations("app.new");
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className="app-start-recents-header flex items-start justify-between gap-4">
        <div className="app-start-recents-header-text flex items-start gap-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-md border bg-muted">
            <Clock className="size-3.5 text-muted-foreground" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="app-start-recents-title text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t("title")}
            </span>
            <Muted className="app-start-recents-description text-sm">
              {t("description")}
            </Muted>
          </div>
        </div>
        <div className="app-start-recents-header-actions flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            className="shrink-0 gap-1.5 text-xs"
            onClick={() => setModalOpen(true)}
          >
            <Plus className="size-3.5" />
            <span className="hidden sm:inline">{tNew("trigger")}</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="shrink-0 gap-1.5 text-xs"
            render={<Link href="/app/presentations" />}
            nativeButton={false}
          >
            <ArrowRight className="size-3.5" />
            <span className="hidden sm:inline">{t("viewAll")}</span>
          </Button>
        </div>
      </div>

      <AppStartNewModal open={modalOpen} onOpenChange={setModalOpen} />
    </>
  );
}
