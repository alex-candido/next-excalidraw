"use client";

import { XIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  useStudioActions,
  useStudioActivePanel,
  type StudioPanelKey,
} from "@/providers/app/app-presentations-studio-provider";

import { AppPresentationsStudioPanelAssistant } from "@/components/app/presentations/studio/panel/app-presentations-studio-panel-assistant";
import { AppPresentationsStudioPanelHistory } from "@/components/app/presentations/studio/panel/app-presentations-studio-panel-history";
import { AppPresentationsStudioPanelSettings } from "@/components/app/presentations/studio/panel/app-presentations-studio-panel-settings";
import { AppPresentationsStudioPanelSource } from "@/components/app/presentations/studio/panel/app-presentations-studio-panel-source";
import { AppPresentationsStudioPanelTemplates } from "@/components/app/presentations/studio/panel/app-presentations-studio-panel-templates";

function AppPresentationsStudioPanelHeader({
  title,
  onClose,
}: {
  title: string;
  onClose: () => void;
}) {
  const t = useTranslations("app.studio.panel");

  return (
    <div className="app-presentations-studio-panel-header flex items-center justify-between gap-2 border-b p-2.5">
      <span className="app-presentations-studio-panel-header-title text-sm font-medium">
        {title}
      </span>
      <Button variant="ghost" size="icon-xs" onClick={onClose} aria-label={t("close")}>
        <XIcon className="size-3.5" />
      </Button>
    </div>
  );
}

function AppPresentationsStudioPanelBody({ activePanel }: { activePanel: StudioPanelKey }) {
  return (
    <div className="app-presentations-studio-panel-content flex min-h-0 flex-1 flex-col overflow-y-auto">
      {activePanel === "settings" && <AppPresentationsStudioPanelSettings />}
      {activePanel === "templates" && <AppPresentationsStudioPanelTemplates />}
      {activePanel === "assistant" && <AppPresentationsStudioPanelAssistant />}
      {activePanel === "source" && <AppPresentationsStudioPanelSource />}
      {activePanel === "history" && <AppPresentationsStudioPanelHistory />}
    </div>
  );
}

// Sem rail permanente (decisão 2026-07-19) — o painel só existe quando
// acionado (pelo menu "..." do header, ver app-presentations-studio-header.tsx),
// e no desktop flutua por cima do canvas (absolute, dentro do wrapper
// `relative` de app-presentations-studio-canvas.tsx) em vez de reservar uma
// coluna fixa — evita espremer o canvas quando o painel nem está aberto. No
// mobile continua sendo um Sheet de tela cheia, mesmo padrão de antes.
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
    <div className="app-presentations-studio-panel absolute right-4 top-4 z-20 flex max-h-[calc(100%-2rem)] w-80 flex-col overflow-hidden rounded-2xl border bg-card shadow-xl">
      <AppPresentationsStudioPanelHeader title={title} onClose={onClosePanel} />
      <AppPresentationsStudioPanelBody activePanel={activePanel} />
    </div>
  );
}
