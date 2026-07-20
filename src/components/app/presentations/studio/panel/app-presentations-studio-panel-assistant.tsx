"use client";

import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";

// Estrutura mínima mockada (não implementado ainda) — pra visualizar o
// encaixe da feature já prevista desde a spec original do editor (Ciclo 3,
// "Chat de Edição") e discutir se abre novas ideias, não pra funcionar de
// verdade. Exemplo estático, não é uma conversa real.
export function AppPresentationsStudioPanelAssistant() {
  const t = useTranslations("app.studio.panel.assistant");

  return (
    <div className="app-presentations-studio-panel-assistant flex h-full flex-col justify-between p-3">
      <div className="app-presentations-studio-panel-assistant-messages flex flex-col gap-2 text-xs">
        <div className="app-presentations-studio-panel-assistant-message-user ml-auto max-w-[85%] rounded-lg rounded-tr-sm bg-primary/10 px-3 py-2">
          {t("exampleUserMessage")}
        </div>
        <div className="app-presentations-studio-panel-assistant-message-agent mr-auto max-w-[85%] rounded-lg rounded-tl-sm bg-muted px-3 py-2 text-muted-foreground">
          {t("exampleAgentMessage")}
        </div>
      </div>
      <div className="app-presentations-studio-panel-assistant-input-group flex flex-col gap-1.5">
        <div className="app-presentations-studio-panel-assistant-input flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-2 text-xs text-muted-foreground/70">
          {t("inputPlaceholder")}
        </div>
        <Badge variant="outline" className="app-presentations-studio-panel-assistant-soon w-fit text-[10px]">
          {t("comingSoon")}
        </Badge>
      </div>
    </div>
  );
}
