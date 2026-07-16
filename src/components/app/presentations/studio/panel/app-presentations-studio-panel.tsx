"use client";

import { XIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { useStudioActions, useStudioActivePanel } from "@/providers/app/app-presentations-studio-provider";

import { AppPresentationsStudioPanelHistory } from "@/components/app/presentations/studio/panel/app-presentations-studio-panel-history";
import { AppPresentationsStudioPanelSettings } from "@/components/app/presentations/studio/panel/app-presentations-studio-panel-settings";
import { AppPresentationsStudioPanelSource } from "@/components/app/presentations/studio/panel/app-presentations-studio-panel-source";

function AppPresentationsStudioPanelHeader({
  title,
  onClose,
}: {
  title: string;
  onClose: () => void;
}) {
  const t = useTranslations("app.studio.panel");

  return (
    <div className="app-presentations-studio-panel-header flex items-center justify-between gap-2 border-b p-3">
      <span className="app-presentations-studio-panel-header-title text-sm font-medium">
        {title}
      </span>
      <Button variant="ghost" size="icon-xs" onClick={onClose} aria-label={t("close")}>
        <XIcon className="size-3.5" />
      </Button>
    </div>
  );
}

function AppPresentationsStudioPanelBody({ activePanel }: { activePanel: "settings" | "source" | "history" }) {
  return (
    <div className="app-presentations-studio-panel-content flex min-h-0 flex-1 flex-col overflow-y-auto">
      {activePanel === "settings" && <AppPresentationsStudioPanelSettings />}
      {activePanel === "source" && <AppPresentationsStudioPanelSource />}
      {activePanel === "history" && <AppPresentationsStudioPanelHistory />}
    </div>
  );
}

export function AppPresentationsStudioPanel() {
  const t = useTranslations("app.studio.panel");
  const activePanel = useStudioActivePanel();
  const { onClosePanel } = useStudioActions();
  const isMobile = useIsMobile();

  if (!activePanel) return null;

  const title = t(`titles.${activePanel}`);

  if (isMobile) {
    return (
      <Sheet open onOpenChange={(open) => !open && onClosePanel()}>
        <SheetContent
          side="right"
          showCloseButton={false}
          className="app-presentations-studio-panel-mobile flex w-full flex-col gap-0 p-0 sm:max-w-sm"
        >
          <AppPresentationsStudioPanelHeader title={title} onClose={onClosePanel} />
          <AppPresentationsStudioPanelBody activePanel={activePanel} />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <aside className="app-presentations-studio-panel hidden h-[calc(100vh-5.5rem)]! w-80 shrink-0 flex-col rounded-xl border bg-background md:flex">
      <AppPresentationsStudioPanelHeader title={title} onClose={onClosePanel} />
      <AppPresentationsStudioPanelBody activePanel={activePanel} />
    </aside>
  );
}
